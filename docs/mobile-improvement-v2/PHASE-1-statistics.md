# Phase 1 — Statistics Enhancement: Foundation & Basic Integration

**Ưu tiên:** 🔴 Cao  
**Ước tính:** 3–4 ngày  
**Phụ thuộc:** Không có

---

## Vấn Đề Hiện Tại

Màn hình `app/ielts/statistics.tsx` chỉ tổng hợp dữ liệu từ:
- `ieltsProfileApi.get()` — profile + target score
- `ieltsProfileApi.getStreak()` — streak
- `ieltsExamsApi.getHistory()` — intensive exam history
- `ieltsAdvancedApi.getListeningHistory()`, `getReadingHistory()`, `getStatistics()`

**Không gọi bất kỳ endpoint nào** trong nhóm `/ielts-statistics/*` mà web dùng đầy đủ:

| Endpoint | Dữ liệu | Mobile hiện tại |
|---|---|---|
| `GET /ielts-statistics/overview` | XP tuần, streak, điểm dự đoán, phân tích kỹ năng | ❌ |
| `GET /ielts-statistics/foundation` | Tiến độ vocab/grammar/pronunciation theo book | ❌ |
| `GET /ielts-statistics/basic` | Tiến độ theo kỹ năng L/R/W/S, lesson completion | ❌ |
| `GET /ielts-statistics/advanced` | Accuracy by question type (listening + reading) | ❌ (chỉ có từ `getStatistics`) |
| `GET /ielts-statistics/intensive` | Band scores, time taken, pass/fail history | ❌ (chỉ build thủ công) |

Hệ quả: người dùng mobile **không thấy** tiến độ Foundation Vocabulary/Grammar/Pronunciation và không thấy breakdown kỹ năng Basic.

---

## Mục Tiêu Phase 1

1. Thêm service `ieltsStatisticsApi` vào `services/ielts.api.ts` với 5 endpoint đầy đủ.
2. Refactor `app/ielts/statistics.tsx` để hiển thị **4 tab**: Overview · Foundation · Basic · Advanced+Intensive.
3. Thêm các component con phục vụ Foundation và Basic tab.

---

## Task Chi Tiết

### Task 1.1 — Khai báo Types

**File:** `frontend-mobile/types/index.ts` (hoặc `types/statistics.ts` nếu cần tách)

Thêm các interface sau (đồng bộ với `frontend-web/src/types/index.ts`):

```typescript
// ielts-statistics types
export interface IeltsOverviewStats {
  weeklyXp: number;
  currentStreak: number;
  longestStreak: number;
  predictedBand: number | null;
  skillAnalysis: {
    listening: number; reading: number; writing: number; speaking: number;
  };
  recentActivity: { date: string; type: string; score?: number }[];
  totalStudyTime: number; // minutes
}

export interface IeltsFoundationStats {
  vocabulary: {
    totalBooks: number;
    booksCompleted: number;
    totalWords: number;
    wordsLearned: number;
    progress: number; // 0-100
    books: {
      id: string; name: string; totalUnits: number;
      completedUnits: number; progress: number;
    }[];
  };
  grammar: {
    totalBooks: number;
    booksCompleted: number;
    progress: number;
    books: {
      id: string; name: string; slug: string;
      totalUnits: number; completedUnits: number; progress: number;
    }[];
  };
  pronunciation: {
    totalSounds: number;
    soundsPracticed: number;
    soundsMastered: number; // score >= 80
    averageScore: number;
    progress: number;
  };
}

export interface IeltsBasicStats {
  skills: {
    skill: string; // 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'
    totalLessons: number;
    completedLessons: number;
    totalExercises: number;
    completedExercises: number;
    progress: number;
    averageScore: number | null;
  }[];
  overallProgress: number;
  lastActivity: string | null;
}

export interface IeltsAdvancedStats {
  listening: { accuracy: Record<string, { correct: number; total: number; attempted: number }> };
  reading: { accuracy: Record<string, { correct: number; total: number; attempted: number }> };
  writing: { totalSessions: number; averageBand: number | null; lastSession: string | null };
  speaking: { totalSessions: number; averageBand: number | null; lastSession: string | null };
}

export interface IeltsIntensiveStats {
  totalExams: number;
  completedExams: number;
  averageBand: number | null;
  bandHistory: { date: string; band: number; examTitle: string }[];
  skillBreakdown: {
    listening: number | null; reading: number | null;
    writing: number | null; speaking: number | null;
  };
  bestBand: number | null;
  lastExamDate: string | null;
}
```

