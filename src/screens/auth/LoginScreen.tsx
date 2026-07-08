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
import { signIn as authSignIn } from '../../services/auth';
import {
  spacing,
  typography,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { RootStackParamList } from '../../types/app.types';
import { AuthScaffold } from './AuthScaffold';

type Nav = StackNavigationProp<RootStackParamList, 'Login'>;

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email'),
  // Length validation is intentionally minimal on login — the server is the
  // authority. We only need *some* input to call sign-in.
  password: yup.string().required('Password is required'),
});

type FormValues = yup.InferType<typeof schema>;

export function LoginScreen() {
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
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    setSubmitting(true);
    const res = await authSignIn(values.email, values.password);
    setSubmitting(false);

    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    // onAuthStateChange will hydrate authStore and RootNavigator will swap
    // to the main stack — no explicit nav.navigate needed.
  };

  return (
    <AuthScaffold
      title="Sign in"
      subtitle="Welcome back."
      onBack={() => nav.goBack()}
    >
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
          label="Sign in"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          fullWidth
        />
      </View>

      <Button
        label="Forgot password?"
        variant="ghost"
        size="sm"
        onPress={() => nav.navigate('ForgotPassword')}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchText} maxFontSizeMultiplier={1.5}>
          No account yet?
        </Text>
        <Button
          label="Create one"
          variant="ghost"
          size="sm"
          onPress={() => nav.navigate('SignUp')}
        />
      </View>
    </AuthScaffold>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  submit: {
    marginTop: spacing.s8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.s12,
  },
  switchText: {
    ...typography.body,
    color: C.textMid,
    marginRight: spacing.s4,
  },
});
