# Kế Hoạch Cải Thiện UI/UX — Frontend Mobile

> **Ngày**: 2026-05-22
> **Tham chiếu**: [`01-current-state.md`](./01-current-state.md) — Thực trạng & khoảng trống
> **Mục tiêu file này**: Đặt **chiến lược tổng**, **nguyên tắc thiết kế**, **kiến trúc design system** và **deliverables** để 17 phase trước đó được "nâng cấp UX" lên mức production-ready cho IELTS Master AI mobile.

---

## 1. Mục tiêu chiến lược

### 1.1 North Star

> *"App mobile trông và cảm thấy như một sản phẩm hạng A, không chỉ là phiên bản port từ web."*

### 1.2 Tiêu chí thành công (Success criteria)

| Trục | KPI đo lường được | Mức hiện tại | Mục tiêu sau khi cải thiện |
|---|---|---|---|
| **Brand** | % file dùng `COLORS` static thay vì `useTheme().colors` | ~60% | ≤5% (chỉ trong overlay intentional) |
| **Reusability** | Tỉ lệ TouchableOpacity / TextInput được wrap bằng atom dùng chung | ~40% | ≥80% |
| **Loading UX** | Số screen có skeleton thay vì fullscreen spinner | 0 | ≥15 screen data-heavy |
| **Empty UX** | Số empty state có illustration + CTA | 1-2 | ≥10 |
| **Accessibility** | % touch target có `accessibilityLabel` | <10% | ≥80% |
| **File health** | Số file >700 lines | 4 | 0 |
| **Console noise** | Số vị trí `console.*` trong production code | 77 | <10 |
| **Animation polish** | Số micro-interaction (haptic + spring/tween) | <20 | ≥50 |
| **Cold start** | Time-to-interactive trên Pixel 5 | TBD | <2.5s |
| **Bundle size** | App APK release | TBD | <40MB |

### 1.3 Phạm vi & nguyên tắc

**Phạm vi IN**:
- Tất cả screen trong `app/`, `components/`, `hooks/` của `frontend-mobile/`
- Theme, design tokens, atomic component library
- Accessibility, performance polish
- Onboarding & empty state UX

**Phạm vi OUT** (giữ nguyên):
- Backend API contract (parity đã đạt)
- Business logic (state machine exam, grading flow)
- iOS/Android native module (đã có config)
- Phase 18/19 (Android Release + iOS+IAP) — phase này song hành nhưng không phụ thuộc

**Nguyên tắc xuyên suốt**:
1. **Mobile-first**, không bê nguyên web pattern
2. **Brand-first**: Yellow `#FFC600` là chủ đạo trên CTA, accent dùng tiết chế
3. **One source of truth**: Mọi color/spacing/typography đều qua design tokens
4. **Composition over inheritance**: Card / Button / Input nhận biến thể qua props, không tạo 5 component clone
5. **Performance-aware**: `React.memo` + `useMemo` cho list items, `expo-image` cache cho media
6. **Accessible by default**: Mỗi atom có a11y prop sẵn

---

## 2. Triết lý thiết kế (Design philosophy)

### 2.1 Tone & mood

| Attribute | Định nghĩa cho IELTS Master |
|---|---|
| **Tone of voice** | Encouraging, confident, expert. Như coach giỏi nhưng thân thiện. |
| **Visual mood** | Warm-modern: chủ đạo yellow brand + slate neutrals + occasional pastel skill colors |
| **Typography** | Farro family (đã có) — distinctive, slightly geometric, không quá "tech" |
| **Density** | Comfortable. Whitespace generous trên screen chính, dense ở screen data heavy (history/stats) |
| **Motion** | Smooth + purposeful. Tránh animation trang trí — mỗi motion phải có lý do |

### 2.2 4 pillars

1. **Hierarchy** — Người dùng luôn biết ngay đâu là hành động chính trên mỗi screen
2. **Continuity** — Mỗi tương tác feedback ngay (haptic + visual ≤100ms)
3. **Clarity** — Loading/Empty/Error không bao giờ chỉ là spinner; luôn có context + recovery action
4. **Inclusivity** — Hỗ trợ dark mode + dynamic font + screen reader ngay từ atom level

---

## 3. Design System — Cấu trúc đề xuất

### 3.1 Token layer (foundation)

