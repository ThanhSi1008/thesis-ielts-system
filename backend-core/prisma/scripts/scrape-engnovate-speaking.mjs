import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'https://engnovate.com/wp-json/wp/v2';
const DELAY_MS = 1500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// -----------------------------------------------------------------
// 4.2 Category Map (speaking categories — different IDs from writing)
// -----------------------------------------------------------------
const CATEGORY_MAP = {
  1545: { name: 'Cambridge Academic',             slug: 'cambridge-academic' },
  1622: { name: 'Cambridge General',              slug: 'cambridge-general' },
  1645: { name: 'Forecast Academic',              slug: 'forecast-academic' },
  1648: { name: 'Forecast General',               slug: 'forecast-general' },
  1637: { name: 'Official Guide Academic',        slug: 'official-guide-to-ielts-academic' },
  1649: { name: 'Official Guide General',         slug: 'official-guide-to-ielts-general' },
  1633: { name: 'Practice Test Plus Academic',    slug: 'practice-test-plus-academic' },
  1650: { name: 'Practice Test Plus General',     slug: 'practice-test-plus-general' },
  1641: { name: 'Recent Actual Tests Academic',   slug: 'recent-actual-tests-academic' },
  1651: { name: 'Recent Actual Tests General',    slug: 'recent-actual-tests-general' },
};

// Academic-only category IDs — General Training is skipped
const ACADEMIC_CATEGORIES = [1545, 1645, 1637, 1633, 1641];

// -----------------------------------------------------------------
// 10. Error Handling — fetch JSON with retry + back-off
// -----------------------------------------------------------------
async function fetchJsonWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 2000;
        console.warn(`  Rate limited, waiting ${wait}ms…`);
        await sleep(wait);
        continue;
      }
      if (res.status === 400 || res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      await sleep(2000);
    }
  }
}

async function fetchHtmlWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 2000;
        console.warn(`  Rate limited, waiting ${wait}ms…`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      await sleep(2000);
    }
  }
}

// -----------------------------------------------------------------
// 4.3 Filter: keep only full test pages (exclude per-part duplicates)
// -----------------------------------------------------------------
function isFullTest(slug) {
  return !/-part-[123]$/.test(slug);
}

// Boilerplate phrases that appear on engnovate pages but are NOT questions
const BOILERPLATE_PATTERNS = [
  /enhanced speech/i,
  /export/i,
  /check it out/i,
  /leave a reply/i,
  /related posts/i,
  /reply/i,
  /what to expect from/i,
  /the ielts .+ series consists/i,
  /while not a guarantee/i,
  /suitable for candidates/i,
  /frequently reappear/i,
  /is this grammatically correct/i,
  /cambridge ielts.+band/i,
  /model answer/i,
  /sample answer/i,
  /band score/i,
  /click here/i,
  /advertisement/i,
  /subscribe/i,
  /follow us/i,
  /share this/i,
  /posted in/i,
  /tagged with/i,
];

function isBoilerplate(text) {
  return BOILERPLATE_PATTERNS.some((re) => re.test(text));
}

// Clean "Question 1:", "Q1.", "1." prefixes from questions
function cleanQuestionPrefix(text) {
  return text
    .replace(/^Question\s*\d+[:.]/i, '')
    .replace(/^Q\s*\d+[:.]/i, '')
    .replace(/^\d+[.):]\s+/, '')
    .trim();
}

// -----------------------------------------------------------------
// 5. HTML parsing — extract questions from the page
// -----------------------------------------------------------------
function parseQuestions(html, slug) {
  const $ = cheerio.load(html);
  const allText = [];

  // Primary strategy: look for the article entry-content area
  const contentArea = $('article .entry-content, .site-content .entry-content, .ast-post-format-');

  // Collect relevant text from block-level elements
  contentArea.find('p, li, h3, h4').each((_, el) => {
    const raw = $(el).text().trim();
    if (raw.length < 10) return;
    if (isBoilerplate(raw)) return;

    // Split multi-question paragraphs (e.g., "Q1. ... Q2. ...")
    const subLines = raw
      .split(/(?=Question\s*\d+[:.\s]|\bQ\s*\d+[:.\s])/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);

    for (const sub of subLines) {
      const cleaned = cleanQuestionPrefix(sub);
      if (cleaned.length > 8 && !isBoilerplate(cleaned)) {
        allText.push(cleaned);
      }
    }
  });

  // Fallback: extract from raw body text using heuristics
  if (allText.length < 3) {
    const bodyText = $('body').text();
    const lines = bodyText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 10)
      .filter(
        (l) =>
          l.includes('?') ||
          l.includes('Describe') ||
          l.includes('You should say') ||
          l.includes('and explain') ||
          l.includes('and say')
      )
      .filter((l) => !isBoilerplate(l));

    for (const line of lines) {
      allText.push(cleanQuestionPrefix(line));
    }
  }

  // Final pass: remove long prose lines (> 200 chars) that are clearly boilerplate paragraphs
  const questions = allText.filter((t) => {
    if (t.length > 250 && !t.includes('?') && !t.toLowerCase().includes('describe')) return false;
    return true;
  });

  // Deduplicate while preserving order
  const seen = new Set();
  return questions.filter((t) => {
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });
}

