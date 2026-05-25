# BUGFIX-04 — Verify BUGFIX-03 · Logout 401 · Forgot Password · Achievements

> **Ngày:** 2026-05-25 · **Phạm vi:** `frontend-mobile` (+ `backend-core`)
> **Yêu cầu:** (1) kiểm BUGFIX-03 đã ổn chưa; (2) review Forgot Password + tại sao Logout lỗi 401/400; (3) Achievements trong profile/stats chưa giống web (web hiện tất cả, mobile chỉ 1).

---

## 1. Xác minh BUGFIX-03

| Mục | Trạng thái | Bằng chứng |
|---|---|---|
| #1 chat-ai đóng-trước-rồi-emit (sửa khoá màn vocab) | ✅ Đã làm | `chat-ai.tsx:559–561` `router.back()` → `setTimeout(()=>emit('OPEN_QUICK_ADD_CARD',…),…)` |
| #3 Advanced Speaking dùng `GradingContext` | ✅ Đã làm | `speaking/[partId].tsx` có `useGrading`/`submitAndTrack` (3 ref) |
| #2 `GlobalAddCardFab` mở sheet trong `Modal.onShow` (phòng thủ) | ❌ Chưa | `GlobalAddCardFab.tsx` không có `onShow` |
| #4 `ReadingExamBlock` KeyboardAvoidingView | ❌ Chưa | `ReadingExamBlock.tsx` vẫn 0 KAV |

**Đánh giá:**
- #1, #3 đã đúng. Riêng #1 dùng `setTimeout` cố định — **ổn nhưng nên dùng `navigation` `transitionEnd` listener** cho chắc (tránh máy chậm mở sheet trước khi chat-ai dismiss xong). Không chặn.
- #2, #4 còn thiếu (mức 🟡): nên bổ sung để (a) sheet luôn mở đúng kể cả khi gọi lúc còn modal, (b) ô điền trong **cột câu hỏi của split-view Reading** không bị bàn phím che (KAV ở màn cha có thể không bao trùm `ScrollView` lồng bên trong block).

---

## 2. 🔴 Logout lỗi 401/Unauthorized — ĐÃ TÌM RA GỐC

### 2.1 Nguyên nhân (xác minh)

`logout()` không gọi backend (chỉ clear token), **nhưng** clear token kích hoạt một effect gọi API cần auth **sau khi token đã mất**:

```ts
// contexts/NotificationContext.tsx:263–271
// Handle logout: clear backend token
useEffect(() => {
  if (!user && pushToken) {
    notificationsApi.removePushToken(pushToken).catch((err) => {   // DELETE /users/me/push-token
      console.error('Failed to remove push token on logout:', err);
    });
    setPushToken(null);
  }
}, [user, pushToken]);
```

Thứ tự hiện tại khi bấm Logout:
```
AuthContext.logout()
  → authService.logout() → clearSession()   // XOÁ access_token + refresh_token TRƯỚC
  → setUser(null)
        └─(effect)→ removePushToken(pushToken)  // DELETE gọi KHÔNG còn token → 401
                       └→ api-client thấy 401 → refreshToken() → refresh_token cũng đã xoá → false → ApiError(401)
```

⇒ Đó chính là lỗi **401 Unauthorized** lúc đăng xuất (request `DELETE /users/me/push-token` chạy sau khi session bị xoá).

### 2.2 Cách sửa — xoá push-token TRƯỚC khi clear session

```ts
// contexts/AuthContext.tsx — logout()
const logout = async () => {
  setIsLoading(true);
  try {
    // 1) Thu hồi push-token khi token CÒN hiệu lực (best-effort)
    try {
      const token = pushTokenRef.current;            // lấy từ NotificationContext (hoặc truyền vào)
      if (token) await notificationsApi.removePushToken(token);
    } catch { /* bỏ qua, không chặn logout */ }

    // 2) Mới clear session + state
    await authService.logout();
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } finally {
    setIsLoading(false);
  }
};
```

Và **bỏ** việc gọi `removePushToken` trong effect `if(!user && pushToken)` của `NotificationContext` (vì lúc đó token đã mất) — chỉ giữ `setPushToken(null)` để dọn state.

> Phòng thủ thêm (khuyến nghị): trong api-client, `refreshToken()` khi **không có** refresh_token thì trả `false` **im lặng** và request `DELETE push-token` coi là best-effort (đừng ném lỗi đỏ). Tránh mọi request "đuôi" sau logout làm bẩn log/hiện toast 401.

> Lưu ý: nếu vẫn thấy **400** (không phải 401), kiểm thêm endpoint `DELETE /users/me/push-token` nhận body/param thế nào — gọi sai shape khi token rỗng có thể ra 400. Sau khi đảo thứ tự (gọi lúc còn token) thì hết.

---

## 3. 🔴 Forgot Password — KHÔNG HOẠT ĐỘNG (UI giả)

### 3.1 Nguyên nhân (xác minh)

