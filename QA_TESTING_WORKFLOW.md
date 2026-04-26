# QA Testing Workflow — IELTS Master AI Mobile App

> Quy trình kiểm thử & kịch bản test cho ứng dụng luyện thi IELTS (Expo SDK 52)
> Tham chiếu: `RULES.md` (SOLID/DIP — abstracted services) · `SKILL.md` (TanStack Query error states, FlashList, AppText)

---

## 1. Phân Tích Edge Cases

### 1.1. Mạng — Network Failures

| Kịch bản | Thời điểm | Hậu quả nếu không xử lý | Cách handle đúng |
|:---|:---|:---|:---|
| **Mất mạng khi gọi API** | Giữa chừng `GET /exams`, `POST /vocab-lab/review` | UI treo vĩnh viễn (spinner quay mãi) hoặc crash nếu truy cập `data.xxx` | TanStack Query `retry: 3` + `ErrorView` component khi `isError === true` |
| **Mất mạng trong lúc Polling AI** | Đang poll `GET /pronunciation/attempts/:id` mỗi 2s | Poll thất bại liên tục, drain battery, không thông báo user | TanStack Query `retry` + timeout tối đa (30 lần × 2s = 60s) + thông báo "Mất kết nối, thử lại?" |
| **Mạng chập chờn (timeout)** | Upload audio pronunciation (file 1-5MB) | Request timeout, server nhận file nhưng client không biết → duplicate upload | `useMutation` với `retry: 0` cho upload + idempotency key + loading indicator |
| **Mạng trở lại sau offline** | User mở app khi đã cache data cũ | Data cũ hiển thị, user không biết | TanStack Query `refetchOnReconnect: true` (mặc định bật) + `@react-native-community/netinfo` listener |
| **Mất mạng khi submit bài thi** | `POST /exams/sessions/:id/submit` với answers JSON lớn | Mất toàn bộ bài làm | Lưu answers vào MMKV trước khi submit, retry khi có mạng |

### 1.2. Phần Cứng — Permission & Device

| Kịch bản | Module liên quan | Hậu quả nếu không xử lý | Cách handle đúng |
|:---|:---|:---|:---|
| **Từ chối quyền Microphone** | `expo-av` (Pronunciation, Speaking) | `Audio.Recording.prepareToRecordAsync()` throw error → crash | Check permission trước khi record, hiển thị dialog giải thích + nút mở Settings |
| **Thu hồi quyền giữa chừng** | User vào Settings thu hồi mic khi app đang record | Recording dừng đột ngột, state không đồng bộ | `try/catch` wrap mọi recording operation + cleanup state trong `finally` |
| **SecureStore không khả dụng** | `expo-secure-store` (JWT tokens) | `getItemAsync` trả `null` hoặc throw trên emulator cũ | Fallback sang MMKV encrypted, wrap `secureTokenStore` qua interface (DIP — `RULES.md` §5) |
| **App bị kill giữa chừng** | Đang giữa phiên thi IELTS | Mất toàn bộ answers chưa submit | Persist session state vào MMKV mỗi khi user trả lời 1 câu |
| **Xoay màn hình** | Mọi screen | State bị reset, scroll position mất | Dùng `useState`/Zustand (không bị reset khi re-render), lock orientation nếu cần |

### 1.3. Dữ Liệu — Malformed/Missing Data

| Kịch bản | Field bị ảnh hưởng | Hậu quả nếu không xử lý | Cách handle đúng |
|:---|:---|:---|:---|
| **JSON `questions` rỗng hoặc null** | `Exam.questions: Json` | `questions.map(...)` → `TypeError: Cannot read properties of null` | Type guard `isExamQuestion()` + fallback `[]` (ref: `SKILL.md` §4.1) |
| **`feedback` field thiếu nested keys** | `Result.feedback.writing.task1.band` | Chained access crash: `undefined.band` | Optional chaining `feedback?.writing?.task1?.band ?? 'N/A'` |
| **`audioUrl` trả về null** | `VocabularyWord.audioUrl`, `PronunciationSound.audioUrl` | Audio player cố load `null` → crash hoặc silent failure | Check `if (!audioUrl)` → ẩn nút play hoặc hiển thị "Audio không khả dụng" |
| **Empty array `sentences`** | `ShadowingVideo.sentences: []` | Shadowing player hiển thị blank, index 0 truy cập undefined | Early return: `if (!sentences.length) return <EmptyState />` |
| **Server trả 500 với body không chuẩn** | Mọi endpoint | `response.json()` parse fail hoặc thiếu `statusCode` field | `apiClient` wrapper catch parse errors, trả generic error message |
| **Flashcard `fieldValues` key mismatch** | `Flashcard.fieldValues: Json` | Render hiển thị `undefined` thay vì nội dung thẻ | Validate keys tồn tại trong `CardType.fields` trước khi render |

