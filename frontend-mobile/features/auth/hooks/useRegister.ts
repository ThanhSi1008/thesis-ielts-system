import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '../../../core/api/client';
import { useAuthStore } from '../../../core/auth/store';
import { RegisterFormValues, AuthResponse } from '../types';

export const useRegister = () => {
  return useMutation<AuthResponse, AxiosError<{ message: string }>, RegisterFormValues>({
    mutationFn: async ({ confirmPassword, ...payload }) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
      return data;
    },
    onSuccess: async (data) => {
      await useAuthStore.getState().setAuthData(
        data.access_token,
        data.refresh_token,
        data.user
      );
    },
    onError: (error) => {
      console.error('Register failed:', error.response?.data?.message || error.message);
    },
  });
};
