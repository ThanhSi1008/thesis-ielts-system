# Design System Audit: Static `COLORS` Usage

This document lists files in `frontend-mobile/app` and `frontend-mobile/components` that import or reference the legacy `COLORS` static object from `@/constants`. Transitioning these files to `useTheme()` will decouple components from hardcoded colors and enable full dark mode support.

---

## Summary of Findings

- **Total Audited Files**: 40+ files
- **Must-Migrate (High Priority)**: 15 files — These are core UI atoms, shared global components, and layouts that block theme consistency.
- **Can-Defer (Medium/Low Priority)**: 25+ files — These are downstream features, specific exam screens, or sub-tabs that can be updated incrementally.

---

## Must-Migrate (Core Layouts & Global Components)

These components are reused frequently across the application. Migrating them guarantees a cohesive aesthetic.

| File Path | Sample Line(s) | Description / Target Replacement |
| :--- | :--- | :--- |
| [components/ui.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/ui.tsx) | L57, L76, L154, L172-186 | **Core Legacy UI Sheet**. Houses Buttons, Badges, Chips, ScoreBadges using `COLORS.primary` and `COLORS.success`. *To be deprecated in MI-01-05 in favor of `components/atoms`.* |
| [components/Card.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/Card.tsx) | L22, L40 | Base Card container using static colors. Migrate to `colors.card` and `colors.border`. |
| [components/ErrorView.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/ErrorView.tsx) | L7, L45, L51 | Custom Error wrapper using `COLORS.error` and `COLORS.primary`. Replace with theme equivalents. |
| [components/LoadingSpinner.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/LoadingSpinner.tsx) | L14, L17 | Indicator coloring defaults to `COLORS.primary`. Replace with `colors.primary`. |
| [components/ui/SharedDrawer.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/ui/SharedDrawer.tsx) | L185, L188 | Sidebar navigation drawer using static gray variants. |
| [components/ui/Toaster.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/ui/Toaster.tsx) | L72, L110 | Dynamic Toast notification styles referencing semantic colors. |
| [components/ui/UpgradeModal.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/ui/UpgradeModal.tsx) | L12, L148 | Paywall pricing modal drawing brand yellow. |
| [components/ui/FeatureLock.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/ui/FeatureLock.tsx) | L210, L225 | Paywall feature lock overlay. |
| [components/global/GlobalVocabFab.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/global/GlobalVocabFab.tsx) | L133, L136 | Floating quick-add vocabulary action button. |
| [components/global/DictionaryPopup.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/global/DictionaryPopup.tsx) | L205, L241, L297 | Shared dictionary popover. Needs extensive mapping to `bgElevated` and `borderInteractive`. |
| [app/(tabs)/_layout.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/(tabs)/_layout.tsx) | L19 | Uses `COLORS.primary` for tab active highlights. *Migrating in Phase MI-01-04.* |
| [app/(tabs)/index.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/(tabs)/index.tsx) | L84, L214, L233 | Main Home Dashboard. Hardcoded to a pure black overlay. *Migrating in Phase MI-01-04.* |
| [app/(tabs)/explore.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/(tabs)/explore.tsx) | L11, L127 | Explore section featuring static slate backgrounds. *Migrating in Phase MI-01-04.* |
| [app/(tabs)/profile.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/(tabs)/profile.tsx) | L18, L287, L390 | Profile dashboard settings sheet. *Migrating in Phase MI-01-04.* |
| [app/(auth)/login.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/(auth)/login.tsx) | L31, L188 | User authentication page. *Migrated in Phase MI-06.* |

---

## Can-Defer (Downstream Screens & Features)

These feature components contain localized styling details. They can safely inherit theme variables step-by-step during feature refinements.

### Vocabulary & Spaced Repetition (SRS)
- [app/vocab-lab/index.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/vocab-lab/index.tsx) (L12, L195)
- [app/vocab-lab/[deckId].tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/vocab-lab/[deckId].tsx) (L10, L90)
- [app/vocab-lab/study/[deckId].tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/vocab-lab/study/[deckId].tsx) (L14, L310)
- [components/vocab-lab/DecksTab.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/vocab-lab/DecksTab.tsx) (L142, L198)
- [components/vocab-lab/StatsTab.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/vocab-lab/StatsTab.tsx) (L110, L288)
- [components/vocab-lab/MarketplaceTab.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/vocab-lab/MarketplaceTab.tsx) (L122, L240)

### IELTS Practice & Intensive Training
- [app/ielts/dashboard.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/ielts/dashboard.tsx) (L15, L180)
- [app/ielts/roadmap.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/ielts/roadmap.tsx) (L14, L148)
- [app/ielts/history.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/ielts/history.tsx) (L11, L98)
- [app/ielts/intensive/[examId].tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/ielts/intensive/%5BexamId%5D.tsx) (L45, L1102)
- [app/ielts/advanced/statistics.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/app/ielts/advanced/statistics.tsx) (L22, L400)
- [components/ielts/LibraryContent.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/ielts/LibraryContent.tsx) (L18, L64)
- [components/ielts/LessonRow.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/ielts/LessonRow.tsx) (L4, L78)

### Speaking Device & Rubrics
- [components/SpeakingDeviceTest.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/SpeakingDeviceTest.tsx) (L640, L666, L708)
- [components/voice/RecordButton.tsx](file:///Users/xis108/Desktop/thesis-ielts-system/frontend-mobile/components/voice/RecordButton.tsx) (L90, L120)

---

## Action Plan

1. **Atoms Shift**: Phase MI-02 will completely implement alternative themed elements (`Button`, `Text`, `Badge`, `Chip`, `Input`) in `components/atoms`.
2. **Bulk Migration**: Subsequent phases (MI-03, MI-04, MI-07 to MI-10) will systematically swap local imports of static `COLORS` in these categorized files for themed style hooks.
