# Phase 3 — VocabLab: Flashcard From Foundation Vocabulary

**Ưu tiên:** 🟡 Trung bình  
**Ước tính:** 1–2 ngày  
**Phụ thuộc:** Không có

---

## Vấn Đề Hiện Tại

### Hai endpoint chuyên dụng không có trên mobile

Web (`vocabLab.api.ts`) có:

```typescript
// Tạo flashcard từ một từ Foundation Vocabulary — gắn link về vocab word
createFlashcardFromVocabulary(payload: { bookName: string; word: any })
  → POST /vocab-lab/from-foundationVocabWord

// Tạo flashcard + submit review ngay (cho flow "đã biết" / "chưa biết")
createFlashcardFromVocabularyWithReview(payload: { bookName: string; word: any; rating: number })
  → POST /vocab-lab/from-foundationVocabWord/with-review
```

Mobile (`features.api.ts` — `vocabLabApi`) **không có** 2 method này. Khi người dùng:
1. Nhấn "Lưu vào Vocab Lab" từ **Foundation Vocabulary lesson** — mobile gọi `createFlashcard` thông thường → card được tạo nhưng **không có liên kết về `FoundationVocabItem`** → tiến độ từ vựng Foundation không cập nhật.
2. Nhấn nút FAB trên màn hình Vocabulary learning — tương tự.
3. Nhấn "Add to Vocab Lab" trong `DictionaryPopup` → gọi `OPEN_QUICK_ADD_CARD` → `GlobalAddCardFab` → `vocabLabApi.createFlashcard` thông thường (vẫn sai endpoint khi context là vocab word).

### Impact

Backend dùng `POST /vocab-lab/from-foundationVocabWord` để:
1. Tạo card với `front`/`back` được auto-populate từ vocabulary data
2. Gắn `foundationVocabItemId` vào card → khi review card, backend cập nhật `FoundationVocabProgress`
3. Tránh duplicate (idempotent — nếu đã có card cho word đó thì trả về existing)

Dùng sai endpoint → **word progress không được cộng**, thống kê Foundation vocab sai.

---

## Mục Tiêu Phase 3

1. Thêm 2 method `createFlashcardFromVocabulary` và `createFlashcardFromVocabularyWithReview` vào mobile `vocabLabApi`.
2. Cập nhật các điểm trong app sử dụng đúng endpoint khi context là Foundation Vocabulary word.
3. Phân biệt rõ khi nào dùng endpoint chuyên dụng vs generic `createFlashcard`.

---

## Task Chi Tiết

### Task 3.1 — Thêm Methods Vào `vocabLabApi`

**File:** `frontend-mobile/services/features.api.ts`

Thêm vào object `vocabLabApi` (sau `exportDeck`):

```typescript
// Tạo flashcard từ Foundation Vocabulary word (auto-populate front/back, gắn vocab link)
createFlashcardFromVocabulary: (payload: {
  bookName: string;
  word: {
    word: string;
    phonetic?: string;
    definition: string;
    example?: string;
    imageUrl?: string;
    audioUrl?: string;
  };
}) => apiClient.post<Flashcard>('/vocab-lab/from-foundationVocabWord', payload),

// Tạo flashcard + submit review ngay (rating: 1=Again, 2=Hard, 3=Good, 4=Easy)
createFlashcardFromVocabularyWithReview: (payload: {
  bookName: string;
  word: {
    word: string;
    phonetic?: string;
    definition: string;
    example?: string;
    imageUrl?: string;
    audioUrl?: string;
  };
  rating: 1 | 2 | 3 | 4;
}) => apiClient.post<Flashcard>('/vocab-lab/from-foundationVocabWord/with-review', payload),
```

**Subtasks:**
- [ ] Thêm 2 methods vào `vocabLabApi` trong `features.api.ts`
- [ ] Kiểm tra type `Flashcard` đã đầy đủ fields (import từ `@/types`)

