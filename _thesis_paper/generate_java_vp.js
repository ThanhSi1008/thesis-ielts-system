const fs = require('fs');
const path = require('path');

const ieltsModels = [
    'IeltsProfile', 'IeltsBasicSkill', 'IeltsBasicLesson', 'IeltsBasicListeningExercise',
    'IeltsBasicReadingExercise', 'IeltsBasicWritingExercise', 'IeltsBasicSpeakingExercise',
    'IeltsBasicProgress', 'IeltsBasicWritingAnswer', 'IeltsAdvancedListeningPart',
    'IeltsAdvancedListeningSession', 'IeltsAdvancedReadingPart', 'IeltsAdvancedReadingSession',
    'IeltsAdvancedWritingPrompt', 'IeltsAdvancedWritingSession', 'IeltsAdvancedSpeakingPart',
    'IeltsAdvancedSpeakingSession', 'FoundationVocabBook', 'FoundationVocabUnit',
    'FoundationVocabItem', 'FoundationVocabExercise', 'FoundationVocabQuestion',
    'FoundationVocabProgress', 'FoundationVocabLesson', 'FoundationVocabWord',
    'Grammar', 'FoundationGrammarBook', 'FoundationGrammarUnit', 'FoundationGrammarExercise',
    'FoundationGrammarProgress', 'FoundationPronunciationSound', 'FoundationSoundExample',
    'FoundationPronunciationProgress', 'FoundationPronunciationAttempt'
];

const schemaPath = path.join(__dirname, '../backend-core/prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf-8');

const ieltsDir = path.join(__dirname, 'vp_java_ielts');
const coreDir = path.join(__dirname, 'vp_java_core');

if (!fs.existsSync(ieltsDir)) fs.mkdirSync(ieltsDir, { recursive: true });
if (!fs.existsSync(coreDir)) fs.mkdirSync(coreDir, { recursive: true });

// Basic regex to match enum names so we don't treat them as missing classes
const enums = [...schema.matchAll(/enum (\w+)/g)].map(m => m[1]);

const models = schema.match(/model \w+ \{[\s\S]*?\}/g);

models.forEach(modelStr => {
    const modelName = modelStr.match(/model (\w+)/)[1];
    let classContent = `import java.util.*;\n\npublic class ${modelName} {\n`;
    
    const lines = modelStr.split('\n').slice(1, -1);
    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('//') || line.startsWith('@@')) return;
        
        const parts = line.split(/\s+/);
        if (parts.length < 2) return;

        const fieldName = parts[0];
        let fieldType = parts[1].replace('?', ''); // Remove optional marker
        
        // Convert Prisma types to Java types
        if (fieldType === 'String') fieldType = 'String';
        else if (fieldType === 'String[]') fieldType = 'List<String>';
        else if (fieldType === 'Int') fieldType = 'Integer';
        else if (fieldType === 'Int[]') fieldType = 'List<Integer>';
        else if (fieldType === 'Float') fieldType = 'Double';
        else if (fieldType === 'Float[]') fieldType = 'List<Double>';
        else if (fieldType === 'Boolean') fieldType = 'Boolean';
        else if (fieldType === 'DateTime') fieldType = 'Date';
        else if (fieldType === 'Json') fieldType = 'Object';
        else if (fieldType.endsWith('[]')) {
            fieldType = `List<${fieldType.replace('[]', '')}>`;
        }
        
        classContent += `    private ${fieldType} ${fieldName};\n`;
    });
    
    classContent += `}\n`;
    
    // Add user to both for associations
    if (ieltsModels.includes(modelName) || modelName === 'User') {
        fs.writeFileSync(path.join(ieltsDir, `${modelName}.java`), classContent);
    }
    
    if (!ieltsModels.includes(modelName) || modelName === 'User') {
        fs.writeFileSync(path.join(coreDir, `${modelName}.java`), classContent);
    }
});

// Create dummy Enums to prevent VP from complaining about missing types
enums.forEach(enumName => {
    const classContent = `public enum ${enumName} {}\n`;
    fs.writeFileSync(path.join(ieltsDir, `${enumName}.java`), classContent);
    fs.writeFileSync(path.join(coreDir, `${enumName}.java`), classContent);
});

console.log('Java classes generated for Visual Paradigm import.');
