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
        // PromptForge design tokens — mirrored in globals.css as CSS variables
        forge: {
          accent: '#e8ff47',       // Electric yellow-green — primary accent
          bg: '#0a0a0b',           // True black — app background
          surface: '#111113',      // Slightly lighter — cards, panels
          'surface-2': '#1a1a1e', // Hover / active states
          'surface-3': '#222228', // Borders, dividers
          muted: '#6b6b7a',       // Muted text
          'muted-fg': '#9898a8',  // Slightly brighter muted
          fg: '#f0f0f5',          // Primary foreground text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Forge typography scale
        'forge-xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'forge-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'forge-base': ['1rem', { lineHeight: '1.5rem' }],
        'forge-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'forge-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'forge-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'forge-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'forge-4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        'forge-sm': '0.25rem',
        forge: '0.375rem',
        'forge-md': '0.5rem',
        'forge-lg': '0.75rem',
        'forge-xl': '1rem',
      },
      boxShadow: {
        'forge-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        forge: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
        'forge-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
        'forge-accent': '0 0 20px rgba(232, 255, 71, 0.15)',
      },
      animation: {
        'forge-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'forge-spin': 'spin 1s linear infinite',
        'forge-fade-in': 'fadeIn 0.2s ease-in-out',
        'forge-slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