---

### Task 3.2 — Xác Định Các Điểm Call Site Cần Cập Nhật

Chạy grep để tìm tất cả nơi `createFlashcard` được gọi trong context Vocabulary:

```bash
grep -rn "createFlashcard\|OPEN_QUICK_ADD_CARD\|addToVocabLab" \
  frontend-mobile --include="*.tsx" --include="*.ts"
```

Dự kiến call sites:

| File | Context | Cần đổi sang |
|---|---|---|
| `components/vocab-lab/GlobalAddCardFab.tsx` | Quick add từ FAB (generic) | Giữ `createFlashcard` — FAB là generic |
| `app/ielts/foundation/vocabulary/[bookId]/[unitId].tsx` (hoặc tương đương) | Lưu word từ lesson | → `createFlashcardFromVocabulary` |
| `components/global/DictionaryPopup.tsx` | Add từ dictionary — context có thể là vocab word | Cần kiểm tra payload, xem có `foundationVocabWord` data không |
| `app/vocabulary/[bookId]/[unitId].tsx` | Top-level vocab (nếu có) | → `createFlashcardFromVocabulary` |

**Subtasks:**
- [ ] Chạy grep xác định tất cả call sites
- [ ] Document list call sites và quyết định từng cái

---

### Task 3.3 — Cập Nhật Foundation Vocabulary Unit Screen

**File:** `frontend-mobile/app/ielts/foundation/vocabulary/[bookId]/[unitId].tsx`

Tìm chỗ người dùng có thể lưu word vào Vocab Lab (nút "+" hoặc bookmark icon bên cạnh mỗi từ).

**Thay thế logic:**

```typescript
// Trước (sai):
await vocabLabApi.createFlashcard({
  deckId: selectedDeckId,
  front: word.word,
  back: word.definition,
});

// Sau (đúng):
await vocabLabApi.createFlashcardFromVocabulary({
  bookName: book.name, // tên sách vocab hiện tại
  word: {
    word: word.word,
    phonetic: word.phonetic,
    definition: word.definition,
    example: word.example,
    imageUrl: word.imageUrl,
    audioUrl: word.audioUrl,
  },
});
```

> **Lưu ý:** Endpoint `from-foundationVocabWord` **tự chọn deck** (deck mặc định của user) nên không cần truyền `deckId`. Nếu user muốn chọn deck cụ thể, cần UI thêm → xem Task 3.5.

**Subtasks:**
- [ ] Locate nút add-to-vocab trong Foundation Vocabulary unit screen
- [ ] Thay `createFlashcard` → `createFlashcardFromVocabulary`
- [ ] Pass đúng `bookName` từ route params/context
- [ ] Hiển thị toast thành công "Đã thêm vào Vocab Lab"
- [ ] Handle lỗi gracefully (network, duplicate card)

---

### Task 3.4 — Cập Nhật `DictionaryPopup` (Conditional Logic)

**File:** `frontend-mobile/components/global/DictionaryPopup.tsx`

`DictionaryPopup` emit `OPEN_QUICK_ADD_CARD` với word data. `GlobalAddCardFab` xử lý event này và gọi `createFlashcard`.

**Vấn đề:** Không biết word đến từ Foundation Vocabulary hay từ text bất kỳ.

**Giải pháp:** Thêm optional field `foundationVocabMeta?: { bookName: string; wordData: any }` vào event payload:

```typescript
// Trong DictionaryPopup, khi có vocab context:
DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', {
  word: selectedWord,
  definition: lookupResult.definition,
  foundationVocabMeta: isFromFoundationVocab ? {
    bookName: currentBookName,
    wordData: vocabWordObject,
  } : undefined,
});
```

**Trong `GlobalAddCardFab.tsx`** — xử lý event:

```typescript
// Nếu có foundationVocabMeta → dùng createFlashcardFromVocabulary
if (eventData.foundationVocabMeta) {
  await vocabLabApi.createFlashcardFromVocabulary({
    bookName: eventData.foundationVocabMeta.bookName,
    word: eventData.foundationVocabMeta.wordData,
  });
} else {
  // Generic add như hiện tại
  await vocabLabApi.createFlashcard({ ... });
}
```

**Subtasks:**
- [ ] Thêm `foundationVocabMeta` field vào event type definition
- [ ] Update `DictionaryPopup.tsx`: pass vocab meta khi có context
- [ ] Update `GlobalAddCardFab.tsx`: conditional logic dùng đúng endpoint
- [ ] Update `GlobalVocabFab.tsx` nếu cần (kiểm tra payload hiện tại)

---

### Task 3.5 — (Optional) Deck Selector khi Lưu Từ Vocabulary

**Mức độ:** Nice-to-have, không bắt buộc cho parity.

Web cho phép user chọn deck khi save word từ vocabulary. Mobile hiện tại dùng deck mặc định.

Nếu muốn implement: thêm `BottomSheet` với `DecksTab` (compact list) hiển thị khi nhấn "+" trên vocab word, cho phép chọn deck → sau đó gọi generic `createFlashcard` với `deckId` đã chọn.

**Subtasks (optional):**
- [ ] Tạo `DeckSelectorSheet` component
- [ ] Integrate vào Foundation Vocabulary unit screen
- [ ] Integrate vào DictionaryPopup flow

---

### Task 3.6 — Review Flow "Biết / Chưa Biết" Trong Vocabulary Unit

**File:** `frontend-mobile/app/ielts/foundation/vocabulary/[bookId]/[unitId].tsx`

Web có flow: khi user học một word, có 2 nút "Đã biết" / "Chưa biết" → gọi `createFlashcardFromVocabularyWithReview(rating: 4)` hoặc `rating: 1`.

Kiểm tra mobile có flow này không. Nếu không, thêm:

```typescript
// "Đã biết" → Good rating
await vocabLabApi.createFlashcardFromVocabularyWithReview({
  bookName, word, rating: 3 // Good
});

// "Chưa biết" → Again rating
await vocabLabApi.createFlashcardFromVocabularyWithReview({
  bookName, word, rating: 1 // Again
});
```

**Subtasks:**
- [ ] Kiểm tra mobile vocabulary unit có swipe/button rating không
- [ ] Nếu có: thay bằng `createFlashcardFromVocabularyWithReview`
- [ ] Nếu không có: implement nút "Đã biết / Chưa biết" (simple thumbs up/down)

---

## Acceptance Criteria

- [ ] `vocabLabApi` có 2 method mới: `createFlashcardFromVocabulary` và `createFlashcardFromVocabularyWithReview`.
- [ ] Khi save word từ Foundation Vocabulary unit → gọi đúng endpoint `from-foundationVocabWord`.
- [ ] Tiến độ Foundation Vocabulary cập nhật đúng sau khi add card (kiểm tra bằng cách xem stats Foundation sau khi add).
- [ ] DictionaryPopup vẫn hoạt động bình thường với generic words (không phải Foundation vocab).
- [ ] Không có regression trên flow `GlobalAddCardFab` generic.
- [ ] Toast/feedback rõ ràng khi thêm card thành công hoặc thất bại.

---

## Files Tạo Mới

```
(không có file mới — chỉ sửa)
```

## Files Sửa

```
frontend-mobile/services/features.api.ts
  — thêm createFlashcardFromVocabulary, createFlashcardFromVocabularyWithReview

frontend-mobile/app/ielts/foundation/vocabulary/[bookId]/[unitId].tsx
  — đổi sang đúng endpoint

frontend-mobile/components/global/DictionaryPopup.tsx
  — thêm foundationVocabMeta vào event payload (khi có context)

frontend-mobile/components/vocab-lab/GlobalAddCardFab.tsx
  — conditional logic theo foundationVocabMeta
```
