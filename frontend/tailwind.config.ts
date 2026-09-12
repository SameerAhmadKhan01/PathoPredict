import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0d12',
        'bg-panel': '#10151d',
        'bg-panel-raised': '#141a23',
        panel: '#10151d',
        'panel-raised': '#141a23',
        hairline: 'rgba(236, 234, 228, 0.12)',
        'hairline-strong': 'rgba(236, 234, 228, 0.22)',
        text: '#ece9e2',
        'text-muted': '#8c92a0',
        'text-faint': '#5c6270',
        muted: '#8c92a0',
        faint: '#5c6270',
        red: {
          DEFAULT: '#c5313c',
          deep: '#7a1b22',
          dim: '#8f2a30',
        },
        'red-deep': '#7a1b22',
        'red-dim': '#8f2a30',
        blue: {
          DEFAULT: '#3f74ad',
          deep: '#1f3b5c',
          dim: '#335f8c',
        },
        'blue-deep': '#1f3b5c',
        'blue-dim': '#335f8c',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '3px',
      },
      maxWidth: {
        content: '1120px',
      },
    },
  },
  plugins: [],
} satisfies Config;
