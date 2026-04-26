import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FSRSRatingBarProps {
  onRate: (rating: number) => void;
  disabled?: boolean;
}

const RATINGS = [
  { label: 'Again', value: 1, color: 'bg-danger', activeColor: 'bg-red-700' },
  { label: 'Hard', value: 2, color: 'bg-warning', activeColor: 'bg-orange-700' },
  { label: 'Good', value: 3, color: 'bg-success', activeColor: 'bg-green-700' },
  { label: 'Easy', value: 4, color: 'bg-info', activeColor: 'bg-blue-700' },
];

/**
 * Thanh chấm điểm FSRS (Module 2 - VOCAB-03)
 * Cung cấp 4 nút: Again (1), Hard (2), Good (3), Easy (4)
 */
export const FSRSRatingBar = React.memo(({ onRate, disabled }: FSRSRatingBarProps) => {
  return (
    <View className="flex-row w-full gap-2 px-4 py-6 mb-4">
      {RATINGS.map((rating) => (
        <Pressable
          key={rating.value}
          disabled={disabled}
          onPress={() => onRate(rating.value)}
          className={cn(
            "flex-1 py-4 rounded-2xl items-center justify-center shadow-md",
            rating.color,
            disabled && "opacity-50"
          )}
          style={({ pressed }) => [
            pressed && { transform: [{ scale: 0.92 }] }
          ]}
        >
          <Text className="text-white font-farro-bold text-xs uppercase tracking-widest">
            {rating.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});
