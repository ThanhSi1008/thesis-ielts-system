# Phase 3 Task Tracker: MVP Development

> Tài liệu theo dõi tiến độ chi tiết (Ticket-level) cho Phase 3, bám sát các kiến trúc và quy tắc khắt khe đã được chốt trong `RULES.md`, `SKILL.md` và 4 file kế hoạch Module.

---

## MODULE 1: Authentication & Navigation Foundation

| Trạng thái | Task ID | Tên Task & Chi tiết kỹ thuật | File dự kiến |
|:---:|:---|:---|:---|
| [ ] | **AUTH-01** | **Xây dựng Form Components (Chống Re-render)**<br/>- Khởi tạo `AppTextInput` và `AppButton`.<br/>- BẮT BUỘC dùng `react-hook-form` + `zod` để quản lý state và validate (email format, password > 6 ký tự).<br/>- Dùng `clsx` đổi màu viền input khi có lỗi. | `components/ui/AppTextInput.tsx`<br/>`components/ui/AppButton.tsx` |
| [ ] | **AUTH-02** | **Xây dựng AuthLayout (Xử lý Keyboard)**<br/>- Tạo layout chung cho Login/Register.<br/>- Bắt buộc wrap nội dung bằng `KeyboardAvoidingView` (hoặc ScrollView) để bàn phím ảo không che mất nút Submit. | `features/auth/components/AuthLayout.tsx` |
| [ ] | **AUTH-03** | **API Hooks: Login & Register**<br/>- Viết `useLogin` (payload `{ email, password }`). Khớp DTO với backend.<br/>- Handle HTTP 401 trả ra Error message tiếng Anh.<br/>- Gọi `setAuthData` từ `useAuthStore` trong `onSuccess`. | `features/auth/hooks/useLogin.ts`<br/>`features/auth/hooks/useRegister.ts` |
| [ ] | **AUTH-04** | **Routing: Auth Guard & Splash Screen**<br/>- Setup `app/_layout.tsx` với `QueryClientProvider`.<br/>- Dùng `expo-splash-screen` giữ màn hình chờ cho đến khi Zustand đọc xong token từ MMKV/SecureStore, sau đó mới ẩn đi (Chống chớp màn hình Login). | `app/_layout.tsx` |
| [ ] | **AUTH-05** | **Screens: Login, Register & Bottom Tabs**<br/>- Code UI màn hình Login, Register dựa vào layout và form components.<br/>- Setup `(tabs)/_layout.tsx` với các tab rỗng. | `app/(auth)/login.tsx`<br/>`app/(auth)/register.tsx`<br/>`app/(tabs)/_layout.tsx` |

---

## MODULE 2: Dữ liệu tĩnh & Vocab-Lab (FSRS)

| Trạng thái | Task ID | Tên Task & Chi tiết kỹ thuật | File dự kiến |
|:---:|:---|:---|:---|
| [ ] | **VOCAB-01** | **UI: DeckCard & Màn hình chính**<br/>- Xây dựng component thẻ bộ từ vựng.<br/>- Dùng `React.memo` (Chuẩn `SKILL.md`).<br/>- Hook `useDecks` fetch data từ `/vocab-lab/decks`. | `features/vocabulary/components/DeckCard.tsx`<br/>`app/(tabs)/vocab-lab/index.tsx` |
| [ ] | **VOCAB-02** | **UI: FlashcardViewer (Animation 3D)**<br/>- BẮT BUỘC dùng `react-native-reanimated` (`useSharedValue`, `interpolate`) cho hiệu ứng lật thẻ trục `rotateY` trên Native UI Thread (Chống khựng).<br/>- Quản lý state lật thẻ cục bộ. | `features/vocab-lab/components/FlashcardViewer.tsx` |
| [ ] | **VOCAB-03** | **UI: FSRSRatingBar & EmptyState (English Only)**<br/>- 4 nút chấm điểm FSRS: 1-Again (Đỏ), 2-Hard (Cam), 3-Good (Xanh lá), 4-Easy (Xanh dương).<br/>- Empty State: "You're all caught up for today!". | `features/vocab-lab/components/FSRSRatingBar.tsx`<br/>`components/feedback/EmptyState.tsx` |
| [ ] | **VOCAB-04** | **Logic: useStudySession & Optimistic Update**<br/>- Dùng `onMutate` của TanStack Query để loại bỏ độ trễ: Pop (xóa) thẻ hiện tại ngay lập tức khỏi state khi user bấm Rating, hiển thị thẻ tiếp theo tức thì.<br/>- Request API `/vocab-lab/review` chạy ngầm (Background Mutation). | `features/vocab-lab/hooks/useStudySession.ts` |

