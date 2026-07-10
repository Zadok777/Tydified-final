import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Duolingo-style tactile press: a quick dip on press-in, then a springy
// overshoot back on release. One spring config for the whole app so every
// surface bounces the same way — tune here, not per call site.
const DIP_SCALE = 0.94;
const DIP_MS = 80;
const SPRING = { damping: 12, stiffness: 320, mass: 0.7 };

export function usePressBounce() {
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withTiming(DIP_SCALE, { duration: DIP_MS });
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING);
  }, [scale]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, bounceStyle };
}
