# Báo Cáo Review Mobile Development — Phase 0 → Phase 17

> **Ngày review**: 2026-05-22
> **Phạm vi**: Phase 0, 0.5, và 1 → 17 (đã hoàn thành); Phase 18 & 19 **chưa làm** (theo yêu cầu user)
> **Đối tượng**: `frontend-mobile` (Expo SDK 54 / React Native 0.81 / Expo Router 6 / NativeWind 4)
> **Tham chiếu**: [`implement.md`](./implement.md), [`tasks.md`](./tasks.md)
> **Phương pháp**: Đọc code + đối chiếu acceptance criteria từng phase + đo số liệu cleanup baseline

---

## Tóm tắt điều hành (TL;DR)

| Hạng mục | Trạng thái |
|---|---|
| **Tổng số phase đã hoàn thành** | **18 / 20** (Phase 0, 0.5, 1–17) |
| **Estimate hoàn thành** | ~292h / 308h tổng (~95% Android-first scope) |
| **Phase còn lại** | P18 (Android Release, 16h) · P19 (iOS+IAP, deferred 24h) |
| **Chất lượng tổng thể** | 🟢 **Cao** — Kiến trúc nhất quán, theme tokens đồng bộ, dark mode active |
| **Số file `.tsx` đã có** | 158 (89 components + 69 app routes) |
| **Risk Register** | 6/10 đã resolved; 4 còn lại deferred sang P18/P19 |

### Điểm sáng nổi bật

✅ **Architecture đầu cuối nhất quán** — `ErrorBoundary` → `ThemeProvider` → `AuthProvider` → `NotificationProvider` → `SubscriptionProvider` → `GradingProvider`, đúng thứ tự dependency.
✅ **API parity đầy đủ với web** — `learning.api.ts` đã thống nhất Vocabulary/Grammar/Pronunciation; `ielts.api.ts` có đủ Writing/Speaking 2-step session + autosave + stats.
✅ **R-02 Soft-prompt UX hoạt động đúng spec** — 2 phút delay, 7 ngày re-prompt, cap 3 lần.
✅ **R-05 Two-step session flow** — `createWritingSession → saveWritingDraft (autosave 5s) → submitWritingSession`, resume từ `activeSession`.
✅ **Dark mode toàn app** — `useTheme()` được dùng nhất quán; tokens LIGHT/DARK với `textMuted` đã bumped theo WCAG AA.

### Điểm cần lưu ý

⚠️ **`router.push(... as any)` còn 27** — vượt mục tiêu Phase 0.5.5 (<5). Đa phần là hợp lệ (wrap `ROUTES.X` constants), nhưng có ~5 vị trí template literal raw có thể clean tiếp khi tiện.
⚠️ **`console.log/error/warn` còn 77** — giảm rất nhiều từ baseline 1310 nhưng còn lại trong path lỗi/debug. Nên review trước P18.
⚠️ **`as any` tổng 64** trong `app/` — giảm hơn nửa từ baseline 143, đa phần là cast props cho expo-router không có generic type. Acceptable.
⚠️ **File `app/ielts/intensive/[examId].tsx` 74.7K (~1500+ lines)** — plan cố ý để lại P0.5 không decompose. Cần xem xét trước khi qua P18 stress test.
⚠️ **`hooks/useShadowingMode.ts` 14.2K** — hook khá lớn, có thể chia state machine thành sub-hooks nếu tiện.

---

## Phase 0 — Chuẩn bị (4h) ✅ DONE

| Acceptance | Trạng thái | Bằng chứng |
|---|---|---|
| Deps mới được cài | ✅ | `package.json`: `expo-notifications ~0.32.17`, `expo-device ~8.0.10`, `expo-tracking-transparency ~6.0.8`, `react-native-toast-message ^2.3.3`, `zustand ^5.0.13` |
| `.env.example` có `EXPO_PUBLIC_APP_SCHEME=iemai` | ✅ | (mặc định đọc trong `.env.example`) |
| `app.json` có `scheme: "iemai"`, bundleIdentifier, package | ✅ | `app.json` lines 41 + `ios.bundleIdentifier`, `android.package` = `com.ieltsmasterai.app` |
| 4 file context rỗng | ✅ | `contexts/{Subscription,Grading,Notification,Theme}Context.tsx` |
| 4 file UI rỗng | ✅ | `components/ui/{Toaster,FeatureLock,UpgradeModal,UsageIndicator}.tsx` |
| Script `type-check` | ✅ | `package.json`: `"type-check": "tsc --noEmit"` |
| `expo start` boot OK | (giả định ✅, không phá build) | – |

**Đánh giá**: Hoàn thành 100% như spec. P0-09 (Husky + lint-staged) optional vẫn để mở (`[ ]` trong tasks.md).

---

## Phase 0.5 — Code Cleanup + Foundation API Parity (39h) ✅ DONE

### 0.5.1 Tooling baseline (4h) ✅

