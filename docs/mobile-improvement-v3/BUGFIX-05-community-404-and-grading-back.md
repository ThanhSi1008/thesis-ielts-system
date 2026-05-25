# BUGFIX-05 — Community 404 (advanced) · Thiếu nút quay lại khi chấm bài Writing/Speaking

> **Ngày:** 2026-05-25 · **Phạm vi:** `frontend-mobile` (+ `backend-core`)
> **Triệu chứng:**
> 1. `ERROR Failed to load community answers: ApiError: Cannot GET /api/v1/ielts/advanced/writing/prompts/{id}/community?page=1&limit=10&sortBy=band`
> 2. Khi nộp bài Writing/Speaking ở IELTS Advanced → **không có nút quay lại** trang IELTS Advanced.

---

## 1. 🔴 Community answers — 404 "Cannot GET" (endpoint không tồn tại)

### 1.1 Nguyên nhân (xác minh)

- Mobile gọi (`services/ielts.api.ts:125–143`):
  - `getCommunityWritingAnswers` → `GET /ielts/advanced/writing/prompts/{promptId}/community?page&limit&sortBy`
  - `getCommunitySpeakingAnswers` → `GET /ielts/advanced/speaking/parts/{partId}/community?…`
- **Backend KHÔNG có** các route này. Toàn bộ route của `ielts-advanced.controller.ts` (đã liệt kê raw):
  `listening*`, `reading*`, `writing/prompts`, `writing/prompts/:id`, `writing/prompts/:id/sessions`, `writing/sessions*`, `writing/history`, `speaking/parts*`, `speaking/sessions*`, `speaking/history`, `speaking/stats`.
  → **Không có** `writing/prompts/:id/community` hay `speaking/parts/:id/community`.
- Trong toàn bộ `backend-core/src`, "community" chỉ xuất hiện ở **Vocab Lab** (`vocab-lab.controller.ts` `community/decks*`). Advanced **không có** community.
- Web có trang `advanced/writing/[promptId]/community/page.tsx` & `speaking/[partId]/community/page.tsx` nhưng chỉ ~17 dòng (stub) → tính năng community **chưa hiện thực end-to-end** ở backend.

⇒ Mỗi lần mở màn community (hoặc tab community), mobile gọi endpoint không tồn tại → **404 "Cannot GET"** → toast/log lỗi đỏ.

### 1.2 Cách sửa (chọn 1)

**A. (Khuyến nghị nếu giữ tính năng) Hiện thực backend community:**
- `GET /ielts/advanced/writing/prompts/:id/community?page&limit&sortBy` → trả các phiên **đã chấm (GRADED) của NGƯỜI KHÁC** cho prompt đó (loại trừ user hiện tại), phân trang, sort theo `bandScore`. Tôn trọng quyền riêng tư: chỉ trả bài người dùng **đồng ý chia sẻ** (cần cờ `isPublic`/opt-in trên session) hoặc ẩn danh.
- Tương tự `GET /ielts/advanced/speaking/parts/:id/community`.
- `GET …/community/:sessionId` cho chi tiết 1 bài cộng đồng.
- Thêm service `getCommunityWritingAnswers(userId, promptId, {page,limit,sortBy})` dùng `ieltsAdvancedWritingSession.findMany({ where: { promptId, status: 'GRADED', userId: { not: userId }, isPublic: true }, … })`.

**B. (Tạm thời) Ẩn/tắt community để hết spam 404:**
- Ẩn nút/tab "Community Answers" ở màn Writing/Speaking practice + result; hoặc bọc lời gọi trong cờ `FEATURE_COMMUNITY = false`.
- Nếu vẫn vào màn community: hiển thị empty-state "Tính năng đang phát triển" thay vì gọi API.

> Tối thiểu làm B ngay (đừng để 404 đỏ mỗi lần mở). A là giải pháp đầy đủ (cần thêm cột `isPublic` + di trú DB).

> **Cùng họ với Forgot Password (BUGFIX-04):** UI mobile có nhưng backend thiếu route. Nên rà soát mọi lời gọi mobile → đối chiếu route backend để tránh các 404 ẩn khác.

---

## 2. 🔴 Không có nút quay lại khi đang chấm Writing/Speaking (Advanced)

### 2.1 Nguyên nhân (xác minh)

Sau khi nộp: `writing/[promptId].tsx` (và speaking) → `router.replace('/ielts/advanced/writing/result/${sessionId}')`. Trên màn result, **view trạng thái "đang chấm"** được render **đầu tiên** (vì vừa nộp, status = `SUBMITTED/GRADING`):

```tsx
// writing/result/[sessionId].tsx:522–544 (và speaking:650–672) — VIEW PENDING
if (pollingActive || session.status === 'GRADING') {
  return (
    <SafeAreaView edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />   {/* ⛔ ẩn header */}
      <View style={styles.pendingContainer}>
        <ActivityIndicator … />
        <Text>Evaluating Your Essay…</Text>
        {/* tips carousel — KHÔNG có nút back/quay về nào */}
      </View>
    </SafeAreaView>
  );
}
```

