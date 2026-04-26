import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, LoginFormValues } from '../types';
import { useLogin } from '../hooks/useLogin';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppButton } from '../../../components/ui/AppButton';

export function LoginScreen() {
  const { mutateAsync: loginMutation, isPending } = useLogin();
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Khởi tạo React Hook Form với Zod Resolver
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    // Mode 'onChange' giúp validate real-time khi user gõ phím
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    Keyboard.dismiss(); // Ẩn bàn phím khi bắt đầu submit

    try {
      await loginMutation(data);
      // Nếu thành công, useAuthStore sẽ tự động cập nhật isAuthenticated = true
      // Root Layout (_layout.tsx) sẽ lắng nghe biến này và điều hướng vào (tabs)
    } catch (error: any) {
      // Bắt lỗi từ backend (401 Unauthorized) và hiển thị lên UI
      const errorMessage =
        error.response?.data?.message || 'Something went wrong. Please try again.';
      setGlobalError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // Sử dụng behavior 'padding' trên iOS và 'height' trên Android để tránh bàn phím đè lên UI
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="bg-slate-50 px-6 py-10"
        >
          <View className="mb-10">
            <Text className="text-4xl font-bold text-slate-900 mb-2">Welcome Back!</Text>
            <Text className="text-base text-slate-500">
              Sign in to continue your IELTS journey.
            </Text>
          </View>

          {/* Global Error Banner */}
          {globalError && (
            <View className="bg-red-100 p-4 rounded-xl mb-6 border border-red-200">
              <Text className="text-red-700 text-sm font-medium">{globalError}</Text>
            </View>
          )}

          {/* Form Fields - Sử dụng Controller để bọc các Component UI nhằm tránh re-render cả màn hình */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.email?.message}
                // Khóa input khi đang gọi API
                editable={!isPending}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.password?.message}
                // Khóa input khi đang gọi API
                editable={!isPending}
              />
            )}
          />

          {/* Nút quên mật khẩu (Placeholder) */}
          <View className="w-full items-end mb-8">
            <Text className="text-blue-600 font-medium">Forgot Password?</Text>
          </View>

          {/* Submit Button */}
          <AppButton
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            isLoading={isPending}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
