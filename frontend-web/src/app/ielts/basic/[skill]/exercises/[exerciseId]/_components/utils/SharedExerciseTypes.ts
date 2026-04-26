export interface MCOption {
  letter: string;
  text: string;
}

export interface MCQuestion {
  question_number: number;
  text: string;
  options: MCOption[];
  answer: string;
  timestamp_seconds?: number;
  explanation?: string;
}

export interface TranscriptEntry {
  speaker: string;
  text: string;
  question_number?: number;
  highlight_text?: string;
}

export type PassageSegment = string | { question_number: number; text: string };

export interface ContentGroup {
  type: string;
  questions: MCQuestion[];
  question_numbers?: number[];
  text?: string;
  options?: MCOption[];
  answers?: string[];
  num_correct?: number;
  explanation?: string;
  [key: string]: unknown;
}

export interface ListeningExercise {
  id: string;
  topic: string;
  instructions?: string;
  audioUrl: string;
  transcript: TranscriptEntry[];
  content: ContentGroup[];
}

export interface ReadingExercise {
  id: string;
  topic: string;
  instructions?: string;
  passage?: string;
  passageWithLocations?: PassageSegment[];
  content: ContentGroup[];
}

export type Exercise = ListeningExercise | ReadingExercise;

export interface LessonBlock {
  type: "traps" | "strategy" | "tips" | "section" | "overview" | string;
  title?: string;
  content: string;
}
