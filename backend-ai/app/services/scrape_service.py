import logging
import asyncio
from typing import Dict, Any, List
from urllib.parse import urljoin, urlparse
from playwright.async_api import async_playwright

logger = logging.getLogger(__name__)

class ScrapeService:
    """Service for scraping web pages using Playwright"""

    async def scrape_url(self, url: str) -> Dict[str, Any]:
        """
        Scrapes a URL using headless Playwright.
        
        Args:
            url: The HTTP/HTTPS target page URL
            
        Returns:
            Dict containing rawText (str) and mediaAssets (list of dicts)
        """
        logger.info(f"🌐 Scraping URL: {url}")
        
        raw_text = ""
        media_assets: List[Dict[str, str]] = []
        
        async with async_playwright() as p:
            # Launch headless chromium browser with fallback to firefox
            try:
                browser = await p.chromium.launch(headless=True)
                logger.info("Launched Chromium browser")
            except Exception as chromium_err:
                logger.warning(f"Chromium launch failed, falling back to Firefox: {chromium_err}")
                browser = await p.firefox.launch(headless=True)
                logger.info("Launched Firefox browser")
            
            # Create a context with desktop user-agent to avoid simple scraping blocks
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 800}
            )
            
            page = await context.new_page()
            
            try:
                # Navigate to the page and wait for content loading
                response = await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                if not response:
                    raise Exception("Failed to receive response from server.")
                
                if response.status >= 400:
                    raise Exception(f"HTTP error status: {response.status}")
                
                # Extra wait for dynamic javascript elements
                await asyncio.sleep(2)
                
                # 1. Extract inner text of the body
                raw_text = await page.evaluate("() => document.body.innerText")
                
                # 2. Extract and resolve all image URLs
                images = await page.evaluate("""() => {
                    const imgs = Array.from(document.querySelectorAll('img'));
                    return imgs.map(img => img.src).filter(src => src && src.startsWith('http'));
                }""")
                
                for img_src in set(images):
                    media_assets.append({
                        "originalUrl": img_src,
                        "kind": "image"
                    })
                
                # 3. Extract and resolve all audio files (e.g. from <audio>, <source>, or direct anchors to mp3s)
                audios = await page.evaluate("""() => {
                    const audioUrls = [];
                    // Check <audio> elements
                    document.querySelectorAll('audio').forEach(aud => {
                        if (aud.src) audioUrls.push(aud.src);
                    });
                    // Check <source> elements
                    document.querySelectorAll('source').forEach(src => {
                        if (src.src) audioUrls.push(src.src);
                    });
                    // Check direct link anchors to audio files
                    document.querySelectorAll('a').forEach(lnk => {
                        if (lnk.href && (lnk.href.endsWith('.mp3') || lnk.href.endsWith('.wav') || lnk.href.endsWith('.ogg'))) {
                            audioUrls.push(lnk.href);
                        }
                    });
                    return audioUrls.filter(src => src && src.startsWith('http'));
                }""")
                
                for aud_src in set(audios):
                    media_assets.append({
                        "originalUrl": aud_src,
                        "kind": "audio"
                    })
                
                logger.info(f"✅ Scraping completed. Text length: {len(raw_text)}, Media items: {len(media_assets)}")
                
            except Exception as e:
                logger.error(f"❌ Playwright scraping failed for {url}: {e}")
                raise
            finally:
                await context.close()
                await browser.close()
                
        return {
            "rawText": raw_text.strip(),
            "mediaAssets": media_assets
        }

# Singleton instance
_scrape_service = None

def get_scrape_service() -> ScrapeService:
    global _scrape_service
    if _scrape_service is None:
        _scrape_service = ScrapeService()
    return _scrape_service
