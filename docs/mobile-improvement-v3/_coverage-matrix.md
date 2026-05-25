# Ma trận Coverage - Hệ Thống Question Renderer IELTS Mobile

Tài liệu này chi tiết hóa ma trận coverage cho tất cả các loại câu hỏi IELTS trên nền tảng di động, đối chiếu giữa ba hệ thống render cũ (**A. Intensive**, **B. Advanced**, **C. Basic**) và giải pháp hợp nhất dùng chung (**Shared Unified Renderer**).

---

## 1. Bảng Đối Chiếu Coverage & Ánh Xạ Loại Câu Hỏi

| Loại câu hỏi IELTS | Schema key (`question_type` / `kind`) | Hệ A (Intensive) | Hệ B (Advanced) | Hệ C (Basic) | Trạng thái hợp nhất (Unified shared) |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Multiple Choice (Single)** | `multiple_choice`, `mc_single` | ✅ | ✅ | ✅ | **Unified**: Ánh xạ qua `MCQQuestion` (inline) / `renderGroup`. |
| **Multiple Choice (Multi)** | `multiple_choice_multiple`, `mc_multi` | ✅ | ✅ | ✅ | **Unified**: Sử dụng component chung `MCMultipleBlock`. |
| **Matching (Features/Headings)**| `matching`, `matching_headings`, `matching_features`, `matching_group` | ✅ | ✅ | ✅ | **Unified**: Sử dụng component chung `MatchingBlock`. |
| **Form/Note Completion** | `form_completion`, `note_completion` | ✅ | ✅ | ✅ | **Unified**: Sử dụng component chung `FormCompletionBlock`. |
| **Flowchart Completion** | `flowchart_completion`, `flow_chart` | ✅ | ✅ | ✅ | **Unified**: Ánh xạ chung trong `FormCompletionBlock`. |
| **Sentence Completion** | `sentence_completion` | ✅ | ✅ | ✅ | **Unified**: Tự động parse thành các đoạn text kèm `Blank` inline. |
| **Short Answer** | `short_answer` | ✅ | ✅ | ✅ | **Unified**: Render ô điền text nhỏ trực tiếp sau câu hỏi. |
| **Table Completion** | `table_completion` | ✅ | ✅ | ✅ | **Unified**: `QuestionGroupRenderer.tsx` xử lý layout dạng lưới (Grid/Table). |
| **Diagram/Map Labelling** | `diagram_labelling`, `diagram_completion`, `map_labelling`, `plan_labelling`, `plan_label` | ✅ | ✅ | ✅ | **Unified**: Sử dụng component chung `DiagramMapBlock` hỗ trợ ghim nhãn trên ảnh. |
| **Summary Completion (Word Bank)**| `summary_completion` với `options_box` | ✅ | ❌ | ✅ | **Unified**: Render inline dạng Dropdown/Select (`SummaryBlankSelector`) có word bank. |
| **True/False/Not Given** | `true_false_not_given`, `yes_no_not_given` | ✅ | ✅ | ✅ | **Unified**: Ánh xạ sang `mc_single` với 3 lựa chọn True/False/Not Given chuẩn hóa. |

---

## 2. Đặc Điểm Khác Biệt & Cách Hợp Nhất (Super-set)

### A. Khác biệt trong Cấu trúc Dữ liệu JSON (Parsing)
- **Hệ A (Intensive)**: Dữ liệu câu hỏi được lưu phân cấp sâu trong `part.content` hoặc `part.question_groups`. Câu hỏi inline sử dụng thuộc tính `p.question_number` và `p.text`.
- **Hệ B (Advanced)**: Dữ liệu lưu phẳng hơn, chia trực tiếp theo loại block cụ thể (như `MCQBlock` hay `FillBlock`).
- **Giải pháp Hợp nhất**: Mượn mô hình **Item-based** từ web qua utility `lib/exam-parser.ts`. Hàm `extractAllItemsFromPart(part)` sẽ san phẳng (flatten) tất cả các cấu trúc phân cấp sâu thành một mảng `NormalizedItem[]` tuần tự, giúp render mượt mà và dễ dàng tính toán danh sách đã làm bài (`answeredSet`) cũng như cuộn đến đúng câu hỏi (`scrollToQuestion`).

