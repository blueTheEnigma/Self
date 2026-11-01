export const Colors = {
  // 95% Monochromatic Neutral Canvas (Calm, Zero-Strain Light Theme)
  background: '#f8fafc',        // Ultra-light serene slate background
  canvasTexture: '#f1f5f9',
  surface: '#ffffff',           // Crisp luminous white card
  surfaceHighlight: '#f8fafc',  // Subtle row highlight
  surfaceElevated: '#f1f5f9',   // Distinct interactive elements
  
  // Hairline Dividers & Borders (Subtle, never heavy)
  border: '#e2e8f0',            // 1px clean separator
  borderLight: '#edf2f7',
  borderFocus: '#94a3b8',

  // Radiant Nordic Teal (Primary Signature Tint - Vibrant, Modern, Clean)
  primary: '#0d9488',           // Vibrant Modern Teal (Crisp blue-green, eliminates forest green darkness)
  primaryMuted: '#f0fdfa',      // Soft teal mist for active pills and subtle badges
  primaryBorder: '#ccfbf1',     // Light teal border for active highlights
  primaryGlow: 'rgba(13, 148, 136, 0.12)',

  // Monochromatic Neutral Accents
  slateDark: '#0f172a',
  slateMedium: '#475569',
  slateLight: '#94a3b8',

  // Semantic Alerts (Used STRICTLY for active warnings or emergencies, never as decoration)
  ruby: '#dc2626',              // Urge Defeater Emergency & Relapse Reset
  rubyMuted: '#fef2f2',
  
  amber: '#d97706',             // Sunday Sabbath Audit Due & Left Ankle Strain
  amberMuted: '#fffbeb',

  // Health / Satiety (Unified with Teal)
  emerald: '#0d9488',
  emeraldMuted: '#f0fdfa',

  // Soft Cyan for Water
  cyan: '#0284c7',
  cyanMuted: '#f0f9ff',

  // High-Contrast Editorial Typography (Slate on White)
  textPrimary: '#0f172a',       // Slate 900 for razor-sharp readability
  textSecondary: '#475569',     // Slate 600 for comfortable body reading
  textMuted: '#94a3b8',         // Slate 400 for quiet timestamps and tags
  textDisabled: '#cbd5e1',
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadows = {
  soft: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
};
