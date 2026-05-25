# PHASE 6 — Đồng Bộ Điều Hướng IELTS (Intensive sub-sections + Advanced skill tabs)

> **Mục tiêu:** Đồng bộ cấu trúc điều hướng `ielts/intensive` và `ielts/advanced` của **mobile** cho khớp **web**.
> **Nguồn:** 2 vấn đề người dùng chỉ ra:
> 1. Web intensive có **2 mục con: Mock Tests + Test History** → mobile cần đồng bộ.
> 2. Web advanced: **cả 4 kỹ năng đều inline**; mobile thì Listening/Reading inline nhưng **Writing/Speaking lại điều hướng sang trang riêng** → không nhất quán.
> **Mức độ:** 🟡 Trung bình (IA/UX, không ảnh hưởng tính đúng đắn dữ liệu).
> **Phụ thuộc:** Độc lập với P1–P5.

---

## A. Đối chiếu hiện trạng Web ↔ Mobile

### A.1 — Issue 1: Intensive sub-sections

| | Web (`frontend-web`) | Mobile (`frontend-mobile`) |
|---|---|---|
| Màn intensive | `IntensiveContent.tsx` — sidebar có 2 accordion: **"Mock Test"** + **"Test History"** (`:763`, `:810`) | `app/ielts/intensive/index.tsx` — **chỉ** catalog "Mock Tests" (header `Mock Tests`); không có mục Test History |
| Test History | Link `/ielts/history?mode=mock` và `?mode=practice` (`:817`,`:825`) | **Đã có** `app/ielts/history.tsx` (mode tabs **Mock/Practice**, `:519`; title "Test History" `:501`; `getHistory()`+`getWritingHistory()`) — nhưng truy cập qua **Drawer → Insights → Test History** (`SharedDrawer.tsx`), KHÔNG nằm trong màn intensive |
| Pattern tái dùng | `HistoryContent({ embedded })` + `IntensiveContent({ embedded, initialView })` | Chưa có dạng `embedded`; `history.tsx` là màn độc lập (header + drawer riêng) |

**Bản chất gap:** Nội dung "Test History" **đã đủ** trên mobile; thiếu **trình bày nó như mục con của Intensive** (cạnh "Mock Tests") đúng như web. Đây là vấn đề IA/discoverability, không phải xây mới.

### A.2 — Issue 2: Advanced skill tabs

| | Web | Mobile |
|---|---|---|
| Cấu trúc | `AdvancedContent.tsx` — **1 màn, 4 tab inline**: L/R hiện list; **Writing → `<WritingCatalogContent/>` inline**; **Speaking → `<SpeakingCatalogContent/>` inline** | `app/ielts/advanced/index.tsx` — `handleTabChange`: L/R → `setActiveTab` (inline); **W/S → `router.push('/ielts/advanced/writing' | '/speaking')`** (rời màn) |
| Catalog Writing | Component `writing/WritingCatalogContent.tsx` (nhúng, **không** có route page riêng) | Màn độc lập `advanced/writing/index.tsx` (`AdvancedWritingIndexScreen`, có header + back) |
| Catalog Speaking | Component `speaking/SpeakingCatalogContent.tsx` (nhúng) | Màn độc lập `advanced/speaking/index.tsx` (`AdvancedSpeakingIndexScreen`, có header + back) |

**Bản chất gap:** Mobile bật tab W/S thì **chuyển màn**, còn L/R thì **không** → trải nghiệm lệch. Web giữ **toàn bộ 4 tab trong cùng màn**. Cần làm mobile khớp web: **tất cả 4 tab inline**.

> **Bằng chứng code (mobile `advanced/index.tsx`):**
> ```ts
> const handleTabChange = (tab) => {
>   if (tab === 'writing')  { router.push('/ielts/advanced/writing');  return; } // ← rời màn
>   if (tab === 'speaking') { router.push('/ielts/advanced/speaking'); return; } // ← rời màn
>   setActiveTab(tab); setSelectedType(null);                                     // L/R inline
> };
> const allParts = activeTab === 'listening' ? listeningParts : readingParts;     // ← W/S sẽ lấy nhầm readingParts
> ```

---

## B. Hướng giải quyết (chốt theo web = "embedded / inline")

Cả hai vấn đề có cùng một mẫu giải pháp như web: **tách phần thân màn thành component nhúng được (`embedded`)**, để màn cha render inline thay vì điều hướng.

