const fs = require('fs');
const path = require('path');

const schemaReplacements = {
  // Enums
  "ExamType": "IeltsIntensiveExamType",
  "SessionStatus": "IeltsIntensiveSessionStatus",
  
  // Foundation
  "Lesson": "FoundationVocabLesson",
  "Vocabulary": "FoundationVocabWord",
  "VocabularyBook": "FoundationVocabBook",
  "VocabularyUnit": "FoundationVocabUnit",
  "VocabularyWord": "FoundationVocabItem",
  "VocabularyExercise": "FoundationVocabExercise",
  "VocabularyQuestion": "FoundationVocabQuestion",
  "VocabularyProgress": "FoundationVocabProgress",
  "PronunciationAttempt": "FoundationPronunciationAttempt",
  "GrammarBook": "FoundationGrammarBook",
  "GrammarUnit": "FoundationGrammarUnit",
  "GrammarExercise": "FoundationGrammarExercise",
  "GrammarProgress": "FoundationGrammarProgress",
  "PronunciationSound": "FoundationPronunciationSound",
  "SoundExampleWord": "FoundationSoundExample",
  "PronunciationProgress": "FoundationPronunciationProgress",

  // Basic
  "IeltsSkill": "IeltsBasicSkill",
  "IeltsLesson": "IeltsBasicLesson",
  "IeltsListeningExercise": "IeltsBasicListeningExercise",
  "IeltsReadingExercise": "IeltsBasicReadingExercise",
  "IeltsWritingExercise": "IeltsBasicWritingExercise",
  "IeltsWritingUserAnswer": "IeltsBasicWritingAnswer",

  // Advanced
  "IeltsPracticeListeningPart": "IeltsAdvancedListeningPart",
  "IeltsPracticeSession": "IeltsAdvancedListeningSession",
  "IeltsPracticeReadingPart": "IeltsAdvancedReadingPart",
  "IeltsPracticeReadingSession": "IeltsAdvancedReadingSession",

  // Intensive
  "Exam": "IeltsIntensiveExam",
  "ExamSession": "IeltsIntensiveSession",
  "Result": "IeltsIntensiveResult"
};

const codeTypeReplacements = { ...schemaReplacements };

// Prisma accessors are camelCased model names
const accessorReplacements = {};
for (const [key, value] of Object.entries(schemaReplacements)) {
  if (key === 'ExamType' || key === 'SessionStatus') continue;
  const oldAcc = key.charAt(0).toLowerCase() + key.slice(1);
  const newAcc = value.charAt(0).toLowerCase() + value.slice(1);
  accessorReplacements[oldAcc] = newAcc;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  if (filePath.endsWith('schema.prisma')) {
    for (const [oldName, newName] of Object.entries(schemaReplacements)) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      content = content.replace(regex, newName);
    }
  } else {
    // Types
    for (const [oldName, newName] of Object.entries(codeTypeReplacements)) {
      const regex = new RegExp(`\\b${oldName}\\b`, 'g');
      content = content.replace(regex, newName);
    }
    // Accessors (e.g. prisma.exam)
    for (const [oldAcc, newAcc] of Object.entries(accessorReplacements)) {
      const regex = new RegExp(`\\b${oldAcc}\\b`, 'g');
      content = content.replace(regex, newAcc);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === 'dist' || file === '.git' || file === 'components/ui') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('schema.prisma')) {
      processFile(fullPath);
    }
  }
}

console.log("Starting refactor...");
processFile(path.join(__dirname, 'backend-core/prisma/schema.prisma'));
walkDir(path.join(__dirname, 'backend-core/src'));
walkDir(path.join(__dirname, 'frontend-web/src'));
console.log("Refactor complete.");
