import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AddChildModal } from '../../components/modals/AddChildModal';
import { CelebrationOverlay } from '../../components/modals/CelebrationOverlay';
import { CreateChoreModal } from '../../components/modals/CreateChoreModal';
import { CreateRewardModal } from '../../components/modals/CreateRewardModal';
import { ProfileEditModal } from '../../components/modals/ProfileEditModal';
import { SetGoalModal } from '../../components/modals/SetGoalModal';
import { Avatar } from '../../components/ui/Avatar';
import { GradientCard } from '../../components/ui/GradientCard';
import { SkeletonRow } from '../../components/ui/SkeletonLoader';
import { useToast } from '../../components/ui/Toast';
import { listActivity } from '../../services/activity';
import { listChildren } from '../../services/children';
import { listAssignmentsForFamily, listChores } from '../../services/chores';
import { deleteGoal, listGoals, markGoalReached } from '../../services/goals';
import { useActivityStore } from '../../store/activityStore';
import { useAuthStore } from '../../store/authStore';
import { useChoreStore } from '../../store/choreStore';
import { useFamilyStore } from '../../store/familyStore';
import { useGoalStore } from '../../store/goalStore';
import { GRADIENTS, useTheme, useThemedStyles } from '../../theme';
import type { MainTabParamList } from '../../types/app.types';
import { makeStyles } from './dashboard.styles';
import {
  GoalRow,
  KidProgress,
  QuickAction,
  SnapshotTile,
} from './DashboardSections';

type Nav = BottomTabNavigationProp<MainTabParamList, 'Home'>;

function greetingPeriod(): string {
  const h = new Date().getHours();
  if (h < 12) return 'MORNING';
  if (h < 17) return 'AFTERNOON';
  return 'EVENING';
}

function weekday(): string {
  return new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
}

