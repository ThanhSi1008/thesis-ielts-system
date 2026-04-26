import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../auth/store';
import { secureTokenStore } from '../auth/secure-token';
import Constants from 'expo-constants';

// Handle dynamic LAN IP for local development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${Constants.expoConfig?.hostUri?.split(':')[0]}:3000/api/v1`;

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
