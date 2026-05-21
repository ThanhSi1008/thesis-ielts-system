# Mobile Development — Task List

> **Tham chiếu**: chi tiết kỹ thuật xem [`implement.md`](./implement.md).
> **Quy ước trạng thái**: `[ ]` = chưa làm · `[~]` = đang làm · `[x]` = xong · `[!]` = bị block / cần xác nhận user.
> **Estimate**: theo giờ solo-dev fulltime. **Android-first launch ~308h** (~38.5 ngày). Phase 19 (iOS launch + IAP, deferred) +24h khi trigger sau.
> **Mỗi task** có acceptance criteria ngầm — xem trong `implement.md` phần phase tương ứng.

---

## Phase 0 — Chuẩn bị (4h)

- [x] **P0-01** · Cài deps mới (`expo-notifications`, `expo-device`, `expo-tracking-transparency`, `react-native-toast-message`, `zustand`) · *est. 0.5h*
- [x] **P0-02** · Cập nhật `.env.example`: thêm `EXPO_PUBLIC_APP_SCHEME=iemai` · *est. 0.25h*
- [x] **P0-03** · Cập nhật `app.json`: thêm `scheme: "iemai"`, verify `bundleIdentifier` + `package` · *est. 0.5h*
- [x] **P0-04** · Tạo 4 file context rỗng (`SubscriptionContext`, `GradingContext`, `NotificationContext`, `ThemeContext`) · *est. 0.5h*
- [x] **P0-05** · Tạo 4 file UI rỗng (`Toaster`, `FeatureLock`, `UpgradeModal`, `UsageIndicator`) trong `components/ui/` · *est. 0.5h*
- [x] **P0-06** · Thêm script `"type-check": "tsc --noEmit"` vào `package.json` · *est. 0.25h*
- [x] **P0-07** · Chạy `npm run type-check` baseline + fix lỗi blocking (nếu có) · *est. 1h*
- [x] **P0-08** · Verify `expo start` boot OK trên cả iOS + Android sim · *est. 0.5h*

**Tổng phase 0**: 4h

---

## Phase 0.5 — Code Cleanup & Consistency Baseline + Foundation API parity (40h)

> **Bối cảnh**: 6 inline THEME object, 1471 hex literal, 143 `as any`, 3328 `any` tổng, không ESLint/Prettier, không ErrorBoundary, 6 file >700 lines, 36 router.push as any. Dọn 1 lần trước khi build feature mới — ROI cao.

### 0.5.1 Tooling baseline (4h)
- [x] **P05-01** · Cài + config ESLint (`eslint-config-expo` + plugin TS + react-hooks) · *est. 1h*
- [x] **P05-02** · Thêm scripts `lint`, `lint:fix` vào package.json · *est. 0.25h*
- [x] **P05-03** · Chạy `lint:fix` lần đầu auto-fix + commit riêng · *est. 0.25h*
- [x] **P05-04** · Cài Prettier + `.prettierrc` + `.prettierignore` + script `format` · *est. 0.5h*
- [x] **P05-05** · Chạy `npm run format` 1 lần toàn repo (commit riêng để dễ review code thật về sau) · *est. 0.5h*
- [x] **P05-06** · Tạo `components/ErrorBoundary.tsx` (class component + fallback UI + reload button) · *est. 1h*
- [x] **P05-07** · Wrap ErrorBoundary vào `app/_layout.tsx` ngoài cùng · *est. 0.25h*
- [x] **P05-08** · Crash test: throw Error trong 1 screen → verify ErrorBoundary catch · *est. 0.25h*
- [ ] **P05-09** · *Optional*: Husky + lint-staged pre-commit hook · *est. 0.5h*

### 0.5.2 Dead code & duplicate removal (3h)
- [x] **P05-10** · Verify `features/vocab-lab/` không có import (grep) → xóa thư mục · *est. 0.5h*
- [x] **P05-11** · Inline `types/api.ts` re-export hollow vào `types/index.ts`, update imports · *est. 0.5h*
- [x] **P05-12** · Thêm deprecation comment vào `services/api.ts` (sẽ xóa P15) · *est. 0.25h*
- [x] **P05-13** · Confirm 3 file dùng `services/api.ts`: grammar tab + book + unit · *est. 0.25h*
- [x] **P05-14** · Audit 6 hidden tabs trong `(tabs)/_layout.tsx` — verify route deep-link còn cần · *est. 1h*
- [x] **P05-15** · Cleanup hidden tabs không dùng (nếu có) · *est. 0.5h*

### 0.5.3 Theme tokens unification (6h)
- [x] **P05-16** · Mở rộng `constants/index.ts` COLORS: thêm `skill.{listening,reading,writing,speaking}`, `gray.50-900`, `successScale/warningScale/errorScale` · *est. 1h*
- [x] **P05-17** · Refactor `app/pricing.tsx`: xóa inline THEME, thay = COLORS.* · *est. 30min*
- [x] **P05-18** · Refactor `app/shadowing/index.tsx`: xóa inline THEME · *est. 30min*
- [x] **P05-19** · Refactor `app/(tabs)/vocabulary.tsx`: xóa inline THEME · *est. 15min*
- [x] **P05-20** · Refactor `app/vocabulary/[bookId].tsx`: xóa inline THEME · *est. 20min*
- [x] **P05-21** · Refactor `app/vocabulary/[bookId]/[unitId].tsx`: xóa inline THEME · *est. 30min*
- [x] **P05-22** · Refactor `app/ielts/calculator.tsx`: xóa inline THEME · *est. 15min*
- [x] **P05-23** · Replace `fontFamily: 'Farro-X'` → `FONTS.X` trong 15 file (find/replace cẩn thận) · *est. 1h*
- [x] **P05-24** · Skill color migration (find/replace `#E11D48`/`#2563EB`/`#D97706`/`#7C3AED` trong IELTS files) → `COLORS.skill.*` · *est. 1h*
- [x] **P05-25** · `grep -rn "const THEME" app/ components/` → confirm 0 · *est. 10min*
- [x] **P05-26** · `grep -rn "fontFamily: 'Farro" app/ components/` → confirm 0 · *est. 10min*
- [x] **P05-27** · Smoke test 10 screen UI không đổi (compare screenshot) · *est. 40min*

### 0.5.4 Barrel exports & module organization (2h)
- [x] **P05-28** · Tạo `components/ielts/index.ts` re-export tất cả ielts components · *est. 15min*
- [x] **P05-29** · Tạo `components/vocab-lab/index.ts` re-export · *est. 15min*
- [x] **P05-30** · Tạo `components/ui/index.ts` re-export (đã có `ui.tsx`, cần wrap) · *est. 15min*
- [x] **P05-31** · Mở rộng `components/index.ts` re-export tất cả module · *est. 15min*
- [x] **P05-32** · Refactor `services/index.ts`: thêm features, ielts, learning, notes, posts, auth · *est. 30min*
- [x] **P05-33** · Mở rộng `hooks/index.ts`: thêm useGradingPoll · *est. 10min*
- [x] **P05-34** · Replace imports trong top 10 file có import dài → dùng barrel · *est. 20min*


