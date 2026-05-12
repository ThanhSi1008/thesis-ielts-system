"""
Batch-generate shadowing lesson files from YouTube URLs using faster-whisper.
Usage: python generate_lessons_batch.py
"""

import json
import os
import re
import tempfile
from typing import Any

import yt_dlp
from faster_whisper import WhisperModel


LESSONS = [
    {
        "id": "10",
        "title": "Joey's Bad Birthday Gift",
        "url": "https://youtu.be/221F55VPp2M",
        "tags": ["YOUTUBE", "friends"],
        "type": "shadowing",
        "output": "lesson-010-joeys-bad-birthday-gift-friends.ts",
    },
    {
        "id": "11",
        "title": "The Friends Pretend To Like Rachel's English Trifle",
        "url": "https://youtu.be/ky3KiiUK_D0",
        "tags": ["YOUTUBE", "friends"],
        "type": "shadowing",
        "output": "lesson-011-the-friends-pretend-to-like-rachels-english-trifle.ts",
    },
    {
        "id": "12",
        "title": "Rachel Works On Her Gossiping Problem",
        "url": "https://youtu.be/XbywiblA1eQ",
        "tags": ["YOUTUBE", "friends"],
        "type": "shadowing",
        "output": "lesson-012-rachel-works-on-her-gossiping-problem-friends.ts",
    },
    {
        "id": "13",
        "title": "The Password",
        "url": "https://youtu.be/8GxqvnQyaxs",
        "tags": ["YOUTUBE", "the-office"],
        "type": "shadowing",
        "output": "lesson-013-the-password-the-office.ts",
    },
    {
        "id": "14",
        "title": "Michael's Pyramid Scheme",
        "url": "https://youtu.be/lC5lsemxaJo",
        "tags": ["YOUTUBE", "the-office"],
        "type": "shadowing",
        "output": "lesson-014-michaels-pyramid-scheme-the-office.ts",
    },
    {
        "id": "15",
        "title": "The Michael Scott Method of Negotiation",
        "url": "https://youtu.be/r-GFmH0EK9Y",
        "tags": ["YOUTUBE", "the-office"],
        "type": "shadowing",
        "output": "lesson-015-the-michael-scott-method-of-negotiation-the-office.ts",
    },
    {
        "id": "16",
        "title": "Do Schools Kill Creativity? | Sir Ken Robinson",
        "url": "https://youtu.be/iG9CE55wbtY",
        "tags": ["YOUTUBE", "ted-talk"],
        "type": "dictation",
        "output": "lesson-016-do-schools-kill-creativity-ted-talk.ts",
    },
    {
        "id": "17",
        "title": "How Great Leaders Inspire Action | Simon Sinek",
        "url": "https://youtu.be/qp0HIF3SfI4",
        "tags": ["YOUTUBE", "ted-talk"],
        "type": "dictation",
        "output": "lesson-017-how-great-leaders-inspire-action-ted-talk.ts",
    },
    {
        "id": "18",
        "title": "The Danger of a Single Story | Chimamanda Ngozi Adichie",
        "url": "https://youtu.be/D9Ihs241zeg",
        "tags": ["YOUTUBE", "ted-talk"],
        "type": "dictation",
        "output": "lesson-018-the-danger-of-a-single-story-ted-talk.ts",
    },
    {
        "id": "19",
        "title": "What Happened Before History? Human Origins",
        "url": "https://youtu.be/dGiQaabX3_o",
        "tags": ["YOUTUBE", "kurzgesagt"],
        "type": "dictation",
        "output": "lesson-019-what-happened-before-history-human-origins-kurzgesagt.ts",
    },
    {
        "id": "20",
        "title": "What Dinosaurs ACTUALLY Looked Like?",
        "url": "https://youtu.be/xaQJbozY_Is",
        "tags": ["YOUTUBE", "kurzgesagt"],
        "type": "dictation",
        "output": "lesson-020-what-dinosaurs-actually-looked-like-kurzgesagt.ts",
    },
    {
        "id": "21",
        "title": "A New History for Humanity - The Human Era",
        "url": "https://youtu.be/czgOWmtGVGs",
        "tags": ["YOUTUBE", "kurzgesagt"],
        "type": "dictation",
        "output": "lesson-021-a-new-history-for-humanity-the-human-era-kurzgesagt.ts",
    },
]


