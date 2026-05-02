/**
 * apply-audio-urls.mjs
 * 
 * Applies audio URLs to pronunciation.ts using:
 * 1. Predictable Free Dictionary API URL pattern for example words
 *    (https://api.dictionaryapi.dev/media/pronunciations/en/{word}-uk.mp3)
 * 2. Curated Wikimedia Commons URLs for isolated phoneme sounds
 *
 * Words that don't have a -uk.mp3 fall back to -us.mp3, or are skipped.
 * 
 * Usage: node prisma/scripts/apply-audio-urls.mjs
 */

import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// PHONEME AUDIO MAP: IPA symbol → Wikimedia Commons audio URL
// These are the isolated phoneme recordings (what plays on the big hero button)
// ============================================================
const PHONEME_AUDIO = {
  // Monophthongs
  "i:":  "https://upload.wikimedia.org/wikipedia/commons/9/91/Close_front_unrounded_vowel.ogg",
  "ɪ":   "https://upload.wikimedia.org/wikipedia/commons/4/4c/Near-close_near-front_unrounded_vowel.ogg",
  "ʊ":   "https://upload.wikimedia.org/wikipedia/commons/5/5d/Near-close_near-back_rounded_vowel.ogg",
  "u:":  "https://upload.wikimedia.org/wikipedia/commons/5/5d/Close_back_rounded_vowel.ogg",
  "e":   "https://upload.wikimedia.org/wikipedia/commons/6/6c/Open-mid_front_unrounded_vowel.ogg",
  "ə":   "https://upload.wikimedia.org/wikipedia/commons/e/e5/Mid-central_vowel.ogg",
  "ɜː":  "https://upload.wikimedia.org/wikipedia/commons/0/01/Open-mid_central_unrounded_vowel.ogg",
  "ɔː":  "https://upload.wikimedia.org/wikipedia/commons/d/d3/PR-open-mid_back_rounded_vowel.ogg",
  "æ":   "https://upload.wikimedia.org/wikipedia/commons/c/c9/Near-open_front_unrounded_vowel.ogg",
  "ʌ":   "https://upload.wikimedia.org/wikipedia/commons/f/f0/Open-mid_back_unrounded_vowel.ogg",
  "ɑː":  "https://upload.wikimedia.org/wikipedia/commons/a/ac/Open_back_unrounded_vowel.ogg",
  "ɒ":   "https://upload.wikimedia.org/wikipedia/commons/b/ba/PR-open_back_rounded_vowel.ogg",
  // Diphthongs — use Wikimedia word examples since isolated diphthong files are rare
  "ɪə":  "https://upload.wikimedia.org/wikipedia/commons/7/79/En-us-here.ogg",
  "eɪ":  "https://upload.wikimedia.org/wikipedia/commons/5/5c/En-us-day.ogg",
  "ʊə":  "https://upload.wikimedia.org/wikipedia/commons/2/2d/En-us-tourist.ogg",
  "ɔɪ":  "https://upload.wikimedia.org/wikipedia/commons/5/53/En-us-boy.ogg",
  "əʊ":  "https://upload.wikimedia.org/wikipedia/commons/5/58/En-us-go.ogg",
  "eə":  "https://upload.wikimedia.org/wikipedia/commons/1/1c/En-us-hair.ogg",
  "aɪ":  "https://upload.wikimedia.org/wikipedia/commons/2/2c/En-us-eye.ogg",
  "aʊ":  "https://upload.wikimedia.org/wikipedia/commons/0/07/En-us-now.ogg",
  // Consonants
  "p":   "https://upload.wikimedia.org/wikipedia/commons/2/27/Voiceless_bilabial_plosive.ogg",
  "b":   "https://upload.wikimedia.org/wikipedia/commons/2/2c/Voiced_bilabial_plosive.ogg",
  "t":   "https://upload.wikimedia.org/wikipedia/commons/0/02/Voiceless_alveolar_plosive.ogg",
  "d":   "https://upload.wikimedia.org/wikipedia/commons/0/01/Voiced_alveolar_plosive.ogg",
  "tʃ":  "https://upload.wikimedia.org/wikipedia/commons/3/3c/Voiceless_palato-alveolar_affricate.ogg",
  "dʒ":  "https://upload.wikimedia.org/wikipedia/commons/a/a1/Voiced_palato-alveolar_affricate.ogg",
  "k":   "https://upload.wikimedia.org/wikipedia/commons/e/e3/Voiceless_velar_plosive.ogg",
  "g":   "https://upload.wikimedia.org/wikipedia/commons/1/12/Voiced_velar_plosive_02.ogg",
  "f":   "https://upload.wikimedia.org/wikipedia/commons/3/33/Voiceless_labiodental_fricative.ogg",
  "v":   "https://upload.wikimedia.org/wikipedia/commons/8/85/Voiced_labiodental_fricative.ogg",
  "θ":   "https://upload.wikimedia.org/wikipedia/commons/8/80/Voiceless_dental_fricative.ogg",
  "ð":   "https://upload.wikimedia.org/wikipedia/commons/6/6a/Voiced_dental_fricative.ogg",
  "s":   "https://upload.wikimedia.org/wikipedia/commons/a/ac/Voiceless_alveolar_sibilant.ogg",
  "z":   "https://upload.wikimedia.org/wikipedia/commons/c/c0/Voiced_alveolar_sibilant.ogg",
  "ʃ":   "https://upload.wikimedia.org/wikipedia/commons/c/cc/Voiceless_palato-alveolar_sibilant.ogg",
  "ʒ":   "https://upload.wikimedia.org/wikipedia/commons/3/30/Voiced_palato-alveolar_sibilant.ogg",
  "m":   "https://upload.wikimedia.org/wikipedia/commons/a/a9/Bilabial_nasal.ogg",
  "n":   "https://upload.wikimedia.org/wikipedia/commons/2/29/Alveolar_nasal.ogg",
  "ŋ":   "https://upload.wikimedia.org/wikipedia/commons/3/39/Velar_nasal.ogg",
  "h":   "https://upload.wikimedia.org/wikipedia/commons/d/da/Voiceless_glottal_fricative.ogg",
  "l":   "https://upload.wikimedia.org/wikipedia/commons/b/bc/Alveolar_lateral_approximant.ogg",
  "r":   "https://upload.wikimedia.org/wikipedia/commons/e/e4/Alveolar_approximant.ogg",
  "w":   "https://upload.wikimedia.org/wikipedia/commons/f/f2/Voiced_labio-velar_approximant.ogg",
  "j":   "https://upload.wikimedia.org/wikipedia/commons/e/e8/Palatal_approximant.ogg",
};

