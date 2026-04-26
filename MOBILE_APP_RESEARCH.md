# Hướng Dẫn Phát Triển Mobile App — IELTS Master AI (Expo SDK 52)

> Tài liệu nghiên cứu kỹ thuật | Cập nhật: 2026-04-26

---

## 1. Tái Cấu Trúc Architecture & State Management

### 1.1. Chiến lược phân tầng State

Dự án hiện tại sử dụng **React Context** (`AuthContext.tsx`) và **AsyncStorage** để quản lý state. Đây là cách tiếp cận cơ bản, cần nâng cấp theo mô hình 3 tầng:

| Loại State | Trách nhiệm | Công cụ đề xuất |
|:---|:---|:---|
| **Server State** | Dữ liệu API, caching, đồng bộ nền, retry | **TanStack Query (React Query)** |
| **Global Client State** | Auth tokens, user preferences, theme | **Zustand** + `react-native-mmkv` |
| **Local UI State** | Form inputs, toggles, animation | `useState` / `useReducer` |

### 1.2. Áp dụng TanStack Query cho Server State

**Vấn đề hiện tại:** Các service file (`api.ts`, `features.api.ts`, `ielts.api.ts`) gọi API trực tiếp bằng `fetch` qua `ApiClient` class, không có caching, retry hay background sync.

**Giải pháp:**

- Cài đặt: `npm install @tanstack/react-query`
- Wrap `QueryClientProvider` trong `app/_layout.tsx` (bên trong `AuthProvider`)
- Tạo **custom hooks** cho từng domain thay vì gọi trực tiếp:

```typescript
// hooks/useVocabularyBooks.ts
import { useQuery } from '@tanstack/react-query';
import { vocabularyApi } from '@/services/api';

export const vocabularyKeys = {
  all: ['vocabulary'] as const,
  books: () => [...vocabularyKeys.all, 'books'] as const,
  book: (id: string) => [...vocabularyKeys.all, 'book', id] as const,
  unit: (id: string) => [...vocabularyKeys.all, 'unit', id] as const,
};

export function useVocabularyBooks() {
  return useQuery({
    queryKey: vocabularyKeys.books(),
    queryFn: () => vocabularyApi.getBooks(),
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}
```

- Sử dụng `useMutation` + **Optimistic Updates** cho các thao tác write (submit review, tạo flashcard)
- Cấu hình `staleTime` hợp lý cho mobile (60s mặc định) để tiết kiệm băng thông

### 1.3. Áp dụng Zustand cho Global Client State

**Vấn đề hiện tại:** `AuthContext.tsx` dùng `AsyncStorage` (plain text, chậm) để lưu token và user data.

**Giải pháp:**

- Cài đặt: `npm install zustand react-native-mmkv`
- Tạo MMKV storage adapter:

```typescript
// store/storage.ts
import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

const storage = new MMKV();

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};
```

- Tạo auth store thay thế `AuthContext`:

```typescript
// store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => mmkvStorage) }
  )
);
```

### 1.4. SM-2 Spaced Repetition (Vocab Lab) — Offline-First

**Hiện tại:** SM-2 logic nằm hoàn toàn phía backend (`vocab-lab` module trong NestJS). Mobile chỉ gọi `POST /vocab-lab/review`.

**Đề xuất kiến trúc Hybrid:**

- **Tính toán SM-2 cục bộ** trên device bằng Zustand store (cho UX mượt, hoạt động offline)
- **Đồng bộ lên server** khi có mạng qua TanStack Query mutation + queue

```typescript
// utils/sm2.ts
export function calculateSM2(quality: number, repetitions: number, interval: number, ef: number) {
  let newReps = repetitions, newInterval = interval, newEF = ef;
  if (quality >= 3) {
    newInterval = newReps === 0 ? 1 : newReps === 1 ? 6 : Math.round(newInterval * newEF);
    newReps += 1;
  } else {
    newReps = 0;
    newInterval = 1;
  }
  newEF = Math.max(1.3, newEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { repetitions: newReps, interval: newInterval, easeFactor: newEF };
}
```

- Dùng `NetInfo` để detect online/offline và trigger sync

**Tham khảo:**
- [TanStack Query React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)

---

## 2. Tích Hợp Audio & Object Storage (MinIO)

### 2.1. Luồng ghi âm trên Expo