- **Issue 1:** Thêm **segmented control `[Mock Tests | Test History]`** trên đầu màn Intensive; tách `history.tsx` → `<TestHistoryContent embedded />` để nhúng dưới mục "Test History".
- **Issue 2:** Tách `writing/index.tsx` → `<AdvancedWritingCatalog embedded />` và `speaking/index.tsx` → `<AdvancedSpeakingCatalog embedded />`; advanced index render inline theo `activeTab`, bỏ `router.push`.

---

## C. Danh sách công việc

### Issue 1 — Intensive: Mock Tests + Test History

#### NS-1.1 · Tách `history.tsx` thành `<TestHistoryContent embedded />` 🟡

- Tạo `components/ielts/TestHistoryContent.tsx` chứa **toàn bộ phần thân** của `app/ielts/history.tsx` (mode tabs Mock/Practice, skill tabs, part filter, search/sort, danh sách `HistoryCard`, điều hướng tới result).
- Prop `embedded?: boolean`:
  - `embedded = true`: **không** render `SafeAreaView` ngoài cùng, **không** header riêng, **không** `SharedDrawer` (để màn cha lo phần khung).
  - `embedded = false` (mặc định): giữ nguyên hành vi standalone.
- `app/ielts/history.tsx` trở thành **wrapper mỏng**: `SafeAreaView + header + SharedDrawer + <TestHistoryContent />` → giữ nguyên route `/ielts/history` + mục Drawer (deep-link không vỡ).
- Mirror đúng web: `HistoryContent({ embedded })`.

**File:** `app/ielts/history.tsx`, `components/ielts/TestHistoryContent.tsx` (mới)

**DoD:** `/ielts/history` chạy y như cũ; component dùng lại được ở nơi khác mà không kéo theo header/drawer.

#### NS-1.2 · Thêm segmented control `[Mock Tests | Test History]` vào màn Intensive 🟡

- Trong `app/ielts/intensive/index.tsx`, thêm state `section: 'mock' | 'history'` (mặc định `'mock'`; cho phép set từ `useLocalSearchParams` ví dụ `?section=history`).
- Đặt một **segmented control** ngay dưới header (trên các skill tabs):
  - `Mock Tests` → render catalog hiện tại (giữ nguyên skill tabs + search + accordion).
  - `Test History` → render `<TestHistoryContent embedded />`.
- Header có thể đổi tiêu đề theo section, hoặc giữ "IELTS Intensive" cho trung tính.
- Giữ nút "Custom" ở section Mock Tests (ẩn khi ở Test History nếu không phù hợp).

**File:** `app/ielts/intensive/index.tsx`

**DoD:** Trong màn Intensive, chuyển qua lại 2 mục con; "Test History" hiển thị đúng lịch sử (mock + practice) mà không rời màn.

#### NS-1.3 · Đồng bộ điểm vào & deep-link 🟢

- Giữ mục Drawer "Test History" → `/ielts/history` (không bỏ).
- (Tùy chọn) Web intensive còn tách "Per Part / Part Skill" dưới mỗi mục — mobile đã có `intensive/custom.tsx` (Per Part practice). Nếu muốn khớp sâu hơn: trong section "Mock Tests" thêm liên kết phụ "Per Part" → `ieltsIntensiveCustom`. Ưu tiên thấp.

**File:** `app/ielts/intensive/index.tsx`, `components/ui/SharedDrawer.tsx`

---

### Issue 2 — Advanced: 4 tab inline

#### NS-2.1 · Tách Writing catalog thành component nhúng 🟡

- Tạo `components/ielts/AdvancedWritingCatalog.tsx` từ thân `app/ielts/advanced/writing/index.tsx` (`AdvancedWritingPromptCard`, `UsageIndicator`, fetch prompts, item press → `ROUTES.ieltsAdvancedWriting(promptId)`).
- Prop `embedded?: boolean`: khi `true` bỏ `SafeAreaView` + header + back; data fetch on-mount như cũ.
- `advanced/writing/index.tsx` thành wrapper mỏng (header "Advanced Writing" + `<AdvancedWritingCatalog />`) để deep-link `/ielts/advanced/writing` vẫn chạy.

**File:** `app/ielts/advanced/writing/index.tsx`, `components/ielts/AdvancedWritingCatalog.tsx` (mới)

#### NS-2.2 · Tách Speaking catalog thành component nhúng 🟡

