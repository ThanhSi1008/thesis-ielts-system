const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'ielts-basic-compiled', 'writing_task_1_exercises.txt');
const outputPath = path.join(__dirname, 'ielts-basic-compiled', 'writing_task_1_cloze_auto.json');

const text = fs.readFileSync(inputPath, 'utf-8').replace(/\r\n/g, '\n');
const lines = text.split('\n');

const dict = {
  "illustrates": ["shows", "describes", "compares"],
  "illustrate": ["show", "describe", "compare"],
  "shows": ["illustrates", "describes", "compares"],
  "compares": ["illustrates", "shows", "describes"],
  "declined": ["increased", "fluctuated", "remained stable"],
  "decline": ["increase", "fluctuation", "stability"],
  "decreased": ["increased", "fluctuated", "stabilized"],
  "decrease": ["increase", "fluctuation", "stability"],
  "drop": ["rise", "fluctuation", "stability"],
  "dropped": ["rose", "fluctuated", "stabilized"],
  "fall": ["rise", "fluctuation", "stability"],
  "falling": ["rising", "fluctuating", "stabilizing"],
  "rose": ["fell", "fluctuated", "stabilized"],
  "rise": ["fall", "fluctuation", "stability"],
  "increased": ["decreased", "fluctuated", "remained stable"],
  "increase": ["decrease", "fluctuation", "stability"],
  "grew": ["shrank", "fluctuated", "stabilized"],
  "growing": ["shrinking", "fluctuating", "stabilizing"],
  "Overall,": ["In detail,", "To begin,", "Finally,"],
  "Conversely,": ["Similarly,", "Likewise,", "In addition,"],
  "Similarly,": ["Conversely,", "By contrast,", "On the other hand,"],
  "Meanwhile,": ["Therefore,", "As a result,", "Because of this,"],
  "Furthermore,": ["However,", "Nevertheless,", "Although,"],
  "In addition,": ["On the other hand,", "Conversely,", "However,"],
  "significant": ["minimal", "negligible", "slight"],
  "significantly": ["slightly", "minimally", "negligibly"],
  "dramatic": ["slight", "gradual", "steady"],
  "dramatically": ["slightly", "gradually", "steadily"],
  "progressive": ["sudden", "abrupt", "rapid"],
  "gradual": ["sudden", "abrupt", "rapid"],
  "gradually": ["suddenly", "abruptly", "rapidly"],
  "steady": ["erratic", "unpredictable", "sudden"],
  "steadily": ["erratically", "unpredictably", "suddenly"],
  "fluctuated": ["remained stable", "increased steadily", "decreased gradually"],
  "fluctuations": ["stability", "constant growth", "steady decline"],
  "approximately": ["exactly", "precisely", "completely"],
  "roughly": ["exactly", "precisely", "completely"],
  "almost": ["exactly", "precisely", "completely"],
  "majority": ["minority", "half", "quarter"],
  "minority": ["majority", "half", "quarter"],
  "highest": ["lowest", "average", "median"],
  "lowest": ["highest", "average", "median"],
  "surpass": ["fall behind", "equal", "match"],
  "surpassed": ["fell behind", "equaled", "matched"],
  "respectively": ["together", "collectively", "simultaneously"],
  "proportion": ["amount", "number", "total"],
  "percentage": ["amount", "number", "total"],
  "comprises": ["excludes", "omits", "lacks"]
};

