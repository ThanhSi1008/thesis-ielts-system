import sys
import os
import asyncio
import logging

# Ensure project directories are in PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("CLI-Tester")

from app.services.raw_extractor import get_raw_extractor

async def test_web_extraction(extractor, url: str):
    logger.info(f"\n=======================================================")
    logger.info(f"🌐 Testing WEB Extraction: {url}")
    logger.info(f"=======================================================")
    
    try:
        result = await extractor.extract_raw("WEB_URL", url, skill="READING")
        logger.info(f"✅ Success! Extracted text length: {len(result['rawText'])}")
        logger.info(f"Snippet of extracted text:\n{result['rawText'][:300]}...")
        logger.info(f"Stored assets: {result['mediaAssets']}")
    except Exception as e:
        logger.error(f"❌ Web extraction failed: {e}", exc_info=True)

async def test_pdf_extraction(extractor, pdf_path_or_url: str, skill: str = "WRITING"):
    logger.info(f"\n=======================================================")
    logger.info(f"📄 Testing PDF Extraction: {pdf_path_or_url} (Skill: {skill})")
    logger.info(f"=======================================================")
    
    try:
        result = await extractor.extract_raw("PDF_UPLOAD", pdf_path_or_url, skill=skill)
        logger.info(f"✅ Success! Extracted text length: {len(result['rawText'])}")
        logger.info(f"Snippet of extracted text:\n{result['rawText'][:300]}...")
        logger.info(f"Stored assets: {result['mediaAssets']}")
    except Exception as e:
        logger.error(f"❌ PDF extraction failed: {e}", exc_info=True)

async def main():
    # Initialize settings and environment
    os.environ["ENVIRONMENT"] = "testing"
    
    extractor = get_raw_extractor()
    
    # Test Web Scraper
    test_url = "https://example.com"
    await test_web_extraction(extractor, test_url)
    
    # Test PDF Extractor with a small public PDF
    # We will use a standard public PDF sample from W3C
    test_pdf = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    await test_pdf_extraction(extractor, test_pdf, "WRITING")

if __name__ == "__main__":
    asyncio.run(main())
