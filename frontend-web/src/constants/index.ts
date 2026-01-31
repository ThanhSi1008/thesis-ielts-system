/**
 * Application Constants
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  user: 'user', // Keeping 'user' as it might be used in existing code, or migrate to 'userData'
} as const;

// Colors - Design System (Matching globals.css CSS variables ideally, but defined here for JS usage)
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  error: '#EF4444',
  background: '#F3F4F6',
  surface: '#FFFFFF',
} as const;
