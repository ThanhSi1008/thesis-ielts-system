const fs = require("fs");
const path = require("path");

const SCHEMA_PATH = path.join(__dirname, "../../backend-core/prisma/schema.prisma");
const OUTPUT_CORE = path.join(__dirname, "class-diagram-core.mdj");
const OUTPUT_IELTS = path.join(__dirname, "class-diagram-ielts.mdj");

const IELTS_MODELS = new Set([
  "IeltsProfile",
  "IeltsBasicSkill",
  "IeltsBasicLesson",
  "IeltsBasicListeningExercise",
  "IeltsBasicReadingExercise",
  "IeltsBasicWritingExercise",
  "IeltsBasicSpeakingExercise",
  "IeltsBasicProgress",
  "IeltsBasicWritingAnswer",
  "IeltsAdvancedListeningPart",
  "IeltsAdvancedListeningSession",
  "IeltsAdvancedReadingPart",
  "IeltsAdvancedReadingSession",
  "IeltsAdvancedWritingPrompt",
  "IeltsAdvancedWritingSession",
  "IeltsAdvancedSpeakingPart",
  "IeltsAdvancedSpeakingSession",
  "FoundationVocabBook",
  "FoundationVocabUnit",
  "FoundationVocabItem",
  "FoundationVocabExercise",
  "FoundationVocabQuestion",
  "FoundationVocabProgress",
  "FoundationVocabLesson",
  "FoundationVocabWord",
  "Grammar",
  "FoundationGrammarBook",
  "FoundationGrammarUnit",
  "FoundationGrammarExercise",
  "FoundationGrammarProgress",
  "FoundationPronunciationSound",
  "FoundationSoundExample",
  "FoundationPronunciationProgress",
  "FoundationPronunciationAttempt",
]);

const PRISMA_TO_UML = new Map([
  ["String", "String"],
  ["String[]", "String[]"],
  ["Int", "Integer"],
  ["Int[]", "Integer[]"],
  ["Float", "Double"],
  ["Float[]", "Double[]"],
  ["Boolean", "Boolean"],
  ["Boolean[]", "Boolean[]"],
  ["DateTime", "Date"],
  ["DateTime[]", "Date[]"],
  ["Json", "Object"],
  ["Json[]", "Object[]"],
]);

let idCounter = 1;
function nextId() {
  return `id_${idCounter++}`;
}

function getBaseType(rawType) {
  return rawType.replace(/\?/g, "").replace(/\[\]$/, "");
}

function isArrayType(rawType) {
  return rawType.replace(/\?/g, "").endsWith("[]");
}

function isOptionalType(rawType) {
  return rawType.includes("?");
}

function toMultiplicity(rawType) {
  if (isArrayType(rawType)) return "0..*";
  if (isOptionalType(rawType)) return "0..1";
  return "1";
}

function prismaTypeToUml(rawType, modelNames, enumNames) {
  const normalized = rawType.replace(/\?/g, "");
  const base = getBaseType(normalized);
  if (PRISMA_TO_UML.has(normalized)) return PRISMA_TO_UML.get(normalized);
  if (enumNames.has(base)) return base;
  if (modelNames.has(base)) return null;
  if (PRISMA_TO_UML.has(base)) return PRISMA_TO_UML.get(base);
  return base;
}

function parseSchema(schemaText) {
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  const enumRegex = /enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g;

  const models = [];
  const enums = [];
  let match;

  while ((match = modelRegex.exec(schemaText)) !== null) {
    const modelName = match[1];
    const block = match[2];
    const fields = [];
    const rawFieldLines = [];

    for (const rawLine of block.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("//") || line.startsWith("@@")) continue;
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;
      const fieldName = parts[0];
      const fieldType = parts[1];
      fields.push({ fieldName, fieldType, line });
      rawFieldLines.push(line);
    }

    models.push({ name: modelName, fields, rawFieldLines });
  }

  while ((match = enumRegex.exec(schemaText)) !== null) {
    const enumName = match[1];
    const block = match[2];
    const literals = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//") && !line.startsWith("@@"));
    enums.push({ name: enumName, literals });
  }

  return { models, enums };
}