// -----------------------------------------------------------------
// 5.3 Split questions into Part 1 / Part 2 / Part 3
// -----------------------------------------------------------------
function splitIntoParts(questions) {
  const part1 = [];
  const part2 = [];
  const part3 = [];

  let foundCueCard = false;

  for (const q of questions) {
    const lower = q.toLowerCase();

    // Detect Part 2 cue card (starts with "Describe…" or contains "You should say")
    if (
      !foundCueCard &&
      (lower.startsWith('describe') || lower.includes('you should say'))
    ) {
      part2.push(q);
      foundCueCard = true;
      continue;
    }

    // Cue card continuation lines (bullet points / "and explain" etc.)
    if (
      foundCueCard &&
      part3.length === 0 &&
      (lower.startsWith('you should say') ||
        lower.startsWith('and explain') ||
        lower.startsWith('and say') ||
        (lower.startsWith('what') && !lower.includes('?')) ||
        (lower.startsWith('who') && !lower.includes('?')) ||
        (lower.startsWith('where') && !lower.includes('?')) ||
        (lower.startsWith('when') && !lower.includes('?')) ||
        (lower.startsWith('how') && !lower.includes('?')))
    ) {
      part2[0] = part2[0] + '\n' + q;
      continue;
    }

    if (!foundCueCard) {
      part1.push(q);
    } else {
      part3.push(q);
    }
  }

  // Fallback: positional split when cue card was not detected
  if (part2.length === 0 && questions.length >= 8) {
    return {
      part1: questions.slice(0, 4),
      part2: [questions[4]],
      part3: questions.slice(5),
    };
  }

  return { part1, part2, part3 };
}

// -----------------------------------------------------------------
// 6. Slug parsing
// -----------------------------------------------------------------
function parseSlug(slug) {
  // Pattern 1: Cambridge — "cambridge-ielts-20-academic-speaking-test-4"
  const cambridgeMatch = slug.match(
    /cambridge-ielts-(\d+)-(?:academic|general-training)-speaking-test-(\d+)$/i
  );
  if (cambridgeMatch) {
    return {
      source: `cambridge_${cambridgeMatch[1]}`,
      bookNumber: parseInt(cambridgeMatch[1], 10),
      testNumber: parseInt(cambridgeMatch[2], 10),
    };
  }

  // Pattern 2: Practice Test Plus
  const ptpMatch = slug.match(
    /ielts-practice-test-plus-(\d+)-(?:academic|general-training)-speaking-test-(\d+)$/
  );
  if (ptpMatch) {
    return {
      source: `practice_test_plus_${ptpMatch[1]}`,
      bookNumber: parseInt(ptpMatch[1], 10),
      testNumber: parseInt(ptpMatch[2], 10),
    };
  }

  // Pattern 3: Recent Actual Tests
  const ratMatch = slug.match(
    /ielts-recent-actual-test-(\d+)-(?:academic|general-training)-speaking-test-(\d+)$/
  );
  if (ratMatch) {
    return {
      source: `recent_actual_${ratMatch[1]}`,
      bookNumber: parseInt(ratMatch[1], 10),
      testNumber: parseInt(ratMatch[2], 10),
    };
  }

  // Pattern 4: Forecast
  const forecastMatch = slug.match(
    /ielts-forecast-(?:academic|general-training)-speaking-test-(\d+)$/
  );
  if (forecastMatch) {
    return {
      source: 'forecast',
      bookNumber: null,
      testNumber: parseInt(forecastMatch[1], 10),
    };
  }

  // Pattern 5: Official Guide
  const ogMatch = slug.match(
    /official-cambridge-guide-to-ielts-(?:academic|general-training)-speaking-test-(\d+)$/
  );
  if (ogMatch) {
    return {
      source: 'official_guide',
      bookNumber: null,
      testNumber: parseInt(ogMatch[1], 10),
    };
  }

  return { source: 'unknown', bookNumber: null, testNumber: null };
}

// -----------------------------------------------------------------
// Topic Detection
// -----------------------------------------------------------------
const TOPIC_KEYWORDS = {
  Technology:        ['technology', 'computer', 'internet', 'social media', 'phone', 'digital', 'online', 'app', 'device'],
  Education:         ['school', 'university', 'study', 'learn', 'teacher', 'education', 'student', 'course', 'exam'],
  Health:            ['health', 'exercise', 'diet', 'sport', 'fitness', 'medical', 'doctor', 'hospital', 'illness'],
  Environment:       ['environment', 'pollution', 'climate', 'nature', 'wildlife', 'recycl', 'energy', 'green'],
  Travel:            ['travel', 'trip', 'holiday', 'visit', 'tourist', 'journey', 'country', 'abroad', 'destination'],
  Work:              ['work', 'job', 'career', 'employ', 'office', 'business', 'profession', 'salary', 'colleague'],
  Family:            ['family', 'parent', 'children', 'sibling', 'relative', 'marriage', 'grandparent'],
  Culture:           ['culture', 'tradition', 'festival', 'customs', 'heritage', 'celebration', 'art', 'museum'],
  Media:             ['news', 'newspaper', 'media', 'television', 'radio', 'magazine', 'journalism', 'broadcast'],
  Food:              ['food', 'cook', 'restaurant', 'meal', 'eat', 'diet', 'cuisine', 'recipe', 'ingredient'],
  Housing:           ['house', 'home', 'apartment', 'neighbourhood', 'city', 'town', 'live', 'rent', 'building'],
  'Personal Qualities': ['personal', 'qualities', 'character', 'personality', 'friend', 'honest', 'kind', 'leader'],
  Leisure:           ['hobby', 'leisure', 'free time', 'entertainment', 'relax', 'enjoy', 'music', 'film', 'game'],
  'News & Media':    ['discussion', 'news story', 'news programme', 'documentary'],
};

