# Phase 1: Data Scraping Pipeline

> **Goal**: Fetch all IELTS speaking test prompts from engnovate.com and produce a single JSON seed file at `backend-core/prisma/data/ielts-advanced-compiled/speaking-parts.json`.

> **Depends on**: Nothing (standalone)

---

## 1. Prerequisites

```bash
cd backend-core
npm install cheerio   # HTML parser (already installed from writing scraper)
```

---

## 2. Script Location

Create: `backend-core/prisma/scripts/scrape-engnovate-speaking.mjs`

---

## 3. Architecture

```
WP REST API (metadata + categories) ─┐
                                      ├─► Transform ─► speaking-parts.json
HTML Page (question texts)           ─┘
```

### Step-by-Step Flow

```
1. GET /wp-json/wp/v2/ielts_speaking_test_category → all categories (cache)
2. GET /wp-json/wp/v2/ielts_speaking_test?per_page=100&page=1..N → all tests
3. Filter: keep ONLY "full test" slugs (exclude slugs ending in "-part-1", "-part-2", "-part-3")
4. For each full test:
   GET https://engnovate.com/ielts-speaking-tests/{slug}/ → HTML
   Parse question texts from DOM
5. Split questions into Part 1 (first 4), Part 2 (cue card), Part 3 (remaining)
6. Parse slug → extract source, bookNumber, testNumber
7. Detect topic from question text content
8. Write 3 entries per test (one per part) to output JSON
```

---

## 4. API Details

### 4.1. Fetch All Tests (Paginated)

```
BASE = "https://engnovate.com/wp-json/wp/v2"

GET {BASE}/ielts_speaking_test?per_page=100&page={page}&_fields=id,slug,title,ielts_speaking_test_category
```

**Response shape per item:**
```json
{
  "id": 3134123,
  "slug": "ielts-recent-actual-test-6-general-training-speaking-test-6",
  "title": { "rendered": "IELTS Recent Actual Test 6 General Training Speaking Test 6" },
  "ielts_speaking_test_category": [1651]
}
```

**Pagination**: Keep fetching `page++` until the response array is empty or the `X-WP-TotalPages` header is exceeded.

> **Note**: Unlike writing tests, speaking tests have **no `featured_media`** — there are no images to resolve.

### 4.2. Category Map (Hardcoded)

```javascript
const CATEGORY_MAP = {
  1545: { name: 'Cambridge Academic', slug: 'cambridge-academic' },
  1622: { name: 'Cambridge General', slug: 'cambridge-general' },
  1645: { name: 'Forecast Academic', slug: 'forecast-academic' },
  1648: { name: 'Forecast General', slug: 'forecast-general' },
  1637: { name: 'Official Guide Academic', slug: 'official-guide-to-ielts-academic' },
  1649: { name: 'Official Guide General', slug: 'official-guide-to-ielts-general' },
  1633: { name: 'Practice Test Plus Academic', slug: 'practice-test-plus-academic' },
  1650: { name: 'Practice Test Plus General', slug: 'practice-test-plus-general' },
  1641: { name: 'Recent Actual Tests Academic', slug: 'recent-actual-tests-academic' },
  1651: { name: 'Recent Actual Tests General', slug: 'recent-actual-tests-general' },
};
```

### 4.3. Filtering: Full Tests Only

Engnovate stores speaking tests in TWO formats:
- **Full Test pages**: `cambridge-ielts-20-academic-speaking-test-4` → contains all 11 questions
- **Per-Part pages**: `cambridge-ielts-20-academic-speaking-test-4-part-1` → duplicate subset

**Filter logic:**
```javascript
function isFullTest(slug) {
  // Exclude per-part pages (they end with -part-1, -part-2, -part-3)
  return !/-part-[123]$/.test(slug);
}
```

This filters ~340 total tests down to approximately **~115 full tests** (the rest are per-part duplicates).

---

## 5. HTML Parsing Logic

### 5.1. Fetch the Page

```
GET https://engnovate.com/ielts-speaking-tests/{slug}/
```

### 5.2. Parse Question Texts

The page structure observed from `cambridge-ielts-20-academic-speaking-test-4`:

Questions are rendered as plain text blocks separated by `### Enhanced Speech Comparison` headings. The actual question text appears in the content area before each heading.

```javascript
import * as cheerio from 'cheerio';

function parseQuestions(html, slug) {
  const $ = cheerio.load(html);

  // Strategy: find the content area and extract question text blocks
  // The questions appear as text nodes between navigation elements
  // Look for the main content area after the breadcrumb

  const allText = [];

  // Try to find paragraphs or text blocks in the entry content
  const contentArea = $('article .entry-content, .site-content .entry-content, .ast-post-format-');

  // Get all direct text-bearing elements
  contentArea.find('p, div.question-text, .speaking-question').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 15 && !text.includes('Enhanced Speech') && !text.includes('Export')) {
      allText.push(text);
    }
  });

  // Fallback: if content area parsing yields nothing,
  // try extracting from the raw page text between known delimiters
  if (allText.length === 0) {
    // The questions appear between the breadcrumb/nav and the comments section
    // Look for question-like text patterns
    const bodyText = $('body').text();
    const lines = bodyText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 15)
      .filter(l =>
        l.includes('?') ||
        l.includes('Describe') ||
        l.includes('You should say') ||
        l.includes('and explain')
      )
      .filter(l =>
        !l.includes('Enhanced Speech') &&
        !l.includes('Export') &&
        !l.includes('Check it out') &&
        !l.includes('Cambridge IELTS') &&
        !l.includes('Reply') &&
        !l.includes('Comment')
      );
    allText.push(...lines);
  }

  return allText;
}
```

> **Important**: The parsing is fragile because Engnovate renders content dynamically. Log failures and handle them manually. Expect ~80-90% success rate from automated parsing.

### 5.3. Split Questions into Parts

Standard IELTS speaking test structure:
- **Part 1**: First 4 questions (short interview questions with `[Why?]` or `[Why/Why not?]`)
- **Part 2**: 1 cue card (starts with "Describe..." and includes "You should say:")
- **Part 3**: Remaining questions (discussion, typically 4-7 questions)

```javascript
function splitIntoParts(questions) {
  const part1 = [];
  const part2 = [];
  const part3 = [];

  let foundCueCard = false;

  for (const q of questions) {
    const lower = q.toLowerCase();

    // Detect Part 2 cue card
    if (!foundCueCard && (lower.startsWith('describe') || lower.includes('you should say'))) {
      // This is Part 2 — merge consecutive cue card lines
      part2.push(q);
      foundCueCard = true;
      continue;
    }

    // If we've found the cue card, subsequent "you should say" lines belong to it
    if (foundCueCard && part3.length === 0 && (
      lower.startsWith('you should say') ||
      lower.startsWith('what') && !lower.includes('?') ||
      lower.startsWith('who') && !lower.includes('?') ||
      lower.startsWith('where') && !lower.includes('?') ||
      lower.startsWith('when') && !lower.includes('?') ||
      lower.startsWith('how') && !lower.includes('?') ||
      lower.startsWith('and explain') ||
      lower.startsWith('and say')
    )) {
      // Still part of the cue card
      part2[0] = part2[0] + '\n' + q;
      continue;
    }

    if (!foundCueCard) {
      part1.push(q);
    } else {
      part3.push(q);
    }
  }

  // Fallback: if no cue card detected, split by position
  if (part2.length === 0 && questions.length >= 8) {
    return {
      part1: questions.slice(0, 4),
      part2: [questions[4]],
      part3: questions.slice(5),
    };
  }

  return { part1, part2, part3 };
}
```

---

## 6. Slug Parsing Logic

