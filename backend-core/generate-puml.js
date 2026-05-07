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
    const parts = tLine.split(/\s+/);
    const fieldName = parts[0];
    const fieldType = parts[1];
    
    if (!fieldType) continue;
    
    const baseType = fieldType.replace('[]', '').replace('?', '');
    const isRelation = baseType.match(/^[A-Z]/) && baseType !== 'String' && baseType !== 'Int' && baseType !== 'DateTime' && baseType !== 'Boolean' && baseType !== 'Float' && baseType !== 'Json';

    if (isRelation) {
      const isArray = fieldType.includes('[]');
      const multiplicity = isArray ? '"0..*"' : '"1"';
      // Store relation
      relations.push(`${currentModel} "1" -- ${multiplicity} ${baseType}`);
    } else {
      models[currentModel].push(`  - ${fieldName}: ${fieldType}`);
    }
  } else if (isEnum && tLine.length > 0 && !tLine.startsWith('//')) {
    const enumVal = tLine.split(/\s+/)[0];
    enums[currentModel].push(`  + ${enumVal}`);
  }
}

let puml = '@startuml\n';
puml += 'skinparam linetype ortho\n';
puml += 'skinparam classAttributeIconSize 0\n';
puml += 'hide methods\n\n';

for (const [enumName, vals] of Object.entries(enums)) {
  puml += `enum ${enumName} {\n`;
  for (const val of vals) {
    puml += `${val}\n`;
  }
  puml += `}\n\n`;
}

for (const [model, fields] of Object.entries(models)) {
  puml += `class ${model} {\n`;
  for (const field of fields) {
    puml += `${field}\n`;
  }
  puml += `}\n\n`;
}

const uniqueRelations = [...new Set(relations)];
for (const rel of uniqueRelations) {
  puml += `${rel}\n`;
}

puml += '\n@enduml\n';

fs.writeFileSync('../thesis_paper/class_diagram/Lexon_Class_Diagram.puml', puml);
console.log('PlantUML class diagram generated.');
