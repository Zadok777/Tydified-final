import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type {
  KeyboardTypeOptions,
  StyleProp,
  TextInputProps,
  ViewStyle,
} from 'react-native';

import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';

interface InputProps {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  placeholder?: string;
  helper?: string;
  // Non-empty `error` overrides `helper` and switches the border to a red tint.
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Input({
  value,
  onChangeText,
  label,
  placeholder,
  helper,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  autoComplete,
  textContentType,
  multiline = false,
  numberOfLines,
  maxLength,
  editable = true,
  onBlur,
  onFocus,
  style,
  testID,
}: InputProps) {
  const { C, mode } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'rgba(220, 38, 38, 0.60)'
    : focused
      ? C.borderPink
      : C.border;
  const errorColor = mode === 'dark' ? '#FF7A7A' : '#B91C1C';

  const handleFocus = () => {
    setFocused(true);
    if (onFocus) onFocus();
  };
  const handleBlur = () => {
    setFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label !== undefined ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          { borderColor },
          multiline && styles.fieldMultiline,
          !editable && styles.fieldDisabled,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          textContentType={textContentType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxFontSizeMultiplier={1.5}
          style={[
            styles.input,
            multiline && { minHeight: 24 * (numberOfLines ?? 3) },
          ]}
          testID={testID}
        />
      </View>
      {error ? (
        <Text style={[styles.helperText, { color: errorColor }]}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    label: {
      ...typography.caption,
      color: C.textMid,
      marginBottom: spacing.s8,
      marginLeft: spacing.s4,
    },
    field: {
      backgroundColor: C.glass,
      borderRadius: radii.r18,
      borderWidth: 1,
      paddingHorizontal: spacing.s16,
      height: 52,
      justifyContent: 'center',
    },
    fieldMultiline: {
      height: undefined,
      paddingVertical: spacing.s12,
    },
    fieldDisabled: {
      opacity: 0.6,
    },
    input: {
      ...typography.body,
      color: C.textDark,
      padding: 0, // Override RN's default platform padding
      margin: 0,
    },
    helperText: {
      ...typography.caption,
      color: C.textMid,
      marginTop: spacing.s4,
      marginLeft: spacing.s4,
    },
  });
