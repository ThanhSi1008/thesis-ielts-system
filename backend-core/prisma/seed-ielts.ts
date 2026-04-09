import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const baseDir = path.resolve('../_extras/question_types/_compiled');

async function seed() {
  console.log('Seeding IELTS basic data...');
  
  // Clean existing data.
  await prisma.ieltsExercise.deleteMany({});
  await prisma.ieltsLesson.deleteMany({});
  
  // 1. Ensure skills exist
  const skillsData = [
    { name: 'Listening', order: 1 },
    { name: 'Reading', order: 2 },
    { name: 'Writing', order: 3 },
    { name: 'Speaking', order: 4 },
  ];

  for (const s of skillsData) {
    await prisma.ieltsSkill.upsert({
      where: { name: s.name },
      update: { order: s.order },
      create: s,
    });
  }

  // 2. Iterate through "listening" and "reading"
  const activeSkills = ['listening', 'reading'];
  
  for (const skillName of activeSkills) {
    const skillRecord = await prisma.ieltsSkill.findUnique({ where: { name: skillName.charAt(0).toUpperCase() + skillName.slice(1) } });
    if (!skillRecord) continue;
    
    // Parse Theory
    const theoryPath = path.join(baseDir, `${skillName}_theory.txt`);
    const theoryArr = getTheoryLessons(theoryPath);
    
    // Parse Exercises
    const exercisesArr = getExercises(baseDir, skillName);
    
    console.log(`[${skillName}] Found ${theoryArr.length} theory lessons, ${exercisesArr.length} exercises.`);

    // Insert lessons
    let order = 1;
    for (const theory of theoryArr) {
      const lesson = await prisma.ieltsLesson.create({
        data: {
          skillId: skillRecord.id,
          chapter: `Chapter ${String(order).padStart(2, '0')}`,
          title: theory.title,
          content: theory.content, 
          quiz: theory.quiz, // Injecting the extracted interactive quiz questions
          order: order++,
        }
      });
      console.log(`  -> Created lesson: ${lesson.title}`);

      // Robust matching between theory title and filename (ignores hyphens, slashes, spaces)
      const cleanTheoryTitle = theory.title.replace(/[^a-zA-Z]/g, '').toLowerCase();

      const matchedExs = exercisesArr.filter(e => {
         const cleanExTitle = e.chapterFolderName.replace(/[^a-zA-Z]/g, '').toLowerCase();
         // Either it's a direct match within the string or partial prefix match
         return cleanExTitle.includes(cleanTheoryTitle) || 
               (cleanTheoryTitle.length > 5 && cleanExTitle.includes(cleanTheoryTitle.substring(0, 10)));
      });
      
      let exOrder = 1;
      for (const ex of matchedExs) {
        if (ex.seeded) continue;
        await prisma.ieltsExercise.create({
          data: {
            skillId: skillRecord.id,
            lessonId: lesson.id,
            topic: ex.topic,
            instructions: ex.instructions,
            audioUrl: ex.audioUrl,
            transcript: ex.transcript,
            readingText: ex.readingText,
            content: ex.content,
            order: exOrder++,
          }
        });
        ex.seeded = true;
      }
    }
    
    // Unmatched exercises linked to skill only
    let exOrderUnmatched = 100;
    const unmatched = exercisesArr.filter((e: any) => !e.seeded);
    if (unmatched.length > 0) {
      console.log(`  -> Found ${unmatched.length} unmatched exercises for ${skillName}. Linking directly to skill without lesson.`);
    }

    for (const ex of unmatched) {
      await prisma.ieltsExercise.create({
        data: {
          skillId: skillRecord.id,
          topic: ex.topic,
          instructions: ex.instructions,
          audioUrl: ex.audioUrl,
          transcript: ex.transcript,
          readingText: ex.readingText,
          content: ex.content,
          order: exOrderUnmatched++,
        }
      });
    }
  }
  
  console.log('Seeding complete.');
}

