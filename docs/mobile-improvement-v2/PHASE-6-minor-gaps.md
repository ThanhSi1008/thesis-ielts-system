# Phase 6 — Minor API & UX Gaps

**Ưu tiên:** 🟢 Thấp  
**Ước tính:** 2–3 ngày (gộp tất cả items)  
**Phụ thuộc:** Không có

---

## Tổng Quan

Phase này gộp các gap nhỏ không đủ lớn để thành phase riêng, nhưng cần thiết để đạt parity đầy đủ với web:

| Item | Vấn đề | Effort |
|---|---|---|
| 6.1 | VocabLab: `getSharedDeck(id)` — individual deck detail view | 0.5 ngày |
| 6.2 | VocabLab: `getTemplates` + `updateCardTypeDescription` API | 0.5 ngày |
| 6.3 | VocabLab Stats: thêm `range` parameter | 0.5 ngày |
| 6.4 | VocabLab Marketplace: Deck Detail Screen | 1 ngày |
| 6.5 | Forgot Password: Verify backend route & complete flow | 0.5 ngày |

---

## Item 6.1 — VocabLab: `getSharedDeck(id)`

### Vấn Đề

Mobile `vocabLabApi` thiếu:

```typescript
// Web có:
getSharedDeck: async (id: string) =>
  api.get<SharedDeck>(`/vocab-lab/community/decks/${id}`)
```

`MarketplaceTab` hiện tại chỉ có `browseSharedDecks` (list) và `importSharedDeck` (action), nhưng không thể xem chi tiết một deck cộng đồng trước khi import.

### Tasks

**Task 6.1.1 — Thêm `getSharedDeck` vào `vocabLabApi`**

**File:** `frontend-mobile/services/features.api.ts`

```typescript
getSharedDeck: (id: string) =>
  apiClient.get<SharedDeck>(`/vocab-lab/community/decks/${id}`),
```

**Subtasks:**
- [ ] Thêm method
- [ ] Verify type `SharedDeck` đã có trong `types/index.ts` (nếu chưa, thêm)

```typescript
export interface SharedDeck {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  publisherId: string;
  publisherName: string;
  publisherAvatar?: string;
  cardCount: number;
  importCount: number;
  category?: string;
  previewCards?: { front: string; back: string }[];
  createdAt: string;
}
```

---

## Item 6.2 — VocabLab: `getTemplates` & `updateCardTypeDescription`

### Vấn Đề

Web `vocabLab.api.ts` có 2 methods mobile thiếu:

```typescript
// Lấy templates của một card type
getTemplates: (cardTypeId: string) =>
  GET /vocab-lab/card-types/:id/templates → CardTemplate[]

// Cập nhật description của card type
updateCardTypeDescription: (id: string, description: string | null) =>
  PATCH /vocab-lab/card-types/:id/description → CardType
```

`CardTypeEditorModal` trong mobile có thể cần `getTemplates` để hiển thị template preview. `updateCardTypeDescription` là QoL feature.

### Types Cần Thêm

```typescript
export interface CardTemplate {
  id: string;
  cardTypeId: string;
  name: string;
  frontFields: string[];
  backFields: string[];
  fieldStyles?: Record<string, any>;
  cardStyle?: any;
}
```

### Tasks

**Task 6.2.1 — Thêm Types**

**File:** `frontend-mobile/types/index.ts`
- [ ] Thêm `CardTemplate` interface nếu chưa có

**Task 6.2.2 — Thêm Methods Vào `vocabLabApi`**

**File:** `frontend-mobile/services/features.api.ts`

```typescript
getTemplates: (cardTypeId: string) =>
  apiClient.get<CardTemplate[]>(`/vocab-lab/card-types/${cardTypeId}/templates`),

updateCardTypeDescription: (id: string, description: string | null) =>
  apiClient.patch<any>(`/vocab-lab/card-types/${id}/description`, { description }),
```

- [ ] Thêm 2 methods

**Task 6.2.3 — Tích Hợp `getTemplates` vào `CardTypeEditorModal`**

**File:** `frontend-mobile/components/vocab-lab/CardTypeEditorModal.tsx`

- [ ] Khi mở modal cho một card type có sẵn → fetch templates và hiển thị preview
- [ ] Thêm "Edit Description" field trong modal nếu chưa có → gọi `updateCardTypeDescription`

---

## Item 6.3 — VocabLab Stats: Range Parameter

### Vấn Đề