```
constants/
├── tokens/
│   ├── colors.ts        # Semantic palette (primary, success, ...)
│   ├── spacing.ts       # 4/8/12/16/24/32/48/64 grid
│   ├── typography.ts    # Display / Headline / Title / Body / Label / Caption
│   ├── radius.ts        # xs/sm/md/lg/xl/2xl/full
│   ├── elevation.ts     # 5 levels shadow (ios + android map)
│   ├── motion.ts        # Easing curves + duration presets
│   └── breakpoints.ts   # Phone / Tablet / Foldable
└── theme.ts             # LIGHT_TOKENS + DARK_TOKENS map lên semantic
```

**Tách rõ**:
- **Primitive tokens**: `slate.50 ... slate.900`, `yellow.100 ... yellow.900` — raw values
- **Semantic tokens**: `bgPrimary`, `textOnPrimary`, `borderSubtle` — alias map vào primitives, đổi theo theme
- **Component tokens**: `button.primary.bg`, `card.elevated.shadow` — cấu hình từng atom

→ Web cũng có pattern này; mobile sẽ đồng bộ.

### 3.2 Atomic component layer

Theo nguyên tắc Atomic Design (Brad Frost):

```
components/
├── atoms/         # Không phụ thuộc context khác
│   ├── Button.tsx          # 5 variant × 3 size × loading/disabled/icon
│   ├── IconButton.tsx      # Touch target ≥44, hit slop auto
│   ├── Text.tsx            # Wrap RN Text với typography preset
│   ├── Input.tsx           # Theme-aware + icon prefix + error inline
│   ├── Avatar.tsx          # Image + fallback initials + size variants
│   ├── Badge.tsx           # 4 variant (success/warn/error/neutral)
│   ├── Chip.tsx            # Filter chip + selected state
│   ├── Switch.tsx          # iOS/Android-aware switch wrap
│   ├── Skeleton.tsx        # Shimmer animation (Reanimated)
│   ├── Divider.tsx
│   ├── Spacer.tsx          # Replace marginBottom hard-code
│   ├── ScoreBadge.tsx
│   └── ProgressBar.tsx     # Linear + Circular variants
├── molecules/     # Combine atoms
│   ├── Card.tsx            # variant elevated/outlined/tonal
│   ├── ListItem.tsx        # Avatar/Icon + Title + Subtitle + Trailing
│   ├── FormField.tsx       # Input + label + error + hint
│   ├── EmptyState.tsx      # Illustration + title + body + CTA
│   ├── ErrorState.tsx      # Same shape but with retry button
│   ├── SearchBar.tsx       # Input + clear + voice icon
│   ├── PressableCard.tsx   # Card with onPress haptic + scale anim
│   └── TabPill.tsx         # Horizontal scrollable tabs
├── organisms/     # Page-level chunks
│   ├── BottomSheet.tsx     # Modal sheet wrapper với snap points
│   ├── Header.tsx          # Standard nav header với theme
│   ├── ScreenContainer.tsx # SafeArea + theme bg + status bar
│   ├── ListEmpty.tsx       # Compose EmptyState cho FlatList
│   ├── PullToRefreshList.tsx
│   └── ConfirmDialog.tsx   # Custom alternative cho Alert.alert
└── templates/     # Composed layouts
    ├── DataScreen.tsx      # Header + Skeleton/Empty/List swap
    ├── FormScreen.tsx      # KeyboardAvoiding + Submit footer
    └── DetailScreen.tsx    # Hero + Tabs + Content
```

### 3.3 Quy ước styling

**Quyết định**: Dùng **StyleSheet API có theme injection** (thay vì NativeWind cho atom).

| Lý do | Giải thích |
|---|---|
| Performance | StyleSheet.create cache style object — RN bridge nhanh hơn nhiều với NativeWind class string |
| Type safety | `colors: ThemeTokens` autocomplete đầy đủ |
| Theme consistency | Tránh tình huống `bg-blue-600` (NativeWind) trong khi brand là yellow |

**NativeWind vẫn được phép dùng** ở:
- Prototype screen mới (rapid iteration)
- Layout đơn giản (flex/padding) không liên quan color
- Migration dần (không bắt buộc rewrite ngay)

**Quy ước pattern**:

```tsx
// ✅ Đúng pattern (theme-aware)
function MyCard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={styles.container} />;
}
const createStyles = (c: ThemeTokens) => StyleSheet.create({
  container: { backgroundColor: c.card, borderColor: c.border, ... },
});

// ❌ Anti-pattern
function MyCard() {
  return <View style={{ backgroundColor: COLORS.card }} />;
  //                                       ^^^^^^^^^^^^ static
}
```

