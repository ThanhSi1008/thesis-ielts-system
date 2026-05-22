# Hiện Thực Cải Thiện — Phân Phase & Tasks

> **Ngày**: 2026-05-22
> **Tham chiếu**: [`01-current-state.md`](./01-current-state.md) · [`02-improvement-plan.md`](./02-improvement-plan.md)
> **Mục tiêu file này**: Liệt kê **task cụ thể** để mobile dev thực thi theo từng phase. Mỗi task có **ID** (MI-XX-YY), mô tả, file đụng tới, acceptance criteria, ước tính giờ.

> **Quy ước**:
> - **ID**: `MI-{phase}-{task}` (MI = Mobile Improvement)
> - **AC** = Acceptance Criteria
> - **Estimate** tính theo dev có context — KHÔNG bao gồm QA
> - Mỗi task nên close trong 1 commit hoặc 1 PR feature-branch nhỏ
> - Sau mỗi phase: chạy `npm run lint && npm run type-check` + smoke test trên 1 device thật

---

## Tổng quan 14 phase

| Phase | Tên | Ước tính | Mục tiêu chính |
|---|---|---|---|
| **MI-01** | Token Foundation & Theme Cleanup | 6h | Restructure tokens, deprecate `COLORS` static |
| **MI-02** | Atomic Components | 12h | Build atom library (Button/Text/Input/Avatar/Badge/Chip/Skeleton…) |
| **MI-03** | Molecules & Organisms | 10h | Card/FormField/SearchBar/EmptyState/BottomSheet/Header |
| **MI-04** | Loading / Empty / Error UX | 8h | Rollout skeleton + illustrated empty + retry pattern |
| **MI-05** | Brand Refresh & Visual Polish | 8h | Logo/icon/splash, gradient rules, skill color rules |
| **MI-06** | Auth Screens Redesign | 4h | Login + Register polish (theme-aware, inline error, password toggle) |
| **MI-07** | Home Tab Redesign | 8h | Personalized greeting, continue learning, daily goal, leaderboard |
| **MI-08** | Explore + IELTS Tab + Drawer Polish | 10h | Visual hierarchy, animation, theme-aware Library card |
| **MI-09** | Profile + Community + Vocab/Grammar Polish | 10h | Adopt atoms, skeleton, illustrated empty |
| **MI-10** | IELTS Intensive Refactor & Exam UI Polish | 12h | Split 74K file, polish exam screen |
| **MI-11** | Animation & Micro-interactions | 8h | Screen transitions, haptic standard, list stagger |
| **MI-12** | Accessibility Pass | 10h | A11y labels, hit slop, contrast, font scaling |
| **MI-13** | Performance Pass & Cleanup | 8h | Console cleanup, memo, image cache, bundle trim |
| **MI-14** | QA & Device Matrix | 8h | Manual test trên 3 device + fix regression |
| **TOTAL** | | **~122h** | |

> **Tip thực thi**: Có thể chạy MI-02 và MI-04 song song (atom có sẵn skeleton trước, screen rollout sau).

---

## Phase MI-01 — Token Foundation & Theme Cleanup (6h)

**Mục tiêu**: Restructure design tokens, gỡ phụ thuộc vào `COLORS` static cho atom.

### MI-01-01 — Tạo cấu trúc `constants/tokens/` (0.5h)

- Tạo folder `frontend-mobile/constants/tokens/`
- Tách file:
  - `colors.ts` — semantic palette aliases (gọi tới primitives)
  - `spacing.ts` — `{ 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 16:64 }`
  - `typography.ts` — display/headline/title/body/label/caption presets
  - `radius.ts` — keep existing scale + add `2xl: 16`, `3xl: 24`
  - `elevation.ts` — 5 levels với iOS shadow + Android elevation map
  - `motion.ts` — easing curves + duration presets
- Update `constants/index.ts` re-export
- **AC**: `import { spacing, typography, radius, elevation, motion } from '@/constants'` work; `tsc --noEmit` pass

### MI-01-02 — Mở rộng `ThemeTokens` với semantic colors mới (1h)

- Thêm tokens vào `ThemeTokens` interface (`constants/theme.ts`):
  - `bgElevated`, `bgSubtle`, `bgInverse`
  - `textOnAccent`, `textInverse`
  - `borderStrong`, `borderInteractive`
  - `overlay` (rgba black for modal backdrop)
- Map LIGHT/DARK tokens
- **AC**: TypeScript autocomplete `colors.bgElevated` works; existing code không break

### MI-01-03 — Audit & flag `COLORS` static usage (1h)

- Chạy `rtk grep "from '@/constants'.*COLORS" frontend-mobile/app frontend-mobile/components` để lập list file
- Tạo `docs/mobile-improvement/audit-COLORS-usage.md` với danh sách file + dòng cần migrate
- **AC**: List có ≥30 file với line numbers; phân loại "must-migrate" (atom) vs "can-defer" (legacy)

### MI-01-04 — Migrate Tab layout + 5 tab chính sang `useTheme()` (2h)

- Refactor `app/(tabs)/_layout.tsx` — đã có nhưng cleanup hết `COLORS.primary` static
- Refactor `app/(tabs)/index.tsx` (Home) — đổi `#000` background hard-code → theme-aware
- Refactor `app/(tabs)/explore.tsx` — đổi feature banner thành theme-aware
- Refactor `app/(tabs)/profile.tsx` shell
- **AC**: Toggle light↔dark trong app → 5 tab chuyển màu hoàn toàn, không còn pixel hard-coded

### MI-01-05 — Deprecate `components/ui.tsx` legacy (0.5h)

- Thêm JSDoc `@deprecated Use atom from @/components/atoms instead` cho mỗi export trong `components/ui.tsx`
- Update `components/ui/index.ts` re-export với deprecation note
- **AC**: ESLint warning hiện khi import từ `@/components/ui.tsx`

### MI-01-06 — Style helper `createStyles(colors)` pattern (1h)

- Tạo `hooks/useThemedStyles.ts`:
  ```ts
  export function useThemedStyles<T>(factory: (colors: ThemeTokens) => T): T {
    const { colors } = useTheme();
    return useMemo(() => factory(colors), [colors]);
  }
  ```
- Document trong `docs/mobile-improvement/style-patterns.md`
- **AC**: Hook export đúng; 1 screen example dùng pattern

**Tổng MI-01: 6h**

---

## Phase MI-02 — Atomic Components (12h)

**Mục tiêu**: Build atom library theme-aware, a11y-ready.

### MI-02-01 — `Button` atom (1.5h)

