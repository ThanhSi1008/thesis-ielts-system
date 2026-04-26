# Coding Guidelines — IELTS Master AI Mobile App

> Source of Truth cho team phát triển | Stack: Expo SDK 52 · TypeScript · NativeWind v4 · Zustand v5 · TanStack Query v5
> Cập nhật: 2026-04-26

---

## 1. Naming Conventions

### 1.1. File & Folder

| Ngữ cảnh | Convention | Ví dụ |
|:---|:---|:---|
| Route files (`app/`) | **kebab-case** (yêu cầu bởi expo-router) | `app/vocab-lab/study/[deckId].tsx` |
| Components | **PascalCase** | `features/ielts/components/QuestionCard.tsx` |
| Hooks | **camelCase** với prefix `use` | `features/vocabulary/hooks/useBookDetail.ts` |
| Types | **kebab-case** hoặc **domain.types.ts** | `core/types/exam.types.ts` |
| Utils / helpers | **camelCase** | `features/vocab-lab/utils/formatDueDate.ts` |
| Constants | **camelCase** file, **SCREAMING_SNAKE** biến | `core/config/env.ts` → `API_BASE_URL` |
| Store files | **camelCase** với prefix `use` | `core/auth/useAuthStore.ts` |

**DO:**
```
features/
  vocabulary/
    components/
      BookCard.tsx          ← PascalCase (React component)
      WordList.tsx
    hooks/
      useBookDetail.ts      ← camelCase + "use" prefix
      useUnitProgress.ts
    screens/
      BookListScreen.tsx    ← PascalCase + "Screen" suffix
    types.ts

app/
  vocabulary/
    [bookId].tsx            ← kebab-case, bracket cho dynamic route
  vocab-lab/
    study/
      [deckId].tsx
```

**DON'T:**
```
features/
  vocabulary/
    components/
      book-card.tsx         ❌ kebab-case cho component
      bookCard.tsx          ❌ camelCase cho component
    hooks/
      BookDetail.ts         ❌ PascalCase cho hook
      getBookDetail.ts      ❌ Thiếu prefix "use"
```

### 1.2. Component, Hook, Type, Constant, Event Handler

```typescript
// ── Components: PascalCase ──
export function QuestionCard({ question }: QuestionCardProps) {}
export const ExamTimer = React.memo(({ seconds }: ExamTimerProps) => {});

// ── Hooks: camelCase + "use" prefix ──
export function useExamSession(examId: string) {}
export function useAttemptResult(attemptId: string | null) {}

// ── Interfaces: PascalCase + suffix rõ ràng ──
interface QuestionCardProps {}       // Component props → suffix "Props"
interface ExamListScreenParams {}    // Screen params → suffix "Params"

// ── Types: PascalCase ──
type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING';
type ExamType = 'FULL_TEST' | 'READING' | 'LISTENING';

// ── Constants: SCREAMING_SNAKE_CASE ──
const MAX_RETRY_COUNT = 3;
const POLL_INTERVAL_MS = 2000;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// ── Event Handlers: "handle" + Action ──
const handleSubmitAnswer = () => {};
const handlePressCard = (id: string) => {};
const handleStartRecording = async () => {};

// ❌ DON'T: callback props dùng "on" prefix thay vì "handle"
// Props interface:
interface QuestionCardProps {
  onPress: (id: string) => void;    // ✅ "on" prefix cho props
  onAnswerSelect: (answer: string) => void;
}
// Component nội bộ:
function QuestionCard({ onPress }: QuestionCardProps) {
  const handlePress = () => onPress(question.id);  // ✅ "handle" cho internal
}
```

---

## 2. React Native & Performance Best Practices

### 2.1. Chống Re-render

**Quy tắc #1: KHÔNG truyền inline function/object vào list items**