---

## 2. Kịch Bản Manual Testing

### 2.1. Luồng Thi IELTS (Happy Path + Edge Cases)

| # | Hành động | Kết quả mong đợi |
|:---|:---|:---|
| TC-01 | Mở danh sách đề thi → Chọn 1 đề → Bấm "Bắt đầu thi" → Trả lời lần lượt các câu hỏi → Bấm "Nộp bài" | Hiển thị màn hình "Đang chấm điểm..." với animation, sau 5-30 giây hiển thị kết quả (điểm Reading, Listening, Overall). Nếu có Writing/Speaking → polling cho đến khi status = COMPLETED |
| TC-02 | Đang làm bài thi (đã trả lời 5/20 câu) → **Tắt WiFi** → Tiếp tục trả lời → Bấm "Nộp bài" | App hiển thị thông báo "Mất kết nối mạng. Bài làm đã được lưu tạm, vui lòng kết nối lại để nộp bài". Bật WiFi lại → Bấm "Thử lại" → Nộp thành công |
| TC-03 | Đang làm bài thi → **Nhấn nút Home** (app vào background) → Chờ 5 phút → Mở lại app | App phải giữ nguyên trạng thái bài thi (câu đang làm, answers đã chọn, timer tiếp tục đếm). KHÔNG được reset về màn hình chính |
| TC-04 | Mở kết quả bài thi đã có → Kiểm tra phần "AI Feedback" | Nếu feedback có → hiển thị đầy đủ (Reading, Listening, Writing, Speaking). Nếu feedback = null → hiển thị "Chưa có phản hồi từ AI" thay vì crash |
| TC-05 | Mở đề thi nhưng backend trả về `questions: []` (đề thi rỗng) | Hiển thị `<EmptyState>` với message "Đề thi chưa có câu hỏi". KHÔNG hiển thị blank screen hoặc crash |

### 2.2. Luồng Pronunciation (Native Audio + AI Polling)

| # | Hành động | Kết quả mong đợi |
|:---|:---|:---|
| TC-06 | Mở trang Pronunciation → Bấm "Thu âm" lần đầu tiên | App yêu cầu quyền Microphone. User đồng ý → Bắt đầu ghi âm, hiển thị waveform/timer. User từ chối → Hiển thị dialog "Cần quyền Microphone để sử dụng tính năng này" + nút "Mở Cài đặt" |
| TC-07 | Thu âm xong → Bấm "Gửi" → Đợi AI chấm điểm | Hiển thị trạng thái: "Đang gửi..." → "AI đang phân tích..." → "Hoàn tất! Điểm: 85/100". Poll tối đa 60 giây, nếu timeout → hiển thị "Chấm điểm mất quá lâu, vui lòng thử lại" |
| TC-08 | Đang thu âm → **Có cuộc gọi đến** (interrupt audio session) | App phải dừng recording an toàn, lưu trạng thái. Sau cuộc gọi → hiển thị "Phiên ghi âm đã bị gián đoạn, bấm Thu âm để thử lại" |

### 2.3. Luồng Vocab Lab (FSRS Flashcards)

| # | Hành động | Kết quả mong đợi |
|:---|:---|:---|
| TC-09 | Mở Vocab Lab → Chọn Deck → Bấm "Học" → Lật thẻ → Bấm "Tốt" (rating=3) | Thẻ tiếp theo hiển thị. Sau khi hết thẻ → Hiển thị thống kê session (Mới: X, Đang học: Y, Ôn tập: Z). Deck list cập nhật số thẻ due |
| TC-10 | Đang review flashcard → **Tắt WiFi** → Bấm rating | Hiển thị thông báo lỗi mạng. Khi có mạng lại → tự động retry hoặc cho user bấm thử lại. KHÔNG mất progress |

---

## 3. Unit Tests (Jest + React Native Testing Library)

### 3.1. Test Type Guard — `isExamQuestion()`

> Ref: `SKILL.md` §4.1 — Type guard cho JSON fields

```typescript
// __tests__/features/ielts/utils/typeGuards.test.ts

import { isExamQuestion } from '@/features/ielts/utils/typeGuards';

describe('isExamQuestion', () => {
  it('should return true for valid ExamQuestion object', () => {
    const valid = {
      id: 'q-001',
      type: 'multiple_choice',
      text: 'What is the main idea?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
    };
    expect(isExamQuestion(valid)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isExamQuestion(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isExamQuestion(undefined)).toBe(false);
  });

  it('should return false for object missing required field "id"', () => {
    const missing = { type: 'fill_blank', text: 'Fill in ___' };
    expect(isExamQuestion(missing)).toBe(false);
  });

  it('should return false for object missing required field "type"', () => {
    const missing = { id: 'q-002', text: 'Question?' };
    expect(isExamQuestion(missing)).toBe(false);
  });

  it('should return false for object missing required field "text"', () => {
    const missing = { id: 'q-003', type: 'matching' };
    expect(isExamQuestion(missing)).toBe(false);
  });

  it('should return false for primitive values', () => {
    expect(isExamQuestion('string')).toBe(false);
    expect(isExamQuestion(42)).toBe(false);
    expect(isExamQuestion(true)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isExamQuestion({})).toBe(false);
  });

  it('should return true even with extra fields (open structure)', () => {
    const extra = {
      id: 'q-004',
      type: 'multiple_choice',
      text: 'Extra fields question',
      audioUrl: 'https://example.com/audio.mp3',
      imageUrl: 'https://example.com/img.jpg',
    };
    expect(isExamQuestion(extra)).toBe(true);
  });
});
```

