import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import {
  lightC,
  radii,
  shadows,
  spacing,
  typography,
  bracketThemes,
  type AgeBracket,
  type BracketTheme,
  type Palette,
} from './tokens';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  C: Palette;
  radii: typeof radii;
  shadows: typeof shadows;
  spacing: typeof spacing;
  typography: typeof typography;
  bracketThemes: typeof bracketThemes;
  bracketFor: (bracket: AgeBracket) => BracketTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

// Dark mode was removed 2026-07-08 — the app is light-only. The useTheme /
// useThemedStyles architecture stays so components keep one code path; the
// provider simply always serves the light palette. `mode` remains in the
// context shape for the few consumers that branch on it.
export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode: ThemeMode = 'light';
  const palette: Palette = lightC;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      C: palette,
      radii,
      shadows,
      spacing,
      typography,
      bracketThemes,
      bracketFor: (bracket) => bracketThemes[bracket],
    }),
    [mode, palette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}

// Builds a StyleSheet from the active palette and memoizes it per palette.
// Define the factory at module scope (stable identity) so the memo only
// recomputes when the theme actually changes:
//
//   const makeStyles = (C: Palette) => StyleSheet.create({ ... });
//   function MyComponent() {
//     const styles = useThemedStyles(makeStyles);
//   }
export function useThemedStyles<T>(factory: (c: Palette) => T): T {
  const { C } = useTheme();
  return useMemo(() => factory(C), [factory, C]);
}
