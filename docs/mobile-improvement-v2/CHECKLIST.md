# Checklist Tổng Hợp — Mobile Improvement v2

> Dùng file này để track tiến độ thực hiện. Đánh dấu `[x]` khi hoàn thành từng task.

---

## Phase 1 — Statistics Enhancement

**Service Layer**
- [ ] 1.1 Thêm 5 interfaces (`IeltsOverviewStats`, `IeltsFoundationStats`, `IeltsBasicStats`, `IeltsAdvancedStats`, `IeltsIntensiveStats`) vào `types/index.ts`
- [ ] 1.2 Thêm `ieltsStatisticsApi` vào `services/ielts.api.ts`
- [ ] 1.2 Export `ieltsStatisticsApi` từ `services/index.ts`

**Components Mới**
- [ ] 1.4 Tạo `components/ielts/stats/FoundationStatsTab.tsx`
- [ ] 1.5 Tạo `components/ielts/stats/BasicStatsTab.tsx`
- [ ] 1.6 Tạo `components/ielts/stats/OverviewStatsTab.tsx`
- [ ] 1.8 Tạo `components/ielts/stats/index.ts` barrel

**Màn Hình**
- [ ] 1.3 Refactor `app/ielts/statistics.tsx` — 4 tabs (Overview, Foundation, Basic, Advanced)
- [ ] 1.3 Lazy-fetch theo tab active
- [ ] 1.7 Thêm `IntensiveStatsSection` vào Advanced tab

**Validation**
- [ ] Skeleton loading cho tất cả tabs
- [ ] Error state với retry
- [ ] Dark mode đúng

---

## Phase 2 — Advanced Community Answers

**Service Layer**
- [ ] 2.1 Thêm `CommunityWritingAnswer`, `CommunitySpeakingAnswer` vào `types/index.ts`
- [ ] 2.2 Thêm `getCommunityWritingAnswers` vào `ieltsAdvancedApi`
- [ ] 2.2 Thêm `getCommunityWritingAnswer` vào `ieltsAdvancedApi`
- [ ] 2.2 Thêm `getCommunitySpeakingAnswers` vào `ieltsAdvancedApi`
- [ ] 2.2 Thêm `getCommunitySpeakingAnswer` vào `ieltsAdvancedApi`

**Components Mới**
- [ ] 2.3 Tạo `components/ielts/community/CommunityAnswerCard.tsx`
- [ ] 2.8 Tạo `components/ielts/community/index.ts` barrel

**Màn Hình Mới**
- [ ] 2.4 Tạo `app/ielts/advanced/writing/[promptId]/community.tsx`
- [ ] 2.4 Tạo `app/ielts/advanced/speaking/[partId]/community.tsx`
- [ ] 2.5 Tạo `app/ielts/advanced/writing/[promptId]/community/[sessionId].tsx`
- [ ] 2.6 Tạo `app/ielts/advanced/speaking/[partId]/community/[sessionId].tsx`

**Tích Hợp**
- [ ] 2.7 Thêm Community button vào `app/ielts/advanced/writing/[promptId].tsx`
- [ ] 2.7 Thêm Community button vào `app/ielts/advanced/speaking/[partId].tsx`

**Validation**
- [ ] Pagination (infinite scroll)
- [ ] Sort by Band / by Date
- [ ] Empty state, Error state
- [ ] Dark mode

---

## Phase 3 — VocabLab Flashcard From Vocabulary

**Service Layer**
- [ ] 3.1 Thêm `createFlashcardFromVocabulary` vào `vocabLabApi`
- [ ] 3.1 Thêm `createFlashcardFromVocabularyWithReview` vào `vocabLabApi`

**Call Sites**
- [ ] 3.2 Audit tất cả call sites của `createFlashcard`
- [ ] 3.3 Cập nhật Foundation Vocabulary unit screen dùng đúng endpoint
- [ ] 3.4 Cập nhật `DictionaryPopup.tsx` — thêm `foundationVocabMeta` vào event
- [ ] 3.4 Cập nhật `GlobalAddCardFab.tsx` — conditional logic theo context

**Validation**
- [ ] Add từ Foundation Vocabulary → Foundation stats cập nhật
- [ ] Add từ text bất kỳ (DictionaryPopup generic) → vẫn dùng `createFlashcard` thường
- [ ] Toast feedback đúng

---

## Phase 4 — Intensive Practice Mode

