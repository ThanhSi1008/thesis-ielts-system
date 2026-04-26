# IELTS Master AI - Unified Design System

> Tài liệu này lưu trữ các yếu tố thiết kế cốt lõi (Core Design Tokens) được trích xuất từ dự án `frontend-web` nhằm làm kim chỉ nam để giữ tính đồng nhất 100% giữa giao diện Web và Mobile.

---

## 1. Màu Sắc (Color Palette)

Bảng màu này phải được sử dụng trên toàn bộ hệ sinh thái (Web & Mobile). Tuyệt đối không dùng mã màu Hardcode ngoài hệ thống này.

| Tên | Mã Hex | Ý nghĩa & Cách dùng |
|:---|:---|:---|
| **Primary** | `#FFC600` | Màu thương hiệu chủ đạo, dùng cho các nút bấm chính, highlight, icon nhấn mạnh. |
| **Secondary** | `#EDEDED` | Màu nền phụ, dùng cho các nút hủy, badge trung tính, hoặc background card. |
| **Success** | `#4CAF50` | Hiển thị thông báo thành công, điểm số cao, nút Confirm. |
| **Danger** | `#F44336` | Trạng thái lỗi, cảnh báo nguy hiểm, nút Xóa, điểm số thấp. |
| **Info** | `#2196F3` | Thông tin chú thích, link, hoặc các yếu tố chỉ đường. |
| **Warning** | `#FF9800` | Trạng thái đang xử lý, cảnh báo mức độ vừa, flashcard mức độ "Hard". |
| **Dark (Text)**| `#212529` | Màu chữ chính, tiêu đề, nội dung văn bản. Không dùng đen tuyền (`#000000`). |
| **Light (Bg)** | `#f8f9fa` | Màu nền của toàn ứng dụng (Background App) hoặc các mảng nội dung chính. |

**Đồng bộ với Tailwind (Mobile & Web):**
Sử dụng các class như `text-primary`, `bg-danger`, `border-success`.

---

## 2. Typography (Kiểu Chữ)

### Font Family
- **Font Chủ Đạo:** `Farro` (dùng cho Heading và các yếu tố nhấn mạnh).
- **Font Hệ thống (Fallback):** `system-ui`, `sans-serif` (dùng cho body text trên di động để tăng hiệu năng).

### Cấu trúc Heading & Body (Prose Config)
Được trích xuất từ cấu hình Typography Plugin của Web, cần mô phỏng lại trên Mobile (qua `react-native-render-html` hoặc Text styles):

- **Body Text (`<p>`):**
  - Line height: `1.75`
  - Màu: `#1a1a1a`
- **Heading 2 (`<h2>`):**
  - Kích thước: `1.15rem`
  - Weight: `700` (Bold)
  - Viền dưới (Border-bottom): `2px solid #f3f4f6`
- **Heading 3 (`<h3>`):**
  - Kích thước: `1rem`
  - Weight: `700` (Bold)
- **Danh sách (`<ul>`, `<li>`):**
  - Marker dạng hình tam giác `"▸"` hoặc vòng tròn (`circle`, `square`).
  - Màu marker: `#64748b`
- **Code Block / Quote:**
  - Blockquote: Background `rgba(0, 0, 0, 0.035)`, Border trái `4px`.
  - Code: Nền `rgba(0,0,0,0.06)`, bo góc `4px`, chữ đậm `600`.

---

## 3. Spacing & Border Radius (Khoảng cách & Bo góc)

### Border Radius
Trên web sử dụng biến CSS (`--radius`). Đối với Mobile, chúng ta quy định tiêu chuẩn sau:
- `rounded-sm`: Bo góc nhỏ (khoảng `4px`) cho checkbox, tag, label.
- `rounded-md`: Bo góc vừa (khoảng `6px`) cho input fields, button phụ.
- `rounded-lg`: Bo góc lớn (khoảng `8px` hoặc `12px`) cho các Card, Modal, Button chính.

### Spacing (Padding/Margin)
Tuân thủ hệ thống spacing mặc định của Tailwind (nhân 4px):
- `p-2` (8px): Spacing bên trong các phần tử nhỏ.
- `p-4` (16px): Chuẩn cho lề (margin/padding) của các Section, Card.
- `p-6` (24px): Khoảng cách lớn cho Layout ngoài cùng (Container padding).

---

## 4. Animations (Hiệu ứng)

Các hiệu ứng mượt mà mang lại cảm giác "sống động" cho Web cần được tái tạo trên Mobile bằng `react-native-reanimated`:

1. **Waveform (Sóng âm):** Dùng trong Recording / Pronunciation.
   - Scale trục Y từ 0.4 lên 1.0 (Lặp lại vô hạn, ease-in-out).
2. **Fade Up (Nổi lên):**
   - Translate Y từ 24px về 0, Opacity 0 -> 1. Dùng khi load trang, load câu hỏi.
3. **Slide In (Từ hai bên):**
   - Translate X từ -80px (hoặc +80px) về 0. Dùng cho thẻ Flashcard, Drawer.

---

## 5. UI Elements Patterns (Quy Tắc Component)

1. **Form Inputs:**
   - Không dùng Outline quá đậm. Input mặc định có viền màu xám nhạt (`border-slate-200`), khi Focus đổi thành viền Primary (`border-primary`). Lỗi thì viền đỏ (`border-danger`).
2. **Buttons:**
   - Primary: Nền `#FFC600`, chữ Đen (`#212529`), không viền.
   - Outline: Nền trong suốt, viền `#EDEDED` hoặc `#212529`.
3. **Tables (Bài học Ngữ pháp):**
   - Tiêu đề bảng: Chữ In hoa, background nhạt `rgba(0,0,0,0.05)`, chữ nhỏ `0.78rem` tracking `0.05em`.
   - Dòng chẵn/lẻ: Highlight xen kẽ (`rgba(255, 255, 255, 0.4)`).
   - Bo góc ngoài cùng (Border Radius `12px`) + Shadow nhẹ (`boxShadow: 0 1px 4px rgba(0,0,0,0.03)`). 

*(Lưu ý: Mọi thiết kế mới trên Mobile bắt buộc phải đối chiếu với tài liệu này trước khi implement để giữ sự đồng nhất toàn diện)*
