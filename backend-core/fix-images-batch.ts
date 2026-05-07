import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as fs from 'fs';
import * as path from 'path';

const mapping = [
  {
    topic: "Fun Fortress Theme Park Map",
    correctUrl: "https://res.cloudinary.com/dvh7ztvgk/image/upload/v1775638317/chapter6-1_iuenao.png",
    jsonPathExt: "_extras/question_types/listening/2. exercises/Chapter 06 - Map-Plan-Diagram Labelling/Questions 1-4/data.json",
    jsonPathComp: "_extras/question_types/_compiled/listening_Chapter_06_Map-Plan-Diagram_Labelling_Questions_1-4.json"
  },
  {
    topic: "Hemsworth Wildlife Park Map",
    correctUrl: "https://res.cloudinary.com/dvh7ztvgk/image/upload/v1775638316/chapter6-2_lhdtgu.png",
    jsonPathExt: "_extras/question_types/listening/2. exercises/Chapter 06 - Map-Plan-Diagram Labelling/Questions 5-7/data.json",
    jsonPathComp: "_extras/question_types/_compiled/listening_Chapter_06_Map-Plan-Diagram_Labelling_Questions_5-7.json"
  },
  {
    topic: "Castle Hill Hotel Lobby Plan",
    correctUrl: "https://res.cloudinary.com/dvh7ztvgk/image/upload/v1775638314/chapter6-3_bihgqq.png",
    jsonPathExt: "_extras/question_types/listening/2. exercises/Chapter 06 - Map-Plan-Diagram Labelling/Questions 8-11/data.json",
    jsonPathComp: "_extras/question_types/_compiled/listening_Chapter_06_Map-Plan-Diagram_Labelling_Questions_8-11.json"
  },
  {
    topic: "Washing Machine Operation",
    correctUrl: "https://res.cloudinary.com/dvh7ztvgk/image/upload/v1775638315/chapter6-4_krt8gf.png",
    jsonPathExt: "_extras/question_types/listening/2. exercises/Chapter 06 - Map-Plan-Diagram Labelling/Questions 12-14/data.json",
    jsonPathComp: "_extras/question_types/_compiled/listening_Chapter_06_Map-Plan-Diagram_Labelling_Questions_12-14.json"
  }
];

function updateJsonFiles(entry: any) {
  [entry.jsonPathExt, entry.jsonPathComp].forEach(p => {
    const fullPath = path.resolve('../', p);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      content = content.replace(/"image_url":\s*"[^"]+"/g, `"image_url": "${entry.correctUrl}"`);
      fs.writeFileSync(fullPath, content);
      console.log(`Updated JSON: ${p}`);
    }
  });
}

async function main() {
  for (const entry of mapping) {
    updateJsonFiles(entry);
    
    // DB Update
    const ex = await prisma.ieltsBasicListeningExercise.findFirst({
      where: { topic: entry.topic }
    });
    
    if (ex) {
      const contentArr = Array.isArray(ex.content) ? ex.content : [ex.content];
      let updated = false;
      const newContent = contentArr.map((c: any) => {
        if (c.image_url && c.image_url !== entry.correctUrl) {
          c.image_url = entry.correctUrl;
          updated = true;
        }
        return c;
      });

      if (updated) {
        await prisma.ieltsBasicListeningExercise.update({
          where: { id: ex.id },
          data: { content: newContent }
        });
        console.log(`Updated DB: ${entry.topic}`);
      } else {
        console.log(`DB already correct: ${entry.topic}`);
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
