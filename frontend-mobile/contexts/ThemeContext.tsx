import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeTokens, LIGHT_TOKENS, DARK_TOKENS, STORAGE_KEYS } from '@/constants';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeTokens;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  // Load saved theme preference on startup
  useEffect(() => {
    async function loadSavedTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load saved theme preference:', error);
      }
    }
    loadSavedTheme();
  }, []);

  // Listen to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Persist and update the theme setting
  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Determine the active resolved theme
  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme;

  // Resolve the current active token palette
  const colors: ThemeTokens = resolvedTheme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
  const isDark = resolvedTheme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, isDark, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