### 0.5.5 Typed routes (3h)
- [x] **P05-35** · Tạo `constants/routes.ts` với ROUTES object cho ~40 route hiện có + 10 route Phase sau · *est. 1h*
- [x] **P05-36** · Replace `router.push(... as any)` trong `app/(tabs)/*` (5 file chính) · *est. 30min*
- [x] **P05-37** · Replace `router.push(... as any)` trong `app/ielts/*` (~15 file) · *est. 1h*
- [x] **P05-38** · Replace `router.push(... as any)` các route còn lại (vocab-lab, shadowing, etc.) · *est. 20min*
- [x] **P05-39** · `grep -rn "router\.\(push\|replace\).*as any" app/` → confirm <5 (corner case OK) · *est. 10min*

### 0.5.6 Component decomposition (6h)

**Profile (3h)**:
- [x] **P05-40** · Tạo `components/profile/AccountTab.tsx` (info form + change password + delete account) · *est. 1.5h*
- [x] **P05-41** · Tạo `components/profile/StatsTab.tsx` (stats + achievements + XP) · *est. 45min*
- [x] **P05-42** · Tạo `components/profile/SettingsTab.tsx` (theme toggle + logout) · *est. 30min*
- [x] **P05-43** · Refactor `app/(tabs)/profile.tsx` thành shell <200 lines + import 3 tab · *est. 15min*

**Community (2h)**:
- [x] **P05-44** · Tạo `components/community/Avatar.tsx` (reusable) · *est. 15min*
- [x] **P05-45** · Tạo `components/community/PostCard.tsx` · *est. 45min*
- [x] **P05-46** · Tạo `components/community/CreatePostModal.tsx` · *est. 45min*
- [x] **P05-47** · Tạo `components/community/CommentSheet.tsx` · *est. 30min*
- [x] **P05-48** · Refactor `app/(tabs)/community.tsx` thành shell <250 lines · *est. 15min*

**Shadowing helper hook (1h)**:
- [x] **P05-49** · Tạo `hooks/useShadowingMode.ts` — extract state machine logic (Phase 7 sẽ refactor toàn bộ) · *est. 45min*
- [x] **P05-50** · Update `app/shadowing/[lessonId]/[mode].tsx` dùng hook mới · *est. 15min*

### 0.5.7 Port `lib/exam-parser.ts` từ web (4h)
- [x] **P05-51** · Tạo thư mục `lib/` mobile + port `exam-parser.ts` từ `frontend-web/src/lib/exam-parser.ts` · *est. 1.5h*
- [x] **P05-52** · Port `NormalizedItem` discriminated union types (mc_single, mc_multi, matching_group, completion, short_answer, true_false, diagram_label, map_label, flowchart, table_completion, summary_completion) · *est. 1h*
- [x] **P05-53** · Port `extractAllItemsFromPart()` + `questionNumbersFromItems()` helpers · *est. 0.5h*
- [x] **P05-54** · Migrate `app/ielts/advanced/[skill]/[partId].tsx` dùng parser mới (chỉ phần dễ) · *est. 0.5h*
- [x] **P05-55** · Manual test với 5 exam thật (3 Listening, 2 Reading) — không hồi quy render · *est. 0.5h*

### 0.5.8 Refactor `learning.api.ts` mobile đồng bộ web (4h)
- [x] **P05-56** · ~~Verify endpoint backend~~ · ✅ **DONE 2026-05-21** (R-04 audit): backend đầy đủ. Lưu ý URL `/pronunciation/progress/stats` (KHÔNG phải `/pronunciation/stats` như giả định ban đầu). Bonus endpoint `/pronunciation/sounds/:soundId/word-progress` chưa dùng ở web — mobile sẽ tận dụng (P05-71b dưới).
- [x] **P05-57** · Mở rộng `services/learning.api.ts` thêm `vocabularyApi.getProgress/updateWordProgress/submitQuestions` · *est. 0.5h*
- [x] **P05-58** · Thêm `grammarApi.getBooks/getBook/getUnit/getUnitByOrder/getProgress/updateProgress` · *est. 0.5h*
- [x] **P05-59** · Thêm `pronunciationApi.getAllSounds/getSound/getProgress/getStats/getSoundDetail` · *est. 0.5h*
- [x] **P05-60** · Bổ sung types `VocabularyBookProgress, WordProgress, GrammarUnitProgress, PronunciationData, SoundProgress, PronunciationStats, SubmitQuestionsResponse` vào `types/index.ts` · *est. 0.5h*
- [x] **P05-61** · Move `vocabularyApi` từ `ielts.api.ts` → `learning.api.ts`, đánh dấu `@deprecated` alias cũ · *est. 0.5h*
- [x] **P05-62** · Move `grammarApi` từ `features.api.ts` → `learning.api.ts`, đánh dấu `@deprecated` alias cũ · *est. 0.25h*
- [x] **P05-63** · Update 5-7 file import dùng path mới qua `@/services` barrel · *est. 0.25h*

### 0.5.9 Foundation Pronunciation API migrate (6h)
- [x] **P05-64** · Xóa `const IPA_DATA` hard-coded trong `app/(tabs)/pronunciation/index.tsx` · *est. 0.5h*
- [x] **P05-65** · Gọi `pronunciationApi.getAllSounds()` + loading skeleton · *est. 0.5h*
- [x] **P05-66** · Nếu user logged in: gọi song song `getProgress()` + `getStats()` · *est. 0.5h*
- [x] **P05-67** · Port `components/foundation/ProgressSummary.tsx` từ web `_components/ProgressSummary.tsx` (4.4K) · *est. 1.5h*
- [x] **P05-68** · Port `components/foundation/IpaChart.tsx` — grid render nhận `sounds: PronunciationData` prop · *est. 1.5h*
- [x] **P05-69** · Mỗi SymbolCell hiển thị badge progress (chấm xanh nếu mastered, vàng in-progress) · *est. 0.5h*
- [x] **P05-70** · Refactor `app/ielts/pronunciation/index.tsx` dùng cùng IpaChart component (DRY) · *est. 0.5h*
- [x] **P05-71** · Verify `app/(tabs)/pronunciation/[symbol].tsx` (21.2K) gọi đúng `getSoundDetail(symbol)` thay vì lookup hard-coded · *est. 0.5h*
- [x] **P05-71b** · **R-04 BONUS**: Tận dụng endpoint `/pronunciation/sounds/:soundId/word-progress` — mỗi example word trong `[symbol]` hiển thị best score + attempt count + mastered status · *est. 1h*

### 0.5.10 Foundation Vocabulary Unit verify (1h) — R-06 RESOLVED

> Backend audit 2026-05-21: chỉ có 2 question type (`multiple_choice`, `fill_blank`). Phase 5.5 KHÔNG cần.

