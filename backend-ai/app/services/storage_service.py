"""
Storage Service for downloading files from object storage
Supports both MinIO (S3-compatible) and Google Cloud Storage
"""

import logging
import os
from typing import Optional
import boto3
from botocore.client import Config
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class StorageService:
    """Service for interacting with object storage"""

    def __init__(self):
        self.s3_client = None
        self._init_s3_client()

    def _init_s3_client(self):
        """Initialize S3-compatible client (for MinIO or AWS S3)"""
        try:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=settings.storage_endpoint if settings.storage_endpoint else None,
                aws_access_key_id=settings.storage_access_key,
                aws_secret_access_key=settings.storage_secret_key,
                region_name=settings.storage_region,
                config=Config(signature_version='s3v4'),
                use_ssl=settings.storage_use_ssl
            )
            logger.info("✅ Storage client initialized")
            # Automatically create bucket in local/dev environments
            if "localhost" in (settings.storage_endpoint or ""):
                try:
                    self.s3_client.create_bucket(Bucket=settings.storage_bucket)
                    logger.info(f"🪣 Created local storage bucket: {settings.storage_bucket}")
                except Exception as bucket_err:
                    # Ignore if bucket already exists
                    pass
        except Exception as e:
            logger.error(f"❌ Failed to initialize storage client: {e}")
            raise

    def download_file(self, object_key: str, local_path: str) -> str:
        """
        Download file from object storage

        Args:
            object_key: Object key in storage bucket
            local_path: Local path to save the file

        Returns:
            Path to downloaded file
        """
        try:
            logger.info(f"Downloading file: {object_key}")
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            # Handle full URLs (e.g., Cloudinary)
            if object_key.startswith('http://') or object_key.startswith('https://'):
                import requests
                logger.info(f"⬇️ Downloading from URL: {object_key}")
                response = requests.get(object_key, stream=True)
                response.raise_for_status()
                with open(local_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
            else:
                # Download file from S3/MinIO
                self.s3_client.download_file(
                    settings.storage_bucket,
                    object_key,
                    local_path
                )
            
            logger.info(f"✅ File downloaded: {local_path}")
            return local_path

        except Exception as e:
            logger.error(f"❌ File download failed: {e}")
            raise

    def upload_file(self, local_path: str, object_key: str) -> str:
        """
        Upload file to object storage

        Args:
            local_path: Local file path
            object_key: Object key in storage bucket

        Returns:
            Object key
        """
        try:
            logger.info(f"Uploading file: {object_key}")
            
            self.s3_client.upload_file(
                local_path,
                settings.storage_bucket,
                object_key
            )
            
            logger.info(f"✅ File uploaded: {object_key}")
            return object_key

        except Exception as e:
            logger.error(f"❌ File upload failed: {e}")
            raise


# Singleton instance
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """Get or create storage service instance"""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service