function getTheoryLessons(txtPath: string) {
  if (!fs.existsSync(txtPath)) return [];
  const text = fs.readFileSync(txtPath, 'utf8');
  const lines = text.replace(/\r/g, '').split('\n');
  
  const lessons: any[] = [];
  let currentLesson: any = null;
  
  let inQuizSection = false;
  
  let currentContentType = 'overview';
  let currentContentTitle = 'Overview';
  let currentContent = '';
  
  let currentQuizQuestion: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match lesson title e.g. "    - Multiple Choice"
    const titleMatch = line.match(/^ {4}- (.*)$/);
    if (titleMatch) {
      if (currentLesson) {
        if (currentContent.trim() && !inQuizSection) {
          currentLesson.content.push({ type: currentContentType, title: currentContentTitle, content: currentContent.trim() });
        }
        if (currentQuizQuestion) {
          currentLesson.quiz.push(currentQuizQuestion);
          currentQuizQuestion = null;
        }
        lessons.push(currentLesson);
      }
      
      const title = titleMatch[1].trim();
      currentLesson = { title, content: [], quiz: [] };
      inQuizSection = false;
      currentContentType = 'overview';
      currentContentTitle = 'Overview';
      currentContent = '';
      continue;
    }
    
    if (!currentLesson) continue;

    // Match sub-sections under a lesson like "- Content" or "- Quiz"
    const sectionMatch = line.match(/^ {8}- (.*)$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      if (sectionName.toLowerCase() === 'quiz') {
        if (currentContent.trim()) {
           currentLesson.content.push({ type: currentContentType, title: currentContentTitle, content: currentContent.trim() });
           currentContent = '';
        }
        inQuizSection = true;
      } else {
        inQuizSection = false;
      }
      continue;
    }

    if (inQuizSection) {
      const trimmed = line.replace(/^ {12}/, '').trim();
      if (!trimmed) continue;
      
      // Matches standard "1. Question" and bold "**1. Question**"
      if (trimmed.match(/^(?:\*\*)?\d+\.(?:\*\*)?\s/)) {
        if (currentQuizQuestion) {
          currentLesson.quiz.push(currentQuizQuestion);
        }
        currentQuizQuestion = {
          question: trimmed.replace(/^(?:\*\*)?\d+\.(?:\*\*)?\s/, ''),
          options: [],
          hint: '',
          answer: '',
          explanation: ''
        };
      } else if (currentQuizQuestion) {
        if (trimmed.match(/^-?\s*(?:\*\*)?[A-Z]\)/) || trimmed.match(/^(?:\*\*)?[A-Z]\)/)) {
          // Removes starting list dashes or bullet points, and the option letter
          let opt = trimmed.replace(/^-?\s*(?:\*\*)?([A-Z]\))(?:\*\*)?\s*/, '$1 ');
          currentQuizQuestion.options.push(opt);
        } else if (trimmed.match(/^-?\s*(?:\*\*)?Hint:(?:\*\*)?/i)) {
          currentQuizQuestion.hint = trimmed.replace(/^-?\s*(?:\*\*)?Hint:(?:\*\*)?\s*/i, '');
        } else if (trimmed.match(/^-?\s*(?:\*\*)?Answer:(?:\*\*)?/i)) {
          currentQuizQuestion.answer = trimmed.replace(/^-?\s*(?:\*\*)?Answer:(?:\*\*)?\s*/i, '');
        } else if (trimmed.match(/^-?\s*(?:\*\*)?Why:(?:\*\*)?/i)) {
          currentQuizQuestion.explanation = trimmed.replace(/^-?\s*(?:\*\*)?Why:(?:\*\*)?\s*/i, '');
        } else {
           if (currentQuizQuestion.explanation) {
              currentQuizQuestion.explanation += ' ' + trimmed;
           } else if (currentQuizQuestion.question && currentQuizQuestion.options.length === 0) {
              currentQuizQuestion.question += ' ' + trimmed;
           }
        }
      }
    } else {
      const trimmed = line.replace(/^ {12}/, '');
      
      // Match both <h2> and <h3> markdown headers
      const subheadMatch = trimmed.match(/^#{2,3}\s+(.*)$/);
      if (subheadMatch) {
        if (currentContent.trim()) {
          currentLesson.content.push({ type: currentContentType, title: currentContentTitle, content: currentContent.trim() });
          currentContent = '';
        }
        
        const rawTitle = subheadMatch[1].trim();
        const lowerTitle = rawTitle.toLowerCase();
        
        if (lowerTitle.includes('trap')) {
          currentContentType = 'traps';
        } else if (lowerTitle.includes('strategy') || lowerTitle.includes('step-by-step')) {
          currentContentType = 'strategy';
        } else if (lowerTitle.includes('tip') || lowerTitle.includes('pro-tip')) {
          currentContentType = 'tips';
        } else {
          currentContentType = 'section'; 
        }
        
        // Ensure emoji stripping works robustly but retains markdown asterisks if desired (or strip them)
        const pureTitleMatch = rawTitle.replace(/^\*\*/, '').match(/[a-zA-Z0-9].*$/);
        let cleanedTitle = pureTitleMatch ? pureTitleMatch[0] : rawTitle;
        cleanedTitle = cleanedTitle.replace(/\*+$/, '').replace(/^\*+/, '').trim();
        currentContentTitle = cleanedTitle;
      } else {
        currentContent += trimmed + '\n';
      }
    }
  }
  
  if (currentLesson) {
    if (currentContent.trim() && !inQuizSection) {
      currentLesson.content.push({ type: currentContentType, title: currentContentTitle, content: currentContent.trim() });
    }
    if (currentQuizQuestion) {
      currentLesson.quiz.push(currentQuizQuestion);
    }
    lessons.push(currentLesson);
  }
  
  return lessons;
}

function getExercises(compiledDir: string, skillName: string) {
  const exList: any[] = [];
  if (!fs.existsSync(compiledDir)) return exList;
  const files = fs.readdirSync(compiledDir);
  for (const file of files) {
    if (file.startsWith(skillName + '_') && file.endsWith('.json')) {
      const dataFile = path.join(compiledDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        
        let contentData = [];
        if (data.content && Array.isArray(data.content)) contentData = data.content;
        else if (data.question_groups) contentData = data.question_groups;
        else if (data.questions && Array.isArray(data.questions)) contentData = data.questions;
        else contentData = [data];

        const match = file.match(/^[a-z]+_(Chapter_\d+)_(.*?)_Question(s)?_/);
        let rawTitle = file;
        let chapterFolderName = '';
        if (match) {
           chapterFolderName = match[1].replace('_', ' '); 
           rawTitle = match[2].replace(/_/g, ' '); 
        }

        exList.push({
          chapterFolderName: chapterFolderName + ' - ' + rawTitle,
          topic: data.title || rawTitle,
          instructions: data.instructions || '',
          audioUrl: null,
          transcript: data.transcript || null,
          readingText: data.passage || null, 
          content: contentData,
          seeded: false
        });
      } catch(e) {
        console.error('Failed to parse', dataFile, e);
      }
    }
  }
  return exList;
}

seed().catch(console.error).finally(() => prisma.$disconnect());
