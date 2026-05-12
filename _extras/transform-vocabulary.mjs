/**
 * Transform Essential English JSON data into vocabulary.ts seed file
 * 
 * Reads: _extras/book{1-6}_data.json
 * Writes: backend-core/prisma/data/vocabulary.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── HTML PARSING HELPERS ─────────────────────────────────────

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
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripHtml(html) {
  return decodeHtmlEntities(
    html
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function parsePron(pronStr) {
  const match = pronStr.match(/\[([^\]]+)\]\s*(.+)/);
  if (!match) return { ipa: pronStr, partOfSpeech: '' };
  let ipa = match[1].trim();
  let pos = match[2].trim().replace(/\.$/, '');
  return { ipa: `/${ipa}/`, partOfSpeech: pos };
}

function urlFriendly(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ─── EXERCISE PARSER ──────────────────────────────────────────

function parseExercisesFromHtml(exerciseEntries) {
  return [];
}

// ─── READING COMPREHENSION PARSER ─────────────────────────────

function parseReadingQuestions(readingEntries) {
  const questions = [];
  let order = 1;

  for (const entry of readingEntries) {
    if (entry.type !== 'faq') continue;
    const html = entry.story;
    if (!html) continue;

    let match;

    // Multiple-choice questions (quote-agnostic)
    const liRegex = /<li[^>]*?class=['"]answer-the-questions-section['"][^>]*?answer-index=['"]([^'"]+?)['"][^>]*>([\s\S]*?<\/ul>\s*)<\/li>/g;
    const liRegex2 = /<li[^>]*?answer-index=['"]([^'"]+?)['"][^>]*?class=['"]answer-the-questions-section['"][^>]*>([\s\S]*?<\/ul>\s*)<\/li>/g;

    const allLiMatches = [];
    while ((match = liRegex.exec(html)) !== null) {
      allLiMatches.push({ fullMatch: match[0], answerIndexRaw: match[1], content: match[2], index: match.index });
    }
    while ((match = liRegex2.exec(html)) !== null) {
      if (!allLiMatches.some(m => m.index === match.index)) {
        allLiMatches.push({ fullMatch: match[0], answerIndexRaw: match[1], content: match[2], index: match.index });
      }
    }
    allLiMatches.sort((a, b) => a.index - b.index);

    for (const { content, answerIndexRaw, index } of allLiMatches) {
      const ulMatch = content.match(/<ul[^>]*class=['"]ul-choose-answer['"][^>]*>([\s\S]*?)<\/ul>/);
      if (!ulMatch) continue;

      const options = [];
      const optRegex = /<li>([\s\S]*?)<\/li>/g;
      let optMatch;
      while ((optMatch = optRegex.exec(ulMatch[1])) !== null) {
        options.push(stripHtml(optMatch[1]).replace(/^[a-z]\.\s*/i, '').trim());
      }

      let questionText = stripHtml(content.replace(/<ul[\s\S]*<\/ul>/, ''));
      if (!questionText) {
        const h4Regex = /<h4>([\s\S]*?)<\/h4>/g;
        let h4Match;
        let lastH4 = 'Answer the question.';
        while ((h4Match = h4Regex.exec(html)) !== null) {
          if (h4Match.index < index) lastH4 = stripHtml(h4Match[1]);
        }
        questionText = lastH4;
      }

      const answerIndices = answerIndexRaw.split(',').map(s => parseInt(s.trim()));
      const primaryIndex = answerIndices[0];

      questions.push({
        question: questionText,
        type: 'multiple_choice',
        options,
        answer: options[primaryIndex] || '',
        order: order++,
      });
    }

    // Fill-blank (textarea) questions (quote-agnostic)
    const textareaRegex = /<li[^>]*class=['"]answer-the-questions-textarea['"][^>]*value=['"]([^'"]*?)['"][^>]*>([\s\S]*?)<\/li>/g;
    while ((match = textareaRegex.exec(html)) !== null) {
      const answer = decodeHtmlEntities(match[1]);
      const questionContent = match[2];
      const questionText = stripHtml(questionContent.replace(/<br\s*\/?>/g, ' ').replace(/_+/g, '').trim());

      questions.push({
        question: questionText,
        type: 'fill_blank',
        options: null,
        answer,
        order: order++,
      });
    }
  }

  return questions;
}

// ─── STORY PARSER ─────────────────────────────────────────────

