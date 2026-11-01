import { TextStyle } from 'react-native';
import { Colors } from './colors';

/**
 * Typographic Scale based on Material Design & Apple HIG:
 * - Avoids faux-bolding ('900') which distorts Android Roboto letterforms.
 * - Uses 400 (Regular) for body copy with 1.4-1.5x leading for comfortable reading.
 * - Uses 500 (Medium) for interactive buttons & callouts.
 * - Uses 600 (SemiBold) / 700 (Bold) for titles with proportional tracking.
 */
export const Typography: Record<string, TextStyle> = {
  // Large Display
  display: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  
  // Section / View Titles
  title1: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },

  // Card Headers
  title2: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.textPrimary,
  },

  // Subheadings & Emphasized Text
  title3: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: Colors.textPrimary,
  },

  // Primary Body Copy (45-65 chars per line comfortable measure)
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    color: Colors.textSecondary,
  },

  // Important Callouts & Buttons
  callout: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textPrimary,
  },

  // Secondary Metadata & Subheads
  subhead: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: Colors.textSecondary,
  },

  // Captions & Timestamps
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: Colors.textMuted,
  },

  // All-caps Micro Labels & Badges
  micro: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
};

