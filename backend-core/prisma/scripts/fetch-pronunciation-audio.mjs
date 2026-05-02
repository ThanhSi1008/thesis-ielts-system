/**
 * fetch-pronunciation-audio.mjs
 * 
 * Fetches audio URLs for all pronunciation example words from the Free Dictionary API,
 * then rewrites pronunciation.ts with audioUrl fields populated.
 *
 * Usage (from backend-core/):
 *   node prisma/scripts/fetch-pronunciation-audio.mjs
 */

import { createRequire } from "module";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// We need the TS data — use ts-node/esm or just inline the symbol list
// Since pronunciation.ts is excluded from tsc, we inline a reference array here
// that mirrors the order/symbols in pronunciation.ts. The actual rewrite
// will use the compiled output from the seed file pattern.
//
// Simpler approach: just run the fetch logic and print results, then manually
// paste or let the script read/write the file using regex replacement.

const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en";
const DELAY_MS = 300;

// All example words from pronunciation.ts (manually extracted, deduplicated)
const ALL_WORDS = [
  // Monophthongs
  "sheep", "tree", "green", "beach", "people",
  "ship", "fish", "sit", "women", "listen",
  "good", "book", "put", "sugar", "woman",
  "food", "shoe", "two", "music", "group",
  "bed", "red", "head", "many", "friend",
  "teacher", "about", "doctor", "today", "banana",
  "bird", "word", "learn", "turn", "early",
  "door", "four", "more", "talk", "water",
  "cat", "apple", "map", "black", "man",
  "up", "cup", "sun", "money", "blood",
  "far", "car", "father", "part", "heart",
  "on", "dog", "box", "hot", "stop",
  // Diphthongs
  "here", "ear", "near", "clear", "year",
  "wait", "day", "name", "eight", "they",
  "tourist", "pure", "sure", "cure", "poor",
  "boy", "coin", "join", "noise", "choice",
  "show", "go", "home", "old", "boat",
  "hair", "there", "where", "care", "bear",
  "my", "time", "eye", "like", "high",
  "cow", "now", "house", "out", "down",
  // Consonants
  "pea", "pen", "help",
  "big", "rubber", "job", "club",
  "tea", "city",
  "middle",
  "cheese", "child", "picture", "watch", "catch",
  "june", "magic", "age", "large",
  "school", "back",
  "bigger", "bag",
  "fly", "coffee", "life", "laugh",
  "video", "very", "never", "have", "leave",
  "think", "three", "nothing", "both", "month",
  "this", "mother", "with", "smooth",
  "see", "say", "bus",
  "zoo", "zero", "his", "is",
  "shall", "she", "action", "wish",
  "television", "measure", "vision", "pleasure", "casual",
  "make", "summer", "room",
  "now", "can",
  "sing", "song", "anger", "long", "thing",
  "hat", "who", "perhaps", "behind",
  "love", "hello", "feel", "call",
  "right", "story",
  "wet", "away", "quick", "language",
  "yes", "you", "student", "few", "beautiful",
];

// Deduplicate
const UNIQUE_WORDS = [...new Set(ALL_WORDS)];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWordAudio(word) {
  try {
    const res = await fetch(`${DICT_API}/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const json = await res.json();
    const phonetics = json[0]?.phonetics ?? [];
    const uk = phonetics.find((p) => p.audio && p.audio.includes("-uk"));
    if (uk?.audio) return uk.audio;
    const any = phonetics.find((p) => p.audio && p.audio.length > 0);
    return any?.audio ?? null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`🎵 Fetching audio for ${UNIQUE_WORDS.length} unique words...\n`);

  const results = {};
  let found = 0;

  for (const word of UNIQUE_WORDS) {
    process.stdout.write(`  "${word}"... `);
    const url = await fetchWordAudio(word);
    results[word] = url;
    if (url) {
      found++;
      console.log(`✓`);
    } else {
      console.log(`✗ not found`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\n✅ Found ${found}/${UNIQUE_WORDS.length} audio URLs\n`);

  // Write JSON output for the next step
  const outPath = join(__dirname, "word-audio-urls.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`📝 Saved to: ${outPath}`);
  console.log(`\nNow run: node prisma/scripts/apply-audio-urls.mjs`);
}

main().catch(console.error);
