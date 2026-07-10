import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';

import { AVATAR_CARTOON } from '../ui/avatarCartoon';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { ModalSheet } from './ModalSheet';
import { createReward } from '../../services/rewards';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { useRewardStore } from '../../store/rewardStore';
import { hapticLight } from '../../utils/haptics';
import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import {
  AGE_TIERS,
  effectiveTier,
  tierShortLabel,
  type AgeTier,
} from '../../utils/ageTier';
import {
  REWARD_SUGGESTIONS,
  type RewardSuggestion,
} from '../../data/rewardSuggestions';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Curated reward icons + accent colors so the data stays clean (no arbitrary
// values reach the DB). icon_name / color are plain strings in the schema.
const ICONS: readonly IoniconName[] = [
  'gift',
  'game-controller',
  'ice-cream',
  'tv',
  'bicycle',
  'cash',
  'pizza',
  'football',
  'basketball',
  'musical-notes',
  'headset',
  'book',
  'color-palette',
  'paw',
  'ticket',
  'balloon',
  'happy',
  'star',
  'planet',
  'car-sport',
];

// Fixed accent choices stored on the reward row — mode-independent literals.
// The five Tydified logo hues, sampled from the lockup, so every reward chip
// reads as the brand while staying distinguishable.
const COLORS: readonly string[] = [
  '#14B0FE', // Tydi blue (brand)
  '#FEAA01', // trophy amber
  '#60DB01', // tagline green
  '#FC5499', // fied pink
  '#B353FC', // fied purple
];

const schema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Give the reward a title')
    .max(60, 'Keep it under 60 characters'),
  description: yup
    .string()
    .trim()
    .default('')
    .max(200, 'Keep it under 200 characters'),
  pointCost: yup
    .string()
    .trim()
    .required('Add a point cost')
    .test('positive-int', 'Enter a whole number above 0', (value) => {
      const n = Number(value);
      return Number.isInteger(n) && n > 0;
    }),
});

type FormValues = yup.InferType<typeof schema>;

interface CreateRewardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRewardModal({
  visible,
  onClose,
  onCreated,
}: CreateRewardModalProps) {
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const session = useAuthStore((s) => s.session);

  const [icon, setIcon] = useState<IoniconName>('gift');
  const [color, setColor] = useState<string>(C.orange);
  const [submitting, setSubmitting] = useState(false);
  // Rewards are family-level, so let the parent pick which tier to browse
  // suggestions for (defaults to the first child's tier).
  const [suggestTier, setSuggestTier] = useState<AgeTier>(() =>
    children[0] ? effectiveTier(children[0]) : 'lower'
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '', pointCost: '' },
  });

  const rewardSuggestions = REWARD_SUGGESTIONS[suggestTier];

  const applyReward = (s: RewardSuggestion) => {
    setValue('title', s.title, { shouldValidate: true });
    setValue('pointCost', String(s.cost), { shouldValidate: true });
    setIcon(s.icon as IoniconName);
    hapticLight();
  };

  const resetAll = () => {
    reset({ title: '', description: '', pointCost: '' });
    setIcon('gift');
    setColor(C.orange);
  };

  const close = () => {
    resetAll();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    if (family === null) {
      toast.show({ message: 'No family loaded.', tone: 'error' });
      return;
    }
    setSubmitting(true);
    const res = await createReward({
      family_id: family.id,
      title: values.title,
      description: values.description === '' ? null : values.description,
      point_cost: Number(values.pointCost),
      icon_name: icon,
      color,
      is_active: true,
      created_by: session?.user?.id ?? null,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    useRewardStore.getState().upsertReward(res.data);
    hapticLight();
    toast.show({ message: 'Reward created.', tone: 'success' });
    resetAll();
    onCreated();
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={close}
      title="New reward"
      footer={
        <>
          <Button
            label="Create reward"
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
            placeholder="Movie night"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="sentences"
            maxLength={60}
            error={errors.title?.message}
          />
        )}
      />

      <Controller
        name="pointCost"
        control={control}
        render={({ field }) => (
          <Input
            label="Point cost"
            placeholder="100"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="number-pad"
            maxLength={6}
            error={errors.pointCost?.message}
          />
        )}
      />

      <View>
        <Text style={styles.fieldLabel}>Suggestions</Text>
        <View style={styles.tierRow}>
          {AGE_TIERS.map((t) => {
            const active = suggestTier === t;
            return (
              <Pressable
                key={t}
                onPress={() => setSuggestTier(t)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.tierChip, active && styles.tierChipActive]}
              >
                <Text
                  style={[styles.tierChipText, active && styles.tierChipTextActive]}
                >
                  {tierShortLabel(t)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestRow}
        >
          {rewardSuggestions.map((s) => (
            <Pressable
              key={s.title}
              onPress={() => applyReward(s)}
              accessibilityRole="button"
              accessibilityLabel={`Use reward: ${s.title}, ${s.cost} points`}
              style={styles.suggestChip}
            >
              <Text style={styles.suggestChipText} numberOfLines={1}>
                {s.title}
              </Text>
              <Text style={styles.suggestChipPts}>{s.cost} pts</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View>
        <Text style={styles.fieldLabel}>Icon</Text>
        <View style={styles.chipWrap}>
          {ICONS.map((name) => {
            const selected = icon === name;
            return (
              <Pressable
                key={name}
                onPress={() => setIcon(name)}
                accessibilityRole="button"
                accessibilityLabel={name}
                accessibilityState={{ selected }}
                style={[styles.iconChip, selected && styles.iconChipActive]}
              >
                {AVATAR_CARTOON[name] !== undefined ? (
                  <Image
                    source={AVATAR_CARTOON[name]}
                    style={styles.iconSticker}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons
                    name={name}
                    size={20}
                    color={selected ? C.textWhite : C.textMid}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text style={styles.fieldLabel}>Accent color</Text>
        <View style={styles.chipWrap}>
          {COLORS.map((c) => {
            const selected = color === c;
            return (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                accessibilityRole="button"
                accessibilityLabel={`Color ${c}`}
                accessibilityState={{ selected }}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  selected && styles.swatchActive,
                ]}
              >
                {selected ? (
                  <Ionicons name="checkmark" size={16} color={C.textWhite} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Input
            label="Description (optional)"
            placeholder="What they get"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            multiline
            numberOfLines={3}
            maxLength={200}
            error={errors.description?.message}
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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s8,
  },
  tierRow: {
    flexDirection: 'row',
    gap: spacing.s8,
    marginBottom: spacing.s12,
  },
  tierChip: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    borderRadius: radii.rFull,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.glassLight,
  },
  tierChipActive: {
    backgroundColor: C.pink,
    borderColor: C.pink,
  },
  tierChipText: {
    ...typography.caption,
    color: C.textMid,
  },
  tierChipTextActive: {
    color: C.textWhite,
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
    color: C.pinkText,
    marginTop: 2,
  },
  iconSticker: {
    width: 26,
    height: 26,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radii.r14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipActive: {
    backgroundColor: C.pink,
    borderColor: C.pink,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radii.rFull,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: C.textDark,
  },
});
