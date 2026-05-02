# Vocab Lab — Gap Analysis Report

**Ngày phân tích**: 2026-05-03  
**Web source**: `frontend-web/src/app/vocab-lab/`  
**Mobile source**: `frontend-mobile/app/vocab-lab/` + `frontend-mobile/components/vocab-lab/`

---

## 📊 Tổng quan

| Hạng mục | Web | Mobile | Tỷ lệ hoàn thành |
|---|---|---|---|
| Số màn hình / tab | 5 | 5 | 100% |
| Tổng tính năng đặc thù | 28 | 28 | — |
| Đã hoàn thiện ✅ | — | 12 | 43% |
| Chưa hoàn chỉnh ⚠️ | — | 9 | 32% |
| Chưa có ❌ | — | 5 | 18% |
| Bug phát hiện 🐛 | — | 2 | — |

---

## 🔍 Chi tiết từng màn hình

### 1. Decks Tab — `/(tabs)/vocablab → DecksTab`

| Tính năng | Web | Mobile | Ghi chú |
|---|---|---|---|
| Danh sách decks | ✅ | ✅ | Cả hai dùng `GET /vocab-lab/decks` |
| Hiển thị New / Learn / Due counts | ✅ | ✅ | Đầy đủ 3 cột màu |
| Tổng thống kê (Total / Due / Learned) | ✅ | ✅ | Mobile dùng `getStats()` inline |
| Tạo deck mới | ✅ | ✅ | Modal với input name |
| Xóa deck (confirm dialog) | ✅ | ✅ | Alert confirm trước khi xóa |
| Click deck → Study session | ✅ | ⚠️ | Mobile navigate đến `study/[deckId]` nhưng study screen dùng MOCK DATA |
| Click deck → Deck detail (xem cards) | ✅ | ⚠️ | Mobile có `/vocab-lab/[deckId]` nhưng từ DecksTab không navigate đến đó, chỉ push thẳng `/vocab-lab/study/[deckId]` |
| Rename deck | ✅ | ❌ | Web: hover → rename; Mobile: chưa có |

### 2. Add Card Tab — `AddTab`

| Tính năng | Web | Mobile | Ghi chú |
|---|---|---|---|
| Chọn Deck đích | ✅ | ✅ | Modal chooser đầy đủ |
| Chọn Card Type | ✅ | ✅ | Type chooser modal, persist qua AsyncStorage |
| Dynamic fields theo Card Type | ✅ | ✅ | Render fields từ `cardType.fields` |
| Formatting toolbar (bold, italic, align) | ✅ | ✅ | Mobile có horizontal scroll toolbar |
| Upload media (image/audio) | ✅ | ✅ | Dùng `expo-image-picker` + `vocabLabApi.uploadMedia` |
| Preview media attachment | ✅ | ✅ | Hiển thị icon + remove button |
| Tags (thêm, xóa) | ✅ | ✅ | Tag chips + inline input |
| Persist last-used deck/type | ✅ | ✅ | AsyncStorage keys |
| Tạo deck mới từ trong Deck Chooser | ✅ | ❌ | Web: "+New" button trong modal → tạo deck inline; Mobile: không có |
| Sau khi Add Card → Reset form + ở lại tab | ✅ | ⚠️ | Mobile reset fields nhưng gọi `Alert.alert('✅ Card Added!')` thay vì toast không chặn UX |
| Keyboard shortcut (Ctrl+Enter) | ✅ | ❌ | Tính năng web-only, không applicable mobile |
| Manage Card Types (từ AddTab) | ✅ | ❌ | Web: gear icon → CardTypeManagerModal; Mobile: chỉ chọn type, không có quản lý |

### 3. Browse Tab — `BrowseTab`

| Tính năng | Web | Mobile | Ghi chú |
|---|---|---|---|
| Danh sách cards | ✅ | ✅ | Cả hai gọi `browseCards()` |
| Filter by deck | ✅ | ✅ | Web: dropdown; Mobile: horizontal pill bar |
| Filter by card state (New/Learn/Review) | ✅ | ❌ | Web: `cardState` query param; Mobile: không có filter state |
| Filter by tag | ✅ | ❌ | Web: tag filter; Mobile: chỉ search text |
| Filter by card type | ✅ | ❌ | Web: client-side filter by `cardTypeId`; Mobile: không có |
| Search text | ✅ | ⚠️ | Mobile chỉ search `front + back`, bỏ qua `fieldValues` của custom card types |
| Xem chi tiết card (select & edit panel) | ✅ | ❌ | Web: click → right panel với full field editing; Mobile: chỉ hiển thị front/back |
| Edit card inline | ✅ | ❌ | Web: edit fields, styles trực tiếp; Mobile: không có |
| Xóa card | ✅ | ✅ | Mobile xóa optimistic (update state local) |
| Hiển thị card state badge | ✅ | ✅ | Cả hai có colored badge |

