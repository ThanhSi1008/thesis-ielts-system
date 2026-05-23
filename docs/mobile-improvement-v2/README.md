# Mobile Improvement v2 — Kế Hoạch Triển Khai

> **Branch:** `feature/improve-mobile-app-ux`  
> **Phạm vi:** `frontend-mobile/`  
> **Mục tiêu:** Đạt feature parity với `frontend-web` cho tất cả tính năng người dùng cuối (ngoại trừ Admin Panel vốn web-only)

---

## Bối Cảnh

Sau đợt refactor lớn (Phases MI-01 → MI-17), mobile đã có nền tảng vững: design system atoms/molecules, dark mode, push notifications, Shadowing/Dictation, Vocab Lab đầy đủ, IELTS Advanced Speaking/Writing. Tuy nhiên so sánh toàn diện với `frontend-web` vẫn còn **7 nhóm gap** ảnh hưởng đến trải nghiệm người dùng và tính nhất quán dữ liệu.

---

## Tóm Tắt Gap Analysis

| # | Vấn đề | Mức độ | Phase |
|---|---|---|---|
| 1 | Màn hình Statistics không dùng `/ielts-statistics/*` API → thiếu Foundation & Basic stats | 🔴 Cao | Phase 1 |
| 2 | Không có màn hình xem Community Answers (peer review) cho Advanced Speaking & Writing | 🔴 Cao | Phase 2 |
| 3 | `GlobalVocabFab` / `GlobalAddCardFab` dùng `createFlashcard` thông thường, không gắn vocab word link | 🟡 Trung bình | Phase 3 |
| 4 | Chưa có `getPracticeCatalog` + màn hình Practice Session cho IELTS Intensive | 🟡 Trung bình | Phase 4 |
| 5 | Thiếu rename/delete folder và update video metadata cho Shadowing & Dictation | 🟡 Trung bình | Phase 5 |
| 6 | VocabLab API thiếu: `getSharedDeck`, `getTemplates`, `updateCardTypeDescription`, range param cho stats | 🟢 Thấp | Phase 6 |
| 7 | Forgot Password flow tồn tại trên mobile nhưng web thiếu → cần verify backend route | 🟢 Thấp | Phase 6 |

---

## Sơ Đồ Phases

```
Phase 1 ──────────────────────────────── Statistics Enhancement
Phase 2 ──────────────────────────────── Advanced Community Answers
Phase 3 ──────────────────────────────── VocabLab Flashcard From Vocabulary
Phase 4 ──────────────────────────────── Intensive Practice Mode
Phase 5 ──────────────────────────────── Shadowing & Dictation Management
Phase 6 ──────────────────────────────── Minor API & UX Gaps
```

Các phase **độc lập** với nhau (không có hard dependency). Thứ tự ưu tiên dựa trên impact với người dùng.

---

## Kiến Trúc Liên Quan

### Service Layer (Mobile)
```
frontend-mobile/services/
├── api-client.ts          # Native fetch wrapper, JWT, refresh deduplication
├── features.api.ts        # vocabLabApi, shadowingApi, dictationApi, ieltsBasicApi, subscriptionsApi, gamificationApi, notificationsApi
├── ielts.api.ts           # ieltsProfileApi, ieltsAdvancedApi, ieltsExamsApi, studentTeacherApi
├── learning.api.ts        # vocabularyApi, grammarApi, pronunciationApi, learningApi
├── notes.api.ts
├── posts.api.ts
└── index.ts               # Barrel export
```

### Route Structure (Mobile — Expo Router)
```
frontend-mobile/app/
├── ielts/
│   ├── statistics.tsx          # ← Phase 1: thêm Foundation + Basic sections
│   ├── advanced/
│   │   ├── speaking/
│   │   │   └── [partId].tsx    # ← Phase 2: thêm community tab
│   │   └── writing/
│   │       └── [promptId].tsx  # ← Phase 2: thêm community tab
│   └── intensive/
│       ├── custom.tsx          # ← Phase 4: expose practice catalog
│       └── [examId].tsx
├── practice-tools/
│   └── my-videos/index.tsx     # ← Phase 5: thêm folder management
└── vocab-lab/
    └── index.tsx               # ← Phase 6: thêm deck detail modal
```

---

## Danh Sách Tài Liệu Phase

| File | Nội dung |
|---|---|
| [`PHASE-1-statistics.md`](./PHASE-1-statistics.md) | Thêm Foundation & Basic vào màn hình Statistics |
| [`PHASE-2-community.md`](./PHASE-2-community.md) | Community Answers cho Advanced Speaking & Writing |
| [`PHASE-3-vocab-flashcard.md`](./PHASE-3-vocab-flashcard.md) | createFlashcardFromVocabulary cho FAB & Dictionary |
| [`PHASE-4-intensive-practice.md`](./PHASE-4-intensive-practice.md) | Practice Catalog + Practice Session UI |
| [`PHASE-5-shadowing-management.md`](./PHASE-5-shadowing-management.md) | Folder rename/delete + Video metadata update |
| [`PHASE-6-minor-gaps.md`](./PHASE-6-minor-gaps.md) | VocabLab API gaps + range stats + misc |

---

## Conventions Áp Dụng

- **API calls:** luôn qua `apiClient` trong `services/`, không gọi `fetch` trực tiếp từ component.
- **Theming:** mọi surface mới phải dùng `colors` từ `useTheme()`, không hard-code hex.
- **Design:** build từ atoms (`Button`, `Text`, `Badge`, `Skeleton`) trước, fallback bespoke styling chỉ khi cần.
- **Route params:** dùng `useLocalSearchParams<{...}>()` với typed generic.
- **Loading state:** dùng `<Skeleton>` atom trong khi fetch, không dùng spinner đơn lẻ cho toàn màn hình.
- **Error state:** dùng `<ErrorState>` molecule từ `components/molecules/`.
- **TypeScript:** mọi response type phải được khai báo tường minh, không dùng `any` ở public API.
- **Dark mode:** validate mọi component mới trong `app/_dev/atom-gallery.tsx` ở cả light/dark trước khi ship.

---

## Acceptance Criteria Chung

- [ ] Tất cả màn hình mới build được trên iOS Simulator và Android Emulator.
- [ ] Không có TypeScript error mới (`tsc --noEmit`).
- [ ] Dark mode hoạt động đúng cho toàn bộ UI mới.
- [ ] Mọi API call có xử lý loading, error, và empty state.
- [ ] Không breaking change với các màn hình hiện tại.