- Tương tự NS-2.1 cho `app/ielts/advanced/speaking/index.tsx` → `components/ielts/AdvancedSpeakingCatalog.tsx` (`SpeakingPartCard`, `SpeakingDeviceTest`, AsyncStorage, item press → `ROUTES.ieltsAdvancedSpeaking(partId)`).
- Lưu ý `SpeakingDeviceTest` + state AsyncStorage phải hoạt động khi nhúng.

**File:** `app/ielts/advanced/speaking/index.tsx`, `components/ielts/AdvancedSpeakingCatalog.tsx` (mới)

#### NS-2.3 · Advanced index render inline cả 4 tab (bỏ `router.push`) 🟡

- Sửa `handleTabChange`: **bỏ** 2 nhánh `router.push` cho writing/speaking → chỉ `setActiveTab(tab); setSelectedType(null);`.
- Trong phần body, render theo `activeTab`:
  - `listening | reading` → list parts hiện tại.
  - `writing` → `<AdvancedWritingCatalog embedded />`.
  - `speaking` → `<AdvancedSpeakingCatalog embedded />`.
- **Gate logic L/R-only** để tránh lỗi: `allParts`, `availableTypes`, filter chips, history banner chỉ tính/hiện khi `activeTab ∈ {listening, reading}` (hiện `allParts = activeTab==='listening'?listeningParts:readingParts` sẽ lấy nhầm `readingParts` cho W/S).
- Tránh **double-wrap `FeatureLock`**: catalog nhúng không tự bọc lại (màn advanced đã bọc), hoặc truyền cờ để bỏ.

**File:** `app/ielts/advanced/index.tsx`

**DoD:** Bấm 4 tab Listening/Reading/Writing/Speaking đều **ở lại cùng màn**, chỉ đổi nội dung — khớp web.

#### NS-2.4 · Dọn điểm vào trùng & giữ deep-link 🟢

- Các nơi đang `router.push(ROUTES.ieltsAdvancedSpeakingIndex)` / `'/ielts/advanced/writing'` (nếu có ở Drawer/dashboard) → cân nhắc trỏ về `/ielts/advanced?tab=writing|speaking` để mở đúng tab inline; hoặc giữ wrapper standalone.
- Hỗ trợ `useLocalSearchParams<{ tab }>` ở `advanced/index.tsx` để mở đúng tab khi vào từ deep-link.

**File:** `app/ielts/advanced/index.tsx`, các nơi điều hướng tới advanced writing/speaking

---

## D. Walkthrough (phác thảo code minh hoạ)

### D.1 — Segmented control trong Intensive (NS-1.2)

```tsx
// app/ielts/intensive/index.tsx
import { TestHistoryContent } from '@/components/ielts/TestHistoryContent';
const params = useLocalSearchParams<{ skill?: string; section?: string }>();
const [section, setSection] = useState<'mock' | 'history'>(
  params.section === 'history' ? 'history' : 'mock'
);

// ngay dưới <View style={styles.header}>:
<View style={styles.segment}>
  {(['mock', 'history'] as const).map((sec) => (
    <TouchableOpacity
      key={sec}
      style={[styles.segmentItem, section === sec && styles.segmentItemActive]}
      onPress={() => setSection(sec)}
      accessibilityRole="tab"
      accessibilityState={{ selected: section === sec }}
    >
      <Text style={[styles.segmentText, section === sec && styles.segmentTextActive]}>
        {sec === 'mock' ? 'Mock Tests' : 'Test History'}
      </Text>
    </TouchableOpacity>
  ))}
</View>

{section === 'mock' ? (
  <FeatureLock requiredTier="PREMIUM" featureName="IELTS Intensive Practice">
    {/* ... skill tabs + search + accordion catalog (giữ nguyên) ... */}
  </FeatureLock>
) : (
  <TestHistoryContent embedded />
)}
```

### D.2 — `TestHistoryContent({ embedded })` (NS-1.1)

```tsx
// components/ielts/TestHistoryContent.tsx
export function TestHistoryContent({ embedded = false }: { embedded?: boolean }) {
  /* ...toàn bộ logic từ history.tsx: mode Mock/Practice, skill tabs, fetchHistory, list... */
  const body = (
    <>
      {/* mode tabs + skill tabs + filters + FlatList HistoryCard */}
    </>
  );
  if (embedded) return body;               // màn cha lo SafeArea/header/drawer
  return <SafeAreaView edges={['top']}>{/* header + drawer + */}{body}</SafeAreaView>;
}

// app/ielts/history.tsx → wrapper mỏng:
export default function HistoryScreen() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      {/* header + SharedDrawer */}
      <TestHistoryContent />
    </SafeAreaView>
  );
}
```