**Subtasks:**
- [ ] Thêm 5 interface trên vào `types/index.ts`
- [ ] Export đầy đủ từ barrel

---

### Task 1.2 — Thêm `ieltsStatisticsApi` vào Service Layer

**File:** `frontend-mobile/services/ielts.api.ts`

Thêm vào cuối file (sau `studentTeacherApi`):

```typescript
// ==================== IELTS STATISTICS ====================
export const ieltsStatisticsApi = {
  getOverview: () => apiClient.get<IeltsOverviewStats>('/ielts-statistics/overview'),
  getFoundation: () => apiClient.get<IeltsFoundationStats>('/ielts-statistics/foundation'),
  getBasic: () => apiClient.get<IeltsBasicStats>('/ielts-statistics/basic'),
  getAdvanced: () => apiClient.get<IeltsAdvancedStats>('/ielts-statistics/advanced'),
  getIntensive: () => apiClient.get<IeltsIntensiveStats>('/ielts-statistics/intensive'),
};
```

**File:** `frontend-mobile/services/index.ts`

Export `ieltsStatisticsApi` từ barrel.

**Subtasks:**
- [ ] Thêm `ieltsStatisticsApi` vào `ielts.api.ts`
- [ ] Import types đúng từ `../types`
- [ ] Export từ `services/index.ts`

---

### Task 1.3 — Refactor `statistics.tsx` — Cấu trúc Tab mới

**File:** `frontend-mobile/app/ielts/statistics.tsx`

**Hiện tại:** Màn hình single-scroll với BandChart + SubmissionVolumeSection + AdvancedStatsSection.

**Mục tiêu:** Thêm tab navigation **4 tabs**: Overview · Foundation · Basic · Advanced & Intensive.

Cấu trúc component mới:

```
StatisticsScreen
├── Header (giữ nguyên)
├── TabBar (4 tabs: Overview | Foundation | Basic | Advanced)
└── TabContent (ScrollView theo tab active)
    ├── OverviewTab        — dữ liệu từ getOverview() + streak hiện tại
    ├── FoundationTab      — dữ liệu từ getFoundation()
    ├── BasicTab           — dữ liệu từ getBasic()
    └── AdvancedTab        — dữ liệu từ getAdvanced() + getIntensive()
```

**Subtasks:**
- [ ] Thêm state `activeTab: 'overview' | 'foundation' | 'basic' | 'advanced'`
- [ ] Tạo `TabBar` component inline (dùng `Chip` atom hoặc custom tab pills, scroll ngang)
- [ ] Split logic fetch thành: `fetchOverview()`, `fetchFoundation()`, `fetchBasic()`, `fetchAdvanced()`
- [ ] Lazy-fetch: chỉ fetch tab data khi tab đó được active lần đầu (tránh N+1 requests khi mở màn hình)
- [ ] Giữ nguyên các section hiện tại (BandChart, AdvancedStatsSection) trong `AdvancedTab`
- [ ] Thêm `OverviewTab` content với overview stats

---

### Task 1.4 — Component: `FoundationTab`

**File mới:** `frontend-mobile/components/ielts/stats/FoundationStatsTab.tsx`

Nội dung hiển thị:

```
FoundationStatsTab
├── Section: Vocabulary
│   ├── Overall progress ring (ProgressCircle atom)
│   ├── "{wordsLearned} / {totalWords} từ đã học"
│   └── BookProgressList — mỗi book 1 row: tên + progress bar + %
├── Section: Grammar
│   ├── Overall progress ring
│   └── BookProgressList (tên book + completedUnits/totalUnits)
└── Section: Pronunciation
    ├── 3 stats cards: Tổng sounds | Đã luyện | Đã thành thạo
    ├── ProgressBar tổng thể
    └── Average score badge
```

**Subtasks:**
- [ ] Tạo file `FoundationStatsTab.tsx`
- [ ] Implement `BookProgressRow` sub-component (tên, progress bar NativeWind, badge %)
- [ ] Dùng `Skeleton` atom cho loading state (3 placeholder rows per section)
- [ ] Dùng `EmptyState` molecule nếu không có dữ liệu
- [ ] Support dark/light mode qua `useTheme()`
- [ ] Test trong `app/_dev/atom-gallery.tsx` với mock data

---

### Task 1.5 — Component: `BasicTab`

**File mới:** `frontend-mobile/components/ielts/stats/BasicStatsTab.tsx`

Nội dung hiển thị:

```
BasicStatsTab
├── Overall Progress Card
│   ├── Circular gauge tổng thể (0-100%)
│   └── Last activity date
└── Skill Grid (2x2)
    └── SkillCard × 4 (Listening | Reading | Writing | Speaking)
        ├── Icon + skill name
        ├── Lessons: X/Y completed
        ├── Exercises: X/Y completed
        ├── Progress bar
        └── Avg score badge (nếu có)
```

**Subtasks:**
- [ ] Tạo file `BasicStatsTab.tsx`
- [ ] Implement `SkillCard` sub-component với icon Ionicons theo skill
- [ ] Overall progress dùng `ProgressCircle` atom
- [ ] Skeleton loading state (4 skeleton cards)
- [ ] Empty state khi chưa có hoạt động Basic
- [ ] Test dark/light

---

### Task 1.6 — Component: `OverviewTab` (nâng cấp)

**File mới:** `frontend-mobile/components/ielts/stats/OverviewStatsTab.tsx`

Nội dung hiển thị (đồng bộ với web `OverviewTab`):

```
OverviewStatsTab
├── Weekly XP Card
│   └── Bar chart 7 ngày gần nhất (dùng SVG đơn giản như hiện tại)
├── Streak Card (currentStreak + longestStreak)
├── Predicted Band Card (gauge + label)
├── Skill Analysis Card
│   └── 4 progress bars: L / R / W / S với điểm dự đoán
└── Recent Activity Timeline
    └── List 5 activities gần nhất (type + date + score)
```

**Subtasks:**
- [ ] Tạo file `OverviewStatsTab.tsx`
- [ ] Weekly XP bar chart (SVG, giống `BandChart` hiện tại về style)
- [ ] `PredictedBandGauge` sub-component (arc SVG đơn giản, hoặc `ProgressCircle`)
- [ ] `SkillAnalysisBar` sub-component × 4
- [ ] `RecentActivityItem` sub-component (icon theo type, timestamp `timeAgo`)
- [ ] Skeleton loading

---

### Task 1.7 — Cập Nhật `AdvancedTab` (tích hợp Intensive)

**Mục tiêu:** Gộp data từ `getAdvanced()` và `getIntensive()` vào tab này. Giữ nguyên `BandChart`, `AdvancedStatsSection`, thêm Intensive sub-section.

**Subtasks:**
- [ ] Thêm `IntensiveStatsSection` với: total exams, avg band, best band, band history mini-chart
- [ ] Thêm `SkillBreakdownRow` cho kết quả bài thi (L/R/W/S band)
- [ ] Fetch `ieltsStatisticsApi.getIntensive()` song song với `getAdvanced()`

---

### Task 1.8 — Folder & Barrel Export

```
frontend-mobile/components/ielts/stats/
├── FoundationStatsTab.tsx    (Task 1.4)
├── BasicStatsTab.tsx         (Task 1.5)
├── OverviewStatsTab.tsx      (Task 1.6)
└── index.ts                  (re-export)
```

**Subtasks:**
- [ ] Tạo folder `components/ielts/stats/`
- [ ] Tạo `index.ts` barrel

---

## Acceptance Criteria

- [ ] Màn hình Statistics có 4 tab điều hướng được, scroll ngang nếu màn hình nhỏ.
- [ ] Foundation tab hiển thị đúng số sách/từ vựng/bài ngữ pháp/âm phát âm.
- [ ] Basic tab hiển thị đúng tiến độ 4 kỹ năng.
- [ ] Overview tab hiển thị XP tuần + streak + skill analysis.
- [ ] Advanced tab giữ nguyên tính năng cũ + thêm Intensive section.
- [ ] Tất cả tabs có loading skeleton và error state.
- [ ] Không gọi tất cả 5 API cùng lúc khi mở màn hình — lazy load theo tab active.
- [ ] Dark mode đúng.
- [ ] TypeScript không có lỗi mới.

---

## Files Tạo Mới

```
frontend-mobile/components/ielts/stats/FoundationStatsTab.tsx
frontend-mobile/components/ielts/stats/BasicStatsTab.tsx
frontend-mobile/components/ielts/stats/OverviewStatsTab.tsx
frontend-mobile/components/ielts/stats/index.ts
```

## Files Sửa

```
frontend-mobile/types/index.ts                  — thêm 5 stats interfaces
frontend-mobile/services/ielts.api.ts           — thêm ieltsStatisticsApi
frontend-mobile/services/index.ts              — export ieltsStatisticsApi
frontend-mobile/app/ielts/statistics.tsx        — refactor tab structure + lazy fetch
```
