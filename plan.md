# Kế hoạch viết lại "Quy trình nghiệp vụ" — Chương 3

**File đích:** `thesis-report/chapters/03-analysis.tex` (mục `\section{Quy trình nghiệp vụ}`, dòng 4–86)
**Căn cứ:** `flow-chart-web.md` (cấu trúc đúng) + xác minh thực tế trong source code `frontend-web/src/app/**`

---

## 1. Vấn đề của bản hiện tại

Bản hiện tại tổ chức hoạt động học theo "3 giai đoạn" (Xây dựng nền tảng → Phát triển kỹ năng → Luyện thi IELTS) và **trộn lẫn** các phân hệ thực tế tách biệt trên web:

| Lỗi hiện tại | Thực tế trên web (xác minh từ Navbar + Sidebar) |
|---|---|
| Đưa Dictation vào "Kỹ năng Nghe của IELTS" | Dictation thuộc phân hệ **Shadowing & Dictation** riêng (`/shadowing-dictation/dictation`), không nằm trong IELTS |
| Đưa Shadowing vào "Kỹ năng Nói của IELTS" | Shadowing thuộc phân hệ **Shadowing & Dictation** riêng (`/shadowing-dictation/shadowing`) |
| Mô tả "Reading/Writing" như là IELTS Advanced gộp vào "Phát triển kỹ năng" | Reading/Writing/Listening/Speaking nằm phân tán ở **3 cấp độ IELTS**: Basic (lessons + exercises), Advanced (parts), Intensive (mock test) — đều thuộc phân hệ **IELTS** |
| Thiếu hoàn toàn các phân hệ: Community, Vocab Lab, Pricing | Đây là 3 phân hệ độc lập trong navbar chính |
| Foundation Vocabulary/Grammar/Pronunciation được mô tả như "tiền IELTS" nhưng không nói rõ chúng nằm trong IELTS module | Đây là sub-section **Foundation** thuộc IELTS Sidebar (`/ielts/vocabulary`, `/ielts/grammar`, `/ielts/pronunciation`) |
| Thiếu mô tả Roadmap, Statistics, Calculator, Student/Teacher, Dashboard, Test History như các tính năng riêng trong IELTS | Tất cả đều có entry riêng trong IELTS Sidebar |
| Thiếu My Shadowing/My Dictation (user-uploaded YouTube) | Có thực ở `/shadowing-dictation/shadowing/my-videos` và `/dictation/my-videos` (Premium) |

---

## 2. Cấu trúc mới (đúng với web)

Theo `Navbar.tsx` + các sidebar (`IeltsSidebar.tsx`, `CommunitySidebar.tsx`, `ProfileSidebar.tsx`), web tổ chức thành **6 phân hệ độc lập** cho Người học, cộng với phân hệ Admin:

```
\subsection{Nghiệp vụ dành cho Người học}
  \subsubsection{Quản lý tài khoản và Hồ sơ cá nhân}    [giữ — chỉnh nhẹ]
  \subsubsection{Phân hệ IELTS}                         [VIẾT MỚI — phân hệ chính, chỉ để học IELTS]
    \paragraph{1. Foundation}                            (Vocabulary / Grammar / Pronunciation)
    \paragraph{2. IELTS Basic}                           (4 skill × lessons + exercises)
    \paragraph{3. IELTS Advanced}                        (4 skill × parts, Premium)
    \paragraph{4. IELTS Intensive}                       (Mock Test + Test History)
    \paragraph{5. Roadmap}
    \paragraph{6. Statistics}
    \paragraph{7. Calculator}
    \paragraph{8. Student/Teacher}
  \subsubsection{Phân hệ Shadowing \& Dictation}        [VIẾT MỚI — học tiếng Anh tổng quát, KHÔNG phải IELTS]
    \paragraph{1. Shadowing (thư viện chuẩn)}
    \paragraph{2. Dictation (thư viện chuẩn)}
    \paragraph{3. My Shadowing / My Dictation}           (Premium, YouTube import)
  \subsubsection{Phân hệ Community}                      [VIẾT MỚI]
    \paragraph{1. Feed}
    \paragraph{2. My Activity}
    \paragraph{3. Leaderboard}                           (XP tuần + Streak)
  \subsubsection{Phân hệ Vocab Lab}                      [VIẾT MỚI — học tiếng Anh tổng quát]
    \paragraph{1. Decks}
    \paragraph{2. Add}
    \paragraph{3. Browse}
    \paragraph{4. Stats}
    \paragraph{5. Community Marketplace}
  \subsubsection{Phân hệ Pricing và Subscription}        [VIẾT MỚI]
  \subsubsection{Xem thông báo}                          [giữ]

\subsection{Nghiệp vụ dành cho Người quản lý}            [GIỮ NGUYÊN]
  \subsubsection{Quản lý nội dung Shadowing và Dictation}
  \subsubsection{Quản lý gói đăng ký thành viên}
```

