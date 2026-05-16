# Báo cáo kết quả kiểm thử backend-core (auto-generated)

> **Sinh tự động:** 2026-05-16T04:25:31.572Z — Tác giả: Auto (Jest).
> Tham chiếu format: mục 4.6.1–4.6.2 của khóa luận (`testing-sample.md`).

## 1. Tổng hợp

| Chỉ số | Giá trị |
|---|---:|
| Số test case | 60 |
| Pass | 60 |
| Fail | 0 |
| Skipped/TODO | 0 |
| Tổng thời gian (ms) | 25521 |

## 2. Bảng 4.1 — Danh sách test case

| TH | Mã | Tình huống / Kết quả mong muốn | File |
|---|---|---|---|
| TC01 | TC01_01 | firstName rỗng → 400 Bad Request (IsNotEmpty) | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_02 | email sai định dạng → 400 "Invalid email format" | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_03 | password < 6 ký tự → 400 "Password must be at least 6 characters" | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_04 | email đã tồn tại (Prisma P2002) → 400 "Email already exists" | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_05 | payload hợp lệ → 201, trả SafeUser (không có password) | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_06 | password được lưu dưới dạng bcrypt hash, không phải plaintext | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_07 | tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab | `modules/auth/tests/register.spec.ts` |
| TC01 | TC01_08 | không truyền role → mặc định "STUDENT"; truyền role → tôn trọng giá trị | `modules/auth/tests/register.spec.ts` |
| TC02 | TC02_01 | email đúng + password sai → 401 "Invalid credentials" | `modules/auth/tests/login.spec.ts` |
| TC02 | TC02_02 | email không tồn tại + password đúng → 401 | `modules/auth/tests/login.spec.ts` |
| TC02 | TC02_03 | cả email và password đều sai → 401 | `modules/auth/tests/login.spec.ts` |
| TC02 | TC02_04 | payload thiếu password → 401 (passport-local từ chối) | `modules/auth/tests/login.spec.ts` |
| TC02 | TC02_05 | email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role } | `modules/auth/tests/login.spec.ts` |
| TC03 | TC03_01 | body rỗng → 400 (MinLength 1) | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_02 | body quá dài (> 10000 ký tự) → 400 | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_03 | type không thuộc enum PostType → 400 | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_04 | không có JWT → 401 | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_05 | tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5 | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_06 | tạo post kèm tags + imageUrls → service nhận đúng payload | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_07 | list posts (không query) → 200, gọi prisma.post.findMany với where.isHidden=false | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_08 | like lần đầu → 201, trả { liked: true }, increment likeCount | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_09 | like trên post đã like → unlike, trả { liked: false } | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_10 | like post không tồn tại → 404 Not Found | `modules/posts/tests/posts.spec.ts` |
| TC03 | TC03_11 | list posts với query limit dạng string số → 400 (DTO @IsInt không có @Type → strict) | `modules/posts/tests/posts.spec.ts` |
| TC05 | TC05_01 | không có JWT → 401 | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_02 | GET /unread-count không có JWT → 401 | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_03 | DELETE /:id không có JWT → 401 | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_04 | GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_05 | GET /notifications phân trang đúng page=2 → skip=20 | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_06 | PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId }) | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_07 | PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin) | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_08 | PATCH /read-all → mark hết notification chưa đọc của user | `modules/notifications/tests/notifications.spec.ts` |
| TC05 | TC05_09 | DELETE /:id → 200, xoá notification thuộc user | `modules/notifications/tests/notifications.spec.ts` |
| TC06 | TC06_01 | không có JWT (JwtAuthGuard từ chối) → 401 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_02 | email sai định dạng → 400 "Invalid email format" | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_03 | role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_04 | isActive không phải boolean → 400 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_05 | firstName là số → 400 (IsString) | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_06 | gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted) | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_07 | cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_08 | cập nhật email mới hợp lệ → 200 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_09 | cập nhật email đã có người khác dùng (Prisma P2002) → 400 | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_10 | cập nhật role = TEACHER → 200, lưu đúng giá trị | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_11 | cập nhật isActive = false → 200, lưu boolean đúng | `modules/users/tests/update-profile.spec.ts` |
| TC06 | TC06_12 | body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op) | `modules/users/tests/update-profile.spec.ts` |
| TC10 | TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_04 | không có JWT → 401 | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC10 | TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | `modules/pronunciation/tests/pronunciation.spec.ts` |
| TC11 | TC11_01 | GET /overview không có JWT → 401 | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_02 | GET /foundation không có JWT → 401 | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_04 | GET /foundation → 200, đúng userId | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_05 | GET /basic → 200, đúng userId | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_06 | GET /advanced → 200, đúng userId | `modules/ielts/tests/ielts-statistics.spec.ts` |
| TC11 | TC11_07 | GET /intensive → 200, đúng userId | `modules/ielts/tests/ielts-statistics.spec.ts` |

