const fs = require('fs');

const seedTsPath = 'c:\\\\Users\\\\Admin\\\\Desktop\\\\thesis\\\\my videos\\\\thesis-toeic-system\\\\backend-core\\\\prisma\\\\seed.ts';
let code = fs.readFileSync(seedTsPath, 'utf8');

// Load the JSON data
const data = require('./build-read-17-test1.js');
// wait, build-read-17-test1.js is not a module export.
// Let me just read it and regex the JSON out.
const buildContent = fs.readFileSync('c:\\\\Users\\\\Admin\\\\Desktop\\\\thesis\\\\my videos\\\\thesis-toeic-system\\\\scripts\\\\build-read-17-test1.js', 'utf8');
const examDataStr = buildContent.split('const examData = ')[1].split(';\n\n// Insert into seed.ts')[0];

const newConstant = "const cambridgeIelts17ReadingTest1Questions = " + examDataStr + ";\n\n";
const anchor1 = "const cambridgeIelts17ListeningTest1Questions = {";

if (!code.includes('cambridgeIelts17ReadingTest1Questions')) {
  // Inject constant at the top
  code = code.replace(anchor1, newConstant + anchor1);
  console.log('Successfully injected Cambridge 17 Reading Test 1 variables.');
}

const readingSeedBlock = "" +
"  await upsertCambridgeExam({\n" +
"    title: \"Cambridge IELTS 17 - Reading Test 1\",\n" +
"    description: \"Full mock reading test from Cambridge IELTS 17\",\n" +
"    difficulty: \"HARD\",\n" +
"    type: \"READING\",\n" +
"    isPublished: true,\n" +
"    imageUrl: cambridge17Image,\n" +
"    questions: cambridgeIelts17ReadingTest1Questions,\n" +
"  });\n\n";

if (!code.includes('Cambridge IELTS 17 - Reading Test 1"')) {
  const list1Idx = code.indexOf('title: "Cambridge IELTS 17 - Listening Test 1",');
  if (list1Idx !== -1) {
    const startOfUpsert = code.lastIndexOf('await upsertCambridgeExam(', list1Idx);
    if (startOfUpsert !== -1) {
      code = code.slice(0, startOfUpsert) + readingSeedBlock + code.slice(startOfUpsert);
      console.log('Successfully injected Cambridge 17 Reading Test 1 upsert call.');
    }
  }
}

fs.writeFileSync(seedTsPath, code, 'utf8');
