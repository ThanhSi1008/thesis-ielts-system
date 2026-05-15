# Phase 5 — FeatureCard Component

## Target File
`frontend-web/src/app/ielts/dashboard/_components/FeatureCard.tsx`

## Purpose
A reusable card for the **additional features** section (Roadmap, Calculator, Student/Teacher, Statistics). Each card is descriptive — explaining what the feature does and linking to it.

## Dependencies
- `lucide-react` (icons)
- `next/link`

---

## Code

```tsx
// frontend-web/src/app/ielts/dashboard/_components/FeatureCard.tsx

"use client";

import React from "react";
import Link from "next/link";
import { Map, Calculator, Users, BarChart2, ArrowRight } from "lucide-react";

// ─── Icon resolver (OCP) ───
const FEATURE_ICON_MAP: Record<string, React.ElementType> = {
  map: Map,
  calculator: Calculator,
  users: Users,
  "bar-chart-2": BarChart2,
};

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  iconKey: string;
  accentColor: string;
}

export default function FeatureCard({
  title,
  description,
  href,
  iconKey,
  accentColor,
}: FeatureCardProps) {
  const Icon = FEATURE_ICON_MAP[iconKey] ?? Map;

  return (
    <Link
      href={href}
      className="group block bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-200 dark:hover:border-slate-700"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Icon className={`w-5 h-5 ${accentColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <ArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

---

## Design Notes

1. **Entire card is a link** — clicking anywhere navigates to the feature.
2. **Arrow icon** animates on hover to indicate navigability.
3. **Accent color** is applied to the icon only — keeps the design clean.
4. **Description** is truncated at 3 lines (`line-clamp-3`) to maintain consistent card heights.
5. Component is very focused — **under 60 lines** (SRP).

---

## Checklist
- [ ] File created at `frontend-web/src/app/ielts/dashboard/_components/FeatureCard.tsx`
- [ ] Pure presentational component (SRP)
- [ ] Props are individual values (ISP)
- [ ] Under 120 lines
