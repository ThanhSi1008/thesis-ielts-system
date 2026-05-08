# Plan: Scrape "4000 Essential English Words" Data

## Discovery Summary

> [!TIP]
> **No actual scraping/crawling needed!** All data lives in a single, public JSON file per book.

The website loads all its data from a single JSON endpoint:

```
https://www.essentialenglish.review/apps-data/4000-essential-english-words-{N}/data/data.json
```

Where `{N}` is the book number (1–6). I've already downloaded and verified Book 1's file — it's **716 KB** and contains **all 30 units** with complete word lists, exercises, stories, and reading comprehension questions.

---

## Current State vs. Target

| Aspect | Current `vocabulary.ts` | Target |
|---|---|---|
| Books | 6 books (titles only for 2–6) | 6 books, all fully populated |
| Units per book | 6 per book (incomplete) | **30 per book** (180 total) |
| Unit 1 data | ✅ Words, exercises, questions, story | Same, but using **original** textbook definitions |
| Unit 2 data | ⚠️ Words only (wrong words — uses "allow, apart, beside..." instead of the real "adventure, approach, carefully...") | Full data from source |
| Units 3–30 | ❌ Title-only stubs | Fully populated |

> [!WARNING]
> **Your current Unit 2 data is incorrect.** The real Unit 2 words are "adventure, approach, carefully, chemical, create, evil, experiment, kill, laboratory, laugh, loud, nervous, noise, project, scare, secret, shout, smell, terrible, worse" — not "allow, apart, beside, cabinet, charge...". The current data appears to be hand-crafted or from a different source.

---

## Data Available per Unit (from JSON)

Each unit in the JSON file provides:

### 1. Word List (`wordlist[]`) — 20 words per unit
| Field | Example | Maps to your schema |
|---|---|---|
| `en` | `"afraid"` | `VocabularyWord.word` |
| `pron` | `"[əˈfreid] adj."` | Parse → `VocabularyWord.ipa` + `VocabularyWord.partOfSpeech` |
| `desc` | `"When someone is afraid, they feel fear."` | `VocabularyWord.meaning` |
| `exam` | `"The woman was <strong>afraid</strong> of what she saw."` | Strip HTML → `VocabularyWord.example` |
| `image` | `"21986.jpg"` | Full URL: `https://www.essentialenglish.review/apps-data/4000-essential-english-words-1/data/unit-1-the-lion-and-the-rabbit/wordlist/21986.jpg` → `VocabularyWord.imageUrl` |
| `sound` | `"21986.mp3"` | Full URL pattern → `VocabularyWord.audioUrl` |

### 2. Exercises (`exercise[]`) — HTML-encoded quiz content
- Contains Exercise 1 (Part A: definition→word, Part B: word→definition)
- Contains Exercise 2 (sentence completion)
- Contains Answer Key
- Exercises are embedded as **HTML** with `answer-index` attributes for correct answers
- Need to parse HTML to extract structured `VocabularyExercise` records

### 3. Reading / Story (`reading[]`)
- **Story entry** (`type: "story"`): title, full story HTML with bold vocabulary words, image, audio
- **Reading Comprehension** (`type: "faq"`): 4 multiple-choice questions + 1 fill-blank question with answers encoded in `answer-index` attributes
- **Answer Key**: Separate verification entry

### 4. Media URLs
Images and audio follow a predictable pattern:
```
Base: /apps-data/4000-essential-english-words-{N}/data/

Word media:  {base}{url-friendly-unit-name}/wordlist/{filename}
Story media: {base}{url-friendly-unit-name}/reading/{filename}
```

---

## Implementation Plan

### Phase 1: Download All 6 JSON Files
```powershell
# Book 1 already downloaded, get 2–6
foreach ($i in 2..6) {
  Invoke-WebRequest -Uri "https://www.essentialenglish.review/apps-data/4000-essential-english-words-$i/data/data.json" `
    -OutFile ".\_extras\book${i}_data.json"
}
```

### Phase 2: Create a Node.js Transformation Script

Create `_extras/transform-vocabulary.ts` that:

1. **Reads** each `book{N}_data.json`
2. **Parses** the `pron` field to extract IPA and part of speech separately:
   ```
   "[əˈfreid] adj." → ipa: "/əˈfreid/", partOfSpeech: "adj"
   ```
3. **Strips HTML** from `exam` (example) fields:
   ```
   "The woman was <strong>afraid</strong> of what she saw."
   → "The woman was afraid of what she saw."
   ```
4. **Constructs full image/audio URLs** from relative filenames
5. **Parses exercise HTML** to extract structured quiz data:
   - Extract questions, options, correct answer index from `answer-index` attributes
   - Map to `VocabularyExercise` format (definition-matching only, simplify for your app)
6. **Parses reading comprehension HTML** to extract:
   - Story content (keep HTML with `<strong>` tags for vocab highlighting)
   - Story title, image URL, audio URL
   - Questions with options and answers
7. **Generates** the final `vocabulary.ts` file

### Phase 3: Data Mapping

```
Source JSON                    →  Your Prisma Schema
─────────────────────────────────────────────────────
flashcard[i].en               →  VocabularyUnit title prefix ("Unit 1")
reading[0].en                 →  VocabularyUnit title ("The Lion and the Rabbit")
wordlist[j].en                →  VocabularyWord.word
wordlist[j].pron (parsed)     →  VocabularyWord.ipa + .partOfSpeech
wordlist[j].desc              →  VocabularyWord.meaning
wordlist[j].exam (stripped)   →  VocabularyWord.example
wordlist[j].image (full URL)  →  VocabularyWord.imageUrl
wordlist[j].sound (full URL)  →  VocabularyWord.audioUrl
exercise[0].story (parsed)    →  VocabularyExercise[] (Part A only, 5 questions)
reading[0].story              →  VocabularyUnit.storyContent
reading[0].en                 →  VocabularyUnit.storyTitle
reading[0].image (full URL)   →  VocabularyUnit.storyImageUrl
reading[1].story (parsed)     →  VocabularyQuestion[] (4 MC + 1 fill-blank)
```

### Phase 4: Output Format

The generated `vocabulary.ts` will follow the same structure but be **complete**:
- 6 books × 30 units = **180 units**
- 180 units × 20 words = **3,600 words**
- 180 units × 5 exercises = **900 exercises** (simplified to Part A only)
- 180 units × 5 questions = **900 questions**
- 180 units × 1 story = **180 stories**

### Phase 5: Seed Database

Run the existing seed script which reads from `vocabulary.ts` to populate the Prisma database.

---

## Key Decisions Needed

> [!IMPORTANT]
> Before proceeding, please confirm:

1. **Exercise simplification**: The source has Exercise 1 (Part A + Part B = 10 questions) and Exercise 2 (10 more questions). Currently you only use 5 from Part A. Should I:
   - **(a)** Keep only Part A (5 definition→word questions) as currently?
   - **(b)** Include both Part A and Part B (10 questions)?
   - **(c)** Include all exercises (20+ questions per unit)?

2. **Image hosting**: The source image URLs point to `essentialenglish.review`. Should I:
   - **(a)** Use the source URLs directly (simplest, but depends on external site)?
   - **(b)** Download images and upload to your Cloudinary?

3. **Audio hosting**: Same question for `.mp3` audio files (20 per unit = 3,600 total audio files).

4. **HTML in stories**: The stories contain HTML with `<strong>` tags highlighting vocabulary words and `<p>` tags for paragraphs. Your current `storyContent` already stores HTML. Keep this approach?

5. **Scope**: Should I do all 6 books at once, or start with Book 1 (30 units) and validate before proceeding?