---

## 4. Hệ thống nội dung (Content system)

### 4.1 Empty state library

Tạo bộ illustration SVG vector chung cho 7 trường hợp empty:

| Key | Khi nào dùng |
|---|---|
| `empty-history` | Không có lịch sử exam/test |
| `empty-notifications` | No notification |
| `empty-bookmarks` | No saved item |
| `empty-search` | No search result |
| `empty-network` | Network error |
| `empty-deck` | No flashcard deck |
| `empty-leaderboard` | No ranking data |

→ Lưu trong `assets/empty-states/`, import qua `expo-image` SVG support.

### 4.2 Onboarding & education

- **First-time tour** sau register (3-4 step) giới thiệu 4 module chính (Foundation / Basic / Advanced / Intensive)
- **Contextual tooltip** lần đầu mở chức năng phức tạp (Vocab Lab SRS, Pronunciation phoneme scoring)
- **Daily streak banner** ở Home với illustration

### 4.3 Microcopy refresh

- Thay "Submit" / "OK" generic → context-rich ("Submit essay" / "Got it!" / "Start practicing")
- Lỗi network: "Looks like you're offline. Pull down to retry." thay vì "Network error"
- Loading text: "Generating your IELTS score..." thay vì spinner trống

---

## 5. Cải thiện UX flow chính

### 5.1 First-time user (FTUE)

```
Login/Register → Welcome (1 screen, không skip-able)
              → Diagnostic quiz (existing)
              → Onboarding tour (3 step)
              → Home với "Continue from where you left"
```

### 5.2 Returning user — Home reflow

**Hiện tại**: Hero title + 1 CTA "START LEARNING" + 2 ảnh decorative.

**Đề xuất**:
```
┌─────────────────────────────┐
│ [Avatar] Hello, {name} 👋    │
│           {streak}🔥 day     │
├─────────────────────────────┤
│ Today's Goal: 30 min        │
│ ████████░░ 24/30 min        │
├─────────────────────────────┤
│ 📚 Continue Learning         │
│ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │Last │ │Vocab│ │Speak│   →│
│ │exam │ │unit │ │part │    │
│ └─────┘ └─────┘ └─────┘    │
├─────────────────────────────┤
│ ⭐ Recommended for you       │
│ [carousel of 3 modules]     │
├─────────────────────────────┤
│ 🏆 Weekly Leaderboard        │
│ Rank #12 ↑ 3 spots          │
└─────────────────────────────┘
```

### 5.3 Loading state pattern

| Loại data | Pattern mới |
|---|---|
| List (post/book/deck) | `<Skeleton variant="card" count={3} />` keeping layout |
| Detail (exam result) | `<Skeleton variant="hero" />` + content skeleton |
| Form submit | Button loading state inline + disable form |
| Image | `expo-image` với `placeholder={blurhash}` |
| Initial app boot | Splash screen (đã có) + brand pulse |

### 5.4 Empty state pattern

```
┌──────────────────────┐
│      [illustration]   │
│                       │
│   No bookmarks yet    │
│   Tap ⭐ on any post   │
│   to save it here     │
│                       │
│ [ Browse community ]  │
└──────────────────────┘
```

### 5.5 Error state pattern

```
┌──────────────────────┐
│   [error illustration]│
│                       │
│ Something went wrong  │
│ {error.message}       │
│                       │
│ [ Try again ] [Back] │
└──────────────────────┘
```

### 5.6 Form & validation

- Inline error dưới field (đỏ + icon warning), không chỉ Toast
- Disable submit button khi form invalid
- Server error → highlight field nếu API trả `field` info, fallback Toast nếu lỗi tổng quát
- Password input có "Show/Hide" toggle
- Email/Username có icon prefix
- Loading button thay text bằng spinner inline

### 5.7 Navigation architecture — **Quyết định strategy**

Sau audit navigation, các quyết định kiến trúc đã được xác nhận với product:

#### Strategy A — Sidebar/Drawer per tab

**Adopted: B2 — Drawer chỉ cho IELTS tab; 4 tab còn lại dùng section header**

| Tab | Secondary navigation |
|---|---|
| **Home** | Section header với "Quick links" chips (không drawer) |
| **Explore** | Filter chips top + category grid (không drawer) |
| **IELTS** | ✅ Giữ drawer + polish toàn diện (header context, grouping, active highlight) |
| **Community** | Tab pills horizontal (đã có) |
| **Profile** | Segmented control 3-tab (đã có) |

