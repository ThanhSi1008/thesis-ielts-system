# Phase 5 — Progress Dashboard & Polish

## Goal
Add a progress summary section at the top of the IPA chart page, polish all animations and transitions, and ensure a cohesive, professional UX across the entire pronunciation module.

---

## 5.1 `ProgressSummary.tsx` Component

**File**: `frontend-web/src/app/ielts/pronunciation/_components/ProgressSummary.tsx`

### Props

```ts
interface ProgressSummaryProps {
  stats: PronunciationStats;
}
```

### Design

A card displayed above the IPA chart with 4 stat items and a mastery ring:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔊 IPA Mastery                                                 │
│                                                                  │
│  ┌───────────┐   ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │    🟢     │   │ 44       │  │ 3         │  │ 8            │ │
│  │   68%     │   │ Total    │  │ Mastered  │  │ Practicing   │ │
│  │  Mastery  │   │ Sounds   │  │           │  │              │ │
│  └───────────┘   └──────────┘  └───────────┘  └──────────────┘ │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 25% mastered │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Details

- **Mastery ring**: Circular SVG progress indicator (`stroke-dasharray` technique)
  - Color: green when > 75%, orange when > 25%, red when < 25%
- **Stat cards**: 4 small cards in a row, each with:
  - Number (large, bold)
  - Label (small, text-slate-500)
- **Progress bar**: Full-width slim bar below the stats
  - Three segments: green (mastered), orange (practicing), gray (new)
  - Animated on mount

### Style Tokens (from DESIGN_SYSTEM.md)

- Card: `bg-white rounded-xl border border-slate-200 shadow-sm p-6`
- Numbers: `text-2xl font-extrabold text-slate-900`
- Labels: `text-xs font-medium text-slate-500 uppercase tracking-wide`

---

## 5.2 Chart Tile Mastery Indicators

In the `IpaChart.tsx` (from Phase 3), each tile shows a small badge:

### Badge Design

```tsx
// Top-right corner of each tile
{mastery === 'MASTERED' && (
  <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
)}
{mastery === 'PRACTICING' && (
  <div className="absolute top-1 right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
    <span className="text-[8px] font-bold text-white">{practiceCount}</span>
  </div>
)}
```

### Tile Interaction

- Tiles should have a subtle scale animation on hover: `hover:-translate-y-1 hover:shadow-md`
- On click, navigate to the sound detail page
- Mastered tiles get a subtle green border: `ring-2 ring-green-300`

---

## 5.3 Polish & Animations

### Page Transitions

Add fade-in animations to the chart and detail pages:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}
```

Apply to:
- `ProgressSummary` card: `animate-fade-in-up` with `animation-delay: 0.1s`
- Chart vowels section: `animate-fade-in-up` with `animation-delay: 0.2s`
- Chart consonants section: `animate-fade-in-up` with `animation-delay: 0.3s`

### Sound Detail Page Transitions

- `SoundHeroSection`: fade in from left
- `SoundInstructionSection`: fade in from right
- `ExampleWordCard`: stagger fade-in (each card delayed by 50ms)

### Audio Play Button

When audio plays, add a pulsing ring animation:

```tsx
<button className={`... ${isPlaying ? 'ring-4 ring-primary/30 animate-pulse' : ''}`}>
```

### Recording Feedback

After a recording scores:
- Score >= 80: confetti-like green sparkle animation + "Great job!" text
- Score 50-79: encouraging orange text "Keep practicing!"
- Score < 50: supportive text "Try again — focus on {tip}"

---

## 5.4 Mobile Responsiveness

### IPA Chart

- On screens < 768px, reduce tile size and font sizes
- Use `grid-cols-6` instead of `grid-cols-8` for consonants on mobile
- The rotated "Vowels"/"Consonants" labels become horizontal headers on mobile

### Sound Detail Page

- Single column layout on mobile
- `ExampleWordCard` stacks vertically
- Audio/record buttons remain easily tappable (min 44px tap target)

### Progress Summary

- On mobile, stats go 2x2 grid instead of 4-in-a-row
- Mastery ring moves above the stats

---

## 5.5 Empty State & Loading States

### First Visit (No Progress)

Show an encouraging welcome message above the chart:

```tsx
{stats?.overallMastery === 0 && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6">
    <h3 className="font-bold text-slate-900 mb-1">Welcome to IPA Mastery!</h3>
    <p className="text-sm text-slate-600">
      Tap any sound to learn how to pronounce it. Practice with example words and
      track your progress as you master all 44 English sounds.
    </p>
  </div>
)}
```

### Loading Skeletons

Replace plain spinners with skeleton placeholders:
- Chart: grid of gray pulsing rectangles matching tile positions
- Detail page: gray bars for text, circle for audio button
- Use Tailwind `animate-pulse` with `bg-slate-100 rounded-xl`

---

## 5.6 Accessibility

- All audio buttons have `aria-label="Play sound {symbol}"`
- Record button has `aria-label="Record pronunciation for {word}"`
- Chart tiles have `role="link"` and `aria-label="Sound {symbol}, {word}, {mastery status}"`
- Progress bar has `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Keyboard navigation: tiles are focusable with Tab, activatable with Enter

---

## 5.7 Final Verification Checklist

### Functional
- [ ] IPA chart loads from API (no hardcoded data)
- [ ] Progress summary shows correct mastered/practicing/new counts
- [ ] Chart tiles show mastery badges (green check, orange dot)
- [ ] Sound detail page shows description, tip, example words from DB
- [ ] Recording + AI scoring works end-to-end
- [ ] Progress persists after recording (NEW → PRACTICING → MASTERED)
- [ ] Refreshing the page shows the saved progress
- [ ] Not-logged-in users see the chart and detail pages without progress features

### Visual
- [ ] Animations are smooth (fade-in, scale, progress bar fill)
- [ ] Mobile layout is usable (tiles readable, buttons tappable)
- [ ] Loading skeletons shown during data fetch
- [ ] Empty state shown for first-time users
- [ ] Colors match the design system (DESIGN_SYSTEM.md tokens)

### Technical
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] `data.ts` is deprecated and not imported anywhere
- [ ] All API calls go through `pronunciationApi` abstraction (DIP)
- [ ] Components under 120 lines each (SRP)
- [ ] No objects larger than needed passed to child components (ISP)
