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
    defaultValues: { 
      firstName: 'Si', 
      lastName: 'Thanh', 
      email: 'test@example.com', 
      password: '12345678', 
      confirmPassword: '12345678' 
    },
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
      <View className="flex-row gap-3 mb-1">
        <View className="flex-1">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="First Name"
                placeholder="Ex: Si"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.firstName?.message}
                editable={!isPending}
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Last Name"
                placeholder="Ex: Thanh"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.lastName?.message}
                editable={!isPending}
              />
            )}
          />
        </View>
      </View>
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

      <View className="w-full flex-row justify-center items-center mb-6 mt-1">
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
