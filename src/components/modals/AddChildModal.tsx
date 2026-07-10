import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { ModalSheet } from './ModalSheet';
import { FREE_LIMITS } from '../../config/entitlements';
import { createChild } from '../../services/children';
import { usDateToIso } from '../../utils/date';
import { useFamilyStore } from '../../store/familyStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import type { RootStackParamList } from '../../types/app.types';
import { hapticLight } from '../../utils/haptics';

// COPPA: we collect a child's display name and (optional) date of birth only —
// never email, phone, or any other PII. When a DOB makes the child under 13,
// we flag the row and record that the parent (who is adding them) consented.

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Add the child's name")
    .max(40, 'Keep it under 40 characters'),
  dob: yup
    .string()
    .trim()
    .default('')
    .test(
      'valid-past-date',
      'Use a real past date (MM-DD-YYYY)',
      (value) => {
        if (value === undefined || value === '') return true;
        const iso = usDateToIso(value);
        if (iso === null) return false;
        return new Date(`${iso}T00:00:00`).getTime() <= Date.now();
      }
    ),
});

type FormValues = yup.InferType<typeof schema>;

function ageFromDob(isoDob: string): number | null {
  const d = new Date(`${isoDob}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

interface AddChildModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddChildModal({ visible, onClose, onAdded }: AddChildModalProps) {
  const toast = useToast();
  const family = useFamilyStore((s) => s.family);
  const children = useFamilyStore((s) => s.children);
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', dob: '' },
  });

  const close = () => {
    reset({ name: '', dob: '' });
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    if (family === null) {
      toast.show({ message: 'No family loaded.', tone: 'error' });
      return;
    }
    // Free-tier gate: check both subscription status AND the limit (CLAUDE.md §12).
    const isPro = useSubscriptionStore.getState().isPro;
    if (!isPro && children.length >= FREE_LIMITS.maxChildren) {
      close();
      nav.navigate('Paywall', { reason: 'children' });
      return;
    }
    setSubmitting(true);
    const dob = values.dob.trim() === '' ? '' : (usDateToIso(values.dob) ?? '');
    const age = dob === '' ? null : ageFromDob(dob);
    const under13 = age !== null && age < 13;

    const res = await createChild({
      family_id: family.id,
      name: values.name,
      date_of_birth: dob === '' ? null : dob,
      is_under_13: under13,
      parental_consent_given: under13,
      parental_consent_at: under13 ? new Date().toISOString() : null,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    useFamilyStore.getState().upsertChild(res.data);
    hapticLight();
    toast.show({ message: `${res.data.name} added.`, tone: 'success' });
    reset({ name: '', dob: '' });
    onAdded();
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={close}
      title="Add a child"
      footer={
        <>
          <Button
            label="Add child"
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
            fullWidth
          />
          <Button label="Cancel" variant="ghost" onPress={close} fullWidth />
        </>
      }
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input
            label="Child's name"
            placeholder="Sofia"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="words"
            maxLength={40}
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        name="dob"
        control={control}
        render={({ field }) => (
          <Input
            label="Date of birth (optional)"
            placeholder="MM-DD-YYYY"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            helper="Only a name and birthday — never an email or phone for kids."
            error={errors.dob?.message}
          />
        )}
      />
    </ModalSheet>
  );
}