const task2Dict = {
  // ── Opinion markers ──
  "argued": ["denied", "proven", "forgotten"],
  "believe": ["doubt", "deny", "assume"],
  "convinced": ["uncertain", "skeptical", "doubtful"],
  "maintain": ["deny", "reject", "question"],
  "contend": ["deny", "concede", "reject"],

  // ── Argument starters / Linking ──
  "Furthermore,": ["However,", "Nevertheless,", "Although,"],
  "Moreover,": ["However,", "Nevertheless,", "Conversely,"],
  "Additionally,": ["However,", "Conversely,", "Nevertheless,"],
  "Consequently,": ["Similarly,", "Meanwhile,", "Furthermore,"],
  "Therefore,": ["However,", "Similarly,", "Meanwhile,"],
  "Nevertheless,": ["Furthermore,", "Moreover,", "Additionally,"],
  "However,": ["Furthermore,", "Moreover,", "Additionally,"],
  "Conversely,": ["Similarly,", "Likewise,", "Furthermore,"],

  // ── Cause / effect ──
  "consequently": ["similarly", "conversely", "meanwhile"],
  "therefore": ["however", "similarly", "meanwhile"],
  "thus": ["however", "likewise", "conversely"],

  // ── Concession ──
  "Although": ["Because", "Since", "When"],
  "Despite": ["Because of", "Due to", "Thanks to"],
  "While": ["Since", "Because", "When"],
  "Admittedly,": ["Clearly,", "Obviously,", "Evidently,"],

  // ── Conclusion ──
  "conclusion,": ["detail,", "addition,", "contrast,"],

  // ── Strength/degree ──
  "significant": ["minimal", "negligible", "slight"],
  "significantly": ["slightly", "minimally", "negligibly"],
  "compelling": ["weak", "questionable", "minor"],
  "substantial": ["minimal", "negligible", "slight"],
  "crucial": ["optional", "trivial", "minor"],

  // ── Opinion intensity ──
  "strongly": ["slightly", "somewhat", "partially"],
  "firmly": ["loosely", "somewhat", "vaguely"],

  // ── Topic vocab: Education ──
  "curriculum": ["infrastructure", "legislation", "revenue"],
  "tuition": ["taxation", "inflation", "employment"],
  "scholarship": ["penalty", "subsidy", "donation"],
  "literacy": ["commerce", "tourism", "agriculture"],
  "compulsory": ["optional", "voluntary", "discretionary"],

  // ── Topic vocab: Technology ──
  "innovation": ["tradition", "regulation", "isolation"],
  "automation": ["regulation", "immigration", "conservation"],
  "cybersecurity": ["agriculture", "architecture", "archaeology"],

  // ── Topic vocab: Environment ──
  "sustainability": ["profitability", "productivity", "popularity"],
  "emissions": ["revenues", "investments", "traditions"],
  "renewable": ["conventional", "traditional", "historical"],
  "biodiversity": ["productivity", "profitability", "popularity"],
  "deforestation": ["urbanisation", "industrialisation", "modernisation"],

  // ── Topic vocab: Health ──
  "obesity": ["prosperity", "stability", "popularity"],
  "sedentary": ["active", "mobile", "dynamic"],
  "pandemic": ["celebration", "tradition", "innovation"],

  // ── Topic vocab: Society ──
  "inequality": ["prosperity", "stability", "harmony"],
  "urbanisation": ["conservation", "preservation", "isolation"],
  "globalisation": ["isolation", "conservation", "stagnation"],
  "rehabilitation": ["punishment", "deportation", "incarceration"],
  "deterrent": ["incentive", "reward", "benefit"]
};

let currentTheme = "";
let currentSubcategory = "";
const exercisesToSeed = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith("    - ")) {
    currentTheme = line.replace("    - ", "").trim();
    currentSubcategory = "";
  } else if (line.startsWith("        - ") && !line.includes("- Exercise")) {
    currentSubcategory = line.replace("        - ", "").trim();
  } else if (line.indexOf("- Exercise") !== -1) {
    exercisesToSeed.push({
      theme: currentTheme,
      subCategory: currentSubcategory,
      content: "",
    });
  } else if (exercisesToSeed.length > 0) {
    exercisesToSeed[exercisesToSeed.length - 1].content += line + "\n";
  }
}

let globalBlankId = 1;

