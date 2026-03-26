const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'backend-core/prisma/seed.ts');
let seedContent = fs.readFileSync(seedPath, 'utf8');

// Read MD files
const p1Md = fs.readFileSync(path.join(__dirname, 'srt/reading/cam17/test1/images/evidence_text/part1.md'), 'utf8');
const p2Md = fs.readFileSync(path.join(__dirname, 'srt/reading/cam17/test1/images/evidence_text/part2.md'), 'utf8');
const p3Md = fs.readFileSync(path.join(__dirname, 'srt/reading/cam17/test1/images/evidence_text/part3.md'), 'utf8');

const p1Text = `**The development of the London underground railway**\n\n` + p1Md.split('---')[1].trim();

const p2TextActual = p2Md.trim(); 
const p2Formatted = p2TextActual.replace(/^### (.*)$/m, '**$1**'); 

const p3TextPieces = p3Md.split('---');
const p3TextBody = p3TextPieces.length > 2 ? p3TextPieces[1] : p3TextPieces[1];
const p3Text = `**To catch a king**\nAnna Keay reviews Charles Spencer's book about the hunt for King Charles II during the English Civil War of the seventeenth century\n\n` + p3TextBody.trim();

function replacePassage(content, prefix, newPassage) {
    const startIdx = content.indexOf(`passage_text: \`${prefix}`);
    if (startIdx === -1) {
        console.error(`Could not find passage starting with ${prefix}`);
        return content;
    }
    const endIdx = content.indexOf('`,', startIdx + 15);
    if (endIdx === -1) {
        console.error(`Could not find end of passage for ${prefix}`);
        return content;
    }
    return content.substring(0, startIdx + 15) + newPassage.replace(/`/g, '\\`') + content.substring(endIdx);
}

seedContent = replacePassage(seedContent, '**The development of the London', p1Text);
seedContent = replacePassage(seedContent, '**Stadiums: past, present and', p2Formatted);
seedContent = replacePassage(seedContent, '**To catch a king**', p3Text);

fs.writeFileSync(seedPath, seedContent);
console.log('Seed updated securely!');