**Service Layer**
- [ ] 4.1 Thêm `PracticeExamItem`, `PracticeCatalogResponse` vào `types/index.ts`
- [ ] 4.2 Thêm `getPracticeCatalog` vào `ieltsExamsApi`

**Màn Hình Cải Thiện**
- [ ] 4.3 Refactor `app/ielts/intensive/custom.tsx` → Practice Catalog browse

**Màn Hình Mới**
- [ ] 4.4 Tạo `app/ielts/intensive/practice/[sessionId].tsx`
- [ ] 4.4 Implement `PracticeListeningContent`
- [ ] 4.4 Implement `PracticeReadingContent`
- [ ] 4.4 Implement `PracticeWritingContent` (autosave)
- [ ] 4.4 Implement `PracticeSpeakingContent` (recording)
- [ ] 4.6 Tạo `app/ielts/intensive/practice/result/[sessionId].tsx`

**Tích Hợp**
- [ ] 4.5 Kiểm tra + reuse components từ `components/intensive/`
- [ ] 4.7 Fix navigate trong `app/ielts/history.tsx` cho practice items

**Validation**
- [ ] Practice Catalog filter đúng theo 4 kỹ năng
- [ ] Practice session timer là count-up (không hard cutoff)
- [ ] Submit → navigate Practice Result
- [ ] Grading poll cho W/S
- [ ] Dark mode

---

## Phase 5 — Shadowing & Dictation Management

**Service Layer**
- [ ] 5.1 Thêm `renameFolder`, `deleteFolder`, `updateVideo` vào `shadowingApi`
- [ ] 5.2 Thêm `renameFolder`, `deleteFolder`, `updateVideo` vào `dictationApi`

**Hooks**
- [ ] 5.3 Thêm handlers/state vào `useShadowingLessons`
- [ ] 5.4 Thêm handlers/state vào `useDictationLessons`

**Components Mới**
- [ ] 5.5 Tạo `components/shadowing/FolderManageSheet.tsx`
- [ ] 5.6 Tạo `components/shadowing/EditVideoSheet.tsx`

**Màn Hình**
- [ ] 5.7 Cập nhật `app/practice-tools/my-videos/index.tsx` — edit button + folder menu
- [ ] 5.8 Implement folder grouping (SectionList) trong My Videos

**Validation**
- [ ] Rename folder → tên cập nhật trên UI
- [ ] Delete folder → ConfirmDialog với cảnh báo → sau delete không còn trong list
- [ ] Edit video → form pre-filled, sau save card cập nhật
- [ ] Dark mode

---

## Phase 6 — Minor API & UX Gaps

**6.1 getSharedDeck**
- [ ] Thêm `getSharedDeck(id)` vào `vocabLabApi`
- [ ] Thêm `SharedDeck` interface vào `types/index.ts`

**6.2 getTemplates & updateCardTypeDescription**
- [ ] Thêm `CardTemplate` interface vào `types/index.ts`
- [ ] Thêm `getTemplates` vào `vocabLabApi`
- [ ] Thêm `updateCardTypeDescription` vào `vocabLabApi`
- [ ] Tích hợp vào `CardTypeEditorModal`

**6.3 VocabLab Stats Range**
- [ ] Cập nhật `getStats` method hỗ trợ `range` param
- [ ] Thêm range selector UI vào `StatsTab`

**6.4 Shared Deck Detail**
- [ ] Tạo `SharedDeckDetailSheet.tsx`
- [ ] Tích hợp vào `MarketplaceTab`

**6.5 Forgot Password**
- [ ] Audit `app/(auth)/forgot-password.tsx`
- [ ] Verify backend endpoints (`/auth/forgot-password`, `/auth/reset-password`)
- [ ] Complete multi-step flow nếu thiếu
- [ ] Verify link "Quên mật khẩu?" trong `login.tsx`

**6.6 Minor Polish**
- [ ] VocabLab Stats default range = 30d
- [ ] My Videos dual mode: verify dictation user videos được fetch riêng
- [ ] Advanced result screen: thêm "Luyện thêm" button

---

## Acceptance Gate (Toàn Phase)

**Trước khi merge:**
- [ ] `tsc --noEmit` không có lỗi TypeScript
- [ ] Build thành công trên iOS Simulator: `expo run:ios`
- [ ] Build thành công trên Android Emulator: `expo run:android`
- [ ] Dark mode kiểm tra trên tất cả screens mới
- [ ] Không có console.error hoặc unhandled promise rejection
- [ ] Pull Request description đầy đủ với danh sách thay đổi và screenshots
