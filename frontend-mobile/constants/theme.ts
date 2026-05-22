export interface ThemeTokens {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  onPrimary: string;
  border: string;
  borderFocus: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Alert backgrounds
  successBg: string;
  warningBg: string;
  errorBg: string;
  infoBg: string;
  
  // Platform preferences
  statusBar: 'dark-content' | 'light-content';

  // New Semantic Tokens
  bgElevated: string;
  bgSubtle: string;
  bgInverse: string;
  textOnAccent: string;
  textInverse: string;
  borderStrong: string;
  borderInteractive: string;
  overlay: string;
}

export const LIGHT_TOKENS: ThemeTokens = {
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
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  successBg: '#E8F5E9',
  warningBg: '#FFF3E0',
  errorBg: '#FFEBEE',
  infoBg: '#E0F2FE',
  
  statusBar: 'dark-content',

  // New Semantic Tokens
  bgElevated: '#FFFFFF',
  bgSubtle: '#F1F5F9',
  bgInverse: '#0F172A',
  textOnAccent: '#212529',
  textInverse: '#F8FAFC',
  borderStrong: '#94A3B8',
  borderInteractive: '#FFC600',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const DARK_TOKENS: ThemeTokens = {
  primary: '#FFC600',
  primaryHover: '#FFC600E6',
  secondary: '#334155', // Slate 700
  background: '#0F172A', // Slate 900
  surface: '#1E293B', // Slate 800
  card: '#1E293B', // Slate 800
  text: '#F8FAFC', // Slate 50
  textSecondary: '#94A3B8', // Slate 400
  textMuted: '#94A3B8', // Slate 400 — bumped from Slate 500 for WCAG AA on dark bg
  textDisabled: '#64748B', // Slate 500
  onPrimary: '#0F172A', // Slate 900 (strong contrast on brand yellow)
  border: '#334155', // Slate 700
  borderFocus: '#FFC600',
  success: '#22C55E', // Green 500
  error: '#EF4444', // Red 500
  warning: '#F59E0B', // Amber 500
  info: '#3B82F6', // Blue 500
  
  successBg: '#064E3B', // Deep rich green
  warningBg: '#78350F', // Deep rich amber
  errorBg: '#450A0A', // Deep rich red
  infoBg: '#0C4A6E', // Deep rich blue
  
  statusBar: 'light-content',

  // New Semantic Tokens
  bgElevated: '#1E293B',
  bgSubtle: '#0F172A',
  bgInverse: '#FFFFFF',
  textOnAccent: '#0F172A',
  textInverse: '#0F172A',
  borderStrong: '#475569',
  borderInteractive: '#FFC600',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

