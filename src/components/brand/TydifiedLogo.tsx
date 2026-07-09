import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

// The Tydified lockup, layered so the brand can move:
//  - base: "Tydi 🏆 fied" wordmark (trophy baked in the middle of the name)
//  - confetti: the burst above the trophy, its own layer so it can pop
// Slices are cut from the master lockup; the confetti offsets below are the
// crop's position inside the base image and must track any asset re-export.
const BASE = require('../../../assets/tydified-wordmark-base.png');
const CONFETTI = require('../../../assets/tydified-confetti.png');
const TROPHY = require('../../../assets/tydified-trophy.png');

// Intrinsic pixel geometry of the exported slices.
const BASE_W = 1466;
const BASE_H = 532;
const CONFETTI_BOX = { left: 650, top: 0, width: 280, height: 163 };
const TROPHY_RATIO = 290 / 352;

// Motion — same restraint as TydifiedIcon: small ranges, sinusoidal easing,
// native driver. The wordmark breathes; the confetti drifts up and settles a
// beat later, like the trophy just tossed it.
const BOB_RANGE = 3;
const BOB_DURATION_MS = 2000;
const CONFETTI_RISE = 7;

export type TydifiedLogoVariant = 'full' | 'horizontal' | 'icon';

interface TydifiedLogoProps {
  // `full` and `horizontal` both render the one-line lockup (kept as separate
  // names for call-site compatibility); `icon` renders just the trophy.
  variant?: TydifiedLogoVariant;
  // Scale control, kept from the old API: lockup width = iconSize * 3, so
  // existing call sites (iconSize 72 / 104) land at sensible widths.
  iconSize?: number;
  // When true, the lockup bobs gently and the confetti pops above the trophy.
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TydifiedLogo({
  variant = 'full',
  iconSize = 100,
  animated = false,
  style,
}: TydifiedLogoProps) {
  const bobY = useRef(new Animated.Value(0)).current;
  const confettiY = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return undefined;
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
    // Confetti runs opposite-phase to the bob so the burst lifts while the
    // mark dips — reads as the trophy tossing it.
    const confetti = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(confettiY, {
            toValue: -CONFETTI_RISE,
            duration: BOB_DURATION_MS,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(confettiY, {
            toValue: 0,
            duration: BOB_DURATION_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(confettiOpacity, {
            toValue: 0.55,
            duration: BOB_DURATION_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(confettiOpacity, {
            toValue: 1,
            duration: BOB_DURATION_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    bob.start();
    confetti.start();
    return () => {
      bob.stop();
      confetti.stop();
    };
  }, [animated, bobY, confettiY, confettiOpacity]);

  if (variant === 'icon') {
    return (
      <Animated.View
        accessibilityRole="image"
        accessibilityLabel="Tydified"
        style={[
          { width: iconSize * TROPHY_RATIO, height: iconSize },
          animated && { transform: [{ translateY: bobY }] },
          style,
        ]}
      >
        <Image source={TROPHY} style={styles.fill} resizeMode="contain" />
      </Animated.View>
    );
  }

  const width = iconSize * 3;
  const height = width * (BASE_H / BASE_W);
  const scale = width / BASE_W;

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Tydified — do chores, earn points, unlock rewards, level up"
      style={[
        { width, height },
        animated && { transform: [{ translateY: bobY }] },
        style,
      ]}
    >
      <Image source={BASE} style={styles.fill} resizeMode="contain" />
      <Animated.Image
        source={CONFETTI}
        resizeMode="contain"
        style={{
          position: 'absolute',
          left: CONFETTI_BOX.left * scale,
          top: CONFETTI_BOX.top * scale,
          width: CONFETTI_BOX.width * scale,
          height: CONFETTI_BOX.height * scale,
          opacity: animated ? confettiOpacity : 1,
          transform: animated ? [{ translateY: confettiY }] : [],
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
});