def clean_words(text: str) -> list[str]:
    clean = re.sub(r"[^\w\s'\-]", "", text)
    return [w for w in clean.split() if w]


def fmt_duration(seconds: float) -> str:
    whole = int(round(seconds))
    minutes = whole // 60
    secs = whole % 60
    return f"{minutes:02d}:{secs:02d}"


def extract_video_id(url: str) -> str:
    match = re.search(r"(?:v=|/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else ""


def download_audio(url: str, tmpdir: str) -> str:
    output_base = os.path.join(tmpdir, "audio")
    ydl_opts = {
        "format": "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio",
        "outtmpl": output_base + ".%(ext)s",
        "quiet": False,
        "nocheckcertificate": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.extract_info(url, download=True)
    downloaded = [f for f in os.listdir(tmpdir) if f.startswith("audio")]
    if not downloaded:
        raise RuntimeError("No audio file found after yt-dlp download")
    return os.path.join(tmpdir, downloaded[0])


def transcribe(model: WhisperModel, audio_path: str) -> list[dict[str, Any]]:
    segments, _ = model.transcribe(
        audio_path,
        language="en",
        beam_size=5,
        vad_filter=True,
    )
    out = []
    for seg in segments:
        text = seg.text.strip()
        if not text:
            continue
        out.append({
            "text": text,
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
        })
    return out


def build_ts(lesson: dict[str, Any], segments: list[dict[str, Any]]) -> str:
    sentences = []
    for i, seg in enumerate(segments):
        text = seg["text"]
        sentences.append({
            "id": i + 1,
            "english": text,
            "phonetic": "",
            "vietnamese": "",
            "words": clean_words(text),
            "audioStart": seg["start"],
            "audioEnd": seg["end"],
        })

    video_id = extract_video_id(lesson["url"])
    duration = fmt_duration(segments[-1]["end"]) if segments else "00:00"
    sentences_ts = json.dumps(sentences, indent=8, ensure_ascii=False)

    return "\n".join([
        "import { ShadowingLesson } from './types';",
        "",
        f"export const lesson{lesson['id'].zfill(3)}: ShadowingLesson = {{",
        f'    "id": "{lesson["id"]}",',
        f'    "title": "{lesson["title"]}",',
        '    "audioUrl": "",',
        f'    "youtubeVideoId": "{video_id}",',
        f'    "image": "https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",',
        f'    "tags": {json.dumps(lesson["tags"])},',
        f'    "duration": "{duration}",',
        f'    "type": "{lesson["type"]}",',
        f'    "sentences": {sentences_ts}',
        "};",
        "",
    ])


def main() -> None:
    lesson_dir = os.path.join(os.path.dirname(__file__), "shadowing-lessons")
    os.makedirs(lesson_dir, exist_ok=True)

    print("Loading Whisper model once (base, CPU int8)...")
    model = WhisperModel("base", device="cpu", compute_type="int8", local_files_only=False)

    for lesson in LESSONS:
        print(f"\n=== Generating lesson {lesson['id']} - {lesson['title']} ===")
        with tempfile.TemporaryDirectory() as tmpdir:
            audio = download_audio(lesson["url"], tmpdir)
            segments = transcribe(model, audio)
        if not segments:
            raise RuntimeError(f"No transcription segments for lesson {lesson['id']}")
        ts_content = build_ts(lesson, segments)
        out_path = os.path.join(lesson_dir, lesson["output"])
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(ts_content)
        print(f"Saved: {out_path} (segments: {len(segments)})")

    print("\nDone: all 12 lessons generated.")


if __name__ == "__main__":
    main()
