/**
 * Application Constants
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Dynamically extract the local IP from Expo's dev server if available
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost?.split(':')[0];

// 1. Try to use .env explicitly if it exists and isn't using a dummy value
// 2. Fall back to the dynamically detected local IP (works seamlessly on any WiFi)
// 3. Absolute fallback (mostly for emulators)
const fallbackUrl = localIp 
  ? `http://${localIp}:3000/api/v1` 
  : Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || fallbackUrl;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Colors - Design System (Synced with Web)
export const COLORS = {
  // Brand Colors (Levels)
  level1: '#FFC600', // Vocabulary (Yellow)
  level2: '#5B9557', // Grammar (Green)
  level3: '#E74C3C', // Advanced (Red)
  level4: '#3B82F6', // Mastery (Blue)

  // Primary (Default Blue for generic UI)
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Secondary
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  
  // Neutral
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#212529',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',
  border: '#DEE2E6',
  
  // Status
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#EF4444',
  info: '#0DCAF0',
} as const;

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Border Radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