function collectAssociations(modelsByName) {
  const associations = [];
  const seen = new Set();

  for (const model of modelsByName.values()) {
    for (const field of model.fields) {
      const fieldTypeBase = getBaseType(field.fieldType);
      if (!modelsByName.has(fieldTypeBase)) continue;
      if (!field.line.includes("@relation(") || !field.line.includes("fields:")) continue;

      const sourceModel = model.name;
      const targetModel = fieldTypeBase;
      const relationNameMatch = field.line.match(/@relation\("([^"]+)"\)/);
      const relationName = relationNameMatch ? relationNameMatch[1] : null;

      const inverseModel = modelsByName.get(targetModel);
      let inverseField = null;

      for (const candidate of inverseModel.fields) {
        if (getBaseType(candidate.fieldType) !== sourceModel) continue;
        if (relationName) {
          const inverseRelMatch = candidate.line.match(/@relation\("([^"]+)"\)/);
          if (!inverseRelMatch || inverseRelMatch[1] !== relationName) continue;
        }
        inverseField = candidate;
        break;
      }

      const sourceMult = inverseField ? toMultiplicity(inverseField.fieldType) : "0..*";
      const targetMult = toMultiplicity(field.fieldType);
      const dedupeKey = relationName
        ? `${sourceModel}|${targetModel}|${relationName}`
        : `${sourceModel}|${targetModel}|${field.fieldName}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      associations.push({
        sourceModel,
        targetModel,
        sourceMultiplicity: sourceMult,
        targetMultiplicity: targetMult,
      });
    }
  }

  return associations;
}

function buildMdj({
  projectName,
  diagramName,
  models,
  enums,
  includeModelNames,
  includeEnumNames,
  associations,
}) {
  idCounter = 1;
  const projectId = nextId();
  const umlModelId = nextId();
  const diagramId = nextId();

  const classIdByName = new Map();
  const enumIdByName = new Map();
  const elements = [];
  const views = [];

  const includedModels = models
    .filter((m) => includeModelNames.has(m.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const includedEnums = enums
    .filter((e) => includeEnumNames.has(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const model of includedModels) {
    const classId = nextId();
    classIdByName.set(model.name, classId);
    const cls = {
      _type: "UMLClass",
      _id: classId,
      _parent: { $ref: umlModelId },
      name: model.name,
      attributes: [],
    };

    for (const attr of model.attributes) {
      cls.attributes.push({
        _type: "UMLAttribute",
        _id: nextId(),
        _parent: { $ref: classId },
        name: attr.name,
        type: attr.type,
        visibility: "private",
      });
    }

    elements.push(cls);
  }

  for (const en of includedEnums) {
    const enumId = nextId();
    enumIdByName.set(en.name, enumId);
    const enm = {
      _type: "UMLEnumeration",
      _id: enumId,
      _parent: { $ref: umlModelId },
      name: en.name,
      literals: [],
    };

    for (const literal of en.literals) {
      enm.literals.push({
        _type: "UMLEnumerationLiteral",
        _id: nextId(),
        _parent: { $ref: enumId },
        name: literal,
      });
    }

    elements.push(enm);
  }

  const visualOrder = [...includedModels.map((m) => m.name), ...includedEnums.map((e) => e.name)];
  const viewIdByElementName = new Map();

  visualOrder.forEach((name, i) => {
    const modelId = classIdByName.get(name) || enumIdByName.get(name);
    const viewId = nextId();
    viewIdByElementName.set(name, viewId);
    const left = (i % 6) * 280 + 50;
    const top = Math.floor(i / 6) * 400 + 50;
    views.push({
      _type: "UMLClassView",
      _id: viewId,
      _parent: { $ref: diagramId },
      model: { $ref: modelId },
      left,
      top,
      width: 200,
      height: 0,
      autoResize: true,
    });
  });

  let assocCount = 0;
  for (const assoc of associations) {
    if (!includeModelNames.has(assoc.sourceModel) || !includeModelNames.has(assoc.targetModel)) continue;
    const sourceClassId = classIdByName.get(assoc.sourceModel);
    const targetClassId = classIdByName.get(assoc.targetModel);
    if (!sourceClassId || !targetClassId) continue;

    const assocId = nextId();
    const end1Id = nextId();
    const end2Id = nextId();
    elements.push({
      _type: "UMLAssociation",
      _id: assocId,
      _parent: { $ref: umlModelId },
      end1: {
        _type: "UMLAssociationEnd",
        _id: end1Id,
        _parent: { $ref: assocId },
        reference: { $ref: sourceClassId },
        multiplicity: assoc.sourceMultiplicity,
      },
      end2: {
        _type: "UMLAssociationEnd",
        _id: end2Id,
        _parent: { $ref: assocId },
        reference: { $ref: targetClassId },
        multiplicity: assoc.targetMultiplicity,
      },
    });

    const tailViewId = viewIdByElementName.get(assoc.sourceModel);
    const headViewId = viewIdByElementName.get(assoc.targetModel);
    views.push({
      _type: "UMLAssociationView",
      _id: nextId(),
      _parent: { $ref: diagramId },
      model: { $ref: assocId },
      head: { $ref: headViewId },
      tail: { $ref: tailViewId },
      lineStyle: 1,
    });
    assocCount += 1;
  }

  const diagram = {
    _type: "UMLClassDiagram",
    _id: diagramId,
    _parent: { $ref: umlModelId },
    name: diagramName,
    ownedViews: views,
  };

  const model = {
    _type: "UMLModel",
    _id: umlModelId,
    _parent: { $ref: projectId },
    name: "Model",
    ownedElements: [...elements, diagram],
  };

  const project = {
    _type: "Project",
    _id: projectId,
    name: projectName,
    ownedElements: [model],
  };

  validateMdj(project);
  return {
    project,
    stats: {
      classes: includedModels.length,
      enums: includedEnums.length,
      associations: assocCount,
    },
  };
}

function validateMdj(project) {
  const ids = new Set();
  const refs = [];

  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (node._id) {
      if (ids.has(node._id)) {
        throw new Error(`Duplicate _id detected: ${node._id}`);
      }
      ids.add(node._id);
    }
    if (node.$ref) refs.push(node.$ref);
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    for (const value of Object.values(node)) {
      walk(value);
    }
  }

  walk(project);
  for (const ref of refs) {
    if (!ids.has(ref)) {
      throw new Error(`Unresolved $ref detected: ${ref}`);
    }
  }
}

function main() {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  const { models, enums } = parseSchema(schema);
  const modelNames = new Set(models.map((m) => m.name));
  const enumNames = new Set(enums.map((e) => e.name));
  const modelsByName = new Map(models.map((m) => [m.name, m]));
  const associations = collectAssociations(modelsByName);

  const parsedModels = models.map((m) => {
    const attributes = [];
    for (const field of m.fields) {
      const umlType = prismaTypeToUml(field.fieldType, modelNames, enumNames);
      if (!umlType) continue;
      attributes.push({ name: field.fieldName, type: umlType });
    }
    return { name: m.name, attributes };
  });

  const ieltsModelSet = new Set(
    parsedModels
      .map((m) => m.name)
      .filter((name) => IELTS_MODELS.has(name) || name === "User"),
  );
  const coreModelSet = new Set(
    parsedModels
      .map((m) => m.name)
      .filter((name) => !IELTS_MODELS.has(name) || name === "User"),
  );

  const enumUsageCore = new Set();
  const enumUsageIelts = new Set();
  const parsedByName = new Map(parsedModels.map((m) => [m.name, m]));
  for (const modelName of coreModelSet) {
    const model = parsedByName.get(modelName);
    for (const attr of model.attributes) {
      if (enumNames.has(attr.type)) enumUsageCore.add(attr.type);
    }
  }
  for (const modelName of ieltsModelSet) {
    const model = parsedByName.get(modelName);
    for (const attr of model.attributes) {
      if (enumNames.has(attr.type)) enumUsageIelts.add(attr.type);
    }
  }

  const coreResult = buildMdj({
    projectName: "TOEIC System - Core",
    diagramName: "Core Diagram",
    models: parsedModels,
    enums,
    includeModelNames: coreModelSet,
    includeEnumNames: enumUsageCore,
    associations,
  });

  const ieltsResult = buildMdj({
    projectName: "TOEIC System - IELTS",
    diagramName: "IELTS Diagram",
    models: parsedModels,
    enums,
    includeModelNames: ieltsModelSet,
    includeEnumNames: enumUsageIelts,
    associations,
  });

  fs.writeFileSync(OUTPUT_CORE, `${JSON.stringify(coreResult.project, null, 2)}\n`, "utf8");
  fs.writeFileSync(OUTPUT_IELTS, `${JSON.stringify(ieltsResult.project, null, 2)}\n`, "utf8");

  console.log(
    `[core] classes=${coreResult.stats.classes}, enums=${coreResult.stats.enums}, associations=${coreResult.stats.associations}`,
  );
  console.log(
    `[ielts] classes=${ieltsResult.stats.classes}, enums=${ieltsResult.stats.enums}, associations=${ieltsResult.stats.associations}`,
  );
  console.log("Generated:", OUTPUT_CORE);
  console.log("Generated:", OUTPUT_IELTS);
}

main();
