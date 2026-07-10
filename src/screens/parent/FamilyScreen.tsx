import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '../../components/layout/Header';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { AddChildModal } from '../../components/modals/AddChildModal';
import {
  ProfileEditModal,
  type ProfileEditTarget,
} from '../../components/modals/ProfileEditModal';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { GlassCard } from '../../components/ui/GlassCard';
import { SkeletonRow } from '../../components/ui/SkeletonLoader';
import { useToast } from '../../components/ui/Toast';
import { listActivity } from '../../services/activity';
import { deleteChild, listChildren } from '../../services/children';
import { useActivityStore } from '../../store/activityStore';
import { useFamilyStore } from '../../store/familyStore';
import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { ActivityLog, Child } from '../../types/app.types';
import { formatRelativeTime } from '../../utils/date';
import { TAB_BAR_CLEARANCE } from './layout';
import { ageFromDob, effectiveTier, tierLabel } from '../../utils/ageTier';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export function FamilyScreen() {
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const activity = useActivityStore((s) => s.activity);

  const [refreshing, setRefreshing] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<ProfileEditTarget | null>(null);
  const [loading, setLoading] = useState(() => children.length === 0);

  const familyId = family?.id ?? null;

  const load = useCallback(async () => {
    if (familyId === null) {
      setLoading(false);
      return;
    }
    const [kids, act] = await Promise.all([
      listChildren(familyId),
      listActivity(familyId, 12),
    ]);
    if (kids.success) useFamilyStore.getState().setChildren(kids.data);
    if (act.success) useActivityStore.getState().setActivity(act.data);
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

  const onShare = async () => {
    if (family?.invite_code == null) return;
    try {
      await Share.share({
        message: `Join our family on Tydified! Use invite code ${family.invite_code}.`,
      });
    } catch {
      // user dismissed share sheet — no-op
    }
  };

  const confirmRemove = (child: Child) => {
    Alert.alert(
      `Remove ${child.name}?`,
      'This permanently deletes their chores, points, and history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteChild(child.id);
            if (!res.success) {
              toast.show({ message: res.error, tone: 'error', duration: 5000 });
              return;
            }
            useFamilyStore.getState().removeChild(child.id);
            toast.show({ message: `${child.name} removed.`, tone: 'info' });
          },
        },
      ]
    );
  };

  const thisWeekPoints = (childId: string): number => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return activity
      .filter(
        (a) =>
          a.child_id === childId &&
          (a.point_value ?? 0) > 0 &&
          new Date(a.created_at ?? '').getTime() >= weekAgo
      )
      .reduce((sum, a) => sum + (a.point_value ?? 0), 0);
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
          title="Family"
          subtitle={`${children.length} ${children.length === 1 ? 'kid' : 'kids'}${family?.name != null ? ` · ${family.name}` : ''}`}
          actions={[
            {
              iconName: 'person-add',
              onPress: () => setAddVisible(true),
              accessibilityLabel: 'Add a child',
            },
          ]}
        />

        {family?.invite_code != null ? (
          <GlassCard tint="pink" style={styles.inviteCard}>
            <View style={styles.inviteRow}>
              <View style={styles.inviteMeta}>
                <Text style={styles.inviteLabel} maxFontSizeMultiplier={1.3}>
                  FAMILY INVITE CODE
                </Text>
                <Text style={styles.inviteCode} maxFontSizeMultiplier={1.3}>
                  {family.invite_code}
                </Text>
              </View>
              <Pressable
                onPress={onShare}
                accessibilityRole="button"
                accessibilityLabel="Share invite code"
                style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
              >
                <Ionicons name="share-social" size={15} color={C.textWhite} />
                <Text style={styles.shareText} maxFontSizeMultiplier={1.2}>
                  Share
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        ) : null}

        <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.5}>
          Kids
        </Text>
        {loading ? (
          <View style={styles.list}>
            <SkeletonRow />
            <SkeletonRow />
          </View>
        ) : children.length === 0 ? (
          <EmptyState
            icon="happy-outline"
            cartoon="star"
            title="No kids yet"
            description="Add your first child to start assigning chores and rewards."
            actionLabel="Add a child"
            onAction={() => setAddVisible(true)}
          />
        ) : (
          <View style={styles.list}>
            {children.map((child, index) => {
              const age = ageFromDob(child.date_of_birth);
              const tierName = tierLabel(effectiveTier(child));
              return (
                <GlassCard key={child.id} style={styles.kidCard}>
                  <View style={styles.kidTop}>
                    <Pressable
                      onPress={() => setEditTarget({ kind: 'child', child })}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${child.name}'s avatar`}
                    >
                      <Avatar
                        name={child.name}
                        gradientIndex={child.avatar_gradient ?? index}
                        icon={child.avatar_icon}
                        size="md"
                      />
                    </Pressable>
                    <View style={styles.kidMeta}>
                      <Text
                        style={styles.kidName}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                      >
                        {child.name}
                      </Text>
                      {age !== null ? (
                        <Text style={styles.kidSub} maxFontSizeMultiplier={1.3}>
                          Age {age} · {tierName}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => confirmRemove(child)}
                      accessibilityRole="button"
                      accessibilityLabel={`Manage ${child.name}`}
                      hitSlop={8}
                      style={({ pressed }) => [pressed && styles.pressed]}
                    >
                      <Ionicons name="settings-outline" size={18} color={C.textLight} />
                    </Pressable>
                  </View>
                  <View style={styles.statRow}>
                    <MiniStat label="POINTS" value={child.points ?? 0} tone="orange" />
                    <MiniStat label="STREAK" value={`${child.streak_days ?? 0}d`} tone="rose" />
                    <MiniStat label="THIS WK" value={thisWeekPoints(child.id)} tone="green" />
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}

        {activity.length > 0 ? (
          <>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={1.5}>
              Recent activity
            </Text>
            <View style={styles.list}>
              {activity.slice(0, 8).map((entry) => (
                <ActivityRow
                  key={entry.id}
                  entry={entry}
                  childName={
                    children.find((c) => c.id === entry.child_id)?.name ?? null
                  }
                />
              ))}
            </View>
          </>
        ) : null}
      </ScreenContainer>

      <AddChildModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onAdded={load}
      />
      <ProfileEditModal
        visible={editTarget !== null}
        onClose={() => setEditTarget(null)}
        target={editTarget}
        onSaved={load}
      />
    </>
  );
}

// ---------------------------------------------------------------------------

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  // One lockup hue per stat: points = amber, streak = rose, this-week = green.
  tone: 'orange' | 'rose' | 'green';
}) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tint = {
    orange: { color: C.orangeText, bg: C.orangeAlpha10 },
    rose: { color: C.rose, bg: C.roseAlpha10 },
    green: { color: C.greenText, bg: C.greenAlpha10 },
  }[tone];
  return (
    <View style={[styles.miniStat, { backgroundColor: tint.bg }]}>
      <Text style={[styles.miniValue, { color: tint.color }]} maxFontSizeMultiplier={1.2}>
        {value}
      </Text>
      <Text style={styles.miniLabel} maxFontSizeMultiplier={1.1} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const ACTIVITY_VISUAL: Record<string, { icon: IoniconName; tone: 'pink' | 'green' | 'orange' }> = {
  chore_completed: { icon: 'checkmark-circle', tone: 'green' },
  chore_approved: { icon: 'checkmark-circle', tone: 'green' },
  chore_rejected: { icon: 'refresh', tone: 'orange' },
  reward_redeemed: { icon: 'gift', tone: 'pink' },
  points_earned: { icon: 'star', tone: 'orange' },
  child_added: { icon: 'person-add', tone: 'pink' },
  chore_created: { icon: 'list', tone: 'orange' },
};

function ActivityRow({
  entry,
  childName,
}: {
  entry: ActivityLog;
  childName: string | null;
}) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const visual = ACTIVITY_VISUAL[entry.type ?? ''] ?? {
    icon: 'ellipse' as IoniconName,
    tone: 'pink' as const,
  };
  const bg =
    visual.tone === 'pink'
      ? C.pinkAlpha10
      : visual.tone === 'green'
        ? C.greenAlpha15
        : C.orangeAlpha10;
  const iconColor =
    visual.tone === 'pink' ? C.pink : visual.tone === 'green' ? C.green : C.orange;
  const pts = entry.point_value ?? 0;

  return (
    <GlassCard padding={spacing.s12}>
      <View style={styles.activityRow}>
        <View style={[styles.activityIcon, { backgroundColor: bg }]}>
          <Ionicons name={visual.icon} size={16} color={iconColor} />
        </View>
        <View style={styles.activityMeta}>
          <Text style={styles.activityTitle} maxFontSizeMultiplier={1.3} numberOfLines={1}>
            {childName !== null ? `${childName} · ` : ''}
            {entry.title ?? entry.type ?? 'Activity'}
          </Text>
          <Text style={styles.activityTime} maxFontSizeMultiplier={1.2}>
            {formatRelativeTime(entry.created_at)}
          </Text>
        </View>
        {pts !== 0 ? (
          <Text
            style={[styles.activityPts, { color: pts > 0 ? C.greenText : C.textMid }]}
            maxFontSizeMultiplier={1.2}
          >
            {pts > 0 ? '+' : ''}
            {pts}
          </Text>
        ) : null}
      </View>
    </GlassCard>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    content: {
      paddingBottom: TAB_BAR_CLEARANCE,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.96 }],
    },
    inviteCard: {
      marginTop: spacing.s8,
    },
    inviteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
    },
    inviteMeta: {
      flex: 1,
    },
    inviteLabel: {
      ...typography.caption,
      color: C.textMid,
      letterSpacing: 0.8,
    },
    inviteCode: {
      ...typography.title,
      fontSize: 22,
      color: C.pinkText,
      letterSpacing: 2,
      marginTop: 2,
    },
    shareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s4,
      backgroundColor: C.pink,
      paddingHorizontal: spacing.s16,
      paddingVertical: spacing.s8,
      borderRadius: radii.rFull,
    },
    shareText: {
      ...typography.button,
      fontSize: 13,
      color: C.textWhite,
    },
    sectionTitle: {
      ...typography.title,
      color: C.textDark,
      marginTop: spacing.s24,
      marginBottom: spacing.s12,
    },
    list: {
      gap: spacing.s12,
    },
    kidCard: {},
    kidTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
    },
    kidMeta: {
      flex: 1,
    },
    kidName: {
      ...typography.title,
      fontSize: 16,
      color: C.textDark,
    },
    kidSub: {
      ...typography.caption,
      color: C.textMid,
      marginTop: 2,
    },
    statRow: {
      flexDirection: 'row',
      gap: spacing.s8,
      marginTop: spacing.s12,
    },
    miniStat: {
      flex: 1,
      borderRadius: radii.r16,
      paddingVertical: spacing.s12,
      paddingHorizontal: spacing.s12,
      alignItems: 'flex-start',
      backgroundColor: C.glassLight,
      borderWidth: 1,
      borderColor: C.border,
    },
    miniValue: {
      ...typography.heroNum,
      fontSize: 22,
    },
    miniLabel: {
      ...typography.label,
      fontSize: 10,
      color: C.textMid,
      marginTop: 2,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.rFull,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    activityMeta: {
      flex: 1,
    },
    activityTitle: {
      ...typography.body,
      color: C.textDark,
      fontFamily: 'DMSans_600SemiBold',
    },
    activityTime: {
      ...typography.caption,
      color: C.textMid,
      marginTop: 2,
    },
    activityPts: {
      ...typography.title,
      fontSize: 15,
    },
  });
