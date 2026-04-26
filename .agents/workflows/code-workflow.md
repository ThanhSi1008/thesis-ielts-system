---
description: # Code Review Workflow — IELTS Master AI Mobile App  > Quy trình review code chuẩn cho team Mobile | Dựa trên `RULES.md` (SOLID) + `SKILL.md` (Coding Guidelines)
---

## 1. Quy Trình Làm Việc (Git & GitHub MCP Server)

Khi bắt đầu hiện thực một Ticket (Task) mới từ `PHASE_3_TASK_TRACKER.md`, lập trình viên và hệ thống AI (thông qua GitHub MCP) phải tuân thủ nghiêm ngặt quy trình sau:

### Bước 1: Khởi tạo Nhánh (Create Branch)
- Không bao giờ code trực tiếp trên nhánh `main`.
- Sử dụng tool MCP `mcp_github-mcp-server_create_branch` để tạo nhánh mới từ `main`.
- **Naming convention:** `feature/<module-name>-<task-id>` (Ví dụ: `feature/auth-01-form-components` hoặc `feature/ielts-04-flashlist`).

### Bước 2: Hiện Thực Code & Push
- Lập trình viên (hoặc AI) tiến hành viết code cho các file được yêu cầu.
- Tự kiểm tra code (Self-Review) dựa trên checklist ở Mục 4.
- Sử dụng tool MCP `mcp_github-mcp-server_push_files` (đối với nhiều file) hoặc `mcp_github-mcp-server_create_or_update_file` (đối với 1 file) để commit code lên nhánh vừa tạo. **Commit message** phải rõ ràng, ví dụ: `feat(auth): build AppTextInput and AppButton with Zod`.

### Bước 3: Tạo Pull Request (Create PR)
- Sử dụng tool MCP `mcp_github-mcp-server_create_pull_request` để tạo PR.
- **Tiêu đề PR:** `[<module-name>] <Tên Task>` (Ví dụ: `[Auth] Xây dựng Form Components chống re-render (AUTH-01)`).
- **Body PR:** Phải liệt kê sơ lược các thay đổi và link tới Task ID.

### Bước 4: Review Code (Pull Request Review)
- Người review (Technical Lead/AI) nhận PR và tiến hành đối chiếu theo 5 Tiêu Chí (Mục 2).
- Cung cấp feedback trực tiếp trên GitHub bằng tool `mcp_github-mcp-server_pull_request_review_write` (comment vào từng line code vi phạm) hoặc `mcp_github-mcp-server_add_issue_comment` (comment tổng thể báo cáo review - Xem mẫu ở Mục 3).

### Bước 5: Merge PR
- Nếu PR đạt trạng thái **✅ PASS** (xem Mục 5), sử dụng tool `mcp_github-mcp-server_merge_pull_request` để merge vào `main` (khuyến khích dùng phương thức `squash` để giữ history gọn gàng).
- Xóa branch cũ sau khi merge thành công.

---
## 2. Năm Tiêu Chí Review

### 2.1. SOLID & Clean Code

**Nguồn quy tắc:** `RULES.md` — Mục 1 (SRP), Mục 6 (Clean Code)
**Nguồn quy tắc:** `SKILL.md` — Mục 3.1 (Thin Route, Fat Feature)

**Checklist:**

| # | Câu hỏi | Vi phạm → Mức độ |
|---|:---|:---|
| 1 | File route trong `app/` có chứa `useQuery`, `useMutation`, `useEffect` fetch, hoặc JSX phức tạp (>10 dòng) không? | 🔴 CRITICAL — Vi phạm SRP + Thin Route |
| 2 | Component có vừa fetch data vừa render UI trong cùng 1 file không? (>120 dòng) | 🔴 CRITICAL — Vi phạm SRP |
| 3 | Có nested `if` sâu >2 tầng không? | 🟡 WARNING — Vi phạm Early Return |
| 4 | Có magic number hoặc hardcoded string không? | 🟡 WARNING — Vi phạm Clean Code |
| 5 | Function có >30 dòng không? | 🔵 SUGGESTION — Nên tách |

---

