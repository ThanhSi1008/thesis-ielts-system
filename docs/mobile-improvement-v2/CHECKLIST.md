# Checklist Tổng Hợp — Mobile Improvement v2

> Dùng file này để track tiến độ thực hiện. Đánh dấu `[x]` khi hoàn thành từng task.

---

## Phase 1 — Statistics Enhancement

**Service Layer**
- [x] 1.1 Thêm 5 interfaces (`IeltsOverviewStats`, `IeltsFoundationStats`, `IeltsBasicStats`, `IeltsAdvancedStats`, `IeltsIntensiveStats`) vào `types/index.ts`
- [x] 1.2 Thêm `ieltsStatisticsApi` vào `services/ielts.api.ts`
- [x] 1.2 Export `ieltsStatisticsApi` từ `services/index.ts`

**Components Mới**
- [x] 1.4 Tạo `components/ielts/stats/FoundationStatsTab.tsx`
- [x] 1.5 Tạo `components/ielts/stats/BasicStatsTab.tsx`
- [x] 1.6 Tạo `components/ielts/stats/OverviewStatsTab.tsx`
- [x] 1.8 Tạo `components/ielts/stats/index.ts` barrel

**Màn Hình**
- [x] 1.3 Refactor `app/ielts/statistics.tsx` — 4 tabs (Overview, Foundation, Basic, Advanced)
- [x] 1.3 Lazy-fetch theo tab active
- [x] 1.7 Thêm `IntensiveStatsSection` vào Advanced tab

**Validation**
- [x] Skeleton loading cho tất cả tabs
- [x] Error state với retry
- [x] Dark mode đúng

---

## Phase 2 — Advanced Community Answers

**Service Layer**
- [x] 2.1 Thêm `CommunityWritingAnswer`, `CommunitySpeakingAnswer` vào `types/index.ts`
- [x] 2.2 Thêm `getCommunityWritingAnswers` vào `ieltsAdvancedApi`
- [x] 2.2 Thêm `getCommunityWritingAnswer` vào `ieltsAdvancedApi`
- [x] 2.2 Thêm `getCommunitySpeakingAnswers` vào `ieltsAdvancedApi`
- [x] 2.2 Thêm `getCommunitySpeakingAnswer` vào `ieltsAdvancedApi`

**Components Mới**
- [x] 2.3 Tạo `components/ielts/community/CommunityAnswerCard.tsx`
- [x] 2.8 Tạo `components/ielts/community/index.ts` barrel

**Màn Hình Mới**
- [x] 2.4 Tạo `app/ielts/advanced/writing/[promptId]/community.tsx`
- [x] 2.4 Tạo `app/ielts/advanced/speaking/[partId]/community.tsx`
- [x] 2.5 Tạo `app/ielts/advanced/writing/[promptId]/community/[sessionId].tsx`
- [x] 2.6 Tạo `app/ielts/advanced/speaking/[partId]/community/[sessionId].tsx`

**Tích Hợp**
- [x] 2.7 Thêm Community button vào `app/ielts/advanced/writing/[promptId].tsx`
- [x] 2.7 Thêm Community button vào `app/ielts/advanced/speaking/[partId].tsx`

**Validation**
- [x] Pagination (infinite scroll)
- [x] Sort by Band / by Date
- [x] Empty state, Error state
- [x] Dark mode

---

## Phase 3 — VocabLab Flashcard From Vocabulary

**Service Layer**
- [x] 3.1 Thêm `createFlashcardFromVocabulary` vào `vocabLabApi`
- [x] 3.1 Thêm `createFlashcardFromVocabularyWithReview` vào `vocabLabApi`

**Call Sites**
- [x] 3.2 Audit tất cả call sites của `createFlashcard`
- [x] 3.3 Cập nhật Foundation Vocabulary unit screen dùng đúng endpoint
- [x] 3.4 Cập nhật `DictionaryPopup.tsx` — thêm `foundationVocabMeta` vào event
- [x] 3.4 Cập nhật `GlobalAddCardFab.tsx` — conditional logic theo context

**Validation**
- [x] Add từ Foundation Vocabulary → Foundation stats cập nhật
- [x] Add từ text bất kỳ (DictionaryPopup generic) → vẫn dùng `createFlashcard` thường
- [x] Toast feedback đúng

---

## Phase 4 — Intensive Practice Mode

