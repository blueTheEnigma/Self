export const Colors = {
  // 60% Dominant Neutral: Alabaster & Warm Parchment Light Theme
  background: '#faf9f6',
  canvasTexture: '#f3f2ee',
  surface: '#ffffff',
  surfaceHighlight: '#f4f3ef',
  surfaceElevated: '#eae8e1',
  
  // 30% Structural Borders & Dividers
  border: '#e6e4dc',
  borderLight: '#dedbd1',
  borderFocus: '#94a3b8',

  // 10% Intentional Purpose-Driven Accents (Weinschenk 60-30-10 Rule)
  // Deep Indigo: Deep Work, Math Sprint, Code Engine
  primary: '#4338ca',
  primaryMuted: '#e0e7ff',
  primaryGlow: 'rgba(67, 56, 202, 0.12)',

  // Sage & Forest Emerald: Health, Purity, Satiety, Habit Consistency
  emerald: '#0d7a5f',
  emeraldMuted: 'rgba(13, 122, 95, 0.10)',
  
  // Warm Amber & Terracotta: Mindful Satiety (Level 3), Sabbath Prompts, Rest
  amber: '#d97706',
  amberMuted: 'rgba(217, 119, 6, 0.10)',

  // Crimson & Rose: Urge Defeater Emergency, Pain & Fall Resets
  ruby: '#e11d48',
  rubyMuted: 'rgba(225, 29, 72, 0.10)',

  // Deep Violet: Evening Sanctuary, Guitar, Creative Writing
  violet: '#6d28d9',
  violetMuted: 'rgba(109, 40, 217, 0.10)',

  // Sky Cyan: Hydration & Morning Freshness
  cyan: '#0284c7',
  cyanMuted: 'rgba(2, 132, 199, 0.10)',

  // High-Contrast Editorial Typography (Slate on Alabaster)
  textPrimary: '#0f172a',    // 900 slate (zero-strain crispness)
  textSecondary: '#334155',  // 700 slate for body & labels
  textMuted: '#64748b',      // 500 slate for quiet timestamps
  textDisabled: '#94a3b8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const BorderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const Shadows = {
  soft: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  floating: {
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
};