function processParagraph(text) {
  // Remove markdown bold
  let cleanText = text.replace(/\*\*/g, '');
  
  let segments = [];
  let words = cleanText.split(/(\s+)/);
  let blanksInParagraph = 0;
  
  for (let w of words) {
    if (!w.trim()) {
      segments.push({ type: "text", value: w });
      continue;
    }
    
    // Exact match or lowercase match
    let keyToMatch = w.trim();
    let isPunctuationSuffix = "";
    if (keyToMatch.endsWith(',') || keyToMatch.endsWith('.')) {
        isPunctuationSuffix = keyToMatch.slice(-1);
        keyToMatch = keyToMatch.slice(0, -1);
    }

    let foundDictKey = null;
    if (dict[keyToMatch]) foundDictKey = keyToMatch;
    else if (dict[keyToMatch.toLowerCase()]) foundDictKey = keyToMatch.toLowerCase();
    else if (dict[w.trim()]) foundDictKey = w.trim(); // Match with punctuation like "Overall,"
    else if (dict[w.trim().toLowerCase()]) foundDictKey = w.trim().toLowerCase();

    if (foundDictKey && blanksInParagraph < 3) {
       let options = [...dict[foundDictKey]];
       let correct = w.trim();
       
       // Handle case preservation
       if (correct[0] === correct[0].toUpperCase()) {
           options = options.map(o => o.charAt(0).toUpperCase() + o.slice(1));
       }
       
       options.push(correct);
       // shuffle options
       options.sort(() => Math.random() - 0.5);

       segments.push({
         type: "blank",
         id: `b${globalBlankId++}`,
         correctAnswer: correct,
         options: options
       });
       blanksInParagraph++;
    } else {
       segments.push({ type: "text", value: w });
    }
  }
  
  // Collapse adjacent text segments
  let collapsed = [];
  for (let s of segments) {
      if (s.type === 'text' && collapsed.length > 0 && collapsed[collapsed.length - 1].type === 'text') {
          collapsed[collapsed.length - 1].value += s.value;
      } else {
          collapsed.push(s);
      }
  }
  
  return collapsed;
}

const finalOutput = [];

for (const exObj of exercisesToSeed) {
  const { theme, subCategory, content } = exObj;
  const promptMatch = content.match(/- Prompt\s+([\s\S]*?)\s+-(?: Diagram| Digram) Image Link/);
  const diagramMatch = content.match(/-(?: Diagram| Digram) Image Link\s+([\s\S]*?)\s+- Answer/);
  const introMatch = content.match(/- Introduction\s+([\s\S]*?)\s+- Overview/);
  const overviewMatch = content.match(/- Overview\s+([\s\S]*?)\s+- Body 1/);
  const body1Match = content.match(/- Body 1\s+([\s\S]*?)\s+- Body 2/);
  const body2Match = content.match(/- Body 2\s+([\s\S]+)/);

  const promptText = promptMatch ? promptMatch[1].trim() : "";
  const diagramUrl = diagramMatch ? diagramMatch[1].trim() : "";
  const intro = introMatch ? introMatch[1].trim() : "";
  const overview = overviewMatch ? overviewMatch[1].trim() : "";
  const body1 = body1Match ? body1Match[1].trim() : "";
  const body2 = body2Match ? body2Match[1].trim() : "";

  if (promptText) {
    const paragraphs = [];
    if (intro) paragraphs.push({ number: 1, title: "Introduction", segments: processParagraph(intro) });
    if (overview) paragraphs.push({ number: 2, title: "Overview", segments: processParagraph(overview) });
    if (body1) paragraphs.push({ number: 3, title: "Body 1", segments: processParagraph(body1) });
    if (body2) paragraphs.push({ number: 4, title: "Body 2", segments: processParagraph(body2) });

    finalOutput.push({
      theme: theme,
      subCategory: subCategory,
      prompt: promptText,
      diagramUrl: diagramUrl,
      modelAnswer: { paragraphs }
    });
  }
}

fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2));
console.log(`Generated ${finalOutput.length} exercises in ${outputPath}`);

