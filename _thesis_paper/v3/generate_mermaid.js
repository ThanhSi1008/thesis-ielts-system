const fs = require("fs");
const path = require("path");

const SCHEMA_PATH = path.join(__dirname, "../../backend-core/prisma/schema.prisma");

const CORE_CATEGORIES = {
  "User & Auth": ["User"],
  "Exam & Assessment": ["Exam", "ExamSession", "Result"],
  "Learning Materials": ["LearningMaterial", "LearningProgress"],
  "Vocab Lab (Flashcards)": [
    "Deck",
    "Flashcard",
    "FlashcardReview",
    "CardType",
    "CardTypeField",
    "CardTemplate",
    "SharedDeck",
  ],
  "Question Notes": ["QuestionNote"],
  Shadowing: ["ShadowingVideo", "ShadowingFolder", "ShadowingProgress"],
  Dictation: ["DictationVideo", "DictationFolder", "DictationProgress"],
  "Community & Social": ["Post", "Comment", "PostLike", "PostBookmark"],
  Gamification: ["Achievement", "UserAchievement", "XpLog"],
  "Notifications & Links": ["Notification", "StudentTeacherLink"],
  "Subscription & Billing": ["Subscription", "Payment", "UsageRecord", "PricingPlan"],
};

const IELTS_CATEGORIES = {
  "User & Profile": ["User", "IeltsProfile"],
  "Foundation Vocab Book": [
    "FoundationVocabBook",
    "FoundationVocabUnit",
    "FoundationVocabItem",
    "FoundationVocabExercise",
    "FoundationVocabQuestion",
    "FoundationVocabProgress",
  ],
  "Foundation Vocab Lesson": ["FoundationVocabLesson", "FoundationVocabWord", "Grammar"],
  "Foundation Grammar": [
    "FoundationGrammarBook",
    "FoundationGrammarUnit",
    "FoundationGrammarExercise",
    "FoundationGrammarProgress",
  ],
  "Foundation Pronunciation": [
    "FoundationPronunciationSound",
    "FoundationSoundExample",
    "FoundationPronunciationProgress",
    "FoundationPronunciationAttempt",
  ],
  "IELTS Basic": [
    "IeltsBasicSkill",
    "IeltsBasicLesson",
    "IeltsBasicListeningExercise",
    "IeltsBasicReadingExercise",
    "IeltsBasicWritingExercise",
    "IeltsBasicSpeakingExercise",
    "IeltsBasicProgress",
    "IeltsBasicWritingAnswer",
  ],
  "IELTS Advanced": [
    "IeltsAdvancedListeningPart",
    "IeltsAdvancedListeningSession",
    "IeltsAdvancedReadingPart",
    "IeltsAdvancedReadingSession",
    "IeltsAdvancedWritingPrompt",
    "IeltsAdvancedWritingSession",
    "IeltsAdvancedSpeakingPart",
    "IeltsAdvancedSpeakingSession",
  ],
};

const CORE_ENUM_GROUP = {
  UserRole: "User & Auth",
  ExamType: "Exam & Assessment",
  Difficulty: "Exam & Assessment",
  SessionStatus: "Exam & Assessment",
  MaterialType: "Learning Materials",
  CardState: "Vocab Lab (Flashcards)",
  PostType: "Community & Social",
  NotificationType: "Notifications & Links",
  SubscriptionTier: "Subscription & Billing",
  SubscriptionStatus: "Subscription & Billing",
  PaymentProvider: "Subscription & Billing",
};

const IELTS_ENUM_GROUP = {
  UserRole: "User & Profile",
  Difficulty: "Foundation Vocab Lesson",
  PronunciationStatus: "Foundation Pronunciation",
  PronunciationMastery: "Foundation Pronunciation",
};

const TYPE_MAP = {
  String: "String",
  "String[]": "StringArray",
  Int: "Int",
  "Int[]": "IntArray",
  Float: "Float",
  Boolean: "Boolean",
  DateTime: "Date",
  Json: "Object",
};

function baseType(type) {
  return type.replace(/\?/g, "").replace(/\[\]$/, "");
}
function cleanType(type) {
  return type.replace(/\?/g, "");
}
function isArray(type) {
  return cleanType(type).endsWith("[]");
}
function isOptional(type) {
  return type.includes("?");
}
function mapType(type) {
  return TYPE_MAP[type] || TYPE_MAP[baseType(type)] || type;
}

function parseSchema(schema) {
  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  const enumRegex = /enum\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  const models = [];
  const enums = [];

  let m;
  while ((m = modelRegex.exec(schema)) !== null) {
    const name = m[1];
    const body = m[2];
    const fields = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//") && !line.startsWith("@@"))
      .map((line) => {
        const parts = line.split(/\s+/);
        return {
          name: parts[0],
          type: parts[1],
          line,
        };
      })
      .filter((f) => f.name && f.type);
    models.push({ name, fields });
  }

  while ((m = enumRegex.exec(schema)) !== null) {
    const name = m[1];
    const body = m[2];
    const literals = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//") && !line.startsWith("@@"));
    enums.push({ name, literals });
  }
  return { models, enums };
}