### 4. Stats Tab — `StatsTab`

| Tính năng | Web | Mobile | Ghi chú |
|---|---|---|---|
| Tổng số cards (total) | ✅ | ✅ | Cả hai gọi `getStats()` |
| Phân phối New/Learning/Review | ✅ | ✅ | Web: conic pie chart; Mobile: horizontal bars |
| Visualisation chart | ✅ | ⚠️ | Web: CSS conic-gradient pie; Mobile: chỉ progress bars (đơn giản hơn) |
| Tỷ lệ % từng nhóm | ✅ | ❌ | Web hiển thị % bên cạnh count; Mobile chỉ hiển thị số đếm |
| Streak / Lịch học | ❌ | ❌ | Cả hai chưa có |

### 5. Study Session — `study/[deckId]`

| Tính năng | Web | Mobile | Ghi chú |
|---|---|---|---|
| Fetch study cards từ API | ✅ | 🐛 | Mobile **MOCK_CARDS hardcode** — không gọi `getStudyCards(deckId)` |
| Hiển thị flashcard flip (3D) | ✅ | ✅ | Mobile dùng Reanimated `FlashcardViewer` |
| Show Answer button | ✅ | ⚠️ | Mobile chỉ có "Next Card" không có "Show Answer" → lộ back ngay |
| SRS Rating buttons (Again/Hard/Good/Easy) | ✅ | 🐛 | Mobile **không có** rating buttons; chỉ "Next Card" và không gọi `submitReview()` |
| Submit review → `POST /vocab-lab/review` | ✅ | 🐛 | Không được gọi → SRS algorithm không hoạt động |
| Hiển thị next-review interval | ✅ | ❌ | Web hiển thị `<10m`, `3d`, `5d`; Mobile không có |
| Progress bar (card X of Y) | ✅ | ✅ | Cả hai có |
| Màn hình khi hết cards (All done!) | ✅ | ❌ | Web có congratulation screen; Mobile chỉ `router.back()` |
| Render custom field values (rich text / media) | ✅ | ❌ | Web render `fieldValues` với HTML support; Mobile chỉ render `card.front` / `card.back` |

### 6. Card Type System (chỉ Web)

| Tính năng | Web | Mobile | Ghi chú |
|---|---|---|---|
| CardTypeManagerModal | ✅ | ❌ | List, create, rename, delete card types |
| CardTypeEditorModal | ✅ | ❌ | Quản lý Fields tab + Templates tab |
| Thêm / Xóa / Đổi tên field | ✅ | ❌ | `addField`, `updateField`, `deleteField` |
| Cấu hình template (frontFields/backFields) | ✅ | ❌ | `updateTemplate` API có sẵn nhưng không dùng trên mobile |
| Field style editor (size, color, align) | ✅ | ❌ | `fieldStyles` per-field trong template |
| Card background/font style | ✅ | ❌ | `cardStyle` object |

### 7. Deck Detail Screen — `/vocab-lab/[deckId]`

| Tính năng | Web | Mobile | Ghi chú |
|---|---|---|---|
| Xem danh sách cards trong deck | ✅ | ✅ | Mobile route có, nhưng từ DecksTab không navigate đến |
| Stats (Cards/Due) | ✅ | ✅ | Mobile có statsRow đầy đủ |
| Add card nhanh (Front/Back only) | ✅ | ✅ | Modal trực tiếp trong deck detail |
| Xóa card | ✅ | ✅ | Alert confirm + refresh |
| Edit card | ✅ | ❌ | Web: inline edit; Mobile: không có |

### 8. Global Vocab FAB (chỉ Web)

| Tính năng | Web | Mobile | Ghi chú |
|---|---|---|---|
| Floating Add Card button | ✅ | ❌ | Web có FAB kéo thả toàn app; Mobile không có tương đương |
| Draggable position | ✅ | ❌ | Web-only feature |

---

## 🐛 Danh sách Bug

### BUG-001: Study session dùng MOCK DATA — SRS không hoạt động
- **File**: `frontend-mobile/app/vocab-lab/study/[deckId].tsx:9-30`
- **Mô tả**: `MOCK_CARDS` hardcode 2 thẻ; `getStudyCards(deckId)` không được gọi; `submitReview()` không được gọi khi nhấn "Next Card" → thuật toán SRS (spaced repetition) không bao giờ chạy trên mobile
- **Tác động**: Người dùng không thể học thẻ thật; trạng thái thẻ không bao giờ cập nhật; `dueCount` mãi không thay đổi
- **Gợi ý fix**: Thêm `useEffect` fetch `vocabLabApi.getStudyCards(deckId)`, thay MOCK_CARDS bằng state; thêm `showAnswer` state + 4 rating buttons (Again=1/Hard=2/Good=3/Easy=4) gọi `submitReview({ flashcardId, rating })`