```typescript
// ❌ DON'T — Tạo mới function/object mỗi lần render
function ExamList({ exams }: { exams: Exam[] }) {
  return (
    <FlashList
      data={exams}
      renderItem={({ item }) => (
        <ExamCard
          exam={item}
          onPress={() => router.push(`/ielts/intensive/${item.id}`)}  // ❌ inline
          style={{ marginBottom: 12 }}  // ❌ inline object
        />
      )}
      estimatedItemSize={120}
    />
  );
}

// ✅ DO — Memoize callback, extract style
const cardStyle = { marginBottom: 12 };  // hoặc NativeWind className

function ExamList({ exams }: { exams: Exam[] }) {
  const handlePressExam = useCallback((id: string) => {
    router.push(`/ielts/intensive/${id}`);
  }, []);

  const renderExam = useCallback(({ item }: { item: Exam }) => (
    <ExamCard
      exam={item}
      onPress={handlePressExam}
      style={cardStyle}
    />
  ), [handlePressExam]);

  return (
    <FlashList
      data={exams}
      renderItem={renderExam}
      estimatedItemSize={120}
    />
  );
}
```

**Quy tắc #2: `React.memo` cho list items và pure components**

```typescript
// ✅ DO — Memo hóa component con trong danh sách
export const ExamCard = React.memo(function ExamCard({
  exam,
  onPress,
}: ExamCardProps) {
  const handlePress = useCallback(() => onPress(exam.id), [exam.id, onPress]);

  return (
    <Pressable onPress={handlePress} className="bg-white rounded-xl p-4 mb-3">
      <AppText className="text-lg font-bold">{exam.title}</AppText>
      <AppText className="text-sm text-gray-500">{exam.description}</AppText>
    </Pressable>
  );
});
```

**Quy tắc #3: Khi nào dùng `useMemo`**

```typescript
// ✅ DO — useMemo cho derived data / expensive computation
function ExamResultScreen({ sessionId }: { sessionId: string }) {
  const { data: result } = useExamResult(sessionId);

  // Tính toán phức tạp → useMemo
  const scoreBreakdown = useMemo(() => {
    if (!result) return null;
    return {
      reading: calculateBand(result.readingScore),
      listening: calculateBand(result.listeningScore),
      overall: calculateOverallBand(result),
    };
  }, [result]);

  // Lọc/sort danh sách → useMemo
  const sortedQuestions = useMemo(
    () => questions.slice().sort((a, b) => a.order - b.order),
    [questions]
  );
}

// ❌ DON'T — useMemo cho giá trị đơn giản (overhead > benefit)
const title = useMemo(() => `Exam: ${exam.title}`, [exam.title]);  // ❌ Không cần
```

### 2.2. FlashList thay FlatList

**Quy tắc: BẮT BUỘC dùng `FlashList` cho mọi danh sách > 20 items.**

```typescript
import { FlashList } from '@shopify/flash-list';

// ✅ DO
function QuestionList({ questions }: { questions: ExamQuestion[] }) {
  const renderItem = useCallback(({ item }: { item: ExamQuestion }) => (
    <QuestionCard question={item} />
  ), []);

  return (
    <FlashList
      data={questions}
      renderItem={renderItem}
      estimatedItemSize={150}        // ⚠️ BẮT BUỘC — ước lượng height trung bình
      keyExtractor={keyExtractor}
      getItemType={(item) => item.type}  // Tối ưu recycling theo question type
    />
  );
}

// Key extractor tách riêng, không inline
const keyExtractor = (item: ExamQuestion) => item.id;

// ❌ DON'T
<FlatList ... />  // ❌ Không dùng FlatList cho danh sách dài
<FlashList data={data} renderItem={...} />  // ❌ Thiếu estimatedItemSize
```

### 2.3. Component `<AppText>` — Không dùng `<Text>` trực tiếp

**Quy tắc: KHÔNG import `Text` từ `react-native` trong feature code.** Luôn dùng `<AppText>`.

```typescript
// ✅ DO — components/ui/AppText.tsx
import { Text, type TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  className?: string;
  variant?: 'body' | 'caption' | 'heading' | 'label';
}

export function AppText({
  className = '',
  variant = 'body',
  children,
  ...props
}: AppTextProps) {
  const variantClass = {
    body: 'text-base text-dark',
    caption: 'text-sm text-gray-500',
    heading: 'text-xl font-bold text-dark',
    label: 'text-sm font-semibold text-gray-700',
  }[variant];

  return (
    <Text className={`font-sans ${variantClass} ${className}`} {...props}>
      {children}
    </Text>
  );
}
```

