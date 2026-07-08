import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '../../components/layout/Header';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ChoreApprovalModal } from '../../components/modals/ChoreApprovalModal';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { GlassCard } from '../../components/ui/GlassCard';
import { PointsBadge } from '../../components/ui/PointsBadge';
import { SkeletonRow } from '../../components/ui/SkeletonLoader';
import { listChildren } from '../../services/children';
import { listAssignmentsForFamily, listChores } from '../../services/chores';
import { useChoreStore } from '../../store/choreStore';
import { useFamilyStore } from '../../store/familyStore';
import {
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import { formatRelativeTime } from '../../utils/date';
import { TAB_BAR_CLEARANCE } from './layout';

export function ReviewScreen() {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const chores = useChoreStore((s) => s.chores);
  const assignments = useChoreStore((s) => s.assignments);

  const [refreshing, setRefreshing] = useState(false);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => assignments.length === 0);

  const familyId = family?.id ?? null;

  const load = useCallback(async () => {
    if (familyId === null) {
      setLoading(false);
      return;
    }
    const { setAssignments, setChores } = useChoreStore.getState();
    const { setChildren } = useFamilyStore.getState();
    const [a, c, kids] = await Promise.all([
      listAssignmentsForFamily(familyId),
      listChores(familyId),
      listChildren(familyId),
    ]);
    if (a.success) setAssignments(a.data);
    if (c.success) setChores(c.data);
    if (kids.success) setChildren(kids.data);
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

  const pending = assignments.filter((a) => a.status === 'submitted');
  const childById = (id: string) => children.find((c) => c.id === id);
  const choreById = (id: string) => chores.find((c) => c.id === id);
  const childIndex = (id: string) => children.findIndex((c) => c.id === id);

  const approvalAssignment =
    approvalId === null
      ? null
      : assignments.find((a) => a.id === approvalId) ?? null;
  const approvalChore =
    approvalAssignment === null
      ? null
      : choreById(approvalAssignment.chore_id) ?? null;
  const approvalChild =
    approvalAssignment === null
      ? null
      : childById(approvalAssignment.child_id) ?? null;

  return (
    <>
      <ScreenContainer
        scroll
        contentStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header title="Review" subtitle="Approve completed chores" />

        {loading ? (
          <View style={styles.list}>
            <SkeletonRow />
            <SkeletonRow />
          </View>
        ) : pending.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="All caught up"
            description="No chores are waiting on you right now. New submissions will appear here."
          />
        ) : (
          <View style={styles.list}>
            {pending.map((assignment) => {
              const chore = choreById(assignment.chore_id);
              if (chore === undefined) return null;
              const child = childById(assignment.child_id);
              return (
                <Pressable
                  key={assignment.id}
                  onPress={() => setApprovalId(assignment.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Review ${chore.title} from ${child?.name ?? 'a child'}`}
                >
                  <GlassCard tint="orange" padding={spacing.s12}>
                    <View style={styles.row}>
                      <Avatar
                        name={child?.name ?? '?'}
                        gradientIndex={childIndex(assignment.child_id)}
                        size="md"
                      />
                      <View style={styles.meta}>
                        <Text
                          style={styles.title}
                          maxFontSizeMultiplier={1.4}
                          numberOfLines={1}
                        >
                          {chore.title}
                        </Text>
                        <Text
                          style={styles.sub}
                          maxFontSizeMultiplier={1.3}
                          numberOfLines={1}
                        >
                          {child?.name ?? 'Child'}
                          {assignment.completed_at != null
                            ? ` · ${formatRelativeTime(assignment.completed_at)}`
                            : ''}
                        </Text>
                      </View>
                      <PointsBadge points={chore.point_value} size="sm" />
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={C.textLight}
                        style={styles.chevron}
                      />
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScreenContainer>

      <ChoreApprovalModal
        visible={approvalId !== null}
        onClose={() => setApprovalId(null)}
        assignment={approvalAssignment}
        chore={approvalChore}
        child={approvalChild}
        onResolved={load}
      />
    </>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    content: {
      paddingBottom: TAB_BAR_CLEARANCE,
    },
    list: {
      gap: spacing.s12,
      marginTop: spacing.s8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
    },
    meta: {
      flex: 1,
    },
    title: {
      ...typography.title,
      fontSize: 16,
      color: C.textDark,
    },
    sub: {
      ...typography.caption,
      color: C.textMid,
      marginTop: 2,
    },
    chevron: {
      marginLeft: spacing.s4,
    },
  });
