# Kế Hoạch Hiện Thực & Phân Tích Feature Gap: Speaking & Writing (Mobile vs Web)

**Ngày phân tích:** 2026-05-04  
**Nền tảng:** React Native / Expo (Mobile) vs React / Next.js (Web)  
**Phân tích bởi:** Antigravity Agent — Read-Only Mode (No code was modified)

---

## 📋 1. Tổng quan các điểm còn thiếu trên Mobile

| Skill | Trạng thái | Mức độ Gap |
|-------|-----------|------------|
| **Speaking** | ✅ Core hoạt động (record + upload + submit) | 🟡 Medium — thiếu Video Player flow, sequential step-by-step UX |
| **Writing** | ✅ Core hoạt động (textarea + word count) | 🟠 High — thiếu image_url, time_advice, instruction, KeyboardAvoidingView, AI grading poll |

### Nhận xét nhanh

**Speaking Mobile** đã có: `expo-audio` recording, mic permission, upload `.m4a` lên `/exams/audio/upload`, text fallback, Part 2 preparation timer.  
**Điểm thiếu lớn nhất:** Web sử dụng luồng **Video → Think → Record** với `<video>` element. Mobile hoàn toàn bỏ qua luồng video câu hỏi — user tap record thẳng mà không có video context.

**Writing Mobile** đã có: tab Task 1/2, textarea, word count, progress bar.  
**Điểm thiếu lớn nhất:** không hiển thị `image_url` (Task 1 thường là chart/graph), thiếu `time_advice` + `min_words` từ data thực, không có `KeyboardAvoidingView`, không có AI grading poll.

---

## 🎤 2. Phân tích & Kế hoạch cho kỹ năng SPEAKING

### 2.1. Feature Gap (Web có nhưng Mobile chưa có/chưa hoàn thiện)

#### UI/UX

| Feature | Web (SpeakingTaskBoard.tsx) | Mobile (SpeakingExamBlock.tsx) | Status |
|---------|------------------------------|--------------------------------|--------|
| Video player câu hỏi per-question | ✅ `<video>` element | ❌ Không có | MISSING |
| Sequential step state machine | ✅ IDLE→LISTEN_CAPTION→PLAYING→THINK_CAPTION→THINKING→RECORDING→RECORDED | ❌ Chỉ Record/Stop | MISSING |
| Think countdown timer (P1/3: 2s, P2: 60s) | ✅ Auto-countdown | ❌ Không có | MISSING |
| Caption overlay ("Listen to question", "Time to think") | ✅ Overlay div | ❌ Không có | MISSING |
| Nút Skip question | ✅ Có | ❌ Không có | MISSING |
| Nút Next (chỉ enable sau RECORDED) | ✅ Có | ❌ Không có (scroll-based) | MISSING |
| Part 2: side-by-side video + cue card | ✅ 2-column layout | ⚠️ Vertical stack | Partial |
| Part 2: Notes textarea trong think time | ✅ Có `<textarea>` | ❌ Không có | MISSING |
| Part 2: second video (video2) sau thinking | ✅ PLAYING_2 state | ❌ Không có | MISSING |
| AI Grading overlay + poll loop | ✅ GradingContext polls /sessions/:id | ⚠️ Có overlay nhưng không poll | Partial |

#### Logic/System

| Feature | Web | Mobile | Status |
|---------|-----|--------|--------|
| Audio format upload | audio/webm (MediaRecorder) | audio/m4a (expo-audio) | ⚠️ Format khác nhau |
| Upload flow | blob → /exams/audio/upload → URL | File URI → FormData → /exams/audio/upload → URL | ✅ Hoạt động |
| Submit payload | { "0-0": url, "0-1": url } | { "0-0": url } | ✅ Match |
| AI grading poll | ✅ Polls every 5s until GRADED | ❌ Navigate thẳng không poll | MISSING |
| Auto-advance next question với video | ✅ autoPlayNext flag | ❌ Không có | MISSING |

### 2.2. Kế hoạch hiện thực (Action Items)

**Task 1: Tích hợp Video Player cho Speaking questions**
- Cần cài đặt: `expo-video` (SDK 50+, requires native build)
- Mỗi question có `video` URL và `video2` URL (Part 2)
- Kiểm tra URL type: nếu Cloudinary/S3 → `expo-video`; nếu YouTube → `WebView` embed (đã có)
- Command: `npx expo install expo-video`

