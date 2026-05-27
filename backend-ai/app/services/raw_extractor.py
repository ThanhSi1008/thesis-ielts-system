import logging
from typing import Dict, Any, List, Optional
from app.services.pdf_service import get_pdf_service
from app.services.media_pipeline import get_media_pipeline

logger = logging.getLogger(__name__)

class RawExtractor:
    """Orchestrator for Stage 1 of the Content Import Pipeline (Physical Raw Extraction)"""

    def __init__(self):
        self.pdf_service = get_pdf_service()
        self.media_pipeline = get_media_pipeline()

    async def extract_raw(
        self,
        source_type: str,
        source_ref: str,
        skill: str = "",
        audioscript_ref: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Orchestrates physical extraction of raw text and uploads local/remote media elements.
        Supports only high-fidelity Multimodal PDF uploads.

        For LISTENING jobs with a second PDF (audioscript_ref), both PDFs are uploaded to
        Gemini Files API. The audioscript file URI is appended to rawText as a second line
        with the prefix ``audioscript_uri:`` so ExtractionService can load both files and
        present them together to Gemini.

        Args:
            source_type: "PDF_UPLOAD"
            source_ref: Question Booklet PDF path or URL
            skill: Target IELTS skill (LISTENING, READING, WRITING, SPEAKING)
            audioscript_ref: Optional Audioscripts PDF URL (LISTENING only)

        Returns:
            Dict containing:
                "rawText": str — gemini_file_uri line, optionally followed by audioscript_uri line
                "mediaAssets": List[Dict[str, str]] — standardized stored URL assets
        """
        logger.info(f"🚀 Starting Stage 1 Raw Extraction: Type={source_type}, Ref={source_ref}, Skill={skill}")

        raw_text = ""
        raw_assets: List[Dict[str, str]] = []

        if source_type.upper() == "PDF_UPLOAD":
            # Upload Question Booklet PDF to Gemini Files API
            result = self.pdf_service.extract_pdf(source_ref, skill)
            raw_text = result["rawText"]
            raw_assets = result["mediaAssets"]

            # For LISTENING: also upload the Audioscripts PDF if provided
            if audioscript_ref:
                logger.info(f"📄 [Stage 1] Uploading Audioscripts PDF for LISTENING: {audioscript_ref}")
                audioscript_result = self.pdf_service.extract_pdf(audioscript_ref, skill)
                # audioscript_result["rawText"] is "gemini_file_uri:files/yyy"
                # Re-label it with audioscript_uri: prefix so ExtractionService can distinguish
                audioscript_file_uri = audioscript_result["rawText"].replace("gemini_file_uri:", "audioscript_uri:", 1)
                raw_text = raw_text + "\n" + audioscript_file_uri
                logger.info(f"✅ Audioscripts PDF uploaded and URI appended to rawText")
        else:
            raise ValueError(f"Unsupported source type: {source_type}. Only 'PDF_UPLOAD' is supported.")

        # Standardize and upload extracted media assets to storage (GCS/MinIO)
        logger.info(f"🔄 Process and upload {len(raw_assets)} media assets to storage...")
        processed_assets = self.media_pipeline.process_assets(raw_assets)

        logger.info(f"✅ Stage 1 Raw Extraction completed: text_length={len(raw_text)}, assets={len(processed_assets)}")

        return {
            "rawText": raw_text,
            "mediaAssets": processed_assets
        }

# Singleton instance
_raw_extractor = None

def get_raw_extractor() -> RawExtractor:
    global _raw_extractor
    if _raw_extractor is None:
        _raw_extractor = RawExtractor()
    return _raw_extractor
