import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  radii,
  shadows,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import { PointsBadge } from './PointsBadge';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface RewardCardProps {
  title: string;
  description?: string;
  pointCost: number;
  // Icon shown in the top-of-card art area. Defaults to a gift icon.
  iconName?: IoniconName;
  // Optional accent color for the icon halo. Defaults to the brand orange.
  // Use sparingly; the value should come from a small curated palette.
  accentColor?: string;
  // When true, the card renders in muted "locked" state — used when the
  // currently-selected child can't afford the reward.
  locked?: boolean;
  // When true, the card pops with a subtle glow to celebrate a just-unlocked
  // reward (set briefly when child's balance crosses the cost).
  justUnlocked?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function RewardCard({
  title,
  description,
  pointCost,
  iconName = 'gift',
  accentColor,
  locked = false,
  justUnlocked = false,
  onPress,
  style,
}: RewardCardProps) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = accentColor ?? C.orange;
  const interactive = onPress !== undefined && !locked;
  const labelForA11y = locked
    ? `${title}, locked, costs ${pointCost} points`
    : `${title}, ${pointCost} points`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!interactive}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={labelForA11y}
      accessibilityState={{ disabled: locked }}
      style={({ pressed }) => [
        styles.card,
        shadows.md,
        { borderColor: locked ? C.border : withAlpha(accent, 0.35) },
        locked && styles.cardLocked,
        justUnlocked && styles.cardUnlocked,
        pressed && interactive && styles.pressed,
        style,
      ]}
    >
      <View
        style={styles.art}
      >
        <View
          style={[
            styles.artBubble,
            { backgroundColor: withAlpha(accent, locked ? 0.08 : 0.16) },
          ]}
        >
          <Ionicons
            name={locked ? 'lock-closed' : iconName}
            size={30}
            color={locked ? C.textLight : accent}
          />
        </View>
      </View>
      <View style={styles.body}>
        <Text
          style={[styles.title, locked && styles.titleLocked]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.5}
        >
          {title}
        </Text>
        {description !== undefined ? (
          <Text
            style={[styles.description, locked && styles.descriptionLocked]}
            numberOfLines={2}
            maxFontSizeMultiplier={1.5}
          >
            {description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <PointsBadge points={pointCost} size="sm" />
        </View>
      </View>
    </Pressable>
  );
}

// Tiny utility — keeps the call sites readable. Falls back to the original
// color if it isn't `#RRGGBB`; we don't try to be clever about hex8 or hsl.
function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: C.orangeAlpha10,
      borderRadius: radii.r20,
      borderWidth: 1,
      overflow: 'hidden',
    },
    cardLocked: {
      opacity: 0.7,
    },
    cardUnlocked: {
      borderColor: C.borderPink,
    },
    pressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.95,
    },
    art: {
      height: 84,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing.s16,
    },
    artBubble: {
      width: 64,
      height: 64,
      borderRadius: radii.rFull,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
    },
    body: {
      padding: spacing.s16,
      gap: spacing.s8,
    },
    title: {
      ...typography.title,
      fontSize: 16,
      color: C.textDark,
    },
    titleLocked: {
      color: C.textMid,
    },
    description: {
      ...typography.caption,
      color: C.textMid,
    },
    descriptionLocked: {
      color: C.textLight,
    },
    footer: {
      marginTop: spacing.s4,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