function parseStory(readingEntries, bookNum, unitName) {
  for (const entry of readingEntries) {
    if (entry.type !== 'story') continue;

    const basePath = `https://www.essentialenglish.review/apps-data/4000-essential-english-words-${bookNum}/data`;
    const unitSlug = urlFriendly(unitName + '-' + entry.en);

    let storyContent = entry.story || '';
    storyContent = storyContent.replace(/<strong class=['"]idiom-tip['"][^>]*>/g, '<strong>');
    storyContent = decodeHtmlEntities(storyContent);

    return {
      title: decodeHtmlEntities(entry.en),
      content: storyContent,
      imageUrl: entry.image ? `${basePath}/${unitSlug}/reading/${entry.image}` : null,
    };
  }
  return null;
}

// ─── MAIN TRANSFORM ──────────────────────────────────────────

const bookImageUrls = [
  'https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_1_axjltv.png',
  'https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab-2_zpuyp9.png',
  'https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_3_gt3hcu.png',
  'https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab_4_dujqob.png',
  'https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_5_uxrn7b.png',
  'https://res.cloudinary.com/dalaaegob/image/upload/v1769774254/vocab_6_rf9ub1.png',
];

const allBooks = [];

for (let bookNum = 1; bookNum <= 6; bookNum++) {
  const dataPath = join(__dirname, 'srt', '4000-essential-english-word', `book${bookNum}_data.json`);
  console.log(`Reading book ${bookNum} from ${dataPath}...`);

  const raw = readFileSync(dataPath, 'utf-8').replace(/^\uFEFF/, '');
  const data = JSON.parse(raw);
  const flashcards = data.flashcard;

  const basePath = `https://www.essentialenglish.review/apps-data/4000-essential-english-words-${bookNum}/data`;

  const units = [];

  for (let i = 0; i < flashcards.length; i++) {
    const fc = flashcards[i];
    const unitLabel = fc.en; // "Unit 1", "Unit 2", etc.

    // Skip the "Index" entry (table of contents, not a real unit)
    if (unitLabel === 'Index' || !fc.wordlist || fc.wordlist.length === 0) continue;

    // Get story title from reading section
    const storyTitle = fc.reading?.[0]?.en || unitLabel;
    const unitSlug = urlFriendly(unitLabel + '-' + storyTitle);

    // Parse words
    const words = (fc.wordlist || []).map((w, idx) => {
      const { ipa, partOfSpeech } = parsePron(w.pron || '');
      const baseUnitSlug = urlFriendly(unitLabel);
      return {
        word: w.en,
        meaning: stripHtml(w.desc),
        ipa,
        partOfSpeech,
        example: stripHtml(w.exam),
        imageUrl: w.image ? `${basePath}/${baseUnitSlug}/wordlist/${w.image}` : null,
        audioUrl: w.sound ? `${basePath}/${baseUnitSlug}/wordlist/${w.sound}` : null,
        order: idx + 1,
      };
    });

    // Parse exercises
    const exercises = parseExercisesFromHtml(fc.exercise || []);

    // Parse reading questions
    const questions = parseReadingQuestions(fc.reading || []);

    // Parse story
    const story = parseStory(fc.reading || [], bookNum, unitLabel);

      units.push({
        title: unit.en,
        order: unit.order,
        words: words,
        exercises: [],
        questions: questions,
        story: story,
      });
  }

  allBooks.push({
    name: `4000 Essential English Words Book ${bookNum}`,
    imageUrl: bookImageUrls[bookNum - 1],
    wordCount: units.reduce((sum, u) => sum + u.words.length, 0),
    order: bookNum,
    units,
  });

  console.log(`  Book ${bookNum}: ${units.length} units, ${units.reduce((s, u) => s + u.words.length, 0)} words, ${units.reduce((s, u) => s + u.exercises.length, 0)} exercises, ${units.reduce((s, u) => s + u.questions.length, 0)} questions`);
}

// ─── GENERATE TYPESCRIPT ──────────────────────────────────────

let output = '// Auto-generated vocabulary data from 4000 Essential English Words\n';
output += '// Generated: ' + new Date().toISOString() + '\n';
output += '// Source: https://www.essentialenglish.review\n\n';

output += 'export const vocabularyBooks = ' + JSON.stringify(allBooks, null, 2) + ';\n';

const outputPath = join(ROOT, 'backend-core', 'prisma', 'data', 'vocabulary.ts');
writeFileSync(outputPath, output, 'utf-8');

console.log(`\n✅ Written to ${outputPath}`);
console.log(`   Total books: ${allBooks.length}`);
console.log(`   Total units: ${allBooks.reduce((s, b) => s + b.units.length, 0)}`);
console.log(`   Total words: ${allBooks.reduce((s, b) => s + b.units.reduce((s2, u) => s2 + u.words.length, 0), 0)}`);
console.log(`   Total exercises: ${allBooks.reduce((s, b) => s + b.units.reduce((s2, u) => s2 + u.exercises.length, 0), 0)}`);
console.log(`   Total questions: ${allBooks.reduce((s, b) => s + b.units.reduce((s2, u) => s2 + u.questions.length, 0), 0)}`);