---

## 3. Nội dung chi tiết từng phần (đã xác minh từ code)

### 3.1. Quản lý tài khoản và Hồ sơ cá nhân (chỉnh nhẹ)

**Giữ nội dung hiện tại** vì đã chính xác (đăng ký email/password + Google OAuth, đổi mật khẩu, cập nhật profile, theo dõi gamification). **Chỉ bổ sung:**

- Tách rõ profile thành **4 tab** (theo `ProfileSidebar.tsx`):
  1. **Account Details** — thông tin cá nhân + thông tin gói subscription đang dùng
  2. **Security** — đổi mật khẩu (chặn đối với tài khoản Google OAuth vì `password: null`)
  3. **Gamification** — Level, XP, Achievements
  4. **Danger Zone** — xóa tài khoản

---

### 3.2. Phân hệ IELTS (VIẾT LẠI HOÀN TOÀN)

**Đoạn mở đầu:** Phân hệ IELTS là phân hệ chính dành riêng cho người học có nhu cầu luyện thi IELTS, được tổ chức theo lộ trình 4 cấp độ tăng dần (Foundation → Basic → Advanced → Intensive) cộng các công cụ hỗ trợ (Roadmap, Statistics, Calculator, Student/Teacher). Truy cập tại `/ielts`, có sidebar riêng với hai nhóm: **LEARNING STAGES** và **OTHER FEATURES**.

#### 3.2.1. Foundation — Xây dựng nền tảng

Gồm 3 module con (xác minh tại `/ielts/vocabulary`, `/ielts/grammar`, `/ielts/pronunciation`):

- **Vocabulary** (6 cuốn × 30 unit × 20 từ ≈ 600 từ/cuốn): học theo unit, mỗi unit có 2 bài tập (20 câu) + 1 bài đọc hiểu cuối unit (5 câu hỏi). Hỗ trợ chọn từ trong bài để **lưu vào Vocab Lab bằng Lexon AI** (tính năng floating selection — xác minh tại `FloatingSelectionManager` trong `[unitSlug]/page.tsx`).
- **Grammar** (3 cuốn "English Grammar in Use": Elementary / Intermediate / Advanced): mỗi unit gồm phần lý thuyết + bài tập trắc nghiệm/điền từ; chấm điểm và lưu tiến độ.
- **Pronunciation** (43 âm IPA): luyện từng âm qua từ ví dụ, AI chấm phát âm dựa trên Whisper transcription + IPA phoneme matching + Levenshtein.

> **Lưu ý loại bỏ:** Đoạn FSRS / Active Recall / công thức `\ref{eq:fsrs-interval}` đang nằm trong "Vocabulary" của bản cũ thực ra **thuộc về Vocab Lab**, không phải Foundation Vocabulary. Phải tách ra mục Vocab Lab.

#### 3.2.2. IELTS Basic

(Xác minh tại `/ielts/basic/library` + `/ielts/basic/[skill]/lessons` + `/ielts/basic/[skill]/exercises`)

Gồm **4 skill** (Listening, Reading, Writing, Speaking), mỗi skill có 2 phần:
- **Lessons**: bài học lý thuyết về từng dạng câu hỏi IELTS (kèm quiz củng cố).
- **Exercises**: bài tập thực hành chuẩn IELTS (cấp độ cơ bản).

#### 3.2.3. IELTS Advanced

(Xác minh tại `/ielts/advanced` — yêu cầu Premium, `FeatureLock requiredTier="PREMIUM"`)

Luyện theo **từng Part** mô phỏng đề IELTS thật:
- Listening: Part 1–4 (theo `setParts` trong `AdvancedContent.tsx`)
- Reading: Part 1–3
- Writing: từng prompt (Task 1 + Task 2)
- Speaking: Part 1, 2, 3 (có cả mục Community/My Answers để xem bài chia sẻ + bài của mình)

