import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius, typography, FONTS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  error?: boolean;
  secureTextEntry?: boolean;
  onClear?: () => void;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      style,
      leftIcon,
      rightIcon,
      error = false,
      secureTextEntry = false,
      value = '',
      onChangeText,
      onClear,
      placeholderTextColor,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    const hasValue = value.length > 0;

    const handleClear = () => {
      if (onChangeText) onChangeText('');
      if (onClear) onClear();
    };

    return (
      <View
        style={[
          styles.container,
          isFocused && styles.focused,
          error && styles.error,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? colors.error : isFocused ? colors.primary : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          placeholderTextColor={placeholderTextColor || colors.textMuted}
          style={[styles.input, style]}
          {...props}
        />

        {/* Clear Button */}
        {hasValue && !secureTextEntry && onClear && (
          <Pressable 
            onPress={handleClear} 
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.rightIconWrapper}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}

        {/* Password toggle visibility */}
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.rightIconWrapper}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}

        {/* Custom right icon (if password toggle is not present) */}
        {!secureTextEntry && rightIcon && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={error ? colors.error : colors.textSecondary}
            style={styles.rightIcon}
          />
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 48,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing[3],
    },
    focused: {
      borderColor: colors.borderFocus,
      backgroundColor: colors.bgElevated,
    },
    error: {
      borderColor: colors.error,
      backgroundColor: colors.errorBg || '#FFEBEE',
    },
    input: {
      flex: 1,
      height: '100%',
      fontFamily: FONTS.regular,
      fontSize: typography.body.fontSize,
      color: colors.text,
      paddingVertical: 0,
      marginVertical: 0,
    },
    leftIcon: {
      marginRight: spacing[2],
    },
    rightIcon: {
      marginLeft: spacing[2],
    },
    rightIconWrapper: {
      padding: spacing[1],
      marginLeft: spacing[2],
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

export default Input;
