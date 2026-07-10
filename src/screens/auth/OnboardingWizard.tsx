import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { signOut as authSignOut } from '../../services/auth';
import { listChildren } from '../../services/children';
import { listFamilyMembers } from '../../services/families';
import { usDateToIso } from '../../utils/date';
import { completeOnboarding } from '../../services/rpc';
import { useFamilyStore } from '../../store/familyStore';
import {
  spacing,
  useThemedStyles,
  type Palette,
} from '../../theme';
import { AuthScaffold } from './AuthScaffold';

// First-run setup for a parent with no family. Two steps:
//   1. Family name
//   2. First child's name + optional date of birth
// On finish we call the `complete_onboarding` RPC (creates family + first
// child + settings in one transaction) and hydrate familyStore. Once
// `familyStore.family` is set, RootNavigator swaps to the Main shell
// automatically — no imperative navigation needed.
//
// COPPA: we collect a child's display name and (optional) date of birth only.
// Never an email, phone, or any other PII for a child.


const schema = yup.object({
  familyName: yup
    .string()
    .trim()
    .required('Give your family a name')
    .max(40, 'Keep it under 40 characters'),
  childName: yup
    .string()
    .trim()
    .required("Add your first child's name")
    .max(40, 'Keep it under 40 characters'),
  // Defaulted (never undefined) so the inferred form type keeps every field
  // required — that sidesteps the yupResolver optional-field generic mismatch.
  // An empty string means "not provided" and is converted to undefined at
  // submit time before the value reaches the RPC.
  childDob: yup
    .string()
    .trim()
    .default('')
    .test(
      'optional-past-date',
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

export function OnboardingWizard() {
  const toast = useToast();
  const styles = useThemedStyles(makeStyles);
  const [step, setStep] = useState<0 | 1>(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { familyName: '', childName: '', childDob: '' },
  });

  const goToChildStep = async () => {
    const valid = await trigger('familyName');
    if (valid) setStep(1);
  };

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    setSubmitting(true);

    const raw = values.childDob.trim();
    const dob = raw === '' ? '' : (usDateToIso(raw) ?? '');
    const res = await completeOnboarding(
      values.familyName,
      values.childName,
      dob === '' ? undefined : dob
    );

    if (!res.success) {
      setSubmitting(false);
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }

    // Hydrate the family context so RootNavigator switches to Main. We keep
    // submitting=true through this so the button stays disabled until the
    // navigator swaps out from under us.
    const family = res.data;
    const { setFamily, setChildren, setMembers } = useFamilyStore.getState();
    setFamily(family);

    const [childrenRes, membersRes] = await Promise.all([
      listChildren(family.id),
      listFamilyMembers(family.id),
    ]);
    if (childrenRes.success) setChildren(childrenRes.data);
    if (membersRes.success) setMembers(membersRes.data);
    // Navigator unmounts this screen now; no setSubmitting(false) needed.
  };

  const handleSignOut = async () => {
    const res = await authSignOut();
    if (!res.success) {
      toast.show({ message: res.error, tone: 'error' });
    }
    // onAuthStateChange resets the stores; RootNavigator returns to Welcome.
  };

  const title =
    step === 0 ? "Let's set up your family" : 'Add your first child';
  const subtitle =
    step === 0
      ? 'Pick a name everyone will recognize. You can change it later in Settings.'
      : 'Just a name to start. Date of birth is optional and only tailors the experience to their age — we never ask kids for an email or phone.';

  return (
    <AuthScaffold
      title={title}
      subtitle={subtitle}
      footer={
        <Button
          label="Not you? Sign out"
          variant="ghost"
          size="sm"
          onPress={handleSignOut}
        />
      }
    >
      {step === 0 ? (
        <>
          <Controller
            name="familyName"
            control={control}
            render={({ field }) => (
              <Input
                label="Family name"
                placeholder="The Garcia Family"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                autoCapitalize="words"
                maxLength={40}
                error={errors.familyName?.message}
              />
            )}
          />

          <View style={styles.submit}>
            <Button label="Continue" onPress={goToChildStep} fullWidth />
          </View>
        </>
      ) : (
        <>
          <Controller
            name="childName"
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
                error={errors.childName?.message}
              />
            )}
          />
          <Controller
            name="childDob"
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
                helper="Used to pick an age-appropriate look."
                error={errors.childDob?.message}
              />
            )}
          />

          <View style={styles.submit}>
            <Button
              label="Create my family"
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              fullWidth
            />
            <Button
              label="Back"
              variant="ghost"
              onPress={() => setStep(0)}
              fullWidth
            />
          </View>
        </>
      )}
    </AuthScaffold>
  );
}

const makeStyles = (_C: Palette) =>
  StyleSheet.create({
    submit: {
      gap: spacing.s8,
      marginTop: spacing.s8,
    },
  });
