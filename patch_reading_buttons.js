const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend-web', 'src', 'app', 'ielts', 'basic', 'components', 'listening-renders');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('Listen from here')) {
    // 1. Add isReading?: boolean to props interface
    // Look for audioRef prop declaration and insert isReading
    content = content.replace(/audioRef\s*:\s*React\.RefObject<HTMLAudioElement>;/g, 'audioRef: React.RefObject<HTMLAudioElement>;\n  isReading?: boolean;');
    
    // Also in prop destructuring
    content = content.replace(/audioRef,\n?\s*onLocate/g, 'audioRef,\n  onLocate,\n  isReading');
    
    // 2. Conditionally render the button
    const regex = /(<button[^>]*onClick=\{seekTo\}[^>]*>[\s\S]*?<Headphones[\s\S]*?Listen from here[\s\S]*?<\/button>)/g;
    content = content.replace(regex, '{!isReading && $1}');
    
    fs.writeFileSync(filePath, content);
    console.log('Patched: ' + file);
  }
}

// Now patch QuestionsPanel.tsx
const qsFile = path.join(__dirname, 'frontend-web', 'src', 'app', 'ielts', 'basic', '[skill]', 'exercises', '[exerciseId]', '_components', 'QuestionsPanel.tsx');
let qsContent = fs.readFileSync(qsFile, 'utf8');
qsContent = qsContent.replace(/audioRef=\{audioRef\}\n\s*onLocate=\{onLocate\}/g, 'audioRef={audioRef}\n                onLocate={onLocate}\n                isReading={isReading}');
fs.writeFileSync(qsFile, qsContent);
console.log('Patched QuestionsPanel.tsx');

