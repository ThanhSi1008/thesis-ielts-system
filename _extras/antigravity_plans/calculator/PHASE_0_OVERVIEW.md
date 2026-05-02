# IELTS Calculator — Feature Overview

> Master plan for adding an **IELTS Calculator** module under the `/ielts/calculator` route.

---

## 🎯 Objective

Provide users with an interactive IELTS score reference tool containing **4 sub-features**, each in its own tab:

| Tab | Feature | Interaction |
|:---|:---|:---|
| **Listening** | Raw Score → Band Score conversion table | User enters a raw score (0–40) OR band score → corresponding row highlights |
| **Reading** | Raw Score → Band Score conversion table (Academic + General Training toggle) | Same interactive highlighting as Listening |
| **Writing** | Band Descriptor reference (Task 1 + Task 2 sub-tabs) | User selects a band (0–9) → the entire row of descriptors for that band highlights across all 4 criteria |
| **Speaking** | Band Descriptor reference | User selects a band (0–9) → the entire row of descriptors highlights across all 4 criteria |

---

## 📁 Implementation Phases

| Phase | File | Scope |
|:---|:---|:---|
| 1 | `PHASE_1_ROUTING_AND_LAYOUT.md` | Route setup, sidebar integration, page shell, tab navigation component |
| 2 | `PHASE_2_LISTENING_READING.md` | Listening & Reading score tables with interactive highlight |
| 3 | `PHASE_3_WRITING.md` | Writing Task 1 & Task 2 band descriptor tables with highlight |
| 4 | `PHASE_4_SPEAKING.md` | Speaking band descriptor table with highlight |
| 5 | `PHASE_5_POLISH.md` | Animations, responsive design, accessibility, overall score calculator |

---

## 🏗️ Architecture Decisions

### File Structure (final)

```
frontend-web/src/
├── app/ielts/calculator/
│   ├── page.tsx                          # Route entry — renders CalculatorContent
│   └── _components/
│       ├── CalculatorContent.tsx          # Main container with tab navigation
│       ├── ListeningCalculator.tsx        # Listening tab
│       ├── ReadingCalculator.tsx          # Reading tab (Academic/GT toggle)
│       ├── WritingDescriptors.tsx         # Writing tab (Task 1 / Task 2 sub-tabs)
│       └── SpeakingDescriptors.tsx        # Speaking tab
├── lib/
│   └── calculator-data.ts                # All static data constants (score tables, descriptors)
```

### Design Principles (from RULES.md)
- **SRP**: Each calculator tab is its own component (~120 lines max)
- **OCP**: Tab navigation is config-driven (adding a new tab = adding to a config array)
- **ISP**: Descriptor components only receive the data they need
- **No Hardcode**: All score mappings live in `calculator-data.ts` as named constants
- **Early Return**: Handle edge cases (invalid scores) before rendering

### Styling
- Follow existing design system: Tailwind + design tokens from `tailwind.config.ts`
- Table styling matches `DESIGN_SYSTEM.md` Section 5.3 (Tables)
- Active/highlighted row uses `bg-primary/15` with a left `border-primary` accent
- Smooth transitions on highlight changes (`transition-all duration-300`)

---

## 📐 Data Sources (from user-provided images)

### Listening Score Table
| Raw Score | Band |
|:---|:---|
| 39–40 | 9 |
| 37–38 | 8.5 |
| 35–36 | 8 |
| 32–34 | 7.5 |
| 30–31 | 7 |
| 26–29 | 6.5 |
| 23–25 | 6 |
| 18–22 | 5.5 |
| 16–17 | 5 |
| 13–15 | 4.5 |
| 11–12 | 4 |
| 8–10 | 3.5 |
| 6–7 | 3 |
| 4–5 | 2.5 |
| 2–3 | 2 |
| 1 | 1.5 |
| 0 | 0 |

### Reading Score Table (Academic)
| Raw Score | Band |
|:---|:---|
| 39–40 | 9 |
| 37–38 | 8.5 |
| 35–36 | 8 |
| 33–34 | 7.5 |
| 30–32 | 7 |
| 27–29 | 6.5 |
| 23–26 | 6 |
| 19–22 | 5.5 |
| 15–18 | 5 |
| 13–14 | 4.5 |
| 10–12 | 4 |
| 8–9 | 3.5 |
| 6–7 | 3 |
| 4–5 | 2.5 |
| 2–3 | 2 |
| 1 | 1.5 |
| 0 | 0 |

### Writing Band Descriptors (Task 1 & Task 2)
- 4 criteria: **Task Achievement/Response**, **Coherence & Cohesion**, **Lexical Resource**, **Grammatical Range & Accuracy**
- Band levels: 0–9
- Full text for each cell (see user-provided images)

### Speaking Band Descriptors
- 4 criteria: **Fluency & Coherence**, **Lexical Resource**, **Grammatical Range & Accuracy**, **Pronunciation**
- Band levels: 0–9
- Full text for each cell (see user-provided images)

---

*Each phase is self-contained and can be implemented independently. Start with Phase 1.*
