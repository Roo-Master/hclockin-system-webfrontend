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
        // Semantic colors
        'info-bg': '#DBEAFE',
        'info': '#2563EB',
        'success-bg': '#DCFCE7',
        'success': '#16A34A',
        'warning-bg': '#FFEDD5',
        'warning': '#EA580C',
        'danger-bg': '#FEE2E2',
        'danger': '#DC2626',
        // Neutrals
        'page': '#F5F6FA',
        'surface': '#FFFFFF',
        'sidebar': '#0F1B3D',
        'border': '#E5E7EB',
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
        display: '24px',
        heading: '17px',
        stat: '30px',
        body: '14px',
        label: '13px',
        delta: '12px',
      },
      fontWeight: {
        display: '600',
        heading: '600',
        stat: '700',
        body: '400',
        label: '400',
        delta: '500',
      },
      borderRadius: {
        card: '12px',
        badge: '8px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
