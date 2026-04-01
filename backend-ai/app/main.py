"""
FastAPI AI Service - Main Application
Handles AI operations for TOEIC Master AI system
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import get_settings
from app.api import health, grading, writing, speaking, chat
from app.consumers.grading_consumer import GradingConsumer
from app.consumers.pronunciation_consumer import PronunciationConsumer

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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    global grading_consumer, pronunciation_consumer
    
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
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI Service...")
    if grading_consumer:
        grading_consumer.stop()
    if pronunciation_consumer:
        pronunciation_consumer.stop()
    logger.info("✅ AI Service shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="TOEIC Master AI - AI Service",
    description="AI microservice for speech-to-text transcription and automated grading",
    version="1.0.0",
    lifespan=lifespan
)

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
        "message": "TOEIC Master AI - AI Service",
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

