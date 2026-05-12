import { readFileSync } from 'fs';

const d = JSON.parse(readFileSync('srt/4000-essential-english-word/book1_data.json', 'utf-8').replace(/^\uFEFF/, ''));
const fc = d.flashcard;

for (let i = 0; i < Math.min(10, fc.length); i++) {
  const u = fc[i];
  if (!u.exercise) continue;
  console.log(`\n=== ${u.en} ===`);
  u.exercise.forEach(e => {
    if (e.en === 'Answer Key') return;
    const html = e.story;
    const m1 = (html.match(/class='answer-the-questions-section'/g) || []).length;
    const m1b = (html.match(/class="answer-the-questions-section"/g) || []).length;
    const m2 = (html.match(/answer-the-questions-section-char/g) || []).length;
    const m3 = (html.match(/ul-multi-choose-answer/g) || []).length;
    console.log(`  ${e.en}: single-choice=${m1 + m1b}, fill-blank=${m2}, multi-choose=${m3}`);
  });
}

// Count total parsed exercises per unit using the transform logic
import { readFileSync as rf } from 'fs';

console.log("\n\n=== PARSED EXERCISE COUNTS (current transform logic) ===");

function decodeHtmlEntities(text) {
  return text
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"');
}

function stripHtml(html) {
  return decodeHtmlEntities(
    html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  );
}

function parseExercisesFromHtml(exerciseEntries) {
  const exercises = [];
  let order = 1;

  for (const entry of exerciseEntries) {
    if (entry.en === 'Answer Key') continue;
    const html = entry.story;
    if (!html) continue;

    let match;
    const liRegex = /<li[^>]*?class=['"]answer-the-questions-section['"][^>]*?answer-index=['"](\\d+)['"][^>]*>[\s\S]*?<\/ul>\s*<\/li>/g;
    const liRegex2 = /<li[^>]*?answer-index=['"](\\d+)['"][^>]*?class=['"]answer-the-questions-section['"][^>]*>[\s\S]*?<\/ul>\s*<\/li>/g;

    const allLiMatches = [];
    while ((match = liRegex.exec(html)) !== null) {
      allLiMatches.push({ fullMatch: match[0], answerIndex: parseInt(match[1]), index: match.index });
    }
    while ((match = liRegex2.exec(html)) !== null) {
      if (!allLiMatches.some(m => m.index === match.index)) {
        allLiMatches.push({ fullMatch: match[0], answerIndex: parseInt(match[1]), index: match.index });
      }
    }
    allLiMatches.sort((a, b) => a.index - b.index);

    for (const { fullMatch, answerIndex } of allLiMatches) {
      const contentMatch = fullMatch.match(/>((?!<)[^<][\s\S]*)<\/ul>/s);
      if (!contentMatch) continue;
      const content = contentMatch[1] + '</ul>';
      const ulMatch = content.match(/<ul[^>]*class=['"]ul-choose-answer['"][^>]*>([\s\S]*?)<\/ul>/);
      if (!ulMatch) continue;
      const options = [];
      const optRegex = /<li>([\s\S]*?)<\/li>/g;
      let optMatch;
      while ((optMatch = optRegex.exec(ulMatch[1])) !== null) {
        options.push(stripHtml(optMatch[1]));
      }
      if (options.length === 0) continue;
      const questionText = stripHtml(content.replace(/<ul[\s\S]*<\/ul>/, ''));
      if (!questionText) continue;
      exercises.push({ question: questionText, order: order++ });
    }

    // Fill-blank (char) exercises
    const charRegex = /<li[^>]*class=['"]answer-the-questions-section-char['"][^>]*value=['"]([^'"]*?)['"][^>]*>([\s\S]*?)<\/li>/g;
    while ((match = charRegex.exec(html)) !== null) {
      exercises.push({ question: 'fill-blank', order: order++ });
    }
  }

  return exercises;
}

for (let i = 0; i < Math.min(10, fc.length); i++) {
  const u = fc[i];
  if (!u.exercise) continue;
  const parsed = parseExercisesFromHtml(u.exercise);
  
  // Count what was missed
  let totalInHtml = 0;
  u.exercise.forEach(e => {
    if (e.en === 'Answer Key') return;
    const html = e.story;
    const m1 = (html.match(/class='answer-the-questions-section'/g) || []).length;
    const m1b = (html.match(/class="answer-the-questions-section"/g) || []).length;
    const m2 = (html.match(/answer-the-questions-section-char/g) || []).length;
    const m3 = (html.match(/ul-multi-choose-answer/g) || []).length / 1; // Each question has one ul
    totalInHtml += m1 + m1b + m2; // multi-choose are within answer-the-questions-section already
  });
  
  console.log(`${u.en}: raw_questions=${totalInHtml}, parsed=${parsed.length}, missing=${totalInHtml - parsed.length}`);
}