- File: `components/atoms/Button.tsx`
- 5 variants: `primary | secondary | outline | ghost | danger`
- 3 sizes: `sm | md | lg`
- States: `loading | disabled | pressed (scale 0.98)`
- Props: `title, onPress, leftIcon, rightIcon, fullWidth, variant, size, accessibilityLabel, accessibilityHint`
- Default haptic light on press
- **AC**: Storybook-equivalent example screen render đủ 5×3 = 15 variant; all theme-aware

### MI-02-02 — `IconButton` atom (0.5h)

- File: `components/atoms/IconButton.tsx`
- Round/square variant, 3 sizes
- Auto hit slop ≥44 cho size sm
- Optional badge dot
- **AC**: Mọi icon-only button có thể replace bằng `<IconButton />`

### MI-02-03 — `Text` atom (1h)

- File: `components/atoms/Text.tsx`
- Variants: `display | headline | title | body | label | caption`
- Weight: `regular | medium | bold`
- Color: prop `color="text" | "textSecondary" | "textMuted" | "primary" | "error" | "success"` map từ theme
- Auto applied font family `Farro-X`
- **AC**: Replace `<Text>` thuần ở ≥5 file dùng prop variant; render đúng kích thước/font

### MI-02-04 — `Input` + `FormField` atom (1.5h)

- File: `components/atoms/Input.tsx`
- Props: `value, onChangeText, leftIcon, rightIcon, error, hint, label, secureTextEntry, autoCapitalize, keyboardType`
- Built-in:
  - Show/Hide password toggle khi `secureTextEntry`
  - Clear button (X) khi value !== ''
  - Focus border highlight
- File: `components/molecules/FormField.tsx` wrap `Input` + label trên + error/hint dưới
- **AC**: Login screen có thể dùng `<FormField label="Email" leftIcon="mail" />` và render đúng inline error

### MI-02-05 — `Avatar` atom (0.5h)

- File: `components/atoms/Avatar.tsx`
- Props: `source, name (for fallback initials), size: 'xs/sm/md/lg/xl', badge?`
- Auto fallback initials với background = hash(name) → màu pastel
- **AC**: Render đúng 5 size; fallback hoạt động khi source null

### MI-02-06 — `Badge` atom (0.5h)

- File: `components/atoms/Badge.tsx`
- Variants: `success | warning | error | info | neutral | tier (FREE/PREMIUM/PRO)`
- Sizes: `sm | md`
- Optional dot variant (chỉ chấm tròn)
- **AC**: Replace `renderBadge()` inline trong `AccountTab.tsx` với `<Badge variant="tier" value={tier} />`

### MI-02-07 — `Chip` atom (0.5h)

- File: `components/atoms/Chip.tsx`
- Active/inactive states, optional left icon, optional close (X)
- Filter chip behavior
- **AC**: Replace chip filter trong intensive index + community tabs

### MI-02-08 — `Skeleton` atom (1.5h)

- File: `components/atoms/Skeleton.tsx`
- Variants: `text | circle | rect | card`
- Shimmer animation qua Reanimated worklet
- Auto pulse loop 1.2s
- Props: `width, height, variant, count?, gap?`
- **AC**: `<Skeleton variant="card" count={3} />` render 3 card placeholder với shimmer

### MI-02-09 — `Switch` atom (0.5h)

- File: `components/atoms/Switch.tsx`
- Wrap RN `<Switch>` với theme color + iOS/Android consistency
- **AC**: Settings tab dùng atom thay vì raw Switch

### MI-02-10 — `Divider` + `Spacer` atom (0.5h)

- File: `components/atoms/Divider.tsx` + `components/atoms/Spacer.tsx`
- Spacer dùng prop `size` map vào spacing tokens
- **AC**: Replace ≥10 `marginBottom: 16` hard-code bằng `<Spacer size="4" />`

### MI-02-11 — `ProgressBar` + `ProgressCircle` atom (1h)

- File: `components/atoms/ProgressBar.tsx` (linear) + `components/atoms/ProgressCircle.tsx` (SVG)
- Theme color + custom color prop
- Animated transition khi value đổi
- **AC**: Library screen có thể dùng `<ProgressCircle value={42} max={100} />` thay vì SVG inline

### MI-02-12 — `ScoreBadge` atom refactor (0.5h)

- Refactor `ScoreBadge` từ `components/ui.tsx` → `components/atoms/ScoreBadge.tsx`
- Add WCAG color rules: ≥7 success, 5.5-6.5 primary, <5.5 warning
- **AC**: Used ở ≥3 screen (result/history/statistics)

### MI-02-13 — Atom barrel export + Storybook-equivalent screen (1h)

- File `components/atoms/index.ts` re-export hết
- Tạo screen ẩn `app/_dev/atom-gallery.tsx` (gated `__DEV__`) hiển thị tất cả atom variant
- **AC**: `router.push('/_dev/atom-gallery')` → grid hiển thị mọi atom

### MI-02-14 — ESLint rule + migration alias (0.5h)

- Optional: ESLint custom rule cảnh báo dùng `TouchableOpacity` direct (suggest dùng `<Button>` atom)
- Update README/CLAUDE.md mobile section
- **AC**: Lint cho file ví dụ đưa ra warning

**Tổng MI-02: 12h**

---

## Phase MI-03 — Molecules & Organisms (10h)

**Mục tiêu**: Build component cấp trung gian dùng atom.

### MI-03-01 — `Card` molecule (1h)

- File: `components/molecules/Card.tsx`
- Variants: `elevated | outlined | tonal | gradient`
- Slots: `header, body, footer, leftAccessory, rightAccessory`
- Optional `onPress` với scale animation + haptic
- **AC**: Vocabulary/Grammar list dùng `<Card variant="gradient" gradient={theme.colors} />` thay vì inline

### MI-03-02 — `ListItem` molecule (1h)

- File: `components/molecules/ListItem.tsx`
- Variants: `default | with-avatar | with-icon | with-control`
- Title, subtitle, trailing (icon/badge/switch/chevron)
- onPress + selected state
- **AC**: Settings tab + drawer items + notification list rebuild với atom

### MI-03-03 — `SearchBar` molecule (0.5h)

- File: `components/molecules/SearchBar.tsx`
- Input + search icon + clear + optional voice mic
- Debounce 300ms qua prop `onSearch`
- **AC**: Intensive index + community + history search refactor

### MI-03-04 — `EmptyState` molecule (1h)

- File: `components/molecules/EmptyState.tsx`
- Props: `illustration, title, description, primaryAction, secondaryAction`
- Vertical layout center
- **AC**: 5 screen rollout (history empty, leaderboard empty, search no result, etc.)

### MI-03-05 — `ErrorState` molecule (0.5h)