### B. Khác biệt trong Chế độ Xem Lại (Review Mode)
- **Hệ cũ**: Đa số chỉ hiển thị danh sách đáp án đúng/sai ở cuối màn hình hoặc hiển thị dạng text khô khan, không trực quan.
- **Hệ hợp nhất**: Tích hợp trực tiếp `mode='review'` vào tất cả các component block (`MCMultipleBlock`, `MatchingBlock`, `FormCompletionBlock`, `DiagramMapBlock`, `SummaryBlankSelector`).
  - Điền đúng: Viền xanh lá, hiển thị icon checkmark `ionicons/checkmark-circle`.
  - Điền sai/Chưa điền: Viền đỏ nhạt, hiển thị icon báo lỗi `ionicons/close-circle`, đồng thời hiển thị bong bóng đáp án đúng màu xanh lá premium kèm theo phần giải thích câu hỏi (`q.explanation` hoặc `group.explanation`) nếu có.

---

## 3. Cấu Trúc Dữ Liệu Thực Tế (Schema Examples)

### MCQ (Single Select & True/False/Not Given)
```json
{
  "question_type": "multiple_choice",
  "instructions": "Choose the correct letter, A, B, C or D.",
  "items": [
    {
      "question_number": 1,
      "question_text": "What is the primary topic discussed by the author?",
      "options": {
        "A": "The development of modern agriculture",
        "B": "The impact of climate changes on ancient civilizations",
        "C": "New technologies in archaeology",
        "D": "The trade routes in prehistoric Europe"
      },
      "explanation": "Paragraph 1 clearly states that we will examine how climate shifts restructured the Bronze Age farming societies."
    }
  ]
}
```

### Matching Group (Heading/Features/Sentence Endings)
```json
{
  "question_type": "matching",
  "heading": "Match each statement with the correct country",
  "instructions": "Write the correct letter, A-C, in boxes 5-7.",
  "options_box": {
    "options": {
      "A": "Ancient Egypt",
      "B": "Mesopotamia",
      "C": "Indus Valley"
    }
  },
  "items": [
    {
      "question_number": 5,
      "question_text": "They developed sophisticated sewage and drainage systems throughout the urban centers."
    },
    {
      "question_number": 6,
      "question_text": "Their agricultural cycle was deeply dependent on the predictable annual flooding of the Nile."
    }
  ]
}
```

### Diagram / Map Labelling
```json
{
  "question_type": "diagram_labelling",
  "image_url": "https://res.cloudinary.com/.../bronze-age-foundry.png",
  "instructions": "Label the diagram below. Write NO MORE THAN TWO WORDS.",
  "items": [
    {
      "question_number": 12,
      "question_text": "The chamber where copper ore is melted",
      "x_pos": 34.5,
      "y_pos": 56.2
    },
    {
      "question_number": 13,
      "question_text": "The clay pipes used for blowing air to stoke the fire",
      "x_pos": 68.1,
      "y_pos": 42.9
    }
  ]
}
```

### Summary Completion with Word Bank
```json
{
  "question_type": "summary_completion",
  "heading": "The Evolution of Metallurgy",
  "text": "The transition from stone to bronze tools was not sudden. Early artisans in 14 [blank] experimented with melting copper. By adding tin, they produced a 15 [blank] alloy that held a sharp edge much longer.",
  "options_box": {
    "options": {
      "A": "East Asia",
      "B": "stronger",
      "C": "softer",
      "D": "Mesopotamia",
      "E": "Mediterranean"
    }
  },
  "points": [
    {
      "question_number": 14,
      "text": "Location of experimentation"
    },
    {
      "question_number": 15,
      "text": "Properties of the tin-copper alloy"
    }
  ]
}
```

---

## 4. Kế Hoạch Đảm Bảo Hồi Quy Chấm Điểm (Anti-Regression Plan)

Do tất cả các loại câu hỏi hiện tại đều chuyển hướng qua hệ thống Parser và Chấm điểm chung `utils/answerNormalization.ts` và `lib/exam-parser.ts`, quy trình kiểm tra hồi quy bắt buộc phải tuân thủ:

1. **Snapshot-matching**: So sánh kết quả trả về của hàm `extractAllItemsFromPart` trước và sau khi refactor đối với 5 bộ đề mẫu (Listening & Reading). Danh sách `question_numbers` và cấu trúc text trích xuất phải khớp 100%.
2. **Double-Grading verification**: Chạy chấm thử 20 session cũ đã lưu trên DB thông qua API di động mới. Số điểm trả về và trạng thái đúng/sai của từng câu hỏi đơn lẻ bắt buộc phải giữ nguyên so với kết quả lịch sử.
3. **Thị giác (Visual Smoke Tests)**: Kích hoạt toàn bộ các block câu hỏi trong trang sandbox `app/_dev/atom-gallery.tsx` để kiểm thử thủ công hiển thị giao diện ở cả Light Mode lẫn Dark Mode.
