import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';

export type PointsBadgeSize = 'sm' | 'md' | 'lg';

interface PointsBadgeProps {
  points: number;
  size?: PointsBadgeSize;
  // 'earn' shows a `+` prefix for activity feeds; 'spend' shows `-`; 'balance' is neutral.
  tone?: 'balance' | 'earn' | 'spend';
  style?: StyleProp<ViewStyle>;
}

const heightFor: Record<PointsBadgeSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
};

const fontSizeFor: Record<PointsBadgeSize, number> = {
  sm: 12,
  md: 14,
  lg: 18,
};

const iconSizeFor: Record<PointsBadgeSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

const horizontalPaddingFor: Record<PointsBadgeSize, number> = {
  sm: spacing.s8,
  md: spacing.s12,
  lg: spacing.s16,
};

export function PointsBadge({
  points,
  size = 'md',
  tone = 'balance',
  style,
}: PointsBadgeProps) {
  const { C, mode } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const prefix = tone === 'earn' ? '+' : tone === 'spend' ? '−' : '';
  const formatted = `${prefix}${formatPoints(Math.abs(points))}`;
  const textColor = mode === 'dark' ? C.orange : '#9A4A00';

  return (
    <View
      style={[
        styles.base,
        {
          height: heightFor[size],
          paddingHorizontal: horizontalPaddingFor[size],
        },
        style,
      ]}
    >
      <Ionicons
        name="star"
        size={iconSizeFor[size]}
        color={C.orange}
        style={styles.icon}
      />
      <Text
        style={[
          typography.button,
          { color: textColor, fontSize: fontSizeFor[size] },
        ]}
        maxFontSizeMultiplier={1.5}
        numberOfLines={1}
      >
        {formatted}
      </Text>
    </View>
  );
}

// Thousands separator without pulling in Intl in the hot path. Negative
// already stripped by the caller; we just format the magnitude.
function formatPoints(n: number): string {
  if (n < 1000) return String(n);
  return n.toLocaleString('en-US');
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.orangeAlpha15,
      borderRadius: radii.rFull,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: C.orangeAlpha15,
    },
    icon: {
      marginRight: spacing.s4,
    },
  });