## 3. Bảng 4.2 — Báo cáo kết quả kiểm thử

| Nhóm | Loại | ID | Kết quả mong đợi | Trạng thái | Thời gian (ms) | Người TH | Ngày |
|---|---|---|---|---|---:|---|---|
| TC01 | Invalid | TC01_01 | firstName rỗng → 400 Bad Request (IsNotEmpty) | Pass | 16 | Auto (Jest) | 2026-05-16 |
| TC01 | Invalid | TC01_02 | email sai định dạng → 400 "Invalid email format" | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC01 | Invalid | TC01_03 | password < 6 ký tự → 400 "Password must be at least 6 characters" | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC01 | Invalid | TC01_04 | email đã tồn tại (Prisma P2002) → 400 "Email already exists" | Pass | 53 | Auto (Jest) | 2026-05-16 |
| TC01 | Valid | TC01_05 | payload hợp lệ → 201, trả SafeUser (không có password) | Pass | 52 | Auto (Jest) | 2026-05-16 |
| TC01 | Valid | TC01_06 | password được lưu dưới dạng bcrypt hash, không phải plaintext | Pass | 90 | Auto (Jest) | 2026-05-16 |
| TC01 | Valid | TC01_07 | tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab | Pass | 46 | Auto (Jest) | 2026-05-16 |
| TC01 | Valid | TC01_08 | không truyền role → mặc định "STUDENT"; truyền role → tôn trọng giá trị | Pass | 92 | Auto (Jest) | 2026-05-16 |
| TC02 | Invalid | TC02_01 | email đúng + password sai → 401 "Invalid credentials" | Pass | 64 | Auto (Jest) | 2026-05-16 |
| TC02 | Invalid | TC02_02 | email không tồn tại + password đúng → 401 | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC02 | Invalid | TC02_03 | cả email và password đều sai → 401 | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC02 | Invalid | TC02_04 | payload thiếu password → 401 (passport-local từ chối) | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC02 | Valid | TC02_05 | email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role } | Pass | 49 | Auto (Jest) | 2026-05-16 |
| TC03 | Invalid | TC03_01 | body rỗng → 400 (MinLength 1) | Pass | 17 | Auto (Jest) | 2026-05-16 |
| TC03 | Invalid | TC03_02 | body quá dài (> 10000 ký tự) → 400 | Pass | 3 | Auto (Jest) | 2026-05-16 |
| TC03 | Invalid | TC03_03 | type không thuộc enum PostType → 400 | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC03 | Invalid | TC03_04 | không có JWT → 401 | Pass | 3 | Auto (Jest) | 2026-05-16 |
| TC03 | Valid | TC03_05 | tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5 | Pass | 3 | Auto (Jest) | 2026-05-16 |
| TC03 | Valid | TC03_06 | tạo post kèm tags + imageUrls → service nhận đúng payload | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC03 | Valid | TC03_07 | list posts (không query) → 200, gọi prisma.post.findMany với where.isHidden=false | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC03 | Valid | TC03_08 | like lần đầu → 201, trả { liked: true }, increment likeCount | Pass | 4 | Auto (Jest) | 2026-05-16 |
| TC03 | Valid | TC03_09 | like trên post đã like → unlike, trả { liked: false } | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC03 | Valid | TC03_10 | like post không tồn tại → 404 Not Found | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC03 | Valid | TC03_11 | list posts với query limit dạng string số → 400 (DTO @IsInt không có @Type → strict) | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC05 | Invalid | TC05_01 | không có JWT → 401 | Pass | 12 | Auto (Jest) | 2026-05-16 |
| TC05 | Invalid | TC05_02 | GET /unread-count không có JWT → 401 | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC05 | Invalid | TC05_03 | DELETE /:id không có JWT → 401 | Pass | 4 | Auto (Jest) | 2026-05-16 |
| TC05 | Valid | TC05_04 | GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt | Pass | 3 | Auto (Jest) | 2026-05-16 |
| TC05 | Valid | TC05_05 | GET /notifications phân trang đúng page=2 → skip=20 | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC05 | Valid | TC05_06 | PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId }) | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC05 | Valid | TC05_07 | PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin) | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC05 | Valid | TC05_08 | PATCH /read-all → mark hết notification chưa đọc của user | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC05 | Valid | TC05_09 | DELETE /:id → 200, xoá notification thuộc user | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_01 | không có JWT (JwtAuthGuard từ chối) → 401 | Pass | 43 | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_02 | email sai định dạng → 400 "Invalid email format" | Pass | 7 | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_03 | role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400 | Pass | 4 | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_04 | isActive không phải boolean → 400 | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_05 | firstName là số → 400 (IsString) | Pass | 1 | Auto (Jest) | 2026-05-16 |
| TC06 | Invalid | TC06_06 | gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted) | Pass | 5 | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_07 | cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id | Pass | 10 | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_08 | cập nhật email mới hợp lệ → 200 | Pass | 27 | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_09 | cập nhật email đã có người khác dùng (Prisma P2002) → 400 | Pass | 8 | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_10 | cập nhật role = TEACHER → 200, lưu đúng giá trị | Pass | 4 | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_11 | cập nhật isActive = false → 200, lưu boolean đúng | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC06 | Valid | TC06_12 | body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op) | Pass | 4 | Auto (Jest) | 2026-05-16 |
| TC10 | — | TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | Pass | 20 | Auto (Jest) | 2026-05-16 |
| TC10 | — | TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | Pass | 8 | Auto (Jest) | 2026-05-16 |
| TC10 | — | TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | Pass | 4 | Auto (Jest) | 2026-05-16 |
| TC10 | — | TC10_04 | không có JWT → 401 | Pass | 13 | Auto (Jest) | 2026-05-16 |
| TC10 | — | TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | Pass | 21 | Auto (Jest) | 2026-05-16 |
| TC10 | — | TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | Pass | 11 | Auto (Jest) | 2026-05-16 |
| TC10 | — | TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | Pass | 10 | Auto (Jest) | 2026-05-16 |
| TC10 | — | TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | Pass | 6 | Auto (Jest) | 2026-05-16 |
| TC11 | Invalid | TC11_01 | GET /overview không có JWT → 401 | Pass | 16 | Auto (Jest) | 2026-05-16 |
| TC11 | Invalid | TC11_02 | GET /foundation không có JWT → 401 | Pass | 3 | Auto (Jest) | 2026-05-16 |
| TC11 | Valid | TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | Pass | 5 | Auto (Jest) | 2026-05-16 |
| TC11 | Valid | TC11_04 | GET /foundation → 200, đúng userId | Pass | 7 | Auto (Jest) | 2026-05-16 |
| TC11 | Valid | TC11_05 | GET /basic → 200, đúng userId | Pass | 3 | Auto (Jest) | 2026-05-16 |
| TC11 | Valid | TC11_06 | GET /advanced → 200, đúng userId | Pass | 2 | Auto (Jest) | 2026-05-16 |
| TC11 | Valid | TC11_07 | GET /intensive → 200, đúng userId | Pass | 2 | Auto (Jest) | 2026-05-16 |

