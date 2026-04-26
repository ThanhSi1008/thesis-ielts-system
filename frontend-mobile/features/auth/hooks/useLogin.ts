import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '../../../core/api/client';
import { useAuthStore } from '../../../core/auth/store';
import { LoginFormValues, AuthResponse } from '../types';

export const useLogin = () => {
  return useMutation<AuthResponse, AxiosError<{ message: string }>, LoginFormValues>({
    mutationFn: async (credentials) => {
      // Gửi yêu cầu đăng nhập qua apiClient (base URL và interceptors đã được config sẵn)
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: async (data) => {
      // Gọi setAuthData để lưu token vào in-memory và SecureStore
      // Chờ Promise hoàn tất để đảm bảo state cập nhật trước khi navigate
      await useAuthStore.getState().setAuthData(
        data.access_token,
        data.refresh_token,
        data.user
      );
    },
    onError: (error) => {
      // Logic xử lý lỗi (ví dụ: in ra console, sau đó UI có thể catch lấy để show toast/alert)
      console.error('Login failed:', error.response?.data?.message || error.message);
    },
  });
};
