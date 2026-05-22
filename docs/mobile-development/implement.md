# Mobile Development — Kế hoạch hiện thực đạt parity với Web

> **Cập nhật**: 2026-05-21 · **Phạm vi**: `frontend-mobile` (Expo SDK 54 / RN 0.81 / Expo Router 6)
> **Mục tiêu**: Đưa app mobile đạt feature parity với `frontend-web` (Next.js 14) cho luồng học viên (không Admin).
> **Backend**: KHÔNG đổi (`backend-core` NestJS + `backend-ai` FastAPI giữ nguyên endpoint hiện tại).

---

## 0. Quyết định kiến trúc (đã chốt với user)

| Quyết định | Lựa chọn | Hệ quả |
|---|---|---|
| Phạm vi | Toàn bộ tính năng học viên, **không** Admin | Bỏ qua `/admin/*` của web |
| Payment | `expo-web-browser` mở VNPay → deep-link callback | Cần config scheme + 1 màn handler |
| Push notification | Có, **Phase cuối** | Trước đó dùng polling 60s như web |
| Dark mode | **Phase cuối**, sau khi feature parity | Style hiện light-only, refactor token sau |
| Ưu tiên đầu tiên | **IELTS Advanced Writing & Speaking** | Phase 1 |
| Optional UX | Bao gồm: Speaking Device Test, Dictionary Popup, Quick Vocab FAB, Chat AI streaming + suggestions | Phân nhỏ vào các phase liên quan |
| Estimates | Theo **giờ solo-dev fulltime** (1 dev) | Tổng ước lượng cuối tài liệu |

---

## 1. Nguyên tắc thực hiện

1. **Không sửa schema Prisma / backend** trừ khi bắt buộc. Nếu cần endpoint mới → ghi rõ ở phần "Backend changes" của phase và xin xác nhận trước.
2. **Tái sử dụng services hiện có** trong `services/ielts.api.ts`, `services/features.api.ts`. Bổ sung endpoint còn thiếu khi bắt gặp.
3. **Mọi tính năng AI grading** (Writing/Speaking) đi qua flow async hiện tại: `submit → RabbitMQ → poll session status → render result`. Tận dụng `hooks/useGradingPoll.ts` đã có.
4. **Giữ thiết kế tokens** (`constants/index.ts`: `COLORS`, `SPACING`, `RADIUS`, `FONT_SIZES`, `FONTS`). Mọi component mới phải dùng tokens, không hardcode hex/px.
5. **NativeWind v4** dùng `className` khi style tĩnh; `StyleSheet.create` khi style động/Animated.
6. **Expo Router** — mọi route mới khai báo trong `app/_layout.tsx` Stack screens. Modal screens dùng `presentation: 'modal'`.
7. **Permissions** mic/camera/notification phải xin lúc cần dùng (just-in-time), không xin trên splash.
8. **Tránh re-render khi có timer** — memo block exam (đã làm với React.memo ở web), tách `useTimer` ra hook, dùng `useRef` lưu wall-clock.
9. **Mỗi commit** chỉ trong 1 phase; nếu touch >5 file/feature thì split.
10. **Mỗi feature** hoàn thành phải có "Acceptance criteria" tick xong trước khi đóng phase.

---

## 2. Hiện trạng app mobile (Snapshot 2026-05-21)

### 2.1 Tabs hiện có (`app/(tabs)/`)
- `index.tsx` (Home), `explore.tsx`, `ielts.tsx` (basic), `community.tsx` (34KB), `profile.tsx` (29KB)
- Hidden tabs (`href: null`): `vocablab`, `shadowing`, `pronunciation/`, `vocabulary`, `more`, `grammar`

### 2.2 Nested routes hiện có
- `(auth)/login.tsx`, `(auth)/register.tsx`
- `ielts/` — `advanced/`, `basic/`, `intensive/`, `pronunciation/`, `grammar/`, `student-teacher/`, `calculator.tsx`, `dashboard.tsx`, `history.tsx`, `onboarding.tsx`, `roadmap.tsx`, `statistics.tsx`
- `vocabulary/[bookId]/[unitId]`, `grammar/[bookSlug]/[unitId]`, `vocab-lab/[deckId]`, `vocab-lab/study/[deckId]`
- `shadowing/[lessonId]/[mode].tsx`
- `student-teacher/[studentId]`
- `chat-ai.tsx`, `notification.tsx`, `pricing.tsx`, `exams.tsx`, `results.tsx`

### 2.3 Contexts hiện có
| Context | Có? | Ghi chú |
|---|---|---|
| AuthContext | ✓ | `contexts/AuthContext.tsx` (4.9K). Có guard auto-redirect. |
| SubscriptionContext | ✗ | Web có (tier/usage/refresh). Phase 3. |
| NotificationContext | ✗ | Web có polling 60s + dropdown. Phase 12. |
| GradingContext | ✗ | Web có toast global khi đang chấm. Phase 3. |
| ThemeContext | ✗ | Profile có toggle local AsyncStorage nhưng không áp dụng app. Phase 15. |
| IeltsSidebarContext | N/A | Mobile dùng drawer riêng (`SharedDrawer`). |

### 2.4 Services có sẵn (`services/`)
- `api-client.ts` — fetch-based, refresh token. ✓ Tốt.
- `auth.service.ts` ✓
- `features.api.ts` — `vocabLabApi`, `shadowingApi`, `ieltsBasicApi`, `subscriptionsApi`, `gamificationApi`
- `ielts.api.ts` — `ieltsProfileApi`, `ieltsAdvancedApi` (chỉ Listening+Reading), `ieltsExamsApi`, `studentTeacherApi`, `vocabularyApi`, `grammarApi`
- `learning.api.ts`, `notes.api.ts`, `posts.api.ts`