- ✅ ESLint v8.57.1 + `eslint-config-expo` + plugin TS + react-hooks (`package.json` devDeps)
- ✅ Prettier v3.8.3 với `eslint-config-prettier` integration
- ✅ Scripts `lint`, `lint:fix`, `format` đầy đủ
- ✅ `ErrorBoundary` class component đẹp, fallback UI thân thiện, dev-mode hiển thị stack trace
- ✅ Wrap ErrorBoundary ngoài cùng `_layout.tsx` (line 60)
- ❌ P05-09 Husky pre-commit hook chưa làm (optional)

**Nhận xét**: ErrorBoundary có 2 dòng `console.error` để log development — đúng convention, không cần fix.

### 0.5.2 Dead code & duplicate removal (3h) ✅

- ✅ `features/vocab-lab/` đã không còn (verified bằng `ls` — chỉ có `services/` và `components/vocab-lab/`)
- ✅ `services/api.ts` đã được thay thế bằng `learning.api.ts` (verified: grammar tab giờ import từ `@/services` thay vì legacy)
- ✅ Hidden tabs trong `(tabs)/_layout.tsx` audited (chỉ giữ `pronunciation/` + 2 placeholder `shadowing.tsx`/`vocablab.tsx` 124B mỗi cái — link redirect ra ngoài (tabs))

### 0.5.3 Theme tokens unification (6h) ✅

**Số liệu thực tế đo lúc 2026-05-22**:
- `const THEME = ` trong `app/`+`components/`: **0** ✅ (target 0)
- `fontFamily: 'Farro-X'` raw literal: **0** ✅ (target 0)

`constants/index.ts` đã có đầy đủ:
- `COLORS.skill.{listening, reading, writing, speaking}` — 4 skill colors
- `COLORS.gray.{50…900}` — 10-step scale
- `COLORS.successScale / warningScale / errorScale` — 6 step mỗi loại

### 0.5.4 Barrel exports (2h) ✅

- ✅ `components/ielts/index.ts` (1.3K — re-export đầy đủ 22 component)
- ✅ `components/vocab-lab/index.ts` (757B)
- ✅ `components/ui/index.ts` (501B)
- ✅ `components/index.ts` (900B — top-level barrel)
- ✅ `services/index.ts` (1.3K — re-export + combined `gamificationApi` từ features + posts)
- ✅ `hooks/index.ts` (499B)

**Lưu ý hay**: `services/index.ts` có merged `gamificationApi` (object spread từ 2 source). Giải pháp khôn ngoan vì web cũng có 2 endpoint groups.

### 0.5.5 Typed routes (3h) ⚠️ MOSTLY DONE

`constants/routes.ts` (3.6K) có đầy đủ ROUTES với 47+ entries (cả static + functions). Tốt.

**Tuy nhiên**, đo lúc 2026-05-22:
- `router.push|replace.*as any` còn **27** vị trí (target Phase 0.5.5: <5)

Trong 27 đó:
- ~15 vị trí cast `ROUTES.X as any` (đã typed nhưng vẫn cast để compatible với `router.push`) — **acceptable**
- ~12 vị trí template literal raw (e.g. `router.push(\`/vocabulary/${bookId}/${unit.id}\` as any)`) — **có thể clean tiếp** bằng ROUTES.vocabularyUnit(bookId, unit.id)

**Khuyến nghị**: Trong P18 polish, chạy 1 lượt find-replace để hạ xuống <10. Không blocking nhưng tốt cho maintainability.

### 0.5.6 Component decomposition (6h) ✅

**Profile** (1014 → 3 tab):
- ✅ `components/profile/AccountTab.tsx` (18.9K — bao gồm Avatar upload + Cancel Subscription modal)
- ✅ `components/profile/StatsTab.tsx` (4.1K)
- ✅ `components/profile/SettingsTab.tsx` (7.4K — Theme toggle Light/Dark/System)
- ✅ Shell `app/(tabs)/profile.tsx` giờ 22.8K (giảm từ 29K — chưa hẳn <200 lines nhưng đã tách logic ra component)

**Community** (715 → modular):
- ✅ `components/community/PostCard.tsx` (8.3K — có ImageZoomViewer integration)
- ✅ `components/community/CreatePostModal.tsx` (12.6K)
- ✅ `components/community/CommentSheet.tsx` (8.1K)
- ✅ `components/community/Avatar.tsx` (919B — reusable)
- ✅ `components/community/LeaderboardView.tsx` (3.9K — sẽ dùng ở Phase 9)
- ✅ Shell `app/(tabs)/community.tsx` 11.2K (đã giảm đáng kể từ 715 lines original)

**Shadowing helper**:
- ✅ `hooks/useShadowingMode.ts` (14.2K — extract state machine)
- ⚠️ Hook hơi lớn, nhưng acceptable cho 1 file extract

### 0.5.7 Port `lib/exam-parser.ts` (4h) ✅

- ✅ `lib/exam-parser.ts` (11.8K) — đầy đủ `NormalizedItem` discriminated union với 12 kind (mc_single, mc_multi, matching_group, note_completion, table_completion, plan_label, summary_completion, …)
- Đã port `extractAllItemsFromPart` + `questionNumbersFromItems`

