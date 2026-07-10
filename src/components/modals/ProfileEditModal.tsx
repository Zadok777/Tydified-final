import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { TydifiedIcon } from '../brand/TydifiedIcon';
import { Avatar, AVATAR_FACE } from '../ui/Avatar';
import { AVATAR_CARTOON } from '../ui/avatarCartoon';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { ModalSheet } from './ModalSheet';
import { updateMyProfile } from '../../services/auth';
import { updateChild } from '../../services/children';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { hapticLight } from '../../utils/haptics';
import {
  AVATAR_GRADIENTS,
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { Child } from '../../types/app.types';
import {
  AGE_TIERS,
  getAgeTier,
  tierLabel,
  type AgeTier,
} from '../../utils/ageTier';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Curated, kid-friendly icon options. `null` = initials; AVATAR_FACE = the
// Tydified smiley; anything else is an Ionicon name.
const ICON_OPTIONS: readonly (string | null)[] = [
  null,
  AVATAR_FACE,
  'happy',
  'star',
  'trophy',
  'medal',
  'paw',
  'football',
  'basketball',
  'bicycle',
  'game-controller',
  'rocket',
  'airplane',
  'boat',
  'car-sport',
  'heart',
  'planet',
  'sunny',
  'moon',
  'cloud',
  'ice-cream',
  'pizza',
  'musical-notes',
  'brush',
  'book',
  'flower',
  'leaf',
  'fish',
];

// Preview pop spring — a quick settle, not a wobble. Tuned once here so the
// selection feedback feels consistent for both color and icon taps.
const POP_FROM = 0.85;
const PICKER_GRADIENT_INDEXES = [0, 1, 2, 3, 4, 5] as const;

export type ProfileEditTarget =
  | { kind: 'parent' }
  | { kind: 'child'; child: Child };

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  target: ProfileEditTarget | null;
  onSaved: () => void;
}

