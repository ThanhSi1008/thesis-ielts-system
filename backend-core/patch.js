const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const res = await fetch('https://engnovate.com/ielts-writing-tests/cambridge-ielts-11-academic-writing-test-2-task-1/');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  let imageUrl = null;
  const specificImage = $('img.ielts-writing-image');
  if (specificImage.length > 0) {
    imageUrl = specificImage.first().attr('src');
  }

  let promptText = '';
  const questionEl = $('.ielts-writing-question');
  if (questionEl.length > 0) {
    promptText = questionEl.find('p').toArray().map(el => $(el).text().trim()).join('\n\n');
  }

  promptText = promptText.replace(/You should spend about \d+ minutes on this task\./gi, '').trim();

  await prisma.ieltsAdvancedWritingPrompt.update({
    where: { id: '384b4782-b70b-4150-9801-1502dca7eccd' },
    data: {
      prompt: promptText,
      imageUrl: imageUrl
    }
  });
  console.log('Updated db for this item');
  await prisma.$disconnect();
}
main().catch(console.error);
