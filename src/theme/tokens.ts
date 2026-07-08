// Single source of truth for Tydified design tokens.
// See DESIGN.md for the rationale behind each value.

import type { TextStyle, ViewStyle } from 'react-native';

// ---------------------------------------------------------------------------
// Colors (C)
// ---------------------------------------------------------------------------

export const lightC = {
  // Brand palette — Tydified (2026-07 rebrand). All hues are exact samples
  // from the Tydified logo lockup. Token key kept as `pink` so the ~24 files
  // reading C.pink need no change; it is the primary-accent slot.
  // See DESIGN.md §12.
  pink: '#14B0FE', // Tydi blue (wordmark mid-gradient)
  // Deep Tydi blue (wordmark gradient base) for accent-colored TEXT on light
  // surfaces. #14B0FE is fine for fills/icons, fails WCAG 4.5:1 for text.
  pinkText: '#0059AE',
  orange: '#FEAA01', // trophy amber
  // Deep amber for TEXT on light surfaces — #FEAA01 is ~2:1 on white.
  orangeText: '#A36A00',
  green: '#60DB01', // tagline green — fills/chips/dark grounds only
  // Darkened tagline-green hue for TEXT on light surfaces. #60DB01 is ~2.1:1
  // on white — fails WCAG for text and icons.
  greenText: '#3D9800',
  bg: '#FAF9FB', // warm near-white canvas (was lavender glass ground)

  // Reserve lockup hues — first-class so every logo color has a slot.
  // Raw hues are for fills/icons only; they fail 4.5:1 as text on white.
  purple: '#B353FC', // "fied" purple
  rose: '#FC5499', // "fied" pink
  cyan: '#5FFCFE', // wordmark cyan highlight

  // Text
  textDark: '#00001B', // brand navy (logo outline/pill)
  textMid: '#6B6B80',
  textLight: '#A8A8B8',
  textWhite: '#FFFFFF',

  // Surface — now SOLID surfaces with a hairline, not frosted glass.
  glass: '#FFFFFF', // primary card surface
  glassLight: '#F3F1F7', // recessed / subtle container
  border: 'rgba(24, 20, 40, 0.06)', // real hairline for definition on near-white
  borderPink: 'rgba(20, 176, 254, 0.32)', // primary-accent (Tydi blue) selected border

  // Tinted alphas (primary accent — Tydi blue)
  pinkAlpha15: 'rgba(20, 176, 254, 0.15)',
  pinkAlpha10: 'rgba(20, 176, 254, 0.10)',
  orangeAlpha15: 'rgba(254, 170, 1, 0.15)',
  orangeAlpha10: 'rgba(254, 170, 1, 0.10)',
  greenAlpha15: 'rgba(96, 219, 1, 0.15)',
  greenAlpha20: 'rgba(96, 219, 1, 0.20)',
  greenAlpha10: 'rgba(96, 219, 1, 0.10)',
  purpleAlpha15: 'rgba(179, 83, 252, 0.15)',
  purpleAlpha10: 'rgba(179, 83, 252, 0.10)',
  roseAlpha15: 'rgba(252, 84, 153, 0.15)',
  roseAlpha10: 'rgba(252, 84, 153, 0.10)',
  mutedAlpha20: 'rgba(168, 168, 184, 0.20)',
  redAlpha15: 'rgba(220, 38, 38, 0.15)',
} as const;

// Public palette shape — every themed color the app consumes. The app is
// light-only (dark mode removed 2026-07-08), so the shape derives directly
// from the light palette.
export type Palette = { [K in keyof typeof lightC]: string };

// Backward-compatible default — the light palette. Theme-aware code should
// prefer useTheme().C; this stays for mode-invariant module-scope use (e.g.
// shadow colors) and not-yet-converted / dev-only screens.
export const C = lightC;

// ---------------------------------------------------------------------------
// Avatar gradients (cycled for family members)
// ---------------------------------------------------------------------------

// The six Tydified logo hue families (cyan-blue, pink, purple, gold, green,
// orange), each as a light→saturated pair sampled from the lockup. Kids stay
// distinguishable via hue spread, and every avatar reads as the brand.
// Order is load-bearing: `avatar_gradient` rows store indexes into this list,
// so only append — never reorder or remove.
export const AVATAR_GRADIENTS: readonly (readonly [string, string])[] = [
  // Lockup hue families (exact logo samples)
  ['#5FFCFE', '#14B0FE'], // Cyan   -> Blue   (child 1)
  ['#FD7A9E', '#FC5499'], // Rose   -> Pink   (child 2)
  ['#C771FC', '#B353FC'], // Lilac  -> Purple (child 3)
  ['#FDCB01', '#FEAA01'], // Gold   -> Amber  (child 4)
  ['#8DF13C', '#60DB01'], // Lime   -> Green  (child 5)
  ['#FC9000', '#F06C00'], // Orange -> Deep orange (trophy shading) (child 6)
  // Warm family (the pre-rebrand set, kept as extra picker choices)
  ['#FF8C42', '#FF4D8D'], // Peach  -> Pink
  ['#FF6F91', '#FF4D8D'], // Rose   -> Pink
  ['#FFB36B', '#FF7A59'], // Amber  -> Coral
  ['#FF9472', '#FF5C8A'], // Coral  -> Rose
  ['#FFC04D', '#FF8C42'], // Gold   -> Orange
] as const;