function buildDiagramData(models, enums) {
  const modelNames = new Set(models.map((m) => m.name));
  const enumNames = new Set(enums.map((e) => e.name));

  const classes = new Map();
  const relationships = [];
  const relSeen = new Set();

  for (const model of models) {
    const attributes = [];
    for (const field of model.fields) {
      const bt = baseType(field.type);
      const isRelation = modelNames.has(bt);
      if (!isRelation) {
        const mapped = enumNames.has(bt) ? bt : mapType(cleanType(field.type));
        attributes.push({ name: field.name, type: mapped });
      } else {
        if (!field.line.includes("@relation(") || !field.line.includes("fields:")) continue;
        if (isArray(field.type)) continue;
        const source = model.name;
        const target = bt;
        const sourceMult = isOptional(field.type) ? "0..1" : "0..*";
        const key = `${target}-${source}-${field.name}`;
        if (relSeen.has(key)) continue;
        relSeen.add(key);
        relationships.push({
          left: target,
          leftMult: "1",
          right: source,
          rightMult: sourceMult,
        });
      }
    }
    classes.set(model.name, attributes);
  }

  const enumDependencies = [];
  const depSeen = new Set();
  for (const [className, attrs] of classes.entries()) {
    for (const attr of attrs) {
      if (!enumNames.has(attr.type)) continue;
      const key = `${className}->${attr.type}`;
      if (depSeen.has(key)) continue;
      depSeen.add(key);
      enumDependencies.push({ from: className, to: attr.type });
    }
  }

  return { classes, enums, relationships, enumDependencies };
}

function renderDiagram({
  outputPath,
  categories,
  enumGroupMap,
  classes,
  enums,
  relationships,
  enumDependencies,
}) {
  const categoryNames = Object.keys(categories);
  const modelSet = new Set(categoryNames.flatMap((cat) => categories[cat]));
  const classToGroup = new Map();
  for (const cat of categoryNames) {
    for (const model of categories[cat]) classToGroup.set(model, cat);
  }

  const filteredRels = relationships.filter((r) => modelSet.has(r.left) && modelSet.has(r.right));
  const filteredDeps = enumDependencies.filter((d) => modelSet.has(d.from));

  const usedEnums = new Set(filteredDeps.map((d) => d.to));
  const enumMap = new Map(enums.map((e) => [e.name, e]));

  const lines = ["classDiagram"];
  const renderedEnums = new Set();
  const renderedRels = new Set();
  const renderedDeps = new Set();
  const crossGroupRels = [];
  const crossGroupDeps = [];

  for (const cat of categoryNames) {
    lines.push(`    %% ══════════════ ${cat} ══════════════`);

    for (const model of categories[cat]) {
      const attrs = classes.get(model) || [];
      lines.push(`    class ${model} {`);
      for (const attr of attrs) lines.push(`        -${attr.name} : ${attr.type}`);
      lines.push("    }");
    }

    for (const enumName of Object.keys(enumGroupMap)) {
      if (enumGroupMap[enumName] !== cat || !usedEnums.has(enumName) || renderedEnums.has(enumName)) continue;
      const en = enumMap.get(enumName);
      if (!en) continue;
      lines.push(`    class ${enumName} {`);
      lines.push("        <<enumeration>>");
      for (const lit of en.literals) lines.push(`        ${lit}`);
      lines.push("    }");
      renderedEnums.add(enumName);
    }

    for (const r of filteredRels) {
      const leftGroup = classToGroup.get(r.left);
      const rightGroup = classToGroup.get(r.right);
      const statement = `    ${r.left} "${r.leftMult}" -- "${r.rightMult}" ${r.right}`;
      const key = `${r.left}|${r.leftMult}|${r.rightMult}|${r.right}`;
      if (renderedRels.has(key)) continue;
      if (leftGroup === cat && rightGroup === cat) {
        lines.push(statement);
        renderedRels.add(key);
      } else if (leftGroup === cat || rightGroup === cat) {
        crossGroupRels.push({ key, statement });
      }
    }

    for (const d of filteredDeps) {
      const classGroup = classToGroup.get(d.from);
      const enumGroup = enumGroupMap[d.to];
      const statement = `    ${d.from} ..> ${d.to}`;
      const key = `${d.from}|${d.to}`;
      if (renderedDeps.has(key)) continue;
      if (classGroup === cat && enumGroup === cat) {
        lines.push(statement);
        renderedDeps.add(key);
      } else if (classGroup === cat || enumGroup === cat) {
        crossGroupDeps.push({ key, statement });
      }
    }
    lines.push("");
  }

  const finalCrossRels = crossGroupRels.filter((r) => !renderedRels.has(r.key));
  const finalCrossDeps = crossGroupDeps.filter((d) => !renderedDeps.has(d.key));
  if (finalCrossRels.length || finalCrossDeps.length) {
    lines.push("    %% ══════════════ Cross-Group Relationships ══════════════");
    for (const r of finalCrossRels) {
      lines.push(r.statement);
      renderedRels.add(r.key);
    }
    for (const d of finalCrossDeps) {
      lines.push(d.statement);
      renderedDeps.add(d.key);
    }
  }

  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
  return {
    models: modelSet.size,
    enums: usedEnums.size,
    relationships: renderedRels.size,
    enumDependencies: renderedDeps.size,
  };
}

function main() {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  const { models, enums } = parseSchema(schema);
  const { classes, relationships, enumDependencies } = buildDiagramData(models, enums);

  const coreStats = renderDiagram({
    outputPath: path.join(__dirname, "core-community.mmd"),
    categories: CORE_CATEGORIES,
    enumGroupMap: CORE_ENUM_GROUP,
    classes,
    enums,
    relationships,
    enumDependencies,
  });

  const ieltsStats = renderDiagram({
    outputPath: path.join(__dirname, "ielts-foundation.mmd"),
    categories: IELTS_CATEGORIES,
    enumGroupMap: IELTS_ENUM_GROUP,
    classes,
    enums,
    relationships,
    enumDependencies,
  });

  console.log("[core-community]", coreStats);
  console.log("[ielts-foundation]", ieltsStats);
}

main();