- [x] **P05-72** · Verify FlashCard SRS với 4 rating button (again/hard/good/easy) trên 1 unit thật · *est. 15min*
- [x] **P05-73** · Verify `multiple_choice` question render: options A-D, click, submit, hiện đúng/sai · *est. 15min*
- [x] **P05-74** · Verify `fill_blank` question render: TextInput, normalize answer (trim/lowercase), submit · *est. 15min*
- [x] **P05-75** · Verify `submitQuestions(unitId, answers)` lưu progress đúng vào `FoundationVocabProgress` · *est. 15min*

### 0.5.11 Final verification
- [x] **P05-76** · `npm run type-check` pass · *included*
- [x] **P05-77** · `npm run lint` không có error (warning OK) · *included*
- [x] **P05-78** · `expo start` boot OK iOS + Android · *included*
- [x] **P05-79** · Smoke test happy path: login → home → ielts → 1 lesson → vocab lab → community → profile → logout → Foundation pronunciation (1 âm record) · *included*
- [x] **P05-80** · Commit theo nhóm logic (tooling / dead-code / theme / barrel / routes / decompose / exam-parser / learning-api / pronunciation / vocab-audit) — không gộp tất cả vào 1 commit khổng lồ · *included*

**Tổng phase 0.5**: 4 + 3 + 6 + 2 + 3 + 6 + 4 + 4 + 6 + 1 = **39h** *(R-06 verify đã giảm 2h → 1h sau khi audit backend chỉ 2 type)*

---

## Phase 1 — IELTS Advanced Writing (26h)

> **R-05 RESOLVED**: Backend dùng **2-step session flow** + **autosave draft**. Plan đã cập nhật. +2h cho autosave + session lifecycle.

### 1.1 Service & route (2h)
- [x] **P1-01-AUDIT** · ~~Verify endpoint backend~~ ✅ DONE 2026-05-21 (R-05 audit): backend dùng 2-step session flow + có `PATCH .../draft` autosave + `GET /speaking/stats` riêng. URL chính xác đã ghi vào implement.md.
- [x] **P1-01** · Mở rộng `ieltsAdvancedApi`: `getWritingPrompts({taskType,subType,category,page,limit})`, `getWritingPrompt(id)`, `getWritingSessionsByPrompt(promptId)`, `createWritingSession(promptId)`, `saveWritingDraft(sessionId, draft)`, `submitWritingSession(sessionId, payload)`, `getWritingSession(sessionId)`, `getWritingHistory()` · *est. 1.5h*
- [x] **P1-02** · Khai báo Stack screens mới trong `app/_layout.tsx`: writing index / detail / result · *est. 0.5h*

### 1.2 Catalog (5h)
- [x] **P1-04** · Tạo `components/ielts/AdvancedWritingPromptCard.tsx`: thẻ prompt với task type chip, score badge nếu đã làm · *est. 2h*
- [x] **P1-05** · Tạo `app/ielts/advanced/writing/index.tsx`: list prompts, filter Task 1 / Task 2, pull-to-refresh, history banner · *est. 2.5h*
- [x] **P1-06** · Refactor `app/ielts/advanced/index.tsx`: thêm 2 tab Writing + Speaking vào TABS array (hiện chỉ L/R) · *est. 0.5h*

### 1.3 Detail screen — Editor + Session lifecycle (10h, +2h cho R-05)
- [x] **P1-07** · Tạo `app/ielts/advanced/writing/[promptId].tsx`: layout 2 phần (prompt + editor) với PanResponder resize · *est. 2h*
- [x] **P1-08** · Render prompt markdown + image (Task 1) bằng `react-native-markdown-display` · *est. 1.5h*
- [x] **P1-09** · TextInput editor: multiline, autoGrow, font monospace, word count realtime · *est. 2h*
- [x] **P1-10** · Timer integration: 20 min Task 1 / 40 min Task 2 (config từ backend), `useTimer` hook · *est. 1h*
- [x] **P1-11** · **R-05**: Mount handler — tự động `createWritingSession(promptId)` nếu chưa có sessionId param, hoặc resume nếu có · *est. 1h*
- [x] **P1-11b** · **R-05**: Tạo `hooks/useWritingAutosave.ts` — debounce 5s, gọi `saveWritingDraft(sessionId, draft)`, expose `lastSavedAt` · *est. 1h*
- [x] **P1-11c** · **R-05**: Indicator UI "Saved at HH:MM:SS" hiện trong editor toolbar · *est. 0.5h*
- [x] **P1-12** · Submit button với confirm modal (cảnh báo nếu < min words) · *est. 1h*

### 1.4 Submission + Polling (4h)
- [x] **P1-13** · Submit handler: `submitWritingSession(sessionId, payload)` → router.replace(`result/[sessionId]`) · *est. 1h*
- [x] **P1-14** · `app/ielts/advanced/writing/result/[sessionId].tsx`: skeleton + poll status mỗi 5s qua `useGradingPoll` · *est. 1.5h*
- [x] **P1-15** · Render WritingRubricView (đã có) với 4 tiêu chí band + feedback + corrected version · *est. 1.5h*

### 1.5 History (3h)
- [x] **P1-16** · Verify `app/ielts/history.tsx` đã hiển thị Writing? Nếu chưa, thêm tab Writing với data từ `getWritingHistory` · *est. 2h*
- [x] **P1-17** · Card item history Writing: click → result/[sessionId] · *est. 1h*

### 1.6 QA (2h)
- [x] **P1-18** · Test E2E: submit Task 1 → grading → DONE → view rubric · *est. 0.5h*
- [x] **P1-19** · Test error: no-network, slow grading > 90s timeout, GRADING_FAILED · *est. 0.5h*
- [x] **P1-20** · **R-05**: Test autosave — type → wait 5s → kill app → reopen → resume session với draft đã save · *est. 0.5h*
- [x] **P1-21** · Test FeatureLock — user FREE truy cập → blur + Upgrade CTA · *est. 0.5h*

**Tổng phase 1**: 26h *(R-05: +2h cho autosave + session lifecycle)*

---

## Phase 2 — IELTS Advanced Speaking (34h)

> **R-05 RESOLVED**: Backend dùng **2-step session flow** + dedicated `/speaking/stats`. +2h cho session lifecycle + stats integration.

### 2.1 Service & route (2h)
- [x] **P2-01-AUDIT** · ~~Verify endpoint backend~~ ✅ DONE 2026-05-21 (R-05 audit).
- [x] **P2-01** · Mở rộng `ieltsAdvancedApi`: `getSpeakingParts({partNumber,category,topic,page,limit})`, `getSpeakingPart(id)`, `getSpeakingSessionsByPart(partId)`, `createSpeakingSession(partId)`, `submitSpeakingSession(sessionId, payload)`, `getSpeakingSession(sessionId)`, `getSpeakingHistory()`, `getSpeakingStats()` · *est. 1.5h*
- [x] **P2-02** · Stack screens trong `_layout.tsx`: speaking index / detail / result · *est. 0.5h*

