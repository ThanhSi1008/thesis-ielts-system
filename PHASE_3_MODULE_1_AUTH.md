# Phase 3 - Module 1: Authentication & Navigation Foundation

## 1. Mục Tiêu Module (Goal)
- Thiết lập hệ thống định tuyến (Routing) bảo vệ người dùng (Auth Guard).
- Triển khai màn hình Đăng nhập (Login) và Đăng ký (Register).
- Khởi tạo thanh điều hướng chính (Bottom Tabs) cho ứng dụng.

## 2. UI Components (NativeWind v4 & Form Management)
- **Quản lý Form & Validation**: BẮT BUỘC sử dụng `react-hook-form` kết hợp `zod` để quản lý state của màn hình Login/Register (validate email format, password > 6 ký tự). Việc này đảm bảo app không bị re-render liên tục mỗi lần user gõ phím (chuẩn chống re-render trong `SKILL.md`).
- `components/ui/AppTextInput.tsx`: Khung nhập liệu với icon, xử lý lỗi validation, dùng `clsx` để đổi màu border khi có lỗi.
- `components/ui/AppButton.tsx`: Nút bấm có trạng thái `loading` và `disabled` (dựa trên config map như trong `RULES.md`).
- `features/auth/components/AuthLayout.tsx`: Layout bọc ngoài màn hình auth, chứa background/logo chung. **Bắt buộc bọc bằng `KeyboardAvoidingView`** (hoặc `ScrollView`) để UI tự động đẩy lên, đảm bảo bàn phím không che khuất nút Đăng nhập.
- `features/auth/components/SocialLoginButtons.tsx`: UI các nút đăng nhập bằng Google/Apple (nếu có).

## 3. Hooks / Data Fetching (TanStack Query / Zustand)
- `features/auth/hooks/useLogin.ts`: Sử dụng `useMutation` để gọi API `/auth/login`. 
  - **Khế ước API (API Contract)**: Hook nhận payload `{ email, password }` và mong đợi response trả về chuẩn khớp với DTO backend (đã định nghĩa ở `core/types/auth.types.ts`).
  - Phải bắt lỗi HTTP 401 (Sai thông tin) và trả ra message lỗi bằng Tiếng Anh.
  - Trong `onSuccess`, gọi `setAuthData` từ `useAuthStore` đã làm ở Phase 2.
- `features/auth/hooks/useRegister.ts`: Sử dụng `useMutation` để gọi API `/auth/register`. Xử lý lỗi trả về để hiển thị trên UI.

## 4. Cấu trúc Routing (Expo Router `app/`)
- `app/_layout.tsx`: Root layout, khởi tạo `QueryClientProvider` và chứa logic Auth Guard.
  - **Logic Auth Guard & Splash Screen**: Giữ màn hình Splash Screen (thông qua `expo-splash-screen`) cho đến khi Zustand hoàn tất việc kiểm tra trạng thái `isAuthenticated` khởi tạo từ SecureStore. Sau khi store load xong mới quyết định chuyển hướng và ẩn Splash Screen, tránh lỗi chớp màn hình Login.
- `app/(auth)/_layout.tsx`: Layout riêng ẩn header cho luồng đăng nhập.
- `app/(auth)/login.tsx`: Màn hình Login.
- `app/(auth)/register.tsx`: Màn hình Đăng ký.
- `app/(tabs)/_layout.tsx`: Bottom Tab Navigator chính thức. Tạm thời tạo các tab trống cho `Vocabulary`, `Exams`, `Pronunciation`, `Profile`.

## 5. Acceptance Criteria (Tiêu chí nghiệm thu)
- User chưa đăng nhập truy cập app phải bị đẩy về màn hình Login.
- User đăng nhập thành công phải được lưu `refresh_token` vào SecureStore và `access_token` vào Zustand, sau đó tự động điều hướng vào màn hình Tabs.
- Giao diện Login/Register phải đáp ứng đúng thiết kế NativeWind (kế thừa bảng màu từ Next.js).
- Hiển thị đúng Error message từ Backend khi nhập sai tài khoản.
