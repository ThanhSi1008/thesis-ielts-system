/**
 * Application Constants - Synced with design-tokens.json
 */

// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.2:3000/api/v1';

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Colors from design-tokens.json
export const COLORS = {
  primary: '#FFC600',
  primaryHover: '#FFC600E6',
  secondary: '#EDEDED',
  
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  
  text: '#212529',
  textSecondary: '#64748B',
  textMuted: '#ADB5BD',
  textDisabled: '#CBD5E1',
  onPrimary: '#212529',
  
  border: '#E2E8F0',
  borderFocus: '#FFC600',
  
  // Semantic shorthand aliases (used across the codebase)
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Legacy/Specific
  level1: '#FFC600',
  level2: '#5B9557',
  level3: '#E74C3C',
  level4: '#3B82F6',
} as const;

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  xxxxl: 36,
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

// Border Radius
export const RADIUS = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 300,
  normal: 600,
  slow: 1000,
} as const;

// Font Families
export const FONTS = {
  light: 'Farro-Light',
  regular: 'Farro-Regular',
  medium: 'Farro-Medium',
  semibold: 'Farro-Medium',
  bold: 'Farro-Bold',
} as const;

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  card: '0 1px 4px rgba(0, 0, 0, 0.03)',
  modal: '0 20px 25px rgba(0, 0, 0, 0.1)',
} as const;