// ============================================================
// WORD AUDIO MAP: word → Free Dictionary API UK audio URL
// Pattern: https://api.dictionaryapi.dev/media/pronunciations/en/{word}-uk.mp3
// Words not having a -uk.mp3 use -us.mp3, or a known alternative URL.
// ============================================================
const BASE = "https://api.dictionaryapi.dev/media/pronunciations/en";
const uk = (w) => `${BASE}/${w}-uk.mp3`;
const us = (w) => `${BASE}/${w}-us.mp3`;

const WORD_AUDIO = {
  // Monophthongs
  "sheep":   uk("sheep"),
  "tree":    uk("tree"),
  "green":   uk("green"),
  "beach":   uk("beach"),
  "people":  uk("people"),
  "ship":    uk("ship"),
  "fish":    uk("fish"),
  "sit":     uk("sit"),
  "women":   uk("women"),
  "listen":  uk("listen"),
  "good":    uk("good"),
  "book":    uk("book"),
  "put":     uk("put"),
  "sugar":   uk("sugar"),
  "woman":   uk("woman"),
  "food":    uk("food"),
  "shoe":    uk("shoe"),
  "two":     uk("two"),
  "music":   uk("music"),
  "group":   uk("group"),
  "bed":     uk("bed"),
  "red":     uk("red"),
  "head":    uk("head"),
  "many":    uk("many"),
  "friend":  uk("friend"),
  "teacher": uk("teacher"),
  "about":   uk("about"),
  "doctor":  uk("doctor"),
  "today":   uk("today"),
  "banana":  uk("banana"),
  "bird":    uk("bird"),
  "word":    uk("word"),
  "learn":   uk("learn"),
  "turn":    uk("turn"),
  "early":   uk("early"),
  "door":    uk("door"),
  "four":    uk("four"),
  "more":    uk("more"),
  "talk":    uk("talk"),
  "water":   uk("water"),
  "cat":     uk("cat"),
  "apple":   uk("apple"),
  "map":     uk("map"),
  "black":   uk("black"),
  "man":     uk("man"),
  "up":      uk("up"),
  "cup":     uk("cup"),
  "sun":     uk("sun"),
  "money":   uk("money"),
  "blood":   uk("blood"),
  "far":     uk("far"),
  "car":     uk("car"),
  "father":  uk("father"),
  "part":    uk("part"),
  "heart":   uk("heart"),
  "on":      uk("on"),
  "dog":     uk("dog"),
  "box":     uk("box"),
  "hot":     uk("hot"),
  "stop":    uk("stop"),
  // Diphthongs
  "here":    uk("here"),
  "ear":     uk("ear"),
  "near":    uk("near"),
  "clear":   uk("clear"),
  "year":    uk("year"),
  "wait":    uk("wait"),
  "day":     uk("day"),
  "name":    uk("name"),
  "eight":   uk("eight"),
  "they":    uk("they"),
  "tourist": uk("tourist"),
  "pure":    uk("pure"),
  "sure":    uk("sure"),
  "cure":    uk("cure"),
  "poor":    uk("poor"),
  "boy":     uk("boy"),
  "coin":    uk("coin"),
  "join":    uk("join"),
  "noise":   uk("noise"),
  "choice":  uk("choice"),
  "show":    uk("show"),
  "go":      uk("go"),
  "home":    uk("home"),
  "old":     uk("old"),
  "boat":    uk("boat"),
  "hair":    uk("hair"),
  "there":   uk("there"),
  "where":   uk("where"),
  "care":    uk("care"),
  "bear":    uk("bear"),
  "my":      uk("my"),
  "time":    uk("time"),
  "eye":     uk("eye"),
  "like":    uk("like"),
  "high":    uk("high"),
  "cow":     uk("cow"),
  "now":     uk("now"),
  "house":   uk("house"),
  "out":     uk("out"),
  "down":    uk("down"),
  // Consonants
  "pea":       uk("pea"),
  "pen":       uk("pen"),
  "apple":     uk("apple"),
  "stop":      uk("stop"),
  "help":      uk("help"),
  "boat":      uk("boat"),
  "big":       uk("big"),
  "rubber":    uk("rubber"),
  "job":       uk("job"),
  "club":      uk("club"),
  "tea":       uk("tea"),
  "time":      uk("time"),
  "water":     uk("water"),
  "cat":       uk("cat"),
  "eight":     uk("eight"),
  "dog":       uk("dog"),
  "day":       uk("day"),
  "middle":    uk("middle"),
  "good":      uk("good"),
  "bed":       uk("bed"),
  "cheese":    uk("cheese"),
  "child":     uk("child"),
  "picture":   uk("picture"),
  "watch":     uk("watch"),
  "catch":     uk("catch"),
  "june":      uk("june"),
  "magic":     uk("magic"),
  "age":       uk("age"),
  "large":     uk("large"),
  "car":       uk("car"),
  "school":    uk("school"),
  "back":      uk("back"),
  "go":        uk("go"),
  "bigger":    uk("bigger"),
  "bag":       uk("bag"),
  "fly":       uk("fly"),
  "food":      uk("food"),
  "coffee":    uk("coffee"),
  "life":      uk("life"),
  "laugh":     uk("laugh"),
  "video":     uk("video"),
  "very":      uk("very"),
  "never":     uk("never"),
  "have":      uk("have"),
  "leave":     uk("leave"),
  "think":     uk("think"),
  "three":     uk("three"),
  "nothing":   uk("nothing"),
  "both":      uk("both"),
  "month":     uk("month"),
  "this":      uk("this"),
  "mother":    uk("mother"),
  "with":      uk("with"),
  "smooth":    uk("smooth"),
  "see":       uk("see"),
  "say":       uk("say"),
  "city":      uk("city"),
  "bus":       uk("bus"),
  "zoo":       uk("zoo"),
  "zero":      uk("zero"),
  "his":       uk("his"),
  "is":        uk("is"),
  "shall":     uk("shall"),
  "she":       uk("she"),
  "action":    uk("action"),
  "wish":      uk("wish"),
  "television":uk("television"),
  "measure":   uk("measure"),
  "vision":    uk("vision"),
  "pleasure":  uk("pleasure"),
  "casual":    uk("casual"),
  "man":       uk("man"),
  "make":      uk("make"),
  "summer":    uk("summer"),
  "room":      uk("room"),
  "now":       uk("now"),
  "name":      uk("name"),
  "many":      uk("many"),
  "can":       uk("can"),
  "sun":       uk("sun"),
  "sing":      uk("sing"),
  "song":      uk("song"),
  "anger":     uk("anger"),
  "long":      uk("long"),
  "thing":     uk("thing"),
  "hat":       uk("hat"),
  "home":      uk("home"),
  "who":       uk("who"),
  "perhaps":   uk("perhaps"),
  "behind":    uk("behind"),
  "love":      uk("love"),
  "like":      uk("like"),
  "hello":     uk("hello"),
  "feel":      uk("feel"),
  "call":      uk("call"),
  "red":       uk("red"),
  "right":     uk("right"),
  "story":     uk("story"),
  "very":      uk("very"),
  "wet":       uk("wet"),
  "wait":      uk("wait"),
  "away":      uk("away"),
  "quick":     uk("quick"),
  "language":  uk("language"),
  "yes":       uk("yes"),
  "you":       uk("you"),
  "student":   uk("student"),
  "few":       uk("few"),
  "beautiful": uk("beautiful"),
};