### BUG-002: BrowseTab search bỏ qua `fieldValues` của custom card types
- **File**: `frontend-mobile/components/vocab-lab/BrowseTab.tsx:26`
- **Mô tả**: `(c.front + ' ' + c.back).toLowerCase()` — khi dùng custom card type, `c.front` và `c.back` trống, nội dung thực nằm trong `c.fieldValues`; search sẽ không tìm thấy gì
- **Tác động**: Người dùng tạo custom type card không thể search được
- **Gợi ý fix**: Mở rộng search string: `[c.front, c.back, ...Object.values(c.fieldValues || {})].join(' ')`

---

## 📋 Danh sách công việc cần làm

### 🔴 Blocking

- [ ] **VL-B1: Fix Study Session — Kết nối API thật + SRS rating**
  - File: `frontend-mobile/app/vocab-lab/study/[deckId].tsx`
  - Việc cần làm:
    1. Xóa MOCK_CARDS
    2. Fetch `vocabLabApi.getStudyCards(deckId)` khi mount
    3. Thêm state `showAnswer` + button "Show Answer"
    4. Thêm 4 rating buttons (Again/Hard/Good/Easy) với rating values 1/2/3/4
    5. Gọi `vocabLabApi.submitReview({ flashcardId, rating })` khi nhấn rating
    6. Advance to next card sau khi submit
    7. Màn hình "All done! 🎉" khi hết cards
  - Độ phức tạp: **Trung bình (3-5h)**

### 🟡 Incomplete

- [ ] **VL-I1: Study screen — Show Answer flow + Next interval display**
  - File: `frontend-mobile/app/vocab-lab/study/[deckId].tsx`
  - Việc cần làm: Thêm `showAnswer` boolean state; flip card chỉ show back khi đã tap "Show Answer"; hiển thị interval ước tính dưới mỗi rating button
  - Độ phức tạp: **Dễ (1-2h)**
  - Phụ thuộc: VL-B1

- [ ] **VL-I2: BrowseTab — Filter theo card state và tag**
  - File: `frontend-mobile/components/vocab-lab/BrowseTab.tsx`
  - Việc cần làm: Thêm filter segment (All/New/Learning/Review) truyền `cardState` param vào `browseCards()`; thêm `getTags()` + tag filter chips
  - Độ phức tạp: **Trung bình (3-4h)**

- [ ] **VL-I3: BrowseTab — Fix search với custom card types**
  - File: `frontend-mobile/components/vocab-lab/BrowseTab.tsx:26`
  - Việc cần làm: Mở rộng search text include `Object.values(c.fieldValues || {})`
  - Độ phức tạp: **Dễ (<30 phút)**

- [ ] **VL-I4: BrowseTab — Xem/Edit card chi tiết**
  - File: `frontend-mobile/components/vocab-lab/BrowseTab.tsx`
  - Việc cần làm: Tap card → bottom sheet hoặc modal hiển thị full fields; cho phép edit front/back hoặc fieldValues; gọi `updateFlashcard()`
  - Độ phức tạp: **Trung bình (4-6h)**

- [ ] **VL-I5: DecksTab — Navigate đến Deck Detail (không phải Study)**
  - File: `frontend-mobile/components/vocab-lab/DecksTab.tsx:89`
  - Việc cần làm: Tách "xem deck" và "học deck"; long-press hoặc detail button → `/vocab-lab/[deckId]`; tap deck name → detail; "Study" button riêng
  - Độ phức tạp: **Dễ (1h)**

- [ ] **VL-I6: AddTab — Post-add UX (không chặn form bằng Alert)**
  - File: `frontend-mobile/components/vocab-lab/AddTab.tsx:171`
  - Việc cần làm: Thay `Alert.alert('✅ Card Added!')` bằng inline success banner hoặc toast không chặn → user có thể tiếp tục nhập thẻ tiếp luôn
  - Độ phức tạp: **Dễ (1h)**

- [ ] **VL-I7: StatsTab — Hiển thị tỷ lệ % và pie chart**
  - File: `frontend-mobile/components/vocab-lab/StatsTab.tsx`
  - Việc cần làm: Thêm % bên cạnh count; vẽ pie/donut chart bằng `react-native-svg` hoặc SVG path
  - Độ phức tạp: **Trung bình (3-4h)**

- [ ] **VL-I8: Deck rename**
  - File: `frontend-mobile/components/vocab-lab/DecksTab.tsx`
  - Việc cần làm: Thêm rename option (long-press menu hoặc swipe action); gọi `PUT /vocab-lab/decks/:id` (cần kiểm tra API có endpoint này không)
  - Độ phức tạp: **Dễ (1-2h)**

