import json
import logging
import threading
import pika
import os
import tempfile
import yt_dlp
import time

from app.core.config import get_settings
from app.services.transcription_service import get_transcription_service

logger = logging.getLogger(__name__)
settings = get_settings()

class TranscriptionConsumer(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.should_stop = False
        self.connection = None
        self.channel = None
        self.queue_name = "dictation-transcription-queue"

    def run(self):
        try:
            params = pika.URLParameters(settings.rabbitmq_url)
            params.heartbeat = 600
            params.blocked_connection_timeout = 300
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            self.channel.queue_declare(queue="dictation-transcription-result-dlq", durable=True)
            self.channel.queue_declare(
                queue=settings.rabbitmq_queue_transcription_result,
                durable=True,
                arguments={
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": "dictation-transcription-result-dlq",
                },
            )
            self.channel.basic_qos(prefetch_count=1)
            self.channel.basic_consume(queue=self.queue_name, on_message_callback=self.process_message)
            logger.info("✅ TranscriptionConsumer listening...")
            self.channel.start_consuming()
        except Exception as e:
            logger.error(f"TranscriptionConsumer error: {e}")
            if not self.should_stop:
                time.sleep(5)
                self.run()

    def stop(self):
        self.should_stop = True
        if self.connection and self.connection.is_open:
            self.connection.close()

    def process_message(self, ch, method, properties, body):
        try:
            task = json.loads(body)
            video_id = task.get("videoId")
            job_id = task.get("jobId") or video_id
            youtube_url = task.get("youtubeUrl")
            video_type = task.get("type", "dictation")  # "shadowing" or "dictation"

            logger.info(f"Processing {video_type} transcription for {video_id} - {youtube_url}")

            with tempfile.TemporaryDirectory() as tmpdir:
                audio_path = os.path.join(tmpdir, "audio.m4a")
                ydl_opts = {
                    'format': 'm4a/bestaudio/best',
                    'outtmpl': audio_path,
                    'quiet': True,
                    'nocheckcertificate': True
                }
                
                logger.info("Downloading audio via yt-dlp...")
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info_dict = ydl.extract_info(youtube_url, download=True)
                    duration_sec = info_dict.get('duration', 0)
                    mins = duration_sec // 60
                    secs = duration_sec % 60
                    duration_str = f"{mins}:{secs:02d}"
                
                logger.info("Starting Whisper transcription...")
                ts = get_transcription_service()
                result = ts.transcribe(audio_path, language="en")
                
                sentences = []
                import re
                for i, seg in enumerate(result.get("segments", [])):
                    text = seg.get("text", "").strip()
                    if not text: continue
                    # Remove punctuation to get clean words
                    clean_text = re.sub(r'[^\w\s\'-]', '', text)
                    words = [w for w in clean_text.split() if w]
                    
                    sentences.append({
                        "id": f"s-{i+1}",
                        "english": text,
                        "words": words,
                        "audioStart": seg.get("start", 0),
                        "audioEnd": seg.get("end", 0)
                    })
                
                # Publish result for backend-core to persist.
                self._publish_result_event({
                    "jobId": job_id,
                    "videoId": video_id,
                    "type": video_type,
                    "status": "COMPLETED",
                    "sentences": sentences,
                    "duration": duration_str,
                    "error": None,
                    "completedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                })
                logger.info(f"Transcription complete for {video_id} ({video_type})")
                
            self._ack_if_open(ch, method.delivery_tag)
        except Exception as e:
            logger.error(f"❌ Error in transcription task: {e}")
            # we reject without requeue so it doesn't loop infinitely on failures
            try:
                task = json.loads(body)
                video_id = task.get("videoId")
                if video_id:
                    self._publish_result_event({
                        "jobId": task.get("jobId") or video_id,
                        "videoId": video_id,
                        "type": task.get("type", "dictation"),
                        "status": "FAILED",
                        "sentences": [],
                        "duration": "0:00",
                        "error": str(e),
                        "completedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    })
            except Exception as publish_error:
                logger.error(f"Failed to publish transcription failure event: {publish_error}")
            self._reject_if_open(ch, method.delivery_tag)

    def _publish_result_event(self, event: dict):
        if not self.channel or self.channel.is_closed:
            raise RuntimeError("RabbitMQ channel is not initialized")

        self.channel.basic_publish(
            exchange="",
            routing_key=settings.rabbitmq_queue_transcription_result,
            body=json.dumps(event).encode("utf-8"),
            properties=pika.BasicProperties(
                delivery_mode=2,
                content_type="application/json",
            ),
        )
        logger.info(
            f"Published transcription result event for video: {event.get('videoId')} "
            f"status={event.get('status')}"
        )

    def _ack_if_open(self, ch, delivery_tag):
        if ch and ch.is_open:
            ch.basic_ack(delivery_tag=delivery_tag)
            return
        logger.warning("Cannot ack transcription message because RabbitMQ channel is closed")

    def _reject_if_open(self, ch, delivery_tag):
        if ch and ch.is_open:
            ch.basic_reject(delivery_tag=delivery_tag, requeue=False)
            return
        logger.warning("Cannot reject transcription message because RabbitMQ channel is closed")
