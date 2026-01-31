"""
RabbitMQ Consumer for Grading Tasks
Listens to grading queue and processes exam grading requests
"""

import logging
import json
import threading
import pika
import psycopg2
from typing import Dict, Any
from app.config import get_settings
from app.services.transcription_service import get_transcription_service
from app.services.grading_service import get_grading_service
from app.services.storage_service import get_storage_service

logger = logging.getLogger(__name__)
settings = get_settings()


class GradingConsumer:
    """RabbitMQ consumer for processing grading tasks"""

    def __init__(self):
        self.connection = None
        self.channel = None
        self.consumer_thread = None
        self.is_running = False
        
        # Initialize services
        self.transcription_service = get_transcription_service()
        self.grading_service = get_grading_service()
        self.storage_service = get_storage_service()

    def connect(self):
        """Establish connection to RabbitMQ"""
        try:
            parameters = pika.URLParameters(settings.rabbitmq_url)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare queue
            self.channel.queue_declare(
                queue=settings.rabbitmq_queue_grading,
                durable=True
            )
            
            # Set QoS
            self.channel.basic_qos(prefetch_count=settings.consumer_prefetch_count)
            
            logger.info("✅ Connected to RabbitMQ")
        except Exception as e:
            logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
            raise

    def process_grading_task(self, task: Dict[str, Any]):
        """
        Process a grading task

        Args:
            task: Grading task data
        """
        try:
            session_id = task.get('sessionId')
            exam_type = task.get('examType')
            audio_url = task.get('audioUrl')
            
            logger.info(f"Processing grading task for session: {session_id}")
            
            result_data = {}
            
            # Process based on exam type
            if exam_type in ['SPEAKING', 'FULL_TEST'] and audio_url:
                # Download audio file
                local_audio_path = f"/tmp/{session_id}.wav"
                self.storage_service.download_file(audio_url, local_audio_path)
                
                # Transcribe audio
                transcription = self.transcription_service.transcribe(local_audio_path)
                
                # Grade speaking response
                speaking_feedback = self.grading_service.grade_speaking(
                    transcription['text'],
                    task.get('question', ''),
                    task.get('rubric', {})
                )
                
                result_data['speakingScore'] = speaking_feedback['score']
                result_data['speakingFeedback'] = speaking_feedback
            
            # Update database with results
            self._update_exam_result(session_id, result_data)
            
            logger.info(f"✅ Grading completed for session: {session_id}")
            
        except Exception as e:
            logger.error(f"❌ Grading task failed: {e}")
            raise

    def _update_exam_result(self, session_id: str, result_data: Dict[str, Any]):
        """Update exam result in database"""
        try:
            conn = psycopg2.connect(settings.database_url)
            cursor = conn.cursor()
            
            # TODO: Implement proper database update logic
            # This is a placeholder
            logger.info(f"Updating result for session: {session_id}")
            
            cursor.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Database update failed: {e}")
            raise

    def callback(self, ch, method, properties, body):
        """Callback function for processing messages"""
        try:
            task = json.loads(body)
            logger.info(f"📥 Received grading task: {task.get('sessionId')}")
            
            # Process the task
            self.process_grading_task(task)
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            logger.error(f"❌ Error processing message: {e}")
            # Reject and requeue message
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    def start_consuming(self):
        """Start consuming messages"""
        try:
            self.connect()
            self.channel.basic_consume(
                queue=settings.rabbitmq_queue_grading,
                on_message_callback=self.callback
            )
            
            logger.info("🎧 Started consuming grading tasks...")
            self.channel.start_consuming()
            
        except Exception as e:
            logger.error(f"❌ Consumer error: {e}")

    def start(self):
        """Start consumer in a separate thread"""
        if not self.is_running:
            self.is_running = True
            self.consumer_thread = threading.Thread(target=self.start_consuming)
            self.consumer_thread.daemon = True
            self.consumer_thread.start()
            logger.info("✅ Grading consumer started")

    def stop(self):
        """Stop consumer"""
        if self.is_running:
            self.is_running = False
            if self.channel:
                self.channel.stop_consuming()
            if self.connection:
                self.connection.close()
            logger.info("✅ Grading consumer stopped")