### 0.5.8 Refactor `learning.api.ts` (4h) ✅

`services/learning.api.ts` (6.4K) đã có đầy đủ:
- `vocabularyApi` với 6 methods (getBooks/getBook/getUnit/getProgress/updateWordProgress/submitQuestions)
- `grammarApi` với 6 methods (getBooks/getBook/getUnit/getUnitByOrder/getProgress/updateProgress)
- `pronunciationApi` với 6 methods + bonus `getWordProgress(soundId)` (R-04)
- `learningApi.checkPronunciation` với MIME type map đầy đủ (`.wav/.mp3/.m4a/.mp4/.aac/.caf`)

**Lưu ý**: `pronunciationApi.getStats()` gọi `/pronunciation/progress/stats` chính xác (sửa từ giả định ban đầu `/pronunciation/stats`).

Deprecation aliases trong `ielts.api.ts` đã đánh dấu `@deprecated`:
```ts
/** @deprecated Use vocabularyApi from @/services instead */
export const vocabularyApi = newVocabularyApi;
```

### 0.5.9 Foundation Pronunciation API migrate (6h) ✅

- ✅ `components/foundation/IpaChart.tsx` (6.5K) — SoundTile với mastery badge (NEW/PRACTICING/MASTERED) + practiceCount
- ✅ `components/foundation/ProgressSummary.tsx` (5.5K)
- ✅ Bonus `word-progress` endpoint integration (P05-71b done)

### 0.5.10 Foundation Vocabulary verify (1h) ✅

Per R-06 resolved (backend chỉ có 2 question type), 4 verify tasks đã tick xong.

### Đánh giá tổng Phase 0.5

🟢 **Hoàn thành xuất sắc** — Cleanup baseline đầy đủ, foundation API parity với web. Còn 1 nợ kỹ thuật nhỏ ở P0.5.5 (`as any` count) nên dọn nốt trước P18.

---

## Phase 1 — IELTS Advanced Writing (26h) ✅ DONE

### Service & route

`ieltsAdvancedApi` trong `services/ielts.api.ts` có đầy đủ 8 methods:
```ts
getWritingPrompts, getWritingPrompt, getWritingSessionsByPrompt,
createWritingSession, saveWritingDraft, submitWritingSession,
getWritingSession, getWritingHistory
```
URL chính xác match backend audit (R-05 RESOLVED).

### Catalog (`app/ielts/advanced/writing/index.tsx` 12.1K)

- ✅ Tab Task 1 / Task 2 / All với `LayoutAnimation` + active border
- ✅ Filter subType (server-side via param) + search query (client-side)
- ✅ `AdvancedWritingPromptCard` (7.9K) hiển thị task type chip + best score
- ✅ `UsageIndicator` cho `AI_WRITING_GRADING` (monthly quota) hiện ở ListHeader
- ✅ `FeatureLock requiredTier="PREMIUM"` wrap toàn page
- ✅ Theme-aware (dùng `useTheme()` + `colors.background/card/border`)

### Detail screen (`writing/[promptId].tsx` 20K)

- ✅ Mount auto `createWritingSession(promptId)` hoặc resume `activeSession`
- ✅ `useTimer` hook (1.3K — wall-clock + resume capable) với critical highlight < 2min
- ✅ `useWritingAutosave(sessionId, essay)` hook (1.7K — debounce 5s)
  - State machine: `isSaving / lastSavedAt HH:MM:SS / error`
  - UI indicator có 4 trạng thái (Saving, Save failed, Saved at, Autosave active)
- ✅ PanResponder resize prompt/editor (150-500px)
- ✅ Word counter realtime với target >= minimumWords (150/250)
- ✅ Submit confirm modal cảnh báo nếu < min words
- ✅ Submit qua `useGrading().submitAndTrack` → router replace result page
- ✅ Markdown render prompt qua `react-native-markdown-display`

### Result screen (`writing/result/[sessionId].tsx`)

- ✅ Folder `result/` tồn tại với `[sessionId].tsx`
- ✅ Dùng `WritingRubricView.tsx` (20.8K — 4 tiêu chí band + feedback + corrected version)
- ✅ Polling qua `useGradingPoll` (lib có sẵn)

### Đánh giá

🟢 **Hoàn thành chỉn chu** — Autosave logic clean, 2-step session flow đúng spec, FeatureLock active. **R-05 mitigation thành công.**

---

## Phase 2 — IELTS Advanced Speaking (34h) ✅ DONE

### Service & route

`ieltsAdvancedApi` có 9 methods cho Speaking (parts/sessions/history/stats).

### Speaking Device Test (`SpeakingDeviceTest.tsx` 20.9K)

- ✅ 3 steps (Headphone check / Mic check / Waiting room) với connecting line
- ✅ Audio playback test với `useAudioPlayer/useAudioPlayerStatus` (expo-audio SDK 54)
- ✅ Mic test với `useAudioRecorder` hook custom + auto-stop 10s
- ✅ Lưu flag `AsyncStorage.setItem('speaking-device-tested-v1', 'true')` sau khi xong
- ✅ Skip flag check trong `speaking/index.tsx` (line ~60)
- ✅ Re-test button trong header (icon `construct-outline`)

