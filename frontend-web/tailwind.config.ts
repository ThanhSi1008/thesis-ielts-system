import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFC600',
        secondary: '#EDEDED',
        success: '#4CAF50',
        danger: '#F44336',
        info: '#2196F3',
        warning: '#FF9800',
        light: '#f8f9fa',
        dark: '#212529',
      },
      fontFamily: {
        sans: ['Farro', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-80px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(80px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        waveform:        'waveform 1s ease-in-out infinite',
        'slide-in-left':  'slide-in-left  0.7s cubic-bezier(0.22,1,0.36,1) both',
        'slide-in-right': 'slide-in-right 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-up':        'fade-up        0.6s cubic-bezier(0.22,1,0.36,1) both',
      }

    },
  },
  plugins: [],
}
export default config

