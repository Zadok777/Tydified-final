import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import { Button } from './Button';
import { CartoonIcon, type CartoonIconName } from './CartoonIcon';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  // Ionicons name. Defaults to a friendly sparkles icon.
  icon?: IoniconName;
  // Glossy sticker icon; wins over `icon` when provided.
  cartoon?: CartoonIconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon = 'sparkles-outline',
  cartoon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const hasAction = actionLabel !== undefined && onAction !== undefined;

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.scene} pointerEvents="none">
        <View style={styles.sceneCardOne} />
        <View style={styles.sceneCardTwo} />
      </View>
      <View style={styles.iconBubble}>
        {cartoon !== undefined ? (
          <CartoonIcon name={cartoon} size={38} />
        ) : (
          <Ionicons name={icon} size={32} color={C.pink} />
        )}
      </View>
      <Text style={styles.title} maxFontSizeMultiplier={1.5}>
        {title}
      </Text>
      {description !== undefined ? (
        <Text style={styles.description} maxFontSizeMultiplier={1.5}>
          {description}
        </Text>
      ) : null}
      {hasAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} variant="primary" />
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.s24,
      paddingVertical: spacing.s32,
      backgroundColor: C.glass,
      borderRadius: radii.r20,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
    },
    scene: {
      position: 'absolute',
      top: spacing.s16,
      left: spacing.s24,
      right: spacing.s24,
      height: 72,
      opacity: 0.45,
    },
    sceneCardOne: {
      position: 'absolute',
      left: 8,
      top: 22,
      width: 72,
      height: 22,
      borderRadius: radii.r12,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
    },
    sceneCardTwo: {
      position: 'absolute',
      right: 0,
      top: 8,
      width: 82,
      height: 24,
      borderRadius: radii.r12,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
    },
    iconBubble: {
      width: 64,
      height: 64,
      borderRadius: radii.rFull,
      backgroundColor: C.pinkAlpha10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.s16,
      borderWidth: 1,
      borderColor: C.border,
    },
    title: {
      ...typography.title,
      color: C.textDark,
      textAlign: 'center',
      marginBottom: spacing.s8,
    },
    description: {
      ...typography.body,
      color: C.textMid,
      textAlign: 'center',
      maxWidth: 280,
    },
    action: {
      marginTop: spacing.s20,
      alignSelf: 'stretch',
    },
  });
