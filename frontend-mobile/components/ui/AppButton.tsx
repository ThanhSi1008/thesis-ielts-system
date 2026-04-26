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

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  isLoading = false,
  variant = 'primary',
  className,
  textClassName,
  disabled,
  ...props
}) => {
  // Styles based on variants
  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-slate-200',
    outline: 'bg-transparent border-2 border-blue-600',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-slate-800',
    outline: 'text-blue-600',
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={cn(
        'w-full h-14 rounded-xl flex-row items-center justify-center',
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
