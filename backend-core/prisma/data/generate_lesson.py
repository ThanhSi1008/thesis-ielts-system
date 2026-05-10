"""
One-off script to transcribe a YouTube video and generate a shadowing lesson TypeScript file.
Usage: python generate_lesson.py
"""

import sys
import os
import re
import json
import tempfile

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

# Add parent dir so we can reuse app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend-ai'))

import yt_dlp

# ── CONFIG ─────────────────────────────────────────────────────────────────────
YOUTUBE_URL = "https://youtu.be/rSPH368zIvc"
LESSON_ID   = "9"
TITLE       = "Are You Guys Dating?"
TAGS        = ["YOUTUBE", "stevie-emerson"]
DURATION    = "2:54"
LESSON_TYPE = "shadowing"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "shadowing-lessons", "lesson-009-are-you-guys-dating-stevie-emerson.ts")
# ───────────────────────────────────────────────────────────────────────────────


def transcribe_youtube(url: str, tmpdir: str):
    audio_path = os.path.join(tmpdir, "audio")
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio',
        'outtmpl': audio_path + '.%(ext)s',
        'quiet': False,
        'nocheckcertificate': True,
        # No postprocessors — avoid ffmpeg requirement
    }
    print("Downloading audio via yt-dlp...")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.extract_info(url, download=True)

    # Find the downloaded file
    downloaded = [f for f in os.listdir(tmpdir) if f.startswith("audio")]
    if not downloaded:
        raise FileNotFoundError("No audio file found after download")
    wav_path = os.path.join(tmpdir, downloaded[0])
    print(f"Audio downloaded: {wav_path}")
    return wav_path


def run_whisper(audio_path: str):
    try:
        # Force offline mode — avoids symlink privilege issues on Windows
        os.environ["HF_HUB_OFFLINE"] = "1"
        from faster_whisper import WhisperModel
        print("Running Whisper (base)...")
        model = WhisperModel("base", device="cpu", compute_type="int8", local_files_only=True)
        segments, info = model.transcribe(audio_path, language="en", beam_size=5, vad_filter=True)
        results = []
        for seg in segments:
            results.append({
                "text": seg.text.strip(),
                "start": round(seg.start, 2),
                "end":   round(seg.end, 2),
            })
        print(f"Whisper done: {len(results)} segments")
        return results
    except ImportError:
        print("faster-whisper not installed. Run: pip install faster-whisper")
        sys.exit(1)


def clean_words(text: str):
    clean = re.sub(r"[^\w\s'\-]", "", text)
    return [w for w in clean.split() if w]


def build_ts(lesson_id, title, tags, duration, lesson_type, segments):
    sentences = []
    for i, seg in enumerate(segments):
        text = seg["text"]
        words = clean_words(text)
        sentences.append({
            "id": i + 1,
            "english": text,
            "phonetic": "",
            "vietnamese": "",
            "words": words,
            "audioStart": seg["start"],
            "audioEnd": seg["end"],
        })

    yt_id = re.search(r"(?:v=|/)([0-9A-Za-z_-]{11})", YOUTUBE_URL)
    yt_id = yt_id.group(1) if yt_id else ""

    sentences_ts = json.dumps(sentences, indent=8, ensure_ascii=False)
    # JSON uses true/false/null — not needed here since all primitives are numbers/strings

    lines = [
        "import { ShadowingLesson } from './types';",
        "",
        f"export const lesson{lesson_id.zfill(3)}: ShadowingLesson = {{",
        f'    "id": "{lesson_id}",',
        f'    "title": "{title}",',
        f'    "audioUrl": "",',
        f'    "youtubeVideoId": "{yt_id}",',
        f'    "image": "https://img.youtube.com/vi/{yt_id}/maxresdefault.jpg",',
        f'    "tags": {json.dumps(tags)},',
        f'    "duration": "{duration}",',
        f'    "type": "{lesson_type}",',
        f'    "sentences": {sentences_ts}',
        "};",
        "",
    ]
    return "\n".join(lines)


def main():
    with tempfile.TemporaryDirectory() as tmpdir:
        audio_path = transcribe_youtube(YOUTUBE_URL, tmpdir)
        segments = run_whisper(audio_path)

    ts_content = build_ts(LESSON_ID, TITLE, TAGS, DURATION, LESSON_TYPE, segments)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"\n✅ Lesson file generated: {OUTPUT_FILE}")
    sentence_count = ts_content.count('"id":')
    print(f"   Sentences: {sentence_count} ")
    print("\nNext steps:")
    print("  1. Review the generated file and fix any transcription errors.")
    print("  2. Add the export to shadowing-lessons/index.ts")
    print("  3. Run: npx ts-node prisma/seed-shadowing.ts (or equivalent seed command)")


if __name__ == "__main__":
    main()