## 4. Chi tiết theo từng file spec

### `modules/auth/tests/register.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC01_01 | firstName rỗng → 400 Bad Request (IsNotEmpty) | Pass | 16 |
| TC01_02 | email sai định dạng → 400 "Invalid email format" | Pass | 2 |
| TC01_03 | password < 6 ký tự → 400 "Password must be at least 6 characters" | Pass | 2 |
| TC01_04 | email đã tồn tại (Prisma P2002) → 400 "Email already exists" | Pass | 53 |
| TC01_05 | payload hợp lệ → 201, trả SafeUser (không có password) | Pass | 52 |
| TC01_06 | password được lưu dưới dạng bcrypt hash, không phải plaintext | Pass | 90 |
| TC01_07 | tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab | Pass | 46 |
| TC01_08 | không truyền role → mặc định "STUDENT"; truyền role → tôn trọng giá trị | Pass | 92 |

### `modules/auth/tests/login.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC02_01 | email đúng + password sai → 401 "Invalid credentials" | Pass | 64 |
| TC02_02 | email không tồn tại + password đúng → 401 | Pass | 1 |
| TC02_03 | cả email và password đều sai → 401 | Pass | 2 |
| TC02_04 | payload thiếu password → 401 (passport-local từ chối) | Pass | 1 |
| TC02_05 | email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role } | Pass | 49 |

