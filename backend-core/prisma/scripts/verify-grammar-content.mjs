import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'prisma/data/grammar-generated');
if (!fs.existsSync(DATA_DIR)) {
  console.log("No generated data found.");
  process.exit(0);
}

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

let totalUnits = 0;
let totalExercises = 0;
let issues = [];

for (const file of files) {
  totalUnits++;
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));

  // Check theory
  if (!data.theory || data.theory.length < 200) {
    issues.push(`${file}: Theory too short (${data.theory?.length || 0} chars)`);
  }
  if (!data.theory?.includes('<div')) {
    issues.push(`${file}: Theory is not HTML`);
  }

  // Check exercises
  if (!data.exercises || data.exercises.length < 2) {
    issues.push(`${file}: Too few exercises (${data.exercises?.length || 0})`);
  }
  for (const ex of (data.exercises || [])) {
    totalExercises++;
    const items = ex.items || ex.matches || [];
    const answerable = items.filter(i => !i.isExample);
    if (answerable.length === 0) {
      issues.push(`${file}, Ex ${ex.id}: No answerable items`);
    }
    const missingAnswers = answerable.filter(i => !i.answer && !i.right);
    if (missingAnswers.length > 0) {
      issues.push(`${file}, Ex ${ex.id}: ${missingAnswers.length} items without answers`);
    }
  }
}

console.log(`\n📊 Verification Summary`);
console.log(`   Units: ${totalUnits}`);
console.log(`   Exercises: ${totalExercises}`);
console.log(`   Issues: ${issues.length}`);
if (issues.length > 0) {
  console.log(`\n⚠️ Issues found:`);
  issues.forEach(i => console.log(`   - ${i}`));
}
