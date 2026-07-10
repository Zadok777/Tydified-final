import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  radii,
  spacing,
  typography,
  useThemedStyles,
  type Palette,
} from '../../theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

// A glass pill track with an active pink segment. Generic over the option
// value so callers stay type-safe (e.g. ChoreFrequency, a filter union). Used
// for the chores filter and the create-chore frequency picker.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.track, style]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text
              style={[styles.label, active && styles.labelActive]}
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      backgroundColor: C.glass,
      borderRadius: radii.rFull,
      borderWidth: 1,
      borderColor: C.border,
      padding: spacing.s4,
      gap: spacing.s4,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.s8,
      borderRadius: radii.rFull,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    segmentActive: {
      backgroundColor: C.pinkAlpha15,
      borderWidth: 1,
      borderColor: C.borderPink,
    },
    label: {
      ...typography.caption,
      color: C.textMid,
      fontFamily: 'DMSans_600SemiBold',
    },
    labelActive: {
      color: C.pinkText,
      fontFamily: 'DMSans_700Bold',
    },
  });
