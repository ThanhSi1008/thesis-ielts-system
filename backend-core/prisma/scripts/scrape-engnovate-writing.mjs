import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = "https://engnovate.com/wp-json/wp/v2";
const DELAY_MS = 1500;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        console.warn(`Rate limited, waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      await sleep(2000);
    }
  }
}

function parseSlug(slug) {
  const cambridgeMatch = slug.match(
    /cambridge-ielts-(\d+)-(?:academic|general-training)-writing-test-(\d+)(?:-\(?(task-?\d+)\)?)?/i
  );
  if (cambridgeMatch) {
    const taskStr = cambridgeMatch[3];
    return {
      source: `cambridge_${cambridgeMatch[1]}`,
      bookNumber: parseInt(cambridgeMatch[1]),
      testNumber: parseInt(cambridgeMatch[2]),
      taskNumber: taskStr ? parseInt(taskStr.replace('task-', '')) : null,
    };
  }

  const ptpMatch = slug.match(
    /ielts-practice-test-plus-(\d+)-(?:academic|general-training)-writing-test-(\d+)/
  );
  if (ptpMatch) {
    return {
      source: `practice_test_plus_${ptpMatch[1]}`,
      bookNumber: parseInt(ptpMatch[1]),
      testNumber: parseInt(ptpMatch[2]),
      taskNumber: null,
    };
  }

  const ratMatch = slug.match(
    /ielts-recent-actual-test-(\d+)-(?:academic|general-training)-writing-test-(\d+)/
  );
  if (ratMatch) {
    return {
      source: `recent_actual_${ratMatch[1]}`,
      bookNumber: parseInt(ratMatch[1]),
      testNumber: parseInt(ratMatch[2]),
      taskNumber: null,
    };
  }

  const forecastMatch = slug.match(
    /ielts-forecast-(?:academic|general-training)-writing-test-(\d+)/
  );
  if (forecastMatch) {
    return {
      source: 'forecast',
      bookNumber: null,
      testNumber: parseInt(forecastMatch[1]),
      taskNumber: null,
    };
  }

  const ogMatch = slug.match(
    /official-cambridge-guide-to-ielts-(?:academic|general-training)-writing-test-(\d+)/
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

function detectTaskType(slug, title) {
  const lowerTitle = title.toLowerCase();
  const lowerSlug = slug.toLowerCase();
  if (lowerSlug.includes('task-1') || lowerTitle.includes('task 1') || lowerTitle.includes('task-1')) return 'TASK_1';
  if (lowerSlug.includes('task-2') || lowerTitle.includes('task 2') || lowerTitle.includes('task-2')) return 'TASK_2';
  return 'COMBINED';
}

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

async function main() {
  console.log("Fetching writing tests metadata...");
  
  let page = 1;
  const allTests = [];
  
  while (true) {
    console.log(`Fetching tests page ${page}...`);
    const url = `${BASE}/ielts_writing_test?per_page=100&page=${page}&_fields=id,slug,title,featured_media,ielts_writing_test_category`;
    
    try {
      const req = await fetch(url);
      if (req.status === 400 || req.status === 404) break;
      if (!req.ok) {
          if (req.status === 429) {
              await sleep(2000);
              continue;
          }
          throw new Error(`HTTP Error: ${req.status}`);
      }
      
      const data = await req.json();
      if (data.length === 0) break;
      allTests.push(...data);
      page++;
      await sleep(DELAY_MS);
    } catch (err) {
      console.error(err);
      break;
    }
  }

  console.log(`Total: ${allTests.length} tests`);

  const ACADEMIC_CATEGORIES = [1546, 1644, 1635, 1632, 1642];
  let filteredTests = allTests.filter(t => 
    t.ielts_writing_test_category.some(c => ACADEMIC_CATEGORIES.includes(c))
  );
  
  console.log(`Filtered (Academic only): ${filteredTests.length} tests`);

  const results = [];
  let skippedCombined = 0;
  let failed = 0;

  for (let i = 0; i < filteredTests.length; i++) {
    const t = filteredTests[i];
    const title = t.title.rendered;
    const taskType = detectTaskType(t.slug, title);

    if (taskType === 'COMBINED') {
      skippedCombined++;
      continue;
    }

    try {
      const pageUrl = `https://engnovate.com/ielts-writing-tests/${t.slug}/`;
      const html = await fetchHtmlWithRetry(pageUrl);
      const $ = cheerio.load(html);
      
      let imageUrl = null;
      const specificImage = $('img.ielts-writing-image');
      if (specificImage.length > 0) {
        imageUrl = specificImage.first().attr('src');
      }

      let promptText = '';
      const questionEl = $('.ielts-writing-question');
      if (questionEl.length > 0) {
        promptText = questionEl.find('p').toArray().map(el => $(el).text().trim()).join('\n\n');
      }

      if (!promptText) {
        const contentArea = $('article .entry-content, .ast-post-format-, .site-content .entry-content');
        const paragraphs = contentArea.find('p').toArray()
          .map(el => $(el).text().trim())
          .filter(text => text.length > 20 && !text.includes('Related') && !text.includes('Next') && !text.includes('Prev'));

        promptText = paragraphs.find(p =>
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
      }
      
      // Clean up prompt text
      promptText = promptText.replace(/You should spend about \d+ minutes on this task\./gi, '').trim();

      if (!promptText) {
        console.warn(`[WARN] No prompt found for ${t.slug}`);
      }

      const metadata = parseSlug(t.slug);
      const subType = detectSubType(taskType, promptText);
      const primaryCategory = t.ielts_writing_test_category.find(c => CATEGORY_MAP[c]) || 1546;

      results.push({
        engnovateId: t.id,
        engnovateSlug: t.slug,
        taskType,
        subType,
        source: metadata.source,
        category: CATEGORY_MAP[primaryCategory]?.slug || 'cambridge-academic',
        bookNumber: metadata.bookNumber,
        testNumber: metadata.testNumber,
        title,
        prompt: promptText,
        imageUrl: taskType === 'TASK_1' ? imageUrl : null,
        minimumWords: taskType === 'TASK_1' ? 150 : 250,
        suggestedTime: taskType === 'TASK_1' ? 20 : 40,
        difficulty: "medium"
      });

      console.log(`  [${i + 1}/${filteredTests.length}] ${t.slug} → ${taskType} ${subType} ✓`);
      
    } catch (err) {
      console.error(`  [${i + 1}/${filteredTests.length}] Failed ${t.slug}: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`Skipping combined pages: ${skippedCombined}`);
  console.log(`Failed: ${failed}`);
  
  const outPath = path.join(__dirname, '..', 'data', 'ielts-advanced-compiled', 'writing-prompts.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Output: ${outPath} (${results.length} prompts)`);
}

main().catch(console.error);
