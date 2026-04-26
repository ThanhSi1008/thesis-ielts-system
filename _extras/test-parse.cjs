const fs = require('fs');

// Test reading questions from book 1
const raw1 = fs.readFileSync('./_extras/book1_data.json', 'utf-8').replace(/^\uFEFF/, '');
const data1 = JSON.parse(raw1);
const readHtml = data1.flashcard[0].reading[1].story; // faq entry

console.log('=== READING QUESTIONS (Book 1, Unit 1) ===');

// MC questions  
const liRegex = /<li[^>]*?(?:class='answer-the-questions-section'[^>]*?answer-index='(\d+)'|answer-index='(\d+)'[^>]*?class='answer-the-questions-section')[^>]*?>([\s\S]*?)<\/ul>\s*<\/li>/g;
let match;
let count = 0;
while ((match = liRegex.exec(readHtml)) !== null) {
  count++;
  const answerIndex = parseInt(match[1] || match[2]);
  const content = match[3];
  const questionText = content.replace(/<ul[\s\S]*/, '').replace(/<[^>]+>/g, '').trim();
  console.log(`Q${count}: "${questionText}" | answer_idx=${answerIndex}`);
}

// Fill blank
const textareaRegex = /<li[^>]*class='answer-the-questions-textarea'[^>]*value='([^']*)'[^>]*>([\s\S]*?)<\/li>/g;
while ((match = textareaRegex.exec(readHtml)) !== null) {
  count++;
  const answer = match[1];
  const q = match[2].replace(/<br\s*\/?>/g, ' ').replace(/_+/g, '').replace(/<[^>]+>/g, '').trim();
  console.log(`Q${count} (fill): "${q}" | answer="${answer}"`);
}
console.log(`Total reading questions: ${count}`);

// Test book 3 exercises
console.log('\n=== BOOK 3 EXERCISE CHECK ===');
const raw3 = fs.readFileSync('./_extras/book3_data.json', 'utf-8').replace(/^\uFEFF/, '');
const data3 = JSON.parse(raw3);
const ex3 = data3.flashcard[0];
console.log('Unit:', ex3.en);
console.log('Has exercises:', !!ex3.exercise);
console.log('Exercise count:', ex3.exercise?.length);
if (ex3.exercise?.[0]) {
  console.log('Exercise[0].en:', ex3.exercise[0].en);
  const html3 = ex3.exercise[0].story;
  console.log('HTML preview:', html3?.substring(0, 200));
}
console.log('Has reading:', !!ex3.reading);
console.log('Reading count:', ex3.reading?.length);
if (ex3.reading?.[1]) {
  console.log('Reading[1].en:', ex3.reading[1].en);
  console.log('Reading[1].type:', ex3.reading[1].type);
}

// Test book 3 reading question format
if (ex3.reading?.[1]?.story) {
  const rhtml = ex3.reading[1].story;
  let rcount = 0;
  const rRegex = /<li[^>]*?(?:class='answer-the-questions-section'[^>]*?answer-index='(\d+)'|answer-index='(\d+)'[^>]*?class='answer-the-questions-section')[^>]*?>([\s\S]*?)<\/ul>\s*<\/li>/g;
  while ((match = rRegex.exec(rhtml)) !== null) rcount++;
  const rRegex2 = /<li[^>]*class='answer-the-questions-textarea'[^>]*value='([^']*)'[^>]*>([\s\S]*?)<\/li>/g;
  while ((match = rRegex2.exec(rhtml)) !== null) rcount++;
  console.log('Book 3 Unit 1 reading questions:', rcount);
}
