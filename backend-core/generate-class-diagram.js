const fs = require('fs');
const schema = fs.readFileSync('./prisma/schema.prisma', 'utf-8');

const lines = schema.split('\n');
let isModel = false;
let isEnum = false;
let currentModel = '';
let models = {};
let enums = {};
let relations = [];

for (const line of lines) {
  const tLine = line.trim();
  if (tLine.startsWith('model ')) {
    isModel = true;
    currentModel = tLine.split(' ')[1];
    models[currentModel] = [];
  } else if (tLine.startsWith('enum ')) {
    isEnum = true;
    currentModel = tLine.split(' ')[1];
    enums[currentModel] = [];
  } else if (tLine.startsWith('}')) {
    isModel = false;
    isEnum = false;
  } else if (isModel && tLine.length > 0 && !tLine.startsWith('@@') && !tLine.startsWith('//')) {
    // Parse field
    const parts = tLine.split(/\s+/);
    const fieldName = parts[0];
    const fieldType = parts[1];
    
    if (!fieldType) continue;
    
    // Relation detection (usually starts with capital letter)
    const baseType = fieldType.replace('[]', '').replace('?', '');
    const isRelation = baseType.match(/^[A-Z]/) && baseType !== 'String' && baseType !== 'Int' && baseType !== 'DateTime' && baseType !== 'Boolean' && baseType !== 'Float' && baseType !== 'Json';

    if (isRelation) {
      const isArray = fieldType.includes('[]');
      const toMany = isArray ? '"*"' : '"1"';
      relations.push(`${currentModel} --> ${toMany} ${baseType} : ${fieldName}`);
      // Also add it as an attribute just to see it in class
      // models[currentModel].push(`+${baseType} ${fieldName}`);
    } else {
      models[currentModel].push(`+${fieldType} ${fieldName}`);
    }
  } else if (isEnum && tLine.length > 0 && !tLine.startsWith('//')) {
    const enumVal = tLine.split(/\s+/)[0];
    enums[currentModel].push(`+${enumVal}`);
  }
}

let mermaid = 'classDiagram\n';

for (const [enumName, vals] of Object.entries(enums)) {
  mermaid += `  class ${enumName} {\n    <<enumeration>>\n`;
  for (const val of vals) {
    mermaid += `    ${val}\n`;
  }
  mermaid += `  }\n`;
}

for (const [model, fields] of Object.entries(models)) {
  mermaid += `  class ${model} {\n`;
  for (const field of fields) {
    mermaid += `    ${field}\n`;
  }
  mermaid += `  }\n`;
}

// Deduplicate relations
const uniqueRelations = [...new Set(relations)];
for (const rel of uniqueRelations) {
  mermaid += `  ${rel}\n`;
}

fs.writeFileSync('../thesis_paper/class_diagram/Lexon_Class_Diagram.mmd', mermaid);
console.log('Mermaid class diagram generated.');
