import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { GradientCard } from '../ui/GradientCard';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { ModalSheet } from './ModalSheet';
import { approveChore, rejectChore } from '../../services/rpc';
import { hapticSuccess, hapticWarning } from '../../utils/haptics';
import { playSound } from '../../utils/sounds';
import {
  GRADIENTS,
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { Child, Chore, ChoreAssignment } from '../../types/app.types';
import { formatRelativeTime } from '../../utils/date';

interface ChoreApprovalModalProps {
  visible: boolean;
  onClose: () => void;
  assignment: ChoreAssignment | null;
  chore: Chore | null;
  child: Child | null;
  // Called after a successful approve/reject so the parent can refresh.
  onResolved: () => void;
}

export function ChoreApprovalModal({
  visible,
  onClose,
  assignment,
  chore,
  child,
  onResolved,
}: ChoreApprovalModalProps) {
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [mode, setMode] = useState<'choose' | 'deny'>('choose');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  // Reset the transient deny state whenever the sheet opens/closes or the
  // target assignment changes.
  useEffect(() => {
    setMode('choose');
    setNote('');
    setBusy(false);
  }, [visible, assignment?.id]);

  const close = () => {
    setMode('choose');
    setNote('');
    onClose();
  };

  const handleApprove = async () => {
    if (busy || assignment === null) return;
    setBusy(true);
    const res = await approveChore(assignment.id);
    setBusy(false);
    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    hapticSuccess();
    playSound('success');
    toast.show({ message: 'Approved — points awarded.', tone: 'success' });
    onResolved();
    close();
  };

  const handleReject = async () => {
    if (busy || assignment === null) return;
    setBusy(true);
    const trimmed = note.trim();
    const res = await rejectChore(
      assignment.id,
      trimmed === '' ? undefined : trimmed
    );
    setBusy(false);
    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    hapticWarning();
    toast.show({ message: 'Sent back to your child.', tone: 'info' });
    onResolved();
    close();
  };

  const current = child?.points ?? 0;
  const delta = chore?.point_value ?? 0;
  const after = current + delta;
  const submittedLabel = formatRelativeTime(assignment?.completed_at);

  return (
    <ModalSheet
      visible={visible}
      onClose={close}
      title="Review chore"
      footer={
        mode === 'choose' ? (
          <>
            <Button
              label="Approve"
              onPress={handleApprove}
              loading={busy}
              fullWidth
            />
            <Button
              label="Send back"
              variant="danger"
              onPress={() => setMode('deny')}
              disabled={busy}
              fullWidth
            />
          </>
        ) : (
          <>
            <Button
              label="Confirm send back"
              variant="danger"
              onPress={handleReject}
              loading={busy}
              fullWidth
            />
            <Button
              label="Cancel"
              variant="ghost"
              onPress={() => setMode('choose')}
              disabled={busy}
              fullWidth
            />
          </>
        )
      }
    >
      {assignment === null || chore === null ? (
        <Text style={styles.body} maxFontSizeMultiplier={1.4}>
          Nothing to review.
        </Text>
      ) : (
        <>
          <GradientCard
            colors={GRADIENTS.brand}
            padding={spacing.s20}
            radius={radii.r20}
          >
            <View style={styles.childRow}>
              <View style={styles.bannerAvatar}>
                <Text style={styles.bannerAvatarText} maxFontSizeMultiplier={1.3}>
                  {(child?.name ?? '?').trim().charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.childMeta}>
                <Text
                  style={styles.childNameLight}
                  maxFontSizeMultiplier={1.4}
                  numberOfLines={1}
                >
                  {child?.name ?? 'Child'}
                </Text>
                <Text style={styles.childSubLight} maxFontSizeMultiplier={1.4}>
                  {submittedLabel === '' ? 'Submitted' : `Submitted ${submittedLabel}`}
                </Text>
              </View>
            </View>
          </GradientCard>

          <GlassCard tint="pink" padding={spacing.s16}>
            <Text style={styles.choreTitle} maxFontSizeMultiplier={1.4}>
              {chore.title}
            </Text>
            <View style={styles.chips}>
              <Chip icon="star-outline" text={`${chore.point_value} pts`} />
              {chore.category != null ? (
                <Chip icon="pricetag-outline" text={chore.category} />
              ) : null}
              <Chip icon="repeat-outline" text={chore.frequency ?? 'once'} />
            </View>
            {chore.description != null && chore.description !== '' ? (
              <Text style={styles.notes} maxFontSizeMultiplier={1.4}>
                {chore.description}
              </Text>
            ) : null}
          </GlassCard>

          <View style={styles.photoProof}>
            <Ionicons name="camera-outline" size={22} color={C.textLight} />
            <Text style={styles.photoProofText} maxFontSizeMultiplier={1.3}>
              Photo proof — coming in v1.1
            </Text>
          </View>

          <GlassCard tint="green" padding={spacing.s16}>
            <Text style={styles.impactLabel} maxFontSizeMultiplier={1.3}>
              Points impact
            </Text>
            <View style={styles.impactRow}>
              <ImpactCell value={current} label="Current" />
              <Ionicons name="arrow-forward" size={16} color={C.textLight} />
              <ImpactCell value={delta} label="Earned" tone="green" prefix="+" />
              <Ionicons name="arrow-forward" size={16} color={C.textLight} />
              <ImpactCell value={after} label="After" tone="pink" />
            </View>
          </GlassCard>

          {mode === 'deny' ? (
            <Input
              label="Note (optional)"
              placeholder="Let them know what to fix"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              maxLength={280}
            />
          ) : null}
        </>
      )}
    </ModalSheet>
  );
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function Chip({ icon, text }: { icon: IoniconName; text: string }) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={13} color={C.textMid} />
      <Text style={styles.chipText} maxFontSizeMultiplier={1.2} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function ImpactCell({
  value,
  label,
  tone = 'neutral',
  prefix = '',
}: {
  value: number;
  label: string;
  tone?: 'neutral' | 'green' | 'pink';
  prefix?: string;
}) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const color =
    tone === 'green' ? C.greenText : tone === 'pink' ? C.pinkText : C.textDark;
  return (
    <View style={styles.impactCell}>
      <Text style={[styles.impactValue, { color }]} maxFontSizeMultiplier={1.3}>
        {prefix}
        {value}
      </Text>
      <Text style={styles.impactSub} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  body: {
    ...typography.body,
    color: C.textMid,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s12,
  },
  childMeta: {
    flex: 1,
  },
  childName: {
    ...typography.title,
    fontSize: 16,
    color: C.textDark,
  },
  childSub: {
    ...typography.caption,
    color: C.textMid,
    marginTop: 2,
  },
  bannerAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.rFull,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerAvatarText: {
    ...typography.title,
    fontSize: 20,
    color: C.pink,
  },
  childNameLight: {
    ...typography.title,
    fontSize: 18,
    color: '#FFFFFF',
  },
  childSubLight: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  photoProof: {
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    borderRadius: radii.r18,
    paddingVertical: spacing.s24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s8,
    backgroundColor: C.glassLight,
  },
  photoProofText: {
    ...typography.caption,
    color: C.textLight,
  },
  choreTitle: {
    ...typography.title,
    color: C.textDark,
    marginBottom: spacing.s12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
    paddingVertical: spacing.s4,
    paddingHorizontal: spacing.s8,
    borderRadius: radii.rFull,
    backgroundColor: C.glassLight,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipText: {
    ...typography.caption,
    color: C.textMid,
    textTransform: 'capitalize',
  },
  notes: {
    ...typography.body,
    color: C.textMid,
    marginTop: spacing.s12,
  },
  impactLabel: {
    ...typography.caption,
    color: C.textMid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.s12,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  impactCell: {
    alignItems: 'center',
    flex: 1,
    minWidth: 68,
  },
  impactValue: {
    ...typography.title,
    fontSize: 22,
  },
  impactSub: {
    ...typography.caption,
    color: C.textMid,
    marginTop: 2,
  },
});