Web `vocabLab.api.ts`:
```typescript
getStats: async (range?: number) =>
  GET /vocab-lab/stats?range=N
  // range = số ngày (ví dụ: 7, 30, 90, 365)
```

Mobile `vocabLabApi`:
```typescript
getStats: () => apiClient.get<VocabStats>('/vocab-lab/stats')
// Luôn lấy all-time, không có range
```

Hệ quả: `StatsTab` trong VocabLab luôn hiển thị all-time stats, không thể filter theo khoảng thời gian. Web có tab 7d/30d/90d/All.

### Tasks

**Task 6.3.1 — Cập Nhật `getStats` Method**

**File:** `frontend-mobile/services/features.api.ts`

```typescript
getStats: (range?: 7 | 30 | 90 | 365) => {
  const url = range ? `/vocab-lab/stats?range=${range}` : '/vocab-lab/stats';
  return apiClient.get<VocabStats>(url);
},
```

- [ ] Cập nhật method signature và implementation

**Task 6.3.2 — Thêm Range Selector Vào `StatsTab`**

**File:** `frontend-mobile/components/vocab-lab/StatsTab.tsx`

- [ ] Thêm `RangeSelector` component: 4 chip buttons (7d | 30d | 3m | All)
- [ ] State `range: 7 | 30 | 90 | 365 | undefined`
- [ ] Khi chọn range → refetch stats với range mới
- [ ] Dùng `Chip` atom cho range buttons
- [ ] Active state cho chip đang được chọn

---

## Item 6.4 — VocabLab Marketplace: Deck Detail Screen

### Vấn Đề

Khi user tap vào một shared deck trong `MarketplaceTab` → hiện tại không có detail view. Web cho phép xem:
- Tên, mô tả, tags
- Publisher info
- Preview cards (mặt trước/sau)
- Import count
- Nút "Import Deck"

### Tasks

**Task 6.4.1 — Component: `SharedDeckDetailSheet`**

**File mới:** `frontend-mobile/components/vocab-lab/SharedDeckDetailSheet.tsx`

```
SharedDeckDetailSheet (Props: deckId, onClose, onImported)
├── Loading skeleton (khi fetch)
├── Header: Deck name + Publisher (avatar + name)
├── Description (nếu có)
├── Stats Row: {cardCount} cards | {importCount} imports
├── Tags (Chip list)
├── Preview Cards Section (nếu có previewCards)
│   └── FlatList horizontal: card front preview (truncated)
├── Bottom: "Import Deck" button (FeatureLock nếu cần PREMIUM)
└── Close button
```

**Subtasks:**
- [ ] Tạo `SharedDeckDetailSheet.tsx`
- [ ] Fetch `vocabLabApi.getSharedDeck(deckId)` khi mount
- [ ] Hiển thị publisher avatar với `Avatar` atom
- [ ] Preview cards horizontal scroll
- [ ] Import action với loading state
- [ ] Toast "Đã import thành công — {N} cards"
- [ ] Dark mode

**Task 6.4.2 — Tích Hợp Vào `MarketplaceTab`**

**File:** `frontend-mobile/components/vocab-lab/MarketplaceTab.tsx`

- [ ] Khi tap vào deck card → mở `SharedDeckDetailSheet` (dùng state + Bottom Sheet)
- [ ] Thêm state `selectedDeckId: string | null`
- [ ] Render `SharedDeckDetailSheet` với `visible={!!selectedDeckId}`
- [ ] Sau import → refresh deck list trong tab này

---

## Item 6.5 — Forgot Password: Verify Backend Route & Complete Flow

### Vấn Đề

Mobile có `app/(auth)/forgot-password.tsx` — web không có trang tương đương. Cần:
1. Verify backend có endpoint `POST /auth/forgot-password` và `POST /auth/reset-password`.
2. Kiểm tra flow trên mobile đã hoàn chỉnh (gửi email → nhập OTP/token → đặt mật khẩu mới).
3. Nếu chưa hoàn chỉnh → implement phần còn thiếu.

### Tasks

**Task 6.5.1 — Audit `forgot-password.tsx`**

**File:** `frontend-mobile/app/(auth)/forgot-password.tsx`

- [ ] Đọc full file để hiểu flow hiện tại
- [ ] Kiểm tra steps: Step 1 (nhập email) → Step 2 (nhập OTP/code) → Step 3 (đặt password mới)
- [ ] Verify API calls đang gọi đúng endpoint

