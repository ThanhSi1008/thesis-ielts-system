import logging
import os
import uuid
import tempfile
import requests
from typing import List, Dict, Any
from app.config import get_settings
from app.services.storage_service import get_storage_service

logger = logging.getLogger(__name__)
settings = get_settings()

class MediaPipeline:
    """Standardizes media assets, uploads to GCS or MinIO, and returns storage URLs"""
    
    def __init__(self):
        self.storage_service = get_storage_service()
        
    def upload_asset(self, local_path: str, kind: str) -> str:
        """
        Uploads a local file to GCS or MinIO, returning the full access URL.
        """
        ext = os.path.splitext(local_path)[1] or (".png" if kind == "image" else ".mp3")
        object_key = f"ielts-imports/{uuid.uuid4()}{ext}"
        
        # Check if GCS is configured
        if settings.gcs_project_id and settings.gcs_bucket_name:
            try:
                from google.cloud import storage
                logger.info(f"☁️ Uploading to GCS bucket: {settings.gcs_bucket_name} key: {object_key}")
                client = storage.Client(project=settings.gcs_project_id)
                bucket = client.bucket(settings.gcs_bucket_name)
                blob = bucket.blob(object_key)
                blob.upload_from_filename(local_path)
                
                # Form public GCS URL
                stored_url = f"https://storage.googleapis.com/{settings.gcs_bucket_name}/{object_key}"
                logger.info(f"✅ GCS Upload successful: {stored_url}")
                return stored_url
            except Exception as gcs_err:
                logger.error(f"GCS Upload failed, falling back to S3/MinIO: {gcs_err}")
                
        # S3 / MinIO Upload fallback
        try:
            logger.info(f"📦 Uploading to S3/MinIO bucket: {settings.storage_bucket} key: {object_key}")
            self.storage_service.upload_file(local_path, object_key)
            
            # Form public URL
            stored_url = f"{settings.storage_endpoint}/{settings.storage_bucket}/{object_key}"
            logger.info(f"✅ S3/MinIO Upload successful: {stored_url}")
            return stored_url
        except Exception as s3_err:
            logger.error(f"S3/MinIO Upload failed: {s3_err}")
            raise

    def process_assets(self, assets: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Processes a list of raw media assets (either remote URLs or local file references),
        saves/downloads them, uploads to cloud/local storage, and returns metadata.
        """
        processed_assets = []
        for asset in assets:
            original_url = asset.get("originalUrl", "")
            local_path = asset.get("localPath", "")
            kind = asset.get("kind", "image")
            
            logger.info(f"🔄 Processing asset: originalUrl={original_url}, localPath={local_path}, kind={kind}")
            
            temp_local_path = None
            try:
                # If there's no local path, but we have a remote URL, download it first
                if not local_path and original_url:
                    logger.info(f"⬇️ Downloading remote asset URL: {original_url}")
                    response = requests.get(original_url, stream=True, timeout=15)
                    response.raise_for_status()
                    
                    ext = ".png" if kind == "image" else ".mp3"
                    temp_img = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
                    for chunk in response.iter_content(chunk_size=8192):
                        temp_img.write(chunk)
                    temp_img.close()
                    local_path = temp_img.name
                    temp_local_path = local_path
                
                if local_path and os.path.exists(local_path):
                    # Upload to GCS/S3
                    stored_url = self.upload_asset(local_path, kind)
                    processed_assets.append({
                        "originalUrl": original_url,
                        "storedUrl": stored_url,
                        "kind": kind
                    })
                else:
                    logger.warning(f"Asset file not found or invalid: {local_path or original_url}")
                    
            except Exception as e:
                logger.error(f"Failed to process media asset {original_url or local_path}: {e}")
                # We do not fail the whole process if one asset fails, we just log it
                
            finally:
                # Clean up temporary download file if created
                if temp_local_path and os.path.exists(temp_local_path):
                    try:
                        os.remove(temp_local_path)
                    except Exception as e:
                        logger.warning(f"Could not clean up temp file {temp_local_path}: {e}")
                        
        return processed_assets

# Singleton instance
_media_pipeline = None

def get_media_pipeline() -> MediaPipeline:
    global _media_pipeline
    if _media_pipeline is None:
        _media_pipeline = MediaPipeline()
    return _media_pipeline
