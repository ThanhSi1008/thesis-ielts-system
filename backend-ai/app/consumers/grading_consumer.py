"""
RabbitMQ Consumer for Grading Tasks
Listens to grading queue and processes exam grading requests
"""

import logging
import json
import threading
import time
import pika
import asyncio
from typing import Dict, Any

from app.core.config import get_settings
from app.services.transcription_service import get_transcription_service
from app.services.grading_service import (
    grade_writing,
    grade_single_writing_task,
    grade_speaking,
    grade_single_speaking_part,
)

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
            self.channel.queue_declare(
                queue='exam-grading-result-dlq',
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
            self.channel.queue_declare(
                queue=settings.rabbitmq_queue_grading_result,
                durable=True,
                arguments={
                    'x-dead-letter-exchange': '',
                    'x-dead-letter-routing-key': 'exam-grading-result-dlq',
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
        session_id = task.get('sessionId')
        exam_type = task.get('examType') or task.get('type')
        user_id = task.get('userId')
        job_id = task.get('jobId') or session_id

        try:
            answers = task.get('answers', {})
            questions = task.get('questions', {})
            
            logger.info(f"Processing grading task for session: {session_id}, type: {exam_type}")
            
            result = None
            if exam_type == 'WRITING':
                result = self._grade_writing(session_id, answers, questions)
                self._publish_grading_result(job_id, session_id, user_id, exam_type, 'GRADED', result)
            elif exam_type == 'SPEAKING':
                result = self._grade_speaking(session_id, answers, questions)
                self._publish_grading_result(job_id, session_id, user_id, exam_type, 'GRADED', result)
            elif exam_type == 'ADVANCED_WRITING':
                result = self._grade_advanced_writing(task)
                self._publish_grading_result(job_id, session_id, user_id, exam_type, 'GRADED', result)
            elif exam_type == 'ADVANCED_SPEAKING':
                result = self._grade_advanced_speaking(task)
                self._publish_grading_result(job_id, session_id, user_id, exam_type, 'GRADED', result)
            else:
                raise ValueError(f"Unsupported exam type for grading: {exam_type}")
            
            logger.info(f"✅ Grading completed for session: {session_id}")
            
        except Exception as e:
            logger.error(f"❌ Grading task failed for {session_id}: {e}")
            if session_id:
                self._publish_grading_failure(job_id, session_id, user_id, exam_type, str(e))
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

    def _grade_advanced_writing(self, task: Dict[str, Any]):
        session_id = task.get('sessionId')
        task_type = task.get('taskType')
        prompt = task.get('prompt')
        essay = task.get('essay')
        image_url = task.get('imageUrl', "")

        feedback = asyncio.run(grade_single_writing_task(
            task_type=task_type,
            prompt=prompt,
            essay=essay,
            image_url=image_url
        ))

        return {
            "overallBand": feedback.get("overall_band", 0),
            "feedback": feedback
        }

    def _grade_advanced_speaking(self, task: Dict[str, Any]):
        session_id = task.get('sessionId')
        part_number = task.get('partNumber')
        part_type = task.get('partType', '')
        questions = task.get('questions', [])
        audio_answers = task.get('audioAnswers', {})

        logger.info(
            f"Grading advanced speaking session {session_id} (part={part_number}, type={part_type})"
        )

        feedback = asyncio.run(
            grade_single_speaking_part(
                part_number=int(part_number or 1),
                part_type=str(part_type or ""),
                questions=list(questions or []),
                audio_answers=dict(audio_answers or {}),
            )
        )

        return {
            "overallBand": feedback.get("overall_band", 0),
            "feedback": feedback
        }

    def _publish_grading_result(
        self,
        job_id: str,
        session_id: str,
        user_id: str,
        exam_type: str,
        status: str,
        result: Dict[str, Any],
    ):
        """Publish grading result for backend-core to persist."""
        event = {
            "jobId": job_id,
            "sessionId": session_id,
            "userId": user_id,
            "examType": exam_type,
            "status": status,
            "score": result.get("overallBand", 0),
            "feedback": result.get("feedback", {}),
            "error": None,
            "gradedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        self._publish_result_event(event)

    def _publish_grading_failure(
        self,
        job_id: str,
        session_id: str,
        user_id: str,
        exam_type: str,
        error: str,
    ):
        """Publish grading failure for backend-core to persist."""
        event = {
            "jobId": job_id,
            "sessionId": session_id,
            "userId": user_id,
            "examType": exam_type,
            "status": "GRADING_FAILED",
            "score": None,
            "feedback": {"error": error},
            "error": error,
            "gradedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        self._publish_result_event(event)

    def _publish_result_event(self, event: Dict[str, Any]):
        if not self.channel:
            raise RuntimeError("RabbitMQ channel is not initialized")

        self.channel.basic_publish(
            exchange='',
            routing_key=settings.rabbitmq_queue_grading_result,
            body=json.dumps(event).encode("utf-8"),
            properties=pika.BasicProperties(
                delivery_mode=2,
                content_type="application/json",
            ),
        )
        logger.info(
            f"📤 Published grading result event for session: {event.get('sessionId')} "
            f"status={event.get('status')}"
        )

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

