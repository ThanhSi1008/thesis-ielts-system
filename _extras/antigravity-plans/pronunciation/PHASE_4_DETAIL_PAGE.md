# Phase 4 — Frontend: Sound Detail Page Redesign

## Goal
Rebuild the `/ielts/pronunciation/sounds/[symbol]` page from a placeholder into a rich, interactive learning experience with audio playback, pronunciation tips, example words with recording, and progress persistence.

---

## 4.1 Page Architecture

The page is decomposed into these components (SRP):

```
sounds/[symbol]/page.tsx         → Shell: data fetching, breadcrumb, state
  _components/
    SoundDetailContent.tsx       → Main layout grid
    SoundHeroSection.tsx         → Symbol display, audio button, name
    SoundInstructionSection.tsx  → Description, tip callout, mouth diagram
    ExampleWordCard.tsx          → Single word: audio, IPA, recorder
    SoundProgressBar.tsx         → Mastery bar + practice count for this sound
```

---

## 4.2 Page Shell (`sounds/[symbol]/page.tsx`)

### Responsibilities
- Parse `symbol` from URL params
- Fetch sound data via `pronunciationApi.getSound(symbol)`
- Fetch user progress via `pronunciationApi.getProgress()` (if logged in)
- Render breadcrumb, loading, error states
- Pass data down to `SoundDetailContent`

### Breadcrumb Style
Use the same inline breadcrumb pattern as IELTS lesson pages:

```tsx
<div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
  <Link href="/ielts/dashboard">IELTS</Link>
  <span className="opacity-30">/</span>
  <Link href="/ielts/pronunciation">Pronunciation</Link>
  <span className="opacity-30">/</span>
  <span className="text-gray-300">{sound.symbol}</span>
</div>
<h1 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
  {sound.symbol} — {sound.name}
</h1>
```

---

## 4.3 `SoundDetailContent.tsx`

### Props

```ts
interface SoundDetailContentProps {
  sound: PronunciationSound;     // Includes exampleWords
  progress?: SoundProgress;       // User's progress for this specific sound
  onPracticeComplete: (score: number) => void; // Callback when a recording scores
}
```

### Layout

Two-column grid on desktop, single column on mobile:

```
┌─────────────────────────────────────────────────────────┐
│ [SoundProgressBar]                                       │
├──────────────────────────┬──────────────────────────────┤
│ SoundHeroSection         │ SoundInstructionSection       │
│ - Big IPA symbol         │ - Description paragraph       │
│ - Sound name             │ - Tip callout (blue box)      │
│ - Play audio button      │ - Mouth diagram (if imageUrl) │
│ - Type badge             │                                │
├──────────────────────────┴──────────────────────────────┤
│ Example Words Section                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ sheep    │ │ tree     │ │ green    │ │ beach    │    │
│ │ /ʃiːp/   │ │ /triː/   │ │ /ɡriːn/  │ │ /biːtʃ/  │    │
│ │ 🔊 🎤    │ │ 🔊 🎤    │ │ 🔊 🎤    │ │ 🔊 🎤    │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 4.4 `SoundHeroSection.tsx`

### Props

```ts
interface SoundHeroSectionProps {
  symbol: string;
  name: string;
  type: string;
  audioUrl?: string;
  voiced?: boolean;
}
```

### Design

- Large IPA symbol (text-5xl or text-6xl, font-bold)
- Sound name below (text-lg, text-slate-600)
- Type badge: pill-shaped, color-coded by type (same colors as chart tiles)
  - Monophthong: yellow
  - Diphthong: red
  - Consonant: slate (with "voiced"/"voiceless" label)
- Play button: circular, primary color, plays `audioUrl` using `new Audio(url).play()`

---

## 4.5 `SoundInstructionSection.tsx`

### Props

```ts
interface SoundInstructionSectionProps {
  description: string;
  tip: string;
  imageUrl?: string;
}
```

### Design

1. **Description** — rendered as a paragraph with `text-slate-600 leading-relaxed`
2. **Tip callout** — blue-tinted card (matches existing tip box style):
   ```tsx
   <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
     <h3 className="font-bold text-blue-800 mb-1 text-sm flex items-center gap-2">
       <LightbulbIcon /> Pronunciation Tip
     </h3>
     <p className="text-blue-700 text-sm leading-relaxed">{tip}</p>
   </div>
   ```
3. **Mouth diagram** — if `imageUrl` exists, show it in a rounded container. If not, show a subtle placeholder with text "Diagram coming soon".

---

## 4.6 `ExampleWordCard.tsx`

### Props

```ts
interface ExampleWordCardProps {
  word: string;
  ipa?: string;
  audioUrl?: string;
  userId?: string;           // null if not logged in
  soundId: string;           // For progress tracking
  onScoreReceived: (score: number) => void;
}
```

### Design

A horizontal card per word:

```
┌──────────────────────────────────────────────┐
│  sheep         /ʃiːp/            🔊   🎤    │
└──────────────────────────────────────────────┘
```

- **Word** — bold, text-lg
- **IPA** — text-slate-400, text-sm, mono font
- **Audio button** (🔊) — plays `audioUrl` via `new Audio(url).play()`
- **Record button** (🎤) — opens inline `PronunciationRecorder` for this word

### Recording Flow

When user taps the mic:
1. Show the existing `PronunciationRecorder` inline (expanded state)
2. After recording + AI scoring completes, call `onScoreReceived(score)`
3. The parent (`SoundDetailContent`) calls `pronunciationApi.updateProgress(soundId, score)` to persist

### If Not Logged In

Replace the record button with a subtle "Log in to practice" text.

---

## 4.7 `SoundProgressBar.tsx`

### Props

```ts
interface SoundProgressBarProps {
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
  practiceCount: number;
  bestScore: number | null;
}
```

### Design

A slim bar at the top of the detail page:

- **NEW**: gray bar, text "Not yet practiced"
- **PRACTICING**: orange bar, text "Practicing · Best score: 72 · 5 attempts"
- **MASTERED**: green bar with checkmark, text "Mastered! · Best score: 92 · 12 attempts"

The bar uses a progress fill animation:
- Width = `bestScore%` of the bar
- Color transitions: gray → orange → green based on score thresholds

---

## 4.8 Progress Update Wiring

In the page shell, after ANY practice recording completes:

```ts
const handlePracticeComplete = async (score: number) => {
  if (!user) return;

  try {
    await pronunciationApi.updateProgress(sound.id, score);
    // Refresh the progress for this sound
    const updatedProgress = await pronunciationApi.getProgress();
    const thisSoundProgress = updatedProgress.find(p => p.soundId === sound.id);
    setProgress(thisSoundProgress ?? null);
  } catch (err) {
    console.error("Failed to update progress", err);
  }
};
```

---

## 4.9 Verification Checklist

- [ ] Navigating to `/ielts/pronunciation/sounds/iː` shows enriched content from API
- [ ] Sound name, description, and tip are displayed (not "undefined")
- [ ] Example words are listed with IPA transcriptions
- [ ] Audio play button works (plays the sound/word audio)
- [ ] Record button opens the `PronunciationRecorder` inline
- [ ] After recording + scoring, progress is saved to the backend
- [ ] `SoundProgressBar` updates from NEW → PRACTICING → MASTERED
- [ ] Not-logged-in users see the content but cannot record
- [ ] Breadcrumb links work (IELTS → Pronunciation → symbol)
- [ ] Mobile responsive: single column on small screens
- [ ] No hardcoded mock data — everything from API
