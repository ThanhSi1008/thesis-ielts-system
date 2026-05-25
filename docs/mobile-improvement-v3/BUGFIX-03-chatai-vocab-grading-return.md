# BUGFIX-03 — Xác minh fix · Nút quay về khi chấm AI · "Ask AI → Add to Vocab Lab"

> **Ngày:** 2026-05-25 · **Phạm vi:** `frontend-mobile`
> **Yêu cầu:** (1) kiểm các fix vừa hiện thực; (2) chấm AI bất đồng bộ phải có nút quay về (không bắt chờ); (3) luồng "Ask AI → Add to Vocab Lab" chưa giống web (không preview, không chọn deck, đóng chat thì khoá màn).

---

## 1. Xác minh các fix vừa hiện thực (BUGFIX-02) — ✅ ĐÚNG

> Các thay đổi đang ở **working tree (chưa commit)**. Đã đọc và xác nhận đúng:

| Hạng mục | Trạng thái | Bằng chứng |
|---|---|---|
| Crash Advanced Writing result | ✅ | `result/[sessionId].tsx:155–166` map `taskFb = { band: rawFeedback.overall_band ?? …, criteria }`; `WritingRubricView.tsx:520–521` `showTask = … && !!feedback.taskN`, + guard `feedback.taskN && (...)` ở 544/553 |
| Advanced Speaking history hiển thị | ✅ | `advanced/history/index.tsx:335–339` thêm `getSpeakingHistory()`; `:370` normalizeSpeaking; `:415–416` điều hướng `speaking/result` |
| Band W/S trong Test History | ✅ | `TestHistoryContent.tsx:233–238` `isWS ? (writingScore ?? speakingScore ?? rawScore) : rawTo*Band(rawScore)` |
| Keyboard fill-in | 🟡 một phần | `[examId].tsx` & `[skill]/[partId].tsx` đã thêm `KeyboardAvoidingView` (3 mỗi file); **`ReadingExamBlock.tsx` vẫn 0** → cần xác nhận ô điền trong **cột câu hỏi của split-view Reading** có thực sự cuộn lên trên bàn phím không (KAV cha + ScrollView lồng trong block) |

**Khuyến nghị:** chạy `tsc --noEmit` rồi commit; QA bàn phím Reading trên thiết bị thật (xem §4 BUGFIX-02).

---

## 2. Chấm điểm AI bất đồng bộ — Nút quay về

**Kết luận: yêu cầu CƠ BẢN đã đạt** (mọi luồng đều có cách rời màn, không bắt đứng chờ), còn **1 điểm chưa nhất quán** ở Advanced Speaking.

| Luồng AI | Có nút quay về? | Poll sống sót khi rời màn? | Ghi chú |
|---|---|---|---|
| Intensive full-exam W/S (`[examId].tsx`) | ✅ `AIGradingOverlay` nút **"Go back to mock tests"** (`AIGradingOverlay.tsx:20–22`) | ✅ qua `GradingContext` (`submitAndTrack({examType:'INTENSIVE'})`) + toast khi xong | Tốt |
| Intensive practice W/S (`practice/[sessionId].tsx`) | ✅ `AIGradingOverlay` | ✅ | Tốt |
| Advanced **Writing** (`writing/[promptId].tsx`) | ✅ submit → `result/[sessionId]` có trạng thái "GRADING IN PROGRESS" + **header back** (`:573`) | ✅ dùng `GradingContext.submitAndTrack` (`:137`) + result screen `useGradingPoll` | Tốt |
| Advanced **Speaking** (`speaking/[partId].tsx`) | ✅ result screen có header back + pending state | ⚠️ **KHÔNG** dùng `GradingContext` → chỉ `useGradingPoll` ở result screen; rời màn là **dừng poll** (không toast khi xong) | Cần đồng bộ |

### 2.1 🟡 Khuyến nghị — Advanced Speaking dùng `GradingContext` cho nhất quán

Hiện Speaking submit (`speaking/[partId].tsx:173`) chỉ `router.replace` sang result rồi để result screen tự poll. Nếu người dùng rời result khi đang chấm → mất poll/toast (dữ liệu vẫn an toàn, GRADED sẽ thấy trong history, nhưng không được thông báo). Nên đi qua `submitAndTrack({ examType: 'SPEAKING', … })` như Writing để poll nền + toast khi xong.

