import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  radii,
  shadows,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  // Footer pinned below the scroll area (e.g. Save / Cancel buttons).
  footer?: React.ReactNode;
}

// Bottom-sheet scaffold shared by the app's modals. Transparent native Modal +
// a tap-to-dismiss backdrop + a glass sheet anchored to the bottom with rounded
// top corners. Content scrolls; an optional footer stays pinned. Keyboard-aware
// on iOS so form fields aren't covered.
export function ModalSheet({
  visible,
  onClose,
  title,
  children,
  footer,
}: ModalSheetProps) {
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.fill}>
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={[styles.sheet, shadows.xl2]}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.4}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={20} color={C.textDark} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {footer !== undefined ? (
              <View
                style={[
                  styles.footer,
                  { paddingBottom: Math.max(insets.bottom, spacing.s16) },
                ]}
              >
                {footer}
              </View>
            ) : (
              <View style={{ height: Math.max(insets.bottom, spacing.s16) }} />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 27, 0.46)',
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    backgroundColor: C.glass,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.rFull,
    backgroundColor: C.textLight,
    marginTop: spacing.s12,
    marginBottom: spacing.s8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s24,
    paddingBottom: spacing.s12,
  },
  title: {
    ...typography.headline,
    fontSize: 22,
    color: C.textDark,
    flex: 1,
    marginRight: spacing.s12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.rFull,
    backgroundColor: C.glassLight,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
  scroll: {
    paddingHorizontal: spacing.s24,
  },
  scrollContent: {
    paddingBottom: spacing.s16,
    gap: spacing.s16,
  },
  footer: {
    paddingHorizontal: spacing.s24,
    paddingTop: spacing.s12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: spacing.s8,
  },
  });
