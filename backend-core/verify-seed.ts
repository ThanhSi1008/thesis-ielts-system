import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSeeding() {
  console.log('🔍 Kiểm tra dữ liệu trong database...');
  
  try {
    const vocabBooks = await prisma.foundationVocabBook.count();
    const grammarBooks = await prisma.foundationGrammarBook.count();
    const sounds = await prisma.foundationPronunciationSound.count();
    const exams = await prisma.exam.count();
    const readingEx = await prisma.ieltsBasicReadingExercise.count();
    const listeningEx = await prisma.ieltsBasicListeningExercise.count();
    const writingEx = await prisma.ieltsBasicWritingExercise.count();
    
    console.log(`📚 FoundationVocabWord Books: ${vocabBooks}`);
    console.log(`📖 Grammar Books: ${grammarBooks}`);
    console.log(`🔊 Pronunciation Sounds: ${sounds}`);
    console.log(`🧪 Cambridge Exams: ${exams}`);
    console.log(`🏫 Reading Exercises: ${readingEx}`);
    console.log(`🏫 Listening Exercises: ${listeningEx}`);
    console.log(`🏫 Writing Exercises: ${writingEx}`);

    if (vocabBooks > 0 && grammarBooks > 0 && sounds > 0 && exams > 0) {
      console.log('\n✅ Data đã được seed ĐẦY ĐỦ!');
    } else {
      console.log('\n❌ Data CHƯA được seed đầy đủ, cần chạy lại lệnh npm run prisma:seed');
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeeding();