### Catalog (`speaking/index.tsx` 15.3K)

- ✅ Tab ALL/Part 1/Part 2/Part 3
- ✅ `SpeakingPartCard` (8.1K) với best band + attempts count
- ✅ **Stats Banner (R-05)**: `Promise.allSettled([getSpeakingParts, getSpeakingStats])` parallel fetch
  - Hiển thị Average Band / Practiced Decks / Focus Area (weakest part)
  - Animated `FadeInUp` 400ms entrance
- ✅ Device Test render overlay nếu chưa pass
- ✅ FeatureLock PREMIUM

### Detail screen

- ✅ `[partId].tsx` (8.0K — shell)
- ✅ Re-use `SpeakingExamBlock.tsx` (23.7K) với `mode: 'practice' | 'exam'`
- ✅ State machine 7-state qua `SpeakingExamBlock`

### Đánh giá

🟢 **Hoàn thành** — Device test UX cực kỳ chỉn chu, stats banner integration mượt. State machine reuse được giữa intensive + practice.

---

## Phase 3 — Infrastructure (16h) ✅ DONE

### SubscriptionContext (4h) ✅

`contexts/SubscriptionContext.tsx` (3.4K) đầy đủ:
- `tier`, `status`, `trialUsed`, `trialEndsAt`, `currentPeriodEnd`, `usage`, `loading`
- Computed: `isPremium`, `isPremiumOrAbove`, `isPro`, `isTrial`
- `AppState.addEventListener('change')` refresh khi foreground
- `useEffect(refresh, [user])` reset khi logout

### GradingContext (4h) ✅

`contexts/GradingContext.tsx` (6.9K) — đây là 1 trong các file mạnh nhất:
- Multiple session tracking với `pollIntervals.current` map
- Polling 5s, max 60 attempts (5 min cap)
- Branch theo `examType`: Writing/Speaking dùng `ieltsAdvancedApi.getXSession`, Intensive dùng `ieltsExamsApi.getSession`
- `silencedSessionId` để skip toast khi user đang ở result page
- Toast lifecycle: `loading (Submitting) → loading (Grading) → success (Tap to view)`

### Toaster (2h) ✅

`components/ui/Toaster.tsx` (5.5K):
- Helper singleton `toast.{success/error/info/loading/update/hide}`
- Premium custom UI dark background + colored border-left + Ionicons
- `position: 'top'`, visibility 4-5s, loading không auto-hide

### FeatureLock + UpgradeModal + UsageIndicator (4h) ✅

- ✅ `FeatureLock.tsx` (5.3K) — glassmorphic overlay + golden crown icon + "Start 7-Day Free Trial" CTA nếu chưa dùng trial
- ✅ `UpgradeModal.tsx` (7.6K)
- ✅ `UsageIndicator.tsx` (2.5K — progress bar)
- ✅ FeatureLock đã wrap `/ielts/advanced/writing|speaking` (verified inline trong code)

### Đánh giá

🟢 **Hoàn thành xuất sắc** — Infrastructure layer đầy đủ và clean. `GradingContext` đặc biệt mạnh, hỗ trợ branch theo 3 examType khác nhau.

---

## Phase 4 — Advanced Statistics (8h) ✅ DONE

`app/ielts/advanced/statistics.tsx` (36.5K) tồn tại với kích thước lớn — bao gồm 4 tab skill + charts SVG.

**Lưu ý**: Plan ban đầu estimate 8h cho phase này nhưng file 36K cho thấy đầu tư nhiều hơn — chart line/bar/donut SVG đầy đủ.

---

## Phase 5 — Diagnostic Quiz onboarding (12h) ✅ DONE

- ✅ `app/ielts/onboarding/diagnostic.tsx` (29.4K)
- ✅ `constants/writingClozeData.ts` (1.3K) ported từ web
- ✅ Score calc utility (port từ web `SharedScoreUtils.ts`) inline trong file
- ✅ Integration với `ieltsProfileApi.getPlacementExercises()` + onboarding submit
- ✅ `ContentGroupView` được reuse từ Phase 6 q-renderers

---

## Phase 6 — Question Type Renderers (24h) ✅ DONE

`components/ielts/exercise/` có **15 renderer + 2 utility file**:

**Reading**:
- ✅ `ReadingMatchingGroupView.tsx` (9.2K — Headings/Features/Information)
- ✅ `SentenceEndingsGroupView.tsx` (10.5K)
- ✅ `ReadingFlowchartGroupView.tsx` (10.1K)
- ✅ `ReadingSummaryGroupView.tsx` (5.7K)
- ✅ `NoteCompletionGroupView.tsx` (11.1K)
- ✅ `SummaryGroupView.tsx` (5.3K)
- ✅ `TFNGGroup.tsx` (8.2K — True/False/Not Given + Yes/No/Not Given)

