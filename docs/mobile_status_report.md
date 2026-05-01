# Báo cáo Trạng thái Phát triển: Mobile App vs. Web Portal

## 1. Tổng quan
Báo cáo này so sánh sự tiến triển giữa phiên bản **Mobile (React Native Expo)** và **Web (Next.js)** của hệ thống **IELTS Master AI**. Mục tiêu là xác định các phần đã hoàn thiện, sự tương đồng về cấu trúc và các lỗ hổng tính năng cần được lấp đầy trên bản Mobile.

---

## 2. So sánh Công nghệ (Tech Stack)

| Thành phần | Nền tảng Web | Nền tảng Mobile |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React Native (Expo SDK 54) |
| **Routing** | Next.js File-based Routing | Expo Router v6 |
| **Styling** | Tailwind CSS v3 | NativeWind v4 (Tailwind for RN) |
| **State Management** | Zustand | Context API & Hooks |
| **Data Fetching** | Axios + Custom API Client | Axios + Custom API Client |
| **Animations** | Framer Motion | React Native Reanimated v4 |
| **UI Components** | Radix UI (Headless) | Custom UI Components (NativeWind) |

---

## 3. Cấu trúc Thư mục (Directory Structure)

### 🌍 Frontend Web (`frontend-web`)
Cấu trúc theo chuẩn Next.js hiện đại:
- `src/app/`: Quản lý routes và pages (IELTS, Grammar, Vocab...).
- `src/components/`: Chứa các component đặc thù (Speaking/Writing Board, Dictionary Popup).
- `src/services/`: Quản lý logic API (`auth.service.ts`, `ielts.api.ts`).
- `src/lib/`: Các cấu hình dùng chung (api-client).
- `src/types/`: Định nghĩa kiểu dữ liệu.

### 📱 Frontend Mobile (`frontend-mobile`)
Cấu trúc module hóa cao, tối ưu cho React Native:
- `app/`: Thư mục route chính (Sử dụng `(auth)`, `(tabs)` để phân cấp điều hướng).
- `features/`: Chứa logic phức tạp theo module (ví dụ: `features/ielts`, `features/vocab-lab`).
- `components/`:
  - `ui/`: Các nguyên tử UI cơ bản (Button, Input, Card).
  - `ielts/`: Các component đặc thù cho luyện thi.
- `services/`: API layer đồng bộ với bản Web (`api-client.ts`, `ielts.api.ts`).
- `hooks/`: Chứa các custom hooks cho logic mobile (Haptics, Voice, Storage).
- `constants/`: Quản lý Design Tokens (COLORS, SPACING, FONTS).

---

## 4. Trạng thái Tính năng (Feature Progress)

Dưới đây là bảng so sánh mức độ hoàn thiện của các tính năng trên Mobile so với Web:

| Tính năng | Web Status | Mobile Status | Chi tiết Mobile |
| :--- | :--- | :--- | :--- |
| **Authentication** | ✅ Done | ✅ Done | Có sẵn Luồng Login/Register trong `(auth)`. |
| **IELTS Roadmap** | ✅ Done | ✅ Done | Giao diện Roadmap, Statistics, History đã hoàn thiện. |
| **IELTS Lessons** | ✅ Done | 🔄 In Progress | Đã có viewer cho Basic/Advanced/Intensive. Hỗ trợ Markdown & Quiz. |
| **Grammar** | ✅ Done | ✅ Done | Chuyển đổi thành một Tab chính trong hệ thống. |
| **Vocabulary** | ✅ Done | ✅ Done | Hệ thống học từ vựng đồng bộ hóa tốt. |
| **Vocab Lab** | ✅ Done | 🔄 In Progress | Đang triển khai trong `features/vocab-lab`. |
| **Pronunciation** | ✅ Done | 🔄 In Progress | Đã có màn hình trong Tabs, đang hoàn thiện logic AI. |
| **Shadowing** | ✅ Done | 🔄 In Progress | Đang triển khai logic ghi âm và nhận diện giọng nói. |
| **Student-Teacher** | ✅ Done | ✅ Done | Module tương tác giáo viên-học sinh đã có cấu trúc. |
| **Onboarding** | ⚠️ N/A | ✅ Done | Mobile có luồng Onboarding/Profile setup chuyên sâu. |
| **Exams/Results** | ✅ Done | ✅ Done | Có màn hình danh sách đề thi và xem kết quả chi tiết. |

---

## 5. Hệ thống Component (UI Components)

### Các Component đã hoàn thiện trên Mobile:
1.  **Atomic UI**: `Button`, `Input`, `Card`, `Badge` (Đã được chuẩn hóa qua `design-tokens.json`).
2.  **Feedback**: `LoadingSpinner`, `ErrorView`, `Toaster` (Sử dụng Toast native).
3.  **IELTS Specific**:
    *   `LessonViewer`: Hỗ trợ render Markdown và Quiz tương tác.
    *   `RoadmapStep`: Hiển thị tiến trình học tập theo dạng node.
    *   `StatisticsChart`: Hiển thị biểu đồ năng lực (Sử dụng RN SVG).
4.  **Navigation**: `CustomTabBar` với hiệu ứng Reanimated, `Stack` điều hướng mượt mà.

### Các Component Web chưa có bản tương đương trên Mobile:
*   `DictionaryPopup`: Cần giải pháp UX khác cho mobile (ví dụ: Bottom Sheet thay vì Hover/Popup).
*   `GlobalAIChatFab`: Đang chờ tích hợp Voice AI chuyên sâu.
*   `SpeakingTaskBoard`: Cần tối ưu lại layout từ màn hình rộng sang màn hình dọc.

---

## 6. Đánh giá & Đề xuất

### Điểm mạnh hiện tại của Mobile:
- **Hiệu ứng & Trải nghiệm (UX)**: Sử dụng Haptics và Reanimated tốt hơn bản Web.
- **Onboarding**: Luồng người dùng mới được chăm chút kỹ hơn.
- **Cấu trúc code**: Sạch sẽ, tuân thủ SRP và DIP, dễ mở rộng.

### Các phần cần tập trung tiếp theo:
1.  **AI Voice Integration**: Hoàn thiện logic `expo-speech-recognition` cho module Pronunciation và Shadowing.
2.  **Offline Cache**: Tận dụng `expo-file-system` để lưu trữ bài học ngoại tuyến.
3.  **Media Player**: Tối ưu hóa `expo-video` và `expo-audio` cho các bài nghe IELTS.

---
*Người báo cáo: Antigravity AI Architect*
*Ngày: 30/04/2026*
