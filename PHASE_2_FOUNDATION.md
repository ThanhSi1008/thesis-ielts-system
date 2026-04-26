# Phase 2: Foundation Setup — Implementation Guide

> Tài liệu hướng dẫn thực thi kỹ thuật nền tảng cho IELTS Master AI Mobile App
> Áp dụng Architecture: Feature-First Modular (Tầng `core/` xử lý logic dùng chung)

---

## 1. Cấu hình Môi trường (.env & Network)

Khi phát triển ứng dụng Expo (React Native) với thiết bị thật hoặc máy ảo, bạn **không thể** sử dụng `localhost` để kết nối đến backend (NestJS/MinIO) đang chạy trên máy tính. Bạn BẮT BUỘC phải sử dụng **IP LAN** của máy phát triển.

### 1.1. Cách lấy IP LAN (macOS)
Mở terminal và chạy lệnh:
```bash
ipconfig getifaddr en0
# Ví dụ kết quả: 192.168.1.15
```

### 1.2. Cấu hình file `.env` mẫu

**File: `.env.development`**
```env
# Thay thế bằng IP LAN thực tế của bạn
EXPO_PUBLIC_API_URL=http://192.168.1.15:3000/api/v1
EXPO_PUBLIC_MINIO_URL=http://192.168.1.15:9000

# Các cấu hình khác
EXPO_PUBLIC_APP_ENV=development
```

**File: `.env.production`**
```env
# URL Production thực tế của dự án
EXPO_PUBLIC_API_URL=https://api.ieltsmaster.com/api/v1
EXPO_PUBLIC_MINIO_URL=https://storage.ieltsmaster.com

EXPO_PUBLIC_APP_ENV=production
```

> **Lưu ý:** Prefix `EXPO_PUBLIC_` là bắt buộc để biến môi trường có thể được truy cập từ code React Native thông qua `process.env`.

> **Mẹo xử lý IP LAN động:** Nếu IP LAN của bạn thường xuyên thay đổi, bạn có thể không cần hardcode IP vào file `.env`. Thay vào đó, trong code khởi tạo API Client, bạn có thể thiết lập:
> ```typescript
> import Constants from 'expo-constants';
> const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${Constants.expoConfig?.hostUri?.split(':')[0]}:3000/api/v1`;
> ```
> *(Yêu cầu cài đặt thư viện `expo-constants`)*

---

## 2. Xây dựng Secure Storage (Bảo mật Token)

Chiến lược lưu trữ:
- **Refresh Token**: Lưu an toàn vào Keychain/Keystore qua `expo-secure-store` (mã hóa cấp độ OS).
- **Access Token & User Info**: Quản lý in-memory bằng `zustand` để truy xuất cực nhanh mà không cần gọi storage bất đồng bộ liên tục.

### 2.1. Secure Token Store

Tạo file `core/auth/secure-token.ts`:

```typescript
// core/auth/secure-token.ts
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export const secureTokenStore = {
  /**
   * Lưu refresh token an toàn vào bộ nhớ mã hóa của thiết bị
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Lỗi khi lưu refresh token:', error);
      throw error;
    }
  },

  /**
   * Lấy refresh token hiện tại
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Lỗi khi đọc refresh token:', error);
      return null;
    }
  },

  /**
   * Xóa refresh token khi logout
   */
  async clearRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Lỗi khi xóa refresh token:', error);
    }
  },
};
```

### 2.2. Zustand Auth Store

Tạo file `core/auth/store.ts`:

```typescript
// core/auth/store.ts
import { create } from 'zustand';
import { secureTokenStore } from './secure-token';

// Import interface User từ @shared/types (như đã quy định ở Mapping Guide)
// interface User { id: string; email: string; ... }
type User = any; // Thay thế bằng type thực tế

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuthData: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  updateAccessToken: (token: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuthData: async (accessToken, refreshToken, user) => {
    // Lưu refresh token vào SecureStore
    await secureTokenStore.setRefreshToken(refreshToken);
    
    // Lưu state in-memory
    set({
      accessToken,
      user,
      isAuthenticated: true,
    });
  },

  updateAccessToken: (token) => {
    set({ accessToken: token });
  },

  logout: async () => {
    // Xóa từ SecureStore
    await secureTokenStore.clearRefreshToken();
    
    // Reset state
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
```

---

## 3. Xây dựng Base API Client (Interceptors & Silent Refresh)

Sử dụng thư viện `axios` để thiết lập HTTP client. Xử lý triệt để bài toán **Silent Refresh Token** và **Concurrency** (nhiều request cùng gọi khi token vừa hết hạn).

Cài đặt Axios nếu chưa có:
```bash
npm install axios
```

Tạo file `core/api/client.ts`:

```typescript
// core/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../auth/store';
import { secureTokenStore } from '../auth/secure-token';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Khởi tạo Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// === REQUEST INTERCEPTOR ===
// Tự động đính kèm Access Token vào mọi request nếu có
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Đọc token in-memory từ Zustand
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === REFRESH TOKEN LOGIC (MUTEX/QUEUE) ===
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// === RESPONSE INTERCEPTOR ===
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Bỏ qua nếu lỗi không phải 401, hoặc request đã được retry, hoặc là endpoint refresh/login
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    // Đánh dấu request này đã retry để tránh lặp vô hạn
    originalRequest._retry = true;

    // Nếu đang có một tiến trình refresh khác chạy
    if (isRefreshing) {
      try {
        // Xếp hàng chờ token mới
        const token = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        
        // Tiến trình kia đã refresh xong, dùng token mới để retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // Bắt đầu quá trình refresh token
    isRefreshing = true;

    try {
      const refreshToken = await secureTokenStore.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      interface RefreshResponse {
        access_token: string;
      }

      // Gọi API refresh
      const { data } = await axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const newAccessToken = data.access_token;
      
      // Update store in-memory
      useAuthStore.getState().updateAccessToken(newAccessToken);
      
      // Chạy các request đang xếp hàng chờ
      processQueue(null, newAccessToken);

      // Retry request ban đầu
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return apiClient(originalRequest);

    } catch (refreshError) {
      // Refresh thất bại (VD: token hết hạn, bị thu hồi)
      processQueue(refreshError, null);
      
      // Đăng xuất user (Zustand store sẽ kích hoạt re-render Root Layout và Expo Router tự động đá về màn hình /login)
      await useAuthStore.getState().logout();
      
      return Promise.reject(refreshError);
    } finally {
      // Nhả cờ mutex
      isRefreshing = false;
    }
  }
);
```