- **Mobile** `app/(auth)/forgot-password.tsx`: cả 2 bước đều **giả lập**, KHÔNG gọi API:
  ```ts
  // handleSendCode:  setTimeout(()=>{ setStep(2); toast.success('Code Sent', …) }, 1500)
  // handleResetPassword: setTimeout(()=>{ toast.success('Password Reset Successful', …); router.replace(login) }, 1500)
  ```
  → Báo "Đã gửi mã" và "Đặt lại mật khẩu thành công" **mà không làm gì** (đánh lừa người dùng).
- **Backend** `auth.controller.ts`: chỉ có `register / login / refresh / change-password / google` — **KHÔNG có** `forgot-password`, `reset-password`, `send-otp`, `verify-otp`. `auth.service` mobile cũng không có method forgot/reset.

⇒ Người dùng quên mật khẩu **không thể** đặt lại; màn hình hiện tại chỉ là giao diện trống.

### 3.2 Cách sửa (chọn 1)

**A. (Khuyến nghị) Hiện thực thật** — backend + mobile:
- Backend `AuthModule`:
  - `POST /auth/forgot-password { email }` → tạo OTP (4–6 số) hết hạn ~10 phút, lưu (bảng/`PasswordResetToken` hoặc Redis), gửi email (Nodemailer/SendGrid/Resend). Trả 200 **không tiết lộ** email tồn tại hay không.
  - `POST /auth/reset-password { email, otp, newPassword }` → verify OTP → `bcrypt` hash → cập nhật `user.password` → vô hiệu OTP. Chặn tài khoản Google (`password: null`).
- Mobile `auth.service`: thêm `forgotPassword(email)` + `resetPassword({email, otp, newPassword})`; `forgot-password.tsx` gọi thật, chỉ `setStep(2)`/`toast.success` **sau khi API 200**, và hiện lỗi khi thất bại.

**B. (Tạm thời) Tắt/ẩn cho trung thực** — nếu chưa có hạ tầng email:
- Ẩn link "Forgot password?" ở `login.tsx`, hoặc đổi màn thành thông báo "Tính năng đang phát triển — vui lòng liên hệ hỗ trợ", **bỏ** toast "thành công" giả.

> Tối thiểu phải làm B ngay (đừng để toast "Password Reset Successful" giả). A là giải pháp đúng.

---

## 4. 🟡 Achievements (profile/stats) — web hiện tất cả, mobile chỉ 1

### 4.1 Dữ kiện đã xác minh

- Cả **web** (`ProfileContent.tsx:27` → `AchievementsSection`) và **mobile** (`StatsTab.tsx:32`) đều gọi **cùng** `gamificationApi.getAchievements()` → `GET /gamification/achievements`.
- Mobile trỏ **production** (`.env`: `EXPO_PUBLIC_API_URL=https://dedangdown.io.vn/api/v1`) → **cùng backend/DB với web**.
- Backend `getAchievements` trả **toàn bộ catalog** (`gamification.service.ts:304` `prisma.achievement.findMany()` — không `take`, không lọc) gồm `{ id, key, name, description, icon, category, tier, earned, earnedAt }`.
- Catalog seed có **40** achievement (`prisma/seed-achievements.ts`), seed **riêng** (KHÔNG nằm trong `seed.ts`).
- Mobile `StatsTab` render `(showAll ? all : all.slice(0,6))` + nút "View All" chỉ hiện khi `length > 6`.

### 4.2 Hai vấn đề riêng biệt

**(a) 🔴 Lệch shape field giữa backend ↔ mobile (lỗi code chắc chắn):**
- Backend trả `key / category / tier / earned / earnedAt`.
- Mobile `types AchievementItem` (`types/index.ts:533`) + `StatsTab` lại dùng `xpReward, badgeId, conditionType, conditionValue` — **backend KHÔNG trả các field này** → `+${ach.xpReward} XP` ra **"+undefined XP"**.
- Web dùng đúng field backend (`achievement.earned`, `.tier`, `.category`) nên hiển thị đúng + nhóm theo category + `earnedCount/totalCount` (từ `getProfile`).
- **Fix:** sửa `AchievementItem` (mobile) khớp backend (`key, category, tier, earned, earnedAt`); `StatsTab` bỏ `xpReward` (hoặc backend bổ sung `xpReward` vào `getAchievements` map — model có `xpReward`, chỉ chưa select). Nên render **nhóm theo category + earnedCount/totalCount** như web để parity.

**(b) "Chỉ thấy 1" — dấu hiệu API trả về 1 item cho mobile:**
- Vì render là `slice(0,6)` và "View All" chỉ hiện khi `>6`: nếu bạn thấy **đúng 1 và không có nút View All** ⇒ `getAchievements()` trả **1 phần tử**.
- Mobile = web = cùng prod, cùng endpoint → về lý thuyết phải giống nhau. Khả năng:
  1. `seed-achievements.ts` (40 dòng) **chưa chạy đủ** trên DB prod (bảng `achievement` thực tế ít hàng). → Kiểm `getProfile().totalAchievements` (backend `gamification.service.ts:287`): nếu = 1 ⇒ DB thiếu seed → chạy `npx ts-node prisma/seed-achievements.ts` trên prod.
  2. `getAchievements()` **thất bại im lặng** trên mobile (`.catch(() => null)` ở `StatsTab:32`) và "1" là con số khác (vd `achievementCount`). → **Bỏ `.catch(()=>null)` nuốt lỗi**, log `achData?.length` để thấy thực tế.
