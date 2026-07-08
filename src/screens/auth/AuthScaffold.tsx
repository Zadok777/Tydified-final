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
    <ScreenContainer
      keyboardAvoiding
      scroll
      noHorizontalPadding
      contentStyle={styles.scrollGrow}
    >
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
          {/* ~0.65× the circle: bob headroom so the trophy never kisses the ring */}
          <View style={[styles.trophyWrap, shadows.md]}>
            <TydifiedLogo variant="icon" iconSize={86} animated />
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
    scrollGrow: {
      flexGrow: 1,
    },
    root: {
      flex: 1,
      paddingBottom: spacing.s24,
    },
    // flex: 1 so the illustrated scene absorbs leftover height on short
    // screens (Welcome) instead of leaving a blank strip under the sheet;
    // shrinks back to minHeight when forms need the room.
    scene: {
      flex: 1,
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
    // Solid amber core + alpha halo: low-alpha amber alone blends to khaki
    // over both the light-blue scene and the dark navy ground.
    sun: {
      position: 'absolute',
      top: 34,
      right: 44,
      width: 64,
      height: 64,
      borderRadius: radii.rFull,
      backgroundColor: C.orange,
      borderWidth: 10,
      borderColor: C.orangeAlpha15,
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