```typescript
// ✅ DO — Sử dụng trong feature code
import { AppText } from '@/components/ui/AppText';

<AppText variant="heading">Unit 1: Present Tenses</AppText>
<AppText className="text-primary font-bold">{score}%</AppText>

// ❌ DON'T
import { Text } from 'react-native';
<Text style={{ fontSize: 16, color: '#212529' }}>Hello</Text>
```

---

## 3. Architecture & State Management Rules

### 3.1. Thin Route, Fat Feature

**Quy tắc: File trong `app/` KHÔNG chứa business logic, data fetching, hay state management.**

```typescript
// ✅ DO — app/vocabulary/[bookId].tsx (ROUTE — tối đa 10 dòng)
import { useLocalSearchParams } from 'expo-router';
import { BookDetailScreen } from '@/features/vocabulary/screens/BookDetailScreen';

export default function BookDetailRoute() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  return <BookDetailScreen bookId={bookId!} />;
}

// ❌ DON'T — app/vocabulary/[bookId].tsx
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';

export default function BookDetailRoute() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { data, isLoading } = useQuery({           // ❌ Data fetching trong route
    queryKey: ['vocabulary', 'book', bookId],
    queryFn: () => apiClient.get(`/vocabulary/books/${bookId}`),
  });

  if (isLoading) return <ActivityIndicator />;      // ❌ UI logic trong route
  return (
    <ScrollView>                                     {/* ❌ Layout trong route */}
      {data.units.map(unit => (
        <UnitCard key={unit.id} unit={unit} />
      ))}
    </ScrollView>
  );
}
```

### 3.2. Phân định ranh giới State

| Loại State | Công cụ | Khi nào dùng | Ví dụ |
|:---|:---|:---|:---|
| **Server State** | TanStack Query | Dữ liệu từ API, cần cache/sync/retry | Danh sách exams, vocabulary books, flashcards |
| **Global Client State** | Zustand | State chia sẻ giữa nhiều screens, persist | Auth user, theme, audio player state |
| **Local UI State** | `useState` | State chỉ thuộc về 1 component | Form input, modal visibility, selected tab |

```typescript
// ✅ Server State → TanStack Query
function useExamCatalog() {
  return useQuery({
    queryKey: ['exams', 'catalog'],
    queryFn: () => apiClient.get<Exam[]>('/exams'),
    staleTime: 5 * 60_000,
  });
}

// ✅ Global Client State → Zustand
// core/auth/useAuthStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, token) => set({ user, accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => mmkvStorage) }
  )
);

// ✅ Local UI State → useState
function ExamScreen() {
  const [selectedTab, setSelectedTab] = useState<'reading' | 'listening'>('reading');
  const [isTimerVisible, setIsTimerVisible] = useState(true);
}

// ❌ DON'T — Server data trong Zustand
const useExamStore = create((set) => ({
  exams: [],                           // ❌ Server data thuộc TanStack Query
  fetchExams: async () => {            // ❌ Fetch logic thuộc useQuery
    const exams = await apiClient.get('/exams');
    set({ exams });
  },
}));

// ❌ DON'T — Global state cho local-only data
const useAuthStore = create((set) => ({
  isPasswordVisible: false,            // ❌ Chỉ dùng ở LoginScreen → useState
}));
```

### 3.3. TanStack Query — Key Conventions

```typescript
// ✅ DO — Factory pattern cho query keys
export const vocabularyKeys = {
  all:    ['vocabulary'] as const,
  books:  () => [...vocabularyKeys.all, 'books'] as const,
  book:   (id: string) => [...vocabularyKeys.all, 'book', id] as const,
  units:  (bookId: string) => [...vocabularyKeys.all, 'units', bookId] as const,
};

// Sử dụng:
useQuery({ queryKey: vocabularyKeys.book(bookId), ... });

// Invalidate toàn bộ vocabulary cache:
queryClient.invalidateQueries({ queryKey: vocabularyKeys.all });

// ❌ DON'T — String keys thủ công
useQuery({ queryKey: ['vocab-book-detail', bookId], ... });  // ❌ Không có hierarchy
```

---

## 4. TypeScript Strictness

