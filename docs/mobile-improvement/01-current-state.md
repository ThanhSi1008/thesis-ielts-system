# Báo Cáo Thực Trạng UI/UX — Frontend Mobile

> **Ngày báo cáo**: 2026-05-22
> **Phạm vi**: Toàn bộ `frontend-mobile/` (Expo SDK 54 / RN 0.81 / Expo Router 6 / NativeWind 4)
> **Mục tiêu báo cáo**: Làm rõ thực trạng UI/UX hiện tại, làm cơ sở cho `02-improvement-plan.md` và `03-implementation-phases.md`
> **Tham chiếu**: [`../mobile-development/review-phase-0-to-17.md`](../mobile-development/review-phase-0-to-17.md), [`../mobile-development/tasks.md`](../mobile-development/tasks.md)

---

## 1. Tóm tắt điều hành (TL;DR)

| Hạng mục | Điểm hiện tại | Mục tiêu |
|---|---|---|
| **Functional parity với web** | 🟢 ~95% | Maintain |
| **Design system thống nhất** | 🟠 ~55% | 95% |
| **Brand consistency** | 🟠 Trộn 4 brand palette khác nhau | Single brand: Yellow `#FFC600` |
| **Component reusability** | 🟠 ~40% (nhiều inline styles, ít atoms) | 80% |
| **Dark mode coverage** | 🟢 ~95% (đã done P17) | Maintain |
| **Accessibility (a11y)** | 🔴 ~20% (thiếu label/role/hint) | 80% |
| **Animation polish** | 🟠 Reanimated có cài nhưng dùng ít | 70% |
| **Loading/empty/error UX** | 🟠 Chủ yếu `ActivityIndicator` + `Alert` | Skeleton + illustrated empty states |
| **Performance / file size** | 🟠 4 file >700 lines, 2 file >32K | Tách dưới 500 lines/file |

**Kết luận**: App đã có **kiến trúc tốt và feature đầy đủ**, nhưng **lớp visual + interaction polish còn yếu** — đây chính là khoảng cách giữa "chạy được như web" và "trải nghiệm mobile xuất sắc".

---

## 2. Cấu trúc nguồn hiện tại

### 2.1 Sơ đồ thư mục chính

```
frontend-mobile/
├── app/                                 # Expo Router (69 routes)
│   ├── (auth)/        login • register
│   ├── (tabs)/        index • explore • ielts • community • profile • + 5 hidden
│   ├── ielts/         advanced/* • basic/* • intensive/* • grammar/* • pronunciation/*
│   │                  + onboarding • dashboard • history • statistics • roadmap • calculator
│   ├── vocab-lab/     index • [deckId] • study/
│   ├── vocabulary/    index • [bookSlug] • [bookSlug]/[unitId]
│   ├── grammar/       index • [bookSlug] • [bookSlug]/[unitId]
│   ├── shadowing/     index • [lessonId]
│   ├── student-teacher/   index • [studentId]
│   ├── payment/       vnpay-return
│   └── chat-ai • exams • notification • pricing • results
├── components/                          # 89 components
│   ├── community/     PostCard • CreatePostModal • CommentSheet • Avatar • Leaderboard
│   ├── foundation/    IpaChart • ProgressSummary
│   ├── global/        DictionaryPopup • GlobalVocabFab • NotificationPermissionBanner • TextWithLookup
│   ├── ielts/         22 exercise renderers + 17 main blocks
│   ├── profile/       AccountTab • StatsTab • SettingsTab
│   ├── shadowing/     AddVideoModal • FolderPicker
│   ├── vocab-lab/     14 components (Decks/Add/Browse/Stats/Marketplace + sub)
│   ├── ui/            AppButton • AppTextInput • AudioPlayer • FeatureLock • SharedDrawer
│   │                  • Toaster • UpgradeModal • UsageIndicator
│   ├── voice/         RecordButton • Waveform • feedback/
│   ├── Card.tsx • ErrorBoundary.tsx • ErrorView.tsx • LoadingSpinner.tsx
│   ├── SpeakingDeviceTest.tsx • ui.tsx (LEGACY)
│   └── index.ts
├── contexts/      Auth • Grading • Notification • Subscription • Theme  (5 ctx)
├── hooks/         useApi • useAudioRecorder • useGradingPoll • usePronunciationChecker
│                  useShadowingLessons • useShadowingMode • useTimer • useWritingAutosave
├── services/      api-client • auth • features • ielts • learning • notes • posts (+ index)
├── constants/     index • theme • routes • ieltsQuestionTypes • writingClozeData
├── utils/         answerNormalization • timeAgo
├── lib/           exam-parser
└── types/         (truncated)
```

