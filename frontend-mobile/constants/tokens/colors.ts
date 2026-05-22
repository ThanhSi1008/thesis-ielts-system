export const palette = {
  yellow: {
    50: '#FFFDF0',
    100: '#FFF9D2',
    500: '#FFC600',
    600: '#E0AE00',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  emerald: {
    50: '#E8F5E9',
    500: '#4CAF50',
    600: '#22C55E',
  },
  rose: {
    50: '#FFEBEE',
    500: '#F44336',
    600: '#EF4444',
  },
  amber: {
    50: '#FFF3E0',
    500: '#FF9800',
    600: '#F59E0B',
  },
  blue: {
    50: '#E0F2FE',
    500: '#2196F3',
    600: '#3B82F6',
  },
} as const;

export const semanticColors = {
  primary: palette.yellow[500],
  primaryHover: 'rgba(255, 198, 0, 0.9)',
  secondaryLight: '#EDEDED',
  secondaryDark: palette.slate[700],
  
  bgLight: '#FFFFFF',
  bgDark: palette.slate[900],
  surfaceLight: palette.slate[50],
  surfaceDark: palette.slate[800],
  
  textLight: '#212529',
  textDark: '#F8FAFC',
  
  success: palette.emerald[500],
  error: palette.rose[500],
  warning: palette.amber[500],
  info: palette.blue[500],
} as const;
