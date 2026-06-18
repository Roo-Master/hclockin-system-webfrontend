export const typography = {
  display: {
    size: '24px',
    weight: 600,
    lineHeight: 1.2,
  },
  heading: {
    size: '17px',
    weight: 600,
    lineHeight: 1.3,
  },
  stat: {
    size: '30px',
    weight: 700,
    lineHeight: 1.1,
  },
  body: {
    size: '14px',
    weight: 400,
    lineHeight: 1.5,
  },
  label: {
    size: '13px',
    weight: 400,
    lineHeight: 1.4,
  },
  delta: {
    size: '12px',
    weight: 500,
    lineHeight: 1.4,
  },
  caption: {
    size: '11px',
    weight: 400,
    lineHeight: 1.4,
  },
} as const;

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'Consolas', 'monospace'],
} as const;

export type Typography = typeof typography;
export type FontSize = keyof typeof typography;
