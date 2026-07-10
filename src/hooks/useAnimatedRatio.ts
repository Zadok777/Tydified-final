import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Animates a 0..1 ratio and returns an interpolated '0%'..'100%' width for
// progress-bar fills, so bars ease to their new value instead of snapping.
// Used by ProgressBar and the dashboard KidProgress bars.
export function useAnimatedRatio(
  ratio: number
): Animated.AnimatedInterpolation<string> {
  const clamped = Math.max(0, Math.min(1, ratio));
  const anim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width is a layout prop
    }).start();
  }, [anim, clamped]);

  return anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
}
