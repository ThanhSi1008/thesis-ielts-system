import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { z } from 'zod';

import { useRegister } from '../hooks/useRegister';
import { AppTextInput } from '../../../components/ui/AppTextInput';
import { AppButton } from '../../../components/ui/AppButton';
import { AuthLayout } from '../components/AuthLayout';

import { RegisterFormValues, registerSchema } from '../types';

export function RegisterScreen() {
  const router = useRouter();
  const { mutateAsync: registerMutation, isPending } = useRegister();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setGlobalError(null);
    try {
      await registerMutation(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed.';
      setGlobalError(errorMessage);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join IELTS Master AI today."
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
            placeholder="Create a password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            errorMessage={errors.password?.message}
            editable={!isPending}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppTextInput
            label="Confirm Password"
            placeholder="Repeat your password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            errorMessage={errors.confirmPassword?.message}
            editable={!isPending}
          />
        )}
      />

      <View className="w-full flex-row justify-center items-center mb-8 mt-2">
        <Text className="text-slate-600 font-medium mr-2">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text className="text-primary font-bold">Sign In</Text>
        </TouchableOpacity>
      </View>

      <AppButton
        title="Sign Up"
        onPress={handleSubmit(onSubmit)}
        isLoading={isPending}
      />
    </AuthLayout>
  );
}
