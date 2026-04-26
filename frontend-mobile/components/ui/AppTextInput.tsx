import React, { forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tiện ích ghép class NativeWind chuẩn, chống conflict
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AppTextInputProps extends TextInputProps {
  label?: string;
  errorMessage?: string;
  containerClassName?: string;
  inputClassName?: string;
}

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  (
    {
      label,
      errorMessage,
      containerClassName,
      inputClassName,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!errorMessage;

    return (
      <View className={cn('w-full mb-4', containerClassName)}>
        {/* Label */}
        {label && (
          <Text className="text-sm font-medium text-dark mb-1.5">
            {label}
          </Text>
        )}

        {/* Input Field */}
        <View
          className={cn(
            'flex-row items-center w-full h-12 px-4 rounded-md border bg-white',
            hasError
              ? 'border-danger bg-danger/10'
              : 'border-slate-200 focus:border-primary',
            className
          )}
        >
          <TextInput
            ref={ref}
            className={cn('flex-1 text-base text-dark', inputClassName)}
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            {...props}
          />
        </View>

        {/* Error Message */}
        {hasError && (
          <Text className="text-xs text-danger mt-1.5 ml-1">
            {errorMessage}
          </Text>
        )}
      </View>
    );
  }
);

AppTextInput.displayName = 'AppTextInput';
