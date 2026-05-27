"""
FastAPI AI Service - Main Application
Handles AI operations for IELTS Master AI system
v1.0.3
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import get_settings
from app.api import health, grading, writing, speaking, chat
from app.consumers.grading_consumer import GradingConsumer
from app.consumers.pronunciation_consumer import PronunciationConsumer
from app.consumers.transcription_consumer import TranscriptionConsumer
from app.consumers.content_extraction_consumer import ContentExtractionConsumer
from app.telemetry import setup_telemetry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()

# Global consumer instances
grading_consumer = None
pronunciation_consumer = None
transcription_consumer = None
content_extraction_consumer = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    global grading_consumer, pronunciation_consumer, transcription_consumer, content_extraction_consumer
    
    # Startup
    logger.info("🚀 Starting AI Service...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Whisper Model: {settings.whisper_model}")
    
    # Start RabbitMQ consumers
    grading_consumer = GradingConsumer()
    grading_consumer.start()
    logger.info("✅ Grading consumer started")
    
    pronunciation_consumer = PronunciationConsumer()
    pronunciation_consumer.start()
    logger.info("✅ Pronunciation consumer started")
    
    transcription_consumer = TranscriptionConsumer()
    transcription_consumer.start()
    logger.info("✅ Transcription consumer started")
    
    content_extraction_consumer = ContentExtractionConsumer()
    content_extraction_consumer.start()
    logger.info("✅ Content extraction consumer started")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI Service...")
    if grading_consumer:
        grading_consumer.stop()
    if pronunciation_consumer:
        pronunciation_consumer.stop()
    if transcription_consumer:
        transcription_consumer.stop()
    if content_extraction_consumer:
        content_extraction_consumer.stop()
    logger.info("✅ AI Service shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="IELTS Master AI - AI Service",
    description="AI microservice for speech-to-text transcription and automated grading",
    version="1.0.0",
    lifespan=lifespan
)

setup_telemetry(app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(grading.router, prefix="/api/v1/grading", tags=["Grading"])
app.include_router(writing.router, prefix="/api/v1/writing", tags=["Writing"])
app.include_router(speaking.router, prefix="/api/v1/speaking", tags=["Speaking"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "IELTS Master AI - AI Service",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.environment
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development"
    )

