# Progress Tracker — IELTS Master AI

> **Feature:** VOCAB-03: Rating Bar & Design Alignment
> **Status:** In Progress 🟡
> **Branch:** `feature/vocab-lab-vocab-03-rating-bar`
> **Last Update:** 2026-04-26

---

## 1. ✅ Tasks Đã Hoàn Thành (Completed)

### Database & Backend
- [x] Sửa lỗi script `seed.ts` (xử lý logic `findFirst` kết hợp `create/update` cho các bảng không có Unique constraint).
- [x] Thực thi Seeding thành công toàn bộ dữ liệu từ vựng (4000 Essential English Words), ngữ pháp và bài thi Cambridge.

### Design System Sync (Web ↔ Mobile)
- [x] Trích xuất Design Tokens từ `frontend-web` (Colors, Spacing, Typography).
- [x] Cập nhật tài liệu `DESIGN_SYSTEM.md` chi tiết cho cả Web và Mobile.
- [x] Đồng bộ `tailwind.config.js` trên Mobile với bảng màu và font chữ `Farro` của Web.

### Mobile UI Implementation
- [x] Xây dựng Component `AppHeader` dùng chung (Chuẩn 56px, Farro font, Glassmorphism style).
- [x] Áp dụng `AppHeader` và phong cách mới cho màn hình **Vocab Lab Index** và **Study Screen**.
- [x] Cập nhật giao diện `FlashcardViewer` (Màu sắc, Font Farro cho nội dung thẻ).
- [x] Hoàn thiện `FSRSRatingBar` với 4 màu chuẩn: Again (Danger), Hard (Warning), Good (Success), Easy (Info).
- [x] Tinh chỉnh **Bottom Tab Bar** (Icons, Fonts, và hiệu ứng nền).

---

## 2. 🟡 Tasks Đang Thực Hiện / Cần Làm Tiếp (To-Do)

### VOCAB-04: API Integration & Logic (Phase: Next)
- [ ] Xây dựng hook `useStudySession` để lấy dữ liệu học tập thực tế từ API thay vì Mock data.
- [ ] Triển khai logic gửi kết quả đánh giá (1-4) lên Backend (`POST /vocab-lab/review`).
- [ ] Xử lý **Optimistic Updates** (cập nhật giao diện ngay lập tức khi nhấn nút rating).

### UI/UX Polish
- [ ] Khôi phục hiệu ứng **3D Flip Animation** cho Flashcard bằng `react-native-reanimated` (cần kiểm tra độ ổn định của môi trường).
- [ ] Hoàn thiện màn hình **Study Result** (Thống kê sau khi hoàn thành session).
- [ ] Implement màn hình **Empty State** sinh động cho các bộ từ vựng chưa có thẻ.

---

## 3. 📚 Tài Liệu Tham Khảo (References)

| Tài liệu | Nội dung chính |
|:---|:---|
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Quy chuẩn màu sắc, font chữ, spacing và menu. |
| [WEB_TO_MOBILE_MAPPING.md](./WEB_TO_MOBILE_MAPPING.md) | Hướng dẫn đồng bộ logic và data giữa Web và Mobile. |
| [code-rules.md](./code-rules.md) | Các nguyên tắc SRP, OCP, DIP và Clean Code bắt buộc tuân thủ. |
| [Prisma Schema](./backend-core/prisma/schema.prisma) | Cấu trúc dữ liệu Database (Source of Truth). |

---

## 4. ⚠️ Ghi Chú Quan Trọng (Notes)
- **Git Workflow:** Tiếp tục làm việc trên nhánh hiện tại. **KHÔNG** merge vào `main` cho đến khi tính năng hoàn thành và được User yêu cầu.
- **Environment:** Nếu gặp lỗi Reanimated `Exception in HostFunction`, hãy kiểm tra cache của Expo Go hoặc cân nhắc hạ cấp thư viện xuống bản Stable (~3.16.1).
- **FSRS Rating:** Luôn sử dụng thang điểm 1-4 (Again-Hard-Good-Easy), không nhầm lẫn với thang 0-5 của SM-2.