**Service Layer**
- [x] 4.1 Thêm `PracticeExamItem`, `PracticeCatalogResponse` vào `types/index.ts`
- [x] 4.2 Thêm `getPracticeCatalog` vào `ieltsExamsApi`

**Màn Hình Cải Thiện**
- [x] 4.3 Refactor `app/ielts/intensive/custom.tsx` → Practice Catalog browse

**Màn Hình Mới**
- [x] 4.4 Tạo `app/ielts/intensive/practice/[sessionId].tsx`
- [x] 4.4 Implement `PracticeListeningContent`
- [x] 4.4 Implement `PracticeReadingContent`
- [x] 4.4 Implement `PracticeWritingContent` (autosave)
- [x] 4.4 Implement `PracticeSpeakingContent` (recording)
- [x] 4.6 Tạo `app/ielts/intensive/practice/result/[sessionId].tsx`

**Tích Hợp**
- [x] 4.5 Kiểm tra + reuse components từ `components/intensive/`
- [x] 4.7 Fix navigate trong `app/ielts/history.tsx` cho practice items

**Validation**
- [x] Practice Catalog filter đúng theo 4 kỹ năng
- [x] Practice session timer là count-up (không hard cutoff)
- [x] Submit → navigate Practice Result
- [x] Grading poll cho W/S
- [x] Dark mode

---

## Phase 5 — Shadowing & Dictation Management

**Service Layer**
- [x] 5.1 Thêm `renameFolder`, `deleteFolder`, `updateVideo` vào `shadowingApi`
- [x] 5.2 Thêm `renameFolder`, `deleteFolder`, `updateVideo` vào `dictationApi`

**Hooks**
- [x] 5.3 Thêm handlers/state vào `useShadowingLessons`
- [x] 5.4 Thêm handlers/state vào `useDictationLessons`

**Components Mới**
- [x] 5.5 Tạo `components/shadowing/FolderManageSheet.tsx`
- [x] 5.6 Tạo `components/shadowing/EditVideoSheet.tsx`

**Màn Hình**
- [x] 5.7 Cập nhật `app/practice-tools/my-videos/index.tsx` — edit button + folder menu
- [x] 5.8 Implement folder grouping (SectionList) trong My Videos

**Validation**
- [x] Rename folder → tên cập nhật trên UI
- [x] Delete folder → ConfirmDialog với cảnh báo → sau delete không còn trong list
- [x] Edit video → form pre-filled, sau save card cập nhật
- [x] Dark mode

---

## Phase 6 — Minor API & UX Gaps

**6.1 getSharedDeck**
- [x] Thêm `getSharedDeck(id)` vào `vocabLabApi`
- [x] Thêm `SharedDeck` interface vào `types/index.ts`

**6.2 getTemplates & updateCardTypeDescription**
- [x] Thêm `CardTemplate` interface vào `types/index.ts`
- [x] Thêm `getTemplates` vào `vocabLabApi`
- [x] Thêm `updateCardTypeDescription` vào `vocabLabApi`
- [x] Tích hợp vào `CardTypeEditorModal`

**6.3 VocabLab Stats Range**
- [x] Cập nhật `getStats` method hỗ trợ `range` param
- [x] Thêm range selector UI vào `StatsTab`

**6.4 Shared Deck Detail**
- [x] Tạo `SharedDeckDetailSheet.tsx`
- [x] Tích hợp vào `MarketplaceTab`

**6.5 Forgot Password**
- [x] Audit `app/(auth)/forgot-password.tsx`
- [x] Verify backend endpoints (`/auth/forgot-password`, `/auth/reset-password`)
- [x] Complete multi-step flow nếu thiếu
- [x] Verify link "Quên mật khẩu?" trong `login.tsx`

**6.6 Minor Polish**
- [x] VocabLab Stats default range = 30d
- [x] My Videos dual mode: verify dictation user videos được fetch riêng
- [x] Advanced result screen: thêm "Luyện thêm" button

---

## Acceptance Gate (Toàn Phase)

**Trước khi merge:**
- [x] `tsc --noEmit` không có lỗi TypeScript
- [x] Build thành công trên iOS Simulator: `expo run:ios`
- [x] Build thành công trên Android Emulator: `expo run:android`
- [x] Dark mode kiểm tra trên tất cả screens mới
- [x] Không có console.error hoặc unhandled promise rejection
- [x] Pull Request description đầy đủ với danh sách thay đổi và screenshots
