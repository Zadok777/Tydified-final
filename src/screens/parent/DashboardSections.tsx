import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Reanimated from 'react-native-reanimated';

import { usePressBounce } from '../../hooks/usePressBounce';

import { Avatar } from '../../components/ui/Avatar';
import { CartoonIcon, type CartoonIconName } from '../../components/ui/CartoonIcon';
import { StreakFlame } from '../../components/ui/StreakFlame';
import { useAnimatedRatio } from '../../hooks/useAnimatedRatio';
import { useCountUp } from '../../hooks/useCountUp';
import { ageFromDob } from '../../utils/ageTier';
import { AVATAR_GRADIENTS, GRADIENTS, useTheme, useThemedStyles } from '../../theme';
import type { Child, Goal } from '../../types/app.types';
import { makeStyles } from './dashboard.styles';

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export function SnapshotTile({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'pink' | 'green' | 'orange';
}) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  // Me+ pastel system: each stat sits on its own lockup-hue tint with a
  // contrast-safe text shade of the same hue (Tydi blue / green / amber).
  const valueColor =
    tone === 'orange'
      ? C.orangeText
      : tone === 'green'
        ? C.greenText
        : C.pinkText;
  const tileBg =
    tone === 'orange'
      ? C.orangeAlpha10
      : tone === 'green'
        ? C.greenAlpha10
        : C.pinkAlpha10;
  const display = useCountUp(value);
  return (
    <View style={[styles.snapTile, { backgroundColor: tileBg }]}>
      <Text style={[styles.snapValue, { color: valueColor }]} maxFontSizeMultiplier={1.3}>
        {display}
      </Text>
      <Text style={styles.snapLabel} maxFontSizeMultiplier={1.2} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export type QuickActionTone = 'pink' | 'orange' | 'green' | 'purple';

export function QuickAction({
  label,
  icon,
  onPress,
  tone = 'pink',
  cartoon,
}: {
  label: string;
  icon: IoniconName;
  onPress: () => void;
  tone?: QuickActionTone;
  cartoon?: CartoonIconName;
}) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { onPressIn, onPressOut, bounceStyle } = usePressBounce();
  // One lockup hue per action so the grid reads as the brand rainbow.
  // Icon colors are the contrast-safe shade of each hue where needed.
  const tint: Record<QuickActionTone, { bg: string; fg: string }> = {
    pink: { bg: C.pinkAlpha15, fg: C.pink },
    orange: { bg: C.orangeAlpha15, fg: C.orange },
    green: { bg: C.greenAlpha15, fg: C.greenText },
    purple: { bg: C.purpleAlpha15, fg: C.purple },
  };
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.actionItem, bounceStyle]}
    >
      <View style={[styles.actionIcon, { backgroundColor: tint[tone].bg }]}>
        {cartoon !== undefined ? (
          <CartoonIcon name={cartoon} size={26} />
        ) : (
          <Ionicons name={icon} size={20} color={tint[tone].fg} />
        )}
      </View>
      <Text style={styles.actionLabel} maxFontSizeMultiplier={1.3} numberOfLines={2}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

export function KidProgress({
  child,
  gradientIndex,
  total,
  done,
}: {
  child: Child;
  gradientIndex: number;
  total: number;
  done: number;
}) {
  const styles = useThemedStyles(makeStyles);
  const ratio = total > 0 ? done / total : 0;
  const animatedWidth = useAnimatedRatio(ratio);
  const gradient = AVATAR_GRADIENTS[gradientIndex % AVATAR_GRADIENTS.length];
  const ageLabel = ageFromDob(child.date_of_birth);

  return (
    <View style={styles.kidCard}>
      <View style={styles.kidTop}>
        <Avatar
          name={child.name}
          gradientIndex={child.avatar_gradient ?? gradientIndex}
          icon={child.avatar_icon}
          size="md"
        />
        <View style={styles.kidMeta}>
          <Text style={styles.kidName} maxFontSizeMultiplier={1.3} numberOfLines={1}>
            {child.name}
            {ageLabel !== null ? (
              <Text style={styles.kidAge}>  ·  age {ageLabel}</Text>
            ) : null}
          </Text>
          <View style={styles.kidSubRow}>
            <Text style={styles.kidSub} maxFontSizeMultiplier={1.3}>
              {done}/{total} chores today
            </Text>
            {(child.streak_days ?? 0) > 0 ? (
              <StreakFlame days={child.streak_days ?? 0} size={13} />
            ) : null}
          </View>
        </View>
        <View style={styles.kidPoints}>
          <Text style={styles.kidPointsValue} maxFontSizeMultiplier={1.2}>
            {child.points ?? 0}
          </Text>
          <Text style={styles.kidPointsLabel} maxFontSizeMultiplier={1.1}>
            POINTS
          </Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <Animated.View
          style={[styles.barFill, { width: animatedWidth, overflow: 'hidden' }]}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barFillGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
}

export function GoalRow({
  goal,
  child,
  onDelete,
}: {
  goal: Goal;
  child: Child | null;
  onDelete: (id: string) => void;
}) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pts = child?.points ?? 0;
  const ratio =
    goal.target_points > 0 ? Math.min(1, pts / goal.target_points) : 0;
  const remaining = Math.max(0, goal.target_points - pts);
  const reached = goal.reached_at !== null || pts >= goal.target_points;

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalTop}>
        <View
          style={[
            styles.goalIcon,
            {
              backgroundColor:
                goal.kind === 'reward' ? C.orangeAlpha15 : C.purpleAlpha15,
            },
          ]}
        >
          <CartoonIcon
            name={goal.kind === 'reward' ? 'gift' : 'star'}
            size={20}
          />
        </View>
        <View style={styles.goalMeta}>
          <Text style={styles.goalTitle} numberOfLines={1} maxFontSizeMultiplier={1.3}>
            {goal.title}
          </Text>
          <Text style={styles.goalSub} maxFontSizeMultiplier={1.3}>
            {child?.name ?? 'Child'} ·{' '}
            {reached ? 'Reached! 🎉' : `${remaining} pts to go`}
          </Text>
        </View>
        <Pressable
          onPress={() => onDelete(goal.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove goal ${goal.title}`}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Ionicons name="close" size={16} color={C.textLight} />
        </Pressable>
      </View>
      <View style={styles.barTrack}>
        <LinearGradient
          colors={GRADIENTS.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${Math.round(ratio * 100)}%` }]}
        />
      </View>
    </View>
  );
}
