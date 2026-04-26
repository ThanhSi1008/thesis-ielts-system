# Code Review Workflow — IELTS Master AI Mobile App

> Quy trình review code chuẩn cho team Mobile | Dựa trên `RULES.md` (SOLID) + `SKILL.md` (Coding Guidelines)
> Áp dụng từ: Phase 2 — Code Implementation

---

## 1. Tổng Quan Quy Trình

```
Developer viết code
        │
        ▼
   Self-Review (Checklist bên dưới)
        │
        ▼
   Tạo Pull Request (PR)
        │
        ▼
  Reviewer nhận PR ──────────────────────────────┐
        │                                         │
        ▼                                         │
  Review theo 5 tiêu chí (Mục 2)                 │
        │                                         │
   ┌────┴────┐                                    │
   │         │                                    │
PASS    NEEDS WORK                                │
   │         │                                    │
   ▼         ▼                                    │
 Merge    Developer fix ──► Re-submit ────────────┘
```

**Quy tắc PR:**
- Mỗi PR tối đa **~300 dòng thay đổi** (không tính auto-generated)
- Title PR theo format: `[feature/domain] Mô tả ngắn` (ví dụ: `[vocab-lab] Add study session screen`)
- PR phải pass TypeScript compiler (`tsc --noEmit`) trước khi request review

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

**Ví dụ phát hiện — SRP + Thin Route:**

```typescript
// ❌ PHÁT HIỆN: Route file chứa business logic
// File: app/ielts/intensive/[examId].tsx

import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';   // ← 🔴 Data fetching trong route
import { useState } from 'react';
import { apiClient } from '@/core/api/client';

export default function ExamRoute() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);  // ← 🔴 State logic
  const { data, isLoading } = useQuery({                      // ← 🔴 Query trong route
    queryKey: ['exam', examId],
    queryFn: () => apiClient.get(`/exams/${examId}`),
  });

  if (isLoading) return <ActivityIndicator />;                 // ← 🔴 UI logic

  return (
    <View className="flex-1">
      {/* 100+ dòng JSX */}
    </View>
  );
}
```

**Refactor bắt buộc:**

```typescript
// ✅ AFTER: app/ielts/intensive/[examId].tsx (Route — 5 dòng)
import { useLocalSearchParams } from 'expo-router';
import { ExamScreen } from '@/features/ielts/screens/ExamScreen';

export default function ExamRoute() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  return <ExamScreen examId={examId!} />;
}

// ✅ AFTER: features/ielts/hooks/useExamDetail.ts (Hook — data fetching)
export const examKeys = {
  all:    ['exams'] as const,
  detail: (id: string) => [...examKeys.all, 'detail', id] as const,
};

export function useExamDetail(examId: string) {
  return useQuery({
    queryKey: examKeys.detail(examId),
    queryFn: () => apiClient.get<Exam>(`/exams/${examId}`),
    staleTime: 5 * 60_000,
  });
}

// ✅ AFTER: features/ielts/screens/ExamScreen.tsx (Screen — UI only)
export function ExamScreen({ examId }: { examId: string }) {
  const { data, isLoading, error } = useExamDetail(examId);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error.message} />;
  if (!data) return null;

  return (
    <View className="flex-1 bg-white">
      <QuestionCard question={data.questions[currentQuestion]} />
    </View>
  );
}
```

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

**Ví dụ phát hiện — Inline function + thiếu memo:**

```typescript
// ❌ PHÁT HIỆN: Inline function trong FlashList
// File: features/vocabulary/screens/BookListScreen.tsx

function BookListScreen() {
  const { data: books } = useVocabularyBooks();

  return (
    <FlashList
      data={books}
      renderItem={({ item }) => (                       // ← 🔴 Inline renderItem
        <Pressable
          onPress={() => router.push(`/vocabulary/${item.id}`)}  // ← 🔴 Inline function
          className="bg-white rounded-xl p-4 mb-3"
        >
          <AppText className="text-lg font-bold">{item.name}</AppText>
          <AppText className="text-sm text-gray-500">{item.wordCount} từ</AppText>
        </Pressable>
      )}
      estimatedItemSize={80}
    />
  );
}
```

**Refactor bắt buộc:**

```typescript
// ✅ AFTER — Tách component + memoize

// features/vocabulary/components/BookCard.tsx
interface BookCardProps {
  id: string;
  name: string;
  wordCount: number;
  onPress: (id: string) => void;
}

export const BookCard = React.memo(function BookCard({
  id, name, wordCount, onPress,
}: BookCardProps) {
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  return (
    <Pressable onPress={handlePress} className="bg-white rounded-xl p-4 mb-3">
      <AppText className="text-lg font-bold">{name}</AppText>
      <AppText className="text-sm text-gray-500">{wordCount} từ</AppText>
    </Pressable>
  );
});

// features/vocabulary/screens/BookListScreen.tsx
const keyExtractor = (item: VocabularyBook) => item.id;

function BookListScreen() {
  const { data: books, isLoading, error } = useVocabularyBooks();

  const handlePressBook = useCallback((id: string) => {
    router.push(`/vocabulary/${id}`);
  }, []);

  const renderBook = useCallback(({ item }: { item: VocabularyBook }) => (
    <BookCard
      id={item.id}
      name={item.name}
      wordCount={item.wordCount}
      onPress={handlePressBook}
    />
  ), [handlePressBook]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error.message} />;

  return (
    <FlashList
      data={books}
      renderItem={renderBook}
      keyExtractor={keyExtractor}
      estimatedItemSize={80}
    />
  );
}
```

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