### 2.2 Stack chính

| Lớp | Thư viện |
|---|---|
| **Framework** | Expo SDK 54, React Native 0.81.5, React 19.1, Expo Router 6 |
| **Styling** | NativeWind 4 (Tailwind for RN) + StyleSheet API + design tokens (`constants/theme.ts`) |
| **State** | Context API (5) + Zustand 5 (cài nhưng chưa rộng rãi) |
| **Animation** | React Native Reanimated 4.1 + Worklets + Animated API |
| **Media** | expo-audio • expo-video • expo-image • expo-speech-recognition |
| **UI primitives** | `@expo/vector-icons` 15 • react-native-svg 15 • LinearGradient |
| **Forms** | TextInput thuần + state manual (chưa có form library) |
| **Networking** | Custom `fetch` wrapper (`services/api-client.ts`) với AsyncStorage JWT |

---

## 3. Đánh giá Design System

### 3.1 Theme tokens — **🟢 Tốt**

`constants/theme.ts` định nghĩa **22 tokens** đầy đủ cho cả 2 mode:

```ts
LIGHT_TOKENS = { primary:'#FFC600', background:'#FFFFFF', text:'#212529',
                 textSecondary:'#64748B', card:'#FFFFFF', border:'#E2E8F0', ... }
DARK_TOKENS  = { primary:'#FFC600', background:'#0F172A', text:'#F8FAFC',
                 textSecondary:'#94A3B8', card:'#1E293B', border:'#334155', ... }
```

✅ `ThemeContext` exposed `colors`, `isDark`, `resolvedTheme`, `setTheme` — pattern chuẩn.
✅ Dark mode tokens passes WCAG AA (textMuted Slate 400 đã bumped).

### 3.2 **🔴 Vấn đề lớn: HAI nguồn truth song song**

| Source | Cách dùng | Vấn đề |
|---|---|---|
| `COLORS` từ `constants/index.ts` | Static hard-coded, không theme-aware | Vẫn được import ở **>80 file**, kể cả screen mới |
| `useTheme().colors` từ `ThemeContext` | Theme-aware, đúng pattern | Mới chỉ thay thế ở phần được refactor P17 |

**Hệ quả thực tế**:
- `app/(auth)/login.tsx` import `COLORS` → **không đổi theo theme** (login luôn light, ngay cả khi system dark)
- `components/ui.tsx` (legacy) export `Button/Badge/Chip/Score…` tất cả dùng `COLORS` static
- `components/ui/AppButton.tsx` (mới) dùng NativeWind class `bg-blue-600` — **xung đột brand** (yellow `#FFC600` chính thức)

### 3.3 Spacing/Radius/Typography scales — **🟠 Có nhưng dùng thiếu nhất quán**

```ts
SPACING = { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32, xxxl:40 }
RADIUS  = { sm:4, md:6, lg:8, xl:12, full:9999 }
FONT_SIZES = { xs:12, sm:14, base:16, md:16, lg:18, xl:20, xxl:24, xxxl:30, xxxxl:36 }
```

**Quan sát**:
- `RADIUS.xl = 12` nhưng nhiều screen hard-code `borderRadius: 16/20/22/28/32` (Library `32`, Explore featured `20`, FAB `28`).
- `FONT_SIZES.xxxxl = 36` nhưng Home dùng `fontSize: 42` raw, Library dùng `32` raw, Explore dùng `28` raw — không có **display scale** chính thức.
- `SPACING.lg = 16` thường được dùng đúng, nhưng `paddingHorizontal: 20/24` raw vẫn xuất hiện rải rác.

### 3.4 Brand palette — **🔴 Mixed**

| Vùng | Màu thực tế dùng |
|---|---|
| Primary brand | Yellow `#FFC600` |
| Login button | Yellow `#FFC600` với text `#FFFFFF` (low contrast!) |
| `AppButton` mới | **Blue `#2563EB`** (NativeWind `bg-blue-600`) ❌ |
| Tab bar active | Yellow `#FFC600` |
| Explore feature card | Slate gradient `#1E293B → #0F172A` |
| Lexon AI FAB | Gemini gradient (Blue/Purple/Red) |
| Vocab Lab card | Rose `#E11D48` |
| Pronunciation card | Purple `#8B5CF6` |
| Notification banner | Blue `#3B82F6` (có comment giải thích) |
| Skill colors | L `#E11D48` • R `#2563EB` • W `#D97706` • S `#7C3AED` |