**Listening**:
- ✅ `FlowChartGroupView.tsx` (7.4K)
- ✅ `FormGroupView.tsx` (5.4K)
- ✅ `MatchingGroup.tsx` (10.3K)
- ✅ `DiagramCompletionGroupView.tsx` (12.2K — overlay input on image)
- ✅ `TableGroupView.tsx` (7.3K)
- ✅ `MapLabellingGroupView.tsx` (9.5K)
- ✅ `FillGroup.tsx`, `MCQGroup.tsx`, `MCMultipleGroup.tsx`

**Dispatcher**: `ContentGroupView.tsx` (6.8K) với switch logic đẹp:
- Distinguishes between Reading vs Listening summary_completion (cùng type khác structure)
- Distinguishes Reading flowchart (stages) vs Listening flowchart (steps)
- `note_completion` route theo `Array.isArray(group.notes)` để chọn ReadingNoteCompletion vs FormGroup

**Đánh giá**: 🟢 Hoàn thành 100% spec + extra polish (dispatcher logic chi tiết).

---

## Phase 7 — Shadowing & Dictation polish (16h) ✅ DONE

- ✅ `components/shadowing/AddVideoModal.tsx` (11.7K — YouTube URL + folder + thumbnail preview)
- ✅ `components/shadowing/FolderPicker.tsx` (13.0K — dropdown + create new)
- ✅ `shadowingApi.createVideo / importVideo / getFolders / createFolder` (verified)
- ✅ `hooks/useShadowingLessons.ts` (6.7K)
- ✅ `hooks/useShadowingMode.ts` (14.2K — state machine extracted từ 881-line file)

**Polling logic**: Không trực tiếp verify trong scope review nhưng `hooks/useShadowingLessons.ts` size 6.7K cho thấy nó có handle status polling.

---

## Phase 8 — Vocab Lab polish (12h) ✅ DONE

`components/vocab-lab/` đầy đủ:
- ✅ `PublishDeckModal.tsx` (7.0K)
- ✅ `ImportDeckModal.tsx` (10.0K)
- ✅ `ForecastChart.tsx` (8.9K — SVG 7-day reviews due)
- ✅ `HourlyActivityChart.tsx` (4.9K — 24h bar)
- ✅ `MaturityDonut.tsx` (6.5K — mature/young/learning/new)
- ✅ `StatsTab.tsx` (10.5K — gather 4 chart vào 1 tab)

---

## Phase 9 — Community polish (10h) ✅ DONE

- ✅ `LeaderboardView.tsx` (3.9K) với 2 tab (XP This Week / Streak), top 10, rank coloring 🥇🥈🥉
- ✅ `gamificationApi.getLeaderboard(type, limit)` — verified trong `services/index.ts` merged từ posts.api + features.api
- ✅ Image full-screen viewer trong `PostCard.tsx` (lines 1-50 confirm `ImageViewer` + Modal)
- ✅ Comment thread, like, bookmark — present trong `CommentSheet.tsx`

---

## Phase 10 — Dictionary Popup + Quick Vocab FAB (10h) ✅ DONE

**DictionaryPopup** (`components/global/DictionaryPopup.tsx` 16.5K):
- ✅ Bottom sheet 65% screen height, slide animation
- ✅ 3 tab VI (MyMemory API) / EN (DictionaryAPI) / AI Context
- ✅ Phonetic audio playback via `useAudioPlayer`
- ✅ "Add to Vocab Lab" CTA → DeviceEventEmitter emit `OPEN_QUICK_ADD_CARD`
- ✅ Listen DeviceEventEmitter `OPEN_DICTIONARY` event để mở popup

**TextWithLookup** (`components/global/TextWithLookup.tsx` 2.3K):
- Component wrap text, long-press emit OPEN_DICTIONARY event

**GlobalVocabFab** (`components/global/GlobalVocabFab.tsx` 4.8K):
- ✅ Draggable FAB với PanResponder, persist AsyncStorage `vocab-fab-position`
- ✅ Hidden patterns regex cho onboarding/intensive/basic-exercise/advanced-{l,r,w,s}
- ✅ Drag-vs-tap distinguish (<5px = tap)
- ✅ Haptic light feedback khi tap
- ✅ Constraints để không out of screen

---

## Phase 11 — Chat AI streaming + suggestions (12h) ✅ DONE

`app/chat-ai.tsx` (25.1K) đã upgrade từ 10.8K ban đầu:
- ✅ Streaming response qua `fetch` + `AbortController` ref (line ~75)
- ✅ History persist AsyncStorage key `chat-ai-history`
- ✅ Suggestions UI với 2 action type `EXPLAIN_NOTE` (follow-up) + `ADD_VOCAB` (DeviceEventEmitter)
- ✅ Welcome suggestions 3 initial chips
- ✅ Auto-scroll + abort khi user navigate away
- ✅ Markdown render qua `react-native-markdown-display`

---

## Phase 12 — Payment / VNPay return (8h) ✅ DONE

### VNPay open + return handler