```javascript
function parseSlug(slug) {
  // Pattern 1: Cambridge — "cambridge-ielts-20-academic-speaking-test-4"
  const cambridgeMatch = slug.match(
    /cambridge-ielts-(\d+)-(?:academic|general-training)-speaking-test-(\d+)$/i
  );
  if (cambridgeMatch) {
    return {
      source: `cambridge_${cambridgeMatch[1]}`,
      bookNumber: parseInt(cambridgeMatch[1]),
      testNumber: parseInt(cambridgeMatch[2]),
    };
  }

  // Pattern 2: Practice Test Plus — "ielts-practice-test-plus-2-academic-speaking-test-3"
  const ptpMatch = slug.match(
    /ielts-practice-test-plus-(\d+)-(?:academic|general-training)-speaking-test-(\d+)$/
  );
  if (ptpMatch) {
    return {
      source: `practice_test_plus_${ptpMatch[1]}`,
      bookNumber: parseInt(ptpMatch[1]),
      testNumber: parseInt(ptpMatch[2]),
    };
  }

  // Pattern 3: Recent Actual Tests — "ielts-recent-actual-test-1-academic-speaking-test-2"
  const ratMatch = slug.match(
    /ielts-recent-actual-test-(\d+)-(?:academic|general-training)-speaking-test-(\d+)$/
  );
  if (ratMatch) {
    return {
      source: `recent_actual_${ratMatch[1]}`,
      bookNumber: parseInt(ratMatch[1]),
      testNumber: parseInt(ratMatch[2]),
    };
  }

  // Pattern 4: Forecast — "ielts-forecast-academic-speaking-test-5"
  const forecastMatch = slug.match(
    /ielts-forecast-(?:academic|general-training)-speaking-test-(\d+)$/
  );
  if (forecastMatch) {
    return {
      source: 'forecast',
      bookNumber: null,
      testNumber: parseInt(forecastMatch[1]),
    };
  }

  // Pattern 5: Official Guide — "official-cambridge-guide-to-ielts-academic-speaking-test-2"
  const ogMatch = slug.match(
    /official-cambridge-guide-to-ielts-(?:academic|general-training)-speaking-test-(\d+)$/
  );
  if (ogMatch) {
    return {
      source: 'official_guide',
      bookNumber: null,
      testNumber: parseInt(ogMatch[1]),
    };
  }

  return { source: 'unknown', bookNumber: null, testNumber: null };
}
```

### Topic Detection (from question text)

```javascript
function detectTopic(questions) {
  const combined = questions.map(q => q.toLowerCase()).join(' ');

  const TOPIC_KEYWORDS = {
    'Technology': ['technology', 'computer', 'internet', 'social media', 'phone', 'digital', 'online'],
    'Education': ['school', 'university', 'study', 'learn', 'teacher', 'education', 'student'],
    'Health': ['health', 'exercise', 'diet', 'sport', 'fitness', 'medical', 'doctor'],
    'Environment': ['environment', 'pollution', 'climate', 'nature', 'wildlife', 'recycl'],
    'Travel': ['travel', 'trip', 'holiday', 'visit', 'tourist', 'journey', 'country'],
    'Work': ['work', 'job', 'career', 'employ', 'office', 'business', 'profession'],
    'Family': ['family', 'parent', 'children', 'sibling', 'relative', 'marriage'],
    'Culture': ['culture', 'tradition', 'festival', 'customs', 'heritage', 'celebration'],
    'Media': ['news', 'newspaper', 'media', 'television', 'radio', 'magazine', 'journalism'],
    'Food': ['food', 'cook', 'restaurant', 'meal', 'eat', 'diet', 'cuisine'],
    'Housing': ['house', 'home', 'apartment', 'neighbourhood', 'city', 'town', 'live'],
    'Personal Qualities': ['personal', 'qualities', 'character', 'personality', 'friend'],
    'Leisure': ['hobby', 'leisure', 'free time', 'entertainment', 'relax', 'enjoy'],
  };

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => combined.includes(kw))) {
      return topic;
    }
  }

  return 'General';
}
```

---

## 7. Rate Limiting

```javascript
const DELAY_MS = 1500; // 1.5s between requests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
```

> The API rate-limits at ~30 requests/minute (429 status). Use 1.5s delays between each request. Implement retry with exponential backoff on 429.

---

## 8. Output Schema

File: `backend-core/prisma/data/ielts-advanced-compiled/speaking-parts.json`

Each full test produces **3 entries** (one per part):

