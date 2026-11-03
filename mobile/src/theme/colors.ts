export const Colors = {
  // Clear Morning Sky Canvas (Light, Airy, Calming)
  background: '#F0F6FF',        // Light sky blue tint — clear morning sky
  canvasTexture: '#E8F0FC',
  surface: '#FFFFFF',           // Crisp luminous white card surface
  surfaceHighlight: '#F4F8FE',  // Soft cool highlight
  surfaceElevated: '#EDF3FB',   // Elevated card & button surface
  
  // Cool Hairline Dividers & Subtle Borders
  border: '#DEEAF6',            // Cool mist separator
  borderLight: '#E8F0FA',
  borderFocus: '#93B4D4',

  // Electric Blue Accent (Matches the App Logo Caret Icon)
  primary: '#2563EB',           // Radiant Electric Blue
  primaryDark: '#1D4ED8',       // Deep Royal Blue
  primaryMuted: '#EFF6FF',      // Luminous Ice Blue mist for active pills and badges
  primaryBorder: '#BFDBFE',     // Crisp sky blue border
  primaryGlow: 'rgba(37, 99, 235, 0.16)',

  // Soft Pastel Card Tints (Inspired by Reference Images)
  peach: '#FCEEE9',             // Warm blush peach card background
  peachDark: '#C85A32',         // Peach text / icon accent
  peachBorder: '#F7D6CB',

  mint: '#E8F0EA',              // Fresh mint sage card background
  mintDark: '#3D6846',          // Mint text / icon accent
  mintBorder: '#D0E2D4',

  honey: '#FEF6E8',             // Mellow honey amber card background
  honeyDark: '#B87A1E',         // Honey text / icon accent
  honeyBorder: '#F9E5C1',

  lavender: '#F1EFF9',          // Calm lavender card background
  lavenderDark: '#625696',      // Lavender text / icon accent
  lavenderBorder: '#DBD7EF',
  violet: '#625696',            // Alias for backwards compatibility
  violetMuted: '#F1EFF9',

  // Semantic Alerts
  ruby: '#DC2626',              // Emergency urge / relapse reset
  rubyMuted: '#FEF2F2',
  rubyBorder: '#FEE2E2',
  
  amber: '#D97706',             // Sabbath audit & ankle strain
  amberMuted: '#FFFBEB',
  amberBorder: '#FEF3C7',

  emerald: '#10B981',           // Success / sealed tasks
  emeraldMuted: '#ECFDF5',

  cyan: '#2563EB',
  cyanMuted: '#EFF6FF',

  // High-Contrast Outdoor-Ready Typography (WCAG AA Compliant)
  textPrimary: '#0F172A',       // Deep navy charcoal (15.5:1 contrast)
  textSecondary: '#334155',     // Dark slate (9.2:1 contrast — passes AAA)
  textMuted: '#5E718D',         // Rich steel slate (4.8:1 contrast — passes AA in bright sunlight)
  textDisabled: '#94A3B8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 9999,
};

export const Shadows = {
  soft: {
    shadowColor: '#2B3B30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  card: {
    shadowColor: '#2B3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  floating: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
};
