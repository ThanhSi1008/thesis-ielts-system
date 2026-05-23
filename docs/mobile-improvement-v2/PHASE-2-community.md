# Phase 2 — Advanced Community Answers (Peer Review)

**Ưu tiên:** 🔴 Cao  
**Ước tính:** 4–5 ngày  
**Phụ thuộc:** Không có (độc lập)

---

## Vấn Đề Hiện Tại

Web có 2 trang community cho IELTS Advanced:
- `/ielts/advanced/speaking/[partId]/community/` — xem bài nói của người dùng khác cho cùng topic
- `/ielts/advanced/writing/[promptId]/community/` — xem bài viết (essay) của người dùng khác cho cùng prompt

Mobile **hoàn toàn không có** tính năng này. Người dùng mobile:
- Không thể xem bài làm mẫu / community answers
- Không có cơ chế so sánh bài làm của mình với peers
- Bỏ qua một lượng UGC (user-generated content) lớn đã có trên web

---

## Mục Tiêu Phase 2

1. Thêm API method `getCommunityAnswers` cho cả Speaking và Writing vào service layer.
2. Tạo màn hình `CommunityAnswersScreen` dùng chung cho cả speaking và writing, với list bài làm, điểm band, và nút xem chi tiết.
3. Thêm nút/tab "Community" vào màn hình detail của Advanced Speaking Part và Advanced Writing Prompt.

---

## Phân Tích Backend API

Tra cứu route hiện tại từ web:

**Speaking Community:**
```
GET /ielts/advanced/speaking/parts/:partId/community
Response: [{
  sessionId, userId, userName, userAvatar,
  bandScore, submittedAt, audioAnswers (URLs), feedback
}]
```

**Writing Community:**
```
GET /ielts/advanced/writing/prompts/:promptId/community
Response: [{
  sessionId, userId, userName, userAvatar,
  bandScore, submittedAt, essay, feedback
}]
```

> **Lưu ý:** Cần kiểm tra lại exact response shape từ `backend-core` trước khi implement. Nếu endpoint chưa có privacy filter (ẩn danh tính), cần confirm với backend team.

---

## Task Chi Tiết

### Task 2.1 — Khai Báo Types

**File:** `frontend-mobile/types/index.ts`

```typescript
export interface CommunityWritingAnswer {
  sessionId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  bandScore: number | null;
  submittedAt: string;
  essay: string;
  feedback?: {
    taskAchievement?: number;
    coherenceCohesion?: number;
    lexicalResource?: number;
    grammaticalRange?: number;
    overallBand?: number;
    comments?: string;
  };
}

export interface CommunitySpeakingAnswer {
  sessionId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  bandScore: number | null;
  submittedAt: string;
  audioAnswers: Record<string, string>; // questionId -> audioUrl
  feedback?: {
    fluency?: number;
    vocabulary?: number;
    grammar?: number;
    pronunciation?: number;
    overallBand?: number;
    comments?: string;
  };
}

export type CommunityAnswerType = 'writing' | 'speaking';
```

**Subtasks:**
- [ ] Thêm 3 interfaces trên vào `types/index.ts`

---

### Task 2.2 — Thêm Community API Methods

**File:** `frontend-mobile/services/ielts.api.ts`

Thêm vào `ieltsAdvancedApi`:

```typescript
// --- Community Answers ---
getCommunityWritingAnswers: (promptId: string, params?: {
  page?: number;
  limit?: number;
  sortBy?: 'band' | 'date';
}) => {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.sortBy) q.set('sortBy', params.sortBy);
  const qs = q.toString();
  return apiClient.get<{ data: CommunityWritingAnswer[]; total: number }>(
    `/ielts/advanced/writing/prompts/${promptId}/community${qs ? `?${qs}` : ''}`
  );
},
getCommunityWritingAnswer: (promptId: string, sessionId: string) =>
  apiClient.get<CommunityWritingAnswer>(
    `/ielts/advanced/writing/prompts/${promptId}/community/${sessionId}`
  ),

getCommunitySpeakingAnswers: (partId: string, params?: {
  page?: number;
  limit?: number;
  sortBy?: 'band' | 'date';
}) => {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.sortBy) q.set('sortBy', params.sortBy);
  const qs = q.toString();
  return apiClient.get<{ data: CommunitySpeakingAnswer[]; total: number }>(
    `/ielts/advanced/speaking/parts/${partId}/community${qs ? `?${qs}` : ''}`
  );
},
getCommunitySpeakingAnswer: (partId: string, sessionId: string) =>
  apiClient.get<CommunitySpeakingAnswer>(
    `/ielts/advanced/speaking/parts/${partId}/community/${sessionId}`
  ),
```

**Subtasks:**
- [ ] Thêm 4 methods trên vào `ieltsAdvancedApi`
- [ ] Import types đúng

---

