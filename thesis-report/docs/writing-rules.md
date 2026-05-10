# Quy tắc soạn thảo Khóa luận tốt nghiệp (IUH)

> **Dành cho AI Agents:** Đây là tài liệu bắt buộc đọc trước khi viết hoặc chỉnh sửa bất kỳ nội dung nào trong báo cáo. Mọi output phải tuân thủ **toàn bộ** các quy tắc dưới đây mà không có ngoại lệ.

---

## 1. Soạn thảo văn bản

| Thuộc tính | Giá trị |
|---|---|
| Font chữ | Times New Roman |
| Cỡ chữ nội dung | 13pt |
| Bảng mã | Unicode (UTF-8) |
| Căn lề | Justify (căn 2 bên) |
| Dãn dòng | 1.3 (Line spacing: Multiple = 1.3) |
| Lề trên | 2.5 cm |
| Lề dưới | 2.5 cm |
| Lề trái | 3.5 cm |
| Lề phải | 2.5 cm |

**Ánh xạ sang LaTeX** (trong `main.tex`):
```latex
\usepackage[
  paper=a4paper,
  top=2.5cm, bottom=2.5cm, left=3.5cm, right=2.5cm
]{geometry}
\setmainfont{Times New Roman}
\fontsize{13pt}{1.3}  % hoặc dùng \onehalfspacing gần nhất
```

---

## 2. Chương và Tiểu mục

### 2.1 Quy tắc đánh số

- Tối đa **4 cấp số**: `Chương.Mục.Nhóm tiểu mục.Tiểu mục`
  - Ví dụ: `4.1.2.1` = tiểu mục 1, nhóm tiểu mục 2, mục 1, chương 4
- **Bắt buộc có ít nhất 2 tiểu mục cùng cấp**: nếu có `2.1.1` thì phải có `2.1.2`. Không được để tiểu mục đơn độc.

> ❌ **SAI:** Có `2.1.1` mà không có `2.1.2`
> ✅ **ĐÚNG:** `2.1.1` và `2.1.2` cùng tồn tại

### 2.2 Định dạng tiêu đề

| Cấp | Ví dụ | Cỡ chữ | Kiểu | Vị trí |
|---|---|---|---|---|
| Tên chương | CHƯƠNG 1: GIỚI THIỆU | 18pt | IN HOA, **đậm** | Giữa trang (center) |
| Mục (cấp 2) | **1.1 Đặt vấn đề** | 13pt | Thường, **đậm** | Không lùi đầu dòng |
| Nhóm tiểu mục (cấp 3) | **1.1.1 Bối cảnh** | 13pt | Thường, **đậm** | Không lùi đầu dòng |
| Tiểu mục (cấp 4) | **1.1.1.1 Chi tiết** | 13pt | Thường, **đậm** | Không lùi đầu dòng |

### 2.3 Khoảng cách đoạn văn

- **Cách đoạn trên (Space Before):** 6pt
- **Cách đoạn dưới (Space After):** 0pt
- Áp dụng nhất quán cho toàn bộ tất cả các cấp tiêu đề.

**Ánh xạ sang LaTeX:**
```latex
\titlespacing*{\chapter}{0pt}{6pt}{0pt}
\titlespacing*{\section}{0pt}{6pt}{0pt}
\titlespacing*{\subsection}{0pt}{6pt}{0pt}
\titlespacing*{\subsubsection}{0pt}{6pt}{0pt}
```

---

## 3. Bảng biểu, Hình vẽ, Phương trình

### 3.1 Đánh số gắn với chương

- Định dạng: `[Loại] [Số chương].[Số thứ tự trong chương]`
- Ví dụ: **Hình 3.4** = hình thứ 4 trong chương 3; **Bảng 2.1** = bảng thứ 1 trong chương 2

**Ánh xạ sang LaTeX:**
```latex
\numberwithin{figure}{chapter}   % Hình 1.1, 1.2, ...
\numberwithin{table}{chapter}    % Bảng 1.1, 1.2, ...
\numberwithin{equation}{chapter} % (1.1), (1.2), ...
```

### 3.2 Vị trí tên (caption)

| Loại | Vị trí caption |
|---|---|
| **Bảng biểu** | **Phía trên** bảng |
| **Hình vẽ / Đồ thị** | **Phía dưới** hình |

### 3.3 Trích dẫn nguồn

- Mọi bảng/hình lấy từ nguồn ngoài phải ghi rõ nguồn theo chuẩn IEEE ngay trong caption.
  - Ví dụ: `Hình 2.1. Kiến trúc Transformer [3]`
  - Hoặc: `Bảng 3.2. Kết quả thực nghiệm (Nguồn: [5])`
