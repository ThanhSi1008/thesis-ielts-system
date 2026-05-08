# Phase 3 — StageCard Component

## Target File
`frontend-web/src/app/ielts/dashboard/_components/StageCard.tsx`

## Purpose
A reusable, config-driven card component for each learning stage. Receives only the props it needs (**ISP**) — not the entire `StageDefinition` object or API response.

## Dependencies
- `lucide-react` (icons)
- `next/link`
- Types from `dashboard.constants.ts` (for `StageSubItem` only — not the whole definition, the parent passes individual props)

---

## Props Interface

```typescript
interface StageCardProps {
  /** Stage number (1–4) for visual indicator */
  stageNumber: number;
  /** Display title */
  title: string;
  /** Short subtitle */
  subtitle: string;
  /** Description of the stage */
  description: string;
  /** Badge label (e.g., "Stage 1") */
  badge: string;
  /** Primary link */
  href: string;
  /** CTA button text */
  ctaLabel: string;
  /** Gradient class for card accent */
  gradientClass: string;
  /** Sub-items with counts */
  subItems: Array<{
    label: string;
    description: string;
    href: string;
    iconKey: string;
    count: number | null;
  }>;
  /** Whether the stage is "active" / recommended (optional visual emphasis) */
  isActive?: boolean;
}
```

---

## Code

```tsx
// frontend-web/src/app/ielts/dashboard/_components/StageCard.tsx

"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  SpellCheck,
  Mic,
  Headphones,
  FileText,
  PenTool,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

// ─── Icon resolver (OCP: add new icons here, no component changes) ───
const ICON_MAP: Record<string, React.ElementType> = {
  "book-open": BookOpen,
  "spell-check": SpellCheck,
  mic: Mic,
  headphones: Headphones,
  "file-text": FileText,
  "pen-tool": PenTool,
  "message-circle": MessageCircle,
};

interface SubItemProps {
  label: string;
  description: string;
  href: string;
  iconKey: string;
  count: number | null;
}

interface StageCardProps {
  stageNumber: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  href: string;
  ctaLabel: string;
  gradientClass: string;
  subItems: SubItemProps[];
  isActive?: boolean;
}

function SubItemRow({ label, description, href, iconKey, count }: SubItemProps) {
  const Icon = ICON_MAP[iconKey] ?? BookOpen;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-slate-700 transition-colors">
        <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
            {label}
          </span>
          {count !== null && (
            <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
              {count}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 transition-colors shrink-0" />
    </Link>
  );
}

export default function StageCard({
  stageNumber,
  title,
  subtitle,
  description,
  badge,
  href,
  ctaLabel,
  gradientClass,
  subItems,
  isActive = false,
}: StageCardProps) {
  return (
    <div
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
        isActive
          ? "border-primary/30 shadow-lg shadow-primary/5"
          : "border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Gradient accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradientClass}`} />

      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Stage number circle */}
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-black text-sm shadow-sm`}
            >
              {stageNumber}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{subtitle}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-1 rounded-md">
            {badge}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
          {description}
        </p>

        {/* Sub-items */}
        <div className="space-y-0.5 mb-5">
          {subItems.map((item) => (
            <SubItemRow key={item.label} {...item} />
          ))}
        </div>

        {/* CTA */}
        <Link
          href={href}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-gradient-to-r ${gradientClass} text-white hover:opacity-90 shadow-sm`}
        >
          {ctaLabel}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
```

---

## Design Notes

1. **Gradient accent bar** at top — each stage gets its own color (emerald, blue, violet, orange). This creates visual distinction in the roadmap.
2. **Sub-items** are clickable links that navigate directly to the sub-section.
3. **Count badges** show `null` gracefully — they simply don't render the badge.
4. The `isActive` prop can be used later to highlight the "recommended next step" stage.
5. Component is **under 120 lines** (SRP limit).

---

## Checklist
- [ ] File created at `frontend-web/src/app/ielts/dashboard/_components/StageCard.tsx`
- [ ] Component only renders UI, no data fetching (SRP)
- [ ] Props are individual values, not a large object (ISP)
- [ ] Icon resolution is config-driven (OCP)
- [ ] Under 120 lines
