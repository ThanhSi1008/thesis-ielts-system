import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  textClassName?: string;
}

export const AppButton = ({
  title,
  isLoading = false,
  variant = 'primary',
  className,
  textClassName,
  disabled,
  ...props
}: AppButtonProps) => {
  // Styles based on variants
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'bg-transparent border-2 border-primary',
  };

  const textVariantClasses = {
    primary: 'text-dark',
    secondary: 'text-dark',
    outline: 'text-primary',
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={cn(
        'w-full h-14 rounded-lg flex-row items-center justify-center',
        variantClasses[variant],
        isDisabled && 'opacity-60',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? '#2563eb' : '#ffffff'} 
          size="small" 
        />
      ) : (
        <Text
          className={cn(
            'text-lg font-semibold',
            textVariantClasses[variant],
            textClassName
          )}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
