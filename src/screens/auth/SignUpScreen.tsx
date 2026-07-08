import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { signUp as authSignUp } from '../../services/auth';
import {
  spacing,
  typography,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { RootStackParamList } from '../../types/app.types';
import { AuthScaffold } from './AuthScaffold';

type Nav = StackNavigationProp<RootStackParamList, 'SignUp'>;

const schema = yup.object({
  displayName: yup
    .string()
    .trim()
    .required('Name is required')
    .max(40, 'Keep it under 40 characters'),
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'At least 8 characters'),
});

type FormValues = yup.InferType<typeof schema>;

export function SignUpScreen() {
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const styles = useThemedStyles(makeStyles);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    setSubmitting(true);
    const res = await authSignUp(
      values.email,
      values.password,
      values.displayName
    );
    setSubmitting(false);

    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }

    // If the Supabase project has email confirmation enabled, signUp returns
    // a user with no session. Send them to Login with a hint instead of
    // dropping them on a half-onboarded state.
    if (!res.data.session) {
      toast.show({
        message: 'Account created. Check your email to confirm, then sign in.',
        tone: 'info',
        duration: 5000,
      });
      nav.navigate('Login');
      return;
    }

    // Session present → onAuthStateChange in useAuthBootstrap will pick this
    // up and RootNavigator will swap to the main stack automatically.
  };

  return (
    <AuthScaffold
      title="Create account"
      subtitle="Parents only — kids are added inside the app after onboarding."
      onBack={() => nav.goBack()}
    >
      <Controller
        name="displayName"
        control={control}
        render={({ field }) => (
          <Input
            label="Your name"
            placeholder="Alex Parent"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            error={errors.displayName?.message}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input
            label="Email"
            placeholder="you@example.com"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            label="Password"
            placeholder="At least 8 characters"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            error={errors.password?.message}
          />
        )}
      />

      <View style={styles.submit}>
        <Button
          label="Create account"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          fullWidth
        />
      </View>

      <Text style={styles.legal} maxFontSizeMultiplier={1.5}>
        By creating an account you agree to use Tydified with kids whose
        parental consent you can give.
      </Text>
    </AuthScaffold>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  submit: {
    marginTop: spacing.s8,
  },
  legal: {
    ...typography.caption,
    color: C.textMid,
    textAlign: 'center',
    marginTop: spacing.s12,
  },
});
