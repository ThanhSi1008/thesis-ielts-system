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
        }
      },
      animation: {
        waveform: 'waveform 1s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
export default config