### 2.2 Speaking Device Test (6h)
- [x] **P2-04** · Tạo `components/SpeakingDeviceTest.tsx` port từ web · *est. 3h*
  - Step 1: play sample audio (Cloudinary URL), slider volume, "I can hear it"
  - Step 2: record 3s, playback, "Yes mic works"
  - Skip flag `AsyncStorage` key `speaking-device-tested-v1`
- [x] **P2-05** · Tích hợp vào Speaking detail (mount lần đầu trước khi vào practice) · *est. 1h*
- [x] **P2-06** · Permission handler `requestRecordingPermissionsAsync` + error UI · *est. 1h*
- [x] **P2-07** · Test trên device thật iOS + Android (đặc biệt AirPods, headphone Bluetooth) · *est. 1h*

### 2.3 Catalog (4h)
- [x] **P2-08** · Tạo `components/ielts/SpeakingPartCard.tsx`: thẻ Part 1/2/3, last band, attempts count · *est. 1.5h*
- [x] **P2-09** · Tạo `app/ielts/advanced/speaking/index.tsx`: list 3 part + history banner · *est. 2.5h*

### 2.4 Detail — 7-state recorder (12h)
- [x] **P2-10** · Tạo `app/ielts/advanced/speaking/[partId].tsx`: layout video + recorder · *est. 1.5h*
- [x] **P2-11** · Refactor `SpeakingExamBlock.tsx` accept `mode: 'practice' | 'exam'` để dùng chung · *est. 2h*
- [x] **P2-12** · State machine: IDLE → LISTEN_CAPTION → PLAYING → THINK_CAPTION → THINKING → PLAYING_2 → RECORDING → RECORDED · *est. 3h*
- [x] **P2-13** · Video player `expo-video` với poster, autoplay muted-then-unmute pattern iOS · *est. 2h*
- [x] **P2-14** · Recording lưu URI WAV qua `useAudioRecorder` (đã có) · *est. 1h*
- [x] **P2-15** · Notes area khi THINKING (Part 2 only) · *est. 1.5h*
- [x] **P2-16** · Next / Skip / Re-record buttons · *est. 1h*

### 2.5 Submission + Session lifecycle + Result (8h, +2h cho R-05)
- [x] **P2-17** · **R-05**: Mount handler — `createSpeakingSession(partId)` tự động + lưu `sessionId` · *est. 1h*
- [x] **P2-18** · Upload từng audio tuần tự qua `uploadSpeakingAudio` với progress bar · *est. 2h*
- [x] **P2-19** · `submitSpeakingSession(sessionId, { audioAnswers })` → router.replace result · *est. 1h*
- [x] **P2-20** · Result page: audio playback từng câu, transcript, 4 band rubric (SpeakingRubricView đã có) · *est. 2.5h*
- [x] **P2-21** · IPA highlights (optional nếu backend trả `pronunciationPhonemes`) · *est. 0.5h*
- [x] **P2-22** · **R-05**: Tích hợp `getSpeakingStats()` vào catalog page — show "Your last band: 6.5, Weak area: Part 2" · *est. 1h*

### 2.6 QA (2h)
- [x] **P2-23** · E2E Part 1 (5 câu hỏi short) · *est. 0.5h*
- [x] **P2-24** · E2E Part 2 (cue card 60s think + 2 min answer) · *est. 0.5h*
- [x] **P2-25** · Test permission denied, app background mid-record · *est. 0.5h*
- [x] **P2-26** · Test FeatureLock PREMIUM gate · *est. 0.5h*

**Tổng phase 2**: 34h *(R-05: +2h cho session lifecycle + stats integration)*

---

## Phase 3 — Infrastructure: Contexts + Toast + Lock (16h)

### 3.1 SubscriptionContext (4h)
- [x] **P3-01** · Implement `contexts/SubscriptionContext.tsx` (tier/status/usage/refresh/isPremiumOrAbove) · *est. 2h*
- [x] **P3-02** · Wrap vào `app/_layout.tsx` sau AuthProvider · *est. 0.25h*
- [x] **P3-03** · AppState listener: refresh khi foreground · *est. 0.75h*
- [x] **P3-04** · Hook `useSubscription()` + test trong Profile/Pricing · *est. 1h*

### 3.2 GradingContext (4h)
- [x] **P3-05** · Implement `contexts/GradingContext.tsx` (jobs, submitAndTrack, polling 5s) · *est. 2.5h*
- [x] **P3-06** · Custom toast render cho 3 trạng thái (SUBMITTING/GRADING/DONE) · *est. 1h*
- [x] **P3-07** · Tích hợp vào Writing & Speaking submit (Phase 1, 2 refactor sang gradingContext.submitAndTrack) · *est. 0.5h*

### 3.3 Toaster (2h)
- [x] **P3-08** · Implement `components/ui/Toaster.tsx` với 4 type (success/error/info/loading) · *est. 1.5h*
- [x] **P3-09** · Helper `toast.success(msg)`, `toast.update(id, {...})`, expose qua singleton · *est. 0.5h*

### 3.4 FeatureLock (2h)
- [x] **P3-10** · Implement `components/ui/FeatureLock.tsx` (blur child + CTA upgrade + trial) · *est. 1.5h*
- [x] **P3-11** · Apply vào: `/ielts/advanced/*`, `/vocab-lab/marketplace`, `/shadowing/my-videos` · *est. 0.5h*

### 3.5 UpgradeModal + UsageIndicator (2h)
- [x] **P3-12** · Implement `UpgradeModal.tsx` (bottom sheet + benefits + CTA) · *est. 1h*
- [x] **P3-13** · Implement `UsageIndicator.tsx` (progress bar) · *est. 0.5h*
- [x] **P3-14** · Tích hợp Usage vào Pronunciation check (5/day), Writing grading (10/mo) · *est. 0.5h*

### 3.6 Migrate Alert → toast (2h)
- [x] **P3-15** · Replace `Alert.alert` chỉ ở: login error, register error, save profile, payment success/fail · *est. 2h*

**Tổng phase 3**: 16h

---

## Phase 4 — IELTS Advanced Statistics (8h)

- [x] **P4-01** · Tạo `app/ielts/advanced/statistics.tsx` (refactor một phần `ielts/statistics.tsx`) · *est. 1.5h*
- [x] **P4-02** · 4 tab skill, lazy load data per tab · *est. 1h*
- [x] **P4-03** · Line chart band score trend (SVG react-native-svg) · *est. 2h*
- [x] **P4-04** · Bar chart correct ratio per part · *est. 1.5h*
- [x] **P4-05** · Donut chart breakdown question type (L/R only) · *est. 1.5h*
- [x] **P4-06** · Empty state + pull-to-refresh · *est. 0.5h*

**Tổng phase 4**: 8h

---

## Phase 5 — Diagnostic Quiz onboarding (12h)

- [x] **P5-01** · Port `writingClozeData.ts` từ web → `constants/writingClozeData.ts` · *est. 0.5h*
- [x] **P5-02** · Tạo `app/ielts/onboarding/diagnostic.tsx` port DiagnosticQuiz · *est. 4h*
  - 5-7 câu mix (fill-blank, MC grammar, MC vocab, writing cloze)
  - Progress bar, prev/next button
