import logging
from typing import Dict, Any, List
from app.services.pdf_service import get_pdf_service
from app.services.media_pipeline import get_media_pipeline

logger = logging.getLogger(__name__)

class RawExtractor:
    """Orchestrator for Stage 1 of the Content Import Pipeline (Physical Raw Extraction)"""

    def __init__(self):
        self.pdf_service = get_pdf_service()
        self.media_pipeline = get_media_pipeline()

    async def extract_raw(self, source_type: str, source_ref: str, skill: str = "") -> Dict[str, Any]:
        """
        Orchestrates physical extraction of raw text and uploads local/remote media elements.
        Supports only high-fidelity Multimodal PDF uploads.
        
        Args:
            source_type: "PDF_UPLOAD"
            source_ref: The local/remote PDF path or URL
            skill: The target IELTS skill (e.g. LISTENING, READING, WRITING, SPEAKING)
            
        Returns:
            Dict containing:
                "rawText": str (The visible text contents)
                "mediaAssets": List[Dict[str, str]] (Standardized stored URL assets)
        """
        logger.info(f"🚀 Starting Stage 1 Raw Extraction: Type={source_type}, Ref={source_ref}, Skill={skill}")
        
        raw_text = ""
        raw_assets: List[Dict[str, str]] = []
        
        if source_type.upper() == "PDF_UPLOAD":
            # Parse PDF using the Multimodal Gemini upload pipeline
            result = self.pdf_service.extract_pdf(source_ref, skill)
            raw_text = result["rawText"]
            raw_assets = result["mediaAssets"]
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
