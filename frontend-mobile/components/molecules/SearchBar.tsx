import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing } from '@/constants';
import Input from '../atoms/Input';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch: (text: string) => void;
  placeholder?: string;
  showVoice?: boolean;
  onVoicePress?: () => void;
  style?: ViewStyle;
}

export default function SearchBar({
  value = '',
  onChangeText,
  onSearch,
  placeholder = 'Search...',
  showVoice = false,
  onVoicePress,
  style,
}: SearchBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [localText, setLocalText] = useState(value);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setLocalText(value);
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleChangeText = (text: string) => {
    setLocalText(text);
    if (onChangeText) {
      onChangeText(text);
    }

    // Debounce the onSearch callback (300ms)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearch(text);
    }, 300);
  };

  const handleClear = () => {
    setLocalText('');
    if (onChangeText) {
      onChangeText('');
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onSearch('');
  };

  return (
    <View style={[styles.container, style]}>
      <Input
        value={localText}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        leftIcon="search-outline"
        onClear={handleClear}
        style={styles.inputOverride}
      />
      {showVoice && localText.length === 0 && onVoicePress && (
        <Pressable
          onPress={onVoicePress}
          style={styles.voiceButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Voice Search"
        >
          <Ionicons name="mic-outline" size={20} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      position: 'relative',
    },
    inputOverride: {
      flex: 1,
    },
    voiceButton: {
      position: 'absolute',
      right: spacing[3],
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
