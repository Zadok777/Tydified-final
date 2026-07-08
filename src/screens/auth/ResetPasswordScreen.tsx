import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import {
  confirmPasswordReset,
  requestPasswordReset,
} from '../../services/auth';
import {
  spacing,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { RootStackParamList } from '../../types/app.types';
import { AuthScaffold } from './AuthScaffold';

type Nav = StackNavigationProp<RootStackParamList, 'ResetPassword'>;
type Rt = RouteProp<RootStackParamList, 'ResetPassword'>;

const schema = yup.object({
  token: yup
    .string()
    .trim()
    .required('Enter the code from your email')
    .min(6, 'Enter the full code from your email'),
  password: yup
    .string()
    .required('Choose a new password')
    .min(8, 'At least 8 characters'),
  confirm: yup
    .string()
    .required('Re-enter your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

type FormValues = yup.InferType<typeof schema>;

export function ResetPasswordScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const email = route.params.email;
  const toast = useToast();
  const styles = useThemedStyles(makeStyles);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { token: '', password: '', confirm: '' },
  });

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    setSubmitting(true);
    const res = await confirmPasswordReset(
      email,
      values.token.trim(),
      values.password
    );
    setSubmitting(false);

    if (!res.success) {
      toast.show({ message: res.error, tone: 'error', duration: 5000 });
      return;
    }
    // verifyOtp created a session — RootNavigator swaps to the main stack.
    toast.show({ message: "Password updated. You're signed in.", tone: 'success' });
  };

  const onResend = async () => {
    if (resending) return;
    setResending(true);
    const res = await requestPasswordReset(email);
    setResending(false);
    toast.show(
      res.success
        ? { message: 'New code sent.', tone: 'success' }
        : { message: res.error, tone: 'error', duration: 5000 }
    );
  };

  return (
    <AuthScaffold
      title="Enter code"
      subtitle={`We sent a code to ${email}. Enter the full code below with your new password.`}
      onBack={() => nav.goBack()}
    >
      <Controller
        name="token"
        control={control}
        render={({ field }) => (
          <Input
            label="Code from email"
            placeholder="Enter the full code"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            textContentType="oneTimeCode"
            error={errors.token?.message}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            label="New password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        name="confirm"
        control={control}
        render={({ field }) => (
          <Input
            label="Confirm new password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            error={errors.confirm?.message}
          />
        )}
      />

      <View style={styles.submit}>
        <Button
          label="Update password"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          fullWidth
        />
      </View>

      <Button
        label="Resend code"
        variant="ghost"
        size="sm"
        onPress={onResend}
        loading={resending}
      />
    </AuthScaffold>
  );
}

const makeStyles = (_C: Palette) =>
  StyleSheet.create({
    submit: {
      marginTop: spacing.s8,
    },
  });
