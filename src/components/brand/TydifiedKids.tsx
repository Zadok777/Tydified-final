import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

// The Tydified kids — glossy 3D boy + girl mascot (Canva-generated to match
// the logo's bubble style). Replaces the trophy everywhere OUTSIDE the logo
// lockup; the trophy lives only inside the wordmark now.
const KIDS = require('../../../assets/tydified-kids.png');

// Intrinsic pixel geometry of the exported asset.
const KIDS_RATIO = 982 / 665; // width / height

const BOB_RANGE = 4;
const BOB_DURATION_MS = 1800;
const POP_FROM = 0.6;

interface TydifiedKidsProps {
  // Rendered height in points; width follows the intrinsic aspect ratio.
  height?: number;
  // Gentle idle bob, plus a springy pop-in on mount.
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TydifiedKids({
  height = 96,
  animated = false,
  style,
}: TydifiedKidsProps) {
  const bobY = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(animated ? POP_FROM : 1)).current;

  useEffect(() => {
    if (!animated) return undefined;
    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(bobY, {
          toValue: -BOB_RANGE,
          duration: BOB_DURATION_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobY, {
          toValue: 0,
          duration: BOB_DURATION_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    bob.start();
    return () => bob.stop();
  }, [animated, bobY, pop]);

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Tydified kids"
      style={[
        { width: height * KIDS_RATIO, height },
        animated && { transform: [{ translateY: bobY }, { scale: pop }] },
        style,
      ]}
    >
      <Image
        source={KIDS}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