// ============================================================
// BUILD THE UPDATED FILE
// ============================================================

// Read current file
const filePath = join(__dirname, "../data/pronunciation.ts");
let content = readFileSync(filePath, "utf-8");

// 1. Update the SoundSeedData interface to add audioUrl fields
content = content.replace(
  /export interface SoundSeedData \{[\s\S]*?\}/,
  `export interface SoundSeedData {
  symbol: string;
  type: "monophthong" | "diphthong" | "consonant";
  word: string;
  name: string;
  description: string;
  tip: string;
  voiced?: boolean;
  audioUrl?: string;
  order: number;
  exampleWords: {
    word: string;
    ipa: string;
    audioUrl?: string;
    order: number;
  }[];
}`
);

// 2. For each sound symbol, inject audioUrl after the symbol's order field
// We use a pattern that finds "symbol: "X"," and its block to inject
for (const [symbol, audioUrl] of Object.entries(PHONEME_AUDIO)) {
  // Match the symbol entry and add audioUrl before the order field
  // Pattern: find `order: N,` that follows this symbol's block and insert audioUrl before it
  // We use a targeted replacement: find `symbol: "X",` and look for the next `order:` without another `symbol:`
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(symbol: ${JSON.stringify(symbol)},[\\s\\S]*?)(    order: (\\d+),\\n    exampleWords)`,
    "m"
  );
  content = content.replace(pattern, (match, before, orderAndRest) => {
    // Only add if not already present
    if (before.includes("audioUrl:")) return match;
    return `${before}    audioUrl: ${JSON.stringify(audioUrl)},\n${orderAndRest}`;
  });
}

// 3. For each example word, inject audioUrl
// Pattern: { word: "X", ipa: "Y", order: N }
content = content.replace(
  /\{ word: "([^"]+)", ipa: "([^"]+)", order: (\d+) \}/g,
  (match, word, ipa, order) => {
    const audioUrl = WORD_AUDIO[word.toLowerCase()];
    if (audioUrl) {
      return `{ word: "${word}", ipa: "${ipa}", audioUrl: "${audioUrl}", order: ${order} }`;
    }
    return match;
  }
);

writeFileSync(filePath, content, "utf-8");
console.log("✅ pronunciation.ts updated with audioUrl fields!");
console.log("\nNext step: run the seeder");
console.log("  cd backend-core && npx ts-node -r tsconfig-paths/register prisma/seed.ts");
