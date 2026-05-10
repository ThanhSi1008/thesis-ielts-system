/**
 * API Client - Configured Axios instance with Interceptors
 * Single Responsibility: Handle HTTP transport, Token injection, and Error normalization
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';

// ── Global subscription error event bus ────────────────────────────────────────
// Any 403 with a known subscription error code is emitted here.
// GlobalUpgradeModal in layout.tsx listens and shows the upgrade prompt.
export const subscriptionEvents = {
  listeners: [] as ((error: any) => void)[],
  on(cb: (error: any) => void) { this.listeners.push(cb); },
  off(cb: (error: any) => void) { this.listeners = this.listeners.filter(l => l !== cb); },
  emit(error: any) { this.listeners.forEach(l => l(error)); },
};

const SUBSCRIPTION_ERROR_CODES = new Set([
  'SUBSCRIPTION_REQUIRED',
  'QUOTA_EXCEEDED',
  'DAILY_QUOTA_EXCEEDED',
  'DECK_LIMIT_REACHED',
  'CARD_LIMIT_REACHED',
]);

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request Interceptor: Inject Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // In Next.js client-side, using localStorage is fine.
    // Ensure this code runs on client side or handle checking window existence
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN); // or 'token' if not migrated yet
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors (401, subscription 403, etc.)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Detect and broadcast subscription-related 403 errors
    if (error.response?.status === 403) {
      const data = error.response.data as any;
      if (data?.error && SUBSCRIPTION_ERROR_CODES.has(data.error)) {
        subscriptionEvents.emit(data);
      }
    }

    // Normalize Error (keep original object so callers can inspect response.data)
    const axiosError = Object.assign(new Error(
      (error.response?.data as any)?.message || error.message || 'Unknown API Error'
    ), { response: error.response });
    return Promise.reject(axiosError);
  }
);

/**
 * Helper methods to keep usage clean: api.get<T>(...)
 */
export const api = {
  get: <T>(url: string, config?: any) => apiClient.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: any) => apiClient.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: any) => apiClient.put<T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: any) => apiClient.patch<T>(url, data, config),
  delete: <T>(url: string, config?: any) => apiClient.delete<T>(url, config),
};

export default api;
