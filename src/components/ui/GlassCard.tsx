import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { radii, shadows, spacing, useTheme, type Palette } from '../../theme';

// Refined surface card (was frosted glass — see DESIGN.md §10). Solid surface
// + a single soft shadow + hairline border. Two-layer pattern: the outer
// wrapper carries the shadow, the inner wrapper clips children via
// borderRadius + overflow. The `tint` prop layers a subtle brand wash for
// colored cards; `light` is the plain surface.

type ShadowKey = keyof typeof shadows | 'none';
type Tint = 'light' | 'pink' | 'orange' | 'green';

interface GlassCardProps {
  children: React.ReactNode;
  // Retained for API compatibility; no longer used now that cards are solid.
  intensity?: number;
  // Designed tint over the surface. `light` is the plain surface; the colored
  // tints layer the matching themed alpha token.
  tint?: Tint;
  // Override the corner radius (defaults to r18 — standard cards).
  radius?: number;
  // Inner padding. Defaults to 16px (DESIGN §6).
  padding?: number;
  borderColor?: string;
  shadow?: ShadowKey;
  style?: StyleProp<ViewStyle>;
}

function tintBackground(C: Palette, tint: Tint): string {
  switch (tint) {
    case 'light':
      return C.glass;
    case 'pink':
      return C.pinkAlpha10;
    case 'orange':
      return C.orangeAlpha10;
    case 'green':
      return C.greenAlpha15;
  }
}

export function GlassCard({
  children,
  tint = 'light',
  radius = radii.r20,
  padding = spacing.s16,
  borderColor,
  shadow = 'md',
  style,
}: GlassCardProps) {
  const { C } = useTheme();
  const shadowStyle = shadow === 'none' ? undefined : shadows[shadow];
  const resolvedBorder = borderColor ?? C.border;

  return (
    <View style={[styles.outer, { borderRadius: radius }, shadowStyle, style]}>
      <View
        style={[
          styles.inner,
          {
            borderRadius: radius,
            borderColor: resolvedBorder,
            backgroundColor: tintBackground(C, tint),
            padding,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'transparent',
  },
  inner: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});