function processTask2Paragraph(text) {
  // Remove markdown bold
  let cleanText = text.replace(/\*\*/g, '');
  
  let segments = [];
  let words = cleanText.split(/(\s+)/);
  let blanksInParagraph = 0;
  
  for (let w of words) {
    if (!w.trim()) {
      segments.push({ type: "text", value: w });
      continue;
    }
    
    // Exact match or lowercase match
    let keyToMatch = w.trim();
    let isPunctuationSuffix = "";
    if (keyToMatch.endsWith(',') || keyToMatch.endsWith('.')) {
        isPunctuationSuffix = keyToMatch.slice(-1);
        keyToMatch = keyToMatch.slice(0, -1);
    }

    let foundDictKey = null;
    if (task2Dict[keyToMatch]) foundDictKey = keyToMatch;
    else if (task2Dict[keyToMatch.toLowerCase()]) foundDictKey = keyToMatch.toLowerCase();
    else if (task2Dict[w.trim()]) foundDictKey = w.trim(); 
    else if (task2Dict[w.trim().toLowerCase()]) foundDictKey = w.trim().toLowerCase();

    if (foundDictKey && blanksInParagraph < 3) {
       let options = [...task2Dict[foundDictKey]];
       let correct = w.trim();
       
       if (correct[0] === correct[0].toUpperCase()) {
           options = options.map(o => o.charAt(0).toUpperCase() + o.slice(1));
       }
       
       options.push(correct);
       options.sort(() => Math.random() - 0.5);

       segments.push({
         type: "blank",
         id: `b${globalBlankId++}`,
         correctAnswer: correct,
         options: options
       });
       blanksInParagraph++;
    } else {
       segments.push({ type: "text", value: w });
    }
  }
  
  let collapsed = [];
  for (let s of segments) {
      if (s.type === 'text' && collapsed.length > 0 && collapsed[collapsed.length - 1].type === 'text') {
          collapsed[collapsed.length - 1].value += s.value;
      } else {
          collapsed.push(s);
      }
  }
  
  return collapsed;
}

// ========== TASK 2 CONVERSION ==========
const task2InputPath = path.join(__dirname, 'ielts-basic-compiled', 'writing_task_2_exercises.txt');
const task2OutputPath = path.join(__dirname, 'ielts-basic-compiled', 'writing_task_2_cloze_auto.json');

if (fs.existsSync(task2InputPath)) {
  // Reset blank counter
  globalBlankId = 1;
  
  const task2Text = fs.readFileSync(task2InputPath, 'utf-8').replace(/\r\n/g, '\n');
  const task2Lines = task2Text.split('\n');
  
  let currentTheme = "";
  let currentSubcategory = "";
  const task2Exercises = [];

  for (let i = 0; i < task2Lines.length; i++) {
    const line = task2Lines[i];
    if (line.startsWith("    - ") && !line.includes("Exercise")) {
      currentTheme = line.replace("    - ", "").trim();
      currentSubcategory = "";
    } else if (line.startsWith("        - ") && !line.includes("- Exercise")) {
      currentSubcategory = line.replace("        - ", "").trim();
    } else if (line.indexOf("- Exercise") !== -1) {
      task2Exercises.push({ theme: currentTheme, subCategory: currentSubcategory, content: "" });
    } else if (task2Exercises.length > 0) {
      task2Exercises[task2Exercises.length - 1].content += line + "\n";
    }
  }

  const task2Output = [];

  for (const exObj of task2Exercises) {
    const { theme, subCategory, content } = exObj;
    const promptMatch = content.match(/- Prompt\s+([\s\S]*?)\s+- Diagram Image Link/);
    const introMatch = content.match(/- Introduction\s+([\s\S]*?)\s+- Body 1/);
    const body1Match = content.match(/- Body 1\s+([\s\S]*?)\s+- Body 2/);
    const body2Match = content.match(/- Body 2\s+([\s\S]*?)\s+- Conclusion/);
    const conclusionMatch = content.match(/- Conclusion\s+([\s\S]+)/);

    const promptText = promptMatch ? promptMatch[1].trim() : "";
    const intro = introMatch ? introMatch[1].trim() : "";
    const body1 = body1Match ? body1Match[1].trim() : "";
    const body2 = body2Match ? body2Match[1].trim() : "";
    const conclusion = conclusionMatch ? conclusionMatch[1].trim() : "";

    if (promptText) {
      const paragraphs = [];
      if (intro) paragraphs.push({ number: 1, title: "Introduction", segments: processTask2Paragraph(intro) });
      if (body1) paragraphs.push({ number: 2, title: "Body 1", segments: processTask2Paragraph(body1) });
      if (body2) paragraphs.push({ number: 3, title: "Body 2", segments: processTask2Paragraph(body2) });
      if (conclusion) paragraphs.push({ number: 4, title: "Conclusion", segments: processTask2Paragraph(conclusion) });

      task2Output.push({
        theme, subCategory,
        prompt: promptText,
        diagramUrl: null,
        taskType: 2,
        modelAnswer: { paragraphs }
      });
    }
  }

  fs.writeFileSync(task2OutputPath, JSON.stringify(task2Output, null, 2));
  console.log(`Generated ${task2Output.length} Task 2 exercises in ${task2OutputPath}`);
}

