import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { usePressBounce } from '../../hooks/usePressBounce';
import {
  radii,
  shadows,
  spacing,
  typography,
  useTheme,
  type Palette,
} from '../../theme';
import { hapticLight } from '../../utils/haptics';

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const heightFor: Record<ButtonSize, number> = {
  sm: 44,
  md: 52,
  lg: 60,
};

const horizontalPaddingFor: Record<ButtonSize, number> = {
  sm: spacing.s16,
  md: spacing.s20,
  lg: spacing.s24,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const { C, mode } = useTheme();
  const isDisabled = disabled || loading;
  const { onPressIn, onPressOut, bounceStyle } = usePressBounce();
  const handlePress = () => {
    if (variant === 'primary') hapticLight();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={isDisabled ? undefined : onPressIn}
      onPressOut={isDisabled ? undefined : onPressOut}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          height: heightFor[size],
          paddingHorizontal: horizontalPaddingFor[size],
          width: fullWidth ? '100%' : undefined,
        },
        variantContainerStyle(C, variant),
        variant === 'primary' && !isDisabled && shadows.pink,
        isDisabled && styles.disabled,
        style,
        bounceStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColorFor(C, mode, variant)} />
      ) : (
        <View style={styles.content}>
          {iconLeft !== undefined ? (
            <View style={styles.iconLeft}>{iconLeft}</View>
          ) : null}
          <Text
            style={[typography.button, { color: textColorFor(C, mode, variant) }]}
          >
            {label}
          </Text>
          {iconRight !== undefined ? (
            <View style={styles.iconRight}>{iconRight}</View>
          ) : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

function variantContainerStyle(C: Palette, variant: ButtonVariant): ViewStyle {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: C.pink,
        borderWidth: 1,
        borderColor: C.borderPink,
      };
    case 'secondary':
      return {
        backgroundColor: C.glass,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
      };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'danger':
      return {
        backgroundColor: C.redAlpha15,
        borderWidth: 1,
        borderColor: 'rgba(220, 38, 38, 0.40)',
      };
  }
}

function textColorFor(
  C: Palette,
  mode: 'light' | 'dark',
  variant: ButtonVariant
): string {
  switch (variant) {
    case 'primary':
      return C.textWhite;
    case 'secondary':
      return C.textDark;
    case 'ghost':
      return C.pinkText;
    case 'danger':
      return mode === 'dark' ? '#FF7A7A' : '#B91C1C';
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.rFull,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.s8,
  },
  iconRight: {
    marginLeft: spacing.s8,
  },
  disabled: {
    opacity: 0.5,
  },
});
