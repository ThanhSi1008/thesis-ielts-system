const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'frontend-web', 'src', 'app', 'ielts', 'basic', '[skill]', 'exercises', '[exerciseId]', '_components');

const containersDir = path.join(componentsDir, 'containers');
const uiDir = path.join(componentsDir, 'ui');
const utilsDir = path.join(componentsDir, 'utils');

// Create directories
[containersDir, uiDir, utilsDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Map of files to their new destinations
const fileMap = {
  'ListeningExerciseLayout.tsx': containersDir,
  'ReadingExerciseLayout.tsx': containersDir,
  'AudioPlayer.tsx': uiDir,
  'ListeningQuestionsPanel.tsx': uiDir,
  'ReadingPassagePanel.tsx': uiDir,
  'ReadingQuestionsPanel.tsx': uiDir,
  'TheoryModal.tsx': uiDir,
  'TranscriptPanel.tsx': uiDir,
  'SharedExerciseTypes.ts': utilsDir,
  'SharedScoreUtils.ts': utilsDir,
};

// 1. First read all contents and update paths IN MEMORY
const memory = {};
for (const file of Object.keys(fileMap)) {
  const oldPath = path.join(componentsDir, file);
  if (!fs.existsSync(oldPath)) continue;
  memory[file] = fs.readFileSync(oldPath, 'utf8');
}

// Update imports
for (const [file, content] of Object.entries(memory)) {
  let newContent = content;
  const currentRole = fileMap[file] === containersDir ? 'containers' : (fileMap[file] === uiDir ? 'ui' : 'utils');

  // Replace ./ imports
  newContent = newContent.replace(/from "\.\/([A-Za-z0-9_]+)"/g, (match, importedFileBase) => {
    // find what role the imported file belongs to
    // add .tsx or .ts to find it
    let targetFileName = importedFileBase + '.tsx';
    if (!fileMap[targetFileName]) targetFileName = importedFileBase + '.ts';
    
    if (fileMap[targetFileName]) {
      const targetRole = fileMap[targetFileName] === containersDir ? 'containers' : (fileMap[targetFileName] === uiDir ? 'ui' : 'utils');
      
      if (currentRole === targetRole) {
        return `from "./${importedFileBase}"`; // Same folder
      } else {
        return `from "../${targetRole}/${importedFileBase}"`; // Different folder
      }
    }
    return match;
  });
  
  // Now handle deep component imports in ui panels
  if (currentRole === 'ui' && (file === 'ListeningQuestionsPanel.tsx' || file === 'ReadingQuestionsPanel.tsx')) {
    // Before: ../../../../components
    // After: ../../../../../components
    newContent = newContent.replace(/\.\.\/\.\.\/\.\.\/\.\.\/components/g, '../../../../../components');
  }
  
  // handle SharedScoreUtils internal imports
  if (file === 'SharedScoreUtils.ts') {
     newContent = newContent.replace(/\.\.\/\.\.\/\.\.\/\.\.\/components/g, '../../../../../components');
  }

  memory[file] = newContent;
}

// 2. Write them to new locations and delete old ones
for (const [file, content] of Object.entries(memory)) {
  const oldPath = path.join(componentsDir, file);
  const newPath = path.join(fileMap[file], file);
  fs.writeFileSync(newPath, content);
  fs.unlinkSync(oldPath);
  console.log(`Moved ${file} to ${path.basename(fileMap[file])}`);
}

// 3. Update page.tsx
const pagePath = path.join(componentsDir, '..', 'page.tsx');
if (fs.existsSync(pagePath)) {
  let pageContent = fs.readFileSync(pagePath, 'utf8');
  pageContent = pageContent.replace(/from "\.\/_components\/ReadingExerciseLayout"/g, 'from "./_components/containers/ReadingExerciseLayout"');
  pageContent = pageContent.replace(/from "\.\/_components\/ListeningExerciseLayout"/g, 'from "./_components/containers/ListeningExerciseLayout"');
  fs.writeFileSync(pagePath, pageContent);
  console.log('Fixed imports in page.tsx');
}
