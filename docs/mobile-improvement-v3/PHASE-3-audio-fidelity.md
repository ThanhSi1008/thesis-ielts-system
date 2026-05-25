# PHASE 3 — Audio Listening: Tách Chế Độ Exam vs Practice

> **Mục tiêu:** Listening trong **phòng thi thật** phải chân thực (phát một lần, liên tục, không tua); trong **luyện tập** phải linh hoạt (tua/replay/pause).
> **Mức độ:** 🟡 — độ chân thực thi thật & chất lượng luyện tập.
> **Phụ thuộc:** Độc lập; chạm `ExamAudioPlayer`, `RichAudioPlayer`, 2 runner intensive.

---

## Bối cảnh kỹ thuật

| Nơi | Player | Hành vi hiện tại | Vấn đề |
|---|---|---|---|
| Intensive full-exam (`[examId].tsx`) | `ExamAudioPlayer` | Tab theo part; mỗi tab autoplay; đổi tab → **phát lại từ đầu**; chỉ chỉnh **volume** | Tua lại được → không giống thi thật; không có progress/time |
| Intensive practice (`practice/[sessionId].tsx`) | `ExamAudioPlayer` | Autoplay; chỉ volume | Luyện mà **không** seek/replay/pause được |
| Advanced listening (`[skill]/[partId].tsx`) | `RichAudioPlayer` | Đầy đủ control (seek/replay) | OK cho practice |
| Web take listening | `<audio>` 1 nguồn | Phát **liên tục**, auto-advance qua part, **một lần**, không tua | Chuẩn cần mô phỏng |

`ExamAudioPlayer` hiện chỉ nhận `{ isPlaying, volume, onVolumeChange }` (xem `components/intensive/ExamAudioPlayer.tsx`).

---

## Danh sách công việc

### P3-1 · Chế độ "Exam" cho Listening full-exam: phát một lần, liên tục, auto-advance 🟡

**Việc cần làm:**
- Mô phỏng web: phát **liên tục** qua các part theo thứ tự; khi audio part kết thúc → tự chuyển part kế (auto-advance), **không** cho phát lại part đã qua.
- Bỏ cơ chế "đổi tab → phát lại từ đầu" trong chế độ exam. Tab part vẫn dùng để **xem câu hỏi** part đó, nhưng **không** điều khiển lại audio.
- Cờ `hasStarted` + chỉ báo "Audio đang phát — Part X/4"; không hiện nút tua/replay.
- Theo dõi tiến độ audio (`useAudioPlayerStatus` của `expo-audio`) để hiển thị **thanh tiến trình + thời gian** (không cho seek).

**File:** `app/ielts/intensive/[examId].tsx`, `components/intensive/ExamAudioPlayer.tsx`

**DoD:** Bắt đầu Listening → audio chạy tuần tự 4 part, tự sang part mới, không có cách tua/nghe lại; có progress + thời gian.

---

### P3-2 · Chế độ "Practice" cho Listening: cho seek/replay/pause 🟡

**Việc cần làm:**
- Practice intensive listening (`practice/[sessionId].tsx`) chuyển sang **`RichAudioPlayer`** (hoặc nâng `ExamAudioPlayer` thêm `mode='practice'` bật seek/replay/pause + progress).
- Thống nhất một component audio nhận prop `mode: 'exam' | 'practice'`:
  - `exam`: volume + progress (read-only) + auto-advance, không seek.
  - `practice`: full transport (play/pause/seek/±10s/replay) + tốc độ phát (0.75/1.0/1.25 nếu dễ).

**File:** `components/intensive/ExamAudioPlayer.tsx` (mở rộng) hoặc thay bằng `RichAudioPlayer`, `app/ielts/intensive/practice/[sessionId].tsx`

**DoD:** Practice listening tua/nghe lại/đổi tốc độ được; full-exam vẫn khoá tua.

---

### P3-3 · Quản lý audio-session & vòng đời 🟡

**Việc cần làm:**
- Đảm bảo **pause khi rời màn / submit / hết giờ** (đã có một phần: `executeSubmit` pause; cần thêm cleanup khi unmount + khi app vào background).
- Dùng `setAudioModeAsync` nhất quán (Speaking đặt `allowsRecording`; Listening cần `playsInSilentMode` để nghe được khi máy đang ở chế độ im lặng — tránh "không có tiếng" trên iOS).
- Xử lý lỗi tải audio (URL hỏng / mạng) → hiển thị retry thay vì im lặng.

**File:** `app/ielts/intensive/[examId].tsx`, `app/ielts/intensive/practice/[sessionId].tsx`, `components/intensive/ExamAudioPlayer.tsx`

**DoD:** Khoá màn / chuyển app / im lặng iOS đều xử lý đúng; audio lỗi có retry.

---

## Tiêu chí hoàn thành Phase 3 (DoD)

- [ ] Full-exam listening: phát một lần, liên tục, auto-advance, có progress, **không** tua.
- [ ] Practice listening: tua/replay/pause (+tốc độ nếu làm).
- [ ] Audio-session bền: pause đúng lúc, nghe được ở chế độ im lặng iOS, có retry khi lỗi.

## Cách kiểm thử

1. Full-exam: nghe hết part 1 → tự sang part 2; thử bấm tab part 1 → **không** nghe lại được.
2. Practice: seek tới giữa, ±10s, đổi tốc độ.
3. iOS bật chế độ im lặng → vẫn nghe.
4. Cắt mạng giữa chừng tải audio → hiện retry.
