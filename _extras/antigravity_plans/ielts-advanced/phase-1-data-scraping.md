# Phase 1: Data Scraping Pipeline

> **Goal**: Fetch all IELTS writing test prompts from engnovate.com and produce a single JSON seed file at `backend-core/prisma/data/ielts-advanced-compiled/writing-prompts.json`.

---

## 1. Prerequisites

```bash
cd backend-core
npm install cheerio   # HTML parser (no browser needed)
```

---

## 2. Script Location

Create: `backend-core/prisma/scripts/scrape-engnovate-writing.mjs`

---

## 3. Architecture

```
WP REST API (metadata)  ─┐
                          ├─► Transform ─► writing-prompts.json
HTML Page (prompt text)  ─┘
```

### Step-by-Step Flow

```
1. GET /wp-json/wp/v2/ielts_writing_test_category → all categories (cache)
2. GET /wp-json/wp/v2/ielts_writing_test?per_page=100&page=1..N → all tests
3. For each test with featured_media > 0:
   GET /wp-json/wp/v2/media/{featured_media} → source_url (image)
4. For each test:
   GET https://engnovate.com/ielts-writing-tests/{slug}/ → HTML
   Parse prompt text from DOM
5. Parse slug → extract bookNumber, testNumber, taskNumber
6. Categorize taskType, subType
7. Write output JSON
```

---

## 4. API Details

### 4.1. Fetch All Tests (Paginated)

```
BASE = "https://engnovate.com/wp-json/wp/v2"

GET {BASE}/ielts_writing_test?per_page=100&page={page}&_fields=id,slug,title,featured_media,ielts_writing_test_category
```

**Response shape per item:**
```json
{
  "id": 14944,
  "slug": "cambridge-ielts-13-academic-writing-test-2-task-1",
  "title": { "rendered": "Cambridge IELTS 13 Academic Writing Test 2 (Task 1)" },
  "featured_media": 14938,
  "ielts_writing_test_category": [1546]
}
```

**Pagination**: Keep fetching `page++` until the response array is empty or the `X-WP-TotalPages` header is exceeded.

### 4.2. Resolve Image URL

```
GET {BASE}/media/{featured_media}?_fields=source_url,alt_text
```

**Response:**
```json
{
  "source_url": "https://engnovate.com/wp-content/uploads/2023/08/cambridge-ielts-13-academic-writing-2.jpg",
  "alt_text": "Cambridge IELTS 13 Academic Writing Test 2"
}
```

> **Only Task 1 posts have `featured_media > 0`**. Task 2 posts have `featured_media: 0` (no image).

### 4.3. Parse Prompt Text from HTML

Fetch the page:
```
GET https://engnovate.com/ielts-writing-tests/{slug}/
```

Use `cheerio` to extract prompt text. The prompt text is inside the rendered content area. Try these selectors in order:

```javascript
// Primary: look for the entry content area
const $ = cheerio.load(html);
const contentArea = $('article .entry-content, .ast-post-format-, .site-content .entry-content');

// The prompt text is typically in <p> tags after the title/instructions
// Filter out navigation, ads, related posts
const paragraphs = contentArea.find('p').toArray()
  .map(el => $(el).text().trim())
  .filter(text => text.length > 20 && !text.includes('Related') && !text.includes('Next'));

// The prompt is usually the longest <p> or contains key phrases
const promptText = paragraphs.find(p =>
  p.includes('below') ||
  p.includes('graph') ||
  p.includes('chart') ||
  p.includes('table') ||
  p.includes('diagram') ||
  p.includes('Write about') ||
  p.includes('Some people') ||
  p.includes('Many people') ||
  p.includes('To what extent') ||
  p.includes('Discuss') ||
  p.includes('advantages') ||
  p.length > 50
) || paragraphs[0] || '';
```

> **Fallback**: If HTML parsing fails for a page, log the slug and skip — these can be manually reviewed later.

### 4.4. Category Map (Hardcoded)

```javascript
const CATEGORY_MAP = {
  1546: { name: 'Cambridge Academic', slug: 'cambridge-academic' },
  1623: { name: 'Cambridge General', slug: 'cambridge-general' },
  1644: { name: 'Forecast Academic', slug: 'forecast-academic' },
  1635: { name: 'Official Guide Academic', slug: 'official-guide-academic' },
  1636: { name: 'Official Guide General', slug: 'official-guide-general' },
  1632: { name: 'Practice Test Plus Academic', slug: 'practice-test-plus-academic' },
  1634: { name: 'Practice Test Plus General', slug: 'practice-test-plus-general' },
  1642: { name: 'Recent Actual Tests Academic', slug: 'recent-actual-tests-academic' },
  1643: { name: 'Recent Actual Tests General', slug: 'recent-actual-tests-general' },
};
```

