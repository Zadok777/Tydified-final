import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Avatar } from '../../components/ui/Avatar';
import { StreakFlame } from '../../components/ui/StreakFlame';
import { useAnimatedRatio } from '../../hooks/useAnimatedRatio';
import { useCountUp } from '../../hooks/useCountUp';
import { ageFromDob } from '../../utils/ageTier';
import { AVATAR_GRADIENTS, GRADIENTS, useTheme, useThemedStyles } from '../../theme';
import type { Child, Goal } from '../../types/app.types';
import { makeStyles } from './dashboard.styles';

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
  // Calm & refined: uniform surface tiles + big near-black numbers. Color is
  // reserved — only Points (orange) pops, the rest stay neutral so the data
  // reads through size, not a rainbow of backgrounds.
  const valueColor = tone === 'orange' ? C.orange : C.textDark;
  const display = useCountUp(value);
  return (
    <View style={styles.snapTile}>
      <Text style={[styles.snapValue, { color: valueColor }]} maxFontSizeMultiplier={1.3}>
        {display}
      </Text>
      <Text style={styles.snapLabel} maxFontSizeMultiplier={1.2} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: IoniconName;
  onPress: () => void;
}) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.actionItem, pressed && styles.pressed]}
    >
      <View style={[styles.actionIcon, { backgroundColor: C.pinkAlpha15 }]}>
        <Ionicons name={icon} size={20} color={C.pink} />
      </View>
      <Text style={styles.actionLabel} maxFontSizeMultiplier={1.3} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
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
        <View style={styles.goalIcon}>
          <Ionicons
            name={goal.kind === 'reward' ? 'gift' : 'flag'}
            size={16}
            color={C.pink}
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