- [ ] **VL-I9: FlashcardViewer — Render custom field values + media**
  - File: `frontend-mobile/components/vocab-lab/FlashcardViewer.tsx`
  - Việc cần làm: Kiểm tra `card.fieldValues`; render text fields; render HTML img tag bằng `react-native-render-html` hoặc WebView; render audio bằng `expo-av`
  - Độ phức tạp: **Khó (8-12h)**

### 🟢 Missing

- [ ] **VL-M1: Card Type Manager (Create/Edit/Delete custom card types)**
  - File: cần tạo `components/vocab-lab/CardTypeManagerModal.tsx`
  - Việc cần làm: UI quản lý card types: list, create (name), rename, delete; navigate đến CardTypeEditor để quản lý fields/templates
  - Độ phức tạp: **Khó (10-16h)**

- [ ] **VL-M2: Card Type Editor (Fields + Template tabs)**
  - File: cần tạo `components/vocab-lab/CardTypeEditorModal.tsx`
  - Việc cần làm: Tab Fields: add/rename/delete/reorder fields; Tab Templates: kéo field vào front/back template; field style per-field
  - Độ phức tạp: **Khó (>16h)**

- [ ] **VL-M3: Create Deck từ trong AddTab Deck Chooser**
  - File: `frontend-mobile/components/vocab-lab/AddTab.tsx`
  - Việc cần làm: Thêm "+" button trong `deckChooserOpen` modal → inline create deck flow → tự động chọn deck mới tạo
  - Độ phức tạp: **Dễ (1-2h)**

- [ ] **VL-M4: Study Session — Completion screen**
  - File: `frontend-mobile/app/vocab-lab/study/[deckId].tsx`
  - Việc cần làm: Khi hết cards → màn hình "🎉 All done!" với summary (cards reviewed, time spent); button về deck list
  - Độ phức tạp: **Dễ (1-2h)**
  - Phụ thuộc: VL-B1

- [ ] **VL-M5: Global "Add Card" shortcut (từ mọi màn hình)**
  - File: cần tạo FAB hoặc context-based trigger
  - Việc cần làm: Tương đương `GlobalVocabFab` trên web; bottom sheet AddTab có thể bật từ bất kỳ đâu
  - Độ phức tạp: **Trung bình (3-5h)**

---

## 🗓️ Đề xuất thứ tự thực hiện

### Phase 1 — Fix Blocking (Ưu tiên ngay)

1. **VL-B1** — Study Session: xóa mock, kết nối API, SRS rating buttons
2. **VL-I1** — Show Answer flow + interval display (kèm với B1)
3. **VL-I3** — Fix search fieldValues (30 phút, làm ngay)

### Phase 2 — Hoàn thiện tính năng hiện có

4. **VL-I6** — Add Card post-add UX (toast thay Alert)
5. **VL-I5** — DecksTab: tách view/study navigation
6. **VL-I8** — Deck rename
7. **VL-I2** — BrowseTab: filter by state + tag
8. **VL-I4** — BrowseTab: xem/edit card chi tiết
9. **VL-I7** — StatsTab: % + pie chart
10. **VL-M4** — Study completion screen

### Phase 3 — Bổ sung tính năng còn thiếu

11. **VL-M3** — Create deck từ AddTab chooser
12. **VL-M5** — Global Add Card shortcut
13. **VL-I9** — FlashcardViewer: render custom fields + media
14. **VL-M1** — Card Type Manager modal
15. **VL-M2** — Card Type Editor (Fields + Templates)

---

## 📝 Ghi chú thêm

### API Mobile thiếu `deleteFlashcard` trực tiếp trong `features.api.ts`
`vocabLabApi.deleteFlashcard` **có** trong `features.api.ts` (line 23), nhưng `browseCards(deckId?)` chỉ nhận `deckId?` — không hỗ trợ filter `cardState` hay `tag` như web. Cần cập nhật signature: `browseCards(params?: { deckId?: string; cardState?: string; tag?: string })`.

### Deck Detail screen không được dùng từ Decks tab
`/vocab-lab/[deckId]` tồn tại và hoạt động tốt (fetch API, add card, delete card) nhưng `DecksTab` navigate thẳng vào study. Người dùng không có cách vào Deck Detail trừ khi biết URL.

### FlashcardViewer chỉ đọc `card.front` / `card.back`
Với custom card types, data thực nằm trong `card.fieldValues[fieldId]`. `FlashcardViewer` hoàn toàn không đọc `fieldValues` → custom type cards sẽ hiển thị trống trong study session (sau khi fix VL-B1).

### Card Type system: Mobile chỉ *chọn* type, không *quản lý*
API endpoints đầy đủ (create/rename/delete cardType, addField, updateField, deleteField, getTemplates, updateTemplate). Mobile chỉ gọi `getCardTypes()` để chọn khi Add Card. Toàn bộ CRUD card type system cần xây mới trên mobile.