### `modules/posts/tests/posts.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC03_01 | body rỗng → 400 (MinLength 1) | Pass | 17 |
| TC03_02 | body quá dài (> 10000 ký tự) → 400 | Pass | 3 |
| TC03_03 | type không thuộc enum PostType → 400 | Pass | 1 |
| TC03_04 | không có JWT → 401 | Pass | 3 |
| TC03_05 | tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5 | Pass | 3 |
| TC03_06 | tạo post kèm tags + imageUrls → service nhận đúng payload | Pass | 2 |
| TC03_07 | list posts (không query) → 200, gọi prisma.post.findMany với where.isHidden=false | Pass | 1 |
| TC03_08 | like lần đầu → 201, trả { liked: true }, increment likeCount | Pass | 4 |
| TC03_09 | like trên post đã like → unlike, trả { liked: false } | Pass | 1 |
| TC03_10 | like post không tồn tại → 404 Not Found | Pass | 1 |
| TC03_11 | list posts với query limit dạng string số → 400 (DTO @IsInt không có @Type → strict) | Pass | 2 |

### `modules/notifications/tests/notifications.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC05_01 | không có JWT → 401 | Pass | 12 |
| TC05_02 | GET /unread-count không có JWT → 401 | Pass | 2 |
| TC05_03 | DELETE /:id không có JWT → 401 | Pass | 4 |
| TC05_04 | GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt | Pass | 3 |
| TC05_05 | GET /notifications phân trang đúng page=2 → skip=20 | Pass | 2 |
| TC05_06 | PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId }) | Pass | 1 |
| TC05_07 | PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin) | Pass | 1 |
| TC05_08 | PATCH /read-all → mark hết notification chưa đọc của user | Pass | 1 |
| TC05_09 | DELETE /:id → 200, xoá notification thuộc user | Pass | 2 |

### `modules/users/tests/update-profile.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC06_01 | không có JWT (JwtAuthGuard từ chối) → 401 | Pass | 43 |
| TC06_02 | email sai định dạng → 400 "Invalid email format" | Pass | 7 |
| TC06_03 | role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400 | Pass | 4 |
| TC06_04 | isActive không phải boolean → 400 | Pass | 2 |
| TC06_05 | firstName là số → 400 (IsString) | Pass | 1 |
| TC06_06 | gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted) | Pass | 5 |
| TC06_07 | cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id | Pass | 10 |
| TC06_08 | cập nhật email mới hợp lệ → 200 | Pass | 27 |
| TC06_09 | cập nhật email đã có người khác dùng (Prisma P2002) → 400 | Pass | 8 |
| TC06_10 | cập nhật role = TEACHER → 200, lưu đúng giá trị | Pass | 4 |
| TC06_11 | cập nhật isActive = false → 200, lưu boolean đúng | Pass | 2 |
| TC06_12 | body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op) | Pass | 4 |

### `modules/pronunciation/tests/pronunciation.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC10_01 | GET /sounds → 200, trả mảng (public, không yêu cầu JWT) | Pass | 20 |
| TC10_02 | GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found" | Pass | 8 |
| TC10_03 | GET /sounds/:symbol có dữ liệu → 200, trả object sound | Pass | 4 |
| TC10_04 | không có JWT → 401 | Pass | 13 |
| TC10_05 | payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score) | Pass | 21 |
| TC10_06 | user role = STUDENT → 403 (RolesGuard từ chối) | Pass | 11 |
| TC10_07 | user role = ADMIN + payload đủ field (symbol, type, word) → 201, service.createSound được gọi | Pass | 10 |
| TC10_08 | ADMIN nhưng thiếu field "word" → 400 (DTO IsString) | Pass | 6 |

### `modules/ielts/tests/ielts-statistics.spec.ts`

| TC | Mô tả | Trạng thái | Thời gian (ms) |
|---|---|---|---:|
| TC11_01 | GET /overview không có JWT → 401 | Pass | 16 |
| TC11_02 | GET /foundation không có JWT → 401 | Pass | 3 |
| TC11_03 | GET /overview → 200, service.getOverviewStats(userId) được gọi | Pass | 5 |
| TC11_04 | GET /foundation → 200, đúng userId | Pass | 7 |
| TC11_05 | GET /basic → 200, đúng userId | Pass | 3 |
| TC11_06 | GET /advanced → 200, đúng userId | Pass | 2 |
| TC11_07 | GET /intensive → 200, đúng userId | Pass | 2 |

---

_File này được sinh tự động bởi `test/reporters/markdown-reporter.js` mỗi khi chạy `npm test` hoặc `npm run test:unit`._