**Hiện tại:** App đã cài `expo-av` (v16.0.8) và `expo-speech-recognition` (v3.1.3). Cần hoàn thiện luồng recording → upload → AI grading.

**Luồng hoàn chỉnh:**

```
[Mobile] Record Audio (expo-av)
    → Upload file lên NestJS endpoint
        → NestJS lưu vào MinIO, trả audioUrl
            → NestJS publish message lên RabbitMQ (pronunciation-check-queue)
                → FastAPI consume → Whisper transcribe → tính score
                    → Update DB (status: COMPLETED)
[Mobile] Poll/SSE để lấy kết quả → Cập nhật UI
```

**Implementation ghi âm:**

```typescript
import { Audio } from 'expo-av';

async function startRecording() {
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) return;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  return recording;
}

async function stopAndUpload(recording: Audio.Recording) {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  if (!uri) return;

  const formData = new FormData();
  formData.append('audio', {
    uri,
    name: `recording-${Date.now()}.m4a`,
    type: 'audio/m4a',
  } as any);

  // Upload qua NestJS proxy (khuyến nghị) thay vì trực tiếp MinIO
  const response = await fetch(`${API_BASE_URL}/pronunciation/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return response.json();
}
```

### 2.2. Upload Strategy: NestJS Proxy vs Presigned URL

| Phương pháp | Ưu điểm | Nhược điểm |
|:---|:---|:---|
| **Qua NestJS** (hiện tại) | Đơn giản, có auth guard, validate file | NestJS chịu tải upload |
| **Presigned URL** (nâng cao) | Mobile upload thẳng MinIO, giảm tải server | Phức tạp hơn, cần thêm endpoint tạo URL |

**Khuyến nghị:** Giữ phương pháp **qua NestJS** cho MVP vì hệ thống đã có sẵn endpoint upload (`POST /exams/audio/upload`). Chuyển sang presigned URL khi cần scale.

### 2.3. Nhận kết quả realtime từ Backend AI

**Vấn đề:** Sau khi upload audio, Backend AI xử lý bất đồng bộ qua RabbitMQ. Mobile cần biết khi nào có kết quả.

**3 phương pháp (xếp theo mức độ phù hợp):**

**① Polling với TanStack Query (Đơn giản nhất — Khuyến nghị cho MVP):**
```typescript
function usePronunciationResult(attemptId: string) {
  return useQuery({
    queryKey: ['pronunciation', attemptId],
    queryFn: () => apiClient.get(`/pronunciation/attempts/${attemptId}`),
    refetchInterval: (query) =>
      query.state.data?.status === 'COMPLETED' ? false : 2000, // Poll mỗi 2s
    enabled: !!attemptId,
  });
}
```

**② Server-Sent Events (SSE) — Một chiều, hiệu quả:**
- Backend tạo endpoint SSE, consume từ RabbitMQ rồi push event
- Mobile dùng `EventSource` polyfill

**③ WebSocket — Hai chiều, phức tạp:**
- Dùng NestJS Gateway (`@nestjs/websockets`) + Socket.io
- Mobile dùng `socket.io-client`
- Phù hợp khi cần nhiều tính năng realtime

**Tham khảo:**
- [Expo AV - Audio Recording](https://docs.expo.dev/versions/latest/sdk/audio/)
- [MinIO JavaScript Client](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)

---

## 3. Authentication & Security

### 3.1. Vấn đề bảo mật hiện tại

**Phát hiện nghiêm trọng:** Dự án đang lưu JWT token bằng `AsyncStorage` (file `auth.service.ts` dòng 36, `AuthContext.tsx` dòng 46). **AsyncStorage lưu dữ liệu dạng plain text**, dễ bị trích xuất trên thiết bị đã root/jailbreak.

### 3.2. Giải pháp: expo-secure-store

- Cài đặt: `npx expo install expo-secure-store`
- Thay thế `AsyncStorage` cho token storage:

```typescript
// services/secure-token.service.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';

export const SecureTokenService = {
  async setTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },

  async clearTokens() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};
```

### 3.3. Token Lifecycle Strategy

| Token | Thời hạn | Lưu trữ | Mục đích |
|:---|:---|:---|:---|
| **Access Token** | 15-30 phút | In-memory (Zustand, không persist) | Gắn vào mỗi API request |
| **Refresh Token** | 7-30 ngày | `expo-secure-store` | Lấy access token mới |

### 3.4. API Interceptor với Auto-Refresh

Cần nâng cấp `ApiClient` class hiện tại (file `api-client.ts`) để xử lý tự động:

```typescript
// Pseudo-code cho enhanced ApiClient
class EnhancedApiClient {
  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const token = useAuthStore.getState().accessToken;
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };

    let response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });

    if (response.status === 401) {
      // Attempt token refresh
      const refreshToken = await SecureTokenService.getRefreshToken();
      if (refreshToken) {
        const newTokens = await this.refreshTokens(refreshToken);
        useAuthStore.getState().setAuth(/* user */, newTokens.accessToken);
        await SecureTokenService.setTokens(newTokens.accessToken, newTokens.refreshToken);
        // Retry original request
        headers.Authorization = `Bearer ${newTokens.accessToken}`;
        response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
      } else {
        useAuthStore.getState().logout();
        throw new Error('Session expired');
      }
    }

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
}
```

### 3.5. Auth Guard với expo-router

Giữ pattern hiện tại trong `AuthContext.tsx` (dòng 30-41) nhưng chuyển sang dùng Zustand:

```typescript
// Trong app/_layout.tsx
export default function RootLayout() {
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) router.replace('/(auth)/login');
    else if (user && inAuthGroup) router.replace('/(tabs)');
  }, [user, segments]);

  return <Stack screenOptions={{ headerShown: false }}>...</Stack>;
}
```

**Tham khảo:**
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo Router Authentication](https://docs.expo.dev/router/reference/authentication/)

---

## 4. Xử Lý Dữ Liệu Phức Tạp & Hiệu Suất UI

### 4.1. Vấn đề với JSON phức tạp

Dự án sử dụng nhiều **JSON fields** trong PostgreSQL:
- `exams.questions` — mảng câu hỏi lồng nhau (có thể rất lớn)
- `exam_sessions.answers` — câu trả lời dạng JSON
- `results.feedback` — phản hồi AI dạng JSON
- `shadowing_videos.sentences` — mảng câu với timing data

### 4.2. FlashList thay thế FlatList

- Cài đặt: `npm install @shopify/flash-list`
- **Lợi ích:** Render nhanh gấp 5-10x so với FlatList nhờ cell recycling

```typescript
import { FlashList } from '@shopify/flash-list';

function ExamQuestionList({ questions }: { questions: ExamQuestion[] }) {
  return (
    <FlashList
      data={questions}
      estimatedItemSize={120}  // BẮT BUỘC: ước lượng chiều cao trung bình
      renderItem={({ item }) => <QuestionCard question={item} />}
      keyExtractor={(item) => item.id}
      getItemType={(item) => item.type} // Phân loại theo type để tối ưu recycling
    />
  );
}
```

### 4.3. Chiến lược tối ưu cho dữ liệu Exam

**① Lazy parsing:** Không parse toàn bộ JSON cùng lúc
```typescript
// Chỉ parse phần cần hiển thị
const useExamQuestions = (examId: string) => {
  return useQuery({
    queryKey: ['exam', examId, 'questions'],
    queryFn: async () => {
      const exam = await apiClient.get<Exam>(`/exams/${examId}`);
      return exam.questions; // Backend nên hỗ trợ pagination
    },
    select: (data) => data.map(transformQuestion), // Transform 1 lần
  });
};
```

**② Memoization:**
```typescript
const QuestionCard = React.memo(({ question }: { question: ExamQuestion }) => {
  // Chỉ re-render khi question thay đổi
  return <View>...</View>;
});
```

**③ Pagination phía server:** Yêu cầu backend hỗ trợ `?page=1&limit=20` cho danh sách câu hỏi lớn.

### 4.4. Hiển thị nội dung HTML/Markdown (Grammar)

Bảng `grammar_units` có field `theoryContent` dạng HTML/Markdown. Sử dụng:

```bash
npm install react-native-render-html
# hoặc cho Markdown:
npm install react-native-markdown-display
```

```typescript
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

function GrammarTheory({ html }: { html: string }) {
  const { width } = useWindowDimensions();
  return <RenderHtml contentWidth={width - 32} source={{ html }} />;
}
```

**Tham khảo:**
- [FlashList by Shopify](https://shopify.github.io/flash-list/)
- [react-native-render-html](https://meliorence.github.io/react-native-render-html/)

---

## 5. Quy Trình CI/CD với EAS Build

### 5.1. Cài đặt EAS CLI

```bash
npm install -g eas-cli
eas login
eas build:configure  # Tạo eas.json
```

### 5.2. Cấu hình eas.json

```json
{
  "cli": {
    "version": ">= 15.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "env": {
        "EXPO_PUBLIC_API_URL": "http://192.168.1.24:3000/api/v1"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging-api.ieltsmasterai.com/api/v1"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.ieltsmasterai.com/api/v1"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 5.3. Build Profiles & Commands

| Profile | Mục đích | Lệnh |
|:---|:---|:---|
| `development` | Dev build với dev client | `eas build --profile development --platform ios` |
| `preview` | Test nội bộ (TestFlight / Internal) | `eas build --profile preview --platform all` |
| `production` | Đẩy lên Store | `eas build --profile production --platform all` |

### 5.4. Tự động submit lên Store

```bash
# Build + auto submit
eas build --profile production --platform ios --auto-submit
eas build --profile production --platform android --auto-submit

# Hoặc submit riêng
eas submit --platform ios --latest
eas submit --platform android --latest
```

### 5.5. GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/eas-build.yml
name: EAS Build & Submit
on:
  push:
    branches: [main]
    paths: ['frontend-mobile/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: cd frontend-mobile && npm ci
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Build iOS
        run: cd frontend-mobile && eas build --profile production --platform ios --non-interactive
      - name: Submit to App Store
        run: cd frontend-mobile && eas submit --platform ios --latest --non-interactive
```

### 5.6. Prerequisites cho Store Deployment

**Apple App Store:**
- Apple Developer Program membership ($99/năm)
- Bundle Identifier: `com.ieltsmasterai.app` (đã cấu hình trong `app.json`)
- App Store Connect app đã tạo
- Certificates & Provisioning Profiles (EAS tự quản lý)

**Google Play Store:**
- Google Play Developer account ($25 một lần)
- Google Service Account Key (JSON) cho automated submission
- Package name: `com.ieltsmasterai.app` (đã cấu hình trong `app.json`)

### 5.7. Tối ưu cho macOS Apple Silicon

- **Local builds** (nếu cần): `eas build --local --platform ios` — chạy native trên M-series chip, nhanh hơn cloud build
- Đảm bảo cài **Xcode** phiên bản mới nhất và **CocoaPods**: `sudo gem install cocoapods`
- Sử dụng `--local` flag khi cần debug build issues

**Tham khảo:**
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo GitHub Action](https://github.com/expo/expo-github-action)

---

## 6. Tổng Kết: Checklist Hành Động

### Phase 1 — Foundation (Tuần 1-2)
- [ ] Cài đặt `expo-secure-store`, migrate token storage từ AsyncStorage
- [ ] Cài đặt `zustand` + `react-native-mmkv`, tạo auth store
- [ ] Cài đặt `@tanstack/react-query`, wrap QueryClientProvider
- [ ] Nâng cấp `ApiClient` với auto-refresh token logic
- [ ] Cài đặt `@shopify/flash-list`

### Phase 2 — Feature Migration (Tuần 3-5)
- [ ] Chuyển các API calls sang TanStack Query hooks
- [ ] Implement SM-2 offline-first với Zustand persist
- [ ] Hoàn thiện luồng ghi âm Pronunciation (expo-av → NestJS → MinIO)
- [ ] Implement polling cho kết quả AI grading
- [ ] Tích hợp FlashList cho danh sách Exam questions
- [ ] Render Grammar theoryContent bằng react-native-render-html

### Phase 3 — Polish & Deploy (Tuần 6-7)
- [ ] Cấu hình `eas.json` với 3 build profiles
- [ ] Setup GitHub Actions CI/CD pipeline
- [ ] Test trên thiết bị thật (iOS + Android)
- [ ] Submit lên TestFlight / Google Play Internal Testing
- [ ] Fix issues từ store review
- [ ] Release production

### Các packages cần cài thêm

```bash
cd frontend-mobile

# State Management & Storage
npm install zustand @tanstack/react-query react-native-mmkv

# Security
npx expo install expo-secure-store

# UI Performance
npm install @shopify/flash-list react-native-render-html

# Networking (nếu cần realtime)
npm install socket.io-client

# Utilities
npm install @react-native-community/netinfo
```

---

*Tài liệu này được tổng hợp dựa trên phân tích source code thực tế của dự án IELTS Master AI và các best practices cập nhật đến 04/2026.*
