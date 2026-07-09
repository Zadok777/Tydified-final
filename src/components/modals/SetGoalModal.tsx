import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TydifiedKids } from '../brand/TydifiedKids';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PointsBadge } from '../ui/PointsBadge';
import { SegmentedControl } from '../ui/SegmentedControl';
import { useToast } from '../ui/Toast';
import { ModalSheet } from './ModalSheet';
import { createGoal } from '../../services/goals';
import { listRewards } from '../../services/rewards';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { useGoalStore } from '../../store/goalStore';
import { hapticLight } from '../../utils/haptics';
import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { GoalKind, Reward } from '../../types/app.types';

const KIND_OPTIONS = [
  { value: 'reward', label: 'Reward' },
  { value: 'points', label: 'Points' },
] as const satisfies readonly { value: GoalKind; label: string }[];

interface SetGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function SetGoalModal({ visible, onClose, onCreated }: SetGoalModalProps) {
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const session = useAuthStore((s) => s.session);

  const [childId, setChildId] = useState<string | null>(null);
  const [kind, setKind] = useState<GoalKind>('reward');
  const [rewardId, setRewardId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Default the child to the only kid (common case) + load rewards for the
  // reward picker when the sheet opens.
  useEffect(() => {
    if (!visible) return;
    if (children.length === 1) setChildId(children[0].id);
    if (family !== null) {
      void listRewards(family.id).then((res) => {
        if (res.success) setRewards(res.data);
      });
    }
  }, [visible, children, family]);

  const resetAll = () => {
    setChildId(children.length === 1 ? children[0].id : null);
    setKind('reward');
    setRewardId(null);
    setTitle('');
    setTarget('');
  };

  const close = () => {
    resetAll();
    onClose();
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (family === null) {
      toast.show({ message: 'No family loaded.', tone: 'error' });
      return;
    }
    if (childId === null) {
      toast.show({ message: 'Pick a child for this goal.', tone: 'error' });
      return;
    }

    let goalTitle: string;
    let targetPoints: number;
    let goalRewardId: string | null = null;

    if (kind === 'reward') {
      const reward = rewards.find((r) => r.id === rewardId);
      if (reward === undefined) {
        toast.show({ message: 'Pick a reward to save toward.', tone: 'error' });
        return;
      }
      goalTitle = reward.title;
      targetPoints = reward.point_cost;
      goalRewardId = reward.id;
    } else {
      const t = title.trim();
      const n = Number(target);
      if (t === '') {
        toast.show({ message: 'Give the goal a name.', tone: 'error' });
        return;
      }
      if (!Number.isInteger(n) || n <= 0) {
        toast.show({ message: 'Enter a whole point target above 0.', tone: 'error' });
        return;
      }
      goalTitle = t;
      targetPoints = n;
    }

    setSubmitting(true);
    const res = await createGoal({
      family_id: family.id,
      child_id: childId,
      kind,
      reward_id: goalRewardId,
      title: goalTitle,
      target_points: targetPoints,
      created_by: session?.user?.id ?? null,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    useGoalStore.getState().upsertGoal(res.data);
    hapticLight();
    toast.show({ message: 'Goal set!', tone: 'success' });
    resetAll();
    onCreated();
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={close}
      title="Set a goal"
      footer={
        <>
          <Button label="Set goal" onPress={onSubmit} loading={submitting} fullWidth />
          <Button label="Cancel" variant="ghost" onPress={close} fullWidth />
        </>
      }
    >
      <View style={styles.trophyHero}>
        <TydifiedKids height={64} animated />
      </View>
      <View>
        <Text style={styles.label}>For which child</Text>
        {children.length === 0 ? (
          <Text style={styles.helper} maxFontSizeMultiplier={1.4}>
            Add a child first.
          </Text>
        ) : (
          <View style={styles.chipWrap}>
            {children.map((child, index) => {
              const selected = childId === child.id;
              return (
                <Pressable
                  key={child.id}
                  onPress={() => setChildId(child.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.childChip, selected && styles.childChipActive]}
                >
                  <Avatar name={child.name} gradientIndex={index} size="sm" />
                  <Text
                    style={[styles.childChipText, selected && styles.childChipTextActive]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    {child.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View>
        <Text style={styles.label}>Goal type</Text>
        <SegmentedControl options={KIND_OPTIONS} value={kind} onChange={setKind} />
      </View>

      {kind === 'reward' ? (
        <View>
          <Text style={styles.label}>Save toward a reward</Text>
          {rewards.length === 0 ? (
            <Text style={styles.helper} maxFontSizeMultiplier={1.4}>
              Create a reward first (New Reward), then set it as a goal.
            </Text>
          ) : (
            <View style={styles.rewardList}>
              {rewards.map((reward) => {
                const selected = rewardId === reward.id;
                return (
                  <Pressable
                    key={reward.id}
                    onPress={() => setRewardId(reward.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.rewardRow, selected && styles.rewardRowActive]}
                  >
                    <Ionicons
                      name={
                        (reward.icon_name as React.ComponentProps<typeof Ionicons>['name']) ??
                        'gift'
                      }
                      size={18}
                      color={selected ? C.pink : C.textMid}
                    />
                    <Text
                      style={[styles.rewardTitle, selected && styles.rewardTitleActive]}
                      maxFontSizeMultiplier={1.3}
                      numberOfLines={1}
                    >
                      {reward.title}
                    </Text>
                    <PointsBadge points={reward.point_cost} size="sm" />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      ) : (
        <>
          <Input
            label="Goal name"
            placeholder="Summer camp fund"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="sentences"
            maxLength={60}
          />
          <Input
            label="Point target"
            placeholder="500"
            value={target}
            onChangeText={setTarget}
            keyboardType="number-pad"
            maxLength={6}
          />
        </>
      )}
    </ModalSheet>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    trophyHero: {
      alignItems: 'center',
      paddingVertical: spacing.s8,
    },
    label: {
      ...typography.caption,
      color: C.textMid,
      marginBottom: spacing.s8,
      marginLeft: spacing.s4,
    },
    helper: {
      ...typography.body,
      color: C.textMid,
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.s8,
    },
    childChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s8,
      paddingVertical: spacing.s4,
      paddingHorizontal: spacing.s8,
      borderRadius: radii.rFull,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.glassLight,
    },
    childChipActive: {
      borderColor: C.borderPink,
      backgroundColor: C.pinkAlpha10,
    },
    childChipText: {
      ...typography.caption,
      color: C.textDark,
      fontFamily: 'DMSans_600SemiBold',
    },
    childChipTextActive: {
      color: C.pinkText,
      fontFamily: 'DMSans_700Bold',
    },
    rewardList: {
      gap: spacing.s8,
    },
    rewardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
      paddingVertical: spacing.s12,
      paddingHorizontal: spacing.s12,
      borderRadius: radii.r14,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.glassLight,
    },
    rewardRowActive: {
      borderColor: C.borderPink,
      backgroundColor: C.pinkAlpha10,
    },
    rewardTitle: {
      ...typography.body,
      color: C.textDark,
      fontFamily: 'DMSans_600SemiBold',
      flex: 1,
    },
    rewardTitleActive: {
      color: C.pinkText,
    },
  });