```json
[
  {
    "engnovateSlug": "cambridge-ielts-20-academic-speaking-test-4",
    "partNumber": 1,
    "partType": "interview",
    "topic": "Personal Qualities",
    "source": "cambridge_20",
    "category": "cambridge-academic",
    "bookNumber": 20,
    "testNumber": 4,
    "title": "Cambridge IELTS 20 Academic Speaking Test 4 — Part 1",
    "questions": [
      { "text": "What do you think your best personal qualities are? [Why?]" },
      { "text": "Do you have the same personal qualities as your parents? [Why/Why not?]" },
      { "text": "What personal qualities are important to you in a friend? [Why?]" },
      { "text": "Do you think you have the personal qualities to be a good/successful leader? [Why/Why not?]" }
    ]
  },
  {
    "engnovateSlug": "cambridge-ielts-20-academic-speaking-test-4",
    "partNumber": 2,
    "partType": "cue_card",
    "topic": "News Discussion",
    "source": "cambridge_20",
    "category": "cambridge-academic",
    "bookNumber": 20,
    "testNumber": 4,
    "title": "Cambridge IELTS 20 Academic Speaking Test 4 — Part 2",
    "questions": [
      {
        "text": "Describe a time when you had a long discussion about a news story.\nYou should say:\n  what the news story was about\n  who you discussed this news story with\n  what people's opinions were\nand explain why you had such a long discussion about this news story."
      }
    ]
  },
  {
    "engnovateSlug": "cambridge-ielts-20-academic-speaking-test-4",
    "partNumber": 3,
    "partType": "discussion",
    "topic": "News & Media",
    "source": "cambridge_20",
    "category": "cambridge-academic",
    "bookNumber": 20,
    "testNumber": 4,
    "title": "Cambridge IELTS 20 Academic Speaking Test 4 — Part 3",
    "questions": [
      { "text": "How do most people find out about the news in your country?" },
      { "text": "Are people more interested in local news than national news?" },
      { "text": "How important is it to know about international news?" },
      { "text": "Why are discussion programmes involving members of the public popular on TV and radio?" }
    ]
  }
]
```

---

## 9. Filtering Rules

- **SKIP** tests where `isFullTest(slug)` returns false (per-part duplicates)
- **SKIP** General Training tests (categories `1622`, `1648`, `1649`, `1650`, `1651`) — focus on **Academic only** for the thesis
- **INCLUDE**: Cambridge Academic (`1545`), Forecast Academic (`1645`), Official Guide Academic (`1637`), Practice Test Plus Academic (`1633`), Recent Actual Tests Academic (`1641`)

> This filters from ~340 total down to approximately **~55–60 full Academic tests**, producing **~165–180 part entries** (3 per test).

---

## 10. Error Handling

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 2000;
        console.warn(`Rate limited, waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      await sleep(2000);
    }
  }
}
```

---

## 11. Execution

```bash
cd backend-core
node prisma/scripts/scrape-engnovate-speaking.mjs
```

**Expected output:**
```
Fetching categories...
Found 10 categories
Fetching tests page 1... (100 items)
Fetching tests page 2... (100 items)
Fetching tests page 3... (100 items)
Fetching tests page 4... (40 items)
Total: 340 tests
Filtered (Academic + full tests only): ~55 tests
Processing 55 full test pages...
  [1/55] cambridge-ielts-20-academic-speaking-test-4 → 3 parts ✓
  [2/55] cambridge-ielts-20-academic-speaking-test-3 → 3 parts ✓
  ...
Parse failures: ~5 (logged for manual review)
Output: prisma/data/ielts-advanced-compiled/speaking-parts.json (165 entries)
```

---

## 12. Verification Checklist

- [ ] JSON file is valid (parseable)
- [ ] Every entry has non-empty `questions` array
- [ ] Part 1 entries have 3–4 questions each
- [ ] Part 2 entries have exactly 1 question (cue card text)
- [ ] Part 3 entries have 3–7 questions each
- [ ] `partType` is correctly set: `"interview"` for Part 1, `"cue_card"` for Part 2, `"discussion"` for Part 3
- [ ] No duplicate entries (same slug + partNumber combination)
- [ ] `topic` is populated (not "General") for at least 70% of entries
- [ ] All entries have valid `source`, `category`, `bookNumber`, `testNumber`