### 3.2. Test Custom Hook — `useAttemptResult()` (Polling)

> Ref: `SKILL.md` §3.2 — TanStack Query refetchInterval

```typescript
// __tests__/features/pronunciation/hooks/useAttemptResult.test.ts

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAttemptResult } from '@/features/pronunciation/hooks/useAttemptResult';
import { apiClient } from '@/core/api/client';
import React from 'react';

// Mock API client (DIP — RULES.md §5)
jest.mock('@/core/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useAttemptResult', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should not fetch when attemptId is null (disabled)', () => {
    renderHook(() => useAttemptResult(null), { wrapper: createWrapper() });
    expect(mockedApiClient.get).not.toHaveBeenCalled();
  });

  it('should fetch when attemptId is provided', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      id: 'att-001',
      status: 'PROCESSING',
      score: null,
    });

    const { result } = renderHook(
      () => useAttemptResult('att-001'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApiClient.get).toHaveBeenCalledWith(
      '/pronunciation/attempts/att-001',
    );
    expect(result.current.data?.status).toBe('PROCESSING');
  });

  it('should return score when status is COMPLETED', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      id: 'att-002',
      status: 'COMPLETED',
      score: 85,
      transcribedText: 'hello world',
    });

    const { result } = renderHook(
      () => useAttemptResult('att-002'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.status).toBe('COMPLETED');
    expect(result.current.data?.score).toBe(85);
  });

  it('should handle API error gracefully', async () => {
    mockedApiClient.get.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(
      () => useAttemptResult('att-003'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Network Error');
  });
});
```

### 3.3. Test UI Component — `BookCard`

> Ref: `SKILL.md` §2.1 — React.memo list item · `RULES.md` §4 — ISP (primitive props)

```typescript
// __tests__/features/vocabulary/components/BookCard.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookCard } from '@/features/vocabulary/components/BookCard';

describe('BookCard', () => {
  const defaultProps = {
    id: 'book-001',
    name: 'Essential IELTS Vocabulary',
    wordCount: 250,
    onPress: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('should render book name correctly', () => {
    const { getByText } = render(<BookCard {...defaultProps} />);
    expect(getByText('Essential IELTS Vocabulary')).toBeTruthy();
  });

  it('should render word count correctly', () => {
    const { getByText } = render(<BookCard {...defaultProps} />);
    expect(getByText('250 từ')).toBeTruthy();
  });

  it('should call onPress with book id when pressed', () => {
    const { getByText } = render(<BookCard {...defaultProps} />);
    fireEvent.press(getByText('Essential IELTS Vocabulary'));
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPress).toHaveBeenCalledWith('book-001');
  });

  it('should render with zero wordCount without crash', () => {
    const { getByText } = render(
      <BookCard {...defaultProps} wordCount={0} />,
    );
    expect(getByText('0 từ')).toBeTruthy();
  });

  it('should handle long book name without crash', () => {
    const longName = 'A'.repeat(200);
    const { getByText } = render(
      <BookCard {...defaultProps} name={longName} />,
    );
    expect(getByText(longName)).toBeTruthy();
  });
});
```

### 3.4. Test UI Component — `ScoreCard` (Edge Case: null/undefined)

```typescript
// __tests__/features/ielts/components/ScoreCard.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import { ScoreCard } from '@/features/ielts/components/ScoreCard';

describe('ScoreCard', () => {
  it('should render totalScore correctly', () => {
    const { getByText } = render(
      <ScoreCard totalScore={7.5} label="Overall" />,
    );
    expect(getByText('7.5')).toBeTruthy();
    expect(getByText('Overall')).toBeTruthy();
  });

  it('should render default label when not provided', () => {
    const { getByText } = render(<ScoreCard totalScore={6} />);
    expect(getByText('Overall')).toBeTruthy();
  });

  it('should render zero score without crash', () => {
    const { getByText } = render(<ScoreCard totalScore={0} />);
    expect(getByText('0')).toBeTruthy();
  });
});
```

### 3.5. Test Custom Hook — `useDecks()` (Server State)

