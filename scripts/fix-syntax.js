const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // replace all \\` with \`
  content = content.replaceAll('\\\\`', '\\`');
  // replace all \\${ with ${
  content = content.replaceAll('\\\\${', '${');
  
  // What else?
  // Let's also look for \\n and make it real \\n? No, \\n in .split('\\n') is fine. Wait, split('\\\\n') is bad.
  content = content.replaceAll('.split(\\'\\\\\\\\n\\')', '.split(\\'\\\\n\\')');
  content = content.replaceAll('.split("\\\\\\\\n")', '.split("\\\\n")');

  fs.writeFileSync(file, content, 'utf8');
}

fix('frontend-web/src/app/ielts/intensive/[examId]/take/[sessionId]/page.tsx');
fix('frontend-web/src/app/ielts/intensive/[examId]/result/[sessionId]/page.tsx');
console.log('Fixed syntax errors');
