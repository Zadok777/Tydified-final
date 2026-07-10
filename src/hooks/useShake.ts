import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Duolingo-style "incorrect" feedback: a quick horizontal shake. Call
// `shake()` on a failed action and spread `shakeStyle` on the container.
const AMPLITUDE = 9;
const STEP_MS = 55;

export function useShake() {
  const offset = useSharedValue(0);

  const shake = useCallback(() => {
    offset.value = withSequence(
      withTiming(-AMPLITUDE, { duration: STEP_MS }),
      withTiming(AMPLITUDE, { duration: STEP_MS }),
      withTiming(-AMPLITUDE * 0.6, { duration: STEP_MS }),
      withTiming(AMPLITUDE * 0.6, { duration: STEP_MS }),
      withTiming(0, { duration: STEP_MS })
    );
  }, [offset]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return { shake, shakeStyle };
}
