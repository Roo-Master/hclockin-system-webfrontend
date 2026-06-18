export const colors = {
  // Semantic colors
  semantic: {
    info: {
      bg: '#DBEAFE',
      text: '#2563EB',
      border: '#2563EB',
      light: '#EFF6FF',
      dark: '#1E40AF',
    },
    success: {
      bg: '#DCFCE7',
      text: '#16A34A',
      border: '#16A34A',
      light: '#F0FDF4',
      dark: '#15803D',
    },
    warning: {
      bg: '#FFEDD5',
      text: '#EA580C',
      border: '#EA580C',
      light: '#FFF7ED',
      dark: '#C2410C',
    },
    danger: {
      bg: '#FEE2E2',
      text: '#DC2626',
      border: '#DC2626',
      light: '#FEF2F2',
      dark: '#B91C1C',
    },
  },

  // Neutral colors
  neutral: {
    page: '#F5F6FA',
    surface: '#FFFFFF',
    sidebar: '#0F1B3D',
    border: '#E5E7EB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      disabled: '#D1D5DB',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },
  },

  // Chart colors
  chart: {
    blue: '#2563EB',
    green: '#16A34A',
    amber: '#EA580C',
    red: '#DC2626',
    purple: '#7C3AED',
    pink: '#EC4899',
    indigo: '#4F46E5',
    teal: '#14B8A6',
    orange: '#F97316',
    gray: '#6B7280',
  },
} as const;

export type SemanticColor = keyof typeof colors.semantic;
export type Color = typeof colors;
