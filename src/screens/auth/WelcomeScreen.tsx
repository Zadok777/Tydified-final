import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '../../components/ui/Button';
import { AuthScaffold } from './AuthScaffold';
import {
  radii,
  spacing,
  typography,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { RootStackParamList } from '../../types/app.types';

type Nav = StackNavigationProp<RootStackParamList, 'Welcome'>;

// Tagline pill — mirrors the navy pill in the logo lockup, with each phrase
// in its lockup color (white / green / gold / cyan). Mode-invariant brand
// literals, like GRADIENTS in tokens.ts.
const PILL_NAVY = '#00001B';
const TAG_GREEN = '#60DB01';
const TAG_GOLD = '#FDCB01';
const TAG_CYAN = '#02F4FA';

export function WelcomeScreen() {
  const nav = useNavigation<Nav>();
  const styles = useThemedStyles(makeStyles);

  return (
    <AuthScaffold
      title="Tydified"
      subtitle="Set chores, approve completions, and let your kids earn rewards they choose."
      footer={
        <View style={styles.taglinePill}>
          <Text style={styles.taglineText} maxFontSizeMultiplier={1.3}>
            <Text style={styles.tagWhite}>Do chores. </Text>
            <Text style={styles.tagGreen}>Earn points. </Text>
            <Text style={styles.tagGold}>Unlock rewards. </Text>
            <Text style={styles.tagCyan}>Level up!</Text>
          </Text>
        </View>
      }
    >
      <View style={styles.cta}>
        <Button
          label="Create an account"
          onPress={() => nav.navigate('SignUp')}
          fullWidth
        />
        <Button
          label="I already have an account"
          onPress={() => nav.navigate('Login')}
          variant="secondary"
          fullWidth
        />
      </View>
    </AuthScaffold>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    taglinePill: {
      backgroundColor: PILL_NAVY,
      borderRadius: radii.rFull,
      paddingHorizontal: spacing.s20,
      paddingVertical: spacing.s12,
      // Hairline so the navy pill keeps its edge on the dark-mode navy ground.
      borderWidth: 1,
      borderColor: C.border,
      maxWidth: 340,
    },
    taglineText: {
      ...typography.caption,
      fontFamily: 'Nunito_800ExtraBold',
      fontSize: 14,
      letterSpacing: 0.2,
      textAlign: 'center',
    },
    tagWhite: { color: '#FFFFFF' },
    tagGreen: { color: TAG_GREEN },
    tagGold: { color: TAG_GOLD },
    tagCyan: { color: TAG_CYAN },
    cta: {
      gap: spacing.s12,
    },
  });