Sau khi nộp: Listening/Reading chấm tự động; Writing/Speaking gửi RabbitMQ → FastAPI → Gemini chấm theo 4 tiêu chí IELTS.

#### 3.2.4. IELTS Intensive

(Xác minh tại `/ielts/intensive` + `/ielts/history`)

Hai sub-section (theo `IeltsSidebar` children):
- **Mock Tests**: thi thử toàn phần theo 4 skill, mô phỏng kỳ thi IELTS thực tế (thời gian chuẩn). Sau khi nộp, trạng thái session chuyển `IN_PROGRESS → SUBMITTED → GRADING → GRADED` (theo `IeltsIntensiveSession` enum).
- **Test History**: liệt kê toàn bộ phiên thi/luyện đã thực hiện, lọc theo skill, xem chi tiết band điểm, xóa kết quả.

#### 3.2.5. Roadmap

(Xác minh tại `/ielts/roadmap` → render `RoadmapContent`)

Lộ trình học cá nhân hóa dựa trên **onboarding** (`/ielts/basic/onboarding`): chọn band mục tiêu, mức cam kết hàng ngày, ngày thi dự kiến, tùy chọn làm bài kiểm tra chẩn đoán (DiagnosticQuiz 3 skill). Hệ thống sinh chuỗi lesson + exercise theo từng step, tự đánh dấu hoàn thành khi đạt $\geq$ 90%.

#### 3.2.6. Statistics

(Xác minh tại `/ielts/statistics` → `StatisticsContent` với 5 tab)

5 tab thống kê:
1. **Overview**: band ước tính từng kỹ năng, mục tiêu hàng ngày, heatmap, đếm ngược ngày thi.
2. **Foundation**: thống kê tiến độ Vocab/Grammar/Pronunciation.
3. **Basic**: thống kê tiến độ Basic theo lesson/exercise/skill.
4. **Advanced**: thống kê các phiên luyện Advanced.
5. **Intensive**: thống kê các phiên thi thử Intensive.

#### 3.2.7. Calculator

(Xác minh tại `/ielts/calculator` → `CalculatorContent` với 4 tab + Overall Band Calculator)

- **Overall Band Calculator**: nhập 4 band → quy đổi band tổng theo luật làm tròn IELTS.
- **Listening / Reading**: nhập số câu đúng → tra band theo bảng chuẩn (function `getIeltsListeningBand`, `getIeltsReadingBand`).
- **Writing / Speaking**: hiển thị descriptors chính thức (mô tả tiêu chí từng band).

#### 3.2.8. Student/Teacher

(Xác minh tại `/ielts/student-teacher` → `StudentTeacherContent`)

Hai tab "student" / "teacher":
- Tab **student**: nhập Teacher ID → liên kết bằng `POST /users/link-teacher`. Xem danh sách giáo viên đang theo dõi mình, hủy liên kết bằng `DELETE /users/unlink-teacher/:id`.
- Tab **teacher**: hiển thị User ID của mình để copy gửi cho học viên; xem danh sách học viên đã liên kết và tiến độ học của họ (band, lịch sử thi).

---

### 3.3. Phân hệ Shadowing & Dictation (VIẾT MỚI)

**Đoạn mở đầu:** Phân hệ độc lập, **không thuộc IELTS**, phục vụ luyện kỹ năng nghe-nói tiếng Anh tổng quát (giao tiếp, chủ đề đa dạng) trên nguồn video YouTube.

#### 3.3.1. Shadowing (thư viện chuẩn)

(Xác minh tại `/shadowing-dictation/shadowing` → `ShadowingLibraryPage`)

Người học chọn bài từ thư viện do Admin curated, lọc theo **category** và trạng thái (Not started / In progress / Completed). Trong bài luyện: phát video YouTube qua iframe, hiển thị transcript đồng bộ theo câu, người học nói đuổi theo từng câu và ghi âm. Hệ thống lưu tiến độ từng câu, cập nhật chuỗi học liên tiếp (streak).

#### 3.3.2. Dictation (thư viện chuẩn)

(Xác minh tại `/shadowing-dictation/dictation` → `DictationLibraryPage`)

Chọn bài Dictation từ thư viện chuẩn. Trong bài luyện: phát audio theo từng câu, người học điền từ bị đục lỗ vào transcript theo **4 cấp độ khó** (Beginner 70% hiển thị / Intermediate 50% / Advanced 30% / Expert ẩn toàn bộ). Có **gợi ý tiệm tiến** (HintButton): nhấn 1 lần hiện chữ cái đầu, 2 lần hiện thêm chữ cái cuối, 3 lần hiện toàn bộ từ. Kiểm tra đáp án câu theo câu (xanh = đúng, đỏ = sai), lưu tiến trình + cập nhật streak.

