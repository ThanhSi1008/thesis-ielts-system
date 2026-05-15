# Phase 1 — Constants & Configuration

## Target File
`frontend-web/src/app/ielts/dashboard/_constants/dashboard.constants.ts`

## Purpose
Define all static configuration for the dashboard in a single file. This makes the dashboard **OCP-compliant** — adding a new stage or feature means adding to these arrays, not modifying components.

## Dependencies
- None (pure data file)

---

## Code

```typescript
// frontend-web/src/app/ielts/dashboard/_constants/dashboard.constants.ts

// ──────────────────────────────────────────────
// Stage Definitions (the 4-stage learning path)
// ──────────────────────────────────────────────

export interface StageSubItem {
  /** Display label */
  label: string;
  /** Short description */
  description: string;
  /** Route to navigate */
  href: string;
  /** Icon key — resolved to a Lucide icon in the component */
  iconKey: "book-open" | "spell-check" | "mic" | "headphones" | "file-text" | "pen-tool" | "message-circle";
  /** Data key used by useDashboardData to populate counts */
  dataKey: string;
}

export interface StageDefinition {
  /** Unique key */
  id: "foundation" | "basic" | "advanced" | "intensive";
  /** Display title */
  title: string;
  /** Short subtitle */
  subtitle: string;
  /** Longer description of what this stage covers */
  description: string;
  /** Badge text shown on the card */
  badge: string;
  /** Primary link to navigate into the stage */
  href: string;
  /** CTA button text */
  ctaLabel: string;
  /** Sub-items within this stage */
  subItems: StageSubItem[];
  /** Gradient class for card accent */
  gradientClass: string;
  /** Stage number (1-4) */
  stageNumber: number;
}

export const STAGES: StageDefinition[] = [
  {
    id: "foundation",
    title: "Foundation",
    subtitle: "Build your English base",
    description:
      "Strengthen your core English skills before diving into IELTS-specific training. Master essential vocabulary, grammar rules, and pronunciation patterns.",
    badge: "Stage 1",
    href: "/ielts/vocabulary",
    ctaLabel: "Start Foundation",
    stageNumber: 1,
    gradientClass: "from-emerald-500 to-teal-600",
    subItems: [
      {
        label: "Vocabulary",
        description: "IELTS word books organized by topic",
        href: "/ielts/vocabulary",
        iconKey: "book-open",
        dataKey: "vocabularyBookCount",
      },
      {
        label: "Grammar",
        description: "Essential grammar topics with exercises",
        href: "/ielts/grammar",
        iconKey: "spell-check",
        dataKey: "grammarTopicCount",
      },
      {
        label: "Pronunciation",
        description: "IPA chart with 44 English sounds",
        href: "/ielts/pronunciation",
        iconKey: "mic",
        dataKey: "pronunciationSoundCount",
      },
    ],
  },
  {
    id: "basic",
    title: "IELTS Basic",
    subtitle: "Learn IELTS fundamentals",
    description:
      "Understand IELTS question types through structured lessons and practice exercises for all four skills: Listening, Reading, Writing, and Speaking.",
    badge: "Stage 2",
    href: "/ielts/basic",
    ctaLabel: "Start Basic",
    stageNumber: 2,
    gradientClass: "from-blue-500 to-indigo-600",
    subItems: [
      {
        label: "Listening",
        description: "Lessons & exercises for listening skills",
        href: "/ielts/basic/listening/lessons",
        iconKey: "headphones",
        dataKey: "basicListeningCount",
      },
      {
        label: "Reading",
        description: "Lessons & exercises for reading skills",
        href: "/ielts/basic/reading/lessons",
        iconKey: "file-text",
        dataKey: "basicReadingCount",
      },
      {
        label: "Writing",
        description: "Lessons & exercises for writing skills",
        href: "/ielts/basic/writing/lessons",
        iconKey: "pen-tool",
        dataKey: "basicWritingCount",
      },
      {
        label: "Speaking",
        description: "Lessons & exercises for speaking skills",
        href: "/ielts/basic/speaking/lessons",
        iconKey: "message-circle",
        dataKey: "basicSpeakingCount",
      },
    ],
  },
  {
    id: "advanced",
    title: "IELTS Advanced",
    subtitle: "Practice with real question types",
    description:
      "Sharpen your skills with part-by-part practice. Each skill features real IELTS question types with AI-powered feedback for Writing and Speaking.",
    badge: "Stage 3",
    href: "/ielts/advanced",
    ctaLabel: "Start Advanced",
    stageNumber: 3,
    gradientClass: "from-violet-500 to-purple-600",
    subItems: [
      {
        label: "Listening",
        description: "Part-by-part listening practice",
        href: "/ielts/advanced?skill=Listening",
        iconKey: "headphones",
        dataKey: "advancedListeningCount",
      },
      {
        label: "Reading",
        description: "Part-by-part reading practice",
        href: "/ielts/advanced?skill=Reading",
        iconKey: "file-text",
        dataKey: "advancedReadingCount",
      },
      {
        label: "Writing",
        description: "Task 1 & Task 2 with AI grading",
        href: "/ielts/advanced?skill=Writing",
        iconKey: "pen-tool",
        dataKey: "advancedWritingCount",
      },
      {
        label: "Speaking",
        description: "Part 1, 2, 3 with AI feedback",
        href: "/ielts/advanced?skill=Speaking",
        iconKey: "message-circle",
        dataKey: "advancedSpeakingCount",
      },
    ],
  },
  {
    id: "intensive",
    title: "IELTS Intensive",
    subtitle: "Full mock tests under exam conditions",
    description:
      "Take complete IELTS tests from Cambridge IELTS books under timed conditions. Track your band score progression across multiple attempts.",
    badge: "Stage 4",
    href: "/ielts/intensive",
    ctaLabel: "Start Intensive",
    stageNumber: 4,
    gradientClass: "from-orange-500 to-red-600",
    subItems: [
      {
        label: "Listening",
        description: "Full 40-question listening tests",
        href: "/ielts/intensive?skill=LISTENING",
        iconKey: "headphones",
        dataKey: "intensiveListeningCount",
      },
      {
        label: "Reading",
        description: "Full 40-question reading tests",
        href: "/ielts/intensive?skill=READING",
        iconKey: "file-text",
        dataKey: "intensiveReadingCount",
      },
      {
        label: "Writing",
        description: "Full writing tests (Task 1 + Task 2)",
        href: "/ielts/intensive?skill=WRITING",
        iconKey: "pen-tool",
        dataKey: "intensiveWritingCount",
      },
      {
        label: "Speaking",
        description: "Full speaking tests (Part 1–3)",
        href: "/ielts/intensive?skill=SPEAKING",
        iconKey: "message-circle",
        dataKey: "intensiveSpeakingCount",
      },
    ],
  },
];

// ──────────────────────────────────────────────
// Additional Feature Definitions
// ──────────────────────────────────────────────

export interface FeatureDefinition {
  id: string;
  title: string;
  description: string;
  href: string;
  iconKey: "map" | "calculator" | "users" | "bar-chart-2";
  /** Accent color for the card */
  accentColor: string;
}

export const FEATURES: FeatureDefinition[] = [
  {
    id: "roadmap",
    title: "Roadmap",
    description:
      "Get a personalized study plan based on your target band score, current level, and available study time. The AI-powered roadmap adapts to your progress.",
    href: "/ielts/roadmap",
    iconKey: "map",
    accentColor: "text-amber-500",
  },
  {
    id: "calculator",
    title: "Band Score Calculator",
    description:
      "Convert your raw scores (correct answers) to IELTS band scores for Listening and Reading. View Writing & Speaking band descriptors and criteria to understand what examiners look for.",
    href: "/ielts/calculator",
    iconKey: "calculator",
    accentColor: "text-emerald-500",
  },
  {
    id: "student-teacher",
    title: "Student / Teacher",
    description:
      "Link your account with a teacher to share your practice progress. Teachers get a dedicated analytics dashboard showing each student's performance across all IELTS skills.",
    href: "/ielts/student-teacher",
    iconKey: "users",
    accentColor: "text-blue-500",
  },
  {
    id: "statistics",
    title: "Statistics",
    description:
      "Track your progress across all 4 learning stages. See vocabulary mastery, grammar accuracy, band score trends, and identify your weakest skills to focus on.",
    href: "/ielts/statistics",
    iconKey: "bar-chart-2",
    accentColor: "text-violet-500",
  },
];
```

---

## Checklist
- [ ] File created at `frontend-web/src/app/ielts/dashboard/_constants/dashboard.constants.ts`
- [ ] No imports from external libraries (pure data)
- [ ] All routes match existing routes in the app (verified from `IeltsSidebar.tsx`)
- [ ] TypeScript interfaces exported for use in components
