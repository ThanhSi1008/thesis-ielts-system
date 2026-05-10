import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
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
          '0%': { opacity: '0', transform: 'translateX(-80px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(80px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        waveform: 'waveform 1s ease-in-out infinite',
        'slide-in-left': 'slide-in-left  0.7s cubic-bezier(0.22,1,0.36,1) both',
        'slide-in-right': 'slide-in-right 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-up': 'fade-up        0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#1a1a1a',
            '--tw-prose-headings': '#0f0f0f',
            '--tw-prose-bold': '#111111',
            '--tw-prose-bullets': '#94a3b8',
            '--tw-prose-counters': '#64748b',

            // Paragraph
            p: { marginTop: '0.6em', marginBottom: '0.6em', lineHeight: '1.75' },

            // Headings
            h2: {
              fontSize: '1.15rem',
              fontWeight: '700',
              borderBottom: '2px solid #f3f4f6',
              paddingBottom: '0.35em',
              marginTop: '1.8em',
              marginBottom: '0.75em',
            },
            h3: { fontSize: '1rem', fontWeight: '700', marginTop: '1.2em', marginBottom: '0.4em' },

            // Lists
            li: { marginTop: '0.35em', marginBottom: '0.35em', lineHeight: '1.7' },
            'ul > li': { listStyleType: '"▸ "', paddingLeft: '0.25em' },
            'ul > li::marker': { color: '#64748b', fontSize: '1.1em' },
            'ul ul > li': { listStyleType: 'circle', paddingLeft: '0' },
            'ul ul ul > li': { listStyleType: 'square' },

            // Bold
            strong: { fontWeight: '700', color: '#0f0f0f' },

            // Inline code — no backtick quotes
            code: {
              backgroundColor: 'rgba(0,0,0,0.06)',
              borderRadius: '4px',
              padding: '0.15em 0.45em',
              fontWeight: '600',
              fontSize: '0.85em',
              color: 'inherit',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },

            // Blockquote — adaptive styling
            blockquote: {
              borderLeftColor: 'rgba(0, 0, 0, 0.15)',
              borderLeftWidth: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.035)',
              borderRadius: '4px',
              padding: '0.85em 1.2em',
              color: 'inherit',
              fontStyle: 'italic',
              fontWeight: '500',
            },
            'blockquote p': { margin: '0' },

            // HR
            hr: { borderColor: 'rgba(0, 0, 0, 0.1)', marginTop: '2em', marginBottom: '2em' },

            // Tables — adaptive header, semi-transparent rows
            table: {
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)',
              fontSize: '0.875rem'
            },
            thead: { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
            'thead th': {
              color: 'inherit',
              fontWeight: '700',
              padding: '1em 1.5em',
              textAlign: 'left',
              fontSize: '0.78rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            },
            'tbody tr': { borderBottom: '1px solid rgba(0, 0, 0, 0.05)' },
            'tbody tr:nth-child(even)': { backgroundColor: 'rgba(255, 255, 255, 0.4)' },
            'tbody tr:last-child': { border: 'none' },
            td: { padding: '1em 1.5em', verticalAlign: 'top', color: 'inherit', lineHeight: '1.7' },
            // Override typography plugin's opinionated first/last-child padding resets
            'td:first-child': { paddingLeft: '1.5em' },
            'td:last-child': { paddingRight: '1.5em' },
            'th:first-child': { paddingLeft: '1.5em' },
            'th:last-child': { paddingRight: '1.5em' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config

