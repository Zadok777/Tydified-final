import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '../../components/layout/Header';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { CelebrationOverlay } from '../../components/modals/CelebrationOverlay';
import { CreateRewardModal } from '../../components/modals/CreateRewardModal';
import { RedeemRewardModal } from '../../components/modals/RedeemRewardModal';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { GlassCard } from '../../components/ui/GlassCard';
import { PointsBadge } from '../../components/ui/PointsBadge';
import { RewardCard } from '../../components/ui/RewardCard';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useCountUp } from '../../hooks/useCountUp';
import { listChildren } from '../../services/children';
import { listRedemptionsForFamily, listRewards } from '../../services/rewards';
import { useFamilyStore } from '../../store/familyStore';
import { useRewardStore } from '../../store/rewardStore';
import {
  radii,
  spacing,
  typography,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { Reward, RootStackParamList } from '../../types/app.types';
import { TAB_BAR_CLEARANCE } from './layout';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type Filter = 'all' | 'available' | 'locked';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'locked', label: 'Locked' },
] as const satisfies readonly { value: Filter; label: string }[];

export function RewardsScreen() {
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const rewards = useRewardStore((s) => s.rewards);
  const styles = useThemedStyles(makeStyles);
  const nav = useNavigation<StackNavigationProp<RootStackParamList, 'Rewards'>>();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => rewards.length === 0);

  const familyId = family?.id ?? null;

  // Keep a valid selected child as the roster loads/changes.
  useEffect(() => {
    if (children.length === 0) {
      setSelectedChildId(null);
      return;
    }
    setSelectedChildId((prev) =>
      prev !== null && children.some((c) => c.id === prev)
        ? prev
        : children[0].id
    );
  }, [children]);

  const load = useCallback(async () => {
    if (familyId === null) {
      setLoading(false);
      return;
    }
    const { setRewards, setRedemptions } = useRewardStore.getState();
    const { setChildren } = useFamilyStore.getState();

    const [rewardRes, childrenRes, redemptionRes] = await Promise.all([
      listRewards(familyId),
      listChildren(familyId),
      listRedemptionsForFamily(familyId),
    ]);
    if (rewardRes.success) setRewards(rewardRes.data);
    if (childrenRes.success) setChildren(childrenRes.data);
    if (redemptionRes.success) setRedemptions(redemptionRes.data);
    setLoading(false);
  }, [familyId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const selectedChild =
    children.find((c) => c.id === selectedChildId) ?? null;
  const balance = selectedChild?.points ?? 0;
  const displayBalance = useCountUp(balance);

  const isLocked = (reward: Reward) => balance < reward.point_cost;
  const visibleRewards = rewards.filter((r) => {
    if (filter === 'available') return !isLocked(r);
    if (filter === 'locked') return isLocked(r);
    return true;
  });

  const onRewardPress = (reward: Reward) => {
    if (isLocked(reward) || selectedChild === null) return;
    setRedeemTarget(reward);
  };

  return (
    <>
      <ScreenContainer
        scroll
        contentStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header
          title="Rewards"
          onBack={() => nav.goBack()}
          actions={[
            {
              iconName: 'add',
              onPress: () => setCreateVisible(true),
              accessibilityLabel: 'Add a reward',
            },
          ]}
        />

        {loading ? (
          <>
            <SkeletonLoader shape="block" height={72} style={styles.balanceCard} />
            <View style={[styles.grid, styles.skeletonGrid]}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.gridItem}>
                  <SkeletonLoader shape="block" height={150} />
                </View>
              ))}
            </View>
          </>
        ) : children.length === 0 ? (
          <EmptyState
            icon="happy-outline"
            title="No kids yet"
            description="Add a child in the Family tab before setting up rewards."
          />
        ) : (
          <>
            {children.length > 1 ? (
              <View style={styles.childPicker}>
                {children.map((child, index) => {
                  const selected = child.id === selectedChildId;
                  return (
                    <Pressable
                      key={child.id}
                      onPress={() => setSelectedChildId(child.id)}
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
            ) : null}

            <GlassCard tint="orange" style={styles.balanceCard}>
              <View style={styles.balanceRow}>
                <View>
                  <Text style={styles.balanceLabel} maxFontSizeMultiplier={1.3}>
                    {`${selectedChild?.name ?? 'Child'}'s balance`}
                  </Text>
                  <Text style={styles.balanceValue} maxFontSizeMultiplier={1.3}>
                    {displayBalance}
                  </Text>
                </View>
                <PointsBadge points={balance} size="lg" />
              </View>
            </GlassCard>

            <SegmentedControl
              options={FILTERS}
              value={filter}
              onChange={setFilter}
              style={styles.filter}
            />

            {visibleRewards.length === 0 ? (
              <EmptyState
                icon="gift-outline"
                title={rewards.length === 0 ? 'No rewards yet' : 'Nothing here'}
                description={
                  rewards.length === 0
                    ? 'Create a reward your kids can save their points for.'
                    : 'Try a different filter to see your other rewards.'
                }
                actionLabel={rewards.length === 0 ? 'Add a reward' : undefined}
                onAction={
                  rewards.length === 0 ? () => setCreateVisible(true) : undefined
                }
              />
            ) : (
              <View style={styles.grid}>
                {visibleRewards.map((reward) => (
                  <View key={reward.id} style={styles.gridItem}>
                    <RewardCard
                      title={reward.title}
                      description={reward.description ?? undefined}
                      pointCost={reward.point_cost}
                      iconName={
                        reward.icon_name != null
                          ? (reward.icon_name as IoniconName)
                          : undefined
                      }
                      accentColor={reward.color ?? undefined}
                      locked={isLocked(reward)}
                      onPress={() => onRewardPress(reward)}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScreenContainer>

      <CreateRewardModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={load}
      />

      <RedeemRewardModal
        visible={redeemTarget !== null}
        onClose={() => setRedeemTarget(null)}
        reward={redeemTarget}
        child={selectedChild}
        onRedeemed={(title) => {
          setRedeemTarget(null);
          void load();
          setCelebration(`Redeemed ${title}!`);
        }}
      />

      <CelebrationOverlay
        visible={celebration !== null}
        message={celebration ?? ''}
        onDone={() => setCelebration(null)}
      />
    </>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  content: {
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  childPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s8,
    marginTop: spacing.s8,
    marginBottom: spacing.s12,
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
  balanceCard: {
    marginTop: spacing.s8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    ...typography.caption,
    color: C.textMid,
  },
  balanceValue: {
    ...typography.heroNum,
    fontSize: 40,
    color: C.orange,
  },
  filter: {
    marginTop: spacing.s16,
    marginBottom: spacing.s16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s12,
  },
  skeletonGrid: {
    marginTop: spacing.s16,
  },
  gridItem: {
    width: '47.5%',
    flexGrow: 1,
  },
});
