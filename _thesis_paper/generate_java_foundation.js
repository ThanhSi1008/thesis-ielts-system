const fs = require('fs');
const path = require('path');

// ── Foundation-only models ──
const foundationModels = [
  'User',
  // Vocab Book system
  'FoundationVocabBook',
  'FoundationVocabUnit',
  'FoundationVocabItem',
  'FoundationVocabExercise',
  'FoundationVocabQuestion',
  'FoundationVocabProgress',
  // Vocab Lesson system
  'FoundationVocabLesson',
  'FoundationVocabWord',
  'Grammar',
  // Pronunciation
  'FoundationPronunciationSound',
  'FoundationSoundExample',
  'FoundationPronunciationProgress',
  'FoundationPronunciationAttempt',
  // Grammar Book system
  'FoundationGrammarBook',
  'FoundationGrammarUnit',
  'FoundationGrammarExercise',
  'FoundationGrammarProgress',
];

const schemaPath = path.join(__dirname, '../backend-core/prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf-8');

const outDir = path.join(__dirname, 'vp_java_foundation');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir, { recursive: true });

// Parse enums with their values from the schema
const enumBlocks = [...schema.matchAll(/enum (\w+)\s*\{([\s\S]*?)\}/g)];
const enums = enumBlocks.map(m => m[1]);
const enumMap = {};
enumBlocks.forEach(m => {
  const name = m[1];
  const values = m[2]
    .split('\n')
    .map(l => l.replace(/\/\/.*$/, '').trim())  // strip inline comments
    .filter(l => l && !l.startsWith('//'));
  enumMap[name] = values;
});

// Parse all model blocks
const models = schema.match(/model \w+ \{[\s\S]*?\}/g);

const TYPE_MAP = {
  String: 'String',
  'String[]': 'List<String>',
  Int: 'Integer',
  'Int[]': 'List<Integer>',
  Float: 'Double',
  'Float[]': 'List<Double>',
  Boolean: 'Boolean',
  DateTime: 'Date',
  Json: 'Object',
};

const usedEnums = new Set();

models.forEach(modelStr => {
  const modelName = modelStr.match(/model (\w+)/)[1];
  if (!foundationModels.includes(modelName)) return;

  let classContent = `import java.util.*;\n\npublic class ${modelName} {\n`;

  const lines = modelStr.split('\n').slice(1, -1);
  lines.forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('//') || line.startsWith('@@')) return;

    const parts = line.split(/\s+/);
    if (parts.length < 2) return;

    const fieldName = parts[0];
    let rawType = parts[1].replace('?', '');

    const bareType = rawType.replace('[]', '');

    // Only keep parent-side List<Child> — gives one association line per relationship
    // Skip child-side back-refs to avoid duplicate lines in VP
    if (foundationModels.includes(bareType)) {
      if (rawType.endsWith('[]')) {
        classContent += `    private List<${bareType}> ${fieldName};\n`;
      }
      return;
    }

    let fieldType = TYPE_MAP[rawType];

    if (!fieldType) {
      if (enums.includes(bareType)) {
        fieldType = rawType.endsWith('[]') ? `List<${bareType}>` : bareType;
        usedEnums.add(bareType);
      } else {
        return;
      }
    }

    classContent += `    private ${fieldType} ${fieldName};\n`;
  });

  classContent += `}\n`;
  fs.writeFileSync(path.join(outDir, `${modelName}.java`), classContent);
});

// Write only the enums actually referenced by Foundation models — with real values
usedEnums.forEach(enumName => {
  const values = enumMap[enumName] || [];
  const body = values.length > 0 ? `\n    ${values.join(',\n    ')}\n` : '';
  const classContent = `public enum ${enumName} {${body}}\n`;
  fs.writeFileSync(path.join(outDir, `${enumName}.java`), classContent);
});

console.log(`✅ Generated ${foundationModels.length} classes + ${usedEnums.size} enums → ${outDir}`);