> Ref: `SKILL.md` §3.2 — Server State qua TanStack Query

```typescript
// __tests__/features/vocab-lab/hooks/useDecks.test.ts

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDecks } from '@/features/vocab-lab/hooks/useDecks';
import { apiClient } from '@/core/api/client';
import React from 'react';

jest.mock('@/core/api/client', () => ({
  apiClient: { get: jest.fn() },
}));

const mockedApi = apiClient as jest.Mocked<typeof apiClient>;

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const MOCK_DECKS = [
  {
    id: 'deck-001',
    name: 'IELTS Academic Vocabulary',
    createdAt: '2026-01-01T00:00:00Z',
    newCount: 15,
    learningCount: 5,
    dueCount: 10,
    totalCards: 100,
  },
  {
    id: 'deck-002',
    name: 'Collocations',
    createdAt: '2026-02-01T00:00:00Z',
    newCount: 20,
    learningCount: 0,
    dueCount: 3,
    totalCards: 50,
  },
];

describe('useDecks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fetch decks successfully', async () => {
    mockedApi.get.mockResolvedValueOnce(MOCK_DECKS);

    const { result } = renderHook(() => useDecks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].name).toBe('IELTS Academic Vocabulary');
    expect(mockedApi.get).toHaveBeenCalledWith('/vocab-lab/decks');
  });

  it('should handle empty deck list', async () => {
    mockedApi.get.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDecks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });

  it('should set isError on network failure', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('500 Internal Server Error'));

    const { result } = renderHook(() => useDecks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toContain('500');
  });
});
```

### 3.6. Test Storage Abstraction — `appStorage`

> Ref: `RULES.md` §5.2 — DIP (Storage interface)

```typescript
// __tests__/core/store/storage.test.ts

import { appStorage } from '@/core/store/storage';

describe('appStorage (IStorage interface)', () => {
  beforeEach(() => {
    // Clean state trước mỗi test
    appStorage.delete('test-key');
  });

  it('should set and get a string value', () => {
    appStorage.setString('test-key', 'hello');
    expect(appStorage.getString('test-key')).toBe('hello');
  });

  it('should return null for non-existent key', () => {
    expect(appStorage.getString('non-existent')).toBeNull();
  });

  it('should delete a key', () => {
    appStorage.setString('test-key', 'to-delete');
    appStorage.delete('test-key');
    expect(appStorage.getString('test-key')).toBeNull();
  });

  it('should overwrite existing value', () => {
    appStorage.setString('test-key', 'old');
    appStorage.setString('test-key', 'new');
    expect(appStorage.getString('test-key')).toBe('new');
  });

  it('should handle empty string value', () => {
    appStorage.setString('test-key', '');
    expect(appStorage.getString('test-key')).toBe('');
  });
});
```

---

## 4. Ma Trận Test Coverage

| Feature | Unit Test | Manual Test | Edge Case |
|:---|:---|:---|:---|
| **Auth (Login/Register)** | Hook `useLogin`, `useRegister` | TC: Login sai password, token hết hạn | SecureStore unavailable, 401 refresh |
| **IELTS Exam** | `isExamQuestion` guard, `useExamDetail` hook | TC-01 → TC-05 | questions=null, feedback=null, offline submit |
| **Pronunciation** | `useAttemptResult` polling hook | TC-06 → TC-08 | Mic denied, polling timeout, audio interrupt |
| **Vocab Lab (FSRS)** | `useDecks` hook, `BookCard` component | TC-09 → TC-10 | Empty deck, offline rating, fieldValues mismatch |
| **Shadowing** | Player hook, sentence navigation | Phát video → lặp câu → dictation | sentences=[], YouTube unavailable |
| **Vocabulary** | `BookCard` component, `useVocabularyBooks` | Duyệt sách → xem unit → nghe audio | audioUrl=null, storyContent quá dài |
| **Grammar** | Theory renderer, exercise handler | Đọc lý thuyết → làm bài tập | theoryContent HTML injection, options=null |

### Ưu Tiên Test

| Ưu tiên | Loại | Lý do |
|:---|:---|:---|
| 🔴 P0 | Type guards cho JSON fields | Crash-prevention — dữ liệu backend có thể thay đổi bất kỳ lúc nào |
| 🔴 P0 | TanStack Query hooks (loading/error states) | Mọi screen phụ thuộc — fail ở đây = app unusable |
| 🟡 P1 | UI components trong danh sách (list items) | Performance-critical — render sai = lag toàn app |
| 🟡 P1 | Storage abstraction | Thay đổi implementation (MMKV ↔ AsyncStorage) phải không break |
| 🔵 P2 | Manual test luồng chính (Happy Path) | Đảm bảo UX đúng kỳ vọng trước khi release |

---

*Mọi test phải pass trước khi merge PR. Thêm test case mới khi phát hiện bug mới (regression testing).*
