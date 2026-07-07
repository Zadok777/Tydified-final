import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { C } from '../../theme/tokens';

interface TydifiedIconProps {
  // Side length in px. Component is rendered into a square box.
  size?: number;
  // Override the inner face fill — defaults to white. Set to C.bg if you
  // want the icon to blend into a lavender background.
  faceFill?: string;
  // Override the dark feature color (eyes + smile).
  featureColor?: string;
  // Border-ring gradient pair. Defaults to the brand primary pair; pass an
  // AVATAR_GRADIENTS entry to render the face in that lockup hue family
  // (blue, pink, purple, gold, green, orange).
  ringColors?: readonly [string, string];
  // When true, the smiley winks (right eye) every few seconds and the icon
  // bobs gently. Use on welcome screens and hero brand moments. Default off so
  // smaller chrome uses (header avatars, list rows) stay still and cheap.
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Eye geometry. Eyes are always rendered as ellipses so the blink animation
// can squash ry → 0.5 without swapping shapes mid-render. When the icon is
// not animated, rx == ry == OPEN_RY which is visually identical to a circle.
const OPEN_RY = 5;
const CLOSED_RY = 0.5;
const BLINK_CLOSE_MS = 90;
const BLINK_INTERVAL_MS = 3500;

// Bob geometry — kept subtle. Anything > 4px starts to feel like a marketing
// site rather than an app icon. translateY uses native Animated so the loop
// runs cheaply across iOS/Android/web.
const BOB_RANGE = 2.5;
const BOB_DURATION_MS = 2000;

export function TydifiedIcon({
  size = 64,
  faceFill = C.textWhite,
  featureColor = C.textDark,
  ringColors,
  animated = false,
  style,
}: TydifiedIconProps) {
  // Only the right eye animates → a wink (not a both-eye blink). The left eye
  // stays open at OPEN_RY.
  const [rightRy, setRightRy] = useState(OPEN_RY);
  const bobY = useRef(new Animated.Value(0)).current;
  const ringId = `tydifiedBorder-${(ringColors ?? ['brand']).join('').replace(/#/g, '')}`;

  // Wink loop. We drive ry through React state rather than a Reanimated
  // worklet because animating SVG props via reanimated has rough edges on
  // web; a ~100ms re-render every few seconds is negligible.
  useEffect(() => {
    if (!animated) return undefined;
    let cancelled = false;
    let openTimer: ReturnType<typeof setTimeout> | null = null;

    const wink = () => {
      if (cancelled) return;
      setRightRy(CLOSED_RY);
      openTimer = setTimeout(() => {
        if (cancelled) return;
        setRightRy(OPEN_RY);
      }, BLINK_CLOSE_MS);
    };

    const interval = setInterval(wink, BLINK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (openTimer !== null) clearTimeout(openTimer);
    };
  }, [animated]);

  // Bob loop. Sinusoidal easing in both directions so the motion has no
  // hard turn at the top/bottom — feels like a gentle breath.
  useEffect(() => {
    if (!animated) return undefined;
    const loop = Animated.loop(
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
    loop.start();
    return () => loop.stop();
  }, [animated, bobY]);

  return (
    <Animated.View
      style={[
        { width: size, height: size },
        animated && { transform: [{ translateY: bobY }] },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* ID is derived from the ring pair — SVG ids are not reliably
              scoped per <Svg>, and two faces with different rings on one
              screen (e.g. the avatar picker) must not share a gradient. */}
          <LinearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={ringColors?.[0] ?? C.pink} />
            <Stop offset="1" stopColor={ringColors?.[1] ?? C.orange} />
          </LinearGradient>
        </Defs>
        <Rect
          x={4}
          y={4}
          width={92}
          height={92}
          rx={22}
          ry={22}
          fill={faceFill}
          stroke={`url(#${ringId})`}
          strokeWidth={6}
        />
        <Ellipse cx={36} cy={42} rx={5} ry={OPEN_RY} fill={featureColor} />
        <Ellipse cx={64} cy={42} rx={5} ry={rightRy} fill={featureColor} />
        <Path
          d="M30 62 Q50 82 70 62"
          stroke={featureColor}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}