- File: `components/molecules/ErrorState.tsx`
- Same shape as EmptyState + retry button mặc định
- Variants: `network | server | unknown | empty-permission`
- **AC**: Replace 5+ inline error in screens

### MI-03-06 — `BottomSheet` organism (1.5h)

- File: `components/organisms/BottomSheet.tsx`
- Wrap RN Modal với gesture handler / Reanimated swipe-down to dismiss
- Snap points: `30%, 60%, 90%` configurable
- Backdrop fade + blur (optional)
- **AC**: ActionSheet trong AccountTab + Comment in community refactor sang BottomSheet

### MI-03-07 — `ConfirmDialog` organism (1h)

- File: `components/organisms/ConfirmDialog.tsx`
- Replace `Alert.alert` calls
- Variants: `destructive | warning | confirm | info`
- Primary + secondary action buttons
- **AC**: Replace ≥5 `Alert.alert` (logout, delete account, remove avatar, etc.)

### MI-03-08 — `Header` organism (1h)

- File: `components/organisms/Header.tsx`
- Variants: `default | large | transparent | centered`
- Slots: leftAction (back/menu), centerTitle/subtitle, rightActions[]
- Auto safe area top
- **AC**: 10+ screen replace custom header với `<Header />` atom

### MI-03-09 — `ScreenContainer` template (0.5h)

- File: `components/templates/ScreenContainer.tsx`
- Wrap: SafeArea (configurable edges) + theme bg + StatusBar style
- Slot: header + body + footer
- **AC**: ≥10 screen use; status bar auto change theo dark/light

### MI-03-10 — `DataScreen` template (1.5h)

- File: `components/templates/DataScreen.tsx`
- Props: `loading, error, empty, data, renderItem, skeleton, emptyState, errorState`
- Tự động render skeleton khi loading, EmptyState khi data rỗng, ErrorState khi error
- **AC**: Vocabulary/Grammar/Community/History/Notification list refactor — code mỗi screen giảm ≥30%

### MI-03-11 — Molecules barrel + gallery (0.5h)

- File `components/molecules/index.ts` + `components/organisms/index.ts`
- Mở rộng `app/_dev/atom-gallery.tsx` với section "Molecules" + "Organisms"
- **AC**: Gallery render mọi variant

### MI-03-12 — `PressableCard` molecule (0.5h)

- File: `components/molecules/PressableCard.tsx`
- Card wrapper với onPress haptic + scale 0.98
- **AC**: Explore module cards + Library skill cards use it

**Tổng MI-03: 10h**

---

## Phase MI-04 — Loading / Empty / Error UX Rollout (8h)

**Mục tiêu**: Áp dụng Skeleton + EmptyState + ErrorState xuyên suốt.

### MI-04-01 — Skeleton patterns library (1h)

- Tạo `components/skeletons/` với pattern preset:
  - `BookListSkeleton.tsx` — match `BookCard` layout (gradient block, title, progress bar)
  - `LessonListSkeleton.tsx`
  - `ExamCardSkeleton.tsx`
  - `PostCardSkeleton.tsx`
  - `StatsSkeleton.tsx`
  - `DeckCardSkeleton.tsx`
- Export barrel
- **AC**: Mỗi skeleton render trong gallery; thử trên thiết bị thấy shimmer mượt

### MI-04-02 — Source illustrations cho empty states (1h)

- Tạo folder `assets/empty-states/` với 7 SVG file (xem `02-improvement-plan.md` §4.1):
  - `empty-history.svg`, `empty-notifications.svg`, `empty-bookmarks.svg`, `empty-search.svg`, `empty-network.svg`, `empty-deck.svg`, `empty-leaderboard.svg`
- Có thể dùng undraw.co (CC0) hoặc tự vẽ minimal
- Export qua `assets/empty-states/index.ts` map name → require()
- **AC**: 7 file tồn tại, có theme-friendly color (slate + accent yellow)

### MI-04-03 — Rollout Vocabulary tab (0.5h)

- File: `app/(tabs)/vocabulary.tsx`
- Replace `ActivityIndicator` fullscreen → `<BookListSkeleton count={3} />`
- Replace inline empty → `<EmptyState illustration="empty-bookmarks" title="No vocabulary books yet" />`
- **AC**: Pull-to-refresh hoạt động + skeleton mượt + empty hiển thị khi reset

### MI-04-04 — Rollout Grammar tab (0.5h)

- Similar to MI-04-03 cho `app/(tabs)/grammar.tsx`
- **AC**: Skeleton + empty visible

### MI-04-05 — Rollout Community tab (0.5h)

- File: `app/(tabs)/community.tsx`
- `<PostCardSkeleton count={3} />` khi loading
- `<EmptyState illustration="empty-bookmarks" title="No posts yet" primaryAction="Create first post" />`
- **AC**: Test trên dev mock empty array

### MI-04-06 — Rollout IELTS History (0.5h)

- File: `app/ielts/history.tsx`
- Skeleton + empty
- **AC**: Visible khi fresh account

### MI-04-07 — Rollout Notification screen (0.5h)

- File: `app/notification.tsx`
- Skeleton + empty
- **AC**: Empty với mascot icon Bell

### MI-04-08 — Rollout Intensive index (0.5h)

- File: `app/ielts/intensive/index.tsx`
- Skeleton card + empty group state
- **AC**: When switching skill tab → skeleton hiện trong 200-500ms

### MI-04-09 — Rollout Statistics (0.5h)

- File: `app/ielts/advanced/statistics.tsx`
- `<StatsSkeleton />` cho 4 chart trong khi load
- **AC**: Chart fade-in khi data về

### MI-04-10 — Rollout Vocab Lab tabs (1h)

- Files: `components/vocab-lab/DecksTab.tsx`, `BrowseTab.tsx`, `StatsTab.tsx`, `MarketplaceTab.tsx`
- Skeleton + EmptyState cho mỗi tab
- **AC**: Mỗi tab có loading/empty UX riêng phù hợp

### MI-04-11 — Replace `Alert.alert` toàn bộ (1h)

- Grep `Alert.alert` → list ~10-15 vị trí
- Replace với `<ConfirmDialog />` molecule
- Logout / Delete account / Remove avatar / Cancel sub → confirm dialog
- Validation error → Toast (đã có)
- **AC**: 0 `Alert.alert` còn lại trong app (trừ có lý do đặc biệt)

### MI-04-12 — Error retry pattern rollout (1.5h)

- Wrap `try/catch` trong các fetch logic — khi catch error:
  - Set `error` state
  - Render `<ErrorState onRetry={refetch} />` thay vì silent + console.error
