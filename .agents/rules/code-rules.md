---
trigger: always_on
---

## 1. Single Responsibility Principle (SRP)

> **Một module (component, hook, function) chỉ nên có MỘT lý do để thay đổi.**

Trong React Native, SRP nghĩa là:
- **Component** chỉ chịu trách nhiệm **render UI**
- **Custom Hook** chịu trách nhiệm **data fetching / state logic**
- **Utility function** chịu trách nhiệm **business logic thuần** (tính toán, format, validate)

Giới hạn tham chiếu:
- Component: tối đa **~120 dòng** (bao gồm JSX)
- Function: tối đa **~30 dòng**
- Nếu vượt quá → tách thành đơn vị nhỏ hơn

## 2. Open/Closed Principle (OCP)

> **Một module nên OPEN cho việc mở rộng, nhưng CLOSED cho việc sửa đổi.**

Trong React Native, OCP nghĩa là: thiết kế component sao cho khi cần thêm variant/behavior mới, ta **thêm code mới** chứ không **sửa code cũ**. Đạt được thông qua: `children`, composition, render props, hoặc config-driven.

## 3. Liskov Substitution Principle (LSP)

> **Component con phải có thể thay thế component cha mà không làm hỏng hành vi.**

Trong React Native, LSP nghĩa là: khi wrap một component gốc (Pressable, TextInput...) thành component custom, nó phải **giữ nguyên toàn bộ props và behavior** của component gốc. Người dùng component custom phải có thể dùng mọi prop mà component gốc hỗ trợ.

## 4. Interface Segregation Principle (ISP)

> **Không ép component phụ thuộc vào dữ liệu mà nó không cần.**

Trong React Native, ISP nghĩa là: KHÔNG truyền nguyên một object lớn (Exam, Result, Flashcard) vào component con khi nó chỉ cần 2-3 fields. Truyền object lớn gây: (1) re-render thừa, (2) coupling chặt với data model, (3) khó test.

## 5. Dependency Inversion Principle (DIP)

> **Modules cấp cao (UI) không nên phụ thuộc trực tiếp vào modules cấp thấp (API, Storage). Cả hai nên phụ thuộc vào abstraction.**

### 5.1. API Layer — Abstract hóa qua API Client

### BAD — Component gọi `fetch` trực tiếp

### GOOD — UI → Hook → TanStack Query → API Client

**Lợi ích:** Khi đổi base URL, thêm header, đổi thư viện HTTP (fetch → axios) → chỉ sửa `ApiClient`, không sửa bất kỳ screen hay hook nào.

### 5.2. Storage Layer — Abstract hóa qua Interface

### BAD — Gọi AsyncStorage trực tiếp ở mọi nơi

### GOOD — Abstract qua interface

## 6. Clean Code

### 6.1. Early Return (Bouncer Pattern)

**Quy tắc: Xử lý các trường hợp lỗi/edge cases ĐẦU TIÊN và return sớm. Tránh nested if.**

### 6.2. Không Hardcode — Dùng Constants

### 6.3. Tóm tắt nhanh

| Quy tắc | Kiểm tra |
|:---|:---|
| **SRP** | Component có đang vừa fetch data vừa render UI không? → Tách hook |
| **OCP** | Thêm variant mới có phải sửa code cũ không? → Dùng config map |
| **LSP** | Wrapper component có forward đủ props gốc không? → Dùng `...rest` |
| **ISP** | Component có nhận object lớn hơn nhu cầu không? → Chỉ truyền fields cần |
| **DIP** | Screen có import trực tiếp fetch/AsyncStorage không? → Abstract qua interface |
| **Early Return** | Có nested if > 2 tầng không? → Dùng bouncer pattern |
| **No Magic** | Có số/string không có tên không? → Đưa vào constants |

---

*Vi phạm các nguyên tắc trên sẽ bị từ chối trong Code Review. Mọi ngoại lệ phải ghi chú `// RULE_EXCEPTION: <lý do>` và được Tech Lead approve.*