export function ParentDashboard() {
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const chores = useChoreStore((s) => s.chores);
  const assignments = useChoreStore((s) => s.assignments);
  const goals = useGoalStore((s) => s.goals);

  const [refreshing, setRefreshing] = useState(false);
  const [choreModal, setChoreModal] = useState(false);
  const [rewardModal, setRewardModal] = useState(false);
  const [childModal, setChildModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [editAvatar, setEditAvatar] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => children.length === 0);

  const displayName =
    profile?.display_name ?? session?.user?.email?.split('@')[0] ?? 'there';
  const familyId = family?.id ?? null;

  const load = useCallback(async () => {
    if (familyId === null) {
      setLoading(false);
      return;
    }
    const { setAssignments, setChores } = useChoreStore.getState();
    const { setActivity } = useActivityStore.getState();
    const { setChildren } = useFamilyStore.getState();
    const { setGoals, upsertGoal } = useGoalStore.getState();
    const [a, c, act, kids, gs] = await Promise.all([
      listAssignmentsForFamily(familyId),
      listChores(familyId),
      listActivity(familyId, 20),
      listChildren(familyId),
      listGoals(familyId),
    ]);
    if (a.success) setAssignments(a.data);
    if (c.success) setChores(c.data);
    if (act.success) setActivity(act.data);
    if (kids.success) setChildren(kids.data);
    if (gs.success) {
      setGoals(gs.data);
      // Fire a one-time celebration for any goal whose target is now met.
      // markGoalReached only stamps reached_at if still null, so it can't
      // double-fire across reloads.
      if (kids.success) {
        for (const g of gs.data) {
          if (g.reached_at !== null) continue;
          const child = kids.data.find((k) => k.id === g.child_id);
          if ((child?.points ?? 0) >= g.target_points) {
            const mk = await markGoalReached(g.id);
            if (mk.success && mk.data !== null) {
              upsertGoal(mk.data);
              setCelebration(`${child?.name ?? 'A child'} hit "${g.title}"! 🎉`);
            }
            }
          }
        }
      }
    setLoading(false);
  }, [familyId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleDeleteGoal = async (id: string) => {
    const res = await deleteGoal(id);
    if (res.success) {
      useGoalStore.getState().removeGoal(id);
    } else {
      toast.show({ message: res.error, tone: 'error' });
    }
  };

  const pending = assignments.filter((a) => a.status === 'submitted');
  const assignedCount = assignments.filter((a) => a.status === 'assigned').length;
  const doneCount = assignments.filter((a) => a.status === 'approved').length;
  const totalPoints = children.reduce((s, c) => s + (c.points ?? 0), 0);

  const firstPending = pending[0];
  const firstPendingChore = firstPending
    ? chores.find((c) => c.id === firstPending.chore_id)
    : undefined;
  const firstPendingChild = firstPending
    ? children.find((c) => c.id === firstPending.child_id)
    : undefined;

  return (
    <>
      <ScreenContainer
        scroll
        contentStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.dateLabel} maxFontSizeMultiplier={1.3}>
              {weekday()} {greetingPeriod()}
            </Text>
            <Text style={styles.greeting} maxFontSizeMultiplier={1.4} numberOfLines={1}>
              Hey <Text style={styles.greetingName}>{displayName}</Text>
            </Text>
            <Text style={styles.subGreeting} maxFontSizeMultiplier={1.3}>
              {children.length} {children.length === 1 ? 'kid' : 'kids'}
              {pending.length > 0
                ? ` · ${pending.length} ${pending.length === 1 ? 'thing needs' : 'things need'} your eyes`
                : ' · all caught up'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => nav.navigate('Review')}
              accessibilityRole="button"
              accessibilityLabel="Review approvals"
              style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
            >
              <Ionicons name="notifications-outline" size={20} color={C.textDark} />
              {pending.length > 0 ? <View style={styles.bellDot} /> : null}
            </Pressable>
            <Pressable
              onPress={() => setEditAvatar(true)}
              accessibilityRole="button"
              accessibilityLabel="Edit your avatar"
            >
              <Avatar
                name={displayName}
                gradientIndex={profile?.avatar_gradient ?? undefined}
                icon={profile?.avatar_icon}
                size="md"
                animated
              />
            </Pressable>
          </View>
        </View>

        {/* Approval hero */}
        {pending.length > 0 ? (
          <Pressable
            onPress={() => nav.navigate('Review')}
            accessibilityRole="button"
            accessibilityLabel={`${pending.length} awaiting approval`}
          >
            <GradientCard colors={GRADIENTS.brand} style={styles.heroCard}>
              <View style={styles.heroTop}>
                <Text style={styles.heroLabel} maxFontSizeMultiplier={1.3}>
                  AWAITING YOUR APPROVAL
                </Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.9)" />
              </View>
              <View style={styles.heroBody}>
                <Text style={styles.heroCount} maxFontSizeMultiplier={1.3}>
                  {pending.length}
                </Text>
                <View style={styles.heroMeta}>
                  <Text style={styles.heroChore} maxFontSizeMultiplier={1.3} numberOfLines={1}>
                    {firstPendingChild?.name ?? 'A child'} ·{' '}
                    {firstPendingChore?.title ?? 'a chore'}
                  </Text>
                  {pending.length > 1 ? (
                    <Text style={styles.heroMore} maxFontSizeMultiplier={1.3}>
                      +{pending.length - 1} more to review
                    </Text>
                  ) : null}
                </View>
              </View>
            </GradientCard>
          </Pressable>
        ) : null}

        {/* Today's snapshot */}
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.5}>
          {"Today's snapshot"}
        </Text>
        <View style={styles.snapshotRow}>
          <SnapshotTile
            value={assignedCount}
            label="Assigned"
            tone="pink"
            onPress={() => nav.navigate('Chores')}
          />
          <SnapshotTile
            value={doneCount}
            label="Done"
            tone="green"
            onPress={() => nav.navigate('Review')}
          />
          <SnapshotTile
            value={totalPoints}
            label="Points"
            tone="orange"
            onPress={() => nav.navigate('Family')}
          />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.5}>
          Quick actions
        </Text>
        <View style={styles.actionGrid}>
          <QuickAction
            label="Add Chore"
            icon="add"
            cartoon="star"
            tone="pink"
            onPress={() => setChoreModal(true)}
          />
          <QuickAction
            label="New Reward"
            icon="gift"
            cartoon="gift"
            tone="orange"
            onPress={() => setRewardModal(true)}
          />
          <QuickAction
            label="Add Kid"
            icon="person-add"
            cartoon="happy"
            tone="green"
            onPress={() => setChildModal(true)}
          />
          <QuickAction
            label="Set Goal"
            icon="trophy"
            cartoon="trophy"
            tone="purple"
            onPress={() => setGoalModal(true)}
          />
        </View>

        {/* Goals */}
        {goals.length > 0 ? (
          <>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.5}>
              Goals
            </Text>
            <View style={styles.kidList}>
              {goals.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  child={children.find((c) => c.id === goal.child_id) ?? null}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* Family progress */}
        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.5}>
          Family progress
        </Text>
        {loading ? (
          <View style={styles.kidList}>
            <SkeletonRow />
            <SkeletonRow />
          </View>
        ) : children.length === 0 ? (
          <Pressable
            onPress={() => setChildModal(true)}
            style={({ pressed }) => [styles.emptyKids, pressed && styles.pressed]}
          >
            <Text style={styles.emptyKidsText} maxFontSizeMultiplier={1.4}>
              Add your first child to track progress here.
            </Text>
          </Pressable>
        ) : (
          <View style={styles.kidList}>
            {children.map((child, index) => (
              <Animated.View
                key={child.id}
                entering={FadeInDown.duration(220).delay(
                  Math.min(index, 8) * 40
                )}
              >
                <KidProgress
                  child={child}
                  gradientIndex={index}
                  total={assignments.filter((a) => a.child_id === child.id).length}
                  done={
                    assignments.filter(
                      (a) => a.child_id === child.id && a.status === 'approved'
                    ).length
                  }
                />
              </Animated.View>
            ))}
          </View>
        )}
      </ScreenContainer>

      <CreateChoreModal
        visible={choreModal}
        onClose={() => setChoreModal(false)}
        onCreated={load}
      />
      <CreateRewardModal
        visible={rewardModal}
        onClose={() => setRewardModal(false)}
        onCreated={load}
      />
      <AddChildModal
        visible={childModal}
        onClose={() => setChildModal(false)}
        onAdded={load}
      />
      <SetGoalModal
        visible={goalModal}
        onClose={() => setGoalModal(false)}
        onCreated={load}
      />
      <CelebrationOverlay
        visible={celebration !== null}
        message={celebration ?? ''}
        onDone={() => setCelebration(null)}
      />
      <ProfileEditModal
        visible={editAvatar}
        onClose={() => setEditAvatar(false)}
        target={{ kind: 'parent' }}
        onSaved={load}
      />
    </>
  );
}