- Áp dụng cho: vocabulary/grammar/community/notification/history/statistics/vocab-lab
- **AC**: Tắt mạng → mọi screen show error state với retry button hoạt động

**Tổng MI-04: 8h**

---

## Phase MI-05 — Brand Refresh & Visual Polish (8h)

**Mục tiêu**: Đồng nhất brand visual cross-app.

### MI-05-01 — Audit assets/ folder (0.5h)

- Liệt kê toàn bộ asset: logo, app icon, splash, illustration
- So với web `frontend-web/public/` để sync brand mark
- **AC**: Tài liệu inventory trong `audit-assets.md`

### MI-05-02 — App icon polish (1h)

- File: `assets/icon.png` + `assets/adaptive-icon.png` + `app.json`
- Đảm bảo Android adaptive icon foreground/background đúng spec (108x108dp foreground, 72x72dp safe zone)
- iOS icon all sizes via Expo auto-generation
- **AC**: Build dev client → app icon đẹp trên cả 2 platform; round/squircle preview OK

### MI-05-03 — Splash screen refresh (1h)

- File: `assets/splash.png` (compose: yellow `#FFC600` bg + logo white + tagline)
- Update `app.json` splash config: `resizeMode: 'cover'`, `backgroundColor: '#FFC600'`
- Thêm `expo-splash-screen` hide animation (fade out 300ms)
- **AC**: Cold start → splash show đúng, fade smoothly

### MI-05-04 — Gradient rules document (0.5h)

- Tạo `docs/mobile-improvement/brand-gradients.md`:
  - Brand gradient: `linear-gradient(135deg, #FFC600 → #FFD93D)` chỉ dùng hero CTA + featured banner
  - Skill gradient: defined cho mỗi skill, dùng tối đa 1 lần per screen
  - Lexon AI gradient: chỉ dùng cho FAB + chat AI header avatar
- **AC**: 1 file doc, có hex codes + use cases

### MI-05-05 — Apply gradient rules ở Home + Explore (1.5h)

- Refactor `app/(tabs)/index.tsx` Home hero CTA dùng brand gradient
- Refactor `app/(tabs)/explore.tsx` featured banner dùng brand gradient thay vì slate (hoặc giữ slate cho dark accent — quyết định trong doc)
- Polish glow effects → giảm intensity nếu phản tác dụng
- **AC**: Visual review đẹp; không có quá nhiều màu xung đột

### MI-05-06 — Skill colors usage audit (0.5h)

- Grep `COLORS.skill.` → liệt kê file usage
- Đảm bảo: skill color CHỈ ở card/badge/chart, KHÔNG ở primary CTA, KHÔNG ở tab bar
- **AC**: Audit log + 0 violation

### MI-05-07 — Tab bar polish (0.5h)

- File: `app/(tabs)/_layout.tsx`
- Tab bar background gradient subtle (theme-aware) hoặc giữ solid
- Active indicator: dot dưới label hoặc subtle pill
- Tab badge styling refresh
- **AC**: Tab bar consistent với theme; FAB Lexon AI position không che tab

### MI-05-08 — Status bar handling per screen (0.5h)

- Setup `expo-status-bar` styles trong `ScreenContainer` template (MI-03-09)
- Tab background light → status dark, ngược lại
- Onboarding/Diagnostic screens override translucent
- **AC**: Switch screen → status bar style đúng

### MI-05-09 — Typography pass (1.5h)

- Audit headings: replace raw `fontSize` ≥ 24 với `<Text variant="display|headline|title" />`
- Audit body: replace raw `fontSize: 13/14/15/16` với `<Text variant="body|label" />`
- Document trong `docs/mobile-improvement/typography-cheatsheet.md`
- **AC**: ≥10 screen migrate; visual review consistent

### MI-05-10 — Microcopy refresh (0.5h)

- Review tất cả "Submit"/"OK"/"Cancel" generic → đổi sang context-rich
- Loading text dùng full sentence ("Loading your books..." thay vì spinner trống)
- **AC**: ≥10 screen có copy update

**Tổng MI-05: 8h**

---

## Phase MI-06 — Auth Screens Redesign (4h)

**Mục tiêu**: Login/Register chỉn chu, theme-aware, accessible.

### MI-06-01 — Remove pre-filled credentials login (0.1h)

- File: `app/(auth)/login.tsx`
- Xoá `useState('test1@gmail.com')` + `useState('123456')` default
- **AC**: Login screen mở với input rỗng

### MI-06-02 — Migrate login screen to atoms (1h)

- File: `app/(auth)/login.tsx`
- Import `<FormField>`, `<Button>`, `<Text>` từ atoms
- Email field: `leftIcon="mail-outline"`
- Password field: `secureTextEntry` (built-in show/hide toggle)
- Button: variant `primary`, full width, `onPrimary` color text
- Thêm `useTheme()` để theme-aware
- **AC**: Toggle dark mode → login screen tự đổi; no `COLORS` static still in file

### MI-06-03 — Inline validation + error UI (1h)

- Add state `emailError, passwordError`
- Validate `onBlur`:
  - Email: regex match
  - Password: min 6 chars
- Show error qua `<FormField error={...} />`
- Disable submit khi form invalid
- **AC**: Type invalid email + blur → red text dưới input; submit disabled

### MI-06-04 — "Forgot password" link + Remember me toggle (0.5h)

- Add `<Link href="/(auth)/forgot-password">Forgot password?</Link>` (route placeholder)
- Add `<Switch>` "Remember me" với AsyncStorage `auth-remember`
- **AC**: UI render đúng; switch persist qua reload

### MI-06-05 — Register screen polish (1h)

- File: `app/(auth)/register.tsx`
- Same atom migration as login
- Add password strength indicator (mini progress bar)
- Add confirm password field
- Inline validation
- **AC**: Visual match login design; validation works

### MI-06-06 — Auth screen header illustration (0.4h)

- Add SVG illustration top of auth screens (book + speech bubble + headphone)
- Theme-aware color
- **AC**: Looks branded, not generic

**Tổng MI-06: 4h**

---

## Phase MI-07 — Home Tab Redesign (8h)

**Mục tiêu**: Personalized home với continue learning + daily goal + leaderboard.

### MI-07-01 — Greeting header section (1h)

- File: `app/(tabs)/index.tsx`
- Top section: `<Avatar source={user.avatarUrl} name={user.firstName} />` + greeting text
- Streak chip "🔥 12 day streak"
- Notification button (đã có) keep
- **AC**: Show user name + streak; render đúng cả khi avatar null (fallback)

### MI-07-02 — Daily goal card (1h)