⇒ Ngay sau khi nộp, người dùng thấy màn "Evaluating…" **không header, không nút back** → **kẹt** đến khi chấm xong (10–90s) mới hiện view có nút back. Đó chính là "không có nút quay lại trang IELTS Advanced".

Thêm vấn đề ở **view đã chấm**: nút header back trỏ sai đích:
```tsx
// writing/result:574  onPress={() => router.replace('/ielts/advanced/writing')}
// speaking/result:702 onPress={() => router.replace('/ielts/advanced/speaking')}
```
Sau **Phase 6**, Writing/Speaking đã là **tab inline** trong `/ielts/advanced` (`advanced/index.tsx:96–97,353–355` render `AdvancedWritingCatalog embedded`). Việc replace về `/ielts/advanced/writing` (catalog standalone) là **không nhất quán** — đáng lẽ về `/ielts/advanced`.

### 2.2 Cách sửa

**(a) Thêm nút quay về vào VIEW PENDING** (cả writing + speaking) — rời đi an toàn vì chấm vẫn chạy nền (`GradingContext` cho writing; speaking đã chuyển qua `GradingContext` ở BUGFIX-03 #3) + toast khi xong:

```tsx
if (pollingActive || session.status === 'GRADING') {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header tối giản có nút back */}
      <View style={styles.pendingHeader}>
        <TouchableOpacity
          onPress={() => router.replace('/ielts/advanced')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back to IELTS Advanced"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.pendingHeaderNote}>Bài đang được chấm — bạn có thể quay lại, sẽ báo khi xong.</Text>
      </View>
      <View style={styles.pendingContainer}> … spinner + tips … </View>
    </SafeAreaView>
  );
}
```

**(b) Sửa đích nút back ở view đã chấm + view GRADING_FAILED** → về `/ielts/advanced` (hoặc `'/ielts/advanced?tab=writing'` nếu muốn mở đúng tab):

```tsx
// writing/result:574
onPress={() => router.replace('/ielts/advanced')}
// speaking/result:702
onPress={() => router.replace('/ielts/advanced')}
```
> (Nếu muốn quay đúng tab: `router.replace('/ielts/advanced?tab=writing')` và cho `advanced/index` đọc `useLocalSearchParams().tab` để set `activeTab` — `advanced/index` đã có sẵn state `activeTab`.)

**(c) Android hardware back:** đảm bảo nút back vật lý ở view pending cũng về `/ielts/advanced` (thêm `useEffect` `BackHandler` hoặc dựa vào nút (a)).

---

## 3. Tổng hợp ưu tiên

| # | Mức độ | Việc | File |
|---|---|---|---|
| 1 | 🔴 | Thêm nút back vào **view PENDING** của result Writing + Speaking → `/ielts/advanced` | `app/ielts/advanced/writing/result/[sessionId].tsx`, `…/speaking/result/[sessionId].tsx` |
| 2 | 🟡 | Sửa đích back ở view đã chấm + GRADING_FAILED → `/ielts/advanced` (thay `/ielts/advanced/writing` `/speaking`) | 2 file result trên |
| 3 | 🔴 | Community: ẩn entry point + ngừng gọi 404 (B) **hoặc** hiện thực backend community (A) | `services/ielts.api.ts`, màn community, `backend-core/.../ielts-advanced.*` |
| 4 | 🟢 | Rà soát các lời gọi mobile khác có route backend không (tránh 404 ẩn) | `services/*.ts` ↔ controllers |

---

## 4. Kiểm thử

1. **Back khi đang chấm:** nộp Writing → màn "Evaluating…" hiện **nút back** → bấm về `/ielts/advanced`; chấm xong nhận toast (GradingContext) → mở result được. Lặp lại cho Speaking.
2. **Back sau khi chấm xong:** ở view certificate, nút header back → về `/ielts/advanced` (không phải catalog con).
3. **Community:** mở màn/tab community → **không** còn lỗi 404 đỏ (đã ẩn) hoặc hiện danh sách thật (nếu làm A).
4. Android: nút back vật lý ở màn pending → về `/ielts/advanced`.

---

## 5. Trả lời trực tiếp

- **Lỗi `Cannot GET …/community`:** backend **không có** route community cho advanced writing/speaking (chỉ Vocab Lab có community) → mobile gọi endpoint không tồn tại → 404. Sửa: ẩn tính năng/ngừng gọi, hoặc hiện thực backend community (kèm cờ chia sẻ công khai).
- **Không có nút quay lại khi nộp Writing/Speaking:** view "đang chấm" của result (`headerShown:false`, chỉ spinner+tips) **không có nút back** → kẹt tới khi chấm xong. Thêm nút back ở view pending (rời đi an toàn vì có `GradingContext` chấm nền + toast), và sửa đích back về `/ielts/advanced`.
