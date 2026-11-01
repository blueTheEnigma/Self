export const Colors = {
  // Alabaster & Warm Parchment Light Theme
  background: '#f8f9fc',
  canvasTexture: '#eef2f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  surfaceElevated: '#e2e8f0',
  
  // Borders & Dividers
  border: '#e2e8f0',
  borderLight: '#cbd5e1',
  borderFocus: '#94a3b8',

  // Primary Luminous Accents (Royal Sapphire)
  primary: '#2563eb',
  primaryMuted: '#dbeafe',
  primaryGlow: 'rgba(37, 99, 235, 0.12)',

  // Semantic Accents
  emerald: '#059669',       // Purity / Integrity / Satiety
  emeraldMuted: 'rgba(5, 150, 105, 0.12)',
  
  amber: '#d97706',         // Focus / Kaizen / Timer
  amberMuted: 'rgba(217, 119, 6, 0.12)',

  ruby: '#e11d48',          // Alerts / Pain / Urge
  rubyMuted: 'rgba(225, 29, 72, 0.12)',

  violet: '#7c3aed',        // Creative / Evening Sanctuary
  violetMuted: 'rgba(124, 58, 237, 0.12)',

  cyan: '#0284c7',          // Hydration
  cyanMuted: 'rgba(2, 132, 199, 0.12)',

  // High-Contrast Light Typography
  textPrimary: '#0f172a',    // Rich deep slate
  textSecondary: '#334155',  // Readable charcoal
  textMuted: '#64748b',      // Subdued metadata
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
};