#### 3.3.3. My Shadowing / My Dictation (yêu cầu Premium)

(Xác minh tại `/shadowing-dictation/shadowing/my-videos` + `/dictation/my-videos`, đều bọc `FeatureLock requiredTier="PREMIUM"`)

Người học nhập **URL YouTube** → backend-ai (faster-whisper) tự động transcribe + phân tách câu, lưu video ở trạng thái `PROCESSING` → polling mỗi 5s đến khi chuyển `READY` → người học sử dụng giống thư viện chuẩn. Có thể xóa video đã upload.

---

### 3.4. Phân hệ Community (VIẾT MỚI)

(Xác minh tại `/community` + `CommunitySidebar.tsx`)

Phân hệ mạng xã hội mini cho cộng đồng người học, có sidebar 3 mục:

#### 3.4.1. Feed

Hiển thị 3 filter (All Posts / Study Tips / Achievements), tương ứng `PostType: STUDY_TIP, SCORE_ACHIEVEMENT, GENERAL`. Người dùng đăng nhập có thể bấm nút inline để mở `CreatePostModal`: nhập tiêu đề + nội dung + tag + tối đa 4 ảnh đính kèm. Tương tác: **Like, Bookmark, Comment, Reply**. Bài mới xuất hiện ngay đầu feed sau khi đăng; nhận **+5 XP** + huy hiệu bài đăng đầu tiên (nếu lần đầu).

#### 3.4.2. My Activity

Filter feed theo `authorId = current user`. Người học xem lại toàn bộ bài đăng cá nhân.

#### 3.4.3. Leaderboard

(Xác minh tại `community/components/Leaderboard.tsx`)

Hai bảng xếp hạng (top 10):
- **XP This Week** (`xp_weekly`)
- **Streak** (longest current streak)

Hiển thị thứ hạng, avatar, tên, giá trị; highlight dòng "(You)" với border-left primary.

---

### 3.5. Phân hệ Vocab Lab (VIẾT MỚI)

(Xác minh tại `/vocab-lab/page.tsx` với 5 tab + `/vocab-lab/study/[deckId]` cho phiên ôn)

**Đoạn mở đầu:** Phân hệ flashcard cá nhân hóa độc lập, **không gắn riêng với IELTS**, áp dụng **Active Recall** + **Spaced Repetition System (FSRS)**. Truy cập qua pill button "Vocab Lab" trên Navbar; có badge đỏ hiển thị số thẻ cần ôn hôm nay.

#### 3.5.1. Decks

Tạo / xóa / đổi tên / import (.lexon JSON) / export bộ thẻ. Mỗi deck hiển thị 3 counter: New / Learning / Due. Có thể publish deck lên Community Marketplace.

#### 3.5.2. Add

Tạo flashcard mới: chọn deck đích, chọn Card Type (có thể tạo Card Type mới gồm Fields + Templates), điền giá trị các field, gán tags. Hỗ trợ **AI Lexon prefill**: khi bôi đen từ trong nội dung bài học bất kỳ (Foundation Vocabulary, IELTS Basic Reading...), Lexon AI tự sinh nội dung theo cấu trúc Card Type đã chọn rồi đẩy về tab Add.

#### 3.5.3. Browse

(Xác minh tại `BrowseTab.tsx`)

Duyệt và chỉnh sửa flashcard với filter sidebar (theo deck, card state, tags). Hỗ trợ phím tắt ↑/↓ điều hướng, upload ảnh/audio cho từng field.

#### 3.5.4. Stats

(Xác minh tại các component `SummaryCards`, `DonutCharts`, `ReviewActivityChart`, `ForecastChart`, `HourlyActivityChart`)

Thống kê SRS: phân bố thẻ theo trạng thái (New/Learning/Review/Relearning), lịch sử review, dự báo lịch ôn sắp tới, hoạt động theo giờ trong ngày.

#### 3.5.5. Community Marketplace

(Xác minh tại `/vocab-lab/community`)

Hai tab: **Explore** (duyệt deck public theo category: English/IELTS/TOEFL/TOEIC/Academic/..., sort popular/newest, tìm kiếm) và **My Published** (deck mình đã chia sẻ).