### D.3 — Advanced 4 tab inline (NS-2.3)

```tsx
// app/ielts/advanced/index.tsx
const handleTabChange = (tab) => { setActiveTab(tab); setSelectedType(null); }; // bỏ router.push

const isLR = activeTab === 'listening' || activeTab === 'reading';
const allParts = activeTab === 'listening' ? listeningParts
               : activeTab === 'reading'   ? readingParts : [];   // gate W/S

// body:
{isLR ? (
  <> {/* filter chips + history banner + parts.map(...) như hiện tại */} </>
) : activeTab === 'writing' ? (
  <AdvancedWritingCatalog embedded />
) : (
  <AdvancedSpeakingCatalog embedded />
)}
```

---

## E. Điểm cần quyết định (Decision points)

1. **Test History trong Intensive: nhúng hay điều hướng?**
   - 🅰️ **Nhúng** `<TestHistoryContent embedded />` (khuyến nghị — khớp web, không rời màn).
   - 🅱️ Chỉ thêm nút/segment điều hướng tới `/ielts/history` (nhẹ hơn nhưng vẫn rời màn — kém khớp web).
2. **Giữ hay bỏ route standalone `advanced/writing`, `advanced/speaking`?**
   - 🅰️ **Giữ làm wrapper mỏng** (khuyến nghị — deep-link/Drawer không vỡ).
   - 🅱️ Bỏ route, mọi nơi trỏ `/ielts/advanced?tab=...` (gọn hơn nhưng phải sửa hết điểm gọi + rủi ro deep-link).
3. **Phạm vi Test History trong Intensive:** hiển thị cả Mock + Practice (như history.tsx hiện có) hay chỉ Mock? → Khuyến nghị **giữ cả hai** (web Test History link cả `?mode=mock` lẫn `?mode=practice`).

> Nếu cần mình chốt phương án trước khi bạn code, dùng các lựa chọn 🅰️ (mặc định khuyến nghị) ở trên.

---

## F. Tiêu chí hoàn thành (DoD) & Kiểm thử

**DoD:**
- [ ] Màn Intensive có 2 mục con `[Mock Tests | Test History]`; Test History hiển thị lịch sử (mock + practice) inline, mở được result.
- [ ] `/ielts/history` standalone + mục Drawer vẫn hoạt động (không hồi quy).
- [ ] Advanced: bấm cả 4 tab L/R/W/S đều **ở lại cùng màn**; filter chips/history banner chỉ hiện cho L/R.
- [ ] `/ielts/advanced/writing` & `/ielts/advanced/speaking` standalone vẫn vào được (deep-link).
- [ ] `tsc --noEmit` sạch; không double-wrap FeatureLock; theming light/dark đúng.

**Kiểm thử:**
1. Intensive → chuyển Mock/Test History qua lại; ở Test History đổi Mock/Practice + skill + part filter; bấm 1 item → mở đúng result (mock → `ieltsIntensiveResult`, practice → `practice/result`).
2. Mở `/ielts/history` từ Drawer → vẫn đầy đủ header/drawer.
3. Advanced → bấm Writing/Speaking: **không** chuyển màn; danh sách prompt/part hiện inline; bấm 1 item mới vào runner.
4. Advanced → bấm Listening/Reading: filter chip theo loại câu vẫn đúng; bấm part vào runner.
5. Deep-link `/ielts/advanced/writing` và `/ielts/advanced?tab=speaking` mở đúng.
6. Dark mode + cỡ chữ lớn không vỡ.

---

## G. Rủi ro & giảm thiểu

- **Trùng lặp state khi nhúng** (drawer/scroll lồng nhau): component `embedded` không được tự render `SafeAreaView`/`SharedDrawer`; chỉ trả phần thân.
- **`FlatList` lồng trong `ScrollView`**: nếu Test History dùng `FlatList` mà section cha là `ScrollView` → cảnh báo nesting. Giải pháp: section "Test History" cho `TestHistoryContent` tự quản cuộn (không bọc trong ScrollView cha), hoặc dùng `ListHeaderComponent`.
- **W/S lấy nhầm `readingParts`**: bắt buộc gate `isLR` (NS-2.3) trước khi tính `allParts/availableTypes`.
- **Deep-link/Drawer gãy**: giữ route standalone làm wrapper (Decision 2🅰️).
- **Regression nhẹ**: tách component phải bê nguyên logic (đừng đổi hành vi fetch/score) — diff nên thuần "di chuyển + thêm prop embedded".
