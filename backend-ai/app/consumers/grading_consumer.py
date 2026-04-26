"""
RabbitMQ Consumer for Grading Tasks
Listens to grading queue and processes exam grading requests
"""

import logging
import json
import threading
import pika
import psycopg2
import asyncio
from typing import Dict, Any
from app.config import get_settings
from app.services.transcription_service import get_transcription_service
from app.services.writing_grader import grade_writing
from app.services.speaking_grader import grade_speaking

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

    def connect(self):
        """Establish connection to RabbitMQ"""
        try:
            parameters = pika.URLParameters(settings.rabbitmq_url)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declare DLQ
            self.channel.queue_declare(
                queue='exam-grading-dlq',
                durable=True
            )
            
            # Declare main queue with DLQ routing
            self.channel.queue_declare(
                queue=settings.rabbitmq_queue_grading,
                durable=True,
                arguments={
                    'x-dead-letter-exchange': '',
                    'x-dead-letter-routing-key': 'exam-grading-dlq',
                    'x-message-ttl': 300000,  # 5 minutes
                }
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
            user_id = task.get('userId')
            answers = task.get('answers', {})
            questions = task.get('questions', {})
            
            logger.info(f"Processing grading task for session: {session_id}, type: {exam_type}")
            
            result = None
            if exam_type == 'WRITING':
                result = self._grade_writing(session_id, answers, questions)
            elif exam_type == 'SPEAKING':
                result = self._grade_speaking(session_id, answers, questions)
            else:
                raise ValueError(f"Unsupported exam type for grading: {exam_type}")
            
            self._save_result(session_id, user_id, exam_type, result)
            self._update_session_status(session_id, 'GRADED')
            
            logger.info(f"✅ Grading completed for session: {session_id}")
            
        except Exception as e:
            logger.error(f"❌ Grading task failed for {session_id}: {e}")
            if session_id:
                self._update_session_status(session_id, 'GRADING_FAILED')
            raise

    def _grade_writing(self, session_id: str, answers: Dict[str, Any], questions: Dict[str, Any]) -> Dict[str, Any]:
        tasks = questions.get('tasks', [])
        task1 = next((t for t in tasks if t.get('task_number') == 1), {})
        task2 = next((t for t in tasks if t.get('task_number') == 2), {})
        
        feedback = asyncio.run(grade_writing(
            task1_prompt=task1.get('prompt', ''),
            task2_prompt=task2.get('prompt', ''),
            task1_image_url=task1.get('image_url', ''),
            task1_essay=answers.get('task1', ''),
            task2_essay=answers.get('task2', '')
        ))
        
        return {
            "overallBand": feedback.get("overall_band", 0),
            "feedback": feedback
        }
        
    def _grade_speaking(self, session_id: str, answers: Dict[str, Any], questions: Dict[str, Any]) -> Dict[str, Any]:
        feedback = asyncio.run(grade_speaking(
            session_id=session_id,
            exam_questions=questions,
            audio_answers=answers
        ))
        
        return {
            "overallBand": feedback.get("overall_band", 0),
            "feedback": feedback
        }

    def _save_result(self, session_id: str, user_id: str, exam_type: str, result: Dict[str, Any]):
        """Write grading result to the database"""
        try:
            conn = psycopg2.connect(settings.database_url)
            cursor = conn.cursor()
            
            score = result.get('overallBand', 0)
            feedback_json = json.dumps(result.get('feedback', {}))
            
            cursor.execute("""
                INSERT INTO "results" ("id", "userId", "sessionId", "totalScore",
                                     "writingScore", "speakingScore", "feedback", "gradedAt", "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s::jsonb, NOW(), NOW(), NOW())
                ON CONFLICT ("sessionId") DO UPDATE SET
                    "totalScore" = EXCLUDED."totalScore",
                    "writingScore" = EXCLUDED."writingScore",
                    "speakingScore" = EXCLUDED."speakingScore",
                    "feedback" = EXCLUDED."feedback",
                    "gradedAt" = NOW(),
                    "updatedAt" = NOW()
            """, (
                user_id, session_id, score,
                score if exam_type == 'WRITING' else None,
                score if exam_type == 'SPEAKING' else None,
                feedback_json,
            ))
            conn.commit()
            cursor.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Database update failed: {e}")
            raise

    def _update_session_status(self, session_id: str, status: str):
        """Update session status in database"""
        try:
            conn = psycopg2.connect(settings.database_url)
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE "exam_sessions" SET status = %s WHERE id = %s',
                (status, session_id)
            )
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            logger.error(f"❌ Session status update failed: {e}")

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

