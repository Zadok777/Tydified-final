import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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

export type ToastTone = 'success' | 'error' | 'info';

interface ShowToastOptions {
  message: string;
  tone?: ToastTone;
  // Milliseconds before auto-dismiss. Defaults to 3000.
  duration?: number;
}

interface ToastContextValue {
  show(opts: ShowToastOptions): void;
  hide(): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

// Provider + hook pattern. App.tsx wraps the navigation tree in <ToastProvider>;
// screens call `const { show } = useToast()`. This stays decoupled from any
// global singleton — easier to test, easier to type, no module-level state.

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [clearTimer, opacity, translateY]);

  const show = useCallback(
    ({ message, tone = 'info', duration = 3000 }: ShowToastOptions) => {
      clearTimer();
      counter.current += 1;
      setToast({ id: counter.current, message, tone });
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 16,
          stiffness: 180,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      timer.current = setTimeout(hide, duration);
    },
    [clearTimer, hide, opacity, translateY]
  );

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {toast ? (
        <ToastView
          message={toast.message}
          tone={toast.tone}
          translateY={translateY}
          opacity={opacity}
          onDismiss={hide}
        />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === null) {
    throw new Error('useToast must be used inside a <ToastProvider>.');
  }
  return ctx;
}

interface ToastViewProps {
  message: string;
  tone: ToastTone;
  translateY: Animated.Value;
  opacity: Animated.Value;
  onDismiss: () => void;
}

interface ToneVisual {
  background: string;
  borderColor: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
}

function toneVisual(
  C: Palette,
  mode: 'light' | 'dark',
  tone: ToastTone
): ToneVisual {
  switch (tone) {
    case 'success':
      return {
        background: C.greenAlpha15,
        borderColor: 'rgba(96, 219, 1, 0.30)',
        iconName: 'checkmark-circle',
        iconColor: C.greenText,
      };
    case 'error':
      return {
        background: C.redAlpha15,
        borderColor: 'rgba(220, 38, 38, 0.30)',
        iconName: 'alert-circle',
        iconColor: mode === 'dark' ? '#FF7A7A' : '#B91C1C',
      };
    case 'info':
      return {
        background: C.glass,
        borderColor: C.border,
        iconName: 'information-circle',
        iconColor: C.pink,
      };
  }
}

function ToastView({
  message,
  tone,
  translateY,
  opacity,
  onDismiss,
}: ToastViewProps) {
  const insets = useSafeAreaInsets();
  const { C, mode } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const visual = toneVisual(C, mode, tone);
  // Opaque base so the toast never lets the header text bleed through. The
  // tonal tint is layered on top of this solid surface, not used as the
  // (translucent) background itself.
  const surface = mode === 'dark' ? '#221C31' : '#FFFFFF';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        { top: insets.top + spacing.s12 },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <Pressable
        onPress={onDismiss}
        accessibilityRole="alert"
        accessibilityLabel={message}
        style={[
          styles.toast,
          shadows.lg,
          {
            backgroundColor: surface,
            borderColor: visual.borderColor,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: visual.background, borderRadius: radii.r16 },
          ]}
        />
        <Ionicons name={visual.iconName} size={20} color={visual.iconColor} />
        <Text style={styles.message} maxFontSizeMultiplier={1.5}>
          {message}
        </Text>
        <View style={styles.spacer} />
        <Ionicons name="close" size={18} color={C.textMid} />
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: spacing.s16,
      right: spacing.s16,
      zIndex: 100,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.s12,
      paddingHorizontal: spacing.s16,
      borderRadius: radii.r16,
      borderWidth: 1,
      gap: spacing.s12,
    },
    message: {
      ...typography.body,
      color: C.textDark,
      flex: 1,
    },
    spacer: {
      width: spacing.s4,
    },
  });
