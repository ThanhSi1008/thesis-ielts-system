"""
RabbitMQ Consumer for Grading Tasks
Listens to grading queue and processes exam grading requests
"""

import logging
import json
import threading
import time
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

RETRYABLE_CODES = {'503', '429', '502', 'service unavailable', 'too many requests', 'bad gateway'}
MAX_RETRIES = 3
BASE_DELAY = 5  # seconds; backoff: 5s, 10s, 20s


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

    def _is_retryable(self, e: Exception) -> bool:
        """Return True for transient API errors that warrant a retry."""
        msg = str(e).lower()
        return any(code in msg for code in RETRYABLE_CODES)

    def _process_with_retry(self, task: Dict[str, Any]):
        """
        Call process_grading_task with exponential backoff for transient errors.
        On final failure the session status is already GRADING_FAILED (set by
        process_grading_task) so we re-raise to let callback ack the message.
        """
        session_id = task.get('sessionId')
        for attempt in range(MAX_RETRIES):
            try:
                self.process_grading_task(task)
                return  # success
            except Exception as e:
                is_last = attempt == MAX_RETRIES - 1
                if self._is_retryable(e) and not is_last:
                    delay = BASE_DELAY * (2 ** attempt)
                    logger.warning(
                        f"⏳ Attempt {attempt + 1}/{MAX_RETRIES} failed for {session_id} "
                        f"({e}). Retrying in {delay}s..."
                    )
                    time.sleep(delay)
                else:
                    logger.error(
                        f"❌ Grading failed after {attempt + 1} attempt(s) for {session_id}: {e}"
                    )
                    raise

    def callback(self, ch, method, properties, body):
        """Callback function for processing messages"""
        session_id = None
        try:
            task = json.loads(body)
            session_id = task.get('sessionId')
            logger.info(f"📥 Received grading task: {session_id}")

            self._process_with_retry(task)

        except Exception as e:
            logger.error(f"❌ Unrecoverable grading error for {session_id}: {e}")
            # Status is already GRADING_FAILED in DB — fall through to ack

        finally:
            # Always ack: removes the message from the queue.
            # Never nack(requeue=True) — that causes an instant retry loop.
            ch.basic_ack(delivery_tag=method.delivery_tag)

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

