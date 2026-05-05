# Phase 7: Speaking Question-Type Components

## Objective
Build 3 Speaking question-type components + ExaminerPanel + Recorder + Renderer.

## Prerequisites
- Phase 3 (API) completed.

## Location
```
frontend-web/src/app/ielts/intensive/_components/speaking/
├── SpeakingPart1Interview.tsx
├── SpeakingPart2CueCard.tsx
├── SpeakingPart3Discussion.tsx
├── SpeakingExaminerPanel.tsx
├── SpeakingRecorder.tsx
└── SpeakingQuestionRenderer.tsx
```

## Component Specifications

### `SpeakingExaminerPanel`
- **Visual:** Examiner avatar (circular image), name, role badge
- **Data:** `examiner: { name, role, avatarUrl }` from exam metadata
- Positioned at top of the speaking exam page

### `SpeakingRecorder`
- Record button (microphone icon) — toggles start/stop
- Timer showing recording duration
- Playback controls after recording
- Uploads audio to backend (or stores blob URL locally)
- Visual: waveform animation while recording
- `onRecordingComplete(audioBlob: Blob)` callback

### `SpeakingPart1Interview`
- **Visual (per question):**
  1. Examiner video player (auto-plays the question video)
  2. Question text displayed below video
  3. `<SpeakingRecorder>` — user records their answer
  4. "Next Question" button
- **Flow:** Video plays → user listens → user records answer → next question
- **Data:** `questions[].questionText`, `questions[].options.video` (video URL)
- 4 questions shown sequentially (not all at once)

### `SpeakingPart2CueCard`
- **Visual flow (3 stages):**
  1. **Examiner intro video** — plays the cue card introduction video
  2. **Preparation phase:**
     - Cue card displayed in a styled card (topic + bullet points, formatted)
     - 1-minute countdown timer (prominent)
     - Notepad area (optional text input for notes)
  3. **Speaking phase:**
     - Cue card still visible
     - 2-minute countdown timer
     - `<SpeakingRecorder>` — continuous recording
  4. **Follow-up:** Second examiner video (video2) plays
- **Data:** `cueCard` (formatted text), `options.video` (intro), `options.video2` (follow-up)

### `SpeakingPart3Discussion`
- **Visual:** Same layout as Part 1 but with:
  - More abstract/analytical question framing
  - 4-6 questions (varies)
- **Data:** Same shape as Part 1
- Semantically different but structurally identical to Part 1

### `SpeakingQuestionRenderer`
```typescript
const SPEAKING_REGISTRY = {
  part_1_interview: SpeakingPart1Interview,
  part_2_cue_card: SpeakingPart2CueCard,
  part_3_discussion: SpeakingPart3Discussion,
};
```

## Review Mode
In review mode:
- Show user's recorded audio with playback controls
- Show AI feedback panel with scores for:
  - Fluency and Coherence
  - Lexical Resource
  - Grammatical Range and Accuracy
  - Pronunciation
- Overall band score
- Examiner video can be replayed

## Validation
- Part 1: examiner video plays, user records per question, sequential flow
- Part 2: cue card displays, 1-min prep timer counts down, 2-min speak timer, recording works
- Part 3: similar to Part 1 with deeper questions
- Examiner avatar/name displayed correctly
- Recorder captures audio and provides playback
