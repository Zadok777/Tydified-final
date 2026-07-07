import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useAnimatedRatio } from '../../hooks/useAnimatedRatio';
import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';

interface ProgressBarProps {
  // 0..1. Values outside the range are clamped.
  value: number;
  // Bar height in px. Defaults to 8.
  height?: number;
  // Fill color. Defaults to pink (primary CTA tone per DESIGN.md).
  color?: string;
  // Track color behind the fill. Defaults to a translucent muted alpha.
  trackColor?: string;
  // Optional label above the bar (e.g. "Today's chores"). Caption tone.
  label?: string;
  // Optional value text rendered to the right of the label
  // (e.g. "5 / 8" or "62%").
  valueLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  value,
  height = 8,
  color,
  trackColor,
  label,
  valueLabel,
  style,
}: ProgressBarProps) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const animatedWidth = useAnimatedRatio(value);
  const hasHeader = label !== undefined || valueLabel !== undefined;
  const fillColor = color ?? C.pink;
  const resolvedTrack = trackColor ?? C.mutedAlpha20;

  return (
    <View style={style}>
      {hasHeader ? (
        <View style={styles.header}>
          {label !== undefined ? (
            <Text style={styles.label} maxFontSizeMultiplier={1.5}>
              {label}
            </Text>
          ) : (
            <View />
          )}
          {valueLabel !== undefined ? (
            <Text style={styles.valueLabel} maxFontSizeMultiplier={1.5}>
              {valueLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: resolvedTrack,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={{
            height,
            width: animatedWidth,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          }}
        />
      </View>
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.s8,
    },
    label: {
      ...typography.caption,
      color: C.textMid,
    },
    valueLabel: {
      ...typography.caption,
      color: C.textDark,
      fontFamily: 'DMSans_700Bold',
    },
    track: {
      overflow: 'hidden',
      borderRadius: radii.rFull,
    },
  });
