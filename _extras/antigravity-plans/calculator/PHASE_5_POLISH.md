# Phase 5 — Polish, Animations, Responsiveness & Overall Calculator

> **Goal**: Add finishing touches — smooth animations, responsive behavior, accessibility, and an optional "Overall Band" calculator section.

---

## Prerequisites
- Phases 1–4 complete (all 4 tabs functional)

---

## Task 1: Highlight Animations

### Row Highlight Transition
Ensure all highlighted rows use smooth transitions:

```css
/* Applied via Tailwind classes on <tr> elements */
transition-all duration-300 ease-in-out
```

### Scroll Into View
When a row becomes highlighted (via input or dropdown), it should smoothly scroll into the visible area:

```ts
// In each component, use a ref + useEffect pattern:
const highlightedRef = useRef<HTMLTableRowElement>(null);

useEffect(() => {
  if (highlightedRef.current) {
    highlightedRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [highlightedBand]);
```

Attach `ref={highlightedRef}` to the `<tr>` that is currently highlighted.

### Page Load Animation
- The page header should use `animate-fade-up` (already defined in `tailwind.config.ts`)
- Each tab content should fade in when switching: wrap in a `<div className="animate-fade-up" key={activeTab}>` to trigger re-animation on tab change

---

## Task 2: Responsive Design

### Score Tables (Listening & Reading)
- Already two-column tables — they render well on mobile
- Ensure input fields stack vertically on `sm:` and below:
  ```tsx
  <div className="flex flex-col sm:flex-row gap-4">
    {/* Raw Score input */}
    {/* Band Score dropdown */}
  </div>
  ```

### Descriptor Tables (Writing & Speaking)
- These have 5 columns (Band + 4 criteria) — too wide for mobile
- Use horizontal scroll wrapper:
  ```tsx
  <div className="overflow-x-auto -mx-4 px-4">
    <table className="min-w-[900px] w-full">...</table>
  </div>
  ```
- On very small screens, consider adding a **mobile card view** (optional enhancement):
  - Instead of a table, show each band as an expandable card
  - Click to expand and see all 4 criteria descriptions
  - This is a progressive enhancement — the scrollable table is the baseline

### Tab Navigation
- On mobile, the 4-tab pill bar should be scrollable horizontally or wrap:
  ```tsx
  <div className="flex flex-wrap sm:flex-nowrap gap-1 ...">
  ```

---

## Task 3: Accessibility

### Keyboard Navigation
- Tab through inputs and dropdowns naturally
- Enter/Space on a table row should toggle its highlight
- Add `tabIndex={0}` and `onKeyDown` handler on `<tr>` elements:
  ```tsx
  <tr
    tabIndex={0}
    role="button"
    aria-pressed={isHighlighted}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onBandSelect(row.band);
      }
    }}
  >
  ```

### ARIA Labels
- Score input: `aria-label="Enter raw score (0 to 40)"`
- Band dropdown: `aria-label="Select band score"`
- Table: `role="grid"` with proper `aria-label`
- Highlighted row: `aria-selected="true"`

### Color Contrast
- Ensure `bg-primary/15` text remains readable (primary is `#FFC600` — the 15% opacity on white is very light, text should remain dark)
- Test with browser accessibility tools

---

## Task 4: Overall Band Score Calculator (Bonus Feature)

Add a section at the **top of CalculatorContent** (above the tabs) or as a separate fifth tab that computes the estimated overall band:

### UI Layout

```
┌─────────────────────────────────────────────────────┐
│  📊 Overall Band Score Calculator                   │
│                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────│
│  │ Listening  │ │ Reading    │ │ Writing    │ │ Spe│
│  │ Band: [▼]  │ │ Band: [▼]  │ │ Band: [▼]  │ │ Ba │
│  └────────────┘ └────────────┘ └────────────┘ └────│
│                                                     │
│            Estimated Overall Band: 7.0              │
│            ═══════════════════════                   │
└─────────────────────────────────────────────────────┘
```

### Calculation Formula (Official IELTS Rounding)
```ts
function calculateOverallBand(
  listening: number,
  reading: number,
  writing: number,
  speaking: number
): number {
  const average = (listening + reading + writing + speaking) / 4;
  // IELTS rounds to nearest 0.5
  return Math.round(average * 2) / 2;
}
```

### Implementation
- 4 band dropdown inputs (each with values 0, 1, 1.5, 2, 2.5, ... 9)
- Auto-calculate overall band as user fills in values
- Display with a large, bold font and a color indicator:
  - ≥ 7.0: green (`text-green-600`)
  - ≥ 5.5: blue (`text-blue-600`)
  - < 5.5: amber (`text-amber-600`)
- Place this in a prominent card at the top of the page (before tabs), styled with:
  ```
  bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-6
  ```

---

## Task 5: Final Code Quality Review

### Checklist
- [ ] **SRP**: Each component ≤ 120 lines. If any exceeds, extract sub-components
- [ ] **OCP**: Tab config is data-driven. Adding a new tab only requires editing the config array
- [ ] **ISP**: Components receive only the data they need (no full objects passed unnecessarily)
- [ ] **DIP**: No direct `fetch` calls (this feature is purely client-side/static data)
- [ ] **No Hardcode**: All scores/descriptors in `calculator-data.ts`
- [ ] **Early Return**: Edge cases handled first (empty input, invalid range)
- [ ] **Constants**: Magic numbers extracted to named constants

### Performance
- Score tables are static — no API calls needed
- All data is imported at build time — zero network requests
- Ensure no unnecessary re-renders (memoize if needed)

---

## ✅ Final Acceptance Criteria (Entire Feature)

- [ ] `/ielts/calculator` route loads with the IELTS sidebar showing "Calculator" as active
- [ ] 4 tabs (Listening, Reading, Writing, Speaking) switch smoothly
- [ ] Listening: Enter raw score → correct band row highlights with smooth scroll
- [ ] Reading: Academic/General toggle switches tables; input → row highlight works
- [ ] Writing: Task 1 / Task 2 sub-tabs; band dropdown / row click highlights entire row
- [ ] Speaking: band dropdown / row click highlights entire row
- [ ] All highlighted rows have consistent `bg-primary/15` + left border accent
- [ ] Tables are horizontally scrollable on narrow screens
- [ ] Overall band calculator shows correct rounded result
- [ ] Page uses `animate-fade-up` on load
- [ ] Keyboard navigation works on all interactive elements
- [ ] Zero TypeScript errors
- [ ] All data centralized in `calculator-data.ts`
- [ ] Components follow SOLID principles per RULES.md

---

*This completes the IELTS Calculator feature. All 5 phases are independently implementable.*
