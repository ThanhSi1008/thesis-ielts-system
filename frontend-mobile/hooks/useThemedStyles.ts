import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeTokens } from '@/constants';

/**
 * Custom hook to generate theme-aware memoized styles.
 *
 * @param factory A function that takes ThemeTokens and returns a stylesheet or style objects.
 * @returns The memoized style object returned by the factory.
 */
export function useThemedStyles<T>(factory: (colors: ThemeTokens) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors]);
}