function detectTopic(questions) {
  const combined = questions.map((q) => q.toLowerCase()).join(' ');
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      return topic;
    }
  }
  return 'General';
}

// -----------------------------------------------------------------
// Build a human-readable title for a part entry
// -----------------------------------------------------------------
function buildTitle(rawTitle, partNumber) {
  // rawTitle example: "Cambridge IELTS 20 Academic Speaking Test 4"
  const base = rawTitle
    .replace(/\s*\|.*$/, '')    // Remove site name suffix if any
    .replace(/Speaking Test/i, 'Speaking Test')
    .trim();
  return `${base} — Part ${partNumber}`;
}

// -----------------------------------------------------------------
// Main
// -----------------------------------------------------------------
async function main() {
  console.log('=== IELTS Advanced Speaking Scraper ===\n');

  // ---- Step 1: Fetch all tests (paginated) ----
  console.log('Fetching test metadata from WP REST API…');
  let page = 1;
  const allTests = [];

  while (true) {
    const url = `${BASE}/ielts_speaking_test?per_page=100&page=${page}&_fields=id,slug,title,ielts_speaking_test_category`;
    console.log(`  Fetching page ${page}…`);

    const data = await fetchJsonWithRetry(url);
    if (!data || data.length === 0) break;

    allTests.push(...data);
    page++;
    await sleep(DELAY_MS);
  }

  console.log(`Total tests fetched: ${allTests.length}\n`);

  // ---- Step 2: Filter — Academic + full-test slugs only ----
  const filtered = allTests.filter((t) => {
    const isAcademic = t.ielts_speaking_test_category?.some((c) =>
      ACADEMIC_CATEGORIES.includes(c)
    );
    return isAcademic && isFullTest(t.slug);
  });

  console.log(`Filtered (Academic + full tests only): ${filtered.length} tests\n`);

  // ---- Step 3: Scrape each full test page and split into parts ----
  const results = [];
  let failed = 0;

  for (let i = 0; i < filtered.length; i++) {
    const t = filtered[i];
    const pageUrl = `https://engnovate.com/ielts-speaking-tests/${t.slug}/`;
    const label = `[${i + 1}/${filtered.length}] ${t.slug}`;

    try {
      const html = await fetchHtmlWithRetry(pageUrl);
      const questions = parseQuestions(html, t.slug);

      if (questions.length < 3) {
        console.warn(`  ${label} → too few questions (${questions.length}), skipping`);
        failed++;
        await sleep(DELAY_MS);
        continue;
      }

      const { part1, part2, part3 } = splitIntoParts(questions);
      const metadata = parseSlug(t.slug);
      const primaryCatId =
        t.ielts_speaking_test_category?.find((c) => CATEGORY_MAP[c]) ??
        1545;
      const category = CATEGORY_MAP[primaryCatId]?.slug ?? 'cambridge-academic';
      const rawTitle = t.title?.rendered ?? t.slug;

      const partDefs = [
        { partNumber: 1, partType: 'interview',   questions: part1 },
        { partNumber: 2, partType: 'cue_card',    questions: part2 },
        { partNumber: 3, partType: 'discussion',  questions: part3 },
      ];

      let added = 0;
      for (const def of partDefs) {
        if (def.questions.length === 0) continue;
        const topic = detectTopic(def.questions);
        results.push({
          engnovateSlug: t.slug,
          partNumber:    def.partNumber,
          partType:      def.partType,
          topic,
          source:        metadata.source,
          category,
          bookNumber:    metadata.bookNumber,
          testNumber:    metadata.testNumber,
          title:         buildTitle(rawTitle, def.partNumber),
          questions:     def.questions.map((text) => ({ text })),
        });
        added++;
      }

      console.log(`  ${label} → ${added} parts ✓`);
    } catch (err) {
      console.error(`  ${label} → ERROR: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  // ---- Step 4: Write output ----
  const outPath = path.join(
    __dirname,
    '..',
    'data',
    'ielts-advanced-compiled',
    'speaking-parts.json'
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');

  console.log('\n=== Done ===');
  console.log(`Parse failures: ${failed}`);
  console.log(`Output: ${outPath}`);
  console.log(`Total entries: ${results.length} (${filtered.length - failed} tests × ~3 parts)`);
}

main().catch(console.error);