// ========== SPEAKING CONVERSION ==========

const speakingDict = {
  // ── Natural openers ──
  "honest,": ["frank,", "serious,", "truthful,"],
  "Actually,": ["Basically,", "Obviously,", "Certainly,"],
  "Well,": ["So,", "Right,", "OK,"],
  
  // ── AREA method connectors ──
  "particularly": ["especially", "specifically", "mainly"],
  "especially": ["particularly", "specifically", "mainly"],
  "because": ["since", "as", "given that"],
  
  // ── Discourse markers ──
  "Furthermore,": ["However,", "Nevertheless,", "Although,"],
  "Moreover,": ["However,", "Nevertheless,", "Conversely,"],
  "Additionally,": ["However,", "Conversely,", "Nevertheless,"],
  "Consequently,": ["Similarly,", "Meanwhile,", "Furthermore,"],
  
  // ── Opinion expressions ──
  "perspective,": ["experience,", "knowledge,", "opinion,"],
  "convinced": ["uncertain", "skeptical", "doubtful"],
  "firmly": ["loosely", "somewhat", "vaguely"],
  "strongly": ["slightly", "somewhat", "partially"],
  
  // ── Descriptive adjectives ──
  "fascinating": ["boring", "ordinary", "simple"],
  "remarkable": ["ordinary", "typical", "common"],
  "incredible": ["mediocre", "ordinary", "average"],
  "breathtaking": ["unremarkable", "plain", "dull"],
  "overwhelming": ["underwhelming", "insignificant", "trivial"],
  
  // ── Speaking-specific vocabulary ──
  "unwind": ["stress", "worry", "tense"],
  "passionate": ["indifferent", "apathetic", "neutral"],
  "diverse": ["uniform", "identical", "monotonous"],
  "significant": ["minimal", "negligible", "slight"],
  "beneficial": ["harmful", "detrimental", "damaging"]
};

function processSpeakingParagraph(text) {
  let cleanText = text.replace(/\*\*/g, '');
  let segments = [];
  let words = cleanText.split(/(\s+)/);
  let blanksInParagraph = 0;
  
  for (let w of words) {
    if (!w.trim()) {
      segments.push({ type: "text", value: w });
      continue;
    }
    
    let keyToMatch = w.trim();
    let isPunctuationSuffix = "";
    if (keyToMatch.endsWith(',') || keyToMatch.endsWith('.')) {
        isPunctuationSuffix = keyToMatch.slice(-1);
        keyToMatch = keyToMatch.slice(0, -1);
    }

    let foundDictKey = null;
    if (speakingDict[keyToMatch]) foundDictKey = keyToMatch;
    else if (speakingDict[keyToMatch.toLowerCase()]) foundDictKey = keyToMatch.toLowerCase();
    else if (speakingDict[w.trim()]) foundDictKey = w.trim(); 
    else if (speakingDict[w.trim().toLowerCase()]) foundDictKey = w.trim().toLowerCase();

    if (foundDictKey && blanksInParagraph < 3) {
       let options = [...speakingDict[foundDictKey]];
       let correct = w.trim();
       
       if (correct[0] === correct[0].toUpperCase()) {
           options = options.map(o => o.charAt(0).toUpperCase() + o.slice(1));
       }
       
       options.push(correct);
       options.sort(() => Math.random() - 0.5);

       segments.push({
         type: "blank",
         id: `b${globalBlankId++}`,
         correctAnswer: correct,
         options: options
       });
       blanksInParagraph++;
    } else {
       segments.push({ type: "text", value: w });
    }
  }
  
  let collapsed = [];
  for (let s of segments) {
      if (s.type === 'text' && collapsed.length > 0 && collapsed[collapsed.length - 1].type === 'text') {
          collapsed[collapsed.length - 1].value += s.value;
      } else {
          collapsed.push(s);
      }
  }
  return collapsed;
}

