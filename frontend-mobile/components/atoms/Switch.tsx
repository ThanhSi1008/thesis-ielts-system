import React from 'react';
import { Switch as RNSwitch, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function Switch({
  value,
  onValueChange,
  disabled = false,
}: SwitchProps) {
  const { colors } = useTheme();

  const handleValueChange = (newValue: boolean) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(newValue);
  };

  // Determine standard platform switch colors based on theme tokens
  const activeTrackColor = colors.primary; // Active green/yellow accent track color
  const inactiveTrackColor = Platform.OS === 'ios' ? colors.border : colors.textDisabled;
  const thumbColorOn = colors.onPrimary || '#FFFFFF';
  const thumbColorOff = Platform.OS === 'ios' ? '#FFFFFF' : colors.textSecondary;

  return (
    <RNSwitch
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
      trackColor={{
        false: inactiveTrackColor,
        true: activeTrackColor,
      }}
      thumbColor={value ? thumbColorOn : thumbColorOff}
      ios_backgroundColor={inactiveTrackColor}
    />
  );
}
