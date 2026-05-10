import * as fs from 'fs';
import * as path from 'path';
import { cambridgeIelts17ReadingTest1Questions } from '../data/mock-tests';

const OUT_DIR = path.join(__dirname, '..', 'data', 'ielts-advanced-compiled');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function cleanMarkdown(text: string) {
  let cleaned = text.replace(/\*\*(.*?)\*\*\s*\*\((Q\d+)[^*]*\)\*/g, '$1');
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');
  return cleaned;
}

function parsePassageWithLocations(text: string) {
  const regex = /\*\*(.*?)\*\*\s*\*\((Q\d+)[^*]*\)\*/g;
  let lastIndex = 0;
  let match;
  const ieltsIntensiveResult: any[] = [];

  while ((match = regex.exec(text)) !== null) {
    // text before the match
    if (match.index > lastIndex) {
      ieltsIntensiveResult.push(cleanMarkdown(text.substring(lastIndex, match.index)));
    }
    const extractText = match[1].replace(/`/g, '');
    const qNum = parseInt(match[2].replace('Q', ''), 10);
    
    ieltsIntensiveResult.push({
      question_number: qNum,
      text: extractText
    });
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    ieltsIntensiveResult.push(cleanMarkdown(text.substring(lastIndex)));
  }

  // if the text has no questions, return array with just cleaned text
  if (ieltsIntensiveResult.length === 0) {
    return [cleanMarkdown(text)];
  }

  return ieltsIntensiveResult;
}

function mapQuestionGroups(groups: any[]) {
  return groups.map(g => {
    // Map basic type
    let newType = 'multiple_choice';
    if (g.question_type === 'Note Completion') newType = 'note_completion';
    if (g.question_type === 'True/False/Not Given') newType = 'true_false_not_given';
    if (g.question_type === 'Matching Information') newType = 'matching_information';
    if (g.question_type === 'Summary Completion') newType = 'summary_completion';
    if (g.question_type === 'Matching Features') newType = 'matching_features';
    if (g.question_type === 'Sentence Completion') newType = 'sentence_completion';
    if (g.question_type === 'Yes/No/Not Given') newType = 'yes_no_not_given';
    if (g.question_type === 'Multiple Choice (more than one answer)') newType = 'multiple_choice_multiple';
    if (g.question_type === 'Multiple Choice (one answer)') newType = 'multiple_choice';

    let questionsContent = [];
    
    if (g.items) {
      questionsContent = g.items.map((item: any) => {
         const ieltsIntensiveResult: any = { ...item };
         if (item.question_text) {
             ieltsIntensiveResult.text = item.question_text;
             delete ieltsIntensiveResult.question_text;
         }
         return ieltsIntensiveResult;
      });
    } else if (g.content) {
      // note completion or summary completion
      questionsContent = g.content;
    }
    
    return {
      type: newType,
      instructions: g.instructions,
      topic: g.topic,
      options_box: g.options_box,
      questions: questionsContent
    };
  });
}

function generate() {
  const parts = cambridgeIelts17ReadingTest1Questions.parts;
  
  parts.forEach((part, index) => {
    const rawPassage = part.passage_text;
    const passagePlain = cleanMarkdown(rawPassage);
    const passageWithLoc = parsePassageWithLocations(rawPassage);
    
    const mappedGroups = mapQuestionGroups(part.question_groups || []);
    
    const payload = [
      {
        title: part.topic,
        passage: passagePlain,
        passage_with_locations: passageWithLoc,
        content: mappedGroups
      } // array wrapped like basic JSON if needed, but wait advanced payload just uses JSON.parse(..)[0]
    ];
    
    const fileName = `reading_Part_0${index + 1}_${part.topic.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.json`;
    const outputPath = path.join(OUT_DIR, fileName);
    
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`Generated ${fileName}`);
  });
}

generate();
