import json
import logging
import threading
import pika
import os
import tempfile
import yt_dlp
import requests

from app.config import get_settings
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
        self.backend_core_url = settings.backend_core_url

    def run(self):
        try:
            params = pika.URLParameters(settings.rabbitmq_url)
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            self.channel.basic_qos(prefetch_count=1)
            self.channel.basic_consume(queue=self.queue_name, on_message_callback=self.process_message)
            logger.info("✅ TranscriptionConsumer listening...")
            self.channel.start_consuming()
        except Exception as e:
            logger.error(f"❌ TranscriptionConsumer error: {e}")

    def stop(self):
        self.should_stop = True
        if self.connection and self.connection.is_open:
            self.connection.close()

    def process_message(self, ch, method, properties, body):
        try:
            task = json.loads(body)
            video_id = task.get("videoId")
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
                
                # Callback to backend-core — route depends on video type
                callback_url = f"{self.backend_core_url}/{video_type}/webhooks/videos/{video_id}/complete"
                payload = {
                    "sentences": sentences,
                    "duration": duration_str
                }
                logger.info(f"Sending completion callback to {callback_url}")
                response = requests.patch(callback_url, json=payload)
                if response.status_code >= 400:
                    logger.error(f"Failed to callback {callback_url}: {response.text}")
                else:
                    logger.info(f"Transcription complete for {video_id} ({video_type})")
                
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            logger.error(f"❌ Error in transcription task: {e}")
            # we reject without requeue so it doesn't loop infinitely on failures
            ch.basic_reject(delivery_tag=method.delivery_tag, requeue=False)
