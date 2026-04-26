import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
  className,
  transparent = false,
}: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View 
      className={cn(
        "h-[56px] flex-row items-center px-4 z-50",
        !transparent && "bg-white/95 border-b border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)]",
        className
      )}
    >
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable 
            onPress={handleBack} 
            className="p-2 -ml-2 rounded-full active:bg-gray-100"
          >
            <Ionicons name="chevron-back" size={24} color="#212529" />
          </Pressable>
        )}
        
        <View className={cn("flex-1", showBack ? "ml-2" : "")}>
          {title && (
            <Text 
              className="font-farro-bold text-sm uppercase tracking-widest text-dark"
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text 
              className="text-[10px] text-slate-500 uppercase tracking-tighter"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightElement && (
        <View className="flex-row items-center justify-end">
          {rightElement}
        </View>
      )}
    </View>
  );
}