- [x] **P5-03** · Backend endpoint API integration: added `getPlacementExercises` and verified onboarding submit flow · *est. 1h*
- [x] **P5-04** · Refactor `app/ielts/onboarding.tsx` thêm step 4 trỏ vào diagnostic · *est. 2h*
- [x] **P5-05** · Sau khi xong: redirect `/ielts/roadmap` với recommended step unlock · *est. 2h*
- [x] **P5-06** · Verify roadmap reflect recommended level từ backend · *est. 1h*
- [x] **P5-07** · Test new user E2E onboarding · *est. 1.5h*

**Tổng phase 5**: 12h

---

## Phase 6 — Question type renderers (24h)

### 6.1 Audit (1h)
- [x] **P6-01** · So sánh web/reading-renders + listening-renders vs mobile components/ielts/ · *est. 1h*

### 6.2 Reading renderers (10h)
- [x] **P6-02** · `TrueFalseNotGivenGroup.tsx` · *est. 1h*
- [x] **P6-03** · `ShortAnswerGroup.tsx` (reading) · *est. 1h*
- [x] **P6-04** · `NoteCompletionGroup.tsx` (input inline) · *est. 2h*
- [x] **P6-05** · `SummaryCompletionGroup.tsx` · *est. 2h*
- [x] **P6-06** · `MatchingHeadingsGroup.tsx` · *est. 2h*
- [x] **P6-07** · `MatchingFeaturesGroup.tsx` · *est. 1h*
- [x] **P6-08** · `MatchingSentenceEndingsGroup.tsx` · *est. 1h*

### 6.3 Listening renderers (10h)
- [x] **P6-09** · `FlowChartCompletionGroup.tsx` · *est. 2h*
- [x] **P6-10** · `DiagramCompletionGroup.tsx` (overlay input on image) · *est. 2h*
- [x] **P6-11** · `TableCompletionGroup.tsx` · *est. 2h*
- [x] **P6-12** · `MapLabellingGroup.tsx` (image hotspot label) · *est. 2.5h*
- [x] **P6-13** · `DiagramLabellingGroup.tsx` · *est. 1.5h*

### 6.4 Integration & test (3h)
- [x] **P6-14** · Mount tất cả vào `ContentGroupView.tsx` (switch by type) · *est. 1h*
- [x] **P6-15** · Test 10 lesson + 10 exercise sample đảm bảo render đúng · *est. 2h*

**Tổng phase 6**: 24h

---

## Phase 7 — Shadowing & Dictation polish (16h)

### 7.1 Add YouTube modal (6h)
- [x] **P7-01** · Tạo `components/shadowing/AddVideoModal.tsx` · *est. 3h*
  - Inputs: URL, title, category, folder
  - Validate YouTube ID + preview thumbnail
- [x] **P7-02** · Submit qua `shadowingApi.createVideo` + toast loading · *est. 1.5h*
- [x] **P7-03** · Trigger từ FAB hoặc button trong "My Videos" tab · *est. 1.5h*

### 7.2 Folder management (3h)
- [x] **P7-04** · `components/shadowing/FolderPicker.tsx` (dropdown + create new) · *est. 2h*
- [x] **P7-05** · Tích hợp vào AddVideoModal + filter list theo folder · *est. 1h*

### 7.3 Polling PROCESSING (4h)
- [x] **P7-06** · Detect video status PROCESSING trong list → set interval 5s · *est. 2h*
- [x] **P7-07** · Card UI: spinner overlay + ETA, auto refresh khi READY · *est. 1.5h*
- [x] **P7-08** · Toast khi 1 video done · *est. 0.5h*

### 7.4 Refactor (3h)
- [x] **P7-09** · Tách logic ra `hooks/useShadowingLessons.ts` · *est. 2h*
- [x] **P7-10** · Clean dead code + consistent naming · *est. 1h*

**Tổng phase 7**: 16h

---

## Phase 8 — Vocab Lab polish (12h)

### 8.1 Audit hiện trạng (1h)
- [x] **P8-01** · Verify mobile đã có Publish/Import deck modal chưa · *est. 1h*

### 8.2 Publish & Import (7h, làm nếu thiếu)
- [x] **P8-02** · `components/vocab-lab/PublishDeckModal.tsx`: form title/desc/category/visibility/cover · *est. 4h*
- [x] **P8-03** · `components/vocab-lab/ImportDeckModal.tsx`: browse + preview + import · *est. 3h*

### 8.3 Stats charts mở rộng (4h)
- [x] **P8-04** · ForecastChart 7-day reviews-due (SVG) · *est. 1.5h*
- [x] **P8-05** · HourlyActivityChart 24h (SVG bar) · *est. 1h*
- [x] **P8-06** · DonutCharts (mature/young/learning/new) · *est. 1.5h*

**Tổng phase 8**: 12h

---

## Phase 9 — Community polish (10h)

- [x] **P9-01** · Tab Leaderboard: list top 10 + user rank · *est. 3h*
- [x] **P9-02** · Endpoint `gamificationApi.getLeaderboard()` verify hoặc thêm · *est. 1h*
- [x] **P9-03** · Tab "Saved" filter posts đã bookmark · *est. 1.5h*
- [x] **P9-04** · Image full-screen viewer (`react-native-image-zoom-viewer` đã có dep) · *est. 1.5h*
- [x] **P9-05** · My-posts filter · *est. 1h*
- [ ] **P9-06** · Comment thread: reply, like, delete own · *est. 1.5h*
- [ ] **P9-07** · Test E2E community: post → comment → leaderboard refresh · *est. 0.5h*

**Tổng phase 9**: 10h

---

## Phase 10 — Dictionary Popup + Quick Vocab FAB (10h)

### 10.1 Dictionary Popup (6h)
- [ ] **P10-01** · Tạo `components/global/DictionaryPopup.tsx` (bottom sheet 3 tab VI/EN/AI) · *est. 3h*
- [ ] **P10-02** · `<TextWithLookup>` wrapper component cho phép long-press word · *est. 2h*
- [ ] **P10-03** · Tích hợp vào LessonDetail, ExerciseDetail, ReadingExamBlock, PassageReview · *est. 1h*

### 10.2 Quick Vocab FAB (4h)
- [ ] **P10-04** · Tạo `components/global/GlobalVocabFab.tsx` draggable · *est. 2.5h*
- [ ] **P10-05** · Persist vị trí AsyncStorage · *est. 0.5h*
- [ ] **P10-06** · Hidden trên exam/take/onboarding screen · *est. 0.5h*
- [ ] **P10-07** · Tích hợp với GlobalAddCardFab handler · *est. 0.5h*

**Tổng phase 10**: 10h

---

## Phase 11 — Chat AI streaming + suggestions (12h)