### 2.2. Performance & Re-renders

**Nguồn quy tắc:** `SKILL.md` — Mục 2.1 (Chống Re-render), Mục 2.2 (FlashList)
**Nguồn quy tắc:** `RULES.md` — Mục 4 (ISP — không truyền object lớn)

**Checklist:**

| # | Câu hỏi | Vi phạm → Mức độ |
|---|:---|:---|
| 1 | `FlashList`/`FlatList` có `renderItem` dạng inline arrow function không? | 🔴 CRITICAL — Re-render mỗi cycle |
| 2 | Có truyền inline object `style={{...}}` hoặc inline function `onPress={() => ...}` vào list item không? | 🔴 CRITICAL — Re-render |
| 3 | Danh sách >20 items có dùng `FlatList` thay vì `FlashList` không? | 🟡 WARNING — Performance |
| 4 | `FlashList` có thiếu `estimatedItemSize` không? | 🟡 WARNING — Recycling kém |
| 5 | Component con trong list có được wrap `React.memo` không? | 🔵 SUGGESTION |
| 6 | Truyền nguyên object lớn (Exam, Result) vào component con chỉ cần 2-3 fields? | 🟡 WARNING — Vi phạm ISP |

---

---

### 2.3. Type Safety

**Nguồn quy tắc:** `SKILL.md` — Mục 4 (TypeScript Strictness)
**Nguồn quy tắc:** `RULES.md` — Mục 4 (ISP), Mục 5.2 (DIP — Storage interface)

**Checklist:**

| # | Câu hỏi | Vi phạm → Mức độ |
|---|:---|:---|
| 1 | Có sử dụng `any` ở bất kỳ đâu không? | 🔴 CRITICAL — Cấm tuyệt đối |
| 2 | JSON field từ API (questions, feedback, fieldValues) có được cast `as any` không? | 🔴 CRITICAL |
| 3 | Có dùng `enum` thay vì union type / const object không? | 🟡 WARNING — Tăng bundle |
| 4 | Object shapes dùng `type` thay vì `interface`? | 🔵 SUGGESTION |
| 5 | Có thiếu type annotation cho function parameters/returns phức tạp không? | 🟡 WARNING |


### 2.4. NativeWind Styling

**Nguồn quy tắc:** `SKILL.md` — Mục 5 (NativeWind)

**Checklist:**

| # | Câu hỏi | Vi phạm → Mức độ |
|---|:---|:---|
| 1 | Có `className` dài >6 classes trên 1 dòng không? | 🟡 WARNING — Khó đọc |
| 2 | Có trộn `className` với `style={{...}}` (trừ animated values) không? | 🔴 CRITICAL |
| 3 | Conditional classes có dùng nested ternary không? | 🟡 WARNING |
| 4 | Có import `Text` trực tiếp từ react-native thay vì `AppText` không? | 🟡 WARNING |
| 5 | Có hardcoded color hex trong className (`bg-[#FFC600]`) thay vì dùng theme token (`bg-primary`) không? | 🔵 SUGGESTION |

---

### 2.5. Async & Error Handling

**Nguồn quy tắc:** `SKILL.md` — Mục 3.2 (Phân định State), Templates
**Nguồn quy tắc:** `RULES.md` — Mục 6.1 (Early Return)

**Checklist:**

| # | Câu hỏi | Vi phạm → Mức độ |
|---|:---|:---|
| 1 | Screen dùng `useQuery` nhưng KHÔNG handle `isLoading`? | 🔴 CRITICAL — Crash tiềm ẩn |
| 2 | Screen dùng `useQuery` nhưng KHÔNG handle `error`? | 🔴 CRITICAL — UX tệ |
| 3 | `useMutation` không có `onError` callback? | 🟡 WARNING — User không biết lỗi |
| 4 | Dùng `try/catch` thủ công thay vì TanStack Query error handling? | 🟡 WARNING |
| 5 | Loading/Error states có dùng Early Return pattern không? | 🔵 SUGGESTION |

---

## 3. Mẫu Báo Cáo Review

Mọi review phải xuất kết quả theo format sau:

```markdown
# Code Review Report

**File:** `features/ielts/screens/ExamScreen.tsx`
**Author:** @developer-name
**Reviewer:** @reviewer-name
**Date:** 2026-XX-XX

## Verdict: 🟡 NEEDS WORK

### Findings

#### 🔴 [CRITICAL] Vi phạm SRP — Route chứa business logic
- **Vị trí:** `app/ielts/intensive/[examId].tsx` dòng 5-25
- **Quy tắc vi phạm:** RULES.md §1 (SRP) + SKILL.md §3.1 (Thin Route)
- **Code hiện tại:** [paste snippet]
- **Code đề xuất:** [paste refactored snippet]

#### 🟡 [WARNING] Inline function trong FlashList renderItem
- **Vị trí:** dòng 42
- **Quy tắc vi phạm:** SKILL.md §2.1 Quy tắc #1
- **Code hiện tại:** [paste snippet]
- **Code đề xuất:** [paste refactored snippet]

#### 🔵 [SUGGESTION] className có thể tách thành biến
- **Vị trí:** dòng 58
- **Quy tắc vi phạm:** SKILL.md §5.1 Quy tắc #1
- **Code đề xuất:** [paste snippet]

### Summary
| Mức độ | Số lượng |
|:---|:---|
| 🔴 CRITICAL | 1 |
| 🟡 WARNING | 1 |
| 🔵 SUGGESTION | 1 |

**Để PASS:** Fix tất cả 🔴 CRITICAL và ít nhất 80% 🟡 WARNING.
```

---

## 4. Self-Review Checklist (Dành cho Developer)

Trước khi tạo PR, developer **tự kiểm tra** bằng checklist dưới đây:

### Architecture
- [ ] File trong `app/` chỉ chứa route connector (≤10 dòng, không có useQuery/useMutation)
- [ ] Data fetching nằm trong `features/*/hooks/`
- [ ] UI nằm trong `features/*/screens/` hoặc `features/*/components/`
- [ ] Server state dùng TanStack Query, KHÔNG dùng Zustand cho API data

### Performance
- [ ] `FlashList` (không phải `FlatList`) cho danh sách >20 items
- [ ] `renderItem` được wrap `useCallback`
- [ ] List item component được wrap `React.memo`
- [ ] Không có inline function/object truyền vào list items
- [ ] `estimatedItemSize` được set cho mọi `FlashList`

### TypeScript
- [ ] Không có `any` trong toàn bộ file
- [ ] JSON fields từ API được handle bằng `unknown` + type guard
- [ ] Object shapes dùng `interface`, unions dùng `type`
- [ ] Không dùng `enum` (dùng const object hoặc union type)

### NativeWind
- [ ] Không trộn `className` với `style={{...}}` (trừ animated values)
- [ ] `className` không quá 6 classes trên 1 dòng (nếu dài → tách biến)
- [ ] Dùng `AppText` thay vì `Text` trực tiếp
- [ ] Conditional classes dùng `clsx`, không nested ternary

### Error Handling
- [ ] Mọi `useQuery` đều handle `isLoading` và `error`
- [ ] Mọi `useMutation` có `onError` feedback cho user
- [ ] Dùng Early Return pattern (không nested if >2 tầng)
- [ ] Không hardcode magic numbers hoặc text strings

---

## 5. Mức Độ Severity & Quyết Định

| Verdict | Điều kiện | Hành động |
|:---|:---|:---|
| ✅ **PASS** | 0 🔴 CRITICAL, ≤2 🔵 SUGGESTION | Merge được |
| 🟡 **NEEDS WORK** | ≥1 🔴 CRITICAL hoặc ≥3 🟡 WARNING | Phải fix và re-review |
| 🔴 **REJECTED** | ≥3 🔴 CRITICAL hoặc vi phạm kiến trúc nghiêm trọng | Yêu cầu rewrite đáng kể |

**Quy tắc vàng:** Mọi 🔴 CRITICAL phải được fix trước khi merge. Ngoại lệ chỉ được chấp nhận với comment `// GUIDELINE_EXCEPTION: <lý do>` và approval của Tech Lead.