const speakingInputPath = path.join(__dirname, 'ielts-basic-compiled', 'speaking_exercises.txt');
const speakingOutputPath = path.join(__dirname, 'ielts-basic-compiled', 'speaking_cloze_auto.json');

if (fs.existsSync(speakingInputPath)) {
  globalBlankId = 1;
  const speakingText = fs.readFileSync(speakingInputPath, 'utf-8').replace(/\r\n/g, '\n');
  const speakingLines = speakingText.split('\n');
  
  let currentTheme = "";
  let currentSubcategory = "";
  const speakingExercises = [];

  for (let i = 0; i < speakingLines.length; i++) {
    const line = speakingLines[i];
    if (line.startsWith("    - ") && !line.includes("Exercise")) {
      currentTheme = line.replace("    - ", "").trim();
      currentSubcategory = "";
    } else if (line.startsWith("        - ") && !line.includes("- Exercise")) {
      currentSubcategory = line.replace("        - ", "").trim();
    } else if (line.indexOf("- Exercise") !== -1) {
      speakingExercises.push({ theme: currentTheme, subCategory: currentSubcategory, content: "" });
    } else if (speakingExercises.length > 0) {
      speakingExercises[speakingExercises.length - 1].content += line + "\n";
    }
  }

  const speakingOutput = [];

  for (const exObj of speakingExercises) {
    const { theme, subCategory, content } = exObj;
    
    // Parse common fields
    const promptMatch = content.match(/- Prompt\s+([\s\S]*?)\s+- QuestionType/);
    const typeMatch = content.match(/- QuestionType\s+([\s\S]*?)\s+- Answer/);
    
    const promptText = promptMatch ? promptMatch[1].trim() : "";
    const questionType = typeMatch ? typeMatch[1].trim() : "cloze";
    
    // Determine partType from theme
    let partType = 1;
    if (theme.includes("Part 2")) partType = 2;
    else if (theme.includes("Part 3")) partType = 3;
    else if (subCategory.includes("Part 1")) partType = 1;
    else if (subCategory.includes("Part 3")) partType = 3;

    if (questionType === "cloze" && promptText) {
      const responseMatch = content.match(/- Model Response\s+([\s\S]+)/);
      const response = responseMatch ? responseMatch[1].trim() : "";
      
      const paragraphs = [];
      if (response) {
        paragraphs.push({ number: 1, title: "Model Response", segments: processSpeakingParagraph(response) });
      }
      
      speakingOutput.push({
        theme, subCategory,
        prompt: promptText,
        partType,
        questionType,
        modelAnswer: { paragraphs }
      });
    } else if (questionType === "mcq" && promptText) {
      const optionsStrMatch = content.match(/- Options\s+([\s\S]*?)\s+- CorrectAnswer/);
      const correctMatch = content.match(/- CorrectAnswer\s+([A-D])/);
      
      const optionsText = optionsStrMatch ? optionsStrMatch[1].trim() : "";
      const correctAnswer = correctMatch ? correctMatch[1].trim() : "";
      
      const options = [];
      const optionLines = optionsText.split('\n');
      
      for (const optLine of optionLines) {
        if (optLine.trim().match(/^[A-D]\)/)) {
          const optId = optLine.trim().charAt(0);
          const optText = optLine.trim().substring(2).trim();
          
          // Find feedback
          const feedbackRegex = new RegExp(`- Feedback ${optId}\\s+([\\s\\S]*?)(?:\\s+- Feedback [A-D]|$)`);
          const feedbackMatch = content.match(feedbackRegex);
          const feedbackText = feedbackMatch ? feedbackMatch[1].trim() : "";
          
          options.push({
            id: optId,
            text: optText,
            feedback: feedbackText
          });
        }
      }
      
      speakingOutput.push({
        theme, subCategory,
        prompt: promptText,
        partType,
        questionType,
        content: {
          question: "Which response would score highest?",
          options: options,
          correctAnswer: correctAnswer
        }
      });
    }
  }

  fs.writeFileSync(speakingOutputPath, JSON.stringify(speakingOutput, null, 2));
  console.log(`Generated ${speakingOutput.length} Speaking exercises in ${speakingOutputPath}`);
}