**Task 2: Implement Sequential Step State Machine**
- Replicate web logic: `IDLE | LISTEN_CAPTION | PLAYING | THINK_CAPTION | THINKING | PLAYING_2 | RECORDING | RECORDED`
- Part 1/3: think time = 2s; Part 2: think time = 60s (reuse PreparationTimer component đã có)
- Caption overlay: absolute-positioned `<View>` trên video

**Task 3: Implement Sequential Navigation (Next / Skip)**
- Thay scroll-based bằng per-question navigation
- "Skip" → advance không cần recording
- "Next" → chỉ enable sau RECORDED

**Task 4: Part 2 Notes Area**
- Thêm `<TextInput multiline>` bên dưới cue card khi ở THINKING state

**Task 5: AI Grading Poll Hook**
- Sau `submitSession` → poll `ieltsExamsApi.getSession(id)` mỗi 5s
- Khi `session.result.speakingScore != null` hoặc `session.status === 'GRADED'` → navigate to result

> ⚠️ **Lưu ý kỹ thuật:**
> - Backend `/exams/audio/upload` cần verify có accept `audio/m4a` (iOS) không, hay chỉ nhận `audio/webm` (web)
> - `expo-video` cần rebuild native — không hoạt động với Expo Go
> - `video2` (Part 2 second video) cần lazy-load để tiết kiệm băng thông

---

## ✍️ 3. Phân tích & Kế hoạch cho kỹ năng WRITING

### 3.1. Feature Gap (Web có nhưng Mobile chưa có/chưa hoàn thiện)

#### UI/UX

| Feature | Web (WritingTaskBoard.tsx) | Mobile (WritingExamBlock.tsx) | Status |
|---------|---------------------------|-------------------------------|--------|
| image_url (Task 1 chart/graph) | ✅ `<img>` render | ❌ Không có | MISSING |
| time_advice ("spend X minutes") | ✅ Instruction banner | ❌ Không có | MISSING |
| min_words từ data thực | ✅ task.min_words | ⚠️ Hardcode [150, 250] | Partial |
| instruction field (Task 2) | ✅ Render trước prompt | ❌ Không có | MISSING |
| KeyboardAvoidingView | N/A web | ❌ Keyboard che textarea | MISSING |
| autoCorrect=off / spellCheck=off | ✅ Set | ❌ Không set | MISSING |
| Resizable split pane | ✅ Có | N/A mobile | N/A |

#### Logic/System

| Feature | Web | Mobile | Status |
|---------|-----|--------|--------|
| Submit payload format | `{ task1: "plain text", task2: "plain text" }` | `{ task1: "...", task2: "..." }` | ✅ Match |
| AI grading poll | ✅ GradingContext polls every 5s | ❌ Navigate ngay sau submit | MISSING |
| Rich text editor | ❌ Plain textarea | ❌ Plain TextInput | ✅ Match |
| Auto-save / draft | ❌ Không có | ❌ Không có | Not required |

### 3.2. Kế hoạch hiện thực (Action Items)

**Task 1: Hiển thị image_url cho Task 1**
- Thêm `<Image>` component trong prompt area, chỉ render khi `task.image_url` tồn tại
- Cần zoom capability: dùng `<Image resizeMode="contain">` + ScrollView hoặc cài `react-native-image-zoom-viewer`
- IELTS Task 1 chart/graph cần zoom để đọc chi tiết trên màn hình nhỏ

**Task 2: Thêm time_advice, instruction, min_words từ data thực**
- Cập nhật `WritingTask` interface: thêm `time_advice?: string`, `instruction?: string`, `min_words: number`
- Render banner: `"You should spend about {time_advice} minutes on this task. Write at least {min_words} words."`
- Thay hardcode `MIN_WORDS = [150, 250]` bằng `task.min_words`

**Task 3: KeyboardAvoidingView + UX bàn phím**
- Wrap `WritingExamBlock` trong `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`
- Thêm `autoCorrect={false}`, `spellCheck={false}` cho essay TextInput (chuẩn thi thật)