---

## 5. Slug Parsing Logic

The slug follows predictable patterns. Extract metadata from it:

```javascript
function parseSlug(slug) {
  // Pattern 1: Cambridge — "cambridge-ielts-13-academic-writing-test-2-task-1"
  const cambridgeMatch = slug.match(
    /cambridge-ielts-(\d+)-(?:academic|general-training)-writing-test-(\d+)(?:-\(?(task-?\d+)\)?)?$/i
  );
  if (cambridgeMatch) {
    const taskStr = cambridgeMatch[3]; // "task-1" or undefined
    return {
      source: `cambridge_${cambridgeMatch[1]}`,
      bookNumber: parseInt(cambridgeMatch[1]),
      testNumber: parseInt(cambridgeMatch[2]),
      taskNumber: taskStr ? parseInt(taskStr.replace('task-', '')) : null,
    };
  }

  // Pattern 2: Practice Test Plus — "ielts-practice-test-plus-2-academic-writing-test-3"
  const ptpMatch = slug.match(
    /ielts-practice-test-plus-(\d+)-(?:academic|general-training)-writing-test-(\d+)$/
  );
  if (ptpMatch) {
    return {
      source: `practice_test_plus_${ptpMatch[1]}`,
      bookNumber: parseInt(ptpMatch[1]),
      testNumber: parseInt(ptpMatch[2]),
      taskNumber: null,
    };
  }

  // Pattern 3: Recent Actual Tests — "ielts-recent-actual-test-1-academic-writing-test-2"
  const ratMatch = slug.match(
    /ielts-recent-actual-test-(\d+)-(?:academic|general-training)-writing-test-(\d+)$/
  );
  if (ratMatch) {
    return {
      source: `recent_actual_${ratMatch[1]}`,
      bookNumber: parseInt(ratMatch[1]),
      testNumber: parseInt(ratMatch[2]),
      taskNumber: null,
    };
  }

  // Pattern 4: Forecast — "ielts-forecast-academic-writing-test-5"
  const forecastMatch = slug.match(
    /ielts-forecast-(?:academic|general-training)-writing-test-(\d+)$/
  );
  if (forecastMatch) {
    return {
      source: 'forecast',
      bookNumber: null,
      testNumber: parseInt(forecastMatch[1]),
      taskNumber: null,
    };
  }

  // Pattern 5: Official Guide — "official-cambridge-guide-to-ielts-academic-writing-test-2"
  const ogMatch = slug.match(
    /official-cambridge-guide-to-ielts-(?:academic|general-training)-writing-test-(\d+)$/
  );
  if (ogMatch) {
    return {
      source: 'official_guide',
      bookNumber: null,
      testNumber: parseInt(ogMatch[1]),
      taskNumber: null,
    };
  }

  return { source: 'unknown', bookNumber: null, testNumber: null, taskNumber: null };
}
```

### Task Type Detection

```javascript
function detectTaskType(slug, title, featuredMedia) {
  // Explicit task number in slug or title
  if (slug.includes('task-1') || title.includes('Task 1')) return 'TASK_1';
  if (slug.includes('task-2') || title.includes('Task 2')) return 'TASK_2';

  // If it has an image (featured_media), likely Task 1
  if (featuredMedia > 0) return 'TASK_1';

  // Combined pages (no task suffix) should be SKIPPED
  return 'COMBINED';
}
```

### Sub-Type Detection (from prompt text)

```javascript
function detectSubType(taskType, promptText) {
  const lower = promptText.toLowerCase();

  if (taskType === 'TASK_1') {
    if (lower.includes('bar chart') || lower.includes('bar graph')) return 'bar_chart';
    if (lower.includes('line graph') || lower.includes('line chart')) return 'line_graph';
    if (lower.includes('pie chart')) return 'pie_chart';
    if (lower.includes('table')) return 'table';
    if (lower.includes('map')) return 'map';
    if (lower.includes('process') || lower.includes('diagram')) return 'process';
    if (lower.includes('flow')) return 'process';
    return 'mixed';
  }

  if (taskType === 'TASK_2') {
    if (lower.includes('to what extent')) return 'opinion';
    if (lower.includes('discuss both') || lower.includes('discuss the')) return 'discussion';
    if (lower.includes('advantages') && lower.includes('disadvantages')) return 'advantages_disadvantages';
    if (lower.includes('problem') && lower.includes('solution')) return 'problem_solution';
    if (lower.includes('do you agree or disagree')) return 'opinion';
    return 'two_part';
  }

  return 'unknown';
}
```