- Card với progress: "Today's Goal: 24/30 min"
- Linear progress bar yellow
- Tap → navigate to goal settings
- **AC**: API call lấy daily progress; card update realtime

### MI-07-03 — Continue Learning carousel (1.5h)

- Horizontal scroll cards: "Last exam" / "Last vocab unit" / "Last speaking part"
- Card có cover image + title + "Continue →" CTA
- Backend cần endpoint `/users/me/recent-activity` (nếu chưa có → defer hoặc dùng client-side cache)
- **AC**: 3 card hiển thị; tap → navigate đúng screen detail

### MI-07-04 — Recommended for you section (1h)

- Carousel 3 module card với illustration
- Logic: hiển thị module user chưa thử (compare `progress` data)
- **AC**: Algorithm đơn giản: nếu user mới → show Foundation; nếu profile band <6 → IELTS Basic; nếu ≥6 → Advanced

### MI-07-05 — Weekly leaderboard preview (0.5h)

- Card hiển thị "Your rank #12 ↑ 3 spots"
- Tap → mở leaderboard view
- **AC**: Use existing `gamificationApi.getLeaderboard()`

### MI-07-06 — Quick actions row (0.5h)

- Row 4 quick action buttons: "Mock Exam" / "Vocab Quiz" / "Speaking Practice" / "Pronunciation"
- IconButton style với label
- **AC**: Tap → navigate đúng

### MI-07-07 — Background polish (0.5h)

- Remove cloudinary background image full-screen
- Replace với subtle pattern hoặc solid color theme-aware
- Hero illustration trang trí top right (decorative)
- **AC**: Home không còn dark forced; theme-aware

### MI-07-08 — Home skeleton + first-load animation (1h)

- `<HomeSkeleton />` khi loading user data
- Staggered FadeInDown cho từng section
- **AC**: Loading state đẹp; first paint ≤1s

### MI-07-09 — Empty state cho new user (0.5h)

- Khi user mới đăng ký, không có recent activity:
  - "Welcome! Let's start with a diagnostic test" card to-go
- **AC**: Đăng ký mới → vào Home thấy hint clear

### MI-07-10 — Pull-to-refresh + telemetry (0.5h)

- Refresh control yellow tint
- Fire analytics event `home_viewed` + `home_continue_tapped` (nếu có Mixpanel/PostHog)
- **AC**: Pull refresh → reload all sections

**Tổng MI-07: 8h**

---

## Phase MI-08 — Explore + IELTS Tab + Drawer Polish (10h)

### MI-08-01 — Explore tab adopt atoms (1h)

- File: `app/(tabs)/explore.tsx`
- Replace TouchableOpacity custom → `<PressableCard>` molecule
- Replace Text hard-coded → `<Text variant>`
- **AC**: Visual giống cũ + theme-aware + brand đúng

### MI-08-02 — Explore: Continue learning section thêm (0.5h)

- Top section: "Continue learning" giống Home nhưng compact (1 row)
- **AC**: Nếu user có recent → hiển thị, không thì hide

### MI-08-03 — Explore: Recommendation algorithm (1h)

- "Recommended modules" với ranking dựa trên: chưa thử / weak skill (từ stats)
- **AC**: Logic deterministic + tested với 2-3 user profile mẫu

### MI-08-04 — IELTS tab — Library card theme-aware (1.5h)

- File: `components/ielts/LibraryContent.tsx`
- Refactor `SKILL_THEMES` với 2 mode (light/dark)
- Card bg dùng `colors.surface` + accent từ skill color
- Bookmarks card theme-aware
- **AC**: Toggle theme → skill cards không còn hard-coded `#FAF7F2`

### MI-08-05 — Library section: add header subtitle + progress overview (0.5h)

- "Library" title + subtitle "Track your progress across 4 IELTS skills"
- Progress overview row: "Completed: 23/120 lessons"
- **AC**: Visible at top of library

### MI-08-06 — Drawer polish (1h)

- File: `components/ui/SharedDrawer.tsx`
- Better visual: avatar + tier badge top, divider, nav items với icon background
- Footer: logout + version number
- **AC**: Drawer mở → looks premium; active item highlighted

### MI-08-07 — Roadmap screen polish (1h)

- File: `app/ielts/roadmap.tsx`
- Replace inline styles với atoms
- Add stage progress card with illustration
- **AC**: Visual sướng mắt; theme-aware

### MI-08-08 — Dashboard screen polish (1.5h)

- File: `app/ielts/dashboard.tsx`
- Header: hero band chart (donut showing latest band)
- Recent tests + practice list using `<Card>` + `<ListItem>` molecules
- **AC**: Replace 80% inline styles

### MI-08-09 — History screen polish (1h)

- File: `app/ielts/history.tsx`
- Group by month with sticky header
- Each row use `<ListItem>` + ScoreBadge
- Tap → result screen
- Skeleton + empty done in MI-04
- **AC**: Looks like timeline; scroll smooth

### MI-08-10 — Statistics screen split + polish (1h)

- File: `app/ielts/advanced/statistics.tsx`
- Tách 4 chart subcomponent: `<BandTrendChart>`, `<SkillBreakdownChart>`, `<PracticeFrequencyChart>`, `<WeaknessRadarChart>`
- Use `<Card>` molecule wrap mỗi chart
- **AC**: File <500 lines; render đúng

**Tổng MI-08: 10h**

---

## Phase MI-09 — Profile + Community + Vocab/Grammar Polish (10h)

### MI-09-01 — Profile tab shell cleanup (1h)

- File: `app/(tabs)/profile.tsx`
- Move toàn bộ state hooks vào sub-tab components
- Shell chỉ render `<Header>` + tab switcher + `<TabContent>`
- **AC**: File <300 lines; sub-tab quản lý state riêng

### MI-09-02 — AccountTab polish (1.5h)

- File: `components/profile/AccountTab.tsx`
- Avatar section: use `<Avatar size="xl">` + edit button overlay
- Replace ActionSheet với `<BottomSheet>` organism
- Subscription card: use `<Card>` + `<Badge variant="tier">` + status row + manage button
- Form field: use `<FormField>` cho first/last name + password change
- **AC**: Visual chỉn chu + theme-aware + all replaced

### MI-09-03 — StatsTab polish (1h)

- File: `components/profile/StatsTab.tsx`
- Stats cards: 4 metric cards với icon + value + delta
- Add achievement showcase row (3 latest unlocked)
- XP progress bar to next level
- **AC**: Đầy đặn hơn; ≥6 visual element

### MI-09-04 — SettingsTab polish (0.5h)

- File: `components/profile/SettingsTab.tsx`
- Use `<ListItem variant="with-control">` cho switch settings
- Group: Appearance / Notifications / Account / Support
- **AC**: Cleaner; ≥6 setting items grouped

