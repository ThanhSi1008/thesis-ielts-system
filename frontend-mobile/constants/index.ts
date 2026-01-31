/**
 * Application Constants
 */

// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Colors - Design System
export const COLORS = {
  // Primary
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Secondary
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  
  // Accent
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentLight: '#FBBF24',
  
  // Neutral
  background: '#F3F4F6',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
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
