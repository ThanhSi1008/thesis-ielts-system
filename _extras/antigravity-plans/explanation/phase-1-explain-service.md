# Phase 1: Create the Explain Service + Prompt Builder

## Goal
Create a new service file that builds an IELTS-tutor prompt from question context and calls the existing `/chat` API to get an AI explanation. No UI changes in this phase.

## Prerequisites
- Read `frontend-web/src/lib/api.ts` to understand the axios client
- Read `frontend-web/src/services/exams.api.ts` to understand existing service patterns
- Read `frontend-web/src/lib/exam-parser.ts` lines 1-62 to understand `NormalizedItem` types

---

## Step 1: Create the explain service file

**Create file:** `frontend-web/src/services/explain.api.ts`

```typescript
/**
 * Explain API Service
 * 
 * Calls the existing /chat endpoint with a specialized system_instruction
 * to generate per-question AI explanations for IELTS Listening/Reading results.
 * 
 * No new backend endpoint needed — reuses the ChatRequest.system_instruction override.
 */

import api from "@/lib/api";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ExplainContext {
  /** The question text / prompt shown to the user */
  questionText: string;
  /** The correct answer */
  correctAnswer: string;
  /** What the user actually answered */
  userAnswer: string;
  /** The question type: "mc_single" | "mc_multi" | "note_completion" | "table_completion" | "matching_group" | "summary_completion" | "short_answer" | "plan_label" | "flowchart_completion" | "sentence_completion" */
  questionType: string;
  /** Relevant transcript lines around where the answer appears */
  transcriptSnippet: string;
  /** Question number(s) for reference */
  questionNumber: number | number[];
  /** The skill type */
  skill: "LISTENING" | "READING";
  /** For MC questions, include all options so the AI can explain distractors */
  options?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────
// System prompt — injected as system_instruction override
// ─────────────────────────────────────────────────────────────

const EXPLAIN_SYSTEM_INSTRUCTION = `You are an expert IELTS tutor explaining why a student got a question wrong on an IELTS Listening or Reading test.

## Your Response Structure
1. **Where the answer appears** — Quote the exact part of the transcript/passage where the answer is found. Include the speaker name if available.
2. **Why the correct answer is correct** — Explain clearly why this is the right answer, linking it to the evidence in the transcript/passage.
3. **Why the student's answer is wrong** — If they answered something, explain the common trap or why that answer is incorrect. If they left it blank, mention that.
4. **Quick tip** — One actionable tip for this specific question type.

## Rules
- Keep your total response under 180 words
- Use markdown: **bold** for key terms and answers
- Be encouraging but direct — focus on learning, not criticism
- Reference the transcript/passage text directly using quotes
- For fill-in-the-blank: emphasize listening for specific words and spelling
- For multiple choice: explain why distractors are wrong
- For matching: explain the paraphrasing connection
- Write in English only`;

// ─────────────────────────────────────────────────────────────
// Build the user message from context
// ─────────────────────────────────────────────────────────────

function buildExplainMessage(ctx: ExplainContext): string {
  const lines: string[] = [];

  lines.push(`## Question ${Array.isArray(ctx.questionNumber) ? ctx.questionNumber.join("-") : ctx.questionNumber}`);
  lines.push(`**Type:** ${ctx.questionType.replace(/_/g, " ")}`);
  lines.push(`**Skill:** ${ctx.skill}`);
  lines.push("");
  lines.push(`**Question:** ${ctx.questionText}`);

  if (ctx.options && Object.keys(ctx.options).length > 0) {
    lines.push("");
    lines.push("**Options:**");
    for (const [k, v] of Object.entries(ctx.options)) {
      lines.push(`  ${k}. ${v}`);
    }
  }

  lines.push("");
  lines.push(`**Correct answer:** ${ctx.correctAnswer}`);
  lines.push(`**Student's answer:** ${ctx.userAnswer || "(left blank)"}`);

  if (ctx.transcriptSnippet) {
    lines.push("");
    lines.push(`**Relevant transcript/passage:**`);
    lines.push(ctx.transcriptSnippet);
  }

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Call the /chat endpoint with a specialized system_instruction
 * to generate an AI explanation for a specific question.
 *
 * @returns The AI explanation as a markdown string
 */
export async function getExplanation(ctx: ExplainContext): Promise<string> {
  const userMessage = buildExplainMessage(ctx);

  const { data } = await api.post<{ response: string }>("/chat", {
    system_instruction: EXPLAIN_SYSTEM_INSTRUCTION,
    messages: [{ role: "user", content: userMessage }],
    stream: false,
  });

  return data.response;
}
```

---

## Step 2: Create a helper to extract transcript snippet

The result page already has `transcript` data per part. We need a helper that extracts relevant lines around a question number.

**Add to the SAME file** `frontend-web/src/services/explain.api.ts` (append at the bottom, before the closing):

```typescript
// ─────────────────────────────────────────────────────────────
// Transcript snippet extractor
// ─────────────────────────────────────────────────────────────

/**
 * Given a transcript array and a question number, extract 2-3 surrounding
 * lines that are relevant to that question for context.
 *
 * Each transcript line looks like:
 * { speaker: string, text: string, question_number?: number, timestamp_seconds?: number }
 */
export function extractTranscriptSnippet(
  transcript: any[],
  questionNumber: number,
  surroundingLines: number = 2
): string {
  if (!transcript || transcript.length === 0) return "";

  // Find the index of the line that contains this question
  const targetIdx = transcript.findIndex(
    (line: any) => line.question_number === questionNumber
  );

  if (targetIdx === -1) {
    // If no exact match, try question_markers array
    const markerIdx = transcript.findIndex(
      (line: any) =>
        Array.isArray(line.question_markers) &&
        line.question_markers.some((m: any) => m.question_number === questionNumber)
    );
    if (markerIdx === -1) return "";
    const start = Math.max(0, markerIdx - surroundingLines);
    const end = Math.min(transcript.length, markerIdx + surroundingLines + 1);
    return transcript
      .slice(start, end)
      .map((l: any) => `${l.speaker}: ${l.text}`)
      .join("\n");
  }

  const start = Math.max(0, targetIdx - surroundingLines);
  const end = Math.min(transcript.length, targetIdx + surroundingLines + 1);
  return transcript
    .slice(start, end)
    .map((l: any) => `${l.speaker}: ${l.text}`)
    .join("\n");
}
```

---

## Verification

After completing this phase, verify:

1. The file `frontend-web/src/services/explain.api.ts` exists and exports:
   - `ExplainContext` (type)
   - `getExplanation(ctx: ExplainContext): Promise<string>` (function)
   - `extractTranscriptSnippet(transcript, questionNumber, surroundingLines?): string` (function)
2. TypeScript compiles without errors — run `npx tsc --noEmit` from the `frontend-web` directory
3. Do NOT modify any other files in this phase

## File Checklist

| Action | File |
|--------|------|
| ✅ CREATE | `frontend-web/src/services/explain.api.ts` |
