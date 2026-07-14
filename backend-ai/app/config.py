"""
Configuration module for AI Service
Loads environment variables and provides configuration settings
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # RabbitMQ Configuration
    rabbitmq_url: str = "amqp://ielts:ielts_password@localhost:5672"
    rabbitmq_queue_grading: str = "exam-grading-queue"
    rabbitmq_queue_pronunciation: str = "pronunciation-check-queue"
    rabbitmq_exchange: str = "ielts-exchange"

    # Database Configuration
    database_url: str = "postgresql://ielts_user:ielts_password@localhost:5432/ielts_db"

    # Object Storage Configuration
    storage_endpoint: str = "http://localhost:9000"
    storage_access_key: str = "minioadmin"
    storage_secret_key: str = "minioadmin"
    storage_bucket: str = "ielts-files"
    storage_region: str = "us-east-1"
    storage_use_ssl: bool = False

    # Google Cloud Storage
    gcs_bucket_name: str = "ielts-files"
    gcs_project_id: str = ""
    google_application_credentials: str = ""

    # AI Model Configuration
    whisper_model: str = "base"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"
    llm_model_path: str = "./models/llm"
    llm_device: str = "cpu"

    # Application Configuration
    port: int = 8000
    environment: str = "development"
    log_level: str = "INFO"

    # Worker Configuration
    max_workers: int = 2
    consumer_prefetch_count: int = 1

    # Gemini AI (for IELTS Writing grader)
    gemini_api_key: str = ""
    backend_core_url: str = "http://localhost:3000/api/v1"

    # Cloudinary (audio/image CDN — same account configured in backend-core).
    # Used to host the .mp3 files synthesised for IELTS Intensive Speaking mock exams.
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # IELTS Intensive Speaking mock-exam TTS configuration
    # en-GB-SoniaNeural = high-quality British English female voice (matches a female examiner persona).
    speaking_tts_voice: str = "en-GB-SoniaNeural"
    speaking_examiner_name: str = "Amber Bennett"
    speaking_examiner_role: str = "IELTS Examiner"
    speaking_examiner_avatar_url: str = (
        "https://res.cloudinary.com/demo/image/upload/examiner_placeholder.png"
    )

    # Vocab Lab flashcard TTS — the voice used when the AI agent generates
    # pronunciation audio for a card's front (word/term). en-US-AriaNeural is a
    # clear, neutral US English voice well suited to single words and phrases.
    vocab_tts_voice: str = "en-US-AriaNeural"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