export function ProfileEditModal({
  visible,
  onClose,
  target,
  onSaved,
}: ProfileEditModalProps) {
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);

  const [gradient, setGradient] = useState<number>(0);
  const [icon, setIcon] = useState<string | null>(null);
  const [tierOverride, setTierOverride] = useState<AgeTier | null>(null);
  const [saving, setSaving] = useState(false);

  // Preview pop: every color/icon selection snaps the preview to POP_FROM and
  // springs it back — instant, physical feedback that the tap "took".
  const previewScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    previewScale.setValue(POP_FROM);
    Animated.spring(previewScale, {
      toValue: 1,
      friction: 5,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [gradient, icon, previewScale]);

  const name =
    target?.kind === 'child'
      ? target.child.name
      : (profile?.display_name ?? session?.user?.email ?? 'You');

  // Seed the pickers from the current values whenever the sheet opens.
  useEffect(() => {
    if (!visible || target === null) return;
    if (target.kind === 'child') {
      setGradient(target.child.avatar_gradient ?? 0);
      setIcon(target.child.avatar_icon);
      setTierOverride((target.child.age_tier_override as AgeTier | null) ?? null);
    } else {
      setGradient(profile?.avatar_gradient ?? 0);
      setIcon(profile?.avatar_icon ?? null);
    }
  }, [visible, target, profile]);

  const onSave = async () => {
    if (saving || target === null) return;
    setSaving(true);

    if (target.kind === 'child') {
      const res = await updateChild(target.child.id, {
        avatar_gradient: gradient,
        avatar_icon: icon,
        age_tier_override: tierOverride,
      });
      setSaving(false);
      if (!res.success) {
        toast.show({ message: res.error, tone: 'error', duration: 5000 });
        return;
      }
      useFamilyStore.getState().upsertChild(res.data);
    } else {
      const res = await updateMyProfile({
        avatar_gradient: gradient,
        avatar_icon: icon,
      });
      setSaving(false);
      if (!res.success) {
        toast.show({ message: res.error, tone: 'error', duration: 5000 });
        return;
      }
      useAuthStore.getState().setProfile(res.data);
    }

    hapticLight();
    toast.show({
      message: target.kind === 'child' ? 'Profile updated.' : 'Avatar updated.',
      tone: 'success',
    });
    onSaved();
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={target?.kind === 'child' ? `${name}'s profile` : 'Your avatar'}
      footer={
        <>
          <Button label="Save" onPress={onSave} loading={saving} fullWidth />
          <Button label="Cancel" variant="ghost" onPress={onClose} fullWidth />
        </>
      }
    >
      <View style={styles.previewWrap}>
        <Animated.View style={{ transform: [{ scale: previewScale }] }}>
          <Avatar
            name={name}
            gradientIndex={gradient}
            icon={icon}
            size="xl"
            animated
          />
        </Animated.View>
      </View>

      <View>
        <Text style={styles.label}>Color</Text>
        <View style={styles.swatchRow}>
          {PICKER_GRADIENT_INDEXES.map((gradientIndex, i) => {
            const selected = gradient === gradientIndex;
            const g = AVATAR_GRADIENTS[gradientIndex];
            return (
              <Reanimated.View
                key={gradientIndex}
                entering={FadeInDown.duration(220).delay(Math.min(i, 8) * 30)}
              >
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setGradient(gradientIndex);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Color ${i + 1}`}
                  accessibilityState={{ selected }}
                  style={[styles.swatch, selected && styles.swatchSelected]}
                >
                  <LinearGradient
                    colors={g}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.swatchFill}
                  >
                    {selected ? (
                      <Ionicons name="checkmark" size={16} color={C.textWhite} />
                    ) : null}
                  </LinearGradient>
                </Pressable>
              </Reanimated.View>
            );
          })}
        </View>
      </View>

      <View>
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconWrap}>
          {ICON_OPTIONS.map((opt, i) => {
            const selected = icon === opt || (opt === null && icon == null);
            return (
              <Reanimated.View
                key={`${opt ?? 'initials'}-${i}`}
                entering={FadeInDown.duration(220).delay(Math.min(i, 8) * 30)}
              >
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setIcon(opt);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={opt ?? 'Initials'}
                  accessibilityState={{ selected }}
                  style={[styles.iconChip, selected && styles.iconChipSelected]}
                >
                  {opt === null ? (
                    <Text style={styles.iconInitials} maxFontSizeMultiplier={1.2}>
                      Aa
                    </Text>
                  ) : opt === AVATAR_FACE ? (
                    <TydifiedIcon
                      size={26}
                      ringColors={
                        AVATAR_GRADIENTS[
                          Math.abs(gradient) % AVATAR_GRADIENTS.length
                        ]
                      }
                    />
                  ) : AVATAR_CARTOON[opt] !== undefined ? (
                    <Image
                      source={AVATAR_CARTOON[opt]}
                      style={styles.iconSticker}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name={opt as IoniconName}
                      size={20}
                      color={selected ? C.pink : C.textMid}
                    />
                  )}
                </Pressable>
              </Reanimated.View>
            );
          })}
        </View>
      </View>

      {target?.kind === 'child' ? (
        <View>
          <Text style={styles.label}>Age group</Text>
          <Text style={styles.hint}>
            Tailors suggested chores & rewards. Auto-detected from birthday.
          </Text>
          <View style={styles.tierWrap}>
            <Pressable
              onPress={() => setTierOverride(null)}
              accessibilityRole="button"
              accessibilityState={{ selected: tierOverride === null }}
              style={[
                styles.tierChip,
                tierOverride === null && styles.tierChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.tierChipText,
                  tierOverride === null && styles.tierChipTextSelected,
                ]}
              >
                Auto ({tierLabel(getAgeTier(target.child.date_of_birth))})
              </Text>
            </Pressable>
            {AGE_TIERS.map((t) => {
              const selected = tierOverride === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTierOverride(t)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.tierChip, selected && styles.tierChipSelected]}
                >
                  <Text
                    style={[
                      styles.tierChipText,
                      selected && styles.tierChipTextSelected,
                    ]}
                  >
                    {tierLabel(t)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </ModalSheet>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    previewWrap: {
      alignItems: 'center',
      paddingVertical: spacing.s8,
    },
    label: {
      ...typography.caption,
      color: C.textMid,
      marginBottom: spacing.s8,
      marginLeft: spacing.s4,
    },
    hint: {
      ...typography.caption,
      color: C.textLight,
      marginTop: -4,
      marginBottom: spacing.s8,
      marginLeft: spacing.s4,
    },
    tierWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.s8,
    },
    tierChip: {
      paddingHorizontal: spacing.s12,
      paddingVertical: spacing.s8,
      borderRadius: radii.r12,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.glassLight,
    },
    tierChipSelected: {
      borderColor: C.pink,
      backgroundColor: C.pinkAlpha10,
    },
    tierChipText: {
      ...typography.caption,
      color: C.textMid,
    },
    tierChipTextSelected: {
      color: C.pink,
    },
    swatchRow: {
      flexDirection: 'row',
      flexWrap: 'wrap', // 11 swatches — must wrap on phone widths
      gap: spacing.s12,
    },
    swatch: {
      width: 48,
      height: 48,
      borderRadius: radii.rFull,
      borderWidth: 2,
      borderColor: 'transparent',
      padding: 2,
    },
    swatchSelected: {
      borderColor: C.textDark,
    },
    swatchFill: {
      flex: 1,
      borderRadius: radii.rFull,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.s8,
    },
    iconSticker: {
      width: 26,
      height: 26,
    },
    iconChip: {
      width: 46,
      height: 46,
      borderRadius: radii.r14,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.glassLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconChipSelected: {
      borderColor: C.pink,
      backgroundColor: C.pinkAlpha10,
    },
    iconInitials: {
      ...typography.title,
      fontSize: 15,
      color: C.textMid,
    },
  });
