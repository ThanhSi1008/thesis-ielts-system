/**
 * Script: fetch-pronunciation-audio.ts
 * 
 * Fetches audio URLs for all pronunciation sounds and their example words.
 * - Example words: Free Dictionary API (https://api.dictionaryapi.dev)
 * - Isolated phonemes: Curated Wikimedia Commons URLs
 * 
 * Run: npx ts-node --project tsconfig.json prisma/scripts/fetch-pronunciation-audio.ts
 */

import { pronunciationSounds } from "../data/pronunciation";
import * as fs from "fs";
import * as path from "path";

const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en";
const DELAY_MS = 250;

// Manually curated: IPA symbol → Wikimedia Commons audio URL (isolated phoneme recordings)
const PHONEME_AUDIO_MAP: Record<string, string> = {
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
  // Diphthongs
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWordAudio(word: string): Promise<string | null> {
  try {
    const res = await fetch(`${DICT_API}/${encodeURIComponent(word)}`);
    if (!res.ok) {
      console.log(`  ⚠  No entry for "${word}" (${res.status})`);
      return null;
    }
    const json = await res.json() as any[];
    const phonetics = json[0]?.phonetics ?? [];

    // Prefer UK audio
    const uk = phonetics.find((p: any) => p.audio && p.audio.includes("-uk"));
    if (uk?.audio) return uk.audio;

    // Fall back to any non-empty audio
    const any = phonetics.find((p: any) => p.audio);
    if (any?.audio) return any.audio;

    console.log(`  ⚠  No audio found for "${word}"`);
    return null;
  } catch (err) {
    console.error(`  ❌ Error fetching "${word}":`, err);
    return null;
  }
}

async function main() {
  console.log("🎵 Fetching pronunciation audio URLs...\n");

  // Track all unique words to avoid duplicate API calls
  const wordAudioCache = new Map<string, string | null>();

  // Gather all unique words across all sounds
  const allWords = new Set<string>();
  for (const sound of pronunciationSounds) {
    for (const ew of sound.exampleWords) {
      allWords.add(ew.word.toLowerCase());
    }
  }

  console.log(`📚 Fetching audio for ${allWords.size} unique words...\n`);

  for (const word of allWords) {
    if (wordAudioCache.has(word)) continue;
    process.stdout.write(`  Fetching "${word}"... `);
    const audioUrl = await fetchWordAudio(word);
    wordAudioCache.set(word, audioUrl);
    console.log(audioUrl ? `✓ ${audioUrl.split("/").pop()}` : "✗ not found");
    await sleep(DELAY_MS);
  }

  // Build updated data
  const lines: string[] = [];
  lines.push(`export interface SoundSeedData {`);
  lines.push(`  symbol: string;`);
  lines.push(`  type: "monophthong" | "diphthong" | "consonant";`);
  lines.push(`  word: string;`);
  lines.push(`  name: string;`);
  lines.push(`  description: string;`);
  lines.push(`  tip: string;`);
  lines.push(`  voiced?: boolean;`);
  lines.push(`  audioUrl?: string;`);
  lines.push(`  order: number;`);
  lines.push(`  exampleWords: {`);
  lines.push(`    word: string;`);
  lines.push(`    ipa: string;`);
  lines.push(`    audioUrl?: string;`);
  lines.push(`    order: number;`);
  lines.push(`  }[];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const pronunciationSounds: SoundSeedData[] = [`);

  // Group by type for comments
  let lastType = "";
  for (const sound of pronunciationSounds) {
    if (sound.type !== lastType) {
      const label = sound.type === "monophthong" ? "Monophthongs" : sound.type === "diphthong" ? "Diphthongs" : "Consonants";
      lines.push(`  // ${label}`);
      lastType = sound.type;
    }

    const phonemeAudio = PHONEME_AUDIO_MAP[sound.symbol];
    if (!phonemeAudio) {
      console.warn(`  ⚠  No phoneme audio mapped for symbol: ${sound.symbol}`);
    }

    lines.push(`  {`);
    lines.push(`    symbol: ${JSON.stringify(sound.symbol)},`);
    lines.push(`    type: ${JSON.stringify(sound.type)},`);
    lines.push(`    word: ${JSON.stringify(sound.word)},`);
    lines.push(`    name: ${JSON.stringify(sound.name)},`);
    lines.push(`    description: ${JSON.stringify(sound.description)},`);
    lines.push(`    tip: ${JSON.stringify(sound.tip)},`);
    if (sound.voiced !== undefined) lines.push(`    voiced: ${sound.voiced},`);
    if (phonemeAudio) lines.push(`    audioUrl: ${JSON.stringify(phonemeAudio)},`);
    lines.push(`    order: ${sound.order},`);
    lines.push(`    exampleWords: [`);
    for (const ew of sound.exampleWords) {
      const wordAudio = wordAudioCache.get(ew.word.toLowerCase());
      if (wordAudio) {
        lines.push(`      { word: ${JSON.stringify(ew.word)}, ipa: ${JSON.stringify(ew.ipa)}, audioUrl: ${JSON.stringify(wordAudio)}, order: ${ew.order} },`);
      } else {
        lines.push(`      { word: ${JSON.stringify(ew.word)}, ipa: ${JSON.stringify(ew.ipa)}, order: ${ew.order} },`);
      }
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }

  lines.push(`];`);
  lines.push(``);

  const outputPath = path.join(__dirname, "../data/pronunciation.ts");
  fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");

  const foundCount = [...wordAudioCache.values()].filter(Boolean).length;
  console.log(`\n✅ Done! ${foundCount}/${wordAudioCache.size} word audio URLs found.`);
  console.log(`📝 Updated: ${outputPath}`);
  console.log(`\nNext step: npx prisma db seed`);
}

main().catch(console.error);
