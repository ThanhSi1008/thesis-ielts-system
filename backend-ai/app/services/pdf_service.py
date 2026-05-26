import logging
import os
import tempfile
import requests
from typing import Dict, Any
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class PdfService:
    """Service for uploading PDFs to the Gemini Files API for multimodal extraction"""

    def extract_pdf(self, pdf_input: str, skill: str = "") -> Dict[str, Any]:
        """
        Accepts a local filepath or remote URL.
        Uploads the PDF directly to the Gemini Files API and returns the file URI.
        All text and visual understanding is delegated entirely to Gemini.
        """
        local_path = pdf_input
        temp_file = None

        # Download PDF if it is a remote URL
        if pdf_input.startswith("http://") or pdf_input.startswith("https://"):
            logger.info(f"⬇️ Downloading remote PDF: {pdf_input}")
            response = requests.get(pdf_input, stream=True)
            response.raise_for_status()

            temp_file = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
            for chunk in response.iter_content(chunk_size=8192):
                temp_file.write(chunk)
            temp_file.close()
            local_path = temp_file.name
            logger.info(f"💾 Saved remote PDF to temp: {local_path}")

        try:
            if not settings.gemini_api_key:
                raise RuntimeError("GEMINI_API_KEY is not configured in environment variables.")

            from google import genai
            client = genai.Client(api_key=settings.gemini_api_key)
            logger.info(f"📤 Uploading physical PDF to Gemini Files API: {local_path} ...")
            uploaded_file = client.files.upload(file=local_path)
            logger.info(f"✅ Gemini Files API Upload Successful! Name: {uploaded_file.name}")

            return {
                "rawText": f"gemini_file_uri:{uploaded_file.name}",
                "mediaAssets": []
            }

        finally:
            # Clean up the downloaded temporary PDF file if we created one
            if temp_file and os.path.exists(local_path):
                try:
                    os.remove(local_path)
                except Exception as clean_err:
                    logger.warning(f"Could not clean up temporary PDF: {clean_err}")

# Singleton instance
_pdf_service = None

def get_pdf_service() -> PdfService:
    global _pdf_service
    if _pdf_service is None:
        _pdf_service = PdfService()
    return _pdf_service
