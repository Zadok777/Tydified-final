import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { C, spacing, typography } from '../../theme/tokens';
import { TydifiedIcon } from './TydifiedIcon';

export type TydifiedLogoVariant = 'full' | 'horizontal' | 'icon';

interface TydifiedLogoProps {
  // `full` stacks icon over wordmark; `horizontal` places them side-by-side;
  // `icon` returns just the smiley.
  variant?: TydifiedLogoVariant;
  // Drives both the icon size and the wordmark font size. The wordmark is
  // proportional so the brand reads consistently.
  iconSize?: number;
  // Forwarded to TydifiedIcon — when true, the smiley blinks and bobs.
  // Use on Welcome / Onboarding hero moments.
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TydifiedLogo({
  variant = 'full',
  iconSize = 64,
  animated = false,
  style,
}: TydifiedLogoProps) {
  if (variant === 'icon') {
    return <TydifiedIcon size={iconSize} animated={animated} style={style} />;
  }

  const wordmarkFontSize = Math.round(iconSize * 0.55);

  if (variant === 'horizontal') {
    return (
      <View style={[styles.horizontal, style]}>
        <TydifiedIcon size={iconSize} animated={animated} />
        <Text
          style={[
            styles.wordmark,
            { fontSize: wordmarkFontSize, marginLeft: spacing.s12 },
          ]}
          maxFontSizeMultiplier={1.5}
        >
          Tydified
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.stacked, style]}>
      <TydifiedIcon size={iconSize} animated={animated} />
      <Text
        style={[
          styles.wordmark,
          { fontSize: wordmarkFontSize, marginTop: spacing.s12 },
        ]}
        maxFontSizeMultiplier={1.5}
      >
        Tydified
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stacked: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: typography.headline.fontFamily,
    color: C.pink,
    letterSpacing: -0.8,
  },
});