### MI-09-05 — Community tab polish (1.5h)

- File: `app/(tabs)/community.tsx`
- Top section: tab pills `<TabPill>` molecule
- Post list: use `DataScreen` template
- Create post FAB: prominent yellow gradient button bottom-right (không conflict Lexon FAB)
- **AC**: FAB visible without overlap; tab switch smooth

### MI-09-06 — PostCard refresh (1h)

- File: `components/community/PostCard.tsx`
- Use `<Avatar>` + `<Card>` atoms
- Action row use `<IconButton>` (like/comment/bookmark/share)
- Image grid lazy load với `expo-image`
- **AC**: Visual match modern feed (Twitter/Instagram-like)

### MI-09-07 — CommentSheet refactor (1h)

- File: `components/community/CommentSheet.tsx`
- Migrate to `<BottomSheet>` organism với snap point 60%/90%
- Input bottom với keyboard avoiding
- **AC**: Open from PostCard → bottom sheet up; swipe down dismiss

### MI-09-08 — CreatePostModal refactor (0.5h)

- File: `components/community/CreatePostModal.tsx`
- Use `<BottomSheet>` snap 90%
- Use `<FormField>` cho title + body
- Image picker FAB inline
- **AC**: Modal feels native; submit polished

### MI-09-09 — Vocabulary tab polish (1h)

- File: `app/(tabs)/vocabulary.tsx`
- Replace inline book card → `<Card variant="gradient">`
- Add filter chips (`<Chip>`) by stage
- Progress bar atom
- **AC**: Theme-aware; visual cleaner

### MI-09-10 — Grammar tab polish (0.5h)

- File: `app/(tabs)/grammar.tsx`
- Mirror vocabulary polish
- **AC**: Consistent with vocabulary visual

### MI-09-11 — Vocab Lab tabs polish (1h)

- Files: `components/vocab-lab/DecksTab.tsx`, `BrowseTab.tsx`, `StatsTab.tsx`, `MarketplaceTab.tsx`
- Replace inline TouchableOpacity → atoms
- Charts: use `<Card>` wrap
- FAB: brand gradient
- **AC**: 4 tab visual cohesive

**Tổng MI-09: 10h**

---

## Phase MI-10 — IELTS Intensive Refactor & Exam UI Polish (12h)

**Mục tiêu**: Tách file 74K + polish exam UI.

### MI-10-01 — Audit file structure & test snapshot (1h)

- File: `app/ielts/intensive/[examId].tsx` (74.7K)
- Đọc kỹ, vẽ flowchart state machine, list các responsibility riêng
- Snapshot key behavior (timer countdown, answer save, audio playback, submit flow) — manual test record GIF/video
- **AC**: 1 doc `intensive-refactor-plan.md` với split blueprint

### MI-10-02 — Extract `useExamSession` hook (1.5h)

- File mới: `hooks/useExamSession.ts`
- Quản lý: session ID, status, fetch session detail, save answers (debounced), submit
- **AC**: Hook standalone, có type, không phụ thuộc UI

### MI-10-03 — Extract `useExamTimer` hook (1h)

- File mới: `hooks/useExamTimer.ts`
- Quản lý: countdown từ exam duration, warning <2 min, auto-submit khi 0
- **AC**: Reuse được cho cả Writing/Speaking/Intensive

### MI-10-04 — Extract `useAnswerState` hook (1.5h)

- File mới: `hooks/useAnswerState.ts`
- Quản lý: map question ID → answer, batch save, dirty tracking
- **AC**: Hook unit-testable (logic pure)

### MI-10-05 — Extract `ExamHeader` component (0.5h)

- File mới: `components/intensive/ExamHeader.tsx`
- Title + timer + exit button + progress dots (skill switch)
- **AC**: Use trong shell screen

### MI-10-06 — Extract `ExamAudioPlayer` component (1h)

- File mới: `components/intensive/ExamAudioPlayer.tsx`
- Wrap audio player UI specific cho exam (single play, hidden seek)
- **AC**: Reusable cho Listening

### MI-10-07 — Extract `ExamAnswerSheet` modal (1h)

- File mới: `components/intensive/ExamAnswerSheet.tsx`
- Sheet hiển thị grid câu hỏi với trạng thái (answered/flagged/blank)
- **AC**: Tap câu hỏi → scroll to question

### MI-10-08 — Refactor shell screen (1.5h)

- File: `app/ielts/intensive/[examId].tsx` rewrite
- Compose hooks + sub-components
- File mới phải <300 lines
- **AC**: Behavior unchanged (manual test pass); file size giảm ≥80%

### MI-10-09 — Polish exam UI visual (1h)

- Use `<ScreenContainer>` + `<Header>`
- Question card use `<Card>`
- Input use `<Input>` atom
- Submit confirm dùng `<ConfirmDialog>`
- **AC**: Visual cohesive với rest of app

### MI-10-10 — Result screen polish (1h)

- Files: `app/ielts/intensive/result/[sessionId].tsx`, `app/ielts/advanced/writing/result/[sessionId].tsx`, `app/ielts/advanced/speaking/result/[sessionId].tsx`
- Hero band card top + breakdown cards + feedback list
- Share button + retake button
- **AC**: Looks like exam certificate; export-ready visual

### MI-10-11 — Calculator polish (1h)

- File: `app/ielts/calculator.tsx` (32K)
- Extract band conversion logic vào `lib/bandCalculator.ts`
- Use `<Card>` + `<Input>` atoms
- Result band display với `<ScoreBadge>`
- **AC**: Logic isolated; UI <400 lines

**Tổng MI-10: 12h**

---

## Phase MI-11 — Animation & Micro-interactions (8h)

### MI-11-01 — Define animation tokens (0.5h)

- File: `constants/tokens/motion.ts` (đã tạo ở MI-01-01)
- Confirm duration + easing presets
- **AC**: Export đầy đủ

### MI-11-02 — Screen transitions config (0.5h)

- File: `app/_layout.tsx`
- `screenOptions: { animation: 'slide_from_right', animationDuration: 250 }`
- Modal stack: `presentation: 'modal', animation: 'slide_from_bottom'`
- **AC**: Navigate → smooth slide; modal slide up

### MI-11-03 — Haptic standard rollout (1.5h)

- Tạo `utils/haptics.ts`:
  ```ts
  export const haptics = {
    light: () => Haptics.impactAsync(Light),
    medium: () => Haptics.impactAsync(Medium),
    heavy: () => Haptics.impactAsync(Heavy),
    success: () => Haptics.notificationAsync(Success),
    warning: () => Haptics.notificationAsync(Warning),
    error: () => Haptics.notificationAsync(Error),
  };
  ```
