# RULES.md — SOLID & Clean Code Principles

> Quy chuẩn thiết kế code cho IELTS Master AI Mobile App
> Stack: Expo SDK 52 · TypeScript · Feature-First Architectural Patterns · Zustand · TanStack Query

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

### BAD — Fat Component

```typescript
// ❌ Component vừa fetch data, vừa xử lý logic, vừa render UI
export default function VocabLabScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // ❌ Data fetching nằm trong component
  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        const response = await fetch(`${API_URL}/vocab-lab/decks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setDecks(data);
      } catch (err) {
        setError('Failed to load decks');
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  // ❌ Business logic nằm trong component
  const handleReview = async (rating: number) => {
    const card = studyCards[currentIndex];
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await fetch(`${API_URL}/vocab-lab/review`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flashcardId: card.id, rating }),
      });
      if (currentIndex < studyCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Review failed');
    }
  };

  // ❌ 200+ dòng JSX phức tạp bên dưới...
  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;

  return (
    <View>
      {/* ... hàng trăm dòng JSX ... */}
    </View>
  );
}
```

### GOOD — Tách Hook + UI

```typescript
// ✅ Hook chịu trách nhiệm data fetching (1 lý do thay đổi: API)
// features/vocab-lab/hooks/useDecks.ts
export function useDecks() {
  return useQuery({
    queryKey: vocabLabKeys.decks(),
    queryFn: () => apiClient.get<Deck[]>('/vocab-lab/decks'),
    staleTime: 5 * 60_000,
  });
}

// ✅ Hook chịu trách nhiệm study logic (1 lý do thay đổi: business logic)
// features/vocab-lab/hooks/useStudySession.ts
export function useStudySession(deckId: string) {
  const studyCards = useQuery({
    queryKey: vocabLabKeys.study(deckId),
    queryFn: () => apiClient.get<Flashcard[]>(`/vocab-lab/study/${deckId}`),
  });

  const reviewMutation = useMutation({
    mutationFn: (dto: SubmitReviewDto) => apiClient.post('/vocab-lab/review', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabLabKeys.decks() });
    },
  });

  return { studyCards, reviewMutation };
}

// ✅ Screen chỉ chịu trách nhiệm render (1 lý do thay đổi: UI)
// features/vocab-lab/screens/StudyScreen.tsx
export function StudyScreen({ deckId }: { deckId: string }) {
  const { studyCards, reviewMutation } = useStudySession(deckId);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (studyCards.isLoading) return <LoadingSpinner />;
  if (studyCards.error) return <ErrorView message={studyCards.error.message} />;

  const currentCard = studyCards.data?.[currentIndex];
  if (!currentCard) return <SessionComplete />;

  return (
    <View className="flex-1 bg-white">
      <FlashcardView card={currentCard} />
      <ReviewButtons onRate={(rating) => {
        reviewMutation.mutate({ flashcardId: currentCard.id, rating });
        setCurrentIndex((i) => i + 1);
      }} />
    </View>
  );
}
```

---

## 2. Open/Closed Principle (OCP)

> **Một module nên OPEN cho việc mở rộng, nhưng CLOSED cho việc sửa đổi.**

Trong React Native, OCP nghĩa là: thiết kế component sao cho khi cần thêm variant/behavior mới, ta **thêm code mới** chứ không **sửa code cũ**. Đạt được thông qua: `children`, composition, render props, hoặc config-driven.

### BAD — Sửa component mỗi khi thêm variant

```typescript
// ❌ Mỗi lần thêm variant mới → phải sửa file này, thêm if/else
function Button({ title, variant, onPress }: ButtonProps) {
  let bgColor = '#3B82F6';
  let textColor = '#FFFFFF';
  let borderWidth = 0;

  if (variant === 'primary') {
    bgColor = '#FFC600';
    textColor = '#212529';
  } else if (variant === 'secondary') {
    bgColor = '#EDEDED';
    textColor = '#212529';
  } else if (variant === 'outline') {
    bgColor = 'transparent';
    textColor = '#3B82F6';
    borderWidth = 2;
  } else if (variant === 'danger') {
    bgColor = '#F44336';
    textColor = '#FFFFFF';
  } else if (variant === 'ghost') {
    // ❌ Cứ thế thêm mãi...
  }

  return (
    <Pressable style={{ backgroundColor: bgColor, borderWidth }}>
      <Text style={{ color: textColor }}>{title}</Text>
    </Pressable>
  );
}
```

### GOOD — Config-driven + Composition

```typescript
// ✅ Variant styles được khai báo dạng map — thêm variant = thêm 1 dòng config
const VARIANT_STYLES = {
  primary:   'bg-primary',
  secondary: 'bg-secondary',
  outline:   'bg-transparent border-2 border-primary',
  danger:    'bg-danger',
  ghost:     'bg-transparent',
} as const;

