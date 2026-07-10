import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Reanimated from 'react-native-reanimated';

import { usePressBounce } from '../../hooks/usePressBounce';
import {
  radii,
  shadows,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { ChoreStatus } from '../../types/app.types';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { PointsBadge } from './PointsBadge';

// ChoreRow stays a pure UI component — it receives already-formatted strings
// and primitive props rather than raw DB rows. Screens do the join between
// chores + chore_assignments + children and pass the result here. That makes
// the row trivial to preview, mock, and reuse across status filters.

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ChoreRowProps {
  title: string;
  pointValue: number;
  status: ChoreStatus;
  assigneeName?: string;
  // Forwarded to Avatar so the same child always lands on the same gradient.
  assigneeGradientIndex?: number;
  // Already-formatted date label ("Today", "Tomorrow", "Mon May 28").
  // Screens own the formatting so the component never imports date-fns.
  dueLabel?: string;
  // Optional category icon name (Ionicons).
  categoryIcon?: IoniconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

interface StatusVisual {
  label: string;
  tone: 'neutral' | 'orange' | 'green' | 'danger';
  iconName: IoniconName;
}

const statusVisuals: Record<ChoreStatus, StatusVisual> = {
  assigned: {
    label: 'To do',
    tone: 'neutral',
    iconName: 'ellipse-outline',
  },
  submitted: {
    label: 'Pending',
    tone: 'orange',
    iconName: 'time-outline',
  },
  approved: {
    label: 'Approved',
    tone: 'green',
    iconName: 'checkmark-circle',
  },
  rejected: {
    label: 'Returned',
    tone: 'danger',
    iconName: 'refresh-outline',
  },
};

export function ChoreRow({
  title,
  pointValue,
  status,
  assigneeName,
  assigneeGradientIndex,
  dueLabel,
  categoryIcon,
  onPress,
  style,
}: ChoreRowProps) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { onPressIn, onPressOut, bounceStyle } = usePressBounce();
  const visual = statusVisuals[status];
  const interactive = onPress !== undefined;
  const rowTone = tintForStatus(C, status);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={interactive ? onPressIn : undefined}
      onPressOut={interactive ? onPressOut : undefined}
      disabled={!interactive}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={`${title}, ${visual.label}, ${pointValue} points`}
      style={[
        styles.row,
        shadows.sm,
        {
          backgroundColor: rowTone.background,
          borderColor: rowTone.border,
        },
        style,
        bounceStyle,
      ]}
    >
      {assigneeName !== undefined ? (
        <View style={styles.leadingCircle}>
          <Avatar
            name={assigneeName}
            gradientIndex={assigneeGradientIndex}
            size="md"
          />
        </View>
      ) : (
        <View style={styles.iconBubble}>
          <Ionicons
            name={categoryIcon ?? 'sparkles-outline'}
            size={20}
            color={C.pink}
          />
        </View>
      )}

      <View style={styles.body}>
        <Text
          style={styles.title}
          numberOfLines={1}
          maxFontSizeMultiplier={1.5}
        >
          {title}
        </Text>
        <View style={styles.metaRow}>
          {assigneeName !== undefined ? (
            <Text style={styles.meta} maxFontSizeMultiplier={1.5}>
              {assigneeName}
            </Text>
          ) : null}
          {assigneeName !== undefined && dueLabel !== undefined ? (
            <View style={styles.dot} />
          ) : null}
          {dueLabel !== undefined ? (
            <Text style={styles.meta} maxFontSizeMultiplier={1.5}>
              {dueLabel}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.trailing}>
        <View style={styles.checkCircle}>
          <Ionicons
            name={visual.iconName}
            size={22}
            color={badgeIconColorFor(C, visual.tone)}
          />
        </View>
        <PointsBadge points={pointValue} size="sm" />
        <Badge
          label={visual.label}
          tone={visual.tone}
          size="sm"
          iconLeft={
            <Ionicons
              name={visual.iconName}
              size={11}
              color={badgeIconColorFor(C, visual.tone)}
            />
          }
          style={styles.statusBadge}
        />
      </View>
    </AnimatedPressable>
  );
}

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

function tintForStatus(
  C: Palette,
  status: ChoreStatus
): { background: string; border: string } {
  switch (status) {
    case 'assigned':
      return { background: C.pinkAlpha10, border: C.borderPink };
    case 'submitted':
      return { background: C.orangeAlpha10, border: C.orangeAlpha15 };
    case 'approved':
      return { background: C.greenAlpha15, border: C.greenAlpha20 };
    case 'rejected':
      return { background: C.redAlpha15, border: C.border };
  }
}

function badgeIconColorFor(C: Palette, tone: StatusVisual['tone']): string {
  switch (tone) {
    case 'neutral':
      return C.textDark;
    case 'orange':
      return '#C36321';
    case 'green':
      return C.greenText;
    case 'danger':
      return '#B91C1C';
  }
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radii.r18,
      borderWidth: 1,
      padding: spacing.s12,
      minHeight: 76,
    },
    pressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.95,
    },
    iconBubble: {
      width: 48,
      height: 48,
      borderRadius: radii.rFull,
      backgroundColor: C.glass,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    leadingCircle: {
      width: 52,
      height: 52,
      borderRadius: radii.rFull,
      backgroundColor: C.glass,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    body: {
      flex: 1,
      marginLeft: spacing.s12,
      marginRight: spacing.s8,
    },
    title: {
      ...typography.title,
      fontSize: 16,
      color: C.textDark,
      marginBottom: 2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    meta: {
      ...typography.caption,
      color: C.textMid,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: radii.rFull,
      backgroundColor: C.textLight,
      marginHorizontal: spacing.s8,
    },
    trailing: {
      alignItems: 'flex-end',
      gap: spacing.s4,
    },
    checkCircle: {
      width: 44,
      height: 44,
      borderRadius: radii.rFull,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusBadge: {
      marginTop: 2,
    },
  });
