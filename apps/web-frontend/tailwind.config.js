/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          // Semantic colors
          info: {
            bg: '#DBEAFE',
            DEFAULT: '#2563EB',
          },
          success: {
            bg: '#DCFCE7',
            DEFAULT: '#16A34A',
          },
          warning: {
            bg: '#FFEDD5',
            DEFAULT: '#EA580C',
          },
          danger: {
            bg: '#FEE2E2',
            DEFAULT: '#DC2626',
          },
          // Neutrals
          page: '#F5F6FA',
          surface: '#FFFFFF',
          sidebar: '#0F1B3D',
          border: '#E5E7EB',
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        fontSize: {
          display: ['24px', { lineHeight: '1.2', fontWeight: '600' }],
          heading: ['17px', { lineHeight: '1.2', fontWeight: '600' }],
          stat: ['30px', { lineHeight: '1.2', fontWeight: '700' }],
          body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
          label: ['13px', { lineHeight: '1.4', fontWeight: '400' }],
          delta: ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        },
        borderRadius: {
          card: '12px',
          badge: '8px',
          pill: '999px',
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
      },
    },
    plugins: [],
  };