- Apply trong atoms: `Button.onPress`, `IconButton`, `PressableCard`, `BottomSheet.onClose`
- **AC**: ≥30 touch surface có haptic

### MI-11-04 — List item entrance animation (1h)

- File: list screens (vocabulary/grammar/community/history)
- Use `<Animated.View entering={FadeInDown.delay(index * 50)}>` cho từng item
- **AC**: List render với cascade animation; chỉ play 1 lần khi mount

### MI-11-05 — Tab switch animation (0.5h)

- File: `app/(tabs)/_layout.tsx`
- Optional: dùng `Tabs.Screen` custom transition hoặc bằng Reanimated screen wrapper
- **AC**: Tab switch không phải jump cut

### MI-11-06 — Modal/Sheet animation (0.5h)

- File: `components/organisms/BottomSheet.tsx`
- Backdrop fade 200ms + sheet spring up (tension 80, friction 12)
- Swipe down to dismiss với gesture handler
- **AC**: Sheet feels native iOS/Android

### MI-11-07 — Loading state animation (0.5h)

- File: `components/atoms/Skeleton.tsx`
- Shimmer loop với LinearGradient sweep
- **AC**: Skeleton chạy mượt, không tax CPU

### MI-11-08 — Submit success animation (1h)

- Exam submit → confetti or success checkmark animation
- Use `react-native-reanimated` simple draw checkmark + scale spring
- **AC**: 3-second celebration before navigate result

### MI-11-09 — Refresh control animation (0.5h)

- Pull-to-refresh: brand yellow tint + custom icon
- **AC**: Refresh feels branded

### MI-11-10 — Toast animation polish (0.5h)

- File: `components/ui/Toaster.tsx`
- Spring entrance + slide-out on dismiss
- Stack support (nhiều toast cùng lúc)
- **AC**: Toast appear smooth, không jump

### MI-11-11 — Counter / number animation (0.5h)

- File: `components/atoms/AnimatedNumber.tsx`
- Tween từ value cũ → mới khi update
- Use in: streak count, XP, band score reveal
- **AC**: Smooth counter; not janky

**Tổng MI-11: 8h**

---

## Phase MI-12 — Accessibility Pass (10h)

### MI-12-01 — Atom-level a11y baseline (2h)

- Audit + add: `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState` props cho mọi atom
- Default behavior: `Button` role="button", `IconButton` accept `accessibilityLabel` required prop
- Hit slop ≥44 cho icon buttons
- **AC**: TypeScript force props ở `IconButton`; example screen reader read đúng

### MI-12-02 — Screen-level a11y rollout (3h)

- Audit 20 screen chính + add a11y props nơi thiếu
- Header: `accessibilityRole="header"`
- List item: `accessibilityRole="button"` + `accessibilityState={{ selected }}`
- Forms: `accessibilityLabel` cho input
- Modal: `accessibilityViewIsModal={true}` (iOS)
- **AC**: TalkBack flow login → home → exam works

### MI-12-03 — Live region cho timer + score (1h)

- File: `components/intensive/ExamHeader.tsx` timer dùng `accessibilityLiveRegion="polite"` mỗi phút
- File: result screen band score `accessibilityLiveRegion="polite"` khi reveal
- **AC**: Screen reader announce timer update

### MI-12-04 — Contrast pass (1h)

- Audit text-on-color combinations:
  - Login button: text `#0F172A` on `#FFC600` (contrast ≥10:1) ✅
  - Skill chips, tier badges
- Tool: dev `react-native-color-contrast-checker` hoặc manual với contrast tool
- **AC**: 100% pass WCAG AA

### MI-12-05 — Dynamic font scaling support (1.5h)

- Test font scale tăng 130%, 200% trong Settings device
- Fix overflow: dùng `flexShrink`, `numberOfLines`, hoặc allow font scale với `allowFontScaling` (default true)
- **AC**: Screen vẫn usable ở font scale 200%

### MI-12-06 — TalkBack/VoiceOver manual test (1.5h)

- Pixel device: enable TalkBack → walkthrough 10 main screens
- iPhone (if available): enable VoiceOver → walkthrough
- Document issues + fix
- **AC**: Critical flow (login → take exam → submit) works without sight

**Tổng MI-12: 10h**

---

## Phase MI-13 — Performance Pass & Cleanup (8h)

### MI-13-01 — Console cleanup (1h)

- Grep `console.log|warn|error` → list 77 vị trí
- Wrap mỗi cái với `if (__DEV__)` hoặc remove nếu debug
- Keep error trong ErrorBoundary fallback
- **AC**: <10 vị trí còn lại, đều có `if (__DEV__)`

### MI-13-02 — `as any` cleanup (1h)

- Grep `router.push.*as any` (27 vị trí) + others
- Replace với ROUTES helper function hoặc proper type
- **AC**: <5 cast remaining

### MI-13-03 — `React.memo` rollout cho list items (1h)

- Wrap: `PostCard`, `BookCard`, `LessonRow`, `SpeakingPartCard`, `AdvancedWritingPromptCard`, `DeckCard`
- Use `useCallback` cho onPress prop
- **AC**: Profile render → memo prevents re-render khi parent re-render

### MI-13-04 — Image optimization (1h)

- Audit `<Image>` usage: convert tất cả qua `expo-image`
- Set `cachePolicy="memory-disk"` default
- Thumbnail size phù hợp (avatar 80px source, không phải 800px)
- Add `placeholder={blurhash}` cho hero image
- **AC**: Image load smoother; memory không phồng

### MI-13-05 — FlatList tuning (1h)

- Audit lists dài: community, history, notification, vocab-lab decks
- Add: `initialNumToRender={10}`, `windowSize={10}`, `maxToRenderPerBatch={5}`, `removeClippedSubviews`, `getItemLayout` (nếu height fixed)
- **AC**: Scroll FPS ≥55 trên Pixel 5

### MI-13-06 — API caching layer (1h)

- File mới: `services/cache.ts` simple AsyncStorage TTL cache
- Apply cho: `vocabularyApi.getBooks`, `grammarApi.getBooks`, `intensive catalog` (TTL 5min)
- **AC**: Re-mount tab trong 5min → no API call

### MI-13-07 — Bundle size audit (1h)

- `npx expo export --dump-sourcemap` + `react-native-bundle-visualizer`
- Identify heavy deps: react-native-image-zoom-viewer? unused fonts?
- Tree-shake unused icons
- **AC**: Bundle size <40MB (target)

### MI-13-08 — Memory leak audit (1h)

- Run 30-min usage session với Profiler
- Look for: forgotten setInterval, AppState listener, audio recorder não disposed
- Add cleanup in useEffect return
- **AC**: Memory stable; no growth >50MB after 30min

**Tổng MI-13: 8h**

---

## Phase MI-14 — QA & Device Matrix (8h)

### MI-14-01 — Smoke test checklist (1h)

- File: `docs/mobile-improvement/qa-smoke-test.md`
- 25 critical user flow steps (login, take exam, vocab quiz, etc.)
- **AC**: Doc đầy đủ; sign-off bằng checkbox

### MI-14-02 — Device matrix test (4h)

- Test on:
  - Pixel 5 (Android 14)
  - Samsung A52 (Android 13) — mid-range typical
  - iPhone 12 (iOS 17) — if available
  - iPad mini (tablet view)
- Run smoke test trên mỗi device
- Document issues per device
- **AC**: 3-4 device passed; issues logged

### MI-14-03 — Visual regression check (1h)

- Screenshot 15 main screen at light + dark theme
- Compare với baseline (web design hoặc Figma if có)
- **AC**: No major visual deviation

### MI-14-04 — Theme switch stress test (0.5h)

- Toggle theme 10 lần liên tiếp on home, profile, exam mid-progress
- **AC**: No flicker, no crash, state preserved

### MI-14-05 — Network resilience test (0.5h)

- Toggle airplane mode during: list load, exam submit, audio play
- **AC**: Error state với retry; no crash

### MI-14-06 — Fix regression (1h)

- Address top issues found
- **AC**: All P0/P1 issues fixed; P2 logged for backlog

**Tổng MI-14: 8h**

---

## Phụ lục A — Bảng tổng kết ID task

| ID | Phase | Tên | Hour |
|---|---|---|---|
| MI-01-01 | 01 | Tạo `constants/tokens/` | 0.5 |
| MI-01-02 | 01 | Mở rộng ThemeTokens | 1 |
| MI-01-03 | 01 | Audit COLORS usage | 1 |
| MI-01-04 | 01 | Migrate Tab layout + 5 tab | 2 |
| MI-01-05 | 01 | Deprecate ui.tsx legacy | 0.5 |
| MI-01-06 | 01 | useThemedStyles hook | 1 |
| MI-02-01 → MI-02-14 | 02 | Atom library | 12 |
| MI-03-01 → MI-03-12 | 03 | Molecules + Organisms | 10 |
| MI-04-01 → MI-04-12 | 04 | Loading/Empty/Error rollout | 8 |
| MI-05-01 → MI-05-10 | 05 | Brand refresh | 8 |
| MI-06-01 → MI-06-06 | 06 | Auth redesign | 4 |
| MI-07-01 → MI-07-10 | 07 | Home redesign | 8 |
| MI-08-01 → MI-08-10 | 08 | Explore + IELTS + drawer | 10 |
| MI-09-01 → MI-09-11 | 09 | Profile + community + vocab | 10 |
| MI-10-01 → MI-10-11 | 10 | Intensive refactor + exam UI | 12 |
| MI-11-01 → MI-11-11 | 11 | Animation | 8 |
| MI-12-01 → MI-12-06 | 12 | A11y | 10 |
| MI-13-01 → MI-13-08 | 13 | Performance | 8 |
| MI-14-01 → MI-14-06 | 14 | QA matrix | 8 |
| **TOTAL** | | **102 task** | **~122h** |

---

## Phụ lục B — Dependency graph giữa phase

```
MI-01 (foundation)
  ├──> MI-02 (atoms)
  │       ├──> MI-03 (molecules/organisms)
  │       │       ├──> MI-04 (loading/empty rollout)
  │       │       ├──> MI-06 (auth redesign)
  │       │       ├──> MI-07 (home redesign)
  │       │       ├──> MI-08 (explore + ielts)
  │       │       ├──> MI-09 (profile + community + vocab)
  │       │       └──> MI-10 (intensive refactor)
  │       └──> MI-05 (brand refresh)  [partial dep]
  │
  ├──> MI-11 (animation) [after atoms partial done]
  ├──> MI-12 (a11y) [after atoms done]
  ├──> MI-13 (performance) [after major screen done]
  └──> MI-14 (QA) [must be last]
```

**Critical path**: MI-01 → MI-02 → MI-03 → MI-04..10 (parallel) → MI-11..13 (parallel) → MI-14.

---

## Phụ lục C — Định nghĩa "Done" cho mỗi phase

**Mỗi phase coi là "Done" khi**:

1. ✅ Tất cả task trong phase tick xong
2. ✅ `npm run lint && npm run type-check` không có lỗi mới
3. ✅ Manual smoke test 5-10 phút trên 1 device thật pass
4. ✅ Toggle light/dark mode → mọi screen mới refactor đổi đúng
5. ✅ Git commit với prefix `feat(mobile/MI-XX): ...` rõ ràng
6. ✅ Update `MEMORY.md` / `tasks.md` (file này) đánh dấu phase done

---

## Phụ lục D — Notes & quy ước

- **Brand color**: `#FFC600` (yellow) primary. Mọi CTA chính phải dùng màu này hoặc gradient của nó.
- **Spacing scale**: dùng tokens từ `constants/tokens/spacing.ts`, không hard-code 16/20/24 raw.
- **Typography**: dùng `<Text variant>` thay vì raw `fontSize`.
- **Color**: dùng `useTheme().colors.X`, không import `COLORS` static (trừ legacy đang chờ migrate).
- **Console**: chỉ trong `if (__DEV__)` block.
- **Comment**: chỉ thêm khi WHY không obvious. Default no comment.
- **File size**: target <500 lines/file, hard limit 700 lines.
- **A11y**: mọi touch target có `accessibilityLabel` + `accessibilityRole`.

---

## Lưu ý vận hành

- **Có thể chạy phase MI-04, MI-05 song song** với MI-02 (atom mới chỉ cần Skeleton + EmptyState xong, brand chỉ liên quan logo + token rule).
- **MI-10 nặng nhất** (refactor 74K file) — đặt giữa chừng, sau khi atoms/molecules ổn định.
- **MI-12 (a11y)** có thể split: atom-level làm sớm, screen-level làm sau MI-07/08/09 polish.
- **MI-14 (QA)** không được skip — đây là valve cuối trước Phase 18 (Android Release).

---

> Sau khi hoàn thành 14 phase này, app sẽ sẵn sàng để bước vào **Phase 18 — Android Release** (đã có sẵn trong [`../mobile-development/tasks.md`](../mobile-development/tasks.md) P18-01 → P18-20).