### Task 2.3 — Component: `CommunityAnswerCard`

**File mới:** `frontend-mobile/components/ielts/community/CommunityAnswerCard.tsx`

```
CommunityAnswerCard (Props: type, answer, onPress)
├── Header Row
│   ├── Avatar (Avatar atom, fallback initials)
│   ├── UserName + submittedAt (timeAgo)
│   └── BandScore badge (ScoreBadge atom)
├── Content Preview
│   ├── [Writing] essay excerpt — 3 dòng, cắt bằng numberOfLines={3}
│   └── [Speaking] "🎙 {N} audio answers" placeholder
├── Feedback Scores (nếu có)
│   └── 4 mini-badge: TA | CC | LR | GR (writing) / F | V | G | P (speaking)
└── "Xem đầy đủ →" button (TextButton style)
```

**Subtasks:**
- [ ] Tạo `CommunityAnswerCard.tsx`
- [ ] Implement `FeedbackScoreMini` sub-component (badge nhỏ với tên + điểm)
- [ ] Dùng `Avatar` atom với fallback initials
- [ ] Dùng `ScoreBadge` atom cho band score
- [ ] Support dark/light mode
- [ ] Skeleton variant cho loading

---

### Task 2.4 — Screen: `CommunityAnswersScreen` (Shared cho Writing & Speaking)

**File mới:** `frontend-mobile/app/ielts/advanced/community/[type]/[id].tsx`

Hoặc tách riêng:
- `frontend-mobile/app/ielts/advanced/writing/[promptId]/community.tsx`
- `frontend-mobile/app/ielts/advanced/speaking/[partId]/community.tsx`

> **Khuyến nghị:** Tách riêng vì data shape khác nhau, tránh over-abstraction.

**Cấu trúc màn hình Writing Community:**

```
WritingCommunityScreen (route: /ielts/advanced/writing/[promptId]/community)
├── Header
│   ├── Back button
│   ├── Title: "Community Essays"
│   └── Sort button (by Band / by Date)
├── SortMenu (Bottom sheet hoặc Modal)
├── FlatList<CommunityWritingAnswer>
│   ├── Item: CommunityAnswerCard (type="writing")
│   └── ListFooterComponent: loading more indicator
├── Empty state: "Chưa có bài viết nào. Hãy là người đầu tiên!"
└── Error state
```

**Cấu trúc màn hình Speaking Community:**

```
SpeakingCommunityScreen (route: /ielts/advanced/speaking/[partId]/community)
├── Header (tương tự Writing)
├── FlatList<CommunitySpeakingAnswer>
│   └── Item: CommunityAnswerCard (type="speaking")
├── Empty state
└── Error state
```

**Subtasks (Writing Community):**
- [ ] Tạo `frontend-mobile/app/ielts/advanced/writing/[promptId]/community.tsx`
- [ ] Implement sort state: `'band' | 'date'`, sort button ở header
- [ ] Pagination: `page` state, load-more khi scroll tới cuối FlatList (onEndReached)
- [ ] Pull-to-refresh
- [ ] Skeleton loading (5 `CommunityAnswerCard` skeletons)
- [ ] Empty state
- [ ] Error state với retry

**Subtasks (Speaking Community):**
- [ ] Tạo `frontend-mobile/app/ielts/advanced/speaking/[partId]/community.tsx`
- [ ] Logic tương tự writing nhưng fetch từ `getCommunitySpeakingAnswers`

---

### Task 2.5 — Screen: `CommunityAnswerDetailScreen` (Writing)

**File mới:** `frontend-mobile/app/ielts/advanced/writing/[promptId]/community/[sessionId].tsx`

Hiển thị toàn bộ bài viết của 1 người dùng:

```
WritingAnswerDetailScreen
├── Header (back, tên người dùng, band badge)
├── ScrollView
│   ├── PromptRecap Card — nhắc lại đề bài (lấy từ cache/params)
│   ├── EssaySection
│   │   └── Full essay text, selectable (TextWithLookup integration)
│   ├── FeedbackSection (nếu graded)
│   │   ├── Band breakdown (4 criteria với progress bars)
│   │   └── AI comments (collapsible)
│   └── Metadata (submitted at, time taken nếu có)
└── Bottom bar: "Xem bài của tôi" → navigate về result của chính mình
```

**Subtasks:**
- [ ] Tạo route file
- [ ] Implement `PromptRecapCard` sub-component (title, task type badge, prompt excerpt)
- [ ] `TextWithLookup` wrap essay text cho dictionary popup
- [ ] `BandBreakdownSection` component (4 criteria + overall)
- [ ] Collapsible AI comments (dùng `Animated.View` hoặc `BottomSheet`)

---

### Task 2.6 — Screen: `CommunityAnswerDetailScreen` (Speaking)

**File mới:** `frontend-mobile/app/ielts/advanced/speaking/[partId]/community/[sessionId].tsx`