#### 3.5.6. Study (Phiên ôn — mô tả gộp ở phần dẫn nhập của Vocab Lab)

(Xác minh tại `/vocab-lab/study/[deckId]/page.tsx`)

**Đây là chỗ duy nhất nên đặt phần FSRS** đã bị đặt nhầm ở Foundation Vocabulary trong bản cũ. Mỗi phiên hiển thị: thẻ mới (số lượng do người học chọn) + thẻ ôn (FSRS lên lịch). Sau mỗi thẻ, người học đánh giá 1 trong 4: **Again / Hard / Good / Easy** → FSRS tính lại Stability + Difficulty + interval theo công thức~(\ref{eq:fsrs-interval}). **Giữ nguyên công thức và 4 bullet** trong bản cũ, chỉ chuyển vị trí.

---

### 3.6. Phân hệ Pricing và Subscription (VIẾT MỚI)

(Xác minh tại `/pricing/page.tsx` + `SubscriptionContext`)

3 tier: **FREE / PREMIUM / PRO** (theo `TIER_LEVEL`). Hai chu kỳ billing: **monthly / yearly**.

- FREE: tự động cấp, giới hạn (5 pronunciation/ngày, max 3 deck, 5 shadowing/dictation, lưu 3 đề cũ).
- PREMIUM: mở khóa IELTS Advanced, My Shadowing/Dictation YouTube import; **7-day free trial** (chỉ 1 lần/user, kiểm tra `trialUsed`).
- PRO: tier cao nhất.

Thanh toán qua **VNPay** ở chế độ sandbox (HMAC-SHA512 + IPN webhook); người dùng quay lại `/payment/vnpay-return`. Cron daily 2:00 AM (`subscriptions.cron.ts`) gửi nhắc 7/3/1 ngày trước khi hết hạn, downgrade sau 3-day grace, kết thúc trial.

---

### 3.7. Xem thông báo (giữ — chỉnh nhẹ)

**Giữ** mô tả hiện tại. **Bổ sung:** sự kiện kích hoạt thông báo bao gồm (theo enum `NotificationType`): kết quả chấm Writing/Speaking trả về, hoàn thành Dictation, đạt streak, nâng cấp/gia hạn subscription, thông báo từ Admin.

---

### 3.8. Nghiệp vụ Admin (giữ nguyên)

Bản cũ đã chính xác cho 2 mục:
- **Quản lý nội dung Shadowing và Dictation**
- **Quản lý gói đăng ký thành viên**

Không cần thay đổi.

---

## 4. Các bước thực hiện chỉnh sửa

| Step | Hành động | Vùng file |
|---|---|---|
| 1 | Sao lưu version cũ vào commit hiện tại để dễ rollback | git |
| 2 | Xóa `\subsubsection{Hoạt động học tập}` (dòng 15) và toàn bộ 5 paragraph con (dòng 18–77) | 03-analysis.tex:15–77 |
| 3 | Mở rộng `\subsubsection{Quản lý tài khoản và Hồ sơ cá nhân}` để bổ sung 4 tab profile | 03-analysis.tex:12–13 |
| 4 | Thêm `\subsubsection{Phân hệ IELTS}` với 8 paragraph: Foundation, Basic, Advanced, Intensive, Roadmap, Statistics, Calculator, Student/Teacher | Sau §3.2 cũ |
| 5 | Thêm `\subsubsection{Phân hệ Shadowing và Dictation}` với 3 paragraph: Shadowing chuẩn, Dictation chuẩn, My videos (Premium) | Sau §3.2 mới |
| 6 | Thêm `\subsubsection{Phân hệ Community}` với 3 paragraph: Feed, My Activity, Leaderboard | Sau §3.3 mới |
| 7 | Thêm `\subsubsection{Phân hệ Vocab Lab}` với 6 paragraph: Decks, Add, Browse, Stats, Community, Study (chứa FSRS đã chuyển từ Foundation) | Sau §3.4 mới |
| 8 | Thêm `\subsubsection{Phân hệ Pricing và Subscription}` (1 đoạn văn) | Sau §3.5 mới |
| 9 | Giữ `\subsubsection{Xem thông báo}` (dòng 73–77 cũ), chuyển xuống sau Pricing | 03-analysis.tex:73–77 |
| 10 | Giữ nguyên `\subsection{Nghiệp vụ dành cho Người quản lý}` (dòng 79–86) | 03-analysis.tex:79–86 |
| 11 | Build LaTeX kiểm tra không hỏng cross-reference của `\ref{eq:fsrs-interval}` (vẫn ở chương 3 nhưng nay nằm ở Vocab Lab) | latexmk / pdflatex |
| 12 | Đối chiếu lại với bảng `\section{Danh sách các tình huống hoạt động chính}` (UC01–UC43, dòng 116+) để đảm bảo các UC vẫn nhất quán với mô tả nghiệp vụ mới | 03-analysis.tex:116–180 |

