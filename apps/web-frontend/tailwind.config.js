/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        info: { DEFAULT: '#2563EB', bg: '#DBEAFE' },
        success: { DEFAULT: '#16A34A', bg: '#DCFCE7' },
        warning: { DEFAULT: '#EA580C', bg: '#FFEDD5' },
        danger: { DEFAULT: '#DC2626', bg: '#FEE2E2' },
        page: '#F5F6FA',
        surface: '#FFFFFF',
        sidebar: '#0F1B3D',
        border: '#E5E7EB',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
      },
      fontSize: {
        display: ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        heading: ['17px', { lineHeight: '1.4', fontWeight: '600' }],
        stat: ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        label: ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        delta: ['12px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      borderRadius: {
        card: '12px',
        badge: '8px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};