→ Tone tổng thể bị "rainbow" — thiếu một **visual signature** rõ ràng để app dễ nhận diện.

### 3.5 Component library — **🟠 Phân mảnh**

| Atom | Tình trạng |
|---|---|
| `Button` (legacy `ui.tsx`) | 5 variants, theme-unaware (dùng `COLORS`) |
| `AppButton` (mới `ui/AppButton.tsx`) | 3 variants, NativeWind, **brand sai (blue)** |
| `Badge` | Có nhưng ít dùng — nhiều screen tự tạo badge inline |
| `Chip` | Có nhưng nhiều screen vẫn tự build chip riêng |
| `Card` | Chỉ 1.1K file, gần như rỗng |
| `Input/TextInput` | `AppTextInput` (NativeWind) + `TextInput` thuần inline khắp nơi |
| `Skeleton` | **KHÔNG CÓ** — chỉ dùng `<ActivityIndicator>` |
| `Avatar` | Chỉ trong community, không phải atom dùng chung |
| `Modal` standard | Không có wrapper — mỗi modal tự `Modal` + animation |
| `BottomSheet` | Không có — modal dùng kiểu fullscreen / centered |
| `Toast` | ✅ Có `Toaster` (custom on top of `react-native-toast-message`) |

---

## 4. Đánh giá UI screen-by-screen

### 4.1 Home tab (`app/(tabs)/index.tsx`, 8.4K)

**Điểm tốt**:
- Hero title 42px lớn, kéo attention
- 2 ảnh decorative floating với glow effect
- Notification badge tích hợp đúng

