"""
RabbitMQ Consumer for Pronunciation Check Tasks
Listens to pronunciation-check-queue and processes pronunciation analysis requests
"""

import logging
import json
import threading
import time
import pika
import os
from typing import Dict, Any
from app.core.config import get_settings
from app.services.transcription_service import get_transcription_service
from app.services.pronunciation_service import get_pronunciation_service
from app.services.storage_service import get_storage_service

logger = logging.getLogger(__name__)
settings = get_settings()


class PronunciationConsumer:
    """RabbitMQ consumer for processing pronunciation check tasks"""

    def __init__(self):
        self.connection = None
        self.channel = None
        self.consumer_thread = None
        self.is_running = False
        
        # Initialize services
        self.transcription_service = get_transcription_service()
        self.pronunciation_service = get_pronunciation_service()
        self.storage_service = get_storage_service()

    def connect(self):
        """Establish connection to RabbitMQ"""
        try:
            parameters = pika.URLParameters(settings.rabbitmq_url)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare pronunciation-check-queue
            self.channel.queue_declare(
                queue='pronunciation-check-queue',
                durable=True
            )
            self.channel.queue_declare(
                queue='pronunciation-check-result-dlq',
                durable=True
            )
            self.channel.queue_declare(
                queue=settings.rabbitmq_queue_pronunciation_result,
                durable=True,
                arguments={
                    'x-dead-letter-exchange': '',
                    'x-dead-letter-routing-key': 'pronunciation-check-result-dlq',
                }
            )
            
            # Set QoS
            self.channel.basic_qos(prefetch_count=settings.consumer_prefetch_count)
            
            logger.info("✅ Connected to RabbitMQ (Pronunciation)")
        except Exception as e:
            logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
            raise

    def process_pronunciation_task(self, task: Dict[str, Any]):
        """
        Process a pronunciation check task
        
        Args:
            task: Pronunciation task data containing:
                - attemptId: UUID of the pronunciation attempt
                - audioUrl: URL/path to the audio file in MinIO
                - targetWord: The expected word to pronounce
                - userId: User ID
                - vocabularyId: Vocabulary ID
        """
        try:
            attempt_id = task.get('attemptId')
            audio_url = task.get('audioUrl')
            target_word = task.get('targetWord')
            user_id = task.get('userId')
            vocabulary_id = task.get('vocabularyId')
            
            logger.info(f"🎤 Processing pronunciation check for attempt: {attempt_id}")
            logger.info(f"   Target word: '{target_word}'")
            
            self._publish_result_event({
                "attemptId": attempt_id,
                "status": "PROCESSING",
            })
            
            # Download audio file from MinIO
            # Extract filename from audioUrl (e.g., "pronunciation/uuid.wav")
            filename = os.path.basename(audio_url)
            local_audio_path = f"/tmp/{filename}"
            
            logger.info(f"⬇️  Downloading audio from: {audio_url}")
            self.storage_service.download_file(audio_url, local_audio_path)
            
            # Transcribe audio using faster_whisper
            logger.info(f"🎧 Transcribing audio...")
            transcription_result = self.transcription_service.transcribe(local_audio_path)
            transcribed_text = transcription_result.get('text', '').strip()
            word_details = transcription_result.get('words', [])
            
            logger.info(f"📝 Transcription: '{transcribed_text}'")
            
            # Analyze pronunciation and calculate score
            pronunciation_result = self.pronunciation_service.analyze_pronunciation(
                transcribed_text=transcribed_text,
                target_word=target_word,
                word_details=word_details
            )
            
            score = pronunciation_result['score']
            feedback = pronunciation_result['feedback']
            
            logger.info(f"📊 Score: {score}/100 - {feedback['level']}")
            
            self._publish_result_event({
                "attemptId": attempt_id,
                "status": "COMPLETED",
                "transcribedText": transcribed_text,
                "score": score,
                "feedback": feedback,
                "error": None,
            })
            
            # Clean up temporary file
            if os.path.exists(local_audio_path):
                os.remove(local_audio_path)
            
            logger.info(f"✅ Pronunciation check completed for attempt: {attempt_id}")
            
        except Exception as e:
            logger.error(f"❌ Pronunciation check failed: {e}")
            attempt_id = task.get('attemptId')
            if attempt_id:
                self._publish_result_event({
                    "attemptId": attempt_id,
                    "status": "FAILED",
                    "feedback": {"error": str(e)},
                    "error": str(e),
                })
            raise

    def _publish_result_event(self, event: Dict[str, Any]):
        """Publish pronunciation result for backend-core to persist."""
        if not self.channel:
            raise RuntimeError("RabbitMQ channel is not initialized")

        self.channel.basic_publish(
            exchange='',
            routing_key=settings.rabbitmq_queue_pronunciation_result,
            body=json.dumps(event).encode("utf-8"),
            properties=pika.BasicProperties(
                delivery_mode=2,
                content_type="application/json",
            ),
        )
        logger.info(
            f"Published pronunciation result event for attempt: {event.get('attemptId')} "
            f"status={event.get('status')}"
        )

    def callback(self, ch, method, properties, body):
        """Callback function for processing messages"""
        try:
            task = json.loads(body)
            logger.info(f"📥 Received pronunciation task: {task.get('attemptId')}")
            
            # Process the task
            self.process_pronunciation_task(task)
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            logger.error(f"❌ Error processing message: {e}")
            # Reject and discard message (don't requeue to avoid infinite loops)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def start_consuming(self):
        """Start consuming messages — reconnects automatically on connection drop."""
        retry_delay = 5
        max_delay = 60
        while self.is_running:
            try:
                self.connect()
                self.channel.basic_consume(
                    queue='pronunciation-check-queue',
                    on_message_callback=self.callback
                )
                logger.info("🎧 Started consuming pronunciation tasks...")
                retry_delay = 5  # reset on successful connect
                self.channel.start_consuming()
            except Exception as e:
                if not self.is_running:
                    break
                logger.error(f"❌ Consumer error: {e} — reconnecting in {retry_delay}s")
                time.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, max_delay)

    def start(self):
        """Start consumer in a separate thread"""
        if not self.is_running:
            self.is_running = True
            self.consumer_thread = threading.Thread(target=self.start_consuming)
            self.consumer_thread.daemon = True
            self.consumer_thread.start()
            logger.info("✅ Pronunciation consumer started")

    def stop(self):
        """Stop consumer"""
        if self.is_running:
            self.is_running = False
            if self.channel:
                self.channel.stop_consuming()
            if self.connection:
                self.connection.close()
            logger.info("✅ Pronunciation consumer stopped")