---

## 6. Rate Limiting

```javascript
const DELAY_MS = 1500; // 1.5s between requests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
```

> The API rate-limits at ~30 requests/minute (429 status). Use 1.5s delays between each request. Implement retry with exponential backoff on 429.

---

## 7. Output Schema

File: `backend-core/prisma/data/ielts-advanced-compiled/writing-prompts.json`

```json
[
  {
    "engnovateId": 14944,
    "engnovateSlug": "cambridge-ielts-13-academic-writing-test-2-task-1",
    "taskType": "TASK_1",
    "subType": "bar_chart",
    "source": "cambridge_13",
    "category": "cambridge-academic",
    "bookNumber": 13,
    "testNumber": 2,
    "title": "Cambridge IELTS 13 Academic Writing Test 2 (Task 1)",
    "prompt": "The bar chart below shows the percentage of Australian men and women in different age groups who did regular physical activity in 2010. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    "imageUrl": "https://engnovate.com/wp-content/uploads/2023/08/cambridge-ielts-13-academic-writing-2.jpg",
    "minimumWords": 150,
    "suggestedTime": 20,
    "difficulty": "medium"
  },
  {
    "engnovateId": 14945,
    "engnovateSlug": "cambridge-ielts-13-academic-writing-test-2-task-2",
    "taskType": "TASK_2",
    "subType": "opinion",
    "source": "cambridge_13",
    "category": "cambridge-academic",
    "bookNumber": 13,
    "testNumber": 2,
    "title": "Cambridge IELTS 13 Academic Writing Test 2 (Task 2)",
    "prompt": "Some people believe that nowadays we have too many choices. To what extent do you agree or disagree with this statement?",
    "imageUrl": null,
    "minimumWords": 250,
    "suggestedTime": 40,
    "difficulty": "medium"
  }
]
```

---

## 8. Filtering Rules

- **SKIP** tests where `taskType === 'COMBINED'` (slug has no `-task-1` or `-task-2` suffix and title has no `(Task 1)` or `(Task 2)`) — these are parent pages linking to individual tasks.
- **SKIP** General Training tests (categories `1623`, `1636`, `1634`, `1643`) — focus on Academic only for the thesis.
- **INCLUDE**: Cambridge Academic (`1546`), Forecast Academic (`1644`), Official Guide Academic (`1635`), Practice Test Plus Academic (`1632`), Recent Actual Tests Academic (`1642`).

> This filters down from 234 to approximately **183 Academic tests**, of which ~80 have individual Task 1/Task 2 pages.

---

## 9. Error Handling

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

## 10. Execution

```bash
cd backend-core
node prisma/scripts/scrape-engnovate-writing.mjs
```

**Expected output:**
```
Fetching categories...
Found 9 categories
Fetching tests page 1... (100 items)
Fetching tests page 2... (100 items)
Fetching tests page 3... (34 items)
Total: 234 tests
Filtered (Academic only): 183 tests
Skipping combined pages: ~40
Processing ~143 individual task pages...
  [1/143] cambridge-ielts-20-academic-writing-test-1-task-1 → TASK_1 bar_chart ✓
  [2/143] cambridge-ielts-20-academic-writing-test-1-task-2 → TASK_2 opinion ✓
  ...
Failed: 0
Output: prisma/data/ielts-advanced-compiled/writing-prompts.json
```

---

## 11. Verification Checklist

- [ ] JSON file is valid (parseable)
- [ ] Every entry has non-empty `prompt` text
- [ ] All `TASK_1` entries have a non-null `imageUrl`
- [ ] All `TASK_2` entries have `imageUrl: null`
- [ ] `minimumWords` is 150 for Task 1, 250 for Task 2
- [ ] `suggestedTime` is 20 for Task 1, 40 for Task 2
- [ ] No duplicate `engnovateSlug` values
- [ ] `subType` is populated (not "unknown") for at least 90% of entries
