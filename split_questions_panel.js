const fs = require('fs');
const path = require('path');

const qpPath = path.join(__dirname, 'frontend-web', 'src', 'app', 'ielts', 'basic', '[skill]', 'exercises', '[exerciseId]', '_components', 'QuestionsPanel.tsx');

const content = fs.readFileSync(qpPath, 'utf8');

// ===================================
// Generate ListeningQuestionsPanel.tsx
// ===================================
let lisContent = content;
lisContent = lisContent.replace(/export function QuestionsPanel/g, 'export function ListeningQuestionsPanel');
lisContent = lisContent.replace(/\s*isReading: boolean;/g, '');
lisContent = lisContent.replace(/,\s*isReading\n/g, '\n');
lisContent = lisContent.replace(/\s*isReading=\{isReading\}/g, '');

const lisPath = path.join(path.dirname(qpPath), 'ListeningQuestionsPanel.tsx');
fs.writeFileSync(lisPath, lisContent);

// ===================================
// Generate ReadingQuestionsPanel.tsx
// ===================================
let readContent = content;
readContent = readContent.replace(/listening-renders/g, 'reading-renders');
readContent = readContent.replace(/export function QuestionsPanel/g, 'export function ReadingQuestionsPanel');

// Remove isReading
readContent = readContent.replace(/\s*isReading: boolean;/g, '');
readContent = readContent.replace(/,\s*isReading\n/g, '\n');
readContent = readContent.replace(/\s*isReading=\{isReading\}/g, '');

// Remove audioRef
readContent = readContent.replace(/\s*audioRef: React\.RefObject<HTMLAudioElement>;/g, '');
readContent = readContent.replace(/,\s*audioRef\n/g, '\n');
readContent = readContent.replace(/\s*audioRef=\{audioRef\}/g, '');

const readPath = path.join(path.dirname(qpPath), 'ReadingQuestionsPanel.tsx');
fs.writeFileSync(readPath, readContent);

console.log('Created ListeningQuestionsPanel.tsx and ReadingQuestionsPanel.tsx');
