import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { CartoonIcon, CATEGORY_CARTOON } from '../ui/CartoonIcon';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SegmentedControl } from '../ui/SegmentedControl';
import { useToast } from '../ui/Toast';
import { ModalSheet } from './ModalSheet';
import { assignChore, createChore } from '../../services/chores';
import { useAuthStore } from '../../store/authStore';
import { useChoreStore } from '../../store/choreStore';
import { useFamilyStore } from '../../store/familyStore';
import { hapticLight } from '../../utils/haptics';
import { usDateToIso } from '../../utils/date';
import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type {
  ChoreCategory,
  ChoreFrequency,
  RootStackParamList,
} from '../../types/app.types';
import { effectiveTier, tierLabel } from '../../utils/ageTier';
import { activeChoreCountForChild } from '../../utils/entitlements';
import { FREE_LIMITS } from '../../config/entitlements';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import {
  CHORE_SUGGESTIONS,
  type ChoreSuggestion,
} from '../../data/choreSuggestions';

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
] as const satisfies readonly { value: ChoreFrequency; label: string }[];

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORIES: readonly { value: ChoreCategory; icon: IoniconName }[] = [
  { value: 'bedroom', icon: 'bed-outline' },
  { value: 'kitchen', icon: 'restaurant-outline' },
  { value: 'bathroom', icon: 'water-outline' },
  { value: 'outdoor', icon: 'leaf-outline' },
  { value: 'pets', icon: 'paw-outline' },
  { value: 'laundry', icon: 'shirt-outline' },
  { value: 'homework', icon: 'book-outline' },
  { value: 'other', icon: 'ellipsis-horizontal-outline' },
];

const schema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Give the chore a title')
    .max(80, 'Keep it under 80 characters'),
  notes: yup.string().trim().default('').max(280, 'Keep notes under 280 characters'),
  points: yup
    .string()
    .trim()
    .required('Add a point value')
    .test('positive-int', 'Enter a whole number above 0', (value) => {
      const n = Number(value);
      return Number.isInteger(n) && n > 0;
    }),
  dueDate: yup
    .string()
    .trim()
    .default('')
    .test('valid-date', 'Use a real date (MM-DD-YYYY)', (value) => {
      if (value === undefined || value === '') return true;
      return usDateToIso(value) !== null;
    }),
});

type FormValues = yup.InferType<typeof schema>;

interface CreateChoreModalProps {
  visible: boolean;
  onClose: () => void;
  // Called after a successful create so the parent can refresh.
  onCreated: () => void;
}

