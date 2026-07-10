import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { radii, spacing, typography, useTheme, type Palette } from '../../theme';

export type BadgeTone =
  | 'neutral'
  | 'pink'
  | 'orange'
  | 'green'
  | 'danger'
  | 'muted';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface TonePalette {
  background: string;
  text: string;
}

// Resolved per-render against the active palette. Orange/danger text get a
// lighter tint in dark mode so they stay legible on the translucent fill.
function tonePalette(
  C: Palette,
  mode: 'light' | 'dark',
  tone: BadgeTone
): TonePalette {
  switch (tone) {
    case 'neutral':
      return { background: C.glassLight, text: C.textDark };
    case 'pink':
      return { background: C.pinkAlpha15, text: C.pinkText };
    case 'orange':
      return {
        background: C.orangeAlpha15,
        text: mode === 'dark' ? C.orange : '#C36321',
      };
    case 'green':
      return { background: C.greenAlpha15, text: C.greenText };
    case 'danger':
      return {
        background: C.redAlpha15,
        text: mode === 'dark' ? '#FF7A7A' : '#B91C1C',
      };
    case 'muted':
      return { background: C.mutedAlpha20, text: C.textMid };
  }
}

const heightFor: Record<BadgeSize, number> = {
  sm: 24,
  md: 30,
};

const horizontalPaddingFor: Record<BadgeSize, number> = {
  sm: spacing.s8,
  md: spacing.s12,
};

const fontSizeFor: Record<BadgeSize, number> = {
  sm: 11,
  md: 12,
};

export function Badge({
  label,
  tone = 'neutral',
  size = 'md',
  iconLeft,
  iconRight,
  style,
}: BadgeProps) {
  const { C, mode } = useTheme();
  const palette = tonePalette(C, mode, tone);

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.background,
          height: heightFor[size],
          paddingHorizontal: horizontalPaddingFor[size],
        },
        style,
      ]}
    >
      {iconLeft !== undefined ? (
        <View style={styles.iconLeft}>{iconLeft}</View>
      ) : null}
      <Text
        style={[
          typography.caption,
          {
            color: palette.text,
            fontSize: fontSizeFor[size],
          },
        ]}
        maxFontSizeMultiplier={1.5}
        numberOfLines={1}
      >
        {label}
      </Text>
      {iconRight !== undefined ? (
        <View style={styles.iconRight}>{iconRight}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.rFull,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
  iconLeft: {
    marginRight: spacing.s4,
  },
  iconRight: {
    marginLeft: spacing.s4,
  },
});