const TEXT_STYLES = {
  primary:   'text-dark font-bold',
  secondary: 'text-dark',
  outline:   'text-primary font-bold',
  danger:    'text-white font-bold',
  ghost:     'text-primary',
} as const;

type ButtonVariant = keyof typeof VARIANT_STYLES;

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: React.ReactNode;       // ✅ Mở rộng qua composition
  children?: React.ReactNode;   // ✅ Mở rộng qua children
  className?: string;           // ✅ Mở rộng qua className override
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  icon,
  children,
  className,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={clsx(
        'rounded-xl py-3 px-6 flex-row items-center justify-center',
        VARIANT_STYLES[variant],
        disabled && 'opacity-50',
        className,                // Cho phép override từ bên ngoài
      )}
    >
      {icon && <View className="mr-2">{icon}</View>}
      {children ?? (
        <AppText className={TEXT_STYLES[variant]}>{title}</AppText>
      )}
    </Pressable>
  );
}

// Sử dụng — Mở rộng mà KHÔNG sửa Button component:
<Button variant="primary" title="Submit" onPress={handleSubmit} />
<Button variant="outline" title="Cancel" onPress={handleCancel} icon={<XIcon />} />

// Custom nội dung hoàn toàn qua children:
<Button variant="ghost" onPress={handleShare}>
  <ShareIcon />
  <AppText className="text-primary ml-2">Share Result</AppText>
</Button>
```

---

## 3. Liskov Substitution Principle (LSP)

> **Component con phải có thể thay thế component cha mà không làm hỏng hành vi.**

Trong React Native, LSP nghĩa là: khi wrap một component gốc (Pressable, TextInput...) thành component custom, nó phải **giữ nguyên toàn bộ props và behavior** của component gốc. Người dùng component custom phải có thể dùng mọi prop mà component gốc hỗ trợ.

### BAD — Wrapper làm mất props gốc

```typescript
// ❌ Chỉ nhận vài props, không forward rest → không thể thay thế Pressable
interface CardProps {
  onPress: () => void;
  children: React.ReactNode;
}

function Card({ onPress, children }: CardProps) {
  return (
    <Pressable onPress={onPress} className="bg-white rounded-xl p-4">
      {children}
    </Pressable>
  );
}

// ❌ Không thể dùng các prop của Pressable:
<Card
  onPress={handlePress}
  onLongPress={handleLongPress}   // ❌ TypeScript error — prop không tồn tại
  disabled={isLoading}            // ❌ TypeScript error
  accessibilityLabel="Exam card"  // ❌ TypeScript error
>
  <AppText>IELTS Reading</AppText>
</Card>
```

### GOOD — Forward tất cả props gốc

```typescript
// ✅ Extends PressableProps → kế thừa toàn bộ behavior
import { Pressable, type PressableProps } from 'react-native';

interface CardProps extends PressableProps {
  elevated?: boolean;  // Prop bổ sung riêng
}

export function Card({ elevated, className, children, ...rest }: CardProps) {
  return (
    <Pressable
      className={clsx(
        'bg-white rounded-xl p-4',
        elevated && 'shadow-md',
        className,
      )}
      {...rest}   // ✅ Forward mọi prop gốc: onLongPress, disabled, a11y...
    >
      {children}
    </Pressable>
  );
}

