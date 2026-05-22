# Lexon Mobile Typography Cheat Sheet

Tài liệu này cung cấp bảng tra cứu chuẩn (Cheat Sheet) về kiểu chữ (Typography) hệ thống di động Lexon. Kiểu chữ nhất quán và có khả năng co giãn tốt (Dynamic Scaling) giúp tối ưu hóa khả năng tiếp cận (Accessibility - A11y) và duy trì tính trực quan cao cấp của ứng dụng.

---

## 1. Phân hệ Font Family Chủ Đạo

Ứng dụng di động sử dụng bộ phông chữ **Farro** làm phông chữ đặc trưng.
- **`Farro-Light`** (Font weight: `300`): Dùng cho các văn bản mô tả phụ rất dài, chú thích chi tiết.
- **`Farro-Regular`** (Font weight: `400`): Dùng cho văn bản nội dung chính (body text), bài đọc tin tức/IELTS.
- **`Farro-Medium`** (Font weight: `500` hoặc `600`): Dùng cho nhãn nút bấm, tiêu đề phụ của thẻ (card subheader).
- **`Farro-Bold`** (Font weight: `700`): Dùng cho tiêu đề lớn, số điểm (Band Score), và các từ khóa nhấn mạnh.

---

## 2. Bảng quy đổi kích thước chữ (Typography Sizing Scale)

Hệ thống token kích thước chữ được đồng bộ hóa từ `constants/index.ts`:

| Token | Kích thước (dp/pt) | Đề xuất Sử dụng | Chi tiết Line-Height |
| :--- | :--- | :--- | :--- |
| `xs` | `12` | Chú thích nhỏ, ngày tháng, thông số phụ | `16` |
| `sm` | `14` | Nhãn Badge/Chip, mô tả thẻ, phụ đề | `20` |
| `md` / `base` | `16` | Nội dung văn bản chính (body), nhãn input | `24` |
| `lg` | `18` | Tiêu đề danh sách, tiêu đề thẻ Card | `26` |
| `xl` | `20` | Tiêu đề phụ của màn hình, tiêu đề trang phụ | `28` |
| `xxl` | `24` | Tiêu đề phần (Section Header), tiêu đề Dialog | `32` |
| `xxxl` | `30` | Chỉ số Streak, tiêu đề màn hình chính | `38` |
| `xxxxl` | `36` | Điểm IELTS nổi bật, màn hình chào mừng | `44` |

---

## 3. Thành phần nguyên tử `<Text>` (Atomic Text Component)

Thay vì tạo các đối tượng `<Text>` thô kèm kiểu chữ thủ công, nhà phát triển bắt buộc sử dụng thành phần `<Text>` định sẵn từ `@/components/atoms/Text`.

### Các biến thể (Variants):
- `display`: Tương ứng kích thước `xxxl` hoặc `xxxxl`, phông `Farro-Bold`.
- `headline`: Tương ứng kích thước `xxl`, phông `Farro-Bold`.
- `title`: Tương ứng kích thước `lg` hoặc `xl`, phông `Farro-Medium`.
- `body`: Tương ứng kích thước `md` / `base`, phông `Farro-Regular`.
- `label`: Tương ứng kích thước `sm`, phông `Farro-Medium`.
- `caption`: Tương ứng kích thước `xs`, phông `Farro-Regular`.

### Ví dụ Sử dụng:
```tsx
import { Text } from '@/components';

// Tiêu đề chính màn hình
<Text variant="headline" weight="bold" color="text">
  Bảng điều khiển
</Text>

// Đoạn mô tả body
<Text variant="body" style={{ color: colors.textSecondary }}>
  Hãy tiếp tục hoàn thành mục tiêu học từ vựng hôm nay.
</Text>
```

---

## 4. Quy chuẩn Tiếp cận & Chống Tràn/Vỡ giao diện (A11y & Robust Layouts)

Để đạt chuẩn WCAG AA và thân thiện với VoiceOver/TalkBack, ứng dụng bắt buộc tuân thủ 3 nguyên tắc sau:

### 1. Dynamic Font Scaling:
Tất cả thành phần văn bản phải thiết lập mặc định `allowFontScaling={true}` (đã được cấu hình tự động trong Atomic Text). Khi người dùng tăng kích thước font chữ hệ thống (lên tới 200%), ứng dụng phải co giãn tương xứng.

### 2. Không cố định chiều cao (Avoid Fixed Heights):
❌ **Sai**: Thiết lập `height: 48` cho các thẻ hoặc hàng danh sách chứa text động. Chữ sẽ bị cắt ngang (truncate) khi phóng to.
🟢 **Đúng**: Sử dụng `paddingVertical: 12`, `minHeight: 48` và `flexWrap: 'wrap'` để các phần tử tự động đẩy chiều cao xuống dưới một cách tự nhiên.

### 3. Tỷ lệ dòng trống (Line-height Ratio):
Để tăng khả năng đọc cho người khiếm thị nhẹ hoặc người dùng lớn tuổi, luôn áp dụng tỷ lệ dòng tối thiểu:
- Văn bản nội dung (`body`): `lineHeight = fontSize * 1.5`
- Tiêu đề (`headline` / `title`): `lineHeight = fontSize * 1.2`
