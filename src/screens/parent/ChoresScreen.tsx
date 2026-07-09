import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '../../components/layout/Header';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ChoreApprovalModal } from '../../components/modals/ChoreApprovalModal';
import { CreateChoreModal } from '../../components/modals/CreateChoreModal';
import { ChoreRow } from '../../components/ui/ChoreRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { SkeletonRow } from '../../components/ui/SkeletonLoader';
import { useToast } from '../../components/ui/Toast';
import { listActivity } from '../../services/activity';
import { listChildren } from '../../services/children';
import { listAssignmentsForFamily, listChores } from '../../services/chores';
import { submitChore } from '../../services/rpc';
import { useActivityStore } from '../../store/activityStore';
import { useChoreStore } from '../../store/choreStore';
import { useFamilyStore } from '../../store/familyStore';
import { spacing, useThemedStyles, type Palette } from '../../theme';
import type {
  Child,
  Chore,
  ChoreAssignment,
  ChoreStatus,
} from '../../types/app.types';
import { formatDueLabel } from '../../utils/date';
import { TAB_BAR_CLEARANCE } from './layout';

type Filter = 'all' | 'assigned' | 'submitted';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'assigned', label: 'To do' },
  { value: 'submitted', label: 'Pending' },
] as const satisfies readonly { value: Filter; label: string }[];

export function ChoresScreen() {
  const toast = useToast();
  const styles = useThemedStyles(makeStyles);
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const chores = useChoreStore((s) => s.chores);
  const assignments = useChoreStore((s) => s.assignments);

  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  // Show skeletons only on the very first load (when the store has no
  // assignments yet); a populated store means we navigated back here, so skip.
  const [loading, setLoading] = useState(() => assignments.length === 0);

  const familyId = family?.id ?? null;

  const load = useCallback(async () => {
    if (familyId === null) {
      setLoading(false);
      return;
    }
    const { setAssignments, setChores } = useChoreStore.getState();
    const { setActivity } = useActivityStore.getState();
    const { setChildren } = useFamilyStore.getState();

    const [assignRes, choreRes, activityRes, childrenRes] = await Promise.all([
      listAssignmentsForFamily(familyId),
      listChores(familyId),
      listActivity(familyId, 20),
      listChildren(familyId),
    ]);
    if (assignRes.success) setAssignments(assignRes.data);
    if (choreRes.success) setChores(choreRes.data);
    if (activityRes.success) setActivity(activityRes.data);
    if (childrenRes.success) setChildren(childrenRes.data);
    setLoading(false);
  }, [familyId]);

  // Reload whenever the tab regains focus so changes made elsewhere (or by the
  // approval flow's server-side point updates) show up.
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

  const choreById = (id: string): Chore | undefined =>
    chores.find((c) => c.id === id);
  const childById = (id: string): Child | undefined =>
    children.find((c) => c.id === id);
  const childIndex = (id: string): number =>
    children.findIndex((c) => c.id === id);

  const markSubmitted = async (assignment: ChoreAssignment) => {
    if (submittingId !== null) return;
    setSubmittingId(assignment.id);
    const res = await submitChore(assignment.id);
    setSubmittingId(null);
    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    toast.show({ message: 'Marked as submitted.', tone: 'info' });
    await load();
  };

  const onRowPress = (assignment: ChoreAssignment) => {
    if (assignment.status === 'assigned' || assignment.status === 'rejected') {
      void markSubmitted(assignment);
    } else if (assignment.status === 'submitted') {
      setApprovalId(assignment.id);
    }
    // approved → no action
  };

  const visible = assignments.filter((a) =>
    filter === 'all' ? true : a.status === filter
  );

  const approvalAssignment =
    approvalId === null ? null : assignments.find((a) => a.id === approvalId) ?? null;
  const approvalChore =
    approvalAssignment === null ? null : choreById(approvalAssignment.chore_id) ?? null;
  const approvalChild =
    approvalAssignment === null ? null : childById(approvalAssignment.child_id) ?? null;

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
          title="Chores"
          actions={[
            {
              iconName: 'add',
              onPress: () => setCreateVisible(true),
              accessibilityLabel: 'Add a chore',
            },
          ]}
        />

        <SegmentedControl
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          style={styles.filter}
        />

        {loading ? (
          <View style={styles.list}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="checkbox-outline"
            cartoon="books"
            title={
              assignments.length === 0
                ? 'No chores yet'
                : 'Nothing in this filter'
            }
            description={
              assignments.length === 0
                ? 'Create a chore and assign it to a child to get started.'
                : 'Try a different filter to see your other chores.'
            }
            actionLabel={assignments.length === 0 ? 'Add a chore' : undefined}
            onAction={
              assignments.length === 0
                ? () => setCreateVisible(true)
                : undefined
            }
          />
        ) : (
          <View style={styles.list}>
            {visible.map((assignment, index) => {
              const chore = choreById(assignment.chore_id);
              if (chore === undefined) return null;
              const child = childById(assignment.child_id);
              return (
                <Animated.View
                  key={assignment.id}
                  entering={FadeInDown.duration(220).delay(
                    Math.min(index, 8) * 40
                  )}
                >
                  <ChoreRow
                    title={chore.title}
                    pointValue={chore.point_value}
                    status={assignment.status as ChoreStatus}
                    assigneeName={child?.name}
                    assigneeGradientIndex={childIndex(assignment.child_id)}
                    dueLabel={formatDueLabel(assignment.due_date)}
                    onPress={() => onRowPress(assignment)}
                  />
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScreenContainer>

      <CreateChoreModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onCreated={load}
      />

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

const makeStyles = (_C: Palette) =>
  StyleSheet.create({
    content: {
      paddingBottom: TAB_BAR_CLEARANCE,
    },
    filter: {
      marginTop: spacing.s8,
      marginBottom: spacing.s16,
    },
    list: {
      gap: spacing.s12,
    },
  });
