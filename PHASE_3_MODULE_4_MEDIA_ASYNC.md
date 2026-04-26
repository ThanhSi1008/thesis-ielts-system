# Phase 3 - Module 4: Luồng Bất đồng bộ Media (Shadowing & Pronunciation)

## 1. Mục Tiêu Module (Goal)
- Xử lý các chức năng liên quan đến Audio/Video Native.
- Upload file Audio lên MinIO Storage.
- Giải quyết bài toán Polling kết quả AI từ RabbitMQ/FastAPI sau khi nộp file.

## 2. UI Components (NativeWind v4)
- `features/pronunciation/components/AudioRecorder.tsx`: Giao diện thu âm với sóng âm thanh waveform giả lập và đồng hồ đếm giây.
- `features/pronunciation/components/AudioPlayer.tsx`: Component phát lại đoạn ghi âm kèm thanh tiến trình.
- `features/shadowing/components/VideoPlayer.tsx`: Component phát Video. **Bắt buộc dùng thư viện `react-native-youtube-iframe`** thay vì WebView thường để tránh quảng cáo che màn hình và hỗ trợ điều khiển Play/Pause/Seek bằng code (rất quan trọng cho tính năng Shadowing cần lặp lại một câu nhiều lần).
- `features/pronunciation/components/PollingStatusCard.tsx`: Component hiển thị các trạng thái: Đang Upload -> Đang Chấm Điểm -> Kết Quả.

## 3. Hooks / Data Fetching (TanStack Query / Expo AV)
- `features/media/hooks/useAudioRecorder.ts`: Wrapper bao quanh `expo-av`, xử lý cấp quyền (Permission), bắt đầu/dừng thu âm, và lấy file URI.
  - **Cấu hình ghi âm chuẩn AI**: BẮT BUỘC dùng preset `Audio.RecordingOptionsPresets.HIGH_QUALITY`. Cần cấu hình để xuất ra định dạng `.m4a` (AAC codec) giúp file nhẹ, tương thích chéo nền tảng và Backend Whisper AI nhận diện chính xác. Bật `isMeteringEnabled: true` để lấy biên độ âm thanh vẽ Waveform.
- `features/pronunciation/hooks/useUploadAudio.ts`: `useMutation` để gửi file multipart/form-data lên backend, nhận lại ID của Attempt.
  - **"Hack" FormData React Native**: Để Axios upload file thành công, object đẩy vào FormData phải theo đúng cấu trúc `{ uri: string, name: string, type: string }` và **ép kiểu `as any`** (hoặc tạo type riêng). Do RN thiếu class `File` chuẩn, thiếu ép kiểu này sẽ gây lỗi Network Error.
- `features/pronunciation/hooks/useAttemptPolling.ts`: SỬ DỤNG SỨC MẠNH CỦA TANSTACK QUERY. Khai báo `useQuery` gọi API GET `/attempts/:id`, thiết lập thuộc tính `refetchInterval` tự động lặp lại (VD: mỗi 2000ms), tự dừng `refetchInterval` khi status trả về là `COMPLETED` hoặc `FAILED` (Được đề cập chi tiết trong RULES.md).

## 4. Cấu trúc Routing (Expo Router `app/`)
- `app/(tabs)/pronunciation/index.tsx`: Chọn bài tập phát âm.
- `app/(tabs)/pronunciation/[lessonId].tsx`: Màn hình Luyện phát âm (Thu âm và gửi).
- `app/(tabs)/shadowing/index.tsx`: Danh mục bài luyện Shadowing.
- `app/(tabs)/shadowing/[videoId].tsx`: Màn hình Video shadowing và ghi âm đính kèm.

## 5. Acceptance Criteria (Tiêu chí nghiệm thu)
- App xử lý hoàn hảo việc user từ chối quyền truy cập Microphone (Hiển thị cảnh báo thân thiện).
- Code Polling TanStack Query phải hoạt động chuẩn: Gọi đều đặn mỗi X giây, và chắc chắn NGỪNG gọi ngay khi có kết quả hoặc khi user thoát màn hình.
- Khi API chấm điểm (Polling) trả về lỗi hoặc timeout, có cơ chế bắt lỗi và hiển thị nút "Thử lại".
- Layout sử dụng NativeWind với màu sắc kế thừa từ hệ thống Web App, không dùng trực tiếp StyleSheet.