---

## 5. Nguyên tắc viết

1. **Mọi mô tả phải đối chiếu được với một entry trong sidebar / route thực tế** (đã liệt kê đầy đủ trong §3 ở trên).
2. **Không dùng "hệ thống quy đổi sang band IELTS" cho Shadowing/Dictation/Vocab Lab/Community** — những phân hệ này không liên quan IELTS scoring.
3. **Không gộp Listening/Reading/Writing/Speaking thành "kỹ năng" độc lập** ở cấp ngoài IELTS, vì web tổ chức 4 kỹ năng này **bên trong từng cấp độ IELTS** (Basic, Advanced, Intensive).
4. **Giữ nguyên công thức FSRS** `\ref{eq:fsrs-interval}` và 4 bullet Again/Hard/Good/Easy, nhưng **đặt ở Vocab Lab → Study session**, không phải Foundation Vocabulary.
5. **Văn phong giữ thống nhất** với phần Admin hiện tại: đoạn văn liền mạch, không dùng bullet/itemize trừ khi liệt kê (ví dụ 4 cấp độ Dictation, 4 nút SRS rating).
6. **Mỗi paragraph mở đầu bằng tên phân hệ in đậm hoặc \paragraph{}** để dễ tham chiếu.
7. **Khi đề cập Premium**: gọi rõ "yêu cầu gói Premium hoặc Pro" để khớp với `FeatureLock requiredTier` đã verify trong code.

---

## 6. Mapping nhanh: UC hiện có → phân hệ mới

Để khi viết lại không bỏ sót UC:

| Phân hệ mới | UC liên quan (từ bảng UC01–UC43) |
|---|---|
| Tài khoản / Hồ sơ | UC01, UC02 |
| IELTS Foundation | UC03 (Vocab), UC04 (Grammar), UC05 (Pronunciation) |
| IELTS Basic | UC06 (Listening), UC07 (Reading), UC08 (Writing), UC09 (Speaking) |
| IELTS Advanced | UC10–UC13 |
| IELTS Intensive | UC14–UC17 (Mock test), UC18 (Test history) |
| IELTS Roadmap | UC19 |
| IELTS Statistics | UC20, UC21 |
| IELTS Calculator | UC22 |
| IELTS Student/Teacher | UC42 |
| Shadowing & Dictation | UC23 (Shadowing), UC24 (Dictation), UC25 (My shadowing), UC26 (My dictation) |
| Vocab Lab | UC27 (Card type), UC28 (Lexon AI), UC29 (Manage decks), UC30 (Import community), UC31 (Publish), UC32 (Stats) |
| Community | UC34 (xem/tương tác), UC35 (Đăng bài), UC36 (Leaderboard) |
| Pricing | UC37 |
| Thông báo | UC33 |
| Chat AI (mobile) | UC43 — *không có trên web, KHÔNG đưa vào* |
| Admin | UC38, UC39, UC40, UC41 |

---

## 7. Ghi chú cuối

- **Không thêm** mục "Chat AI" vào nghiệp vụ web vì web hiện chưa có route `/chat` (verify: không tồn tại `frontend-web/src/app/chat*`). UC43 chỉ áp dụng cho mobile.
- **Không thêm** mục "Notes" làm phân hệ độc lập — notes thực tế chỉ là tính năng phụ trợ trong từng bài luyện (`QuestionNote` model), không có entry trong sidebar nào.
- File `flow-chart-web.md` ghi "ielts basic ... mỗi skill có 2 phần bao gồm: lessons và exercises" → đã xác minh đúng tại `[skill]/lessons/page.tsx` + `[skill]/exercises/page.tsx`.
- File `flow-chart-web.md` ghi "ielts advanced ... mỗi skill sẽ có thể luyện theo từng part" → đã xác minh đúng tại `advanced/{listening|reading|writing|speaking}/[partId]/page.tsx`.