- Tài liệu được trích dẫn **phải** có mặt trong danh mục tài liệu tham khảo.

### 3.4 Quy tắc đề cập trong văn bản

- **Bắt buộc** đề cập bằng số hiệu cụ thể khi nhắc đến bảng/hình.

> ✅ **ĐÚNG:** "...được trình bày trong bảng 4.1" | "...(xem hình 3.2)"
> ❌ **SAI:** "...trong bảng dưới đây" | "...trong đồ thị X và Y sau"

- Mọi bảng và hình **đều phải được đề cập** ít nhất một lần trong văn bản — không có bảng/hình "trôi nổi" không được nhắc đến.

### 3.5 Công thức toán học

- Đánh số tất cả các công thức, đặt số trong ngoặc đơn **bên phải lề** (flush right).
  - Ví dụ: `(3.2)`
- Khi ký hiệu xuất hiện **lần đầu tiên**: giải thích ký hiệu và đơn vị đo ngay trong đoạn văn liền sau công thức.
- Chọn một trong hai kiểu trình bày (dòng đơn hoặc dòng kép) và **duy trì nhất quán** trong toàn bộ báo cáo.

**Ví dụ LaTeX:**
```latex
\begin{equation}
  \text{Overall} = \left\lfloor \frac{L + R + W + S}{4} \times 2 \right\rfloor \div 2
  \label{eq:overall-band}
\end{equation}
```
> Trong đó: $L, R, W, S$ lần lượt là band điểm Listening, Reading, Writing và Speaking (thang điểm 0.0–9.0).

---

## 4. Viết tắt

### 4.1 Nguyên tắc

- **Không lạm dụng** viết tắt — chỉ viết tắt từ/cụm từ xuất hiện **nhiều lần** trong báo cáo.
- **Không viết tắt:** cụm từ dài, mệnh đề, các cụm từ xuất hiện ít hơn 3 lần.
- Lần viết **đầu tiên**: viết đầy đủ, kèm viết tắt trong ngoặc đơn.
  - Ví dụ: "Trí tuệ nhân tạo (TTNT)" hoặc "Natural Language Processing (NLP)"
- Từ lần thứ hai trở đi: chỉ dùng viết tắt.

### 4.2 Danh mục từ viết tắt

- Phải có **Danh mục từ viết tắt** (Glossary) ở **phần đầu** báo cáo, trước phần nội dung chính.
- Danh mục gồm 2 cột: **Từ viết tắt** | **Nghĩa đầy đủ (+ giải thích nếu cần)**.
- Sắp xếp theo **thứ tự bảng chữ cái**.

---

## 5. Tài liệu tham khảo và Trích dẫn

### 5.1 Chuẩn trích dẫn

Toàn bộ báo cáo sử dụng **chuẩn IEEE**. Số thứ tự tài liệu đặt trong ngoặc vuông `[n]`.

### 5.2 Khi nào phải trích dẫn

| Trường hợp | Hành động |
|---|---|
| Ý kiến, khái niệm, định nghĩa không phải của tác giả | **Bắt buộc trích dẫn** |
| Số liệu, thống kê, bảng biểu từ nguồn ngoài | **Bắt buộc trích dẫn** |
| Kiến thức phổ biến, công thức cơ bản mọi người đều biết | Không cần trích dẫn |

### 5.3 Quy tắc trích dẫn gián tiếp

- Nếu không tiếp cận được tài liệu gốc mà phải trích qua tài liệu khác: ghi rõ "dẫn theo [n]".
- Tài liệu gốc **không được liệt kê** trong danh mục tài liệu tham khảo.

### 5.4 Trích dẫn trực tiếp (nguyên văn)

- **Dưới 2 câu / 4 dòng:** Dùng dấu ngoặc kép `" "` trong đoạn văn.
- **Từ 2 câu / 4 dòng trở lên:** Tách thành đoạn riêng, **lùi lề trái thêm 2 cm** so với văn bản thường.

### 5.5 Định dạng danh mục tài liệu tham khảo (IEEE)

Danh mục sắp xếp theo **thứ tự xuất hiện** trong báo cáo (không theo alphabet).

**Báo cáo kỹ thuật / Tài liệu trực tuyến:**
```
[1] J. Doe, "A Comprehensive Study on Machine Learning Algorithms for Big Data,"
    Tech. Rep., Dept. Computer Science, MIT, Cambridge, MA, USA, Dec. 2022.
    [Trực tuyến]. Có sẵn: http://www.mit.edu/reports/ml_big_data.pdf.
    [Truy cập ngày: 07-Aug-2024].
```