> Không phải lỗi chặn, nhưng để "không bắt chờ" thật trọn vẹn (rời đi vẫn được báo khi xong) thì nên sửa.

---

## 3. 🔴 "Ask AI → Add to Vocab Lab" — MỘT gốc lỗi cho cả 3 triệu chứng

### 3.1 Cơ chế hiện tại

```
chat-ai.tsx (ADD_VOCAB) → gọi /chat sinh field → DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', { front, back, tags, AICardType, AIFieldValues })
                                                          │
                                                          ▼
GlobalAddCardFab (mount ở ROOT _layout.tsx:182) addListener → setOpen(true) → <Modal transparent> "Quick Add Card"
```

`GlobalAddCardFab` (`components/vocab-lab/GlobalAddCardFab.tsx`) **đã có sẵn**:
- **Chọn deck** (deck pills, `:341–352`, `selectedDeckId`),
- **Chọn card type** (`:365`),
- **Preview/sửa nội dung** = các field prefilled từ AI (`AIFieldValues` → `fieldValues`, `:159–180`, render TextInput `:388+`),
- Tags, nút Save (`createFlashcard` / `createFlashcardFromVocabulary`, `:260–266`).

⇒ **Tính năng preview + chọn deck KHÔNG thiếu** — chúng nằm trong sheet. Vấn đề là sheet **không tiếp cận được** từ chat-ai.

### 3.2 Nguyên nhân gốc — Modal chồng modal (modal stacking)

- `chat-ai` được present là **native modal**: `app/_layout.tsx:91` → `presentation: 'modal', animation: 'slide_from_bottom'`.
- `GlobalAddCardFab` mount ở **gốc** (`_layout.tsx:182`) → `<Modal>` của nó thuộc lớp **dưới** màn chat-ai.
- Khi `OPEN_QUICK_ADD_CARD` phát **lúc chat-ai vẫn đang mở**: trên iOS **không thể present 2 modal cùng lúc** → sheet Quick Add **mở sau lưng chat-ai** (vô hình) hoặc bị treo trạng thái; backdrop trong suốt (`Modal transparent` + `Pressable backdrop`, `:315–316`) còn đó.
- Người dùng **đóng chat-ai** → lộ ra sheet ở trạng thái hỏng: nội dung off-screen (`slideAnim` chưa kịp mở vì modal chưa thực sự present) nhưng **backdrop trong suốt nuốt toàn bộ chạm** → **màn hình bị khoá**.

⇒ Một gốc này giải thích **cả 3** triệu chứng:
1. *"chưa xem trước nội dung"* — sheet (chứa field prefilled) nằm sau chat-ai, không thấy.
2. *"chưa chọn được deck"* — deck selector có nhưng không chạm tới được.
3. *"đóng chat là bị khoá"* — backdrop modal sót lại chặn chạm.

> Các nơi khác cũng phát `OPEN_QUICK_ADD_CARD` (DictionaryPopup, GlobalVocabFab) **không** lỗi vì chúng phát từ màn **thường** (không phải native modal) → sheet mở đúng lớp trên cùng. Lỗi **đặc thù** cho `chat-ai` vì nó là `presentation:'modal'`.

### 3.3 Cách sửa (đóng chat trước, rồi mới mở sheet)

**Minimal fix** — trong `chat-ai.tsx` nhánh ADD_VOCAB, sau khi sinh field thành công: **đóng chat-ai trước**, đợi modal dismiss xong **rồi** mới emit:

```ts
// app/chat-ai.tsx — sau khi có generatedFields
const payload = { front: word, back: context, tags: ['AI-Chat'], AICardType: cardType, AIFieldValues: generatedFields };

router.back();                                  // 1) đóng native modal chat-ai trước
setTimeout(() => {                              // 2) đợi animation dismiss (~300ms) rồi mở sheet
  DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', payload);
}, 350);
```

**Robust hơn** (không phụ thuộc thời gian cứng): lưu payload chờ + emit khi màn chat-ai thực sự rời:

```ts
const pendingAddRef = useRef<any>(null);
// thay vì emit ngay:
pendingAddRef.current = payload;
router.back();

useEffect(() => {
  const unsub = navigation.addListener('transitionEnd', () => {
    if (pendingAddRef.current) {
      DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', pendingAddRef.current);
      pendingAddRef.current = null;
    }
  });
  return unsub;
}, [navigation]);
```

