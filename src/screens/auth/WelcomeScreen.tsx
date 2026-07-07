import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { TydifiedLogo } from '../../components/brand/TydifiedLogo';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';
import {
  spacing,
  typography,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { RootStackParamList } from '../../types/app.types';

type Nav = StackNavigationProp<RootStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const nav = useNavigation<Nav>();
  const styles = useThemedStyles(makeStyles);

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <TydifiedLogo variant="full" iconSize={104} animated />
        </View>

        <View style={styles.copy}>
          <Text style={styles.tagline} maxFontSizeMultiplier={1.5}>
            Do chores. Earn points. Unlock rewards. Level up!
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
            Set chores, approve completions, and let your kids earn rewards
            they choose.
          </Text>
        </View>

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
      </View>
    </ScreenContainer>
  );
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.s32,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    paddingHorizontal: spacing.s12,
    gap: spacing.s12,
  },
  tagline: {
    ...typography.headline,
    fontSize: 26,
    color: C.textDark,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: C.textMid,
    textAlign: 'center',
    maxWidth: 360,
  },
  cta: {
    gap: spacing.s12,
    paddingTop: spacing.s24,
  },
});
