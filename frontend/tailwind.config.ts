import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light surfaces (auto-switch via CSS variables)
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'soft-shell': 'rgb(var(--c-soft-shell) / <alpha-value>)',
        panel: 'rgb(var(--c-surface) / <alpha-value>)',
        'panel-raised': 'rgb(var(--c-soft-shell) / <alpha-value>)',

        // Text hierarchy
        text: {
          DEFAULT: 'rgb(var(--c-text) / <alpha-value>)',
          muted: 'rgb(var(--c-text-muted) / <alpha-value>)',
          faint: 'rgb(var(--c-text-faint) / <alpha-value>)',
          whisper: 'rgb(var(--c-text-whisper) / <alpha-value>)',
        },

        // Primary accent
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          hover: 'rgb(var(--c-accent-hover) / <alpha-value>)',
          light: 'rgb(var(--c-accent-light) / <alpha-value>)',
        },

        // Severity colors (clinical meaning ONLY)
        amber: {
          DEFAULT: 'rgb(var(--c-amber) / <alpha-value>)',
          light: 'rgb(var(--c-amber-light) / <alpha-value>)',
        },
        critical: {
          DEFAULT: 'rgb(var(--c-critical) / <alpha-value>)',
          light: 'rgb(var(--c-critical-light) / <alpha-value>)',
        },

        // Structural
        hairline: {
          DEFAULT: 'rgb(var(--c-hairline) / <alpha-value>)',
          strong: 'rgb(var(--c-hairline-strong) / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['Satoshi', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        content: '1120px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'card-elevated': 'var(--shadow-card-elevated)',
      },
      keyframes: {
        'shimmer': {
          '0%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
          '100%': { opacity: '0.4' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-fill': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'progress-fill': 'progress-fill 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