**Lý do**: IELTS có 10 sub-section logic phân nhánh sâu nên drawer phù hợp. 4 tab khác nông hơn, không cần drawer overhead.

#### Strategy B — Bottom navbar

**Adopted: 5 tab flat + active indicator pill** (KHÔNG dùng center FAB pattern)

- Giữ pattern 5 tab quen thuộc với user
- Thêm visual cues: pill indicator + icon morphing outline→filled
- Mở rộng badge cho tất cả 5 tab (IELTS pending grading, Community unread, Profile notif đã có)
- Hide on scroll + hide trong exam fullscreen

#### Strategy C — Route topology restructure (BREAKING)

**Decision**: Move Foundation modules vào nested route + consolidate Shadowing & Dictation.

| Trước | Sau |
|---|---|
| `app/vocabulary/` (top-level) | `app/ielts/foundation/vocabulary/` |
| `app/grammar/` (top-level) — duplicate với `/ielts/grammar/` | **XOÁ top-level**; giữ duy nhất `app/ielts/foundation/grammar/` |
| `app/ielts/pronunciation/` | Move thành `app/ielts/foundation/pronunciation/` |
| `app/shadowing/` (top-level) | `app/practice-tools/shadowing/` hoặc `app/shadowing-dictation/shadowing/` |
| (chưa có) `app/dictation/` | `app/practice-tools/dictation/` (group chung với shadowing) |

**Rationale**:
- 3 module Foundation (Pronunciation/Vocabulary/Grammar) logically thuộc IELTS Foundation tier → route topology phải phản ánh điều đó
- Top-level vocabulary/grammar/shadowing là **dư thừa** + gây nhầm lẫn entry point
- Shadowing & Dictation là **cặp tính năng đôi** (cùng dùng video YouTube, cùng pattern interaction) → phải đi chung
- Loại bỏ duplication `/grammar/` vs `/ielts/grammar/`

**Backward compat**: Giữ alias redirect (e.g., `/vocabulary/[bookSlug]` → `/ielts/foundation/vocabulary/[bookSlug]`) trong 1 release cycle để link cũ + push notification cũ vẫn work.

#### Strategy D — Back navigation & breadcrumb

| Pattern | Áp dụng |
|---|---|
| **Smart breadcrumb header** | Mọi screen ≥2 level deep (e.g., "IELTS › Foundation › Vocabulary › Unit 3") |
| **Tap breadcrumb segment to jump** | Tap "IELTS" → pop về root tab IELTS |
| **Long-press back chevron** | Pop tới root của stack (bypass intermediate screens) |
| **Save-and-exit modal** | Exam screen, form chưa submit, autosave-aware screens |
| **Hardware back consistency** | Android hardware back = in-app back chevron (đặc biệt trong modal) |
| **Swipe-back gesture** | Default Expo Router + đảm bảo custom modal không break |
| **"Continue where you left" snackbar** | Khi quay lại tab có lesson đang dở → snackbar bottom với CTA |

---

## 6. Cải thiện chuyển trang & animation

### 6.1 Screen transitions (Expo Router)

- Cấu hình `screenOptions: { animation: 'slide_from_right' }` ở stack chính
- Modal screens: `presentation: 'modal'` + `animation: 'slide_from_bottom'`
- Tab switch: dùng `tabBarVariant: 'uikit'` hoặc custom fade

### 6.2 Micro-interactions chuẩn

| Hành động | Feedback |
|---|---|
| Tap button primary | `Haptics.impactAsync(Light)` + scale 0.98 |
| Tap button destructive | `Haptics.notificationAsync(Warning)` |
| Submit success | `Haptics.notificationAsync(Success)` + toast slide-in |
| Pull-to-refresh trigger | `Haptics.impactAsync(Medium)` |
| Tab change | Subtle fade transition |
| List item appear | `FadeInDown` stagger 50ms |
| Modal open | Backdrop fade + sheet spring up |

### 6.3 Animation tokens (`tokens/motion.ts`)

```ts
export const MOTION = {
  duration: { instant: 100, fast: 200, normal: 300, slow: 500 },
  easing: {
    spring: { tension: 80, friction: 12 },
    standard: Easing.bezier(0.2, 0, 0, 1),
    decelerate: Easing.bezier(0, 0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0, 1, 1),
  },
};
```