### 11.1 Streaming (6h)
- [ ] **P11-01** · Refactor `app/chat-ai.tsx` dùng fetch ReadableStream · *est. 3h*
- [ ] **P11-02** · Append chunk vào message state + auto-scroll · *est. 1.5h*
- [ ] **P11-03** · Backend verify `/chat` endpoint hỗ trợ SSE (đã có với stream:true?) · *est. 0.5h*
- [ ] **P11-04** · Test latency, abort khi user navigate away · *est. 1h*

### 11.2 Suggestions UI (4h)
- [ ] **P11-05** · Render suggestion pills dưới message · *est. 1.5h*
- [ ] **P11-06** · Handler EXPLAIN_NOTE → send follow-up · *est. 1h*
- [ ] **P11-07** · Handler ADD_VOCAB → open GlobalAddCardFab prefilled · *est. 1.5h*

### 11.3 History persistence (2h)
- [ ] **P11-08** · Save/load history AsyncStorage (max 50 msg) · *est. 1h*
- [ ] **P11-09** · Header button "Clear history" · *est. 1h*

**Tổng phase 11**: 12h

---

## Phase 12 — Payment / VNPay return (8h)

### 12.1 VNPay open (3h)
- [ ] **P12-01** · Trong `app/pricing.tsx`, button Upgrade → `WebBrowser.openAuthSessionAsync` với deep-link return · *est. 1.5h*
- [ ] **P12-02** · Config Linking trong `app/_layout.tsx` (scheme `iemai`) · *est. 1h*
- [ ] **P12-03** · Test deep-link callback iOS + Android · *est. 0.5h*

### 12.2 Return handler (2h)
- [ ] **P12-04** · Tạo `app/payment/vnpay-return.tsx` parse params · *est. 1h*
- [ ] **P12-05** · 3 trạng thái UI: verifying / success / failed · *est. 1h*

### 12.3 Cancel subscription UI (3h)
- [ ] **P12-06** · Profile → SubscriptionSection: cancel button (chỉ PREMIUM/PRO) · *est. 1h*
- [ ] **P12-07** · Modal confirm với reason dropdown · *est. 1h*
- [ ] **P12-08** · API `subscriptionsApi.cancel(reason)` + refresh + toast · *est. 1h*

**Tổng phase 12**: 8h

---

## Phase 13 — Profile polish (6h)

### 13.1 Avatar upload (3h)
- [ ] **P13-01** · Tap avatar → ActionSheet (Camera / Gallery / Remove) · *est. 1h*
- [ ] **P13-02** · `expo-image-picker` integration · *est. 0.5h*
- [ ] **P13-03** · Upload qua `apiClient.postForm('/users/me/avatar', formData)` + verify endpoint · *est. 1h*
- [ ] **P13-04** · Refresh user data + reflect avatar mới · *est. 0.5h*

### 13.2 Subscription block polish (3h)
- [ ] **P13-05** · Hiển thị đúng tier badge, next billing, trial days · *est. 1h*
- [ ] **P13-06** · Layout parity với web SubscriptionSection · *est. 1.5h*
- [ ] **P13-07** · Test với 3 tier (FREE, PREMIUM, PRO) + TRIALING · *est. 0.5h*

**Tổng phase 13**: 6h

---

## Phase 14 — Notification badge polling (8h)

### 14.1 Context (4h)
- [ ] **P14-01** · Implement `contexts/NotificationContext.tsx` · *est. 2h*
- [ ] **P14-02** · Polling 60s `/notifications/unread-count` · *est. 0.5h*
- [ ] **P14-03** · Fetch full list on demand (when open notification screen) · *est. 0.5h*
- [ ] **P14-04** · `markAsRead`, `markAllAsRead`, `delete` actions · *est. 1h*

### 14.2 Badge UI (2h)
- [ ] **P14-05** · Tab bar Profile badge khi unreadCount > 0 · *est. 1h*
- [ ] **P14-06** · Home screen dot dynamic theo unreadCount · *est. 0.5h*
- [ ] **P14-07** · Notification icon ở các header sub-screen · *est. 0.5h*

### 14.3 In-app banner (2h)
- [ ] **P14-08** · Khi polling phát hiện notif mới → toast custom với tap → notification detail · *est. 1.5h*
- [ ] **P14-09** · Cooldown để không spam khi user idle · *est. 0.5h*

**Tổng phase 14**: 8h

---

## Phase 15 — Grammar tab refactor (6h)

- [ ] **P15-01** · Audit ref còn dùng `services/api.ts` cho grammar · *est. 0.5h*
- [ ] **P15-02** · Migrate `app/(tabs)/grammar.tsx` sang `grammarApi` từ `features.api.ts` · *est. 1.5h*
- [ ] **P15-03** · English-first UI, đồng nhất với `vocabulary.tsx` style · *est. 1h*
- [ ] **P15-04** · Migrate `app/grammar/[bookSlug].tsx` + `[unitId].tsx` · *est. 2h*
- [ ] **P15-05** · Xóa code chết trong `services/api.ts` (nếu không còn ref) · *est. 0.5h*
- [ ] **P15-06** · Type-check + test list/detail/unit · *est. 0.5h*

**Tổng phase 15**: 6h

---

## Phase 16 — Push notifications (17h)

> **R-02 RESOLVED**: Soft-prompt với rationale + delayed ask. +1h cho banner UX.

### 16.1 Client + Soft-prompt UX (7h, +1h cho R-02)
- [ ] **P16-01** · Register push token (chỉ khi permission granted): `Notifications.getExpoPushTokenAsync({ projectId })` · *est. 1.5h*
- [ ] **P16-02** · **R-02**: Tạo `components/global/NotificationPermissionBanner.tsx` — banner UI 2 button (Enable / Maybe Later) · *est. 1.5h*
- [ ] **P16-03** · **R-02**: State machine timing — hiện banner sau 2 phút active (login + navigated 1-2 màn) · *est. 1h*
- [ ] **P16-04** · **R-02**: Re-prompt logic — lưu `notif-soft-dismissed-at` AsyncStorage, re-prompt sau 7 ngày, tối đa 3 lần · *est. 1h*
- [ ] **P16-05** · **R-02**: Settings link nếu denied — Profile có "Notifications denied — Open Settings" → `Linking.openSettings()` · *est. 0.5h*
- [ ] **P16-06** · Foreground handler: `Notifications.setNotificationHandler` → in-app banner thay vì system · *est. 1h*
- [ ] **P16-07** · Tap response listener: parse data.link → router.push · *est. 0.5h*

### 16.2 Backend (8h) — *cần coordinate user*
- [ ] **P16-08** · Prisma model `PushToken` (user_id, token, platform, lastUsed, createdAt) · *est. 1h*
- [ ] **P16-09** · Endpoint `POST/DELETE /users/me/push-token` · *est. 2h*
- [ ] **P16-10** · `notifications.service.ts` mở rộng `sendPushNotification(userId, payload)` qua Expo Push API · *est. 3h*
- [ ] **P16-11** · Tích hợp vào các trigger hiện có: streak, exam graded, pronunciation result · *est. 1.5h*
- [ ] **P16-12** · Cron cleanup token > 90 ngày unused · *est. 0.5h*