**Vấn đề**:
- Background image full screen với opacity 0.6 + 2 layer LinearGradient → render nặng + có thể không cần
- Title 42px hard-coded (không theo `FONT_SIZES`)
- Subtitle text `#D1D5DB` hard-coded, không react theo theme
- Chỉ 1 CTA "START LEARNING" → user không biết phải làm gì tiếp theo
- Thiếu **quick actions** (Continue lesson / Today's goal / Daily streak)
- Thiếu **personalization** (chào tên user, recent activity, recommended)
- Không có **scroll-aware header** (header transparent → khi scroll vẫn nguyên)
- Background `#000` đè lên dark theme → home luôn dark, không react theme

### 4.2 Explore tab (`app/(tabs)/explore.tsx`, 8.1K)

**Điểm tốt**:
- Featured banner Vocab Lab với gradient slate
- Module list 5 cards với gradient icons riêng
- Có dùng `useTheme().colors` cho card bg

**Vấn đề**:
- "FEATURED" banner hard-code dark slate `#1E293B` ngay cả ở light mode → ổn nhưng không khớp brand
- Subtitle module text chỉ 13px, lineHeight 18 → đôi khi quá đặc
- Layout hơi đơn điệu: header + 1 banner + list. Có thể thêm "Continue learning" / "Recommended for you"
- ListItem chevron không có visual affordance touch (no ripple/scale on press)

### 4.3 IELTS tab (`app/(tabs)/ielts.tsx`, 5.0K) + `LibraryContent.tsx`

**Điểm tốt**:
- Drawer nav clean (`SharedDrawer`) với 10 NAV_ITEMS chuẩn
- LibraryContent dùng `FadeInDown` reanimated, có SVG progress circle
- 4 skill cards (L/R/W/S) với theme color + bg `#FAF7F2` (kem nhẹ)

**Vấn đề**:
- **LibraryContent hard-code bg `#FAF7F2`** ở light, nhưng dark mode card vẫn trông kem → mismatch
- "Bookmarks" card hard-code `#E5ECEE` border `#668B98` → light-only colors
- Header chỉ "Library" — thiếu subtitle / level / progress overview
- Progress circle dùng baseColor `+ '1A'` (10% opacity) → thấy được nhưng không elegant
- Skill card 4 ô vuông kế tiếp → có thể tách layout 2x2 trên tablet

### 4.4 Profile tab (`app/(tabs)/profile.tsx`, 22.8K)

**Điểm tốt**:
- Đã decompose thành 3 sub-tabs (`AccountTab`/`StatsTab`/`SettingsTab`)
- Avatar upload UX chỉn chu
- Subscription tier/status badge có

**Vấn đề**:
- File shell vẫn 22.8K → còn quá nhiều logic state ở root
- Avatar upload ActionSheet xài `Alert` style → có thể nâng cấp lên custom bottom sheet
- Stats tab chỉ 4.1K — quá ít, thiếu visual (chart, progress bar)
- Settings dùng switch toggle thẳng → thiếu illustration / mô tả tính năng

### 4.5 Community tab (`app/(tabs)/community.tsx`, 11.2K)

**Điểm tốt**:
- Tab filter top, posts list, leaderboard
- PostCard có ImageZoom integration

**Vấn đề**:
- "Create post" FAB không thấy nổi bật
- Comment sheet dùng modal fullscreen — chiếm hết màn hình thay vì sheet 60%
- Post empty state thiếu illustration / CTA

### 4.6 Vocabulary tab (`app/(tabs)/vocabulary.tsx`, 9.7K)

**Điểm tốt**:
- Mỗi book có gradient cover (`BOOK_THEMES` 4 tone)
- Progress %, total units, word count hiển thị đầy đủ

**Vấn đề**:
- `BOOK_THEMES` hard-code light gradient → trông kỳ trên dark mode
- Card không có cover image / illustration → chỉ icon + gradient block

### 4.7 Grammar tab (`app/(tabs)/grammar.tsx`, 9.4K)

Tương tự Vocabulary — đã refactor API call, nhưng visual giống hệt cấu trúc.

### 4.8 Login screen (`app/(auth)/login.tsx`, 7.2K)

**Vấn đề nghiêm trọng**:
- **Pre-filled credentials `test1@gmail.com` / `123456`** → dev artifact, MUST remove trước release
- Dùng `COLORS` static → không react theme (luôn light, ngay cả khi system dark)
- Button text `#FFFFFF` trên background yellow `#FFC600` → contrast 1.96:1, **fail WCAG AA**
- Input không có icon prefix (mail icon, lock icon)
- Không có "Show/Hide password" toggle
- Không có "Remember me"
- Không có "Forgot password?" link
- Lỗi validation chỉ qua Toast → thiếu inline error UI

### 4.9 IELTS Intensive `[examId].tsx` (74.7K) — **🔴 File khổng lồ**

- 1 file ~2000 lines chứa: exam state machine + timer + answer state + audio player + UI exam blocks dispatcher
- Khả năng có duplicate logic / styling
- Khó maintain, khó test, khó memoize → có thể gây giật khi scroll dài

### 4.10 Calculator (`app/ielts/calculator.tsx`, 32K)

- File 32K duy nhất → có thể chứa nhiều helper inline + UI
- Visual có khả năng chưa được polish (raw input + result display)

### 4.11 Statistics (`app/ielts/advanced/statistics.tsx`, 36.5K)

- Lớn nhất — SVG charts (line/bar/donut) inline
- Có nguy cơ render chậm trên mid-range Android device

---

## 5. Tổng hợp các Anti-pattern phổ biến

### 5.1 Hard-code colors thay vì theme tokens

```tsx
// ❌ Anti-pattern phổ biến
<Text style={{ color: '#212529' }}>...</Text>
<View style={{ backgroundColor: '#FAF7F2' }} />
backgroundColor: COLORS.text,  // static, không theme-aware

// ✅ Đúng pattern
const { colors } = useTheme();
<Text style={{ color: colors.text }}>...</Text>
```

### 5.2 StyleSheet.create với hard-coded values

- Mỗi screen có 100-300 lines `StyleSheet.create` riêng
- Spacing/radius/font đôi khi raw (20, 16, 28, 32) không qua `SPACING/RADIUS/FONT_SIZES`
- → khó refactor đồng loạt, khó propagate thay đổi design

### 5.3 ActivityIndicator chiếm cả màn hình thay vì Skeleton

```tsx
// ❌ Phổ biến
if (loading) return <View style={{flex:1}}><ActivityIndicator /></View>;

// ✅ Nên dùng skeleton để giữ layout
<SkeletonScreen items={4} variant="card" />
```

### 5.4 Alert.alert thay vì custom modal

- `review-phase-0-to-17.md` báo `Alert.alert` còn ~10-15 chỗ
- Alert native UI lệch với brand mobile (iOS popup khác hẳn Android)

### 5.5 Inline button thay vì re-use `Button`

- Nhiều screen tự build `<TouchableOpacity style={...}>` với primary color thay vì import `Button` atom
- → khi rebrand đổi color phải sửa N chỗ

### 5.6 Thiếu accessibility props

- Hầu hết `TouchableOpacity` / icon button không có `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`
- Hit slop chưa được set cho icon nhỏ 24px
- Không có `accessibilityLiveRegion` cho toast / timer

### 5.7 `as any` cast cho router

- Còn 27 vị trí `router.push(... as any)`
- Một vài có thể dùng `ROUTES.X(args)` helper thay vì raw template literal

### 5.8 Console.log/warn rải rác

- 77 vị trí console.* còn lại — không cần thiết trong production

---

## 6. Đánh giá theo trục UX

### 6.1 Information architecture (IA)

| Aspect | Đánh giá |
|---|---|
| Tab navigation (5 tab chính) | 🟢 Hợp lý: Home / Explore / IELTS / Community / Profile |
| Drawer trong IELTS tab | 🟢 Có 10 mục đầy đủ |
| Deep links (`expo-router`) | 🟢 file-based, scalable |
| Breadcrumb / back trail | 🟠 Default back chevron, thiếu context (đang ở Book nào, Unit mấy) |
| Search global | 🔴 Chưa có |
| Recently viewed / continue | 🟠 Chưa nổi bật ở Home |

### 6.2 Visual hierarchy

- **Title** đôi khi quá to (Home 42px hero, Library 32px) — chiếm 25-30% màn hình đầu
- **Body text** đôi khi quá nhỏ (13px lineHeight 18) — đặc biệt trên màn hình nhỏ
- **Spacing** giữa các section đôi khi chật chội, đôi khi quá rộng
- **CTA primary** không phải lúc nào cũng dễ thấy (Login button OK, nhưng Home chỉ 1 CTA, Profile thì nút Logout/Delete chìm)

### 6.3 Interaction quality

| Khía cạnh | Mức |
|---|---|
| `activeOpacity` trên TouchableOpacity | 🟢 Đa số có 0.7-0.8 |
| Haptic feedback | 🟠 Chỉ vài chỗ (Library progress circle, FAB drag) — nên rộng hơn |
| Long-press gestures | 🟠 Có ở Dictionary popup TextWithLookup, ít chỗ khác |
| Swipe gestures | 🔴 Hầu như không dùng (delete swipe-to-action, etc.) |
| Pull-to-refresh | 🟢 Có ở nhiều list (community/vocabulary/grammar) |
| Loading states inline | 🟠 Đa số fullscreen spinner |
| Empty states | 🟠 Có `EmptyState` atom nhưng dùng inconsistent — đôi khi chỉ text |

### 6.4 Animation & micro-interactions

- ✅ Có **FadeInDown** ở Library skill cards
- ✅ Có **floating animation** ở Home title sparkles
- ✅ Có **Spring animation** drawer
- 🟠 **Đa số screen tĩnh** — không có transition giữa list items, không có shared element transition
- 🟠 **Tab switch** không có animation đặc biệt
- 🔴 **Modal/Sheet** mở/đóng cứng, đôi khi không có overlay backdrop animation

### 6.5 Accessibility (a11y)

| Tiêu chí WCAG | Status |
|---|---|
| Contrast ratio AA | 🟠 Phần lớn pass; Login button white-on-yellow fail |
| `accessibilityLabel` cho touch target | 🔴 Chỉ <10% có |
| `accessibilityRole` (button/header/...) | 🔴 Hiếm |
| `accessibilityHint` | 🔴 Gần như không |
| Hit slop 44x44 | 🟠 Có nhiều icon button 24px chưa wrap đủ |
| Dynamic font size respect | 🔴 Tất cả font hard-code px, chưa dùng `Text scaling` |
| Screen reader test (TalkBack/VoiceOver) | 🔴 Chưa được test thực sự |

---

## 7. Phân tích Performance hiện tại

| Vấn đề tiềm năng | Vị trí | Tác động |
|---|---|---|
| File >700 lines | `intensive/[examId].tsx` (74K), `calculator.tsx` (32K), `statistics.tsx` (36.5K) | Khó memo, re-render nhiều |
| LinearGradient + Image overlay | `(tabs)/index.tsx` Home | GPU work nặng trên mid Android |
| SVG charts inline | `statistics.tsx` | Render mỗi data point có thể chậm |
| Multiple `Animated.Value` | Many screens | Native driver không phải lúc nào cũng dùng |
| `console.log` còn 77 vị trí | Toàn app | I/O block trong production |
| Image không có `expo-image` cache policy uniform | Avatar, thumbnail | Re-download thường |
| FlatList chưa dùng `getItemLayout` / `keyExtractor` thống nhất | Lists vocabulary/community | Scroll giật |

---

## 8. So sánh với Frontend Web (parity check)

| Khía cạnh | Web | Mobile |
|---|---|---|
| Feature coverage | ✅ Đầy đủ | ✅ ~95% parity |
| Design system | Radix + Tailwind, brand yellow thống nhất | 2 source of truth (legacy + new), brand bị trộn |
| Empty/loading states | Skeleton components dùng nhất quán | Phổ biến `ActivityIndicator` |
| Form validation | React Hook Form + Zod inline error | TextInput thô + Toast |
| Modal/Dialog | Radix Dialog có overlay + focus trap | Modal RN basic, đôi khi Alert |
| Animation | Framer Motion + shared layout | Reanimated nhưng dùng ít |
| Onboarding | Tour walkthrough | Diagnostic quiz only |
| Notifications | Toast + center | Toast + ưu việt (push) |
| Theme switch | ✅ | ✅ |

---

## 9. Khoảng trống chính (Top 12)

Sắp theo độ ưu tiên impact × effort:

| # | Khoảng trống | Impact | Effort |
|---|---|---|---|
| 1 | Brand chưa thống nhất; `AppButton` xài blue thay vì yellow | 🔴 Cao | 🟢 Thấp |
| 2 | Login screen không theme-aware + pre-filled creds + low contrast | 🔴 Cao | 🟢 Thấp |
| 3 | Thiếu Skeleton loader → loading UX kém | 🔴 Cao | 🟠 Trung |
| 4 | `COLORS` static được dùng quá rộng → khó duy trì dark mode chuẩn | 🔴 Cao | 🔴 Lớn (>40 file) |
| 5 | Tab Home chỉ 1 CTA, thiếu personalization (continue/today/streak) | 🔴 Cao | 🟠 Trung |
| 6 | Không có atom Card / EmptyState / Sheet thống nhất | 🟠 Trung | 🟠 Trung |
| 7 | Accessibility coverage ~20% (label/role/hint thiếu) | 🟠 Trung | 🔴 Lớn |
| 8 | File `intensive/[examId].tsx` 74K không tách → render heavy | 🟠 Trung | 🔴 Lớn |
| 9 | Form validation thiếu inline error UI | 🟠 Trung | 🟠 Trung |
| 10 | Brand FAB Lexon AI dùng Gemini gradient – mâu thuẫn brand | 🟢 Thấp | 🟢 Thấp |
| 11 | Pull-to-refresh + skeleton thiếu ở 1 số list (statistics/dashboard) | 🟢 Thấp | 🟠 Trung |
| 12 | Animation transition giữa screens chưa polish | 🟢 Thấp | 🟠 Trung |

---

## 10. Mục tiêu chất lượng đề xuất (Quality bar)

Sau khi cải thiện, app cần đạt:

| Tiêu chí | Mục tiêu cụ thể |
|---|---|
| **Brand** | 100% primary CTA dùng yellow `#FFC600` + onPrimary `#212529` |
| **Theme awareness** | 100% screen dùng `useTheme()`, 0 import `COLORS` ở component leaf |
| **Atom coverage** | ≥80% TouchableOpacity → `<Button />`; ≥90% TextInput → `<AppTextInput />` |
| **Loading state** | 100% màn hình data-heavy có Skeleton (không phải fullscreen spinner) |
| **Empty state** | 100% empty list có illustration + CTA |
| **A11y** | ≥80% touch target có `accessibilityLabel`; mọi icon button có hit slop ≥44 |
| **Contrast** | 100% pass WCAG AA (4.5:1 cho text, 3:1 cho large text) |
| **File size** | 0 file >700 lines (split helper hooks ra) |
| **Console** | <10 vị trí console.* (wrap `__DEV__`) |
| **Animation** | Transition ≥30 micro-interactions, không fullscreen blocking |

---

## 11. Kết luận

App mobile hiện tại đã đạt **functional completeness rất cao** so với web nhờ 17 phase development trước đó. Tuy nhiên:

- **Lớp visual** chưa đạt mức "thiết kế chỉn chu" — đặc biệt brand consistency và component reusability.
- **Lớp interaction** thiếu polish — feedback (haptic/animation) sparse, loading/empty states đơn điệu.
- **Lớp accessibility** gần như chưa được đầu tư.

Hai file tiếp theo trình bày:

- **`02-improvement-plan.md`** — Kế hoạch cải thiện chi tiết (chiến lược, design principles, atomic design system, deliverables).
- **`03-implementation-phases.md`** — Phân chia phase + tasks cụ thể từng bước hiện thực.