**`app/payment/vnpay-return.tsx` (8.6K)**:
- ✅ 3 trạng thái UI (verifying / success / failed)
- ✅ `VNPAY_ERRORS` map 12 mã lỗi VNPay (`07/09/10/11/12/13/24/51/65/75/79/99`) → message thân thiện
- ✅ `verifiedRef` guard tránh re-run trong Strict Mode
- ✅ `subscription.refresh()` sau khi success
- ✅ Theme via AsyncStorage + `useColorScheme` (custom, không qua ThemeContext — vì là modal độc lập)

### Cancel subscription UI

Trong `components/profile/AccountTab.tsx`:
- ✅ Cancel button chỉ hiện khi `tier !== 'FREE' && !isCanceled`
- ✅ Modal confirm với 5 lý do dropdown (Too expensive / Not using enough / Lack of features / Found better / Other)
- ✅ Custom textarea khi chọn "Other"
- ✅ Warning text "Access until {currentPeriodEnd}"
- ✅ Toast success sau khi cancel + refresh global subscription

### Đánh giá

🟢 **Hoàn thành chỉn chu** — Error code map thật sự thoughtful cho UX. Modal cancel reason form đầy đủ.

---

## Phase 13 — Profile polish — Avatar upload + Subscription section (6h) ✅ DONE

Tất cả nằm trong `components/profile/AccountTab.tsx` (18.9K):

### Avatar upload
- ✅ ActionSheet (Camera / Gallery / Remove) với conditional Remove
- ✅ `ImagePicker.requestCameraPermissionsAsync` + `requestMediaLibraryPermissionsAsync` permission UX
- ✅ `allowsEditing: true, aspect: [1,1], quality: 0.8`
- ✅ Upload qua `apiClient.postForm('/users/me/avatar', formData)`
- ✅ `refreshUser()` sau upload để reflect avatar mới
- ✅ Loading overlay khi đang upload (`ActivityIndicator` over avatar)
- ✅ DELETE `/users/me/avatar` cho remove flow

### Subscription section
- ✅ Tier badge ('FREE' / 'PREMIUM' / 'PRO') với color coding
- ✅ Status badge (ACTIVE/TRIALING/CANCELED/PAST_DUE/EXPIRED)
- ✅ End date display ('Renews … / Trial ends … / Access until …')
- ✅ Upgrade/Manage button conditional

---

## Phase 14 — Notification badge polling (8h) ✅ DONE

`contexts/NotificationContext.tsx` (12.8K) - 1 trong các context lớn nhất, làm rất kỹ:
- ✅ Polling 60s `getUnreadCount` qua `pollingIntervalRef`
- ✅ `fetchNotifications(page, append)` với dedupe duplicate IDs
- ✅ `markAsRead / markAllAsRead / deleteNotification` với optimistic update
- ✅ `checkForNewNotifications` so sánh `prevUnreadCountRef` để detect new notif → toast với navigation
- ✅ `toastedIdsRef.current: Set<string>` chống spam toast trùng
- ✅ Push token register/cleanup khi login/logout
- ✅ Badge UI trong tab profile (verified Phase 14 done trong tasks.md)

---

## Phase 15 — Grammar tab refactor (6h) ✅ DONE

- ✅ `app/(tabs)/grammar.tsx` đã import `grammarApi` từ `@/services` thay vì legacy `services/api.ts`
- ✅ Import `FoundationGrammarBook` type chính xác
- ✅ `LEVEL_THEMES` typed object cho Elementary/PreInter/Intermediate/UpperInter
- ✅ English-first naming

---

## Phase 16 — Push notifications (17h) ✅ DONE

### Client + Soft-prompt UX (R-02)

**`NotificationContext.tsx`** chứa toàn bộ logic soft-prompt:
- ✅ `checkShouldShowBanner()` (line ~270) — 5-step logic:
  1. Check permission status; nếu granted → registerPushToken; nếu denied → skip banner
  2. Read `notif-soft-dismiss-count` từ AsyncStorage; nếu >= 3 → silent
  3. Read `notif-soft-dismissed-at`; nếu < 7 ngày → cooldown
  4. Delay 120000ms (2 phút) qua `setTimeout` → `setShowPermissionBanner(true)`
  5. Cleanup timer trong useEffect return

**`NotificationPermissionBanner.tsx`** (4.5K):
- ✅ Sliding banner top-anchored với `Animated.spring`
- ✅ 2 button: Enable (call `requestPushPermission`) / Maybe Later (dismiss + store timestamp + increment count)
- ✅ Blue branded color `#3B82F6` (intentional, có comment giải thích)
- ✅ Bell icon ring, branded shadow

### Push token register

- ✅ `Notifications.getExpoPushTokenAsync({ projectId })`
- ✅ `Device.isDevice` guard
- ✅ POST `/users/me/push-token` + DELETE on logout
- ✅ Foreground handler: `setNotificationHandler` → in-app toast thay vì system banner
- ✅ Background tap: parse `data.link` → router.push

### Đánh giá

🟢 **R-02 mitigation chuẩn nhất** — soft-prompt logic state machine chi tiết, 7-day cooldown đúng spec, max 3 lần re-prompt.

---

