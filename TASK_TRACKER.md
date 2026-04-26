# Task & Progress Tracker

> Tài liệu theo dõi tiến độ thực hiện các hạng mục trong dự án IELTS Master AI Mobile App.
> Sử dụng để kiểm soát trạng thái (To-Do, In Progress, Done) của từng Phase.

---

## Phase 1: Phân tích & Chốt Kiến trúc (Architecture Blueprint)
*Mục tiêu: Đưa ra định hướng kỹ thuật chuẩn xác, thiết lập bộ luật (rules) và quy trình làm việc.*

- [x] **1. Phân tích tài liệu & Nghiên cứu (Research)**
  - [x] Đánh giá hạ tầng hiện tại (NestJS, FastAPI, RabbitMQ).
  - [x] Phân tích chiến lược đồng bộ dữ liệu Web-to-Mobile.
  - [x] Phân tích chiến lược xử lý polling bất đồng bộ.
- [x] **2. Chốt Kiến trúc Nền tảng (Blueprint)**
  - [x] Lựa chọn mô hình Feature-First Modular.
  - [x] Quyết định sử dụng NativeWind v4 để đồng bộ UI/UX.
  - [x] Chiến lược State Management: TanStack Query (Server State) + Zustand (Client State) + MMKV.
- [x] **3. Thiết lập Quy chuẩn Code (Guidelines)**
  - [x] Tạo file `SKILL.md` (Naming conventions, Performance, Code structrue).
  - [x] Tạo file `RULES.md` (SOLID, Clean Code cho React Native).
  - [x] Quy chuẩn đồng bộ Type (`@shared/types`).
- [x] **4. Thiết lập Quy trình Đảm bảo Chất lượng (QA & Review)**
  - [x] Tạo file `CODE_REVIEW_WORKFLOW.md` (5 tiêu chí review, Checklist).
  - [x] Tạo file `QA_TESTING_WORKFLOW.md` (Edge Cases, Manual Tests, Jest templates).

**Trạng thái Phase 1:** ✅ Hoàn thành (100%)

---

## Phase 2: Khởi tạo Nền móng (Foundation Setup)
*Mục tiêu: Dọn dẹp dự án cũ, cài đặt thư viện lõi, cấu hình API Client và hệ thống lưu trữ.*

- [x] **1. Dọn dẹp & Khởi tạo Cấu trúc Thư mục**
  - [x] Xóa bỏ các thư mục rác/demo từ code cũ (`constants`, `services`, `hooks` chung).
  - [x] Tạo cấu trúc thư mục mới (`core/`, `features/`, `components/ui`).
- [x] **2. Cài đặt Dependencies Lõi**
  - [x] Khung UI: `nativewind`, `tailwindcss`.
  - [x] Fetching & State: `@tanstack/react-query`, `zustand`.
  - [x] Storage: `react-native-mmkv`, `expo-secure-store`.
  - [x] Tiện ích: `axios`, `@shopify/flash-list`, `@gorhom/bottom-sheet`, `react-hook-form`, `zod`.
- [x] **3. Cấu hình Môi trường (.env)**
  - [x] Tạo file `.env.development` và `.env.production`.
  - [x] Ứng dụng `expo-constants` để xử lý IP LAN động.
- [x] **4. Xây dựng Secure Storage (Bảo mật Auth)**
  - [x] Xây dựng `core/auth/secure-token.ts` để lưu `refresh_token`.
  - [x] Xây dựng Auth Store (`core/auth/store.ts`) bằng Zustand.
- [x] **5. Triển khai API Client & Interceptors**
  - [x] Xây dựng `core/api/client.ts`.
  - [x] Cấu hình Request Interceptor (Đính kèm Access Token).
  - [x] Cấu hình Response Interceptor (Silent Refresh Token với cơ chế Mutex/Queue).

**Trạng thái Phase 2:** ✅ Hoàn thành (100%)

---

## Phase 3: Phát triển Tính năng Cốt lõi (MVP Development)
*Mục tiêu: Lập trình các Module nghiệp vụ chính.*

👉 **Đã được tách ra file quản lý chuyên sâu từng Task (Ticket-level) tại:** `PHASE_3_TASK_TRACKER.md`

**Trạng thái Phase 3:** ⏳ Chưa bắt đầu (0%)


