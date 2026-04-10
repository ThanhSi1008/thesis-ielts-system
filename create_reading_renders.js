const fs = require('fs');
const path = require('path');

const lisDir = path.join(__dirname, 'frontend-web', 'src', 'app', 'ielts', 'basic', 'components', 'listening-renders');
const redDir = path.join(__dirname, 'frontend-web', 'src', 'app', 'ielts', 'basic', 'components', 'reading-renders');

if (!fs.existsSync(redDir)) {
  fs.mkdirSync(redDir, { recursive: true });
}

const files = fs.readdirSync(lisDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const lisPath = path.join(lisDir, file);
  const redPath = path.join(redDir, file);
  
  let originalContent = fs.readFileSync(lisPath, 'utf8');
  
  // ==========================================
  // REVERT listening-renders (Undo isReading)
  // ==========================================
  let lisContent = originalContent;
  lisContent = lisContent.replace(/\s*isReading\?: boolean;/g, '');
  lisContent = lisContent.replace(/,\s*isReading/g, '');
  // Because my previous patch script wrote {!isReading && <button ... >Listen from here</button>} on exactly ONE line:
  // wait, the regex was: /(<button[^>]*onClick=\{seekTo\}[^>]*>[\s\S]*?<Headphones[\s\S]*?Listen from here[\s\S]*?<\/button>)/g
  // And it replaced with {!isReading && $1}
  // So I can revert by removing `{ !isReading && ` and the trailing `}`
  lisContent = lisContent.replace(/\{\s*!isReading\s*&&\s*(<button[\s\S]*?Listen from here[\s\S]*?<\/button>)\s*\}/g, '$1');
  
  fs.writeFileSync(lisPath, lisContent);
  
  // ==========================================
  // CREATE reading-renders
  // ==========================================
  let redContent = originalContent;
  
  // 1. Remove audioRef & isReading from Props Interfaces
  redContent = redContent.replace(/\s*audioRef\s*:\s*React\.RefObject<HTMLAudioElement>;/g, '');
  redContent = redContent.replace(/\s*isReading\?: boolean;/g, '');
  
  // 2. Remove audioRef & isReading from destructuring
  redContent = redContent.replace(/,\s*audioRef/g, '');
  redContent = redContent.replace(/,\s*isReading/g, '');
  
  // 3. Remove seekTo declaration
  redContent = redContent.replace(/\s*const seekTo = .*? => \{[\s\S]*?\};\s*/g, '');
  
  // 4. Remove Headphones Listen from here buttons
  // Sometimes it's wrapped in {!isReading && ... }
  redContent = redContent.replace(/\s*\{\s*!isReading\s*&&\s*<button[\s\S]*?Listen from here[\s\S]*?<\/button>\s*\}/g, '');
  // Sometimes it's not wrapped (like in ShortAnswerGroup)
  redContent = redContent.replace(/\s*<button[\s\S]*?Listen from here[\s\S]*?<\/button>/g, '');
  
  // 5. Remove Headphones import
  redContent = redContent.replace(/Headphones,\s*/g, '');
  redContent = redContent.replace(/,\s*Headphones/g, '');
  
  // 6. Fix any residual `{audioRef &&` wrappers (if any existed)
  // none existed.
  
  fs.writeFileSync(redPath, redContent);
  console.log('Processed for reading/listening separation:', file);
}