**Bài báo tạp chí:**
```
[2] A. B. Smith, "Blockchain Technology: Applications and Challenges,"
    IEEE Transactions on Systems, Man, and Cybernetics: Systems,
    vol. 50, no. 4, pp. 1215-1228, April 2020.
```

**Bài báo hội nghị:**
```
[3] C. Johnson và D. Lee, "IoT Security: An In-Depth Analysis,"
    in Proc. 2019 IEEE International Conference on Internet of Things,
    Lyon, France, June 2019, pp. 678-685.
```

**Luận án tiến sĩ / Luận văn:**
```
[4] E. F. Miller, "Development of an Autonomous Vehicle Navigation System,"
    Ph.D. dissertation, Dept. Elect. Eng., Stanford Univ., Stanford, CA, USA, 2021.
```

**Tài liệu kỹ thuật nội bộ:**
```
[5] G. K. Patel, "The Evolution of Cloud Computing Services,"
    Tech. Rep., IBM Research, San Jose, CA, USA, Jan. 2018.
    [Trực tuyến]. Có sẵn: http://www.ibm.com/reports/cloud_evolution.pdf.
    [Truy cập ngày: 07-Aug-2024].
```

**Ánh xạ sang LaTeX (biblatex IEEE):**
```latex
\usepackage[backend=biber, style=ieee]{biblatex}
```

---

## 6. Phụ lục

### 6.1 Nội dung phụ lục

Phụ lục chứa các tài liệu bổ trợ, minh họa, **không nằm trong mạch trình bày chính**:

- Mã nguồn (code snippets quan trọng)
- Sơ đồ thuật toán chi tiết
- Thiết kế màn hình (wireframe, mockup)
- Số liệu thô, bảng dữ liệu mở rộng
- Mẫu biểu, hướng dẫn sử dụng
- Kết quả kiểm tra đạo văn (Turnitin/iThenticate)

### 6.2 Giới hạn độ dài

> **Phụ lục KHÔNG được dài hơn phần nội dung chính của báo cáo.**

### 6.3 Đánh số phụ lục

- Phụ lục được đánh theo ký tự: **Phụ lục A**, **Phụ lục B**, ...
- Bảng/hình trong phụ lục đánh số theo phụ lục: **Hình A.1**, **Bảng B.2**, ...

---

## 7. Checklist trước khi hoàn thiện

Trước khi xuất file báo cáo cuối, AI Agent cần xác nhận toàn bộ các mục sau:

### Cấu trúc và định dạng
- [ ] Font Times New Roman 13pt, dãn dòng 1.3, lề đúng theo quy định
- [ ] Tên chương 18pt, in hoa, đậm, căn giữa
- [ ] Tất cả tiêu đề mục/tiểu mục 13pt, đậm, không lùi đầu dòng
- [ ] Space Before = 6pt, Space After = 0pt cho tất cả tiêu đề
- [ ] Không có tiểu mục đơn độc (luôn có ít nhất 2 tiểu mục cùng cấp)

### Bảng và Hình
- [ ] Caption bảng nằm **trên** bảng, caption hình nằm **dưới** hình
- [ ] Đánh số dạng `[Chương].[Thứ tự]` (Hình 2.3, Bảng 4.1)
- [ ] Mọi bảng/hình đều được đề cập trong văn bản bằng số hiệu cụ thể
- [ ] Không có cụm từ "bảng dưới đây" hay "hình sau"
- [ ] Có ghi nguồn với bảng/hình lấy từ ngoài

### Công thức
- [ ] Tất cả công thức được đánh số, số đặt trong `()` bên phải
- [ ] Ký hiệu mới được giải thích ngay lần đầu xuất hiện kèm đơn vị
- [ ] Kiểu trình bày (dòng đơn/kép) nhất quán

### Viết tắt
- [ ] Có Danh mục từ viết tắt ở phần đầu báo cáo
- [ ] Lần đầu xuất hiện: viết đầy đủ + (viết tắt)
- [ ] Không viết tắt cụm từ xuất hiện ít hơn 3 lần

### Tài liệu tham khảo
- [ ] Toàn bộ trích dẫn theo chuẩn IEEE
- [ ] Mọi nguồn được trích dẫn trong văn bản đều có trong danh mục
- [ ] Không trích dẫn kiến thức phổ biến
- [ ] Trích dẫn dài (≥4 dòng) tách đoạn riêng, lùi lề trái 2 cm

### Phụ lục
- [ ] Phụ lục không dài hơn phần nội dung chính
- [ ] Bảng/hình trong phụ lục đánh số theo ký tự phụ lục (A.1, B.2, ...)