```
SpeakingAnswerDetailScreen
├── Header
├── ScrollView
│   ├── PartRecap Card
│   ├── QuestionsSection — list câu hỏi với audio player mỗi câu
│   │   └── AudioPlayer atom cho từng audio URL
│   ├── FeedbackSection (4 criteria: F/V/G/P)
│   └── AI comments
└── Bottom bar
```

**Subtasks:**
- [ ] Tạo route file
- [ ] `AudioPlayer` component (dùng `expo-audio`, reuse `components/ui/AudioPlayer.tsx`)
- [ ] Map `audioAnswers` (Record<questionId, url>) thành list câu hỏi có audio
- [ ] Band breakdown cho speaking criteria

---

### Task 2.7 — Tích Hợp Vào Màn Hình Hiện Tại

**File:** `frontend-mobile/app/ielts/advanced/writing/[promptId].tsx`

Thêm nút "Community" vào header hoặc tab bar bên trong màn hình writing prompt detail:

```
// Trong header actions hoặc bottom tab
<TouchableOpacity
  onPress={() => router.push(`/ielts/advanced/writing/${promptId}/community`)}
>
  <Ionicons name="people-outline" />
  <Text>Community</Text>
</TouchableOpacity>
```

**File:** `frontend-mobile/app/ielts/advanced/speaking/[partId].tsx`

Tương tự — thêm nút/tab community.

**Subtasks:**
- [ ] Thêm community nav button vào writing prompt detail screen
- [ ] Thêm community nav button vào speaking part detail screen
- [ ] Đảm bảo navigation params đúng (promptId / partId)

---

### Task 2.8 — Folder & Barrel Export

```
frontend-mobile/components/ielts/community/
├── CommunityAnswerCard.tsx
├── FeedbackScoreMini.tsx   (sub-component, có thể inline)
└── index.ts
```

**Subtasks:**
- [ ] Tạo folder `components/ielts/community/`
- [ ] Tạo `index.ts` barrel

---

## Luồng Người Dùng (User Flow)

```
Advanced Writing Catalog
    └── [Chọn prompt]
          └── Writing Prompt Detail
                ├── [Start/Continue] → Writing Practice Screen
                ├── [My Answers] → History Screen
                └── [Community ✨] → Writing Community Screen
                                          └── [Chọn bài] → Essay Detail Screen
```

```
Advanced Speaking Catalog
    └── [Chọn part]
          └── Speaking Part Detail
                ├── [Start/Continue] → Speaking Practice Screen
                ├── [My Answers] → History Screen
                └── [Community ✨] → Speaking Community Screen
                                          └── [Chọn bài] → Audio Detail Screen
```

---

## Acceptance Criteria

- [ ] Writing Community Screen hiển thị danh sách bài viết với tên, avatar, band score, excerpt essay.
- [ ] Speaking Community Screen hiển thị danh sách với số audio answers và band score.
- [ ] Sort by Band / by Date hoạt động đúng.
- [ ] Pagination / infinite scroll tải thêm bài khi scroll.
- [ ] Detail screen writing hiển thị full essay có TextWithLookup.
- [ ] Detail screen speaking có audio player cho từng câu hỏi.
- [ ] Nút Community hiển thị từ writing/speaking detail screens.
- [ ] Empty state khi chưa có bài cộng đồng.
- [ ] Error state với retry.
- [ ] Dark mode đúng.

---

## Files Tạo Mới

```
frontend-mobile/components/ielts/community/CommunityAnswerCard.tsx
frontend-mobile/components/ielts/community/index.ts
frontend-mobile/app/ielts/advanced/writing/[promptId]/community.tsx
frontend-mobile/app/ielts/advanced/writing/[promptId]/community/[sessionId].tsx
frontend-mobile/app/ielts/advanced/speaking/[partId]/community.tsx
frontend-mobile/app/ielts/advanced/speaking/[partId]/community/[sessionId].tsx
```

## Files Sửa

```
frontend-mobile/types/index.ts
frontend-mobile/services/ielts.api.ts
frontend-mobile/app/ielts/advanced/writing/[promptId].tsx   — thêm community button
frontend-mobile/app/ielts/advanced/speaking/[partId].tsx    — thêm community button
```

---

## Rủi Ro & Lưu Ý

- **Privacy:** Backend cần confirm rằng community answers không lộ email/phone. Chỉ hiển thị `userName` và `userAvatar` (hoặc ẩn danh nếu user opt-out).
- **Audio playback Speaking:** URL audio trên GCS/Cloudinary cần có CORS header đúng cho `expo-audio` đọc được từ mobile client.
- **Band score null:** Nhiều bài chưa được graded (AI đang xử lý hoặc failed) → phải handle `bandScore: null` gracefully (hiện "Đang chấm" hoặc "—").
