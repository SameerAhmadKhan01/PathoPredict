/** @type {import('tailwindcss').Config} */
const withAlpha = (variable) => ({ opacityValue }) => {
  if (opacityValue !== undefined) {
    return `color-mix(in srgb, var(${variable}) calc(100% * ${opacityValue}), transparent)`;
  }
  return `var(${variable})`;
};

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Direct design tokens
        bg: withAlpha('--bg'),
        surface: withAlpha('--surface'),
        elevated: withAlpha('--elevated'),
        border: withAlpha('--border'),

        text: {
          DEFAULT: withAlpha('--text'),
          muted: withAlpha('--muted'),
          faint: withAlpha('--muted'),
          whisper: withAlpha('--muted'),
        },
        muted: withAlpha('--muted'),

        primary: {
          DEFAULT: withAlpha('--primary'),
          hover: withAlpha('--primary-hover'),
        },
        'primary-hover': withAlpha('--primary-hover'),
        'on-primary': withAlpha('--on-primary'),
        'accent-text': withAlpha('--accent-text'),

        'alert-bg': withAlpha('--alert-bg'),
        'alert-text': withAlpha('--alert-text'),

        warn: {
          DEFAULT: withAlpha('--warn'),
          bg: withAlpha('--warn-bg'),
        },
        'warn-bg': withAlpha('--warn-bg'),

        info: {
          DEFAULT: withAlpha('--info'),
          bg: withAlpha('--info-bg'),
        },
        'info-bg': withAlpha('--info-bg'),

        success: {
          DEFAULT: withAlpha('--success'),
          bg: withAlpha('--success-bg'),
        },
        'success-bg': withAlpha('--success-bg'),

        // Compatibility aliases for existing classes
        accent: {
          DEFAULT: withAlpha('--primary'),
          hover: withAlpha('--primary-hover'),
          light: withAlpha('--elevated'),
        },
        'soft-shell': withAlpha('--elevated'),
        panel: withAlpha('--surface'),
        'panel-raised': withAlpha('--elevated'),
        hairline: {
          DEFAULT: withAlpha('--border'),
          strong: withAlpha('--border'),
        },
        amber: {
          DEFAULT: withAlpha('--warn'),
          light: withAlpha('--warn-bg'),
        },
        critical: {
          DEFAULT: withAlpha('--alert-bg'),
          light: withAlpha('--elevated'),
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
};