---

## 7. Cải thiện Accessibility (a11y)

### 7.1 Quy ước bắt buộc cho atom

Mỗi atom phải có default a11y props:

```tsx
<Button
  title="Submit"
  accessibilityRole="button"
  accessibilityLabel={accessibilityLabel ?? title}
  accessibilityHint={accessibilityHint}
  accessibilityState={{ disabled, busy: loading }}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
/>
```

### 7.2 Checklist screen-level a11y

- [ ] Header có `accessibilityRole="header"`
- [ ] Tab có `accessibilityRole="tab"` + `selected` state
- [ ] Form field có label associated qua `accessibilityLabelledBy`
- [ ] Live updates (timer, score) có `accessibilityLiveRegion="polite"`
- [ ] Modal có focus trap + `accessibilityViewIsModal=true` (iOS)

### 7.3 Contrast & font scaling

- Test toàn bộ screen ở `Settings → Accessibility → Text Size` lớn nhất
- Mọi text dùng `<Text>` atom với prop `numberOfLines` rõ ràng
- Tránh truncation ở content chính

---

## 8. Cải thiện Performance

### 8.1 Code splitting & file refactor

| File hiện tại | Action |
|---|---|
| `app/ielts/intensive/[examId].tsx` (74K) | Tách thành: `[examId].tsx` (shell <200) + `hooks/useExamSession.ts` + `hooks/useExamTimer.ts` + `hooks/useAnswerState.ts` + `components/intensive/ExamHeader.tsx` + `components/intensive/AudioPlayer.tsx` |
| `app/ielts/calculator.tsx` (32K) | Tách `lib/bandCalculator.ts` (logic) + `components/CalculatorForm.tsx` + screen shell |
| `app/ielts/advanced/statistics.tsx` (36.5K) | Tách 4 chart subcomponent + `useStatisticsData()` hook |
| `app/(tabs)/profile.tsx` (22.8K) | Move state vào AccountTab/StatsTab/SettingsTab, shell chỉ là tab router |

### 8.2 Rendering optimization

- **Memo** mọi list item component (`React.memo` + `useCallback` cho onPress)
- **Keys** stable qua `keyExtractor` (id), không index
- **`getItemLayout`** cho list cố định height
- **`removeClippedSubviews`**, `windowSize`, `initialNumToRender` tuning cho list dài (history/community)
- **`InteractionManager.runAfterInteractions`** cho heavy work sau navigation

### 8.3 Asset & network

- `expo-image` với `cachePolicy="memory-disk"` cho avatar/thumbnail
- Image responsive size: `width={width * 0.5}` không phải hard-code
- Preload font (đã có) + critical icon (`@expo/vector-icons` tree-shake check tại P18)
- API request: dedupe inflight + cache 5min cho catalog data (vocabulary/grammar/intensive list)

### 8.4 Production-ready cleanup

- Wrap `console.*` trong `if (__DEV__)` hoặc xoá hẳn
- Remove `as any` cast: thay bằng ROUTES helper + typed nav
- Pre-fill credentials login screen → remove
- Remove debug Alert leftover

---

## 9. Branding refresh

### 9.1 Visual signature

| Element | Đề xuất |
|---|---|
| **Primary color** | Yellow `#FFC600` (giữ nguyên) |
| **OnPrimary** | Slate 900 `#0F172A` (đã đúng dark token) |
| **Accent gradient** | `linear-gradient(135deg, #FFC600 → #FFD93D)` cho hero CTA |
| **Success** | Green 500 `#22C55E` (đã có) |
| **Logo** | Đảm bảo dùng logo asset thống nhất (chưa kiểm trong codebase) |
| **App icon** | Review trong app.json + assets/ — đảm bảo adaptive icon Android |
| **Splash screen** | Yellow background + logo + tagline ngắn |

### 9.2 Lexon AI sub-brand

- Lexon AI là feature sub-brand (chat tutor) — giữ Gemini gradient cho FAB
- Nhưng chat screen header dùng brand standard, không bị Gemini chiếm toàn bộ

### 9.3 Skill color usage rule

Skill colors (`L #E11D48 / R #2563EB / W #D97706 / S #7C3AED`) chỉ dùng:
- ✅ Skill card / Chip filter
- ✅ Score visualization (chart bar/line color)
- ✅ Badge in result screen
- ❌ Không dùng làm primary CTA
- ❌ Không dùng làm tab bar active color

