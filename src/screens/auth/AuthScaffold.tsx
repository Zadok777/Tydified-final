import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TydifiedLogo } from '../../components/brand/TydifiedLogo';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import {
  radii,
  shadows,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';

interface AuthScaffoldProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthScaffold({
  title,
  subtitle,
  onBack,
  children,
  footer,
}: AuthScaffoldProps) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <ScreenContainer keyboardAvoiding scroll noHorizontalPadding>
      <View style={styles.root}>
        <View style={styles.scene}>
          {onBack !== undefined ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={22} color={C.textDark} />
            </Pressable>
          ) : null}

          <View style={styles.sun} />
          <View style={styles.cloudLeft} />
          <View style={styles.cloudRight} />
          <View style={styles.taskCardOne}>
            <View style={styles.taskDot} />
            <View style={styles.taskLine} />
          </View>
          <View style={styles.taskCardTwo}>
            <View style={styles.taskDotAmber} />
            <View style={styles.taskLineShort} />
          </View>
          <View style={[styles.trophyWrap, shadows.md]}>
            <TydifiedLogo variant="icon" iconSize={112} animated />
          </View>
        </View>

        <View style={[styles.sheet, shadows.md]}>
          <Text style={styles.title} maxFontSizeMultiplier={1.4}>
            {title}
          </Text>
          {subtitle !== undefined ? (
            <Text style={styles.subtitle} maxFontSizeMultiplier={1.4}>
              {subtitle}
            </Text>
          ) : null}
          <View style={styles.form}>{children}</View>
          {footer !== undefined ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      paddingBottom: spacing.s24,
    },
    scene: {
      minHeight: 260,
      backgroundColor: C.pinkAlpha10,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: spacing.s24,
      marginBottom: -spacing.s24,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
    backButton: {
      position: 'absolute',
      left: spacing.s16,
      top: spacing.s12,
      width: 44,
      height: 44,
      borderRadius: radii.rFull,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    sun: {
      position: 'absolute',
      top: 34,
      right: 44,
      width: 72,
      height: 72,
      borderRadius: radii.rFull,
      backgroundColor: C.orangeAlpha15,
    },
    cloudLeft: {
      position: 'absolute',
      left: 26,
      top: 76,
      width: 116,
      height: 42,
      borderRadius: radii.rFull,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      opacity: 0.9,
    },
    cloudRight: {
      position: 'absolute',
      right: 20,
      top: 132,
      width: 86,
      height: 34,
      borderRadius: radii.rFull,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      opacity: 0.9,
    },
    taskCardOne: {
      position: 'absolute',
      left: 22,
      bottom: 48,
      width: 118,
      height: 52,
      borderRadius: radii.r18,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.s12,
      gap: spacing.s8,
      transform: [{ rotate: '-4deg' }],
    },
    taskCardTwo: {
      position: 'absolute',
      right: 24,
      bottom: 36,
      width: 126,
      height: 52,
      borderRadius: radii.r18,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.s12,
      gap: spacing.s8,
      transform: [{ rotate: '5deg' }],
    },
    taskDot: {
      width: 24,
      height: 24,
      borderRadius: radii.rFull,
      backgroundColor: C.pinkAlpha15,
      borderWidth: 1,
      borderColor: C.borderPink,
    },
    taskDotAmber: {
      width: 24,
      height: 24,
      borderRadius: radii.rFull,
      backgroundColor: C.orangeAlpha15,
      borderWidth: 1,
      borderColor: C.orangeAlpha15,
    },
    taskLine: {
      flex: 1,
      height: 8,
      borderRadius: radii.rFull,
      backgroundColor: C.mutedAlpha20,
    },
    taskLineShort: {
      width: 54,
      height: 8,
      borderRadius: radii.rFull,
      backgroundColor: C.mutedAlpha20,
    },
    trophyWrap: {
      width: 132,
      height: 132,
      borderRadius: radii.rFull,
      backgroundColor: C.glass,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: spacing.s12,
    },
    sheet: {
      marginHorizontal: spacing.s16,
      backgroundColor: C.glass,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: C.border,
      padding: spacing.s24,
    },
    title: {
      ...typography.headline,
      fontSize: 28,
      color: C.textDark,
      textAlign: 'center',
    },
    subtitle: {
      ...typography.body,
      color: C.textMid,
      textAlign: 'center',
      marginTop: spacing.s8,
    },
    form: {
      gap: spacing.s16,
      marginTop: spacing.s24,
    },
    footer: {
      marginTop: spacing.s20,
      alignItems: 'center',
    },
  });
