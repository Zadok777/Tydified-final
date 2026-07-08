import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { Header } from '../../components/layout/Header';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { GlassCard } from '../../components/ui/GlassCard';
import { useToast } from '../../components/ui/Toast';
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

// Swap for a dedicated support@tydified.app inbox before launch.
const SUPPORT_EMAIL = 'doulosnexus@gmail.com';

type Nav = StackNavigationProp<RootStackParamList, 'Help'>;

interface QA {
  q: string;
  a: string;
}

const SECTIONS: readonly { title: string; items: readonly QA[] }[] = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'How do I add a child?',
        a: 'Open Family from the tab bar and tap the + button. Enter the child’s name and optional birthday. Children are profiles you manage — they don’t sign in.',
      },
      {
        q: 'How do chores and points work?',
        a: 'Create a chore from Chores or a Home quick action, set its point value, and assign it to a child. When it’s done you approve it, and the points are added to that child’s balance.',
      },
      {
        q: 'How do rewards work?',
        a: 'Create rewards in the Reward catalog with a point cost. When a child has enough points, redeem the reward on their behalf and their balance goes down.',
      },
      {
        q: 'What are streaks and goals?',
        a: 'Streaks count consecutive days a child completes chores. Goals let a child save toward a specific reward or point target, with a celebration when they reach it.',
      },
    ],
  },
  {
    title: 'Your account',
    items: [
      {
        q: 'How do I change my name or avatar?',
        a: 'Tap your avatar at the top of More to edit your profile, or use the Family name row to rename your family.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to More and tap Delete account. This permanently removes your family, children, chores, rewards, and history. It cannot be undone.',
      },
    ],
  },
  {
    title: 'Subscription & billing',
    items: [
      {
        q: 'What does Tydified Plus include?',
        a: 'Plus unlocks unlimited children and chores plus premium features. It’s available monthly or yearly — the yearly plan is the same features at a lower price.',
      },
      {
        q: 'How do I manage or cancel?',
        a: 'Subscriptions are billed through your Apple or Google account. Manage or cancel anytime in your device’s App Store or Play Store account settings.',
      },
      {
        q: 'How do I restore a purchase?',
        a: 'Use Restore Purchases on the subscription screen after signing in with the same Apple or Google account you bought it with.',
      },
    ],
  },
  {
    title: 'Privacy & safety',
    items: [
      {
        q: 'How is my family’s data handled?',
        a: 'Your data is stored securely and used only to run the app. Children’s profiles store just a name and optional birthday — never an email, phone, or location.',
      },
      {
        q: 'Is Tydified safe for kids?',
        a: 'Tydified is parent-managed: children don’t sign in or enter personal information, in line with children’s privacy rules (COPPA).',
      },
    ],
  },
];

export function HelpCenterScreen() {
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const emailSupport = () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      'Tydified support'
    )}`;
    Linking.openURL(url).catch(() =>
      toast.show({ message: `Email us at ${SUPPORT_EMAIL}`, tone: 'info' })
    );
  };

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <Header title="Help center" onBack={() => nav.goBack()} />

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <GlassCard padding={0}>
            {section.items.map((item, i) => (
              <View key={item.q}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.qa}>
                  <Text style={styles.q}>{item.q}</Text>
                  <Text style={styles.a}>{item.a}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <GlassCard padding={0}>
          <Pressable
            onPress={emailSupport}
            accessibilityRole="button"
            accessibilityLabel="Email support"
            style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="mail-outline" size={20} color={C.pink} />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Email support</Text>
              <Text style={styles.contactSub}>{SUPPORT_EMAIL}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textLight} />
          </Pressable>
        </GlassCard>
      </View>

      <Text style={styles.version}>Tydified v{version}</Text>
    </ScreenContainer>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: spacing.s16,
      paddingBottom: TAB_BAR_CLEARANCE,
    },
    section: {
      marginTop: spacing.s24,
    },
    sectionTitle: {
      ...typography.label,
      color: C.textMid,
      marginBottom: spacing.s8,
      marginLeft: spacing.s4,
    },
    qa: {
      padding: spacing.s20,
    },
    q: {
      ...typography.title,
      fontSize: 15,
      color: C.textDark,
    },
    a: {
      ...typography.body,
      color: C.textMid,
      marginTop: spacing.s4,
      lineHeight: 20,
    },
    divider: {
      height: 1,
      backgroundColor: C.border,
      marginHorizontal: spacing.s16,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
      padding: spacing.s16,
    },
    contactIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.rFull,
      backgroundColor: C.pinkAlpha15,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.borderPink,
    },
    contactText: {
      flex: 1,
    },
    contactLabel: {
      ...typography.button,
      color: C.textDark,
    },
    contactSub: {
      ...typography.caption,
      color: C.textMid,
      marginTop: 2,
    },
    pressed: {
      opacity: 0.7,
    },
    version: {
      ...typography.caption,
      color: C.textLight,
      textAlign: 'center',
      marginTop: spacing.s24,
    },
  });