// Named gradients for hero cards and primary CTAs. Mode-invariant brand colors
// (they read well on both light and dark grounds).
export const GRADIENTS = {
  brand: ['#5FFCFE', '#14B0FE'] as const, // Tydi cyan → blue (hero, logo border, approve)
  violet: ['#B353FC', '#14B0FE'] as const, // fied purple → Tydi blue (approval hero)
  sky: ['#14B0FE', '#B353FC'] as const, // Tydi blue → fied purple
} as const;

// ---------------------------------------------------------------------------
// Border radius scale
// ---------------------------------------------------------------------------

export const radii = {
  r8: 8,
  r10: 10,
  r12: 12,
  r14: 14,
  r16: 16,
  r18: 18,
  r20: 20,
  r24: 24,
  rFull: 9999,
} as const;

// ---------------------------------------------------------------------------
// Shadows (React Native ViewStyle pickups)
// ---------------------------------------------------------------------------

type Shadow = Pick<
  ViewStyle,
  'shadowOffset' | 'shadowRadius' | 'shadowOpacity' | 'shadowColor' | 'elevation'
>;

export const shadows: Record<'sm' | 'md' | 'lg' | 'xl2' | 'pink', Shadow> = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    shadowOpacity: 0.06,
    shadowColor: '#000000',
    elevation: 1,
  },
  md: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.05,
    shadowColor: '#000000',
    elevation: 3,
  },
  lg: {
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 0.07,
    shadowColor: '#000000',
    elevation: 6,
  },
  xl2: {
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 48,
    shadowOpacity: 0.16,
    shadowColor: '#000000',
    elevation: 10,
  },
  pink: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.16,
    shadowColor: C.pink,
    elevation: 4,
  },
};

// ---------------------------------------------------------------------------
// Spacing (8-pt scale)
// ---------------------------------------------------------------------------

export const spacing = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32,
  s40: 40,
  s48: 48,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const typography = {
  display: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 42,
    letterSpacing: -1.4,
  },
  headline: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 30,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
  },
  caption: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    letterSpacing: 0.1,
  },
  // Micro uppercase label — pairs with big display numbers for an editorial,
  // premium feel (e.g. stat-tile captions). Keep copy short.
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    letterSpacing: -0.1,
  },
  heroNum: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 52,
    letterSpacing: -1.8,
    // Fixed-width digits so useCountUp ticks don't jitter horizontally.
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
} as const;

// ---------------------------------------------------------------------------
// Age-bracket theme overrides
// ---------------------------------------------------------------------------

export type AgeBracket = 'elementary' | 'middle_school' | 'high_school';

export interface BracketTheme {
  primary: string;
  secondary: string;
  successAccent: string;
  backgroundGradient: [string, string];
  glassTint: string;
  borderRadius: { card: number; button: number; bottomSheet: number };
  touchTarget: number;
  iconVariant: 'filled' | 'mixed' | 'outline';
  spring: { damping: number; stiffness: number };
}

// NOTE: These values predate the §12 teal/solid-surface refresh (they're the
// original pink/lavender system). Kid-facing screens are v1.1 — re-tune these
// against DESIGN.md §12 before building them.
export const bracketThemes: Record<AgeBracket, BracketTheme> = {
  elementary: {
    primary: '#FF4D8D',
    secondary: '#FC8A40',
    successAccent: '#A8E6CF',
    backgroundGradient: ['#FFF0F7', '#FFF5EA'],
    glassTint: 'rgba(255, 77, 141, 0.14)',
    borderRadius: { card: 24, button: 999, bottomSheet: 30 },
    touchTarget: 56,
    iconVariant: 'filled',
    spring: { damping: 8, stiffness: 100 },
  },
  middle_school: {
    primary: '#6E61FF',
    secondary: '#8A80FF',
    successAccent: '#B2EBF2',
    backgroundGradient: ['#F2F0FF', '#EEF5FF'],
    glassTint: 'rgba(110, 97, 255, 0.12)',
    borderRadius: { card: 22, button: 999, bottomSheet: 26 },
    touchTarget: 48,
    iconVariant: 'mixed',
    spring: { damping: 12, stiffness: 120 },
  },
  high_school: {
    primary: '#5A4CE0',
    secondary: '#B388FF',
    successAccent: '#E8D5FF',
    backgroundGradient: ['#F5F1FF', '#ECE7FF'],
    glassTint: 'rgba(90, 76, 224, 0.10)',
    borderRadius: { card: 20, button: 999, bottomSheet: 24 },
    touchTarget: 48,
    iconVariant: 'outline',
    spring: { damping: 20, stiffness: 200 },
  },
};