---

## MODULE 3: Dữ liệu phức tạp IELTS Exams

| Trạng thái | Task ID | Tên Task & Chi tiết kỹ thuật | File dự kiến |
|:---:|:---|:---|:---|
| [ ] | **EXAM-01** | **UI: PassageViewer & Bottom Sheet (UX)**<br/>- Không dùng split-screen. Passage (bài đọc) hiển thị toàn màn hình.<br/>- Setup thư viện `@gorhom/bottom-sheet` để chứa danh sách câu hỏi, vuốt kéo tự nhiên. | `features/ielts/components/PassageViewer.tsx` |
| [ ] | **EXAM-02** | **Zustand: useExamSessionStore (Autosave)**<br/>- Lưu answers map người dùng đã chọn.<br/>- Dùng middleware `persist` + `react-native-mmkv` lưu offline liên tục (Chống mất bài khi kill app). | `features/ielts/stores/useExamSessionStore.ts` |
| [ ] | **EXAM-03** | **Logic: Đồng hồ đếm ngược (Anti-freeze Timer)**<br/>- Không dùng `setInterval` đếm lùi tĩnh.<br/>- Tính toán dựa trên `TargetEndTime - Date.now()` để đối phó việc HĐH đóng băng JS ở background. | `features/ielts/components/ExamTimer.tsx` |
| [ ] | **EXAM-04** | **Tối ưu Re-render Tuyệt đối (FlashList & Memo)**<br/>- Xây dựng Question Types (`MultipleChoice`, `FillBlank`).<br/>- Component chỉ listen đúng `id` của nó qua Zustand selector.<br/>- Bắt buộc wrap `React.memo` + `propsAreEqual`.<br/>- Render bằng `FlashList` + `estimatedItemSize`. | `features/ielts/components/QuestionTypes/...`<br/>`app/(tabs)/exams/session/[sessionId].tsx` |
| [ ] | **EXAM-05** | **API Hooks: Fetch & Submit Exam**<br/>- Viết Type Guard `isExamQuestion` parsing `unknown` để đảm bảo an toàn cho JSON lớn.<br/>- Hook `useExams`, `useExamDetail`, `useSubmitExam`. | `features/ielts/hooks/useExamDetail.ts` |

---

## MODULE 4: Luồng Bất đồng bộ Media (Shadowing & Pronunciation)

| Trạng thái | Task ID | Tên Task & Chi tiết kỹ thuật | File dự kiến |
|:---:|:---|:---|:---|
| [ ] | **MEDIA-01** | **Hook: useAudioRecorder (Chuẩn Whisper AI)**<br/>- Wrapper `expo-av`. Xử lý Permission.<br/>- Preset: `HIGH_QUALITY`. Định dạng xuất: `.m4a` (AAC codec).<br/>- Bật `isMeteringEnabled: true` để lấy biên độ vẽ Waveform. | `features/media/hooks/useAudioRecorder.ts` |
| [ ] | **MEDIA-02** | **Hook: useUploadAudio (FormData Hack)**<br/>- Xử lý upload file lên API.<br/>- Phải tạo object theo chuẩn `{ uri, name, type }` và ép kiểu `as any` để bypass lỗi thiếu class `File` của React Native. | `features/pronunciation/hooks/useUploadAudio.ts` |
| [ ] | **MEDIA-03** | **Hook: useAttemptPolling (RabbitMQ Sync)**<br/>- Dùng TanStack Query `refetchInterval` gọi API mỗi 2000ms.<br/>- Tự dừng polling khi có status `COMPLETED` hoặc `FAILED`. | `features/pronunciation/hooks/useAttemptPolling.ts` |
| [ ] | **MEDIA-04** | **UI: Shadowing Video Player**<br/>- BẮT BUỘC dùng thư viện `react-native-youtube-iframe`.<br/>- Lập trình các control Play/Pause/Seek bằng code để hỗ trợ vòng lặp nghe lại câu. | `features/shadowing/components/VideoPlayer.tsx` |
| [ ] | **MEDIA-05** | **Screens: Tích hợp PollingStatus & Player**<br/>- Ráp nối UI Waveform ghi âm, Audio Player, và thẻ trạng thái Polling. | `app/(tabs)/pronunciation/[lessonId].tsx`<br/>`app/(tabs)/shadowing/[videoId].tsx` |