> Hiệu quả: sheet mở trên màn nền (đã hết native modal) → **hiện rõ, chọn deck được, field prefill xem/sửa được, không còn khoá màn**. Đúng như web (web mở AddCardModal đúng lớp trên cùng vì chat là popup, không phải native modal).

### 3.4 (Tùy chọn) Tăng độ phòng thủ ở `GlobalAddCardFab`

- Bỏ-treo backdrop: khi `open` chuyển true mà `slideAnim` chưa chạy (modal mở trễ), đảm bảo chạy animation mở trong `onShow` của `<Modal>` (RN `Modal` có prop `onShow`) thay vì ngay khi `setOpen(true)`.
- Đặt `pointerEvents` hợp lý: nếu sheet đóng, backdrop không được chặn chạm.
- (Đã có `setTimeout(()=>setOpen(false),280)` ở `closeSheet:230–245` để khôi phục chạm — nhưng nó chỉ chạy khi đóng SHEET, không cứu được trường hợp đóng CHAT-AI; nên sửa ở §3.3 là chính.)

### 3.5 (Tùy chọn) Parity preview với web

Sheet mobile cho **sửa field prefilled** (đã là preview chức năng). Nếu muốn giống web hơn: thêm chế độ "Preview" hiển thị mặt trước/sau của thẻ (render `front/back` theo template) trước khi Save. Không bắt buộc để hết lỗi.

---

## 4. Tổng hợp việc cần sửa (ưu tiên)

| # | Mức độ | Việc | File |
|---|---|---|---|
| 1 | 🔴 | Đóng `chat-ai` trước rồi mới `emit OPEN_QUICK_ADD_CARD` (sửa khoá màn + lộ sheet để preview/chọn deck) | `app/chat-ai.tsx` |
| 2 | 🟡 | (phòng thủ) `GlobalAddCardFab` mở sheet trong `Modal.onShow`; đảm bảo backdrop không treo | `components/vocab-lab/GlobalAddCardFab.tsx` |
| 3 | 🟡 | Advanced Speaking submit đi qua `GradingContext.submitAndTrack` (đồng bộ resilience với Writing/Intensive) | `app/ielts/advanced/speaking/[partId].tsx` |
| 4 | 🟡 | Xác nhận/khắc phục bàn phím che ô điền trong cột câu hỏi Reading split-view | `components/ielts/ReadingExamBlock.tsx` |
| 5 | 🟢 | (parity) Thêm chế độ Preview thẻ giống web | `GlobalAddCardFab.tsx` |
| 6 | 🟢 | Commit working tree (BUGFIX-02 đang dở) + `tsc --noEmit` | — |

---

## 5. Kiểm thử

1. **Add to Vocab từ chat-ai:** chat → "Add to Vocab" → sau khi sinh field: chat-ai tự đóng → sheet Quick Add **hiện rõ** với **deck pills chọn được** + field prefilled xem/sửa → Save → **màn nền thao tác bình thường** (không khoá).
2. **Add to Vocab từ DictionaryPopup/GlobalVocabFab:** vẫn hoạt động như cũ (không hồi quy).
3. **Chấm AI quay về:** Intensive W/S → "Go back" giữa lúc chấm → về dashboard, nhận toast khi xong. Advanced Writing → rời result khi đang chấm → vẫn nhận toast (GradingContext). Advanced Speaking → sau khi sửa #3, rời result vẫn nhận toast.
4. `tsc --noEmit` sạch.

---

## 6. Trả lời trực tiếp

- **Fix vừa rồi đúng chưa?** Đúng (crash Writing, Speaking history, band Test History, KAV) — chỉ cần xác nhận bàn phím trong cột câu hỏi Reading + commit.
- **Chấm AI có nút quay về chưa?** Có ở tất cả luồng (overlay "Go back" cho Intensive; header back + pending state cho Advanced). Riêng Advanced Speaking nên đi qua `GradingContext` để rời đi vẫn được báo khi xong.
- **Ask AI → Vocab Lab (preview/chọn deck/khoá màn):** Tính năng preview + chọn deck **đã có** trong sheet Quick Add, nhưng bị **modal-stacking** (chat-ai là native modal) làm sheet mở sau lưng → vô hình + khoá màn. Sửa bằng cách **đóng chat-ai trước rồi mới mở sheet** (§3.3) là hết cả 3 triệu chứng.