**Ví dụ phát hiện — `any` trên JSON field:**

```typescript
// ❌ PHÁT HIỆN: Dùng `any` để parse JSON phức tạp
// File: features/ielts/hooks/useExamSession.ts

export function useExamSession(examId: string) {
  return useQuery({
    queryKey: examKeys.detail(examId),
    queryFn: () => apiClient.get(`/exams/${examId}`),
    select: (data: any) => ({                    // ← 🔴 `any` parameter
      title: data.title,
      questions: data.questions as any[],        // ← 🔴 `as any[]`
      duration: data.duration,
    }),
  });
}
```

**Refactor bắt buộc:**

```typescript
// ✅ AFTER — Type-safe với interface + type guard

// core/types/exam.types.ts
interface Exam {
  id: string;
  title: string;
  duration: number;
  type: ExamType;
  questions: unknown;  // JSON field — treat as unknown
}

interface ExamQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching';
  text: string;
  options?: string[];
  correctAnswer: string;
  section?: string;
  audioUrl?: string;
}

// features/ielts/utils/typeGuards.ts
export function isExamQuestion(value: unknown): value is ExamQuestion {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'text' in value
  );
}

// features/ielts/hooks/useExamSession.ts
export function useExamSession(examId: string) {
  return useQuery({
    queryKey: examKeys.detail(examId),
    queryFn: () => apiClient.get<Exam>(`/exams/${examId}`),
    select: (exam): ExamSessionData => {
      const rawQuestions = exam.questions as unknown;
      const questions = Array.isArray(rawQuestions)
        ? rawQuestions.filter(isExamQuestion)
        : [];

      return { title: exam.title, questions, duration: exam.duration };
    },
  });
}
```

---

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

**Ví dụ phát hiện — className quá dài + trộn styles:**

```typescript
// ❌ PHÁT HIỆN: className lộn xộn + trộn StyleSheet
// File: features/ielts/components/ExamCard.tsx

import { Text } from 'react-native';  // ← 🟡 Dùng Text trực tiếp

function ExamCard({ exam }: { exam: Exam }) {
  return (
    <Pressable
      className="flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3 mx-4"  // ← 🟡 Quá dài
      style={{ elevation: 3 }}  // ← 🔴 Trộn style
    >
      <Text className="text-lg font-bold" style={{ color: '#212529' }}>  {/* ← 🔴 Trộn */}
        {exam.title}
      </Text>
      <Text className={`text-sm ${exam.type === 'FULL_TEST' ? (exam.difficulty === 'ADVANCED' ? 'text-red-500' : 'text-blue-500') : 'text-gray-500'}`}>  {/* ← 🟡 Nested ternary */}
        {exam.type}
      </Text>
    </Pressable>
  );
}
```

**Refactor bắt buộc:**

```typescript
// ✅ AFTER — Tách styles + AppText + clsx

import { AppText } from '@/components/ui/AppText';
import { clsx } from 'clsx';

const styles = {
  container: 'flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 mx-4',
  containerShadow: 'shadow-sm border border-gray-100',
  title: 'text-lg font-bold text-dark',
} as const;

const TYPE_COLOR: Record<string, string> = {
  FULL_TEST: 'text-primary',
  READING: 'text-blue-500',
  LISTENING: 'text-green-500',
  DEFAULT: 'text-gray-500',
};

function ExamCard({ exam }: { exam: Exam }) {
  const typeColor = TYPE_COLOR[exam.type] ?? TYPE_COLOR.DEFAULT;

  return (
    <Pressable className={clsx(styles.container, styles.containerShadow)}>
      <AppText className={styles.title}>{exam.title}</AppText>
      <AppText className={clsx('text-sm', typeColor)}>{exam.type}</AppText>
    </Pressable>
  );
}
```

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

**Ví dụ phát hiện — Thiếu error handling:**

```typescript
// ❌ PHÁT HIỆN: Không handle loading/error
// File: features/shadowing/screens/LessonListScreen.tsx

function LessonListScreen() {
  const { data } = useShadowingLessons();   // ← 🔴 Bỏ qua isLoading, error

  return (
    <FlashList
      data={data}                            // ← 🔴 data có thể undefined → crash
      renderItem={renderLesson}
      estimatedItemSize={100}
    />
  );
}
```

**Refactor bắt buộc:**

```typescript
// ✅ AFTER — Early Return + đầy đủ states

function LessonListScreen() {
  const { data, isLoading, error } = useShadowingLessons();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error.message} onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title="Chưa có bài shadowing nào" />;

  return (
    <FlashList
      data={data}
      renderItem={renderLesson}
      keyExtractor={keyExtractor}
      estimatedItemSize={100}
    />
  );
}
```

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

---

*Tài liệu này là quy trình bắt buộc áp dụng từ Phase 2. Mọi PR không tuân thủ quy trình review sẽ bị reject tự động.*