### 2.5 Components đã có
- `components/ielts/` — 20 file (WritingExamBlock, SpeakingExamBlock, ReadingExamBlock, MatchingBlock, DiagramMapBlock, RichAudioPlayer, FormCompletionBlock, MCMultipleBlock, PassageReview, QuestionNoteEditor, RoadmapContent/Step/Summary, SpeakingRubricView, SpeakingVideoPlayer, TranscriptReview, WritingRubricView, exercise/*)
- `components/vocab-lab/` — 10 file (AddTab, BrowseTab, CardDetailSheet, CardTypeEditorModal, CardTypeManagerModal, DecksTab, FlashcardViewer, GlobalAddCardFab, MarketplaceTab, StatsTab)
- `components/ui/` — AppButton, AppTextInput, AudioPlayer, SharedDrawer
- `components/voice/` — RecordButton, Waveform, feedback/ScoreDashboard, feedback/TranscriptFeedback
- `components/` (root) — Card, ErrorView, LoadingSpinner, ui.tsx (Button/Badge/Chip/EmptyState/SectionHeader/ScoreBadge)

### 2.6 Hooks hiện có
- `useApi`, `useAudioRecorder` (expo-audio SDK 54), `useGradingPoll`, `usePronunciationChecker`

---

## 3. Gap phân tích chi tiết

### 3.1 IELTS Advanced
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Listening catalog + detail | ✓ | ✓ | OK |
| Reading catalog + detail | ✓ | ✓ | OK |
| **Writing catalog** | `advanced/writing/WritingCatalogContent.tsx` (10.2K) | ✗ | **THIẾU** |
| **Writing prompt detail** | `advanced/writing/[promptId]/` | ✗ | **THIẾU** |
| **Speaking catalog** | `advanced/speaking/SpeakingCatalogContent.tsx` (7.8K) | ✗ | **THIẾU** |
| **Speaking part detail** | `advanced/speaking/[partId]/` | ✗ | **THIẾU** |
| **Advanced statistics page** | `advanced/statistics/page.tsx` (4.5K) | Có `statistics.tsx` general nhưng không split | **THIẾU** |
| Practice history (4 skills) | `ielts/history/HistoryContent.tsx` | `ielts/history.tsx` (20.3K) → có nhưng cần verify Writing/Speaking | **MAYBE** |
| `ieltsAdvancedApi` extensions | `submitWriting`, `submitSpeaking`, `getWritingHistory`, `getSpeakingHistory` | Chỉ có L/R | **THIẾU** |

### 3.2 IELTS Basic
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Skill listing | `/ielts/basic` | `(tabs)/ielts.tsx` | OK |
| Lesson detail | `[skill]/lessons/[lessonId]/LessonDetailContent` (21.7K) | `basic/lesson/[lessonId].tsx` (15.7K) | OK (kiểm tra question types) |
| Exercise detail | `[skill]/exercises/[exerciseId]/ExerciseDetailContent` | `basic/exercise/[exerciseId].tsx` (23.8K) | OK |
| **Onboarding Diagnostic Quiz** | `basic/onboarding/DiagnosticQuiz.tsx` (13.4K) + `writingClozeData.ts` | `ielts/onboarding.tsx` (15.4K) chỉ là 3-step setup target | **THIẾU diagnostic quiz** |
| Roadmap | `basic/roadmap/page.tsx` + `RoadmapSidebar` | `ielts/roadmap.tsx` (7.9K) | OK (so structure) |
| Library | `basic/library/page.tsx` | `basic/library/[skill]/` | OK |
| **Question type renderers** (11 reading + 10 listening) | `basic/components/reading-renders/`, `listening-renders/` | `components/ielts/` có 5-6 block (Matching, DiagramMap, FormCompletion, MCMultiple, etc.) | **MAYBE thiếu** Diagram Completion, Flowchart, Note Completion, Summary Completion, Matching Features/Headings/SentenceEndings, ShortAnswer, TrueFalseNotGiven |

### 3.3 IELTS Intensive
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Catalog | `intensive/IntensiveContent.tsx` (44.5K) | `intensive/index.tsx` (20.8K) | OK (verify completedCount) |
| Take exam | `intensive/[examId]/take/[sessionId]/` + 4 Take boards | `intensive/[examId].tsx` (63.2K) | OK |
| Practice mode | `intensive/[examId]/practice/` | Tích hợp trong [examId] | OK |
| Result | `intensive/[examId]/result/[sessionId]/page.tsx` (91.7K!) | `intensive/result/[sessionId].tsx` (31.1K) | OK (xem rubric coverage) |
| Custom session | (web không có custom riêng) | `intensive/custom.tsx` (18.5K) | mobile có thêm |
| **Speaking Device Test** | `components/SpeakingDeviceTest.tsx` (18.8K) | ✗ | **THIẾU** |
| Save/Resume progress | ✓ | ✓ qua `saveProgress` | OK |

### 3.4 Shadowing & Dictation
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Lesson catalog (system + my) | `/shadowing-dictation/shadowing/`, `/dictation/` | `shadowing/index.tsx` (16.4K) — kết hợp 2 mode | OK structure khác |
| Practice page | `shadowing-dictation/{mode}/[id]/` | `shadowing/[lessonId]/[mode].tsx` (35.7K) | OK |
| **My Videos (user-uploaded)** | `shadowing/my-videos/page.tsx` + AddShadowingModal | ✗ (chỉ list, không có form add) | **THIẾU import YouTube flow** |
| **Folder management** | Web có | ✗ | **THIẾU** |
| **Polling PROCESSING status** | Có (5s) | ✗ | **THIẾU** |
| Dictation hooks | `_components/_hooks/useDictation*` | Không tách hooks | OK (đã viết inline) |

### 3.5 Vocab Lab
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Decks tab | ✓ | ✓ | OK |
| Add card tab | ✓ AddCardTab (35.3K) | ✓ AddTab (23.7K) | OK |
| Browse | ✓ + BrowseFilterSidebar + BrowseCardEditor | ✓ BrowseTab (17.9K) + CardDetailSheet | OK |
| Stats | ✓ DonutCharts + ForecastChart + HourlyActivityChart + ReviewActivityChart + SummaryCards | ✓ StatsTab (9.6K) | **MAYBE thiếu vài chart** |
| Marketplace (Community) | ✓ community/page.tsx (7.6K) + SharedDeckCard | ✓ MarketplaceTab (14.2K) | OK |
| **Publish deck modal** | ✓ PublishDeckModal (5.0K) | ? — cần verify | **MAYBE THIẾU** |
| **Import deck modal** | ✓ ImportDeckModal (6.2K) | ? — cần verify | **MAYBE THIẾU** |
| Card Type Manager | ✓ CardTypeManagerModal (16.8K) | ✓ CardTypeManagerModal (11.4K) | OK |
| Card Type Editor | ✓ CardTypeEditorModal (45.6K) — Anki-style | ✓ CardTypeEditorModal (31.8K) | OK |
| Card Template Editor (HTML) | ✓ CardTemplateEditorModal (7.7K) | Tích hợp trong Editor | OK |
| Fields editor | ✓ FieldsEditorModal (13.2K) | ✓ trong Editor | OK |

### 3.6 Vocabulary (Foundation)
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Book list | ✓ `vocabulary/page.tsx` | ✓ `(tabs)/vocabulary.tsx` | OK |
| Book detail | ✓ `vocabulary/[bookSlug]/` | ✓ `vocabulary/[bookId].tsx` | OK |
| Unit lesson + quiz | ✓ | ✓ `vocabulary/[bookId]/[unitId].tsx` | OK (kiểm tra exercises quality) |

### 3.7 Grammar (Foundation)
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Book list | ✓ | `(tabs)/grammar.tsx` dùng `services/api.ts` cũ Vietnamese | **CẦN REFACTOR** |
| Book detail | ✓ | `grammar/[bookSlug].tsx` cũ | **CẦN REFACTOR** |
| Unit detail | ✓ | `grammar/[bookSlug]/[unitId].tsx` | **CẦN REFACTOR** |
| IELTS Grammar (Stage IELTS) | `ielts/grammar/[topicSlug]/` | `ielts/grammar/[bookSlug]/[unitId]` | OK |

### 3.8 Pronunciation
| Item | Web | Mobile | Gap |
|---|---|---|---|
| IPA chart | ✓ `pronunciation/page.tsx` | ✓ `(tabs)/pronunciation/index.tsx` | OK |
| Symbol detail | ✓ `pronunciation/[lessonSlug]/` | ✓ `(tabs)/pronunciation/[symbol].tsx` + `ielts/pronunciation/[symbol].tsx` | OK |
| Sounds list | ✓ `pronunciation/sounds/[symbol]/` | Có | OK |
| Foundation pronunciation progress | Có | Có (hook usePronunciationChecker) | OK |

### 3.9 Community
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Post feed | ✓ PostFeed + filters | ✓ trong community.tsx | OK |
| Create post + image upload | ✓ CreatePostModal | ✓ inline | OK |
| Comment thread | ✓ CommentSection | ? cần verify | **MAYBE** |
| Like/Bookmark | ✓ | ✓ bookmark | OK |
| **Leaderboard tab** | ✓ Leaderboard (4.5K) | ✗ | **THIẾU** |
| **My-posts filter** | ✓ | ? cần verify | **MAYBE** |
| Sidebar (categories) | ✓ CommunitySidebar | Không có khái niệm sidebar trên mobile | OK (skip) |
| Image full-screen viewer | Web có (Lightbox/Modal) | Cần kiểm tra | **MAYBE THIẾU** |

### 3.10 Profile / Settings
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Account info form | ✓ PersonalInfoForm | ✓ | OK |
| Change password | ✓ ChangePasswordForm | ✓ | OK |
| Delete account | ✓ DeleteAccountSection | ✓ | OK |
| Avatar upload | ✓ | ✗ | **THIẾU** |
| **Subscription section** | ✓ SubscriptionSection (12.4K — cancel, manage) | Có hiển thị nhưng không có cancel UI rõ | **THIẾU cancel UI** |
| XP / Level bar | ✓ XpLevelBar | ✓ trong profile | OK |
| Achievements | ✓ AchievementsSection | ✓ | OK |
| Theme toggle | ✓ trong Navbar | ✓ trong Profile (chưa apply toàn app) | **PHASE 15** |

### 3.11 Payment / Pricing
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Pricing page | ✓ | ✓ `pricing.tsx` (21.3K) | OK |
| Plan compare table | ✓ | ✓ | OK |
| Checkout button (VNPay) | Redirect VNPay URL | Hiện chưa rõ flow | **THIẾU VNPay return handler** |
| Trial start | ✓ | ✓ | OK |
| Cancel subscription | ✓ Profile | ✗ | **THIẾU** |

### 3.12 Notification
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Notification screen | ✓ Dropdown | ✓ `notification.tsx` modal full | OK |
| Badge count global | ✓ NotificationContext polling 60s | ✗ (chỉ trang home có dot tĩnh) | **THIẾU** |
| Toast khi grading xong | ✓ GradingContext | ✗ | **THIẾU** |
| Push notification | ✗ (web không có) | ✗ | **THÊM MỚI** (Phase cuối) |

### 3.13 Global UX
| Item | Web | Mobile | Gap |
|---|---|---|---|
| Toast system (success/error/info/loading) | ✓ Toaster (Zustand) | ✗ chỉ Alert | **THIẾU** |
| **FeatureLock** (blur + upgrade CTA) | ✓ | ✗ | **THIẾU** |
| **UpgradeModal** | ✓ GlobalUpgradeModal | ✗ | **THIẾU** |
| **UsageIndicator** | ✓ | ✗ | **THIẾU** |
| **Dictionary Popup** (long-press) | ✓ DictionaryPopup (15.3K) | ✗ | **THIẾU** |
| **Quick Vocab Add FAB** | ✓ GlobalVocabFab | ✗ | **THIẾU** |
| AI Chat (Lexon) | ✓ GlobalAIChatFab (28.9K) — streaming + suggestions | ✓ `chat-ai.tsx` (10.8K) — non-streaming | **CẦN UPGRADE** |
| Header streak / level / vocab-due | ✓ Navbar | ✗ | **THIẾU** (cân nhắc tab header) |

---

## 4. Phase plan tổng quan

Theo ưu tiên đã thống nhất (IELTS Advanced trước, infrastructure xen kẽ khi cần):

| # | Phase | Mục tiêu chính | Phụ thuộc | Estimate |
|---|---|---|---|---|
| 0 | Chuẩn bị | Cài deps mới, env, file skeleton, baseline test | — | 4h |
| 0.5 | **Code Cleanup & Consistency + Foundation API parity** | Tooling, dead code, theme tokens, barrel exports, typed routes, file decomposition + port `lib/exam-parser.ts` + refactor `learning.api.ts` + Foundation Pronunciation API migrate + Foundation Vocab verify | 0 | 39h |
| 1 | IELTS Advanced — Writing | Catalog + 2-step session + Autosave + AI Grading + Result | 0, 0.5 | 26h |
| 2 | IELTS Advanced — Speaking | Catalog + Device Test + 2-step session + 7-state recorder + Result | 0, 1 | 34h |
| 3 | Infrastructure (Contexts + Toast + Lock) | Subscription/Grading/Toast/FeatureLock/UpgradeModal/UsageIndicator | 1, 2 | 16h |
| 4 | IELTS Advanced Statistics page | Tách `statistics.tsx` per-skill, biểu đồ | 3 | 8h |
| 5 | IELTS Basic — Diagnostic Quiz onboarding | Quiz writingCloze + auto-recommend roadmap | 0 | 12h |
| 6 | IELTS Basic — Reading & Listening renderers còn thiếu | 11 + 10 question types | 0 | 24h |
| 7 | Shadowing & Dictation — Add from YouTube + Folder mgmt + Polling | Form + folder + polling 5s | 3 | 16h |
| 8 | Vocab Lab — Publish/Import deck + chart polish | 2 modal + 4 chart | 3 | 12h |
| 9 | Community — Leaderboard + Saved + Image viewer | 1 tab + bookmark + viewer | 3 | 10h |
| 10 | Dictionary Popup + Quick Vocab FAB | Long-press lookup + draggable FAB | 3 | 10h |
| 11 | Chat AI streaming + suggestions | SSE/chunked + EXPLAIN_NOTE / ADD_VOCAB | 3 | 12h |
| 12 | Payment / VNPay return + Cancel subscription UI | Deep link + cancel flow | 3 | 8h |
| 13 | Profile polish — Avatar upload + Subscription section | image-picker + cancel UI | 3, 12 | 6h |
| 14 | Notification badge polling (global) | NotificationContext + badge ở tab bar | 3 | 8h |
| 15 | Grammar tab refactor (sync API mới) | Bỏ `services/api.ts`, dùng `grammarApi` | 0 | 6h |
| 16 | Push notification (Expo Notif + backend + Soft-prompt UX) | Token storage + handler + tap-to-route + permission banner | 14 | 17h |
| 17 | Dark mode toàn app | ThemeContext + refactor tokens | 1–16 | 24h |
| 18 | QA, polish, performance, **Android release** | Memo, lazy, EAS build Android AAB, Play Store metadata | All | 16h |
|  | **Tổng (Android-first launch)** | | | **~308h** ≈ 38.5 ngày solo |
| **19** | **iOS launch with IAP** (DEFERRED, trigger sau khi Android live ổn định) | `expo-in-app-purchases` + Apple receipt verify + App Store Connect | 18 + product feedback | **+24h** |
|  | **Tổng nếu launch cả 2 platform** | | | **~332h** ≈ 41.5 ngày solo |

---

## 5. Chi tiết từng phase

### Phase 0 — Chuẩn bị (4h)

**Mục tiêu**: dọn dẹp, cài deps cần thiết, tạo skeleton để các phase sau plug vào.

**Files / công việc**:
1. **`frontend-mobile/.env.example`** — bổ sung:
   - `EXPO_PUBLIC_APP_SCHEME=iemai` (deep-link cho VNPay return)
2. **`frontend-mobile/app.json`** — thêm `scheme: "iemai"`, `ios.bundleIdentifier`, `android.package`.
3. **Cài deps**:
   ```bash
   npx expo install expo-notifications expo-device expo-tracking-transparency
   npm i react-native-toast-message zustand
   ```
   - `react-native-toast-message` cho Toast.
   - `zustand` (hoặc dùng Context cũng được — chọn zustand để gần Toaster web).
4. **Tạo files skeleton trống**:
   - `contexts/SubscriptionContext.tsx`
   - `contexts/GradingContext.tsx`
   - `contexts/NotificationContext.tsx`
   - `contexts/ThemeContext.tsx`
   - `components/ui/Toaster.tsx`
   - `components/ui/FeatureLock.tsx`
   - `components/ui/UpgradeModal.tsx`
   - `components/ui/UsageIndicator.tsx`
5. **Bổ sung script** `package.json`: `"type-check": "tsc --noEmit"` để kiểm tra TS định kỳ.
6. **Verify**: `npm run start` chạy không lỗi.

**Acceptance**:
- [ ] `expo start` chạy không warning thiếu module.
- [ ] `tsc --noEmit` pass (kể cả file rỗng).
- [ ] `app.json` có scheme.

**Backend changes**: Không.

---

### Phase 0.5 — Code Cleanup & Consistency Baseline (24h)

**Bối cảnh** — Codebase mobile hiện tại có nhiều vấn đề ảnh hưởng đến tốc độ phát triển các phase sau:

| Số liệu audit (2026-05-21) | Giá trị |
|---|---|
| Inline `const THEME = {...}` (bypass tokens) | 6 file |
| Inline hex colors trong `.tsx` | ~1471 |
| `backgroundColor: '#...'` raw | ~510 |
| `fontFamily: 'Farro-X'` thay vì `FONTS.X` | 15 file |
| `as any` casts trong `app/` | ~143 |
| `any[]` trong service signatures | ~682 |
| `any` tổng | ~3328 |
| `console.log/error/warn` | ~1310 |
| `Alert.alert` (chưa Toast) | 66 |
| TODO/FIXME | 470 |
| ESLint / Prettier config | KHÔNG có |
| ErrorBoundary toàn app | KHÔNG có |
| `router.push(... as any)` typed route | 36 |
| Dead code: `features/vocab-lab/{DeckCard,types}` (0 import) | 2 file |
| `services/api.ts` legacy (chỉ 3 file Grammar dùng) | 1 file → sẽ xóa sau P15 |
| `types/api.ts` re-export hollow | 1 file |
| Drawer logic duplicate | 3 file |
| File >700 lines (cần decompose) | 6 file |

**Mục tiêu Phase 0.5**: Dọn nền tảng đủ tốt để Phase 1+ chạy mượt. KHÔNG cố làm hoàn hảo — chọn cleanup có ROI cao nhất.

**Nguyên tắc**:
1. Không refactor những gì sẽ refactor lại ở phase sau (ví dụ file profile.tsx sẽ tách ở Phase 13 — chỉ tách ở P13).
2. Mỗi commit trong Phase 0.5 phải pass `tsc --noEmit` + `npm run lint` mới (sau khi setup).
3. Mỗi sub-task xong → smoke test app khởi động và navigate qua 3-4 màn chính.

#### 0.5.1 Tooling baseline (4h)

**Mục tiêu**: ESLint, Prettier, type-check, ErrorBoundary — để các phase sau có cơ sở chất lượng.

1. **ESLint** (1.5h):
   ```bash
   npm i -D eslint eslint-config-expo @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks
   ```
   - Tạo `.eslintrc.js` extends `eslint-config-expo`.
   - Rules cốt lõi: no-unused-vars (warn), prefer-const, react-hooks/exhaustive-deps (warn), no-explicit-any (off — quá nhiều, để Phase sau).
   - Script `"lint": "eslint . --ext .ts,.tsx"`, `"lint:fix": "eslint . --ext .ts,.tsx --fix"`.
   - Chạy `lint:fix` lần đầu để auto-fix.

2. **Prettier** (1h):
   - `.prettierrc`: `{ semi: true, singleQuote: true, trailingComma: 'all', printWidth: 100, tabWidth: 2 }`.
   - `.prettierignore`: node_modules, .expo, ios, android, build, dist.
   - Script `"format": "prettier --write \"**/*.{ts,tsx,json,md}\""`.
   - Chạy 1 lần để chuẩn hoá toàn bộ file (commit riêng).

3. **ErrorBoundary** (1h):
   - Tạo `components/ErrorBoundary.tsx`: classic React class component bắt `componentDidCatch`.
   - Hiển thị fallback UI thân thiện + button "Reload App" (`expo-updates` hoặc `DevSettings.reload()`).
   - Wrap vào `app/_layout.tsx` ngoài cùng (sau AuthProvider).

4. **Husky + lint-staged (optional, 0.5h)**:
   - `npm i -D husky lint-staged`
   - Pre-commit: chạy lint + format trên staged files.

**Acceptance**:
- [ ] `npm run lint` báo cáo issue, không crash.
- [ ] `npm run format` không thay đổi gì sau lần đầu (đã consistent).
- [ ] `tsc --noEmit` pass.
- [ ] Crash test: throw `new Error('test')` trong 1 screen → ErrorBoundary catch + hiển thị UI fallback.

#### 0.5.2 Dead code & duplicate removal (3h)

1. **Xóa `features/vocab-lab/`** (0.5h):
   - Verify `DeckCard.tsx` và `types.ts` không có import nào (`grep -rn "features/vocab-lab"` = 0).
   - Xóa thư mục.
   - Run type-check để confirm không break.

2. **Inline `types/api.ts` vào `types/index.ts`** (0.5h):
   - File hiện chỉ là `export * from './index'` + alias. Hợp nhất.
   - Update imports: `from '@/types/api'` → `from '@/types'`.

3. **Đánh dấu `services/api.ts` legacy** (1h):
   - Thêm comment header: `// DEPRECATED — sẽ xóa sau Phase 15 (Grammar refactor). KHÔNG dùng file này cho code mới.`
   - Confirm chỉ 3 file dùng: `app/(tabs)/grammar.tsx`, `app/grammar/[bookSlug].tsx`, `app/grammar/[bookSlug]/[unitId].tsx`.
   - **KHÔNG xóa ngay** — đợi P15 migrate xong.

4. **Audit hidden tabs** trong `app/(tabs)/_layout.tsx` (1h):
   - 6 hidden tabs (`href: null`): `vocablab`, `shadowing`, `pronunciation/`, `vocabulary`, `more`, `grammar`.
   - Confirm các route này còn cần để deep-link.
   - Nếu không, xoá khỏi `_layout.tsx` (đã có route ngoài (tabs)).
   - Verify navigation tới các route đó vẫn OK.

**Acceptance**:
- [ ] `features/vocab-lab/` không tồn tại.
- [ ] `types/api.ts` không tồn tại; mọi import resolve `@/types`.
- [ ] `services/api.ts` còn nhưng có deprecation comment.
- [ ] App boot OK, navigate Profile/Vocab Lab/Grammar không lỗi.

#### 0.5.3 Theme tokens unification (6h)

**Mục tiêu**: Mọi style đi qua `constants/index.ts`. Loại bỏ 6 inline THEME.

1. **Mở rộng `constants/index.ts` COLORS** (1h):
   - Thêm scales đầy đủ thay vì mix raw hex:
     ```ts
     export const COLORS = {
       ...existing,
       // Skill colors (đồng nhất giữa các màn IELTS)
       skill: {
         listening: '#E11D48',
         reading:   '#2563EB',
         writing:   '#D97706',
         speaking:  '#7C3AED',
       },
       // Gray scale (nguồn duy nhất)
       gray: {
         50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB',
         300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280',
         600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827',
       },
       // Status scales
       successScale:  { 50: '#F0FDF4', 500: '#22C55E', 700: '#15803D' },
       warningScale:  { 50: '#FFFBEB', 500: '#F59E0B', 700: '#B45309' },
       errorScale:    { 50: '#FEF2F2', 500: '#EF4444', 700: '#B91C1C' },
     };
     ```
   - Giữ legacy keys (`primary`, `text`, ...) cho backward compat.

2. **Refactor 6 file có inline `const THEME = {...}`** (3h):
   - `app/pricing.tsx` (15-20 min)
   - `app/shadowing/index.tsx` (30 min — nhiều shade)
   - `app/(tabs)/vocabulary.tsx` (15 min)
   - `app/vocabulary/[bookId].tsx` (20 min)
   - `app/vocabulary/[bookId]/[unitId].tsx` (30 min)
   - `app/ielts/calculator.tsx` (15 min)
   - Pattern: Xóa `const THEME = {...}`, replace `THEME.X` → `COLORS.Y` (mapping qua tay).

3. **Refactor `fontFamily: 'Farro-X'` → `FONTS.X`** (1h):
   - 15 file. Mỗi file ~3-5 min với find/replace cẩn thận.
   - `'Farro-Bold'` → `FONTS.bold`, `'Farro-Regular'` → `FONTS.regular`, etc.

4. **Skill color migration** (1h):
   - Find/replace các literal:
     - `'#E11D48'` (LISTENING) → `COLORS.skill.listening`
     - `'#2563EB'` (READING) → `COLORS.skill.reading`
     - `'#D97706'` (WRITING) → `COLORS.skill.writing`
     - `'#7C3AED'` (SPEAKING) → `COLORS.skill.speaking`
   - Chỉ trong các file IELTS (advanced/intensive/history/statistics) — không touch những chỗ không liên quan.

**Acceptance**:
- [ ] `grep -rn "const THEME" app/ components/` → 0 match.
- [ ] `grep -rn "fontFamily: 'Farro" app/ components/` → 0 match.
- [ ] 6 file đã refactor render đúng (compare screenshot trước/sau, không đổi UI).
- [ ] Type-check + lint pass.

#### 0.5.4 Barrel exports & module organization (2h)

1. **Mở rộng `components/index.ts`** (0.5h):
   ```ts
   export * from './ielts';
   export * from './vocab-lab';
   export * from './ui';
   export * from './voice';
   export { LoadingSpinner } from './LoadingSpinner';
   export { ErrorView } from './ErrorView';
   export { Card } from './Card';
   ```
   - Tạo `components/ielts/index.ts`, `components/vocab-lab/index.ts`, `components/ui/index.ts` re-export tất cả components con.

2. **Refactor `services/index.ts`** (0.5h):
   ```ts
   export { apiClient } from './api-client';
   export { authService } from './auth.service';
   export * from './features.api';
   export * from './ielts.api';
   export * from './learning.api';
   export * from './notes.api';
   export * from './posts.api';
   // Legacy (sẽ xóa sau P15):
   export { grammarApi as legacyGrammarApi } from './api';
   ```

3. **Mở rộng `hooks/index.ts`** (0.5h):
   ```ts
   export { useApi } from './useApi';
   export { useAuth } from '@/contexts/AuthContext';
   export { useAudioRecorderHook as useAudioRecorder } from './useAudioRecorder';
   export { usePronunciationChecker } from './usePronunciationChecker';
   export { useGradingPoll } from './useGradingPoll';
   ```

4. **Replace imports** (0.5h):
   - Top 10 file có import dài → đổi sang barrel.
   - Ví dụ `import { Button, Badge, EmptyState } from '@/components/ui'` thay vì 3 dòng import.

**Acceptance**:
- [ ] `components/index.ts`, `services/index.ts`, `hooks/index.ts` export đầy đủ.
- [ ] Top 10 file import qua barrel.
- [ ] Type-check pass.

#### 0.5.5 Typed routes & router cleanup (3h)

**Vấn đề**: 36 chỗ `router.push(... as any)` — TS không kiểm tra path → dễ typo, không refactor-safe.

1. **Tạo `constants/routes.ts`** (1h):
   ```ts
   export const ROUTES = {
     // Auth
     login: '/(auth)/login',
     register: '/(auth)/register',
     // Tabs
     home: '/(tabs)',
     explore: '/(tabs)/explore',
     ielts: '/(tabs)/ielts',
     community: '/(tabs)/community',
     profile: '/(tabs)/profile',
     // IELTS
     ieltsAdvanced: '/ielts/advanced',
     ieltsAdvancedListening: (partId: string) => `/ielts/advanced/listening/${partId}`,
     ieltsAdvancedReading: (partId: string) => `/ielts/advanced/reading/${partId}`,
     ieltsAdvancedWriting: (promptId: string) => `/ielts/advanced/writing/${promptId}`,
     ieltsAdvancedSpeaking: (partId: string) => `/ielts/advanced/speaking/${partId}`,
     ieltsAdvancedHistory: '/ielts/advanced/history',
     ieltsAdvancedStatistics: '/ielts/advanced/statistics',
     ieltsIntensive: '/ielts/intensive',
     ieltsIntensiveExam: (examId: string) => `/ielts/intensive/${examId}`,
     ieltsIntensiveResult: (sessionId: string) => `/ielts/intensive/result/${sessionId}`,
     ieltsIntensiveCustom: '/ielts/intensive/custom',
     ieltsBasic: '/(tabs)/ielts',
     ieltsBasicLesson: (lessonId: string) => `/ielts/basic/lesson/${lessonId}`,
     ieltsBasicExercise: (exerciseId: string) => `/ielts/basic/exercise/${exerciseId}`,
     ieltsRoadmap: '/ielts/roadmap',
     ieltsHistory: '/ielts/history',
     ieltsStatistics: '/ielts/statistics',
     ieltsCalculator: '/ielts/calculator',
     ieltsDashboard: '/ielts/dashboard',
     ieltsOnboarding: '/ielts/onboarding',
     ieltsDiagnostic: '/ielts/onboarding/diagnostic', // P5
     ieltsStudentTeacher: '/ielts/student-teacher',
     ieltsStudentDetail: (studentId: string) => `/ielts/student-teacher/${studentId}`,
     ieltsGrammar: '/ielts/grammar',
     ieltsGrammarBook: (bookSlug: string) => `/ielts/grammar/${bookSlug}`,
     ieltsPronunciation: '/ielts/pronunciation',
     ieltsPronunciationSymbol: (symbol: string) => `/ielts/pronunciation/${symbol}`,
     // Vocabulary
     vocabulary: '/(tabs)/vocabulary',
     vocabularyBook: (bookId: string) => `/vocabulary/${bookId}`,
     vocabularyUnit: (bookId: string, unitId: string) => `/vocabulary/${bookId}/${unitId}`,
     // Grammar
     grammar: '/(tabs)/grammar',
     grammarBook: (bookSlug: string) => `/grammar/${bookSlug}`,
     grammarUnit: (bookSlug: string, unitId: string) => `/grammar/${bookSlug}/${unitId}`,
     // Shadowing
     shadowing: '/shadowing',
     shadowingLesson: (lessonId: string, mode: 'shadowing' | 'dictation') => `/shadowing/${lessonId}/${mode}`,
     // Vocab Lab
     vocabLab: '/vocab-lab',
     vocabLabDeck: (deckId: string) => `/vocab-lab/${deckId}`,
     vocabLabStudy: (deckId: string) => `/vocab-lab/study/${deckId}`,
     // Pricing/Payment
     pricing: '/pricing',
     paymentVnpayReturn: '/payment/vnpay-return', // P12
     // Chat / Notification
     chatAi: '/chat-ai',
     notification: '/notification',
   } as const;
   ```

2. **Thay 36 `router.push(... as any)` → `router.push(ROUTES.X)`** (2h):
   - Grep tìm tất cả `router.push.*as any` và `router.replace.*as any`.
   - Map mỗi cái sang `ROUTES.X` tương ứng.
   - Đặc biệt cẩn thận với pattern `/(tabs)/X` vs `/X`.

**Acceptance**:
- [ ] `grep -rn "router.push.*as any" app/ components/` → 0 (hoặc <5 cho corner case).
- [ ] Navigate đến mọi screen chính hoạt động.
- [ ] Type-check pass — `ROUTES` typed `as const`.

#### 0.5.6 Component decomposition (6h)

**Mục tiêu**: Tách 3 file lớn nhất để dễ maintain. KHÔNG tách `intensive/[examId].tsx` (1481 lines) ở phase này — đụng vào sẽ rủi ro vỡ exam flow, để sau khi Phase 1-2 ổn định.

1. **`app/(tabs)/profile.tsx` (1014 lines → 3 component)** (3h):
   - Tách thành:
     - `app/(tabs)/profile.tsx` (shell + tabs ~150 lines)
     - `components/profile/AccountTab.tsx` (form info + change password + delete)
     - `components/profile/StatsTab.tsx` (stats + achievements + XP bar)
     - `components/profile/SettingsTab.tsx` (theme toggle + logout + about)
   - Mỗi sub-component nhận props rõ ràng, không gọi API trực tiếp.

2. **`app/(tabs)/community.tsx` (715 lines → 4 component)** (2h):
   - Tách thành:
     - `app/(tabs)/community.tsx` (shell + filter tabs ~200 lines)
     - `components/community/PostCard.tsx`
     - `components/community/CreatePostModal.tsx`
     - `components/community/CommentSheet.tsx`
     - `components/community/Avatar.tsx` (reusable, có thể move lên `components/ui/`)

3. **`app/shadowing/[lessonId]/[mode].tsx` (881 lines → giữ)** (1h):
   - Chỉ tách helper hook + state machine ra `hooks/useShadowingMode.ts`.
   - Để decompose toàn bộ ở Phase 7 (Shadowing polish).

**Acceptance**:
- [ ] Profile 3 tab hoạt động đầy đủ như trước (no regression).
- [ ] Community feed/create/comment hoạt động đầy đủ.
- [ ] Mỗi file mới < 400 lines.
- [ ] Type-check pass.

**Backend changes**: Không.

#### 0.5.7 Port `lib/exam-parser.ts` từ web (4h)

**Vấn đề**: Web có thư viện `frontend-web/src/lib/exam-parser.ts` chứa `extractAllItemsFromPart()`, `NormalizedItem` union type, normalize logic cho mọi question type (mc_single, mc_multi, matching_group, completion, etc.). Mobile chỉ có `utils/answerNormalization.ts` (1.6K — đơn giản hơn nhiều). Hệ quả: mỗi exam screen mobile tự parse JSON khác nhau → bug khó debug, render không nhất quán giữa Listening/Reading.

**Mục tiêu**: Có 1 nguồn duy nhất để chuẩn hóa exam content → tránh divergence khi P6 build q-type renderers.

**Việc**:
1. Tạo `lib/exam-parser.ts` mobile — port nguyên từ web, giữ TypeScript types.
2. `NormalizedItem` discriminated union: `mc_single | mc_multi | matching_group | completion | short_answer | true_false | diagram_label | map_label | flowchart | table_completion | summary_completion`.
3. `extractAllItemsFromPart(part: any): NormalizedItem[]` — parse `groups[]` từ exam JSON.
4. `questionNumbersFromItems(items)` helper.
5. Audit các file mobile đang parse JSON thủ công và migrate dần (chỉ làm file dễ; phức tạp để Phase 6/1/2 xử lý):
   - `app/ielts/advanced/[skill]/[partId].tsx`
   - `app/ielts/basic/exercise/[exerciseId].tsx`
   - `app/ielts/intensive/[examId].tsx`
6. Verify không break exam render hiện tại.

**Acceptance**:
- [ ] `lib/exam-parser.ts` tồn tại với union type đầy đủ.
- [ ] Ít nhất 1 file exam screen migrate dùng parser mới mà không hồi quy.
- [ ] Type-check pass; tests manual với 5 exam thật pass.

#### 0.5.8 Refactor `learning.api.ts` mobile đồng bộ web (4h)

**Vấn đề**: Mobile `learning.api.ts` chỉ có 2 method (`checkPronunciation`, `getUserPronunciationAttempts`). Web `learning.api.ts` có ~15 endpoint Foundation (vocab progress, grammar progress, pronunciation sounds/progress/stats). Mobile hiện rải rác trong `ielts.api.ts` không đầy đủ → Foundation modules thiếu progress tracking.

**Mục tiêu**: Mobile `learning.api.ts` đầy đủ tương đương web; clean overlap với `ielts.api.ts`.

**Việc**:
1. Mở rộng `services/learning.api.ts` mobile — port từ web:
   ```ts
   export const learningApi = { ... existing checkPronunciation, getUserPronunciationAttempts ... };

   export const vocabularyApi = {
     getBooks(), getBook(id), getUnit(id),
     getProgress(bookId), updateWordProgress(unitId, wordsLearned),
     submitQuestions(unitId, answers),  // submit quiz answers
   };

   export const grammarApi = {
     getBooks(), getBook(slug), getUnit(id),
     getUnitByOrder(bookSlug, order),
     getProgress(bookSlug),
     updateProgress(unitId, payload),  // theoryCompleted, exerciseScore, exerciseTotal
   };

   export const pronunciationApi = {
     getAllSounds(),     // returns PronunciationData
     getSound(symbol),
     getProgress(),      // SoundProgress[]
     getStats(),         // PronunciationStats
     getSoundDetail(symbol),
   };
   ```
2. **Resolve trùng lặp** với `ielts.api.ts`:
   - `vocabularyApi` đang ở `ielts.api.ts` → move sang `learning.api.ts` (Foundation, không phải IELTS-specific).
   - `grammarApi` đang ở `features.api.ts` → move sang `learning.api.ts`.
   - Giữ deprecation alias để không break import cũ ngay, đánh dấu `@deprecated`.
3. Refactor 5-7 file import dùng path mới (qua barrel `@/services`).
4. Bổ sung types thiếu vào `types/index.ts`: `VocabularyBookProgress`, `WordProgress`, `GrammarUnitProgress`, `PronunciationData`, `SoundProgress`, `PronunciationStats`, `SubmitQuestionsResponse`.

**Acceptance**:
- [ ] `learning.api.ts` có >=10 endpoint, đồng bộ web.
- [ ] Types tương ứng có trong `types/index.ts`.
- [ ] Không có endpoint duplicate giữa `learning/ielts/features` api.
- [ ] Tất cả import resolve qua `@/services` barrel.

**Phụ thuộc**: Cần verify endpoint backend đã có (`/foundationVocabWord/progress/*`, `/grammar/progress/*`, `/pronunciation/sounds`, `/pronunciation/progress`, `/pronunciation/stats`). Theo Prisma schema đã có đủ models, theo `backend-core/src/modules/{vocabulary,grammar,pronunciation}/` đã có module — chỉ cần test.

#### 0.5.9 Foundation Pronunciation — migrate từ hard-coded sang API + Progress (6h)

**Vấn đề**: Mobile `app/(tabs)/pronunciation/index.tsx` (6.8K) + `app/ielts/pronunciation/index.tsx` (10.4K) dùng `const IPA_DATA = { monophthongs:..., diphthongs:..., consonants:... }` hard-coded. Không gọi API → không track `FoundationPronunciationAttempt` & `FoundationPronunciationProgress` (model Prisma đã có).

Web có `_components/IpaChart.tsx` + `_components/ProgressSummary.tsx` (4.4K) hiển thị tiến độ user (mỗi âm: best score, attempts count, mastered yes/no).

**Mục tiêu**: Mobile Foundation Pronunciation hoạt động đầy đủ — fetch sounds từ backend, hiển thị progress badge, sync với `FoundationPronunciationProgress`.

**Việc**:
1. **`(tabs)/pronunciation/index.tsx`** (2h):
   - Xóa `const IPA_DATA` hard-coded.
   - Gọi `pronunciationApi.getAllSounds()` từ `learning.api.ts` (đã refactor 0.5.8).
   - Hiển thị loading skeleton.
   - Nếu user đăng nhập: gọi song song `getProgress()` + `getStats()`.

2. **`components/foundation/ProgressSummary.tsx`** (1.5h):
   - Port từ web `_components/ProgressSummary.tsx` (4.4K).
   - Hiển thị: total sounds, mastered count, average score, weakest sounds (top 3).

3. **`components/foundation/IpaChart.tsx`** (1.5h):
   - Tái sử dụng grid hiện có, nhưng nhận `sounds: PronunciationData` prop thay vì hard-coded.
   - Mỗi `SymbolCell` hiển thị badge progress (chấm xanh nếu mastered, vàng nếu in-progress).

4. **`app/(tabs)/pronunciation/[symbol].tsx`** đã có (21.2K) — verify gọi đúng `getSoundDetail(symbol)` từ API thay vì lookup hard-coded (0.5h).

5. **Tận dụng endpoint bonus `/pronunciation/sounds/:soundId/word-progress`** (1h) — phát hiện trong R-04 audit, web chưa dùng:
   - Trong `[symbol].tsx`, mỗi example word (e.g. "sleep" của âm `iː`) gọi `pronunciationApi.getWordProgress(soundId, word)` để hiển thị: best score, attempt count, mastered status.
   - Hiển thị nhỏ dưới word card.
   - Giúp mobile có UX **tốt hơn web** ở mục này.

**Acceptance**:
- [ ] `(tabs)/pronunciation/index.tsx` render sounds từ API.
- [ ] Đăng nhập → hiển thị progress + stats.
- [ ] Mỗi cell có badge progress.
- [ ] `[symbol]` screen lấy detail từ API + records attempt.
- [ ] Mỗi example word hiển thị best score + attempt count (tận dụng `word-progress` endpoint).
- [ ] No regression: vẫn record được và score được như trước.

#### 0.5.10 Foundation Vocabulary Unit content — verify (1h)

> **R-06 RESOLVED** (audit sơ bộ 2026-05-21): Backend schema `FoundationVocabQuestion` chỉ có **2 type**: `multiple_choice` và `fill_blank`. Mobile đã có FlashCard SRS với 4 rating. Backend đơn giản hơn dự kiến → giảm 2h → 1h.

**Mục tiêu**: Verify mobile render đúng 2 question type + flow flashcard SRS hoạt động bình thường.

**Việc**:
1. Mở 2-3 unit thật khác nhau trên mobile.
2. Verify **flashcard learning flow**: hiện từ → meaning → IPA → example → rating 4 button.
3. Verify **`multiple_choice` question** render: hiển thị options A-D, click chọn, submit, hiện đúng/sai.
4. Verify **`fill_blank` question** render: TextInput, submit, normalize answer (trim/lowercase compare).
5. Verify **submit batch** qua `submitQuestions(unitId, answers[])` lưu score đúng vào `FoundationVocabProgress`.
6. Verify **reading/story** comprehension (nếu có trong content) render OK.

**Acceptance**:
- [ ] FlashCard SRS 4 rating button hoạt động.
- [ ] Multiple choice render đúng + score chính xác.
- [ ] Fill blank render đúng + normalize answer.
- [ ] Submit lưu progress thành công.
- [ ] **KHÔNG cần Phase 5.5** (đã confirm backend chỉ 2 type).

**Tổng Phase 0.5**: 4 + 3 + 6 + 2 + 3 + 6 + 4 + 4 + 6 + 1 = **39h** (~5 ngày fulltime) — *R-06 audit sơ bộ đã rút từ 40h xuống 39h.*

**Lưu ý**: Sau Phase 0.5, các phase sau sẽ:
- KHÔNG cần định nghĩa lại theme/font tokens
- Dùng `ROUTES.X` cho mọi navigation
- Dùng barrel imports
- File mới < 400 lines (best practice từ đây)
- Foundation modules (vocab/grammar/pronunciation) đã có API + progress đầy đủ
- Có `lib/exam-parser.ts` làm chuẩn parse exam content

---

### Phase 1 — IELTS Advanced Writing (26h)

> **R-05 RESOLVED**: Backend dùng **2-step session flow** (create → submit), không phải submit-direct. Có **autosave draft** endpoint. Plan đã cập nhật theo backend thực tế.

**Mục tiêu**: Học viên xem được danh sách prompt Writing Task 1/2 advanced, làm bài với autosave, submit và nhận AI grading.

#### Files & files

**Tạo mới**:
- `app/ielts/advanced/writing/index.tsx` — catalog với filter (taskType / subType / category / pagination).
- `app/ielts/advanced/writing/[promptId].tsx` — detail + editor + autosave + submit.
- `app/ielts/advanced/writing/result/[sessionId].tsx` — result với rubric WritingRubricView (đã có).
- `components/ielts/AdvancedWritingPromptCard.tsx` — card UI (band score nếu đã làm, task type chip, time advice).
- `hooks/useWritingAutosave.ts` — debounce 5s, gọi `saveWritingDraft`.

**Mở rộng**:
- `services/ielts.api.ts` — thêm vào `ieltsAdvancedApi` (✅ URL chính xác match backend audited):
  ```ts
  // 2-step session flow (KHÔNG phải submit-direct)
  getWritingPrompts: (params?: { taskType?: 'TASK1' | 'TASK2'; subType?: string; category?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.taskType) q.set('taskType', params.taskType);
    if (params?.subType) q.set('subType', params.subType);
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/ielts/advanced/writing/prompts${qs ? `?${qs}` : ''}`);
  },
  getWritingPrompt: (id: string) => apiClient.get<any>(`/ielts/advanced/writing/prompts/${id}`),
  getWritingSessionsByPrompt: (promptId: string) => apiClient.get<any[]>(`/ielts/advanced/writing/prompts/${promptId}/sessions`),
  // Session lifecycle
  createWritingSession: (promptId: string) => apiClient.post<any>('/ielts/advanced/writing/sessions', { promptId }),
  saveWritingDraft: (sessionId: string, draftEssay: string) => apiClient.patch<any>(`/ielts/advanced/writing/sessions/${sessionId}/draft`, { draftEssay }),
  submitWritingSession: (sessionId: string, payload: { essay: string; timeTaken?: number }) => apiClient.post<any>(`/ielts/advanced/writing/sessions/${sessionId}/submit`, payload),
  getWritingSession: (sessionId: string) => apiClient.get<any>(`/ielts/advanced/writing/sessions/${sessionId}`),
  getWritingHistory: () => apiClient.get<any[]>('/ielts/advanced/writing/history'),
  ```
- `app/_layout.tsx` — thêm Stack.Screen cho 3 route mới.
- `app/ielts/advanced/index.tsx` — thêm 2 tab Writing + Speaking (hiện chỉ Listening + Reading).

**Logic chính (detail screen)**:
- Mount → check `useLocalSearchParams.sessionId` (nếu resume) hoặc `createWritingSession(promptId)` ngay.
- Hiển thị prompt (markdown + image_url nếu Task 1).
- Có timer 20 min (Task 1) / 40 min (Task 2).
- TextInput resizable (PanResponder chia tỉ lệ prompt/editor).
- Word count realtime (≥150 cho Task 1, ≥250 cho Task 2).
- **Autosave draft mỗi 5s** qua `useWritingAutosave` hook khi text thay đổi. Hiển thị "Saved at HH:MM:SS" indicator.
- Submit → `submitWritingSession` → router.replace `result/[sessionId]` → poll với `useGradingPoll` (max 90s).
- Result screen: dùng `WritingRubricView.tsx` đã có. 4 rubric: Task Achievement / Coherence / Lexical Resource / Grammatical Range.
- **Wrap toàn trang FeatureLock requiredTier="PREMIUM"** — backend đã guard `@RequiresTier("PREMIUM")` ở module level.

**Tăng từ 24h → 26h vì** (+2h):
- +1h autosave draft logic + indicator UX
- +1h 2-step session lifecycle (create + restore + cancel session logic)

**Acceptance**:
- [ ] Tab Writing trong `/ielts/advanced` hiện danh sách prompt với filter taskType.
- [ ] Mở 1 prompt → tự động tạo session, hiển thị editor.
- [ ] Type text → sau 5s thấy "Saved" indicator.
- [ ] Đóng app rồi mở lại + chọn prompt → resume session với draft đã save.
- [ ] Submit thành công → status flow SUBMITTING → GRADING → DONE.
- [ ] Result page show 4 band scores + feedback từng tiêu chí + corrected version.
- [ ] User FREE truy cập → thấy FeatureLock blur + Upgrade CTA.

---

### Phase 2 — IELTS Advanced Speaking (34h)

> **R-05 RESOLVED**: Backend dùng **2-step session flow** + dedicated `/speaking/stats` endpoint. Plan đã cập nhật.

**Mục tiêu**: Học viên chọn 1 Speaking Part (1/2/3), làm device test, làm bài qua flow 7-state, gửi audio, nhận AI grading.

#### Files

**Tạo mới**:
- `app/ielts/advanced/speaking/index.tsx` — catalog với filter (partNumber / category / topic).
- `app/ielts/advanced/speaking/[partId].tsx` — detail (7-state recorder).
- `app/ielts/advanced/speaking/result/[sessionId].tsx` — result + audio playback + transcript + band.
- `components/SpeakingDeviceTest.tsx` — port từ web (kiểm tra headphone + mic), hiển thị 1 lần đầu, lưu `AsyncStorage` flag `speaking-device-tested-v1`.
- `components/ielts/SpeakingPartCard.tsx` — UI thẻ part với last band, attempts count.

**Mở rộng**:
- `services/ielts.api.ts` (✅ URL chính xác match backend audited):
  ```ts
  // List với filter
  getSpeakingParts: (params?: { partNumber?: 1 | 2 | 3; category?: string; topic?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.partNumber) q.set('partNumber', String(params.partNumber));
    if (params?.category) q.set('category', params.category);
    if (params?.topic) q.set('topic', params.topic);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/ielts/advanced/speaking/parts${qs ? `?${qs}` : ''}`);
  },
  getSpeakingPart: (id: string) => apiClient.get<any>(`/ielts/advanced/speaking/parts/${id}`),
  getSpeakingSessionsByPart: (partId: string) => apiClient.get<any[]>(`/ielts/advanced/speaking/parts/${partId}/sessions`),
  // Session lifecycle (2-step)
  createSpeakingSession: (partId: string) => apiClient.post<any>('/ielts/advanced/speaking/sessions', { partId }),
  submitSpeakingSession: (sessionId: string, payload: { audioAnswers: Record<string, string>; timeTaken?: number }) => apiClient.post<any>(`/ielts/advanced/speaking/sessions/${sessionId}/submit`, payload),
  getSpeakingSession: (sessionId: string) => apiClient.get<any>(`/ielts/advanced/speaking/sessions/${sessionId}`),
  getSpeakingHistory: () => apiClient.get<any[]>('/ielts/advanced/speaking/history'),
  getSpeakingStats: () => apiClient.get<any>('/ielts/advanced/speaking/stats'),  // ⭐ dedicated stats
  ```
- Tận dụng `components/ielts/SpeakingExamBlock.tsx` (đã có cho intensive) — refactor để chấp nhận `mode: 'practice' | 'exam'` để dùng chung.
- `hooks/useAudioRecorder.ts` — đã hỗ trợ WAV. OK.
- `hooks/useGradingPoll.ts` — đã có. OK.
- **Wrap FeatureLock requiredTier="PREMIUM"** toàn trang.

**Tăng từ 32h → 34h vì** (+2h):
- +1h 2-step session flow (create session + restore + cancel)
- +1h `getSpeakingStats()` integration vào catalog page (last band, weakest part chip)

**Logic chính**:
- Catalog: load 3 part chuẩn. Mỗi part có badge "Last band: 6.5" nếu đã làm.
- Detail flow per câu hỏi (Part 1/3 short, Part 2 cue card):
  - State machine: `IDLE → LISTEN_CAPTION → PLAYING → THINK_CAPTION → THINKING (60s P2 / 2s P1-3) → PLAYING_2 → RECORDING (45s/2min/45s) → RECORDED`.
  - Video question từ Cloudinary URL (dùng `expo-video`).
  - RecordButton + Waveform (đã có).
  - Notes area khi THINKING (chỉ Part 2).
- Submit: upload từng audio qua `ieltsExamsApi.uploadSpeakingAudio` (đã có, multipart), gom URL → `submitSpeaking` → poll.
- Result: Audio playback từng câu, transcript, 4 band, pronunciation IPA highlights (nếu backend trả).

**Device Test**:
- Step 1: Play sample audio, slider volume, "I can hear it clearly".
- Step 2: Record 3s, playback, "Yes my mic works".
- Skip flag (don't show again).

**Acceptance**:
- [ ] Lần đầu mở Speaking → bật Device Test.
- [ ] State machine chạy đúng từng câu, không skip step.
- [ ] Audio upload tất cả câu thành công (≤10s mỗi câu trên Wi-Fi).
- [ ] Result: nghe lại được, xem rubric đủ 4 tiêu chí, transcript hiển thị.
- [ ] Lock orientation portrait trong test.
- [ ] Permission mic được xin đúng lúc, có error message rõ khi denied.

**Rủi ro**:
- `expo-video` thay đổi API ở SDK 54 — verify autoplay + muted permission iOS.
- Upload audio nhiều file song song có thể tốn pin → upload tuần tự với progress.
- iOS Background mode khi user lock màn → tạm thời block lock (warning UI).

---

### Phase 3 — Infrastructure: Contexts + Toast + Lock (16h)

**Mục tiêu**: Foundation để các phase sau dùng. Subscription/Grading/Toast/Lock đầy đủ như web.

#### 3.1 SubscriptionContext (4h)

`contexts/SubscriptionContext.tsx`:
```ts
const ctx = {
  tier: 'FREE' | 'PREMIUM' | 'PRO',
  status, trialUsed, trialEndsAt, currentPeriodEnd,
  usage: Record<string, { used: number; limit: number }>,
  loading, isPremiumOrAbove, isPro, isTrial,
  refresh(),
}
```
- Lấy data từ `subscriptionsApi.getMySubscription`.
- Refresh khi: login, app re-foreground (AppState listener), sau khi pay.
- Provider bọc trong `app/_layout.tsx` sau AuthProvider.

#### 3.2 GradingContext + Global Toast (4h)

`contexts/GradingContext.tsx`:
- `jobs: GradingJob[]`, `submitAndTrack(params)`, `setSilencedSessionId(id)`.
- Poll 5s với `examsApi.getSession`.
- Hiển thị toast `react-native-toast-message` (custom render):
  - Submitting: spinner + "Submitting..."
  - Grading: progress dots + "AI is grading..."
  - Done: ✓ + "View Results" CTA → `router.push(resultUrl)`.

#### 3.3 Toaster (2h)

`components/ui/Toaster.tsx`:
- Wrapper quanh `react-native-toast-message` với 4 type: success / error / info / loading.
- API: `toast.success(msg)`, `toast.error(msg)`, `toast.loading(msg) → id; toast.update(id, ...)`.
- Bottom-right hoặc bottom-center, hỗ trợ dismiss swipe.

#### 3.4 FeatureLock (2h)

`components/ui/FeatureLock.tsx`:
- Props `requiredTier`, `featureName`, `children`.
- Nếu user tier < required → blur children + overlay với CTA "Upgrade Now" → `router.push('/pricing')`.
- Nếu chưa dùng trial → CTA phụ "Start 7-day Free Trial".

#### 3.5 UpgradeModal + Usage Indicator (2h)

`components/ui/UpgradeModal.tsx`:
- Bottom sheet (modal) hiện khi gọi event `open-upgrade-modal`.
- Nội dung mô tả benefits + CTA pricing.

`components/ui/UsageIndicator.tsx`:
- Props `label, used, limit`. Render progress bar.

#### 3.6 Refactor _layout.tsx (2h)
- Wrap: `<AuthProvider><SubscriptionProvider><GradingProvider><Toaster.../>...</...>`.
- Thay thế `Alert.alert` ở các màn hình chính bằng `toast.*` (chỉ vài chỗ critical, không phải tất cả — tốn thời gian; làm dần các phase sau).

**Acceptance**:
- [ ] `useSubscription()` trả về tier đúng sau login.
- [ ] Sau khi upgrade thành công (Phase 12), `refresh()` cập nhật tier.
- [ ] GradingContext: submit 1 bài → toast hiện ở mọi screen.
- [ ] Toast tự ẩn sau 3s (trừ loading).
- [ ] FeatureLock blur child + hiện CTA khi FREE truy cập Advanced.

---

### Phase 4 — IELTS Advanced Statistics page (8h)

**Mục tiêu**: Trang thống kê 4 kỹ năng riêng (mỗi skill có 1 chart band trend + bar correct/total + breakdown question type).

**Tạo mới**:
- `app/ielts/advanced/statistics.tsx` (refactor từ `ielts/statistics.tsx`).

**Mở rộng**:
- `services/ielts.api.ts` `ieltsAdvancedApi.getStatistics()` đã có. Có thể cần thêm filter skill.

**UI**:
- Tab 4 skill.
- Per tab: 
  - Line chart band score theo thời gian (dùng `react-native-svg` đã có).
  - Bar chart correct ratio theo part.
  - Donut chart theo question type (nếu L/R).
- Empty state nếu chưa có data.

**Acceptance**:
- [ ] Chart render mượt < 50ms khi switch tab.
- [ ] Reload khi pull refresh.

---

### Phase 5 — Diagnostic Quiz onboarding (12h)

**Mục tiêu**: Sau khi user đặt mục tiêu (3-step hiện tại), thêm step 4: làm 1 quiz chuẩn đoán → backend recommend roadmap.

**Tạo mới**:
- `app/ielts/onboarding/diagnostic.tsx` — port `DiagnosticQuiz.tsx` từ web.
- `constants/writingClozeData.ts` — port `writingClozeData.ts` (1.3K).

**Mở rộng**:
- `app/ielts/onboarding.tsx` — thêm step 4, sau khi xong gọi `ieltsProfileApi.submitDiagnostic(answers)`.
- `services/ielts.api.ts`:
  ```ts
  submitDiagnostic: (answers: any) => apiClient.post<{ recommendedLevel: string }>('/ielts/diagnostic', answers),
  ```

**Logic**:
- 5-7 câu mixed (1 fill-blank, 1 multi-choice grammar, 1 multi-choice vocabulary, 1 writing cloze ngắn).
- Tính sơ điểm client-side, gửi backend xác nhận và lưu vào `IeltsProfile`.

**Acceptance**:
- [ ] User mới register → vào onboarding → đến step 4 diagnostic.
- [ ] Sau khi xong, redirect `/ielts/roadmap` đã unlock step phù hợp.

---

### Phase 6 — Reading & Listening question type renderers còn thiếu (24h)

**Mục tiêu**: Đảm bảo mobile render đúng 11 reading types + 10 listening types như web.

**Audit** trước khi code (1h):
- So sánh `frontend-web/.../basic/components/reading-renders/` (11 file) vs `frontend-mobile/components/ielts/`.
- Tạo bảng "Có / Không / Khác tên" để xác định cụ thể cần build component nào.

**Question types reading (web)**:
1. DiagramCompletionGroup
2. FlowchartCompletionGroup
3. MCQuestionItem
4. MatchingFeaturesGroup
5. MatchingHeadingsGroup
6. MatchingInformationGroup
7. MatchingSentenceEndingsGroup
8. NoteCompletionGroup
9. ShortAnswerGroup
10. SummaryCompletionGroup
11. TrueFalseNotGivenGroup

**Question types listening (web)**:
1. DiagramLabellingGroup
2. FlowChartCompletionGroup
3. FormCompletionGroup
4. MCMultipleQuestionItem
5. MCQuestionItem
6. MapLabellingGroup
7. MatchingGroup
8. ShortAnswerGroup
9. SummaryCompletionGroup
10. TableCompletionGroup

**Mobile hiện có**: MatchingBlock, DiagramMapBlock, FormCompletionBlock, MCMultipleBlock, MCQ (inline trong [partId].tsx)

**Cần build** (ước lượng):
- TrueFalseNotGivenGroup (RN version): 1h
- ShortAnswerGroup: 1h
- NoteCompletionGroup: 2h (input giữa văn bản)
- SummaryCompletionGroup: 2h
- MatchingHeadingsGroup: 2h
- MatchingFeaturesGroup: 2h
- MatchingSentenceEndingsGroup: 1.5h
- MatchingInformationGroup: 1.5h
- FlowchartCompletionGroup: 2h
- DiagramCompletionGroup: 2h (overlay input lên ảnh)
- TableCompletionGroup: 2h (table với input cell)
- MapLabellingGroup: 2.5h (image với label hot-spot)
- DiagramLabellingGroup: 2h

→ ~24h tổng, tùy độ phức tạp.

**Cấu trúc**:
- Tạo thư mục `components/ielts/question-renders/` (mới).
- Mỗi component nhận `{ group: ContentGroup, answers, onAnswer }` — tương thích với `ContentGroupView.tsx` hiện có.

**Acceptance**:
- [ ] Tất cả lesson Basic + exercise Basic render đúng question type tương ứng (sample test với 10 lesson).
- [ ] Answer được lưu correctly cho mỗi type.

---

### Phase 7 — Shadowing & Dictation polish (16h)

**Mục tiêu**: Đầy đủ flow giống web — import từ YouTube, folder mgmt, polling status.

#### 7.1 Add from YouTube modal (6h)

**Tạo**: `components/shadowing/AddVideoModal.tsx`.
- Inputs: YouTube URL, Title, Category, Folder (dropdown / create new).
- Validate URL (regex YouTube ID), preview thumbnail.
- Submit → `shadowingApi.createVideo` (đã có). Backend sẽ trigger transcription queue.
- Sau submit → toast loading "Importing your video... This may take 1-2 minutes" + close modal.

#### 7.2 Folder management (3h)

**Tạo**: `components/shadowing/FolderPicker.tsx`.
- List folder, chọn / tạo mới.
- API hiện có: `shadowingApi.getFolders`.

#### 7.3 Status polling (4h)

- Trong `app/shadowing/index.tsx`, khi có video `status: 'PROCESSING'` → polling 5s `getVideos` cho đến khi tất cả READY.
- Card UI: show spinner overlay + "Processing... ETA ~1min".
- Toast khi xong: "Your video <title> is ready!" + click → mở.

#### 7.4 Refactor for clarity (3h)

- Tách `app/shadowing/index.tsx` → 2 mode `shadowing` & `dictation` rõ rệt nếu cần, hoặc giữ mode toggle.
- Move common logic sang `hooks/useShadowingLessons.ts`.

**Acceptance**:
- [ ] Tab "My Videos" cho phép add YouTube video.
- [ ] Card hiện PROCESSING spinner → tự update khi xong.
- [ ] Folder hiện đúng, có thể tạo / chọn.
- [ ] Delete video confirm + remove khỏi list.

---

### Phase 8 — Vocab Lab polish (12h)

**Audit** (1h):
- Xem mobile đã có Publish/Import deck modal chưa.

**Nếu THIẾU Publish/Import**:
- `components/vocab-lab/PublishDeckModal.tsx` (4h):
  - Form: title, description, category, visibility (public/private), cover image.
  - Submit → `vocabLabApi.publishDeck(id, payload)`. *Cần verify endpoint backend; nếu chưa có ping user.*
- `components/vocab-lab/ImportDeckModal.tsx` (3h):
  - Browse community, search, preview, "Import to my decks" → `vocabLabApi.importSharedDeck(id)`.

**Stats charts mở rộng** (4h):
- Forecast chart (reviews due 7 ngày tới): SVG line.
- Hourly activity chart: SVG bar.
- Donut DonutCharts mature/young/learning/new.

**Acceptance**:
- [ ] Publish deck đã share lên marketplace.
- [ ] Import deck từ community vào My Decks.
- [ ] Stats có ≥3 chart đầy đủ data.

---

### Phase 9 — Community polish (10h)

#### 9.1 Leaderboard tab (4h)

**Tạo**: trong `app/(tabs)/community.tsx`, thêm tab filter `LEADERBOARD`.
- API: `gamificationApi.getLeaderboard()` — *cần verify endpoint; nếu chưa có ping user.*
- UI: top 10 + rank user hiện tại, avatar + name + XP + level + streak.

#### 9.2 Bookmark / Saved tab (2h)

- Tab "Saved" filter posts đã bookmark.
- Backend: `postsApi.getBookmarks()` — *verify.*

#### 9.3 Image full-screen viewer (2h)

- Tap vào image trong post → mở `react-native-image-zoom-viewer` (đã có dep).
- Modal full-screen, swipe-to-close, pinch-to-zoom.

#### 9.4 My-posts filter (1h)

- Filter `authorId === user.id` client-side hoặc qua API.

#### 9.5 Comment thread polish (1h)

- Verify reply, like comment, delete own comment.

**Acceptance**:
- [ ] 4 tab community: All / Study Tips / Achievements / Leaderboard + filter My / Saved.
- [ ] Tap image → zoom & swipe.
- [ ] Leaderboard refresh khi pull-to-refresh.

---

### Phase 10 — Dictionary Popup + Quick Vocab FAB (10h)

#### 10.1 Dictionary Popup (6h)

**Tạo**: `components/global/DictionaryPopup.tsx`.
- Hiển thị bottom sheet (`react-native-bottom-sheet` *(nếu thêm dep)* hoặc Modal đơn giản).
- 3 tab: VI (Google Translate), EN (DictionaryAPI), AI (Gemini từ backend chat).
- "Add to Vocab Lab" button → mở `GlobalAddCardFab` với prefill.

**Tích hợp**:
- Trong các màn hình `LessonDetailContent`, `ExerciseDetailContent`, `ReadingExamBlock`, `PassageReview`: wrap text với `<TextWithLookup>` component cho phép long-press 1 word.
- `<TextWithLookup>`: text node tách word, mỗi word có `onLongPress` → emit event `open-dictionary` với word + sentence.

#### 10.2 Quick Vocab Add FAB (4h)

**Tạo**: `components/global/GlobalVocabFab.tsx`.
- Draggable FAB (PanResponder).
- Hidden trên các trang practice/take/onboarding.
- Tap → mở `AddCardModal` (port từ `GlobalAddCardFab` đã có).
- Lưu vị trí drag vào AsyncStorage.

**Tích hợp vào `app/_layout.tsx`**:
```tsx
<Toaster />
<GlobalVocabFab />
<DictionaryPopup />
```

**Acceptance**:
- [ ] Long-press 1 word trong bài đọc → popup VI/EN/AI hiện.
- [ ] FAB draggable, không che button khác.
- [ ] FAB ẩn ở exam screen.

---

### Phase 11 — Chat AI streaming + suggestions (12h)

#### 11.1 Streaming response (6h)

- Backend `/chat` endpoint hiện hỗ trợ `stream: false`. Cần check + dùng `stream: true` SSE/chunked.
- Trong `app/chat-ai.tsx`, dùng `fetch` với `ReadableStream` (RN 0.81 support qua `react-native-fetch-api` hoặc native fetch + textDecoder).
- Append từng chunk vào message state.

#### 11.2 Suggestions UI (4h)

- Backend trả `suggestions: [{ id, label, actionType: 'EXPLAIN_NOTE' | 'ADD_VOCAB', payload }]`.
- Render pill button dưới message.
- Tap → trigger handler tương ứng (EXPLAIN_NOTE: send follow-up chat; ADD_VOCAB: open AddCardModal với prefill).

#### 11.3 History persistence (2h)

- Lưu conversation vào AsyncStorage key `chat-ai-history`.
- Show "Clear history" trong header.

**Acceptance**:
- [ ] Khi gửi msg, response stream từng từ.
- [ ] Suggestions hiện và tap được.
- [ ] History persist sau khi đóng app, max 50 message.

---

### Phase 12 — Payment / VNPay return + Cancel UI (8h)

#### 12.1 VNPay open & return handler (5h)

**Trong `app/pricing.tsx`**, button "Upgrade" cho VNPay flow:
```ts
const checkout = await subscriptionsApi.checkout(planId);
// checkout.redirectUrl is the VNPay payment page
const result = await WebBrowser.openAuthSessionAsync(
  checkout.redirectUrl,
  Linking.createURL('payment/vnpay-return')
);
```

**Tạo route**: `app/payment/vnpay-return.tsx`.
- Parse `useLocalSearchParams` → các tham số VNPay.
- Gọi `subscriptionsApi.verifyVnpayReturn(query)` — endpoint tương đương `/subscriptions/vnpay-return` web đang dùng.
- 3 trạng thái: verifying / success / failed.
- Success: refresh `SubscriptionContext`, toast success, redirect `/(tabs)/profile`.
- Failed: toast error, retry CTA.

**App.json scheme**: đã có ở Phase 0 (`iemai://`).

**Linking config trong `app/_layout.tsx`**:
```ts
const linking = {
  prefixes: [Linking.createURL('/'), 'iemai://'],
  config: { screens: { 'payment/vnpay-return': 'payment/vnpay-return' } }
};
```

#### 12.2 Cancel subscription UI (3h)

**Trong `app/(tabs)/profile.tsx`** SubscriptionSection:
- Hiện current plan, next billing, cancel button (chỉ PREMIUM/PRO).
- Modal confirm với reason dropdown.
- API: `subscriptionsApi.cancel(reason)` — đã có.
- Sau cancel: refresh, show toast "Plan will expire on YYYY-MM-DD".

**Acceptance**:
- [ ] Tap Upgrade → mở VNPay browser.
- [ ] User thanh toán xong → app tự return + verify + tier update.
- [ ] Hủy cancel: nhập reason, nhận confirmation, tier không đổi nhưng có badge "Cancels on …".

**Rủi ro**:
- VNPay return URL format. *Cần xác nhận với backend xem cùng endpoint web hay cần endpoint mobile riêng.*

---

### Phase 13 — Profile polish — Avatar upload + Subscription section (6h)

#### 13.1 Avatar upload (3h)

- Trong Profile tab "Account":
  - Tap avatar → ActionSheet (Camera / Gallery / Remove).
  - Dùng `expo-image-picker` (đã có dep).
  - Upload qua `apiClient.postForm('/users/me/avatar', formData)` — *verify endpoint backend.*
  - Update `user.avatar` qua `refreshUser()`.

#### 13.2 Subscription section polish (3h)

- Hiện đủ thông tin từ `SubscriptionContext`: tier badge, next billing date, trial days left, cancel button.
- Layout giống web SubscriptionSection.

**Acceptance**:
- [ ] Avatar update reflect ngay trong header + community.
- [ ] Subscription block đúng theo state.

---

### Phase 14 — Notification badge polling (8h)

#### 14.1 NotificationContext (4h)

`contexts/NotificationContext.tsx`:
- Polling `/notifications/unread-count` mỗi 60s.
- `notifications`, `unreadCount`, `markAsRead`, `markAllAsRead`, `delete`, `refresh`.

#### 14.2 Badge UI (2h)

- Tab bar: thêm badge đỏ trên tab Profile (hoặc tab riêng nếu cần) khi `unreadCount > 0`.
- Header tabs cũng show badge.

#### 14.3 Toast in-app khi receive (2h)

- Khi polling phát hiện notification mới so với lần trước → toast custom + tap → mở notification detail.

**Acceptance**:
- [ ] App khởi động, fetch unread → show badge.
- [ ] Mở notification, mark all → badge biến mất.
- [ ] Re-foreground → refresh.

---

### Phase 15 — Grammar tab refactor (6h)

**Vấn đề**: `app/(tabs)/grammar.tsx` + `app/grammar/[bookSlug].tsx` đang dùng `services/api.ts` (Vietnamese, cũ).

**Cần làm**:
- Migrate sang `grammarApi` trong `features.api.ts`.
- Đồng nhất UI với `vocabulary.tsx`.
- English-first (mobile chung tiếng Anh giống web).
- Verify route `grammar/[bookSlug]/[unitId].tsx`.

**Acceptance**:
- [ ] `services/api.ts` không còn dùng cho grammar (có thể xóa nếu không nơi nào ref).
- [ ] Grammar tab list books → detail → unit list → unit lesson đầy đủ.

---

### Phase 16 — Push notifications (17h)

> **R-02 RESOLVED**: Pattern **Soft-prompt với rationale + delayed ask** (Google-recommended).

#### 16.1 Expo Notifications client + Soft-prompt UX (7h)

**Permission UX pattern** (theo R-02 quyết định):

1. **KHÔNG xin permission ngay** khi user mở app lần đầu.
2. Sau khi user **active 2 phút** (login + 1-2 màn navigated) → hiện in-app banner:
   ```
   ┌──────────────────────────────────────────┐
   │ 🔔 Stay on track with reminders          │
   │                                          │
   │ Enable notifications to get streak       │
   │ reminders & exam results in real-time.   │
   │                                          │
   │   [Enable]            [Maybe Later]      │
   └──────────────────────────────────────────┘
   ```
3. Tap **Enable** → call `Notifications.requestPermissionsAsync()` → system prompt.
4. Tap **Maybe Later** → dismiss banner, lưu `AsyncStorage.setItem('notif-soft-dismissed-at', Date.now())`.
5. **Re-prompt sau 7 ngày** nếu user vẫn dismiss. Tối đa 3 lần re-prompt (sau đó im lặng).
6. Nếu user denied system permission → trong Profile/Settings có "Notifications denied — Open Settings" → `Linking.openSettings()`.

**Code structure**:
- `components/global/NotificationPermissionBanner.tsx` — banner UI + state machine.
- `contexts/NotificationContext.tsx` (đã có từ P14) — thêm `permissionStatus`, `softDismissedAt`, `requestPermission()`.
- `app/_layout.tsx` register push token (chỉ khi permission granted):
  ```ts
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: ... });
    apiClient.post('/users/me/push-token', { token, platform: Platform.OS });
  }
  ```
- Foreground handler: hiện in-app banner thay vì system notification.
- Background tap → deep link route (notification.data.link).

**Android 13+ specific**:
- `app.json` `android.permissions` thêm `POST_NOTIFICATIONS` (đã có từ P18.4).
- Permission request handler chỉ hoạt động trên Android 13+ và iOS — gracefully skip nếu API thấp hơn.

**Tăng từ 16h → 17h** (+1h cho banner soft-prompt + re-prompt logic).

#### 16.2 Backend (8h) — *cần coordinate user*

- `backend-core` thêm model `PushToken` (user_id, token, platform, lastUsed).
- Endpoint `POST /users/me/push-token`, `DELETE /users/me/push-token/:id`.
- `notifications.service.ts` mở rộng: khi tạo notif → gửi push via Expo Push API.
- Cron: cleanup token > 90 ngày không dùng.

#### 16.3 Test E2E (2h)

- Trigger streak milestone → notif đến.
- Trigger exam graded → notif đến với link result.
- Test banner UX flow: dismiss → re-prompt sau 7 ngày (mock thời gian).
- Test denied state → Settings deep-link works.

**Acceptance**:
- [ ] Background notif gõ vào → mở app đúng screen.
- [ ] Foreground notif → toast in-app.
- [ ] Permission banner xuất hiện sau 2 phút active.
- [ ] Tap Later → dismiss + lưu timestamp; re-prompt sau 7 ngày.
- [ ] Denied → Settings link works.

**Rủi ro**:
- FCM cần config Google Services. *Hỏi user.*
- iOS APN cần Apple Developer account + cert. *DEFERRED Phase 19* (theo R-01).

---

### Phase 17 — Dark mode toàn app (24h)

**Mục tiêu**: Style system mới với theme tokens, ThemeContext, refactor mọi component.

#### 17.1 Token system (3h)

- `constants/theme.ts`:
  ```ts
  export const LIGHT_TOKENS = { bg: '#fff', text: '#212529', ... }
  export const DARK_TOKENS = { bg: '#0f172a', text: '#f1f5f9', ... }
  ```
- `useTheme()` hook trả token hiện tại.

#### 17.2 ThemeContext (2h)

- `theme: 'light' | 'dark' | 'system'`, persist AsyncStorage.
- `Appearance.addChangeListener` cho mode `system`.

#### 17.3 Refactor 18 file chính (16h)

- Replace inline hex colors với `theme.bg`, `theme.text`, etc.
- Mỗi file ~30-60 phút. ~30 file cần touch.

#### 17.4 Toggle UI (1h)

- Profile settings: 3 option Light / Dark / System.

#### 17.5 Test (2h)

- Mọi screen render đẹp ở cả 2 mode.

**Acceptance**:
- [ ] Toggle dark mode → toàn app đổi theme.
- [ ] No flash khi reload.

---

### Phase 18 — QA, polish, performance, **Android release** (16h)

> **Scope**: Chỉ release Android (theo quyết định R-01). iOS deferred sang **Phase 19** (xem dưới).
> Giảm từ 18h → 16h vì skip iOS-specific items (TestFlight, Apple cert, iOS-only screenshots).

#### 18.1 Performance (6h)
- React.memo các block exam.
- `useMemo` cho list filter/sort.
- Lazy load video/audio (`expo-video` poster).
- Image caching (`expo-image` cache policy).
- Reduce bundle size: tree-shake icons, remove unused.

#### 18.2 Error tracking (2h)
- Optional: Sentry hoặc Bugsnag. Hỏi user.

#### 18.3 EAS Build Android (2h)
- `eas.json`: preview + production profile cho `platform: android`.
- Build Android AAB.
- Internal track Play Console test.

#### 18.4 Play Store metadata + Privacy + Permission (4h)

**Tăng từ 2h → 4h vì Play Store yêu cầu khắt khe** (Data Safety, Account Deletion).

1. **Android permissions** `app.json` `android.permissions` (0.5h):
   - `RECORD_AUDIO`, `INTERNET`, `READ_EXTERNAL_STORAGE`, `POST_NOTIFICATIONS` (Android 13+).
   - Permission rationale strings (Android 13+ user-facing).

2. **iOS permission strings sẵn sàng** (0.5h) — chuẩn bị cho P19:
   - Vẫn add `NSMicrophone/NSCamera/NSPhotoLibraryUsageDescription` trong `app.json` `ios.infoPlist` để khỏi quên — chưa cần build iOS.

3. **Privacy Policy URL** (1h):
   - Nếu web chưa có `/privacy` page → coordinate user/web team viết.
   - Cover: data collected (email, audio, images), retention, third-party (Cloudinary, Gemini API, RabbitMQ), user rights (delete account), contact email.
   - Host tại `ielts-master.io.vn/privacy`.
   - Submit URL trong Google Play Console + reuse cho App Store sau (P19).

4. **Account Deletion compliance** (0.5h):
   - Google Play yêu cầu (from 2024) bắt buộc in-app + web delete account → P13 đã có in-app.
   - Document trong Play Console "Data Safety" section.

5. **Play Store listing** (1.25h):
   - App name, short description (80 char), full description ≥500 words EN.
   - Category: Education. Content rating: Everyone.
   - Screenshots: Pixel 7 Pro (Android primary). Bonus: tablet 7" + 10".
   - App icon 512×512 (Play Store), feature graphic 1024×500.
   - Data Safety form trong Play Console (data collected, encryption, sharing).

6. **`eas.json` config Android** (0.25h):
   ```json
   {
     "build": {
       "preview": { "distribution": "internal" },
       "production": {
         "android": { "buildType": "app-bundle", "resourceClass": "medium" }
       }
     }
   }
   ```

#### 18.5 Final E2E test Android (2h)
- 1 user mới: register → onboarding → diagnostic → roadmap → 1 lesson → 1 mock test → 1 advanced Writing → result.

**Acceptance Phase 18 (Android-only)**:
- [ ] Cold start < 3s trên Pixel 5.
- [ ] No crash trong 30 phút usage.
- [ ] EAS Build Android AAB success.
- [ ] Play Console Internal Track có app, tester có thể download.
- [ ] Data Safety form submitted.

---

### Phase 19 — iOS launch with IAP (24h, DEFERRED)

> **Trigger**: Sau khi Android live ổn định + có metrics/feedback. KHÔNG nằm trong tổng 306h chính.
> Mua Apple Developer Program ($99/year) trước khi bắt đầu.

#### 19.1 Apple In-App Purchase integration (16h)

1. **Cài + setup `expo-in-app-purchases`** (2h):
   ```bash
   npx expo install expo-in-app-purchases
   ```
   - App Store Connect: tạo Auto-Renewable Subscription products (Premium-Monthly, Premium-Yearly, Pro-Monthly, Pro-Yearly).
   - Set price tier match với VNPay USD pricing.

2. **Client purchase flow** (5h):
   - Service `iapService.ts`: `getProducts()`, `purchase(productId)`, `restorePurchases()`.
   - UI trong `pricing.tsx`: detect platform → iOS show IAP buttons, Android giữ VNPay.
   - Receipt validation: send receipt → backend verify với Apple Receipt Verification API.

3. **Backend receipt verification** (6h):
   - Endpoint `POST /subscriptions/ios-verify-receipt`.
   - Service gọi Apple `verifyReceipt` API.
   - Lưu `iosTransactionId` vào `Subscription` model (Prisma migration nhỏ).
   - Webhook handler cho server-to-server notifications (renewal, cancel).

4. **Restore purchases UI** (1.5h):
   - Profile → "Restore Purchases" button (Apple yêu cầu).
   - Sync subscription state sau restore.

5. **Sandbox test** (1.5h):
   - Test purchase với sandbox tester.
   - Test cancel, restore, family share.

#### 19.2 iOS Build + App Store Connect (4h)

1. **Apple Developer setup** (1h):
   - Apple Dev account verify.
   - APN key tạo + add vào EAS.
   - Bundle identifier register.

2. **EAS Build iOS** (1h):
   - `eas.json` iOS profile.
   - Build production IPA.

3. **TestFlight** (1h):
   - Upload qua EAS Submit hoặc Transporter.
   - Internal tester group.

4. **App Store Connect listing** (1h):
   - Reuse Privacy Policy URL.
   - iOS screenshots (6.5" iPhone, 5.5" iPhone).
   - App Privacy questionnaire.
   - Submit for review.

#### 19.3 iOS QA (4h)

1. **iOS-specific bug fix** (3h):
   - Safe area edge cases.
   - Keyboard behavior (KeyboardAvoidingView padding tweaks).
   - Audio session interruption (call coming in mid-recording).
   - Background app refresh.

2. **App Review preparation** (1h):
   - Demo account credentials cho reviewer.
   - Notes giải thích VNPay (Android) vs IAP (iOS) clearly.
   - Screencast 30s flow chính.

**Acceptance Phase 19**:
- [ ] IAP purchase + restore flow works in sandbox.
- [ ] Receipt verification reliable (test 10+ purchases).
- [ ] iOS Build pass TestFlight.
- [ ] App Store review pass (rejection rate cao lần đầu — buffer 1-2 lần resubmit).

---

## 6. Phụ thuộc giữa các phase

```
Phase 0 (Chuẩn bị)
  └─→ Phase 0.5 (Code Cleanup — bắt buộc xong trước khi build feature mới)
        ├─→ Phase 1 (Writing)
        │     └─→ Phase 2 (Speaking)
        │           └─→ Phase 3 (Infrastructure)
        │                 ├─→ Phase 4 (Statistics)
        │                 ├─→ Phase 7 (Shadowing polish)
        │                 ├─→ Phase 8 (Vocab Lab polish)
        │                 ├─→ Phase 9 (Community)
        │                 ├─→ Phase 10 (Dictionary + FAB)
        │                 ├─→ Phase 11 (Chat AI)
        │                 ├─→ Phase 12 (Payment)
        │                 │     └─→ Phase 13 (Profile)
        │                 └─→ Phase 14 (Notification badge)
        │                       └─→ Phase 16 (Push)
        ├─→ Phase 5 (Diagnostic Quiz) [độc lập]
        ├─→ Phase 6 (Q-type renderers) [độc lập]
        ├─→ Phase 15 (Grammar refactor — xóa luôn services/api.ts) [độc lập]
        └─→ Phase 17 (Dark mode) [sau khi đủ feature]
              └─→ Phase 18 (Android Release)
                    └┄┄→ Phase 19 (iOS launch + IAP) [DEFERRED, trigger sau khi Android live ổn định]
```

---

## 7. Rủi ro & giả định

### Rủi ro kỹ thuật
1. **Backend endpoint chưa đủ** cho Advanced Writing/Speaking → có thể web đang call endpoint khác/mock. Phase 1 cần verify với `backend-core`.
2. **`expo-video` API changes** SDK 54 → autoplay iOS rule khắt khe. Cần test mute-then-unmute pattern.
3. **`expo-speech-recognition`** trên Android có thể không ổn → fallback dùng audio-only.
4. **Background recording iOS** — nếu user lock màn khi đang record → có thể bị cắt. Block lock bằng `expo-keep-awake`.
5. **VNPay deep-link** — định dạng URL không chuẩn web có thể không match scheme app.
6. **Push notification cert** iOS — cần Apple Dev account.

### Rủi ro non-tech
1. Workload solo Android-first 308h ≈ 38.5 ngày fulltime (8h/ngày). Nếu 4h/ngày → ~77 ngày (~2.5–3 tháng). Phase 19 (iOS) +24h.
2. Backend cần coordinate ở Phase 12 (VNPay) và Phase 16 (Push).
3. Phase 19 chỉ trigger khi Android live ổn định — tránh dàn trải resource.

### Giả định
1. `backend-core` đã có toàn bộ endpoint web đang dùng (Advanced Writing/Speaking submit, Foundation progress endpoints).
2. Cloudinary đã config cho audio upload từ mobile (boto3 fallback fetch HTTP).
3. `dedangdown.io.vn` SSL OK, app gọi qua HTTPS.
4. Mobile build target: iOS 14+ / Android 11+ (matching Expo SDK 54).

### 🚨 Risk Register — Quyết định đã chốt + còn lại

> Cập nhật 2026-05-21: **R-01, R-02, R-04, R-05, R-06 đã được quyết định.**

| ID | Risk | Severity | Status | Phase ảnh hưởng | Mô tả | Mitigation / Decision |
|---|---|---|---|---|---|---|
| **R-01** | Apple App Store IAP rejection | HIGH | ✅ **DECIDED → Option (a)** | P12, P18, P19 (mới) | Apple Guideline 3.1.1 yêu cầu IAP. VNPay-only có nguy cơ bị reject. | **CHỐT: Release Android trước.** iOS deferred sang **Phase 19** (mới, +24h, không tính vào tổng chính). |
| **R-02** | Android 13+ POST_NOTIFICATIONS permission | MEDIUM | ✅ **DECIDED → Soft-prompt** | P16 | Android 13+ yêu cầu xin quyền runtime. Nếu từ chối, không gửi được notif. | **CHỐT: Soft-prompt sau 2 phút active + rationale banner.** Re-prompt sau 7 ngày nếu dismissed. P16 +1h cho banner UX. |
| **R-03** | iOS APN cert + provisioning | LOW (deferred) | DEFERRED | P19 | Vì iOS lùi xuống Phase 19, Apple Dev account chỉ cần khi tới P19. | Mua Apple Developer Program ($99/year) trước khi bắt đầu P19. |
| **R-04** | `backend-core` endpoint thiếu cho Foundation | MEDIUM → LOW | ✅ **RESOLVED** | P0.5.8 | Backend đầy đủ. 1 khác biệt: `/pronunciation/progress/stats` (không phải `/stats`). Bonus endpoint `/pronunciation/sounds/:soundId/word-progress`. | URL stats đã sửa trong plan. Bonus endpoint dùng ở P05-71b (+1h). |
| **R-05** | Advanced Writing/Speaking endpoint khác web | MEDIUM | ✅ **RESOLVED** | P1, P2 | **Backend audit (2026-05-21)**: dùng **2-step session flow** (create → submit), có **autosave draft**, có dedicated `/speaking/stats`. Plan ban đầu submit-direct là SAI. | Plan đã cập nhật theo backend. P1 24h → 26h, P2 32h → 34h (+4h total). Bonus features: autosave + Speaking stats. |
| **R-06** | Foundation Vocabulary Unit gap | LOW | ✅ **RESOLVED** | P0.5.10 | **Audit backend**: chỉ 2 question type (`multiple_choice`, `fill_blank`) — đơn giản hơn dự kiến. Mobile đã có FlashCard SRS. | P0.5.10 giảm 2h → 1h (verify 2 type render). Không cần Phase 5.5. |
| **R-07** | EAS Build account & quota | LOW | OPEN | P18 (Android) | EAS free tier 30 build/month. Đủ cho dev nhưng release Android cần Production plan ($29/mo). | Mua plan trước P18. |
| **R-08** | Cloudinary mobile upload size limit | LOW | OPEN | P1, P2, P13 | Audio Speaking + avatar upload có thể >5MB. | Compress audio trước upload (wav → m4a). Optional optimization. |
| **R-09** | `react-native-reanimated` v4 + worklets stability | LOW | OPEN | All animation phases, P17 | v4 mới, có thể crash Android < 8. | Test trên 3 device khác nhau. QA Phase 18. |
| **R-10** | Mobile bundle size > 50MB warning | LOW | OPEN | P18 (Android), P19 (iOS) | Nhiều dep heavy. Android AAB split ít issue hơn iOS. | Bundle analyze ở P18. |

> **✅ Action items đã chốt (6 risks)**:
> - **R-01**: Android-first. Phase 18 chỉ Android. Phase 19 (iOS + IAP) deferred.
> - **R-02**: Soft-prompt permission pattern + 7-day re-prompt (Phase 16 +1h).
> - **R-04**: Backend đầy đủ. URL stats đã sửa + bonus `word-progress` endpoint.
> - **R-05**: Backend dùng 2-step session flow + autosave + Speaking stats. Plan P1/P2 đã cập nhật (+4h).
> - **R-06**: Backend chỉ 2 question type. P0.5.10 đã giảm 1h. Không cần Phase 5.5.

> **⏳ Còn lại 4 risks (R-03, R-07, R-08, R-09, R-10)** — chủ yếu là chi tiết kỹ thuật khi tới phase tương ứng, không blocker.

---

## 8. Tổng ước lượng

| Cấp độ | Giờ | Ngày fulltime (8h) |
|---|---|---|
| **Setup + Cleanup (Phase 0, 0.5)** | 43h | 5.4 ngày |
| **Core + Priority (Phase 1–6)** | 120h | 15 ngày |
| **Infra + Polish (Phase 7–14)** | 82h | 10.25 ngày |
| **Refactor + Android Release (Phase 15–18)** | 63h | 7.9 ngày |
| **TỔNG Android-first** | **~308h** | **~38.5 ngày** |
| Phase 19 (iOS launch + IAP — deferred) | +24h | +3 ngày |
| **TỔNG cả 2 platform** | **~332h** | **~41.5 ngày** |

Nếu làm part-time 4h/ngày: Android-first **~77 ngày** (~11 tuần); cả 2 platform **~83 ngày** (~12 tuần).

> **ROI Phase 0.5**: 39h đầu tư cleanup + Foundation parity ước tính tiết kiệm 40–60h trong các phase sau. Net giảm ~10–20h tổng.

> **Strategy Android-first**: Phase 18 release Android trước → launch + thu feedback trong ~38.5 ngày fulltime. Phase 19 trigger sau khi product ổn định.

> **Lịch sử thay đổi estimate**:
> - Baseline ban đầu: 264h (chưa cleanup).
> - +24h cleanup Phase 0.5 → 288h.
> - +16h Foundation API parity (0.5.7-0.5.10) + 2h Privacy/Permission expansion → 306h.
> - R-01 = Android-first → Phase 18 16h (giảm 2h), thêm Phase 19 deferred 24h → 304h Android-only.
> - R-04 audit: +1h bonus word-progress → 305h. R-06 audit: -1h → 304h.
> - R-02 (soft-prompt UX): +1h → 305h. R-05 (2-step session + autosave): +4h → **308h Android-first**.

---

## 9. Định nghĩa "Done"

Một phase được coi là DONE khi:
1. Tất cả file trong "Files" của phase được tạo / sửa và commit.
2. Tất cả checkbox "Acceptance" của phase được tick.
3. `npm run start` chạy không error.
4. `tsc --noEmit` pass.
5. Manual test trên 1 device thật (iOS + Android nếu có).
6. Update `tasks.md` đánh dấu tasks completed.
7. Update `CLAUDE.md` (nếu có pattern mới quan trọng — tùy chọn).

---

## 10. Phụ lục — File mới cần tạo (tổng hợp)

```
.eslintrc.js                                                    [P0.5]
.prettierrc                                                     [P0.5]
.prettierignore                                                 [P0.5]
constants/routes.ts                                             [P0.5]
components/ErrorBoundary.tsx                                    [P0.5]
components/profile/AccountTab.tsx                               [P0.5]
components/profile/StatsTab.tsx                                 [P0.5]
components/profile/SettingsTab.tsx                              [P0.5]
components/community/PostCard.tsx                               [P0.5]
components/community/CreatePostModal.tsx                        [P0.5]
components/community/CommentSheet.tsx                           [P0.5]
components/community/Avatar.tsx                                 [P0.5]
components/foundation/IpaChart.tsx                              [P0.5]
components/foundation/ProgressSummary.tsx                       [P0.5]
hooks/useShadowingMode.ts                                       [P0.5]
lib/exam-parser.ts                                              [P0.5]

services/iap.service.ts                                         [P19, deferred]
app/(future-iOS)/restore-purchases.tsx                          [P19, deferred]

contexts/
  SubscriptionContext.tsx                                       [P3]
  GradingContext.tsx                                            [P3]
  NotificationContext.tsx                                       [P14]
  ThemeContext.tsx                                              [P17]

components/ui/
  Toaster.tsx                                                   [P3]
  FeatureLock.tsx                                               [P3]
  UpgradeModal.tsx                                              [P3]
  UsageIndicator.tsx                                            [P3]

components/ielts/
  AdvancedWritingPromptCard.tsx                                 [P1]
  SpeakingPartCard.tsx                                          [P2]
  question-renders/{TrueFalseNotGiven,NoteCompletion,...}.tsx   [P6]

components/global/
  DictionaryPopup.tsx                                           [P10]
  GlobalVocabFab.tsx                                            [P10]

components/shadowing/
  AddVideoModal.tsx                                             [P7]
  FolderPicker.tsx                                              [P7]

components/vocab-lab/
  PublishDeckModal.tsx                                          [P8]
  ImportDeckModal.tsx                                           [P8]

components/
  SpeakingDeviceTest.tsx                                        [P2]

app/ielts/advanced/
  writing/index.tsx                                             [P1]
  writing/[promptId].tsx                                        [P1]
  writing/result/[sessionId].tsx                                [P1]
  speaking/index.tsx                                            [P2]
  speaking/[partId].tsx                                         [P2]
  speaking/result/[sessionId].tsx                               [P2]
  statistics.tsx                                                [P4]

app/ielts/onboarding/diagnostic.tsx                             [P5]

app/payment/vnpay-return.tsx                                    [P12]

constants/
  theme.ts                                                      [P17]
  writingClozeData.ts                                           [P5]

hooks/
  useShadowingLessons.ts                                        [P7]
```

---

> **Tiếp theo**: Xem `tasks.md` để theo dõi từng task cụ thể trong mỗi phase.
