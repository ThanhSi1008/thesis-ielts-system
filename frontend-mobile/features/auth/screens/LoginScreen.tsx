import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';

import { loginSchema, LoginFormValues } from '../types';
import { useLogin } from '../hooks/useLogin';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppButton } from '../../../components/ui/AppButton';
import { AuthLayout } from '../components/AuthLayout';

export function LoginScreen() {
  const router = useRouter();
  const { mutateAsync: loginMutation, isPending } = useLogin();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'test@example.com', password: '12345678' },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      await loginMutation(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Something went wrong.';
      setGlobalError(errorMessage);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back!" 
      subtitle="Sign in to continue your IELTS journey."
      globalError={globalError}
    >
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
            editable={!isPending}
          />
        )}
      />

      <View className="w-full flex-row justify-between items-center mb-8">
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text className="text-slate-600 font-medium">Don't have an account?</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-primary font-medium">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <AppButton
        title="Sign In"
        onPress={handleSubmit(onSubmit)}
        isLoading={isPending}
      />
    </AuthLayout>
  );
}
