import json
import logging
import threading
import pika
import os
import hmac
import hashlib
import requests

from app.config import get_settings
from app.services.raw_extractor import get_raw_extractor
from app.services.extraction_service import get_extraction_service

logger = logging.getLogger(__name__)
settings = get_settings()

class ContentExtractionConsumer(threading.Thread):
    """RabbitMQ consumer for IELTS Content Extraction Tasks (PDF multimodal and raw text paste)"""
    
    def __init__(self):
        super().__init__(daemon=True)
        self.should_stop = False
        self.connection = None
        self.channel = None
        self.queue_name = "content-extraction-queue"
        self.backend_core_url = settings.backend_core_url
        callback_secret = os.getenv("CALLBACK_SECRET")
        if not callback_secret:
            if settings.environment == "production":
                raise ValueError("CALLBACK_SECRET is required in production environment")
            callback_secret = "test-callback-secret-value-for-ci"
        self.callback_secret = callback_secret

    def run(self):
        try:
            params = pika.URLParameters(settings.rabbitmq_url)
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            
            # Assert queue matching NestJS durable definition
            self.channel.queue_declare(
                queue=self.queue_name, 
                durable=True,
                arguments={
                    'x-message-ttl': 600000,
                    'x-dead-letter-exchange': '',
                    'x-dead-letter-routing-key': 'content-extraction-dlq'
                }
            )
            self.channel.basic_qos(prefetch_count=1)
            self.channel.basic_consume(queue=self.queue_name, on_message_callback=self.process_message)
            
            logger.info("✅ ContentExtractionConsumer listening on content-extraction-queue...")
            self.channel.start_consuming()
        except Exception as e:
            logger.error(f"❌ ContentExtractionConsumer error: {e}")

    def stop(self):
        self.should_stop = True
        if self.connection and self.connection.is_open:
            self.connection.close()

    async def _async_process(self, task: dict) -> dict:
        """Runs the two-stage extraction pipeline (Stage 1: PDF upload; Stage 2: Gemini structuring)"""
        job_id = task.get("jobId")
        target_system = task.get("targetSystem")
        skill = task.get("skill")
        source_type = task.get("sourceType")
        source_ref = task.get("sourceRef")
        audioscript_ref = task.get("audioscriptRef")
        raw_text = task.get("rawText")
        media_assets = task.get("mediaAssets")

        logger.info(f"🚀 Starting background extraction job: {job_id} [{skill}]")

        structurer = get_extraction_service()

        if raw_text:
            logger.info(f"⏭️ [Stage 1] Skipping PDF upload — rawText already supplied for job {job_id}")
            if not media_assets:
                media_assets = []
        else:
            extractor = get_raw_extractor()
            # Step 1: Upload PDF(s) to Gemini Files API
            logger.info(f"📥 [Stage 1] PDF upload for job {job_id}...")
            raw_result = await extractor.extract_raw(source_type, source_ref, skill, audioscript_ref=audioscript_ref)
            raw_text = raw_result["rawText"]
            media_assets = raw_result["mediaAssets"]
        
        # Step 2: Gemini Structuring
        logger.info(f"🧠 [Stage 2] Gemini structuring for job {job_id}...")
        struct_result = await structurer.extract_structured(raw_text, skill, media_assets=media_assets)
        
        return {
            "structuredJson": struct_result["structuredJson"],
            "mediaAssets": media_assets,
            "geminiModel": struct_result["geminiModel"],
            "tokensUsed": struct_result["tokensUsed"]
        }

    def process_message(self, ch, method, properties, body):
        job_id = "unknown"
        skill = "READING"
        try:
            task = json.loads(body)
            job_id = task.get("jobId", "unknown")
            skill = task.get("skill", "READING").upper()
            
            # Run the async process synchronously inside the thread's event loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                payload = loop.run_until_complete(self._async_process(task))
                logger.info(f"✨ Extraction completed successfully for job {job_id}")
            except Exception as e:
                logger.error(f"❌ Extraction pipeline failed for job {job_id}: {e}", exc_info=True)
                payload = {
                    "error": f"Extraction failed: {str(e)}"
                }
            finally:
                loop.close()

        # Send Callback Webhook to backend-core
        try:
            callback_url = f"{self.backend_core_url}/admin/ielts/import/{job_id}/extracted"
            logger.info(f"📤 Posting extraction webhook to NestJS: {callback_url}")
            
            # Serialize payload compactly to guarantee HMAC matches perfectly
            payload_str = json.dumps(payload, separators=(',', ':'))
            
            # Compute SHA-256 HMAC signature
            signature = hmac.new(
                self.callback_secret.encode('utf-8'),
                payload_str.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            headers = {
                "Content-Type": "application/json",
                "x-callback-signature": signature
            }
            
            response = requests.post(callback_url, data=payload_str, headers=headers, timeout=30)
            if response.status_code >= 400:
                logger.error(f"❌ Callback webhook failed (HTTP {response.status_code}): {response.text}")
            else:
                logger.info(f"🎉 Webhook successfully completed for job {job_id}")
                
        except Exception as cb_err:
            logger.error(f"❌ Failed sending callback webhook: {cb_err}")
            
        finally:
            # Always acknowledge the message from queue
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
# We need to import asyncio inside thread execution
import asyncio
