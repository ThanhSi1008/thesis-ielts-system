import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, '..', 'data', 'ielts-advanced-compiled', 'speaking-parts.json');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Patterns that identify injected browser/JS noise, not real questions
const NOISE_RE = [
  /prefetch/i,
  /navigator\.userAgent/,
  /location\.hash/,
  /we've sent a verification/i,
  /youremail@/i,
  /tabIndex/,
  /window\.addEventListener/,
  /document\.getElementById/,
  /trident.*msie/i,
  /my examen is next/i,
  /feel so lonely/i,
  /group chat or something/i,
  /https?:\/\/[^\s]+\.(js|css|png|jpg|gif)/,
];

function isNoise(text) {
  return NOISE_RE.some((re) => re.test(text));
}

let totalRemoved = 0;
for (const entry of data) {
  const before = entry.questions.length;
  entry.questions = entry.questions.filter((q) => !isNoise(q.text));
  totalRemoved += before - entry.questions.length;
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Removed ${totalRemoved} noise entries`);
console.log(`Total part entries: ${data.length}`);
console.log(`Total questions   : ${data.reduce((s, e) => s + e.questions.length, 0)}`);