---

## 10. Roadmap implementation (preview)

Chi tiết trong [`03-implementation-phases.md`](./03-implementation-phases.md). Tóm tắt:

| Phase | Mục tiêu | Ước tính |
|---|---|---|
| **MI-01** | Token foundation + theme cleanup | 6h |
| **MI-02** | Atomic component library (atoms) | 12h |
| **MI-03** | Molecules + Organisms | 10h |
| **MI-04** | Loading/Empty/Error UX rollout | 8h |
| **MI-05** | Brand refresh + visual polish | 8h |
| **MI-06** | Auth screens redesign | 4h |
| **MI-07** | Home tab redesign (personalized) | 8h |
| **MI-08** | Explore + IELTS + tabs polish | 10h |
| **MI-09** | Profile + Community + Vocab/Grammar polish | 10h |
| **MI-10** | IELTS Intensive file refactor + Exam UI polish | 12h |
| **MI-11** | Animation & micro-interactions sweep | 8h |
| **MI-12** | Accessibility pass | 10h |
| **MI-13** | Performance pass + cleanup | 8h |
| **MI-14** | QA pass + device matrix | 8h |
| **TOTAL** | | **~122h** |

**Định kỳ song hành**: cứ kết thúc 1 phase → manual smoke test 5-10 phút trên 1 device thật.

---

## 11. Rủi ro & mitigation

| ID | Rủi ro | Khả năng | Mitigation |
|---|---|---|---|
| MIR-01 | Refactor color → break dark mode hoặc light mode | 🟠 Trung | Phase MI-01 audit kỹ; mỗi phase phải test dark + light |
| MIR-02 | Atom mới conflict với atom cũ (legacy `Button` vs `AppButton` vs mới) | 🟠 Trung | Đặt tên rõ ràng (`Button` mới đặt trong `atoms/`); deprecate alias |
| MIR-03 | Refactor `intensive/[examId].tsx` 74K gây regression exam state machine | 🔴 Cao | Snapshot test trước/sau; refactor incremental không đổi behavior |
| MIR-04 | Animation thêm vào quá nhiều → drop frames trên low-end Android | 🟠 Trung | Đo FPS với Reanimated profiling; ưu tiên native driver |
| MIR-05 | Skeleton component không match list layout thực → "flash" khi data về | 🟢 Thấp | Skeleton variants match từng layout pattern (card / list / hero) |
| MIR-06 | Accessibility pass nhiều file → effort lớn vượt estimate | 🟠 Trung | Bắt đầu từ atom (impact cao); leaf component có thể defer |
| MIR-07 | Brand refresh đụng vào Lexon AI subbrand → user nhầm lẫn | 🟢 Thấp | Define clear rule khi nào dùng Gemini gradient |
| MIR-08 | Performance fix tốn nhiều effort hơn estimate | 🟠 Trung | Đo trước, fix theo Pareto (80/20) |

---

## 12. Bảng cộng tác (Stakeholder)

| Vai trò | Trách nhiệm trong scope cải thiện này |
|---|---|
| Mobile dev | Implement phase MI-01 → MI-14 |
| Design (nếu có) | Validate token/brand refresh + cung cấp illustration empty state |
| QA | Manual test theo device matrix sau mỗi phase |
| Product | Approve UX flow changes (Home reflow, onboarding tour) |

---

## 13. Checklist trước khi gọi "Done"

- [ ] `COLORS` static chỉ còn được import trong `constants/` và `theme.ts`
- [ ] 0 file >700 lines trong `app/` và `components/`
- [ ] `console.*` còn <10 vị trí, đều wrap `__DEV__`
- [ ] `as any` cast trong router còn <5 vị trí
- [ ] Mọi screen primary có Skeleton hoặc Suspense fallback
- [ ] Mọi list empty có illustration + CTA
- [ ] Mọi error có retry button (không chỉ red text)
- [ ] Mọi form field có inline error
- [ ] Mọi screen test pass với TalkBack/VoiceOver basic
- [ ] Manual smoke test pass trên: Pixel 5 (Android 14) + Samsung A52 (Android 13) + iPhone 12 (iOS 17)
- [ ] Lighthouse-equivalent (React DevTools Profiler) ghi nhận: TTI <2.5s, scroll FPS ≥55

---

> Tiếp tục đọc [`03-implementation-phases.md`](./03-implementation-phases.md) để xem **phase + task chi tiết**.
