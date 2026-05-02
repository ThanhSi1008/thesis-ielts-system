/**
 * Client-side SRT parser utility
 * Parses SRT subtitle files and merges entries into sentence-level segments.
 */

import { ShadowingSentence } from '@/services/shadowing.api';

// ── Raw SRT entry ──
interface SrtEntry {
    startTime: number;
    endTime: number;
    text: string;
}

// ── Parse SRT timestamp → seconds ──
function parseTimestamp(ts: string): number {
    const parts = ts.replace(',', '.').split(':');
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
}

// ── Parse full SRT content into raw entries ──
export function parseSRT(content: string): SrtEntry[] {
    const blocks = content.trim().split(/\r?\n\r?\n/);
    const entries: SrtEntry[] = [];

    for (const block of blocks) {
        const lines = block.trim().split(/\r?\n/);
        if (lines.length < 3) continue;

        const timeMatch = lines[1].match(
            /(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/
        );
        if (!timeMatch) continue;

        const startTime = parseTimestamp(timeMatch[1]);
        const endTime = parseTimestamp(timeMatch[2]);
        const text = lines.slice(2).join(' ').trim();

        if (text) {
            entries.push({ startTime, endTime, text });
        }
    }
    return entries;
}

// ── Merge raw entries into sentence-level segments ──
export function mergeIntoSentences(entries: SrtEntry[], maxEntriesPerGroup = 4): ShadowingSentence[] {
    const sentences: ShadowingSentence[] = [];
    let currentText = '';
    let currentStart = 0;
    let entriesInGroup = 0;

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        if (currentText === '') {
            currentStart = entry.startTime;
        }

        // Clean >> markers from auto-generated subtitles
        const cleanedText = entry.text.replace(/^>>\s*/g, '');
        currentText += (currentText ? ' ' : '') + cleanedText;
        entriesInGroup++;

        const endsWithPunctuation = /[.!?]["']?\s*$/.test(currentText.trim());
        const isLast = i === entries.length - 1;
        const reachedMax = entriesInGroup >= maxEntriesPerGroup;

        if (endsWithPunctuation || isLast || reachedMax) {
            const finalText = currentText.replace(/\s+/g, ' ').trim();

            if (finalText.length > 0) {
                const words = finalText.split(/\s+/).filter((w) => w.length > 0);
                sentences.push({
                    id: String(sentences.length + 1),
                    english: finalText,
                    phonetic: '',
                    vietnamese: '',
                    words,
                    audioStart: Math.round(currentStart * 1000) / 1000,
                    audioEnd: Math.round(entry.endTime * 1000) / 1000,
                });
            }

            currentText = '';
            entriesInGroup = 0;
        }
    }

    return sentences;
}

// ── Extract YouTube video ID from various URL formats ──
export function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// ── Full pipeline: parse SRT content → ShadowingSentence[] ──
export function parseSrtToSentences(srtContent: string): ShadowingSentence[] {
    const entries = parseSRT(srtContent);
    return mergeIntoSentences(entries);
}