### 16.3 Test (2h)
- [ ] **P16-13** · Trigger streak milestone → notif đến · *est. 0.5h*
- [ ] **P16-14** · Trigger exam graded → notif đến + tap → result · *est. 0.5h*
- [ ] **P16-15** · Android device thật (Pixel) · *est. 0.5h* — *iOS test ở Phase 19*
- [ ] **P16-16** · **R-02**: Test soft-prompt flow — dismiss banner → re-prompt sau 7 ngày (mock Date.now); test denied → Settings link works · *est. 0.5h*

**Tổng phase 16**: 17h *(R-02: +1h cho banner soft-prompt + re-prompt logic)*

---

## Phase 17 — Dark mode toàn app (24h)

### 17.1 Foundation (5h)
- [ ] **P17-01** · `constants/theme.ts`: LIGHT_TOKENS + DARK_TOKENS (bg/text/border/primary/...) · *est. 1.5h*
- [ ] **P17-02** · `contexts/ThemeContext.tsx`: theme/setTheme/resolvedTheme · *est. 1.5h*
- [ ] **P17-03** · Persist AsyncStorage + Appearance.addChangeListener · *est. 1h*
- [ ] **P17-04** · Hook `useTheme()` trả token hiện tại · *est. 1h*

### 17.2 Refactor (16h)
- [ ] **P17-05** · Refactor `app/(tabs)/index.tsx` (Home) · *est. 0.5h*
- [ ] **P17-06** · Refactor `app/(tabs)/explore.tsx` · *est. 0.5h*
- [ ] **P17-07** · Refactor `app/(tabs)/ielts.tsx` · *est. 0.5h*
- [ ] **P17-08** · Refactor `app/(tabs)/community.tsx` · *est. 1h*
- [ ] **P17-09** · Refactor `app/(tabs)/profile.tsx` · *est. 1h*
- [ ] **P17-10** · Refactor `app/(tabs)/_layout.tsx` (tab bar) · *est. 0.5h*
- [ ] **P17-11** · Refactor `app/ielts/intensive/*` (3 file) · *est. 2h*
- [ ] **P17-12** · Refactor `app/ielts/advanced/*` (6 file mới + 2 cũ) · *est. 2h*
- [ ] **P17-13** · Refactor `app/ielts/basic/*` · *est. 1.5h*
- [ ] **P17-14** · Refactor `app/vocab-lab/*` · *est. 1h*
- [ ] **P17-15** · Refactor `app/shadowing/*` · *est. 1h*
- [ ] **P17-16** · Refactor `components/ielts/*` (20 file) · *est. 3h*
- [ ] **P17-17** · Refactor `components/vocab-lab/*` (10 file) · *est. 1h*
- [ ] **P17-18** · Refactor `components/ui/*` + `components/global/*` · *est. 0.5h*

### 17.3 Toggle UI + test (3h)
- [ ] **P17-19** · Profile settings: 3 option Light/Dark/System · *est. 0.5h*
- [ ] **P17-20** · Test full screens 2 mode (manual) · *est. 2h*
- [ ] **P17-21** · Fix contrast issue (WCAG AA): white-on-yellow, gray-on-dark · *est. 0.5h*

**Tổng phase 17**: 24h

---

## Phase 18 — QA, polish, **Android release** (16h)

> Theo quyết định R-01 = Android-first. iOS deferred sang Phase 19.

### 18.1 Performance (6h)
- [ ] **P18-01** · React.memo các exam block + question renderers · *est. 2h*
- [ ] **P18-02** · `useMemo` cho list filter/sort lớn (history, community feed) · *est. 1h*
- [ ] **P18-03** · `expo-image` cache policy `memory-disk` cho avatar/thumbnail · *est. 1h*
- [ ] **P18-04** · `expo-video` poster + preload metadata · *est. 1h*
- [ ] **P18-05** · Bundle analyze: tree-shake unused icons, remove dead deps · *est. 1h*

### 18.2 Error tracking & analytics (2h)
- [ ] **P18-06** · *Optional*: Sentry hoặc Bugsnag — hỏi user nếu muốn · *est. 2h*

### 18.3 EAS Build Android (2h)
- [ ] **P18-07** · `eas.json` config Android (preview + production AAB build) · *est. 0.5h*
- [ ] **P18-08** · EAS Build Android production AAB · *est. 0.5h*
- [ ] **P18-09** · Upload Internal Track Play Console + tester nhận được build · *est. 1h*

### 18.4 Play Store metadata + Privacy + Permission strings (4h)
- [ ] **P18-10** · Android permissions (`app.json` `android.permissions`): RECORD_AUDIO, INTERNET, READ_EXTERNAL_STORAGE, POST_NOTIFICATIONS + rationale strings · *est. 0.5h*
- [ ] **P18-11** · iOS permission strings sẵn sàng cho P19 (`app.json` `ios.infoPlist`): NSMicrophone, NSCamera, NSPhotoLibrary, NSPhotoLibraryAdd · *est. 0.5h*
- [ ] **P18-12** · Privacy Policy URL: verify `ielts-master.io.vn/privacy` exists; coordinate user/web team viết nếu chưa có · *est. 1h*
- [ ] **P18-13** · Account Deletion compliance: verify P13 in-app delete + document Play Console Data Safety · *est. 0.5h*
- [ ] **P18-14** · Play Store listing: app name + short desc (80c) + full desc ≥500 words EN · *est. 0.5h*
- [ ] **P18-15** · Screenshots Pixel 7 Pro + bonus tablet 7"/10" · *est. 0.5h*
- [ ] **P18-16** · App icon 512×512 + feature graphic 1024×500 · *est. 0.25h*
- [ ] **P18-17** · Data Safety form Play Console (data collected, encryption, sharing) · *est. 0.25h*

### 18.5 Final E2E test Android (2h)
- [ ] **P18-18** · Smoke test full happy path Android: register → onboarding → diagnostic → roadmap → 1 lesson → 1 mock test → 1 advanced Writing → result · *est. 1h*
- [ ] **P18-19** · Đo cold start time (target < 3s trên Pixel 5) · *est. 0.5h*
- [ ] **P18-20** · Stress test 30 phút usage không crash · *est. 0.5h*

**Tổng phase 18**: 16h

---

## Phase 19 — iOS launch with IAP (24h, DEFERRED)

> **Trigger**: Sau khi Android live ổn định + có metrics. KHÔNG tính vào tổng chính.
> **Prerequisite**: Mua Apple Developer Program ($99/year) trước khi bắt đầu (R-03).

### 19.1 Apple In-App Purchase integration (16h)