export function CreateChoreModal({
  visible,
  onClose,
  onCreated,
}: CreateChoreModalProps) {
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const session = useAuthStore((s) => s.session);
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [frequency, setFrequency] = useState<ChoreFrequency>('once');
  const [category, setCategory] = useState<ChoreCategory | null>(null);
  const [childIds, setChildIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', notes: '', points: '', dueDate: '' },
  });

  // Single-child families are the common case — auto-select that child when the
  // sheet opens so "Create chore" works without an easy-to-miss extra tap.
  useEffect(() => {
    if (visible && children.length === 1 && childIds.length === 0) {
      setChildIds([children[0].id]);
    }
  }, [visible, children, childIds.length]);

  const resetAll = () => {
    reset({ title: '', notes: '', points: '', dueDate: '' });
    setFrequency('once');
    setCategory(null);
    setChildIds([]);
  };

  const close = () => {
    resetAll();
    onClose();
  };

  const toggleChild = (id: string) => {
    setChildIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Suggestions follow the selected child's tier (or the first child if none is
  // selected yet). Suggestions only — they prefill the form, never restrict it.
  const tierChild =
    children.find((c) => c.id === childIds[0]) ?? children[0] ?? null;
  const suggestionTier = tierChild ? effectiveTier(tierChild) : null;
  const suggestions = suggestionTier ? CHORE_SUGGESTIONS[suggestionTier] : [];

  const applySuggestion = (s: ChoreSuggestion) => {
    setValue('title', s.title, { shouldValidate: true });
    setValue('points', String(s.points), { shouldValidate: true });
    setCategory(s.category);
    hapticLight();
  };

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    if (family === null) {
      toast.show({ message: 'No family loaded.', tone: 'error' });
      return;
    }
    if (childIds.length === 0) {
      toast.show({ message: 'Assign the chore to at least one child.', tone: 'error' });
      return;
    }
    // Free-tier gate: a new chore adds one active chore to each selected child.
    // Check both subscription status AND the per-child limit (CLAUDE.md §12).
    const isPro = useSubscriptionStore.getState().isPro;
    if (!isPro) {
      const { chores, assignments } = useChoreStore.getState();
      const wouldExceed = childIds.some(
        (id) =>
          activeChoreCountForChild(id, chores, assignments) >=
          FREE_LIMITS.maxActiveChoresPerChild
      );
      if (wouldExceed) {
        close();
        nav.navigate('Paywall', { reason: 'chores' });
        return;
      }
    }

    setSubmitting(true);
    const actorId = session?.user?.id ?? null;
    const dueDate = values.dueDate.trim() === '' ? '' : (usDateToIso(values.dueDate) ?? '');

    const choreRes = await createChore({
      family_id: family.id,
      title: values.title,
      description: values.notes === '' ? null : values.notes,
      category,
      point_value: Number(values.points),
      frequency,
      is_active: true,
      created_by: actorId,
    });

    if (!choreRes.success) {
      setSubmitting(false);
      toast.show({ message: choreRes.error, tone: 'error', duration: 5000 });
      return;
    }

    const { upsertChore, upsertAssignment } = useChoreStore.getState();
    upsertChore(choreRes.data);

    let failures = 0;
    for (const childId of childIds) {
      const assignRes = await assignChore({
        chore_id: choreRes.data.id,
        child_id: childId,
        assigned_by: actorId,
        status: 'assigned',
        due_date: dueDate === '' ? null : dueDate,
      });
      if (assignRes.success) {
        upsertAssignment(assignRes.data);
      } else {
        failures += 1;
      }
    }

    setSubmitting(false);

    if (failures > 0) {
      toast.show({
        message: `Chore created, but ${failures} assignment${failures === 1 ? '' : 's'} failed.`,
        tone: 'error',
        duration: 5000,
      });
    } else {
      hapticLight();
      toast.show({ message: 'Chore created.', tone: 'success' });
    }
    resetAll();
    onCreated();
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={close}
      title="New chore"
      footer={
        <>
          <Button
            label="Create chore"
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
            fullWidth
          />
          <Button label="Cancel" variant="ghost" onPress={close} fullWidth />
        </>
      }
    >
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <Input
            label="Title"
            placeholder="Make the bed"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="sentences"
            maxLength={80}
            error={errors.title?.message}
          />
        )}
      />

      <View>
        <Text style={styles.fieldLabel}>Assign to</Text>
        {children.length === 0 ? (
          <Text style={styles.helper} maxFontSizeMultiplier={1.4}>
            Add a child in the Family tab first.
          </Text>
        ) : (
          <View style={styles.chipWrap}>
            {children.map((child, index) => {
              const selected = childIds.includes(child.id);
              return (
                <Pressable
                  key={child.id}
                  onPress={() => toggleChild(child.id)}
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
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={16} color={C.pink} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {suggestions.length > 0 && suggestionTier ? (
        <View>
          <Text style={styles.fieldLabel}>
            Suggested for {tierLabel(suggestionTier)}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestRow}
          >
            {suggestions.map((s) => (
              <Pressable
                key={s.title}
                onPress={() => applySuggestion(s)}
                accessibilityRole="button"
                accessibilityLabel={`Use suggestion: ${s.title}, ${s.points} points`}
                style={styles.suggestChip}
              >
                <Text style={styles.suggestChipText} numberOfLines={1}>
                  {s.title}
                </Text>
                <Text style={styles.suggestChipPts}>{s.points} pts</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Controller
        name="points"
        control={control}
        render={({ field }) => (
          <Input
            label="Point value"
            placeholder="10"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="number-pad"
            maxLength={5}
            error={errors.points?.message}
          />
        )}
      />

      <View>
        <Text style={styles.fieldLabel}>Frequency</Text>
        <SegmentedControl
          options={FREQUENCY_OPTIONS}
          value={frequency}
          onChange={setFrequency}
        />
      </View>

      <View>
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.chipWrap}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat.value;
            return (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(selected ? null : cat.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.catChip, selected && styles.catChipActive]}
              >
                <CartoonIcon name={CATEGORY_CARTOON[cat.value]} size={22} />
                <Text
                  style={[styles.catChipText, selected && styles.catChipTextActive]}
                  maxFontSizeMultiplier={1.2}
                >
                  {cat.value}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Controller
        name="dueDate"
        control={control}
        render={({ field }) => (
          <Input
            label="Due date (optional)"
            placeholder="MM-DD-YYYY"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            error={errors.dueDate?.message}
          />
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Input
            label="Notes (optional)"
            placeholder="Any extra instructions"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            multiline
            numberOfLines={3}
            maxLength={280}
            error={errors.notes?.message}
          />
        )}
      />
    </ModalSheet>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  fieldLabel: {
    ...typography.caption,
    color: C.textMid,
    marginBottom: spacing.s8,
    marginLeft: spacing.s4,
  },
  helper: {
    ...typography.body,
    color: C.textMid,
  },
  suggestRow: {
    gap: spacing.s8,
    paddingRight: spacing.s4,
  },
  suggestChip: {
    backgroundColor: C.pinkAlpha10,
    borderWidth: 1,
    borderColor: C.borderPink,
    borderRadius: radii.r16,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    alignItems: 'flex-start',
    maxWidth: 180,
  },
  suggestChipText: {
    ...typography.button,
    fontSize: 13,
    color: C.textDark,
  },
  suggestChipPts: {
    ...typography.caption,
    color: C.pink,
    marginTop: 2,
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
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4,
    paddingVertical: spacing.s8,
    paddingHorizontal: spacing.s12,
    borderRadius: radii.rFull,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.glassLight,
  },
  catChipActive: {
    borderColor: C.pink,
    backgroundColor: C.pink,
  },
  catChipText: {
    ...typography.caption,
    color: C.textMid,
    textTransform: 'capitalize',
  },
  catChipTextActive: {
    color: C.textWhite,
    fontFamily: 'DMSans_700Bold',
  },
});