**Task 4: AI Grading Poll (dùng chung logic với Speaking Task 5)**
- Poll `ieltsExamsApi.getSession(id)` mỗi 5s sau submit
- Điều kiện DONE: `session.result.writingScore != null` hoặc `session.status === 'GRADED'`
- Hiện tại mobile navigate ngay sau `submitSession` — cần giữ overlay cho đến khi có score

---

## 📦 4. Dependency Requirement

| Thư viện | Mục đích | Trạng thái hiện tại | Priority |
|----------|----------|---------------------|----------|
| `expo-video` | Native video player cho Speaking questions | ❌ Chưa cài | 🔴 Critical |
| `expo-audio` | Audio recording | ✅ Đã cài | — |
| `expo-file-system` | Đọc file URI sau recording | ✅ Đã cài | — |
| `react-native-webview` | YouTube embed Preparation Screen | ✅ Đã cài | — |
| `react-native-image-zoom-viewer` | Zoom chart/graph Task 1 | ❌ Chưa cài | 🟡 Medium |

**Cài đặt cần thiết:**
```bash
# Bắt buộc cho Speaking video
npx expo install expo-video

# Tùy chọn cho Writing image zoom
npx expo install react-native-image-zoom-viewer

# Sau khi cài expo-video phải rebuild native:
npx expo run:ios
```

---

## ✅ 5. Milestone & Checklist nghiệm thu

### 🎤 Speaking
- [ ] M1-S1: Video player component hoạt động với URL từ speaking question data
- [ ] M1-S2: Sequential state machine (IDLE→LISTEN→PLAY→THINK→RECORD→DONE) cho Part 1 & 3
- [ ] M1-S3: Part 2 think timer 60s + notes area
- [ ] M1-S4: video2 (second video after thinking, Part 2) play đúng thứ tự
- [ ] M1-S5: Skip + Next buttons — Next disabled cho đến RECORDED
- [ ] M1-S6: Audio upload .m4a thành công, URL trả về lưu vào answers
- [ ] M1-S7: Submit payload `{ "0-0": url, "0-1": url }` khớp 100% với Web format
- [ ] M1-S8: AI Grading poll — không navigate cho đến `session.status === 'GRADED'`

### ✍️ Writing
- [ ] M2-W1: image_url hiển thị đúng trong Task 1, có thể zoom
- [ ] M2-W2: time_advice và min_words đọc từ data thực (không hardcode)
- [ ] M2-W3: instruction field của Task 2 hiển thị trước prompt
- [ ] M2-W4: Keyboard không che khuất textarea
- [ ] M2-W5: autoCorrect=false, spellCheck=false được set
- [ ] M2-W6: Submit payload `{ task1: "...", task2: "..." }` plain text khớp 100% với Web
- [ ] M2-W7: AI Grading poll hoạt động (chờ writingScore != null)

### 🔗 Shared
- [ ] M3-SH1: Luồng hoàn chỉnh Speaking: Start → Video → Think → Record → Submit → AI Grade → Result
- [ ] M3-SH2: Luồng hoàn chỉnh Writing: Start → Prompt/Image → Gõ text → Submit → AI Grade → Result
- [ ] M3-SH3: Backend API không break — payload format Speaking (URL map) và Writing (task1/task2) không đổi
- [ ] M3-SH4: `npx tsc --noEmit --skipLibCheck` pass 0 errors

---

## 🗂️ Phụ lục: File tham chiếu chính

| File | Platform | Role |
|------|----------|------|
| `frontend-web/src/components/SpeakingTaskBoard.tsx` | Web | **Chuẩn gốc** Speaking UX flow (562 lines) |
| `frontend-web/src/components/WritingTaskBoard.tsx` | Web | **Chuẩn gốc** Writing UX (236 lines) |
| `frontend-web/src/contexts/GradingContext.tsx` | Web | Logic poll AI score sau submit |
| `frontend-mobile/components/ielts/SpeakingExamBlock.tsx` | Mobile | Speaking hiện tại — cần refactor |
| `frontend-mobile/components/ielts/WritingExamBlock.tsx` | Mobile | Writing hiện tại — cần nâng cấp |
| `frontend-mobile/app/ielts/intensive/[examId].tsx` | Mobile | Container — submit logic cần thêm poll |
| `frontend-mobile/services/ielts.api.ts` | Mobile | `submitSession`, `uploadSpeakingAudio` |
