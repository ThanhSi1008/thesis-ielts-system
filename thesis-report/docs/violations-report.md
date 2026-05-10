# Báo cáo Vi phạm Quy tắc Viết Báo cáo

> Tài liệu này được tạo tự động bằng cách đối chiếu toàn bộ các file `.tex` với quy tắc trong `writing-rules.md`.
> **Ngày kiểm tra:** 09/05/2026 | **Phiên bản báo cáo:** 1.0

---

## Tóm tắt

| Mức độ | Số lượng |
|---|---|
| 🔴 CRITICAL | 6 |
| 🟡 MAJOR | 5 |
| 🟠 MINOR | 9 |
| **Tổng cộng** | **20** |

---

## 🔴 VI PHẠM CRITICAL

### C1 — Font size documentclass sai (13pt → 12pt)

- **File:** [main.tex](../main.tex#L3)
- **Dòng:** 3
- **Quy tắc vi phạm:** Mục 1 — Cỡ chữ nội dung phải là 13pt
- **Code vi phạm:**
  ```latex
  \documentclass[a4paper,12pt]{extreport}
  ```
- **Sửa thành:**
  ```latex
  \documentclass[a4paper,13pt]{extreport}
  ```

---

### C2 — Line spacing sai (1.3 → ~1.5)

- **File:** [main.tex](../main.tex#L40)
- **Dòng:** 40
- **Quy tắc vi phạm:** Mục 1 — Dãn dòng phải là 1.3 (Multiple = 1.3), không phải `\onehalfspacing` (≈ 1.5)
- **Code vi phạm:**
  ```latex
  \usepackage{setspace}
  \onehalfspacing
  ```
- **Sửa thành:**
  ```latex
  \usepackage{setspace}
  \setstretch{1.3}
  ```

---

### C3 — Lề trang sai (top, bottom, right)

- **File:** [main.tex](../main.tex#L33-L37)
- **Dòng:** 33–37
- **Quy tắc vi phạm:** Mục 1 — Lề phải: top=2.5cm, bottom=2.5cm, left=3.5cm, right=2.5cm

| Lề | Yêu cầu | Thực tế | Trạng thái |
|---|---|---|---|
| Trên (top) | 2.5 cm | 3 cm | ❌ Sai |
| Dưới (bottom) | 2.5 cm | 3 cm | ❌ Sai |
| Trái (left) | 3.5 cm | 3.5 cm | ✅ Đúng |
| Phải (right) | 2.5 cm | 2 cm | ❌ Sai |

- **Code vi phạm:**
  ```latex
  \usepackage[
    paper=a4paper,
    top=3cm, bottom=3cm, left=3.5cm, right=2cm,
    headheight=15pt
  ]{geometry}
  ```
- **Sửa thành:**
  ```latex
  \usepackage[
    paper=a4paper,
    top=2.5cm, bottom=2.5cm, left=3.5cm, right=2.5cm,
    headheight=15pt
  ]{geometry}
  ```

---

### C4 — Tiêu đề Chương sai cỡ chữ (18pt → 16pt)

- **File:** [main.tex](../main.tex#L136-L140)
- **Dòng:** 136–140
- **Quy tắc vi phạm:** Mục 2.2 — Tên chương phải 18pt, in hoa, đậm, căn giữa
- **Code vi phạm:**
  ```latex
  \titleformat{\chapter}[display]
    {\normalfont\bfseries\centering\fontsize{16pt}{19pt}\selectfont}
    {\chaptertitlename\ \thechapter}
    {6pt}
    {\MakeUppercase}
  ```
- **Sửa thành:**
  ```latex
  \titleformat{\chapter}[display]
    {\normalfont\bfseries\centering\fontsize{18pt}{21.6pt}\selectfont}
    {\chaptertitlename\ \thechapter}
    {6pt}
    {\MakeUppercase}
  ```

---

### C5 — Thiếu `\titlespacing` cho tất cả các cấp tiêu đề

- **File:** [main.tex](../main.tex)
- **Quy tắc vi phạm:** Mục 2.3 — Space Before = 6pt, Space After = 0pt cho tất cả tiêu đề
- **Vấn đề:** Không có bất kỳ lệnh `\titlespacing` nào trong toàn bộ `main.tex`. LaTeX sẽ dùng khoảng cách mặc định.
- **Cần thêm vào `main.tex` (sau `\titleformat`):**
  ```latex
  \titlespacing*{\chapter}{0pt}{6pt}{0pt}
  \titlespacing*{\section}{0pt}{6pt}{0pt}
  \titlespacing*{\subsection}{0pt}{6pt}{0pt}
  \titlespacing*{\subsubsection}{0pt}{6pt}{0pt}
  ```

---

### C6 — Thiếu `\numberwithin` cho Figure và Table

- **File:** [main.tex](../main.tex)
- **Quy tắc vi phạm:** Mục 3.1 — Đánh số gắn với chương (Hình 1.1, Bảng 2.3)
- **Vấn đề:** Không có `\numberwithin{figure}{chapter}` hoặc `\numberwithin{table}{chapter}`. LaTeX sẽ đánh số liên tục toàn báo cáo (Hình 1, Hình 2, ...) thay vì theo chương (Hình 1.1, Hình 1.2, ...).
- **Cần thêm vào `main.tex` (trong phần preamble, sau `\usepackage{amsmath}`):**
  ```latex
  \numberwithin{figure}{chapter}
  \numberwithin{table}{chapter}
  \numberwithin{equation}{chapter}
  ```

---

## 🟡 VI PHẠM MAJOR

### M1 — Tiểu mục đơn độc: Chương 2 — "Cơ sở dữ liệu"

- **File:** [chapters/02-theory.tex](../chapters/02-theory.tex#L157-L165)
- **Dòng:** 157–165
- **Quy tắc vi phạm:** Mục 2.1 — Bắt buộc có ít nhất 2 tiểu mục cùng cấp
- **Vấn đề:** `\section{Cơ sở dữ liệu}` chỉ có đúng 1 subsection là `\subsection{PostgreSQL 16}`.

  ```
  2.4 Cơ sở dữ liệu
  └── 2.4.1 PostgreSQL 16   ← đơn độc, không có 2.4.2
  ```

- **Cách sửa:** Thêm một subsection thứ hai (ví dụ: `\subsection{Prisma ORM và quản lý schema}`) hoặc gộp nội dung PostgreSQL vào section cha mà không dùng subsection.

---

### M2 — Tiểu mục đơn độc: Chương 4 — "Sơ đồ cơ sở dữ liệu"

- **File:** [chapters/04-design.tex](../chapters/04-design.tex#L27-L40)
- **Dòng:** 27–40
- **Quy tắc vi phạm:** Mục 2.1 — Bắt buộc có ít nhất 2 tiểu mục cùng cấp
- **Vấn đề:** `\section{Sơ đồ cơ sở dữ liệu}` chỉ có đúng 1 subsection là `\subsection{Sơ đồ cơ sở dữ liệu có cấu trúc (SQL)}`.

  ```
  4.2 Sơ đồ cơ sở dữ liệu
  └── 4.2.1 Sơ đồ CSDL có cấu trúc (SQL)   ← đơn độc
  ```

- **Cách sửa:** Thêm `\subsection{Mô tả các nhóm bảng chính}` hoặc bỏ subsection và đưa nội dung trực tiếp vào section.

---

### M3 — Cụm từ bị cấm: "bảng dưới đây"

- **File:** [chapters/04-design.tex](../chapters/04-design.tex#L270)
- **Dòng:** 270
- **Quy tắc vi phạm:** Mục 3.4 — Bắt buộc đề cập bằng số hiệu cụ thể, không dùng "bảng dưới đây"
- **Code vi phạm:**
  ```
  ...Kết quả kiểm thử được ghi nhận trong bảng dưới đây. Tất cả...
  ```
- **Sửa thành:**
  ```
  ...Kết quả kiểm thử được ghi nhận trong bảng \ref{tab:testcase_result}. Tất cả...
  ```
  *(hoặc ghi rõ số bảng như "Bảng 4.2" nếu đã biết số thứ tự)*

---

### M4 — FSRS không có trong Danh mục Từ viết tắt

- **File:** [front/frontmatter.tex](../front/frontmatter.tex#L104-L169)
- **Quy tắc vi phạm:** Mục 4.2 — Mọi từ viết tắt dùng ≥ 3 lần phải có trong danh mục từ viết tắt
- **Vấn đề:** FSRS (Free Spaced Repetition Scheduler) xuất hiện ít nhất **5 lần** trong báo cáo (ch02 dòng 163, ch03 dòng 29, 30, 31, 134) nhưng **không có** trong bảng Danh mục Từ viết tắt.
- **Cách sửa:** Thêm dòng vào bảng từ viết tắt (theo thứ tự bảng chữ cái, giữa "ERD" và "GCP"):
  ```latex
  FSRS & Free Spaced Repetition Scheduler (Thuật toán lặp lại ngắt quãng thế hệ mới) \\
  \hline
  ```

---

### M5 — FSRS dùng lần đầu không có định nghĩa đầy đủ trong văn bản

- **File:** [chapters/02-theory.tex](../chapters/02-theory.tex#L163)
- **Dòng:** 163
- **Quy tắc vi phạm:** Mục 4.1 — Lần đầu tiên phải viết đầy đủ + (viết tắt)
- **Vấn đề:** FSRS xuất hiện lần đầu trong chapter 02 (trước chapter 03) chỉ là viết tắt "FSRS" không kèm nghĩa đầy đủ:
  ```
  ...Vocab Lab (FSRS), Community, Gamification...
  ```
- **Sửa thành:**
  ```
  ...Vocab Lab (FSRS — Free Spaced Repetition Scheduler), Community, Gamification...
  ```
  *(Các lần tiếp theo trong ch03 chỉ cần dùng "FSRS" là đủ)*

---

## 🟠 VI PHẠM MINOR

### N1–N9 — Caption bảng đặt SAU bảng thay vì TRƯỚC (9 bảng trong Chương 3)

- **File:** [chapters/03-analysis.tex](../chapters/03-analysis.tex)
- **Quy tắc vi phạm:** Mục 3.2 — Caption bảng biểu phải ở **phía trên** bảng

Tất cả 9 bảng `\begin{table}...\end{table}` trong chương 3 đều đặt `\caption{}` **sau** `\end{tabularx}`, nghĩa là caption nằm **dưới** bảng — vi phạm quy tắc.

| # | Dòng | Bảng |
|---|---|---|
| N1 | 100–111 | Danh sách tác nhân và mô tả |
| N2 | 159–189 | Đặc tả UC01 — Đăng ký tài khoản |
| N3 | 209–237 | Đặc tả UC02 — Đăng nhập |
| N4 | 257–304 | Đặc tả UC04 — Học từ vựng |
| N5 | 315–355 | Đặc tả UC05 — Ôn từ vựng |
| N6 | 367–403 | Đặc tả UC08 — Luyện Listening |
| N7 | 423–461 | Đặc tả UC11 — Luyện Writing Task 2 |
| N8 | 481–521 | Đặc tả UC13 — Luyện Speaking AI |
| N9 | 541–581 | Đặc tả UC14 — Thi thử IELTS Mock Test |

**Pattern vi phạm (áp dụng cho tất cả 9 bảng):**
```latex
% ❌ HIỆN TẠI (SAI)
\begin{table}[!ht]
    \centering
    \begin{tabularx}{\linewidth}{...}
        % ... nội dung ...
    \end{tabularx}
    \caption{Tên bảng}   % Caption nằm sau tabularx → phía dưới
    \label{tab:...}
\end{table}
```

```latex
% ✅ SỬA THÀNH (ĐÚNG)
\begin{table}[!ht]
    \caption{Tên bảng}   % Caption phải đặt TRƯỚC tabularx → phía trên
    \label{tab:...}
    \centering
    \begin{tabularx}{\linewidth}{...}
        % ... nội dung ...
    \end{tabularx}
\end{table}
```

> **Lưu ý:** Các bảng `\begin{longtable}` trong chương 3 và 4 đã đặt `\caption` đúng vị trí (ngay sau `\begin{longtable}`) — không vi phạm.

---

## Các vi phạm KHÔNG áp dụng (đã kiểm tra, kết quả OK)

| Hạng mục | Kết quả kiểm tra |
|---|---|
| Có Danh mục Từ viết tắt ở đầu báo cáo | ✅ Có, trong `frontmatter.tex` |
| Caption hình ảnh nằm dưới hình | ✅ Tất cả `\caption` sau `\includegraphics` |
| Sử dụng chuẩn trích dẫn IEEE (`biblatex` style=ieee) | ✅ Đã cấu hình đúng |
| Tiêu đề chương in hoa (`\MakeUppercase`) | ✅ Có trong `\titleformat{\chapter}` |
| Tiêu đề chương căn giữa | ✅ `\centering` trong `\titleformat` |
| Phụ lục đánh theo ký tự (Phụ lục A, B, C, D) | ✅ Đúng theo `main.tex` |
| Có Danh mục Hình ảnh | ✅ `\listoffigures` trong `frontmatter.tex` |
| Có Danh mục Bảng biểu | ✅ `\listoftables` trong `frontmatter.tex` |
| IELTS định nghĩa lần đầu | ✅ Định nghĩa trong bảng từ viết tắt và dùng đúng |
| JWT định nghĩa lần đầu | ✅ "JSON Web Token (JWT)" — ch01 dòng 112 |

---

## Thứ tự ưu tiên sửa

| Thứ tự | Vi phạm | Lý do ưu tiên |
|---|---|---|
| 1 | **C1–C4** (font, spacing, margins, chapter size) | Ảnh hưởng toàn bộ định dạng báo cáo |
| 2 | **C5** (thiếu titlespacing) | Ảnh hưởng khoảng cách tất cả tiêu đề |
| 3 | **C6** (thiếu numberwithin) | Ảnh hưởng toàn bộ đánh số hình/bảng |
| 4 | **M3** (bảng dưới đây) | Vi phạm quy tắc tham chiếu |
| 5 | **M4–M5** (FSRS chưa định nghĩa) | Dễ sửa, ít rủi ro |
| 6 | **M1–M2** (tiểu mục đơn độc) | Cần thêm nội dung mới |
| 7 | **N1–N9** (caption bảng ch03) | Nhiều chỗ nhưng đơn giản, sửa theo cùng pattern |