**Task 6.5.2 — Verify Backend Endpoints**

```bash
grep -rn "forgot-password\|reset-password\|resetPassword\|forgotPassword" \
  backend-core/src --include="*.ts"
```

- [ ] Confirm `POST /auth/forgot-password` tồn tại
- [ ] Confirm `POST /auth/reset-password` tồn tại
- [ ] Nếu thiếu → flag để backend team thêm hoặc skip item này

**Task 6.5.3 — Complete Flow Nếu Còn Thiếu**

Dựa trên audit Task 6.5.1, implement các step còn thiếu trong `forgot-password.tsx`:

- [ ] Step 1: Email input + gửi reset link/OTP
- [ ] Step 2: OTP/Code input (nếu dùng OTP) với countdown resend
- [ ] Step 3: New password + confirm password input với validation
- [ ] Error handling cho từng step (email không tồn tại, OTP sai, etc.)
- [ ] Success navigation: về login screen với toast "Mật khẩu đã được đặt lại"

**Task 6.5.4 — Link Từ Login Screen**

**File:** `frontend-mobile/app/(auth)/login.tsx`

- [ ] Verify có nút "Quên mật khẩu?" link đến `forgot-password` không
- [ ] Nếu chưa có → thêm TextButton "Quên mật khẩu?" dưới form login

---

## Item 6.6 — Minor Polish & Consistency (Bonus)

Các điểm nhỏ phát hiện trong quá trình review:

### 6.6.1 — VocabLab Stats `range` Default

Hiện tại `StatsTab` trong VocabLab hiển thị all-time stats ngay khi load. Theo web, default là 30d.

- [ ] Đổi default `range` state thành `30` (30 ngày)

### 6.6.2 — Shadowing/Dictation My Videos — Dual Mode

`My Videos` screen hiện tại có mode toggle nhưng khi switch từ Shadowing sang Dictation, **mode toggle chỉ filter local**, không gọi API riêng cho dictation videos (vì `useShadowingLessons` chỉ fetch shadowing data).

- [ ] Kiểm tra hook `useShadowingLessons` có fetch cả dictation user videos không
- [ ] Nếu không: thêm fetch `dictationApi.getVideos()` khi mode = 'dictation'
- [ ] Hoặc tách thành 2 hooks riêng biệt

### 6.6.3 — Advanced Writing/Speaking Result — "Xem bài khác" Button

Sau khi xem result của bài speaking/writing, user không có button để quay lại catalog và chọn bài khác (phải dùng back button nhiều lần).

- [ ] Thêm "Luyện thêm" / "Chọn bài khác" button ở result screen navigate về catalog

---

## Acceptance Criteria

- [ ] `vocabLabApi.getSharedDeck(id)` hoạt động, trả về SharedDeck detail.
- [ ] MarketplaceTab: tap vào deck → detail sheet mở với đầy đủ info + preview cards.
- [ ] Import từ detail sheet → deck xuất hiện trong Decks tab của user.
- [ ] `getTemplates` trả đúng templates cho card type.
- [ ] `updateCardTypeDescription` cập nhật description.
- [ ] VocabLab StatsTab có range selector 7d/30d/3m/All, refetch khi đổi range.
- [ ] Forgot password flow hoàn chỉnh 3 steps và navigate về login sau khi thành công.
- [ ] Login screen có link "Quên mật khẩu?".
- [ ] Dark mode đúng cho tất cả components mới.

---

## Files Tạo Mới

```
frontend-mobile/components/vocab-lab/SharedDeckDetailSheet.tsx
```

## Files Sửa

```
frontend-mobile/services/features.api.ts
  — thêm getSharedDeck, getTemplates, updateCardTypeDescription
  — cập nhật getStats với range param

frontend-mobile/types/index.ts
  — thêm SharedDeck, CardTemplate interfaces

frontend-mobile/components/vocab-lab/StatsTab.tsx
  — thêm range selector UI

frontend-mobile/components/vocab-lab/MarketplaceTab.tsx
  — tích hợp SharedDeckDetailSheet

frontend-mobile/components/vocab-lab/CardTypeEditorModal.tsx
  — tích hợp getTemplates + updateCardTypeDescription

frontend-mobile/app/(auth)/forgot-password.tsx
  — complete flow nếu còn thiếu

frontend-mobile/app/(auth)/login.tsx
  — thêm link "Quên mật khẩu?" nếu thiếu
```