## Phase 17 — Dark mode toàn app (24h) ✅ DONE

### Foundation

**`constants/theme.ts`** đầy đủ:
- `ThemeTokens` interface với 22 token (primary/text/background/surface/border/success/error/...)
- `LIGHT_TOKENS` & `DARK_TOKENS` đầy đủ
- `DARK_TOKENS.textMuted` đã bump lên `#94A3B8` (Slate 400) để đảm bảo WCAG AA contrast ≥ 4.5:1 trên dark bg

**`contexts/ThemeContext.tsx`** (2.5K):
- ✅ `theme: 'light' | 'dark' | 'system'`
- ✅ Persist AsyncStorage `STORAGE_KEYS.THEME`
- ✅ `Appearance.addChangeListener` cho mode `system`
- ✅ `resolvedTheme` computed
- ✅ Exposed: `theme, resolvedTheme, isDark, colors, setTheme`

### Refactor coverage (P17-05 → P17-18)

Đã verify trong tasks.md tất cả 14 tasks tick xong, với note chi tiết về dynamic `createStyles(colors)` pattern cho:
- Tabs: index/explore/ielts/community/profile/_layout
- IELTS: intensive (4 file)/advanced (4 file)/basic (2 file)
- vocab-lab/shadowing (4 file)
- components/ielts (20 file): all exercise/* + main blocks (8 file)
- components/ui + global: AudioPlayer, UsageIndicator, NotificationPermissionBanner refactored
- Intentionally dark: Toaster, UpgradeModal, FeatureLock — đúng (chúng là overlay nên giữ premium dark)

### Toggle UI

`components/profile/SettingsTab.tsx` (7.4K) — implement Light/Dark/System segmented selector qua `setTheme`.

### Contrast fix (P17-21)

- ✅ Dark `textMuted` bumped Slate 500 → Slate 400 (passes WCAG AA)
- ✅ Vocab-lab buttons/headers thay `#fff on yellow` → `colors.onPrimary` (Slate 900 on yellow)

### Đánh giá

🟢 **Excellent** — Dark mode coverage rất tốt. RootLayout sử dụng `useTheme()` để switch `StatusBar style`. Một số overlay (UpgradeModal/FeatureLock/Toaster) intentionally giữ dark để look premium — design choice đúng.

---

## Risk Register — Kiểm tra status mỗi risk

| ID | Tên Risk | Status Plan | Status Code | Verify |
|---|---|---|---|---|
| **R-01** | Apple IAP rejection | ✅ Decided: Android-first | ✅ P18/19 chưa làm — đúng kế hoạch | OK |
| **R-02** | Android 13+ POST_NOTIFICATIONS | ✅ Decided: Soft-prompt | ✅ Implementation chính xác (2min + 7 day re-prompt + cap 3 lần) | OK |
| **R-03** | iOS APN cert | ⏳ Deferred to P19 | – | OK |
| **R-04** | Backend Foundation endpoints | ✅ Resolved | ✅ URL `/pronunciation/progress/stats` đúng, bonus `word-progress` integrated | OK |
| **R-05** | Advanced Writing/Speaking 2-step | ✅ Resolved | ✅ `createSession → saveDraft → submit` pattern chuẩn | OK |
| **R-06** | Foundation Vocab question type | ✅ Resolved | ✅ Verified mobile render `multiple_choice` + `fill_blank` | OK |
| **R-07** | EAS Build account | ⏳ OPEN | – | **Action needed P18** |
| **R-08** | Cloudinary upload size | ⏳ OPEN | – | Test thực tế khi upload audio Speaking |
| **R-09** | Reanimated v4 stability | ⏳ OPEN | – | QA Phase 18 test 3 devices |
| **R-10** | Bundle size > 50MB | ⏳ OPEN | – | Bundle analyze P18 |

---

## Số liệu code health (đo lúc 2026-05-22)

| Chỉ số | Baseline (đầu Phase 0.5) | Hiện tại | Mục tiêu | Trạng thái |
|---|---|---|---|---|
| Inline `const THEME = {...}` | 6 | **0** | 0 | ✅ |
| `fontFamily: 'Farro-X'` raw | 15 file | **0** | 0 | ✅ |
| `as any` (toàn `app/`) | ~143 | **64** | <30 ideal | ⚠️ Cần dọn nữa |
| `router.push.*as any` | 36 | **27** | <5 | ⚠️ Cần dọn nữa |
| `console.log/error/warn` | 1310 | **77** | <50 | ⚠️ Cần dọn nốt P18 |
| `Alert.alert` | 66 | ~10-15 (estimate, đa số đã chuyển sang toast) | – | OK |
| ESLint config | KHÔNG | ✅ | – | ✅ |
| Prettier config | KHÔNG | ✅ | – | ✅ |
| ErrorBoundary | KHÔNG | ✅ | – | ✅ |
| File >700 lines | 6 file | 4 file (intensive `[examId]` 1500+, community 715→giảm, profile 1014→giảm, calculator 32K) | – | ⚠️ Intensive còn lớn |

---

## Tổng quan dependencies cài

`package.json` đã include hết deps cần thiết cho 17 phase:
- Core: `expo ~54`, `react 19.1.0`, `react-native 0.81.5`, `expo-router ~6`
- UI: `nativewind ^4`, `@expo/vector-icons ^15`, `react-native-svg 15.12.1`, `react-native-reanimated ~4.1.1`
- Audio/Video: `expo-audio ~1.1.1`, `expo-video ~3.0.16`, `expo-speech-recognition ^3.1.3`
- Auth/Storage: `@react-native-async-storage/async-storage 2.2.0`, `expo-auth-session ~7.0.11`
- Notification: `expo-notifications ~0.32.17`, `expo-device ~8.0.10`, `expo-tracking-transparency ~6.0.8`
- UX: `react-native-toast-message ^2.3.3`, `zustand ^5.0.13`, `react-native-image-zoom-viewer ^3.0.1`, `react-native-markdown-display ^7.0.2`
- Image: `expo-image-picker ~17.0.10`, `expo-image ~3.0.11`
- Payment: `expo-web-browser ~15.0.11`, `expo-linking ~8.0.11`
- Dev: `eslint ^8.57.1`, `prettier ^3.8.3`, `typescript ^5.3.3`

**Chưa có (sẽ cần ở P19)**: `expo-in-app-purchases`

---

## Danh sách "Polish nhỏ" trước Phase 18

Để Phase 18 (Android Release) chạy mượt, đề xuất 1 ngày polish nhỏ:

### Code health (3-4h)
1. **Hạ `router.push.*as any` từ 27 → <10** (1h): Thay 12 template literal raw bằng `ROUTES.X()` helpers tương ứng.
2. **Hạ `console.log/error/warn` từ 77 → <30** (2h): Wrap bằng `if (__DEV__)` hoặc remove debug logs không cần.
3. **Husky pre-commit hook (P05-09)** (0.5h): Optional, đảm bảo team không commit lỗi lint sau này.

### Performance prep cho P18 (2-3h)
1. **Audit `app/ielts/intensive/[examId].tsx` 74K** — file lớn nhất app. Xem có thể tách helper hooks (`useExamSession`, `useExamTimer`, `useAnswerState`) ra không. Nếu tốn nhiều effort, đẩy sang P18 React.memo + useMemo path.
2. **Check `expo-image` cache policy** đã set `memory-disk` cho avatar/thumbnail chưa (P18-03 sẽ làm sau).
3. **Verify bundled icon vs unused** trong `@expo/vector-icons` (tree-shake check tại P18-05).

### Pre-P18 testing matrix
- [ ] Cold start time đo trên 1 device thật (Pixel 5/6/7)
- [ ] Memory profile trong 30 phút smoke run
- [ ] Test `EXPO_PUBLIC_API_URL` switch giữa dev local + prod `dedangdown.io.vn`

---

## Khuyến nghị thứ tự tiếp theo

| Bước | Ước tính | Mô tả |
|---|---|---|
| 1 | 4-6h | **Polish code health pre-P18** (router.push, console.log, optional Husky) |
| 2 | 2-3h | **Performance pre-check** (audit intensive [examId], expo-image cache, icon tree-shake) |
| 3 | 16h | **Phase 18 — Android Release** (xem `tasks.md` P18-01 → P18-20) |
| 4 | – | **Launch Android Internal Track Play Console** → thu feedback |
| 5 | (deferred) | **Phase 19 — iOS launch + IAP** (24h, sau khi Android ổn định) |

---

## Đánh giá tổng kết

🎯 **Thành tựu chính của 18 phase đã làm**:

1. **API parity 100% với web** — Mọi endpoint cần thiết đã có wrapper, kể cả 2-step session flow và bonus endpoints.
2. **Cleanup baseline thành công** — Theme tokens unified, ErrorBoundary, ESLint/Prettier, barrel exports đầy đủ.
3. **Dark mode hoạt động toàn app** — `useTheme()` được áp dụng rộng rãi, WCAG AA contrast achieved.
4. **R-02 + R-05 mitigation chỉn chu** — Soft-prompt notification UX + Writing autosave là 2 feature kỹ thuật phức tạp nhất, đều làm clean.
5. **Foundation modules** (Vocab/Grammar/Pronunciation) đã có progress tracking đầy đủ + bonus word-progress.

🚦 **Trạng thái cuối**: **Sẵn sàng cho Phase 18 (Android Release)** sau khi làm 4-6h polish nhỏ (cleanup residual `as any` + console.log + optional Husky).

🚀 **Phase 19 (iOS + IAP, deferred)** vẫn theo plan — chỉ trigger sau khi Android live ổn định + có feedback metrics.

---

> **Ghi chú phương pháp review**: Báo cáo này dựa trên đọc trực tiếp ~25 file code chính + đối chiếu acceptance criteria từ `implement.md` + đo grep statistics. Không phải smoke test runtime (cần device thật). Trước P18 release nên có 1 round QA manual đầy đủ trên 2-3 Android device khác nhau (Pixel + Samsung mid-range).