- [ ] **P19-01** · Cài `expo-in-app-purchases` + setup · *est. 0.5h*
- [ ] **P19-02** · App Store Connect: tạo 4 IAP products (Premium-Monthly/Yearly, Pro-Monthly/Yearly) với price tier match VNPay USD · *est. 1.5h*
- [ ] **P19-03** · Tạo `services/iap.service.ts`: `getProducts`, `purchase`, `restorePurchases`, `acknowledgePurchase` · *est. 2h*
- [ ] **P19-04** · UI `pricing.tsx`: detect `Platform.OS === 'ios'` → show IAP buttons, Android giữ VNPay · *est. 2h*
- [ ] **P19-05** · Backend endpoint `POST /subscriptions/ios-verify-receipt` (Apple Receipt Verification API) · *est. 3h*
- [ ] **P19-06** · Prisma migration: thêm `iosTransactionId`, `iosOriginalTransactionId` vào `Subscription` model · *est. 0.5h*
- [ ] **P19-07** · Backend webhook handler cho Apple S2S notifications (renewal, cancel, refund) · *est. 2.5h*
- [ ] **P19-08** · Profile → "Restore Purchases" button (Apple requirement) · *est. 1.5h*
- [ ] **P19-09** · Sandbox testing: 10+ purchase flow (new, renew, cancel, restore, family share) · *est. 1.5h*
- [ ] **P19-10** · Test edge cases: network fail giữa purchase + verify, duplicate receipt · *est. 1h*

### 19.2 iOS Build + App Store Connect (4h)

- [ ] **P19-11** · Apple Dev account verify + APN key + Bundle ID register · *est. 1h*
- [ ] **P19-12** · `eas.json` iOS profile + build production IPA · *est. 1h*
- [ ] **P19-13** · TestFlight upload + internal tester group · *est. 1h*
- [ ] **P19-14** · App Store Connect listing (reuse Privacy URL) + iOS screenshots 6.5"/5.5" + App Privacy questionnaire · *est. 1h*

### 19.3 iOS QA + App Review prep (4h)

- [ ] **P19-15** · iOS-specific bug fix: safe area, keyboard padding, audio interruption · *est. 2h*
- [ ] **P19-16** · Background app refresh + lock-screen during recording test · *est. 1h*
- [ ] **P19-17** · App Review prep: demo account + notes giải thích VNPay (Android) vs IAP (iOS) + 30s screencast · *est. 1h*

**Tổng phase 19**: 24h (deferred, không tính tổng chính)

---

## Tổng kết

| Phase | Mục tiêu | Estimate |
|---|---|---|
| 0 | Chuẩn bị | 4h |
| **0.5** | **Code Cleanup + Foundation API parity** | **39h** |
| 1 | Advanced Writing (+ autosave + session lifecycle) | **26h** |
| 2 | Advanced Speaking (+ session lifecycle + stats) | **34h** |
| 3 | Infrastructure | 16h |
| 4 | Advanced Statistics | 8h |
| 5 | Diagnostic Quiz onboarding | 12h |
| 6 | Q-type renderers | 24h |
| 7 | Shadowing & Dictation polish | 16h |
| 8 | Vocab Lab polish | 12h |
| 9 | Community polish | 10h |
| 10 | Dictionary + FAB | 10h |
| 11 | Chat AI streaming | 12h |
| 12 | Payment / VNPay return | 8h |
| 13 | Profile polish | 6h |
| 14 | Notification badge | 8h |
| 15 | Grammar refactor | 6h |
| 16 | Push notifications (+ soft-prompt UX) | **17h** |
| 17 | Dark mode | 24h |
| 18 | QA + **Android Release** | 16h |
| **TỔNG Android-first launch** | | **308h** |
| **19** | **iOS launch + IAP** (DEFERRED) | +24h |
| **TỔNG cả 2 platform** | | **332h** |

**Solo dev fulltime (8h/ngày)**: Android-first **~38.5 ngày**; cả 2 platform **~41.5 ngày**.
**Part-time (4h/ngày)**: Android-first **~77 ngày**; cả 2 platform **~83 ngày**.

> **Chiến lược Android-first** (R-01 decision): Launch Android trước (~38 ngày) → thu feedback → trigger Phase 19 (iOS + IAP) khi product chín.

> **ROI Phase 0.5**: 40h cleanup + Foundation parity tiết kiệm ~40-60h ở các phase sau. Net giảm ~10-20h tổng.

---

## 📌 Phụ lục — Action items + Quyết định đã chốt

### ✅ Đã chốt
| ID | Quyết định | Chi tiết |
|---|---|---|
| **R-01** | ✅ Android-first | Phase 18 chỉ Android. Phase 19 (iOS + IAP) deferred. |
| **R-04** | ✅ Resolved | Backend đầy đủ. URL `/pronunciation/progress/stats` (không phải `/stats`). Tận dụng bonus endpoint `word-progress` (task P05-71b). |

### ⏳ Còn cần quyết định / hành động

| ID | Hành động | Trước phase | Mặc định |
|---|---|---|---|
| R-03 | Apple Developer account ($99/year) | Phase 19 (deferred) | Mua khi sẵn sàng Phase 19 |
| R-07 | EAS Production plan ($29/mo) | Phase 18 | Mua trước Phase 18 |
| R-02 | Android 13+ POST_NOTIFICATIONS UX | Phase 16 | Tự xử lý ở P16 |
| R-05 | Verify Advanced Writing/Speaking endpoint backend | Phase 1, 2 | Tasks P1-03, P2-03 verify |
| R-06 | Quyết định Phase 5.5 sau khi audit Vocab Unit | Sau P05-75 | Tạo nếu ≥3 type thiếu |

---

## 📊 Phụ lục — Foundation Vocabulary Unit Audit Report

> **Trạng thái**: ⏳ Chưa thực hiện (sẽ điền sau khi xong P05-72 → P05-75)
> **Mục đích**: So sánh từng exercise type giữa web và mobile.
> **Định dạng đề xuất**: bảng dưới sẽ được cập nhật khi audit xong.

| Exercise type | Web hỗ trợ | Mobile hỗ trợ | Phải làm? |
|---|---|---|---|
| Word-meaning multiple choice | ⏳ | ⏳ | ⏳ |
| Fill-in-the-blank | ⏳ | ⏳ | ⏳ |
| Image-word match | ⏳ | ⏳ | ⏳ |
| Audio-listen pick | ⏳ | ⏳ | ⏳ |
| Sentence completion | ⏳ | ⏳ | ⏳ |
| Drag & drop reorder | ⏳ | ⏳ | ⏳ |

**Kết luận audit** (điền sau):
- [ ] Số type thiếu: ___
- [ ] Quyết định: thêm Phase 5.5 (8h) / fix luôn / bỏ qua

---

## Lưu ý theo dõi tiến độ

- Mỗi khi hoàn thành 1 task, đổi `[ ]` → `[x]` và ghi chú nếu có vấn đề phát sinh.
- Nếu task bị block (chờ backend, chờ asset, chờ quyết định) → `[!]` + lý do.
- Cập nhật estimate thực tế khi task xong để học hỏi cho task sau (ví dụ ghi `est. 2h → actual 3h`).
- Nếu phát sinh task không có trong list, thêm vào với mã `P{n}-XX` (n = phase).
- Sau mỗi phase, tổng hợp ngắn (1 đoạn) về: gì đã xong, gì phát sinh, gì cần điều chỉnh phase sau.
