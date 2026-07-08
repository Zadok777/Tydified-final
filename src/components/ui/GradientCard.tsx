import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { radii, shadows, spacing } from '../../theme';

type ShadowKey = keyof typeof shadows | 'none';

interface GradientCardProps {
  // Two-or-more stop gradient. Pass a GRADIENTS.* tuple or any color array.
  colors: readonly [string, string, ...string[]];
  children: React.ReactNode;
  radius?: number;
  padding?: number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  shadow?: ShadowKey;
  style?: StyleProp<ViewStyle>;
}

// A solid gradient surface for hero cards and the approval banner. Gradients
// are brand-constant, so this component is theme-agnostic — text/content placed
// on it should use light-on-gradient colors (textWhite) regardless of mode.
export function GradientCard({
  colors,
  children,
  radius = radii.r20,
  padding = spacing.s24,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  shadow = 'lg',
  style,
}: GradientCardProps) {
  const shadowStyle = shadow === 'none' ? undefined : shadows[shadow];
  return (
    <View style={[{ borderRadius: radius }, shadowStyle, style]}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[styles.inner, { borderRadius: radius, padding }]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    overflow: 'hidden',
  },
});
