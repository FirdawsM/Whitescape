export const themes = {
  dark: {
    background: '#0A0A0F',
    card: '#12121F',
    cardActive: '#1A1A30',
    accent: '#6C63FF',
    accentGlow: 'rgba(108, 99, 255, 0.3)',
    text: '#FFFFFF',
    subtext: '#888899',
    border: 'rgba(108, 99, 255, 0.2)',
    timerBg: '#0D0D1A',
  },
  gray: {
    background: '#1A1A2E',
    card: '#242438',
    cardActive: '#2E2E50',
    accent: '#6C63FF',
    accentGlow: 'rgba(108, 99, 255, 0.3)',
    text: '#EEEEEE',
    subtext: '#999AAA',
    border: 'rgba(108, 99, 255, 0.2)',
    timerBg: '#1E1E35',
  },
  white: {
    background: '#F5F5FA',
    card: '#FFFFFF',
    cardActive: '#EAE9FF',
    accent: '#6C63FF',
    accentGlow: 'rgba(108, 99, 255, 0.2)',
    text: '#1A1A2E',
    subtext: '#666677',
    border: 'rgba(108, 99, 255, 0.25)',
    timerBg: '#EAE9FF',
  },
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes.dark;