// ✅ Bây giờ Card THAY THẾ ĐƯỢC cho Pressable ở mọi nơi:
<Card
  onPress={handlePress}
  onLongPress={handleLongPress}       // ✅ Hoạt động
  disabled={isLoading}                 // ✅ Hoạt động
  accessibilityLabel="IELTS Reading"   // ✅ Hoạt động
  elevated
>
  <AppText>IELTS Reading</AppText>
</Card>
```

Tương tự cho TextInput wrapper:

```typescript
// ✅ AppTextInput thay thế được TextInput
import { TextInput, type TextInputProps } from 'react-native';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function AppTextInput({ label, error, className, ...rest }: AppTextInputProps) {
  return (
    <View>
      {label && <AppText variant="label" className="mb-1">{label}</AppText>}
      <TextInput
        className={clsx('border rounded-xl px-4 py-3 text-base', className)}
        placeholderTextColor="#9CA3AF"
        {...rest}   // ✅ Giữ nguyên mọi behavior: onChangeText, secureTextEntry, keyboardType...
      />
      {error && <AppText className="text-danger text-sm mt-1">{error}</AppText>}
    </View>
  );
}
```

---

## 4. Interface Segregation Principle (ISP)

> **Không ép component phụ thuộc vào dữ liệu mà nó không cần.**

Trong React Native, ISP nghĩa là: KHÔNG truyền nguyên một object lớn (Exam, Result, Flashcard) vào component con khi nó chỉ cần 2-3 fields. Truyền object lớn gây: (1) re-render thừa, (2) coupling chặt với data model, (3) khó test.

### BAD — Truyền nguyên object khổng lồ

```typescript
// ❌ ExamCard nhận cả object Exam (chứa questions JSON hàng trăm KB)
// nhưng chỉ hiển thị title, type, và duration
interface ExamCardProps {
  exam: Exam;   // ❌ Exam chứa: id, title, type, duration, questions (JSON khổng lồ), ...
  onPress: () => void;
}

function ExamCard({ exam, onPress }: ExamCardProps) {
  return (
    <Pressable onPress={onPress} className="bg-white rounded-xl p-4">
      <AppText className="text-lg font-bold">{exam.title}</AppText>
      <AppText className="text-sm text-gray-500">{exam.type}</AppText>
      <AppText className="text-sm">{exam.duration} phút</AppText>
    </Pressable>
  );
}

// Tương tự cho Result:
function ScoreCard({ result }: { result: Result }) {
  // ❌ result chứa feedback JSON (AI response lớn) nhưng chỉ cần totalScore
  return <AppText>{result.totalScore}</AppText>;
}
```

### GOOD — Chỉ truyền dữ liệu cần thiết

```typescript
// ✅ Component khai báo ĐÚNG props nó cần — không hơn, không kém
interface ExamCardProps {
  id: string;
  title: string;
  type: string;
  duration: number;
  onPress: (id: string) => void;
}

function ExamCard({ id, title, type, duration, onPress }: ExamCardProps) {
  const handlePress = useCallback(() => onPress(id), [id, onPress]);

  return (
    <Pressable onPress={handlePress} className="bg-white rounded-xl p-4">
      <AppText className="text-lg font-bold">{title}</AppText>
      <AppText className="text-sm text-gray-500">{type}</AppText>
      <AppText className="text-sm">{duration} phút</AppText>
    </Pressable>
  );
}

// ✅ Ở nơi gọi — destruct chỉ các field cần:
function ExamListScreen() {
  const { data: exams } = useExamCatalog();

  return (
    <FlashList
      data={exams}
      renderItem={({ item }) => (
        <ExamCard
          id={item.id}
          title={item.title}
          type={item.type}
          duration={item.duration}
          onPress={handlePressExam}
        />
      )}
      estimatedItemSize={100}
    />
  );
}

// ✅ ScoreCard chỉ nhận primitive cần thiết
interface ScoreCardProps {
  totalScore: number;
  label?: string;
}

function ScoreCard({ totalScore, label = 'Overall' }: ScoreCardProps) {
  return (
    <View className="items-center">
      <AppText variant="caption">{label}</AppText>
      <AppText className="text-2xl font-bold text-primary">{totalScore}</AppText>
    </View>
  );
}
```

**Ngoại lệ hợp lệ:** Nếu component con cần >5 fields từ cùng 1 entity → tạo **interface con** thay vì truyền nguyên entity:

```typescript
// ✅ Pick chỉ các field cần — vẫn type-safe, không coupling với full Exam
type ExamSummary = Pick<Exam, 'id' | 'title' | 'type' | 'duration' | 'difficulty'>;

interface ExamCardProps {
  exam: ExamSummary;
  onPress: (id: string) => void;
}
```

---

## 5. Dependency Inversion Principle (DIP)

> **Modules cấp cao (UI) không nên phụ thuộc trực tiếp vào modules cấp thấp (API, Storage). Cả hai nên phụ thuộc vào abstraction.**

### 5.1. API Layer — Abstract hóa qua API Client

### BAD — Component gọi `fetch` trực tiếp

```typescript
// ❌ Component phụ thuộc trực tiếp vào fetch, URL, và token logic
function VocabularyScreen() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch('http://192.168.1.24:3000/api/v1/vocabulary/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(await res.json());
    };
    load();
  }, []);
  // ...
}
```

### GOOD — UI → Hook → TanStack Query → API Client

```typescript
// ✅ Layer 1: Abstraction — API Client (core/api/client.ts)
// UI KHÔNG biết: base URL, token, refresh logic, error handling
interface IApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, body: unknown): Promise<T>;
  put<T>(endpoint: string, body: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

class ApiClient implements IApiClient {
  async get<T>(endpoint: string): Promise<T> {
    const token = useAuthStore.getState().accessToken;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      // Auto-refresh token logic...
    }
    return response.json();
  }
  // ...
}

export const apiClient: IApiClient = new ApiClient();

// ✅ Layer 2: Hook — Trung gian giữa UI và API
// features/vocabulary/hooks/useVocabularyBooks.ts
export function useVocabularyBooks() {
  return useQuery({
    queryKey: vocabularyKeys.books(),
    queryFn: () => apiClient.get<VocabularyBook[]>('/vocabulary/books'),
  });
}

// ✅ Layer 3: UI — Chỉ biết hook, không biết API/fetch/token
// features/vocabulary/screens/BookListScreen.tsx
export function BookListScreen() {
  const { data: books, isLoading } = useVocabularyBooks();
  // Render UI...
}
```

**Lợi ích:** Khi đổi base URL, thêm header, đổi thư viện HTTP (fetch → axios) → chỉ sửa `ApiClient`, không sửa bất kỳ screen hay hook nào.

### 5.2. Storage Layer — Abstract hóa qua Interface

### BAD — Gọi AsyncStorage trực tiếp ở mọi nơi

```typescript
// ❌ 10 file screens khác nhau đều import AsyncStorage trực tiếp
import AsyncStorage from '@react-native-async-storage/async-storage';

// File A:
await AsyncStorage.setItem('theme', 'dark');
// File B:
const theme = await AsyncStorage.getItem('theme');
// File C:
await AsyncStorage.removeItem('theme');

// ❌ Khi chuyển sang MMKV → phải sửa TẤT CẢ các file trên
```

### GOOD — Abstract qua interface

```typescript
// ✅ Định nghĩa abstraction (core/store/storage.ts)
export interface IStorage {
  getString(key: string): string | null;
  setString(key: string, value: string): void;
  delete(key: string): void;
}

// ✅ Implementation cụ thể — MMKV
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV();

export const appStorage: IStorage = {
  getString: (key) => mmkv.getString(key) ?? null,
  setString: (key, value) => mmkv.set(key, value),
  delete: (key) => mmkv.delete(key),
};

// ✅ Tất cả code chỉ dùng appStorage — không biết bên trong là MMKV hay AsyncStorage
import { appStorage } from '@/core/store/storage';

appStorage.setString('theme', 'dark');
const theme = appStorage.getString('theme');

// ✅ Khi đổi sang AsyncStorage hoặc thư viện khác → chỉ sửa 1 file: storage.ts
```

Tương tự cho Secure Storage (token):

```typescript
// ✅ core/auth/secure-token.ts
export interface ISecureTokenStore {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(access: string, refresh: string): Promise<void>;
  clearTokens(): Promise<void>;
}

// Implementation dùng expo-secure-store
import * as SecureStore from 'expo-secure-store';

export const secureTokenStore: ISecureTokenStore = {
  getAccessToken: () => SecureStore.getItemAsync('access_token'),
  getRefreshToken: () => SecureStore.getItemAsync('refresh_token'),
  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync('access_token', access);
    await SecureStore.setItemAsync('refresh_token', refresh);
  },
  clearTokens: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  },
};
```

---

## 6. Clean Code

### 6.1. Early Return (Bouncer Pattern)

**Quy tắc: Xử lý các trường hợp lỗi/edge cases ĐẦU TIÊN và return sớm. Tránh nested if.**

```typescript
// ❌ DON'T — Nested if sâu, khó đọc
function ExamScreen({ examId }: Props) {
  const { data, isLoading, error } = useExamDetail(examId);

  if (!isLoading) {
    if (!error) {
      if (data) {
        if (data.isPublished) {
          return (
            <View>
              {/* Nội dung chính bị đẩy vào sâu 4 tầng indent */}
            </View>
          );
        } else {
          return <AppText>Exam chưa được xuất bản</AppText>;
        }
      } else {
        return <AppText>Không có dữ liệu</AppText>;
      }
    } else {
      return <ErrorView message={error.message} />;
    }
  } else {
    return <LoadingSpinner />;
  }
}

// ✅ DO — Early Return, code chính nằm ở cuối, không indent sâu
function ExamScreen({ examId }: Props) {
  const { data, isLoading, error } = useExamDetail(examId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView message={error.message} />;
  if (!data) return <EmptyState title="Không có dữ liệu" />;
  if (!data.isPublished) return <EmptyState title="Exam chưa được xuất bản" />;

  // ✅ Happy path — code chính, không bị lồng
  return (
    <View className="flex-1 bg-white">
      <ExamHeader exam={data} />
      <QuestionList questions={data.questions} />
    </View>
  );
}
```

### 6.2. Không Hardcode — Dùng Constants

```typescript
// ❌ DON'T — Magic numbers và hardcoded strings
function useGradingPoll(attemptId: string) {
  return useQuery({
    queryKey: ['pronunciation', attemptId],
    queryFn: () => apiClient.get(`/pronunciation/attempts/${attemptId}`),
    refetchInterval: (query) => {
      if (query.state.data?.status === 'COMPLETED') return false;
      return 2000;          // ❌ Magic number — 2000 là gì?
    },
  });
}

if (score >= 85) {           // ❌ Magic number — 85 nghĩa là gì?
  showConfetti();
}

<AppText>Bạn đã hoàn thành 5 bài thi</AppText>  // ❌ Hardcoded text

// ✅ DO — Constants có tên rõ ràng
// constants/grading.ts
export const GRADING_POLL_INTERVAL_MS = 2000;
export const GRADING_TERMINAL_STATUSES = ['COMPLETED', 'FAILED'] as const;
export const SCORE_THRESHOLD_EXCELLENT = 85;
export const MAX_NEW_CARDS_PER_SESSION = 20;
export const FSRS_RATING = {
  AGAIN: 1,
  HARD:  2,
  GOOD:  3,
  EASY:  4,
} as const;

// Sử dụng:
function useGradingPoll(attemptId: string) {
  return useQuery({
    queryKey: ['pronunciation', attemptId],
    queryFn: () => apiClient.get(`/pronunciation/attempts/${attemptId}`),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (GRADING_TERMINAL_STATUSES.includes(status)) return false;
      return GRADING_POLL_INTERVAL_MS;  // ✅ Self-documenting
    },
  });
}

if (score >= SCORE_THRESHOLD_EXCELLENT) {   // ✅ Rõ ý nghĩa
  showConfetti();
}
```

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
