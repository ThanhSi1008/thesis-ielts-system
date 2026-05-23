import React, { forwardRef } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing } from '@/constants';
import Text from '../atoms/Text';
import Input, { InputProps } from '../atoms/Input';

export interface FormFieldProps extends Omit<InputProps, 'error'> {
  label?: string;
  errorMessage?: string;
  hintMessage?: string;
  containerStyle?: any;
}

const FormField = forwardRef<TextInput, FormFieldProps>(
  ({ label, errorMessage, hintMessage, containerStyle, ...props }, ref) => {
    const styles = useThemedStyles(createStyles);
    const hasError = !!errorMessage;

    return (
      <View style={[styles.fieldContainer, containerStyle]}>
        {/* Label */}
        {label && (
          <Text variant="label" color="text" style={styles.label}>
            {label}
          </Text>
        )}

        {/* Input */}
        <Input ref={ref} error={hasError} {...props} />

        {/* Error or Hint message */}
        {hasError ? (
          <Text variant="caption" color="error" style={styles.feedbackText}>
            {errorMessage}
          </Text>
        ) : hintMessage ? (
          <Text variant="caption" color="textSecondary" style={styles.feedbackText}>
            {hintMessage}
          </Text>
        ) : null}
      </View>
    );
  },
);

FormField.displayName = 'FormField';

function createStyles() {
  return StyleSheet.create({
    fieldContainer: {
      width: '100%',
      marginBottom: spacing[4],
    },
    label: {
      marginBottom: spacing[2],
    },
    feedbackText: {
      marginTop: spacing[1],
      marginLeft: spacing[1],
    },
  });
}

export default FormField;
