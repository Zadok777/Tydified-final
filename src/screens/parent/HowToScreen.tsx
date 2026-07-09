import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '../../components/layout/Header';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { GlassCard } from '../../components/ui/GlassCard';
import {
  CartoonIcon,
  type CartoonIconName,
} from '../../components/ui/CartoonIcon';
import {
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { RootStackParamList } from '../../types/app.types';
import { TAB_BAR_CLEARANCE } from './layout';

type Nav = StackNavigationProp<RootStackParamList, 'HowTo'>;

interface Step {
  icon: CartoonIconName;
  title: string;
  body: string;
}

const STEPS: readonly Step[] = [
  {
    icon: 'puppy',
    title: 'Add your kids',
    body: 'Open Family and tap + to add each child — just a name and optional birthday. Kids don’t sign in; you run everything from your account.',
  },
  {
    icon: 'plate',
    title: 'Create chores',
    body: 'From Chores or a Home quick action, give a chore a name, points, and who it belongs to. Tydified suggests age-appropriate chores for each kid.',
  },
  {
    icon: 'star',
    title: 'Approve & award points',
    body: 'When a chore is done, tap it to mark it complete, then approve it in Review. Points land in your kid’s balance automatically.',
  },
  {
    icon: 'gift',
    title: 'Set up rewards',
    body: 'Build a reward catalog — screen time, a treat, a day out — each with a point cost. Redeem a reward and the points are deducted.',
  },
  {
    icon: 'flame',
    title: 'Keep the streak going',
    body: 'Kids build streaks by completing chores on consecutive days, and goals let them save up for something big — with a celebration when they get there.',
  },
];

export function HowToScreen() {
  const nav = useNavigation<Nav>();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <Header title="How Tydified works" onBack={() => nav.goBack()} />

      <Text style={styles.intro} maxFontSizeMultiplier={1.3}>
        Five minutes to a working chore routine:
      </Text>

      {STEPS.map((step, i) => (
        <GlassCard key={step.title} style={styles.stepCard}>
          <View style={styles.stepRow}>
            <View style={styles.stepArt}>
              <CartoonIcon name={step.icon} size={44} />
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText} maxFontSizeMultiplier={1.1}>
                  {i + 1}
                </Text>
              </View>
            </View>
            <View style={styles.stepMeta}>
              <Text style={styles.stepTitle} maxFontSizeMultiplier={1.3}>
                {step.title}
              </Text>
              <Text style={styles.stepBody} maxFontSizeMultiplier={1.3}>
                {step.body}
              </Text>
            </View>
          </View>
        </GlassCard>
      ))}

      <Pressable
        onPress={() => nav.navigate('Help')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.helpLink, pressed && styles.helpLinkPressed]}
      >
        <Ionicons name="help-circle-outline" size={18} color={C.pinkText} />
        <Text style={styles.helpLinkText} maxFontSizeMultiplier={1.3}>
          Questions? Visit the Help center
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    content: {
      paddingBottom: TAB_BAR_CLEARANCE,
      gap: spacing.s16,
    },
    intro: {
      ...typography.body,
      color: C.textMid,
      marginBottom: spacing.s4,
    },
    stepCard: {
      padding: spacing.s16,
    },
    stepRow: {
      flexDirection: 'row',
      gap: spacing.s16,
      alignItems: 'flex-start',
    },
    stepArt: {
      width: 52,
      alignItems: 'center',
    },
    stepBadge: {
      position: 'absolute',
      top: -6,
      right: -2,
      minWidth: 20,
      height: 20,
      borderRadius: radii.rFull,
      backgroundColor: C.pink,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    stepBadgeText: {
      ...typography.label,
      color: C.textWhite,
      fontSize: 11,
    },
    stepMeta: {
      flex: 1,
      gap: 4,
    },
    stepTitle: {
      ...typography.title,
      color: C.textDark,
    },
    stepBody: {
      ...typography.body,
      color: C.textMid,
      lineHeight: 20,
    },
    helpLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: spacing.s16,
    },
    helpLinkPressed: {
      opacity: 0.6,
    },
    helpLinkText: {
      ...typography.body,
      color: C.pinkText,
      fontWeight: '600',
    },
  });