### 4.1. Tuyệt đối KHÔNG dùng `any`

```typescript
// ❌ DON'T
const parseExamData = (data: any) => { ... };
const feedback = result.feedback as any;

// ✅ DO — Dùng `unknown` + type guard
function parseJsonField<T>(raw: unknown, validator: (v: unknown) => v is T): T | null {
  if (validator(raw)) return raw;
  console.warn('Invalid JSON structure:', raw);
  return null;
}

// ✅ DO — Type guard cho JSON fields từ Backend
function isExamQuestion(value: unknown): value is ExamQuestion {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'text' in value
  );
}

// ✅ DO — Parse JSON field an toàn
function useExamQuestions(examId: string) {
  return useQuery({
    queryKey: examKeys.questions(examId),
    queryFn: () => apiClient.get<Exam>(`/exams/${examId}`),
    select: (exam) => {
      const questions = exam.questions as unknown;  // JSON field
      if (!Array.isArray(questions)) return [];
      return questions.filter(isExamQuestion);      // Type-safe filtering
    },
  });
}
```

### 4.2. `interface` vs `type`

**Quy tắc:**

| Dùng `interface` | Dùng `type` |
|:---|:---|
| Object shapes (props, API response, models) | Unions, intersections, mapped types |
| Khi cần `extends` / declaration merging | Primitive aliases, tuple types |
| Mặc định cho hầu hết trường hợp | Khi `interface` không đủ diễn đạt |

```typescript
// ✅ interface — Object shapes, props, models
interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface ExamCardProps {
  exam: Exam;
  onPress: (id: string) => void;
}

// Kế thừa
interface AdminUser extends User {
  permissions: string[];
}

// ✅ type — Unions, computed, utility
type UserRole = 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'COMPLETED';
type CardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';

type FSRSRating = 1 | 2 | 3 | 4;

type ApiResponse<T> = {
  data: T;
  meta: PaginationMeta;
};

// Mapped / conditional
type Nullable<T> = T | null;
type PartialExam = Partial<Exam>;

// ❌ DON'T — type cho simple object (dùng interface)
type UserProps = {    // ❌ Nên dùng interface
  name: string;
  age: number;
};
```

### 4.3. Enum vs Union Type

**Quy tắc: ƯU TIÊN dùng `const` object + Union type thay vì `enum`.**

```typescript
// ❌ DON'T — enum (tạo runtime code, tăng bundle size)
enum SessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  GRADING = 'GRADING',
}

// ✅ DO — const object + as const + type extraction
const SESSION_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  GRADING: 'GRADING',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
} as const;

type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
// → 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'COMPLETED' | 'ABANDONED'

// Hoặc đơn giản hơn nếu không cần const object:
type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADING' | 'COMPLETED';
```

---

## 5. NativeWind Styling

### 5.1. Quy tắc viết `className`

**Quy tắc #1: Tối đa 5-6 classes trên 1 dòng.** Nếu dài hơn, tách bằng biến hoặc template literal.

```typescript
// ✅ DO — Ngắn gọn, dễ đọc
<View className="flex-1 bg-white p-4">
  <AppText className="text-lg font-bold text-dark">Title</AppText>
</View>

// ✅ DO — Dài → tách ra biến
const cardContainer = 'bg-white rounded-2xl p-4 shadow-sm border border-gray-100';
const cardTitle = 'text-lg font-bold text-dark mb-1';
const cardSubtitle = 'text-sm text-gray-500 leading-5';

function ExamCard({ exam }: ExamCardProps) {
  return (
    <View className={cardContainer}>
      <AppText className={cardTitle}>{exam.title}</AppText>
      <AppText className={cardSubtitle}>{exam.description}</AppText>
    </View>
  );
}

// ❌ DON'T — Dàn hết trên 1 dòng
<View className="flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3 mx-4">
```

**Quy tắc #2: Conditional classes dùng template literal hoặc `clsx`.**