- **Cách xác định nhanh:** thêm `if(__DEV__) console.log('ach length', achData?.length, 'profile total', gamData?.totalAchievements)` trong `StatsTab.fetchData`.
  - `length=40` ⇒ chỉ là lỗi render/shape (a) → sửa (a) là hiện đủ.
  - `length=1` & `totalAchievements=1` ⇒ DB prod thiếu seed → chạy seed-achievements.
  - `achData=null` ⇒ request lỗi → bỏ catch nuốt + xem lỗi.

### 4.3 Tóm tắt fix achievements

1. 🔴 Sửa `AchievementItem` + `StatsTab` khớp shape backend (`earned/tier/category`, bỏ `xpReward` undefined); render nhóm category + `earnedCount/totalCount` như web.
2. 🟡 Bỏ `.catch(()=>null)` nuốt lỗi ở `StatsTab` (để lỗi hiện ra) + log length khi `__DEV__`.
3. 🟡 Xác minh DB prod đã seed đủ 40 (`seed-achievements.ts`); nếu thiếu thì chạy seed. (Khuyến nghị thêm `seed-achievements` vào `prisma:seed` để không quên.)
4. 🟢 (parity) backend `getAchievements` bổ sung `xpReward` vào map (model đã có cột) nếu muốn hiện XP từng thành tựu.

---

## 5. Tổng hợp ưu tiên

| # | Mức độ | Việc | File |
|---|---|---|---|
| 1 | 🔴 | Logout: thu hồi push-token TRƯỚC clearSession; bỏ removePushToken trong effect user=null | `contexts/AuthContext.tsx`, `contexts/NotificationContext.tsx` |
| 2 | 🔴 | Forgot Password: hiện thực backend OTP + wire mobile (hoặc tạm ẩn + bỏ toast giả) | `backend-core/.../auth.*`, `app/(auth)/forgot-password.tsx`, `services/auth.service.ts` |
| 3 | 🔴 | Achievements: khớp shape `AchievementItem`/StatsTab với backend + render nhóm như web | `types/index.ts`, `components/profile/StatsTab.tsx` |
| 4 | 🟡 | Xác minh/seed 40 achievements trên prod; bỏ `.catch(()=>null)` nuốt lỗi | `prisma/seed-achievements.ts`, `StatsTab.tsx` |
| 5 | 🟡 | BUGFIX-03 còn lại: `ReadingExamBlock` KAV (#4) + `GlobalAddCardFab` onShow (#2) | `ReadingExamBlock.tsx`, `GlobalAddCardFab.tsx` |
| 6 | 🟢 | chat-ai dùng `transitionEnd` thay `setTimeout` cố định | `chat-ai.tsx` |

---

## 6. Kiểm thử

1. **Logout:** đăng nhập (đã cấp push-token) → Logout → **không** còn lỗi 401/400 ở console/toast; token bị thu hồi backend; về màn login sạch.
2. **Forgot Password (sau khi làm A):** nhập email → nhận OTP email thật → nhập OTP + mật khẩu mới → đăng nhập được bằng mật khẩu mới; OTP sai/hết hạn → báo lỗi đúng. (Nếu chọn B: link/màn ẩn, không còn toast giả.)
3. **Achievements:** profile/stats hiện **đủ** danh sách (locked + earned) nhóm theo category + "X/Y" giống web; XP/hiển thị đúng (không "undefined").
4. `tsc --noEmit` (mobile) + `npm run test` (backend auth) sạch.

---

## 7. Trả lời trực tiếp

- **BUGFIX-03 ổn chưa?** #1 (khoá màn vocab) & #3 (speaking grading) ✅ ổn; còn #2 (onShow) và #4 (KAV Reading) **chưa làm** — nên bổ sung.
- **Logout 401 do đâu?** Do `NotificationContext` gọi `DELETE /users/me/push-token` **sau khi** token đã bị `clearSession()` xoá → 401 (refresh cũng fail). Fix: thu hồi push-token **trước** khi clear session.
- **Forgot Password:** đang là **UI giả** (không gọi API) và **backend không có route** → không đặt lại được mật khẩu. Cần hiện thực thật (OTP email) hoặc tạm ẩn + bỏ toast thành công giả.
- **Achievements chỉ 1 cái:** (a) lỗi chắc chắn = **lệch shape field** (`xpReward/badgeId…` vs `earned/tier/category`) khiến hiển thị sai; (b) số "1" = API trả 1 item → kiểm `totalAchievements`/log length: nếu DB prod thiếu seed thì chạy `seed-achievements.ts`, nếu fetch lỗi thì bỏ `.catch` nuốt. Sửa shape + render nhóm như web là khớp.
