import logging
import os
import fitz  # PyMuPDF
import tempfile
import requests
from typing import Dict, Any, List
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class PdfService:
    """Service for extracting text and media from PDFs"""

    def extract_pdf(self, pdf_input: str, skill: str = "") -> Dict[str, Any]:
        """
        Parses a PDF from a local filepath or remote URL.
        
        Args:
            pdf_input: Absolute file path or web URL pointing to a PDF.
            skill: The target IELTS skill (e.g. LISTENING, READING, WRITING, SPEAKING)
            
        Returns:
            Dict containing rawText (str) and mediaAssets (list of local file dicts)
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
            
        raw_text_parts: List[str] = []
        media_assets: List[Dict[str, str]] = []
        
        try:
            doc = fitz.open(local_path)
            num_pages = len(doc)
            logger.info(f"📄 Opened PDF containing {num_pages} pages. Skill: {skill}")
            
            for page_idx in range(num_pages):
                page = doc[page_idx]
                page_num = page_idx + 1
                
                # 1. Extract text content
                page_text = page.get_text()
                raw_text_parts.append(f"--- Page {page_num} ---\n{page_text}")
                
                # 2. Extract raster images
                image_list = page.get_images(full=True)
                for img_idx, img_info in enumerate(image_list):
                    try:
                        xref = img_info[0]
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        
                        # Save raster image to a temporary file
                        temp_img = tempfile.NamedTemporaryFile(suffix=f".{image_ext}", delete=False)
                        temp_img.write(image_bytes)
                        temp_img.close()
                        
                        media_assets.append({
                            "originalUrl": f"pdf_extracted_p{page_num}_img{img_idx}.{image_ext}",
                            "localPath": temp_img.name,
                            "kind": "image"
                        })
                        logger.info(f"📸 Extracted raster image from page {page_num} index {img_idx}")
                    except Exception as img_err:
                        logger.warning(f"Failed to extract raster image {img_idx} on page {page_num}: {img_err}")
                
                # 3. Smart Vector Rasterization Heuristic
                # Cambridge IELTS PDFs often contain charts, maps, or line graphs drawn as vector elements.
                # Standard page.get_images() will NOT find them.
                # Trigger rasterization if skill is WRITING, or if there are vector drawings and no raster images.
                has_vector_drawings = False
                try:
                    # page.get_drawings() returns a list of vector paths
                    drawings = page.get_drawings()
                    has_vector_drawings = len(drawings) > 5
                except Exception:
                    pass
                
                should_rasterize_page = (
                    skill.upper() == "WRITING" or 
                    (len(image_list) == 0 and has_vector_drawings)
                )
                
                if should_rasterize_page:
                    try:
                        logger.info(f"🎨 Rasterizing page {page_num} at 150 DPI (writing prompt or vector drawings detected)")
                        # Render page to high-quality image (150 DPI is standard zoom = 150/72 = 2.08)
                        zoom = 150 / 72
                        matrix = fitz.Matrix(zoom, zoom)
                        pix = page.get_pixmap(matrix=matrix)
                        
                        temp_png = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
                        pix.save(temp_png.name)
                        temp_png.close()
                        
                        media_assets.append({
                            "originalUrl": f"pdf_rasterized_p{page_num}.png",
                            "localPath": temp_png.name,
                            "kind": "image"
                        })
                        logger.info(f"✅ Created rasterized page PNG: {temp_png.name}")
                    except Exception as rast_err:
                        logger.error(f"Failed to rasterize page {page_num}: {rast_err}")
            
            doc.close()
            
        finally:
            # Clean up the downloaded temporary PDF file if we created one
            if temp_file and os.path.exists(local_path):
                try:
                    os.remove(local_path)
                except Exception as clean_err:
                    logger.warning(f"Could not clean up temporary PDF: {clean_err}")
                    
        return {
            "rawText": "\n".join(raw_text_parts),
            "mediaAssets": media_assets
        }

# Singleton instance
_pdf_service = None

def get_pdf_service() -> PdfService:
    global _pdf_service
    if _pdf_service is None:
        _pdf_service = PdfService()
    return _pdf_service