```typescript
import { clsx } from 'clsx';

// ✅ DO
<Pressable
  className={clsx(
    'rounded-xl px-4 py-3',
    isActive ? 'bg-primary' : 'bg-gray-100',
    isDisabled && 'opacity-50'
  )}
/>

// ✅ DO — Template literal cho trường hợp đơn giản
<View className={`rounded-xl p-4 ${isSelected ? 'border-2 border-primary' : 'border border-gray-200'}`} />

// ❌ DON'T — Ternary lồng nhau trong className
<View className={`p-4 ${a ? (b ? 'bg-red' : 'bg-blue') : (c ? 'bg-green' : 'bg-gray')}`} />
```

### 5.2. Tổ chức styles cho component phức tạp

```typescript
// ✅ DO — Tách styles vào object riêng đầu file hoặc cuối file
const styles = {
  container: 'flex-1 bg-white',
  header: 'flex-row items-center justify-between px-4 py-3 border-b border-gray-100',
  headerTitle: 'text-xl font-bold text-dark',
  body: 'flex-1 px-4 pt-4',
  footer: 'px-4 py-3 border-t border-gray-100',
  submitButton: 'bg-primary rounded-xl py-4 items-center',
  submitButtonText: 'text-white font-bold text-base',
  submitButtonDisabled: 'bg-gray-300',
} as const;

function ExamScreen({ examId }: { examId: string }) {
  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <AppText className={styles.headerTitle}>IELTS Reading</AppText>
      </View>
      <View className={styles.body}>
        {/* content */}
      </View>
      <View className={styles.footer}>
        <Pressable
          className={clsx(styles.submitButton, isDisabled && styles.submitButtonDisabled)}
          disabled={isDisabled}
          onPress={handleSubmit}
        >
          <AppText className={styles.submitButtonText}>Submit</AppText>
        </Pressable>
      </View>
    </View>
  );
}
```

### 5.3. KHÔNG trộn StyleSheet và NativeWind

```typescript
// ❌ DON'T — Trộn 2 hệ thống
<View className="p-4" style={{ backgroundColor: COLORS.primary }}>  // ❌

// ✅ DO — Chỉ dùng NativeWind
<View className="p-4 bg-primary">

// Ngoại lệ duy nhất: dynamic values không thể biểu diễn bằng class
// (ví dụ: animated values, computed dimensions)
<Animated.View className="rounded-xl" style={{ transform: [{ scale: animatedScale }] }} />
```

---

## Phụ Lục: Quick Reference

### Import Order

```typescript
// 1. React / React Native
import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, ScrollView } from 'react-native';

// 2. Third-party libraries
import { useQuery, useMutation } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { clsx } from 'clsx';

// 3. Core / shared
import { apiClient } from '@/core/api/client';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { AppText } from '@/components/ui/AppText';

// 4. Feature-local
import { useBookDetail } from '../hooks/useBookDetail';
import { UnitCard } from '../components/UnitCard';
import type { VocabularyBook } from '../types';
```

### File Template — Feature Hook

```typescript
// features/{domain}/hooks/use{Entity}.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import type { EntityType } from '../types';

// Query key factory — co-located with hook
export const entityKeys = {
  all:  ['entity'] as const,
  list: () => [...entityKeys.all, 'list'] as const,
  detail: (id: string) => [...entityKeys.all, 'detail', id] as const,
};

export function useEntityDetail(id: string) {
  return useQuery({
    queryKey: entityKeys.detail(id),
    queryFn: () => apiClient.get<EntityType>(`/entity/${id}`),
    staleTime: 5 * 60_000,
    enabled: !!id,
  });
}
```

### File Template — Feature Screen

```typescript
// features/{domain}/screens/{Entity}Screen.tsx
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ErrorView } from '@/components/feedback/ErrorView';
import { useEntityDetail } from '../hooks/useEntityDetail';

interface EntityScreenProps {
  entityId: string;
}

export function EntityScreen({ entityId }: EntityScreenProps) {
  const { data, isLoading, error } = useEntityDetail(entityId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error.message} />;
  if (!data) return null;

  return (
    <View className="flex-1 bg-white">
      <AppText variant="heading">{data.title}</AppText>
    </View>
  );
}
```

---

*Vi phạm các quy tắc trên sẽ bị từ chối trong Code Review. Mọi ngoại lệ phải được ghi chú bằng comment `// GUIDELINE_EXCEPTION: <lý do>` và được Tech Lead approve.*
