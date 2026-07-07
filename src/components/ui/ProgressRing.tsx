import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { typography, useTheme } from '../../theme';

interface ProgressRingProps {
  // 0..1. Out-of-range values are clamped.
  value: number;
  // Outer diameter in px.
  size?: number;
  // Stroke width. Defaults to 8.
  strokeWidth?: number;
  // Ring fill color. Pink by default. Set to `gradient` to use the brand
  // pink→orange gradient (the gradient ID is locally scoped to avoid SVG
  // ID collisions when multiple rings are on screen).
  color?: string | 'gradient';
  // Track color behind the progress arc.
  trackColor?: string;
  // Center content. If omitted, renders `Math.round(value*100)%`.
  // Pass `null` to render no center content.
  centerLabel?: React.ReactNode | null;
  style?: StyleProp<ViewStyle>;
}

// SVG arcs start at 3 o'clock and run clockwise; we rotate -90deg so the arc
// starts at 12 o'clock (the convention every user expects from a progress UI).

let gradientCounter = 0;

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  color,
  trackColor,
  centerLabel,
  style,
}: ProgressRingProps) {
  const { C } = useTheme();
  const ringColor = color ?? C.pink;
  const resolvedTrack = trackColor ?? C.mutedAlpha20;
  const clamped = Math.max(0, Math.min(1, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);

  // Stable unique ID per instance so multiple rings on one screen don't
  // collide on `<defs>` lookup.
  const gradientId = React.useMemo(() => {
    gradientCounter += 1;
    return `tydifiedRing${gradientCounter}`;
  }, []);

  const stroke = ringColor === 'gradient' ? `url(#${gradientId})` : ringColor;

  const label =
    centerLabel === undefined ? `${Math.round(clamped * 100)}%` : centerLabel;

  return (
    <View style={[{ width: size, height: size }, styles.wrapper, style]}>
      <Svg width={size} height={size}>
        {ringColor === 'gradient' ? (
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={C.pink} />
              <Stop offset="1" stopColor={C.orange} />
            </LinearGradient>
          </Defs>
        ) : null}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={resolvedTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          // Rotate -90deg so the arc starts at 12 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {label !== null ? (
        <View style={styles.center} pointerEvents="none">
          {typeof label === 'string' || typeof label === 'number' ? (
            <Text
              style={[typography.title, { color: C.textDark }]}
              maxFontSizeMultiplier={1.5}
            >
              {label}
            </Text>
          ) : (
            label
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
