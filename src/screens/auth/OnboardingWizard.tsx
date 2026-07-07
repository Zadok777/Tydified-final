import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { TydifiedLogo } from '../../components/brand/TydifiedLogo';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { signOut as authSignOut } from '../../services/auth';
import { listChildren } from '../../services/children';
import { listFamilyMembers } from '../../services/families';
import { completeOnboarding } from '../../services/rpc';
import { useFamilyStore } from '../../store/familyStore';
import {
  spacing,
  typography,
  useThemedStyles,
  type Palette,
} from '../../theme';

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

const DOB_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
      'Use a real past date (YYYY-MM-DD)',
      (value) => {
        if (value === undefined || value === '') return true;
        if (!DOB_PATTERN.test(value)) return false;
        const parsed = new Date(`${value}T00:00:00`);
        return !Number.isNaN(parsed.getTime()) && parsed.getTime() <= Date.now();
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

    const dob = values.childDob.trim();
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

  return (
    <ScreenContainer keyboardAvoiding scroll>
      <View style={styles.hero}>
        <TydifiedLogo variant="full" iconSize={72} animated />
      </View>

      {step === 0 ? (
        <View style={styles.block}>
          <Text style={styles.title} maxFontSizeMultiplier={1.5}>
            {"Let's set up your family"}
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
            Pick a name everyone will recognize. You can change it later in
            Settings.
          </Text>

          <View style={styles.form}>
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
          </View>
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={styles.title} maxFontSizeMultiplier={1.5}>
            Add your first child
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
            Just a name to start. Date of birth is optional and only tailors
            the experience to their age — we never ask kids for an email or
            phone.
          </Text>

          <View style={styles.form}>
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
                  placeholder="YYYY-MM-DD"
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
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label="Not you? Sign out"
          variant="ghost"
          size="sm"
          onPress={handleSignOut}
        />
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: spacing.s32,
    paddingBottom: spacing.s24,
  },
  block: {
    gap: spacing.s8,
  },
  title: {
    ...typography.headline,
    fontSize: 26,
    color: C.textDark,
  },
  subtitle: {
    ...typography.body,
    color: C.textMid,
  },
  form: {
    gap: spacing.s16,
    marginTop: spacing.s16,
  },
  submit: {
    gap: spacing.s8,
    marginTop: spacing.s8,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.s24,
  },
});
