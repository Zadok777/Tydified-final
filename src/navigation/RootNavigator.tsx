import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { OnboardingWizard } from '../screens/auth/OnboardingWizard';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { RewardsScreen } from '../screens/parent/RewardsScreen';
import { HelpCenterScreen } from '../screens/parent/HelpCenterScreen';
import { HowToScreen } from '../screens/parent/HowToScreen';
import { PaywallScreen } from '../screens/parent/PaywallScreen';
import { MainNavigator } from './MainNavigator';
import { useAuthStore } from '../store/authStore';
import { useFamilyStore } from '../store/familyStore';
import type { RootStackParamList } from '../types/app.types';

const Stack = createStackNavigator<RootStackParamList>();

// Three mutually exclusive screen sets, chosen at runtime:
//
//   1. session === null            → Welcome / Login / SignUp
//   2. session && family === null   → Onboarding (create the first family)
//   3. session && family !== null   → Main (bottom-tab shell)
//
// The session/family transitions drive the swap automatically — no imperative
// nav.navigate calls from sign-in, sign-out, or onboarding-complete paths.
//
// App.tsx blocks the navigator mount on useAuthBootstrap + useFamilyBootstrap,
// so by the time we render here both stores reflect the persisted state and a
// returning user lands straight on Main with no intermediate flash.

export function RootNavigator() {
  const session = useAuthStore((s) => s.session);
  const family = useFamilyStore((s) => s.family);
  const signedIn = session !== null;
  const onboarded = family !== null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!signedIn ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      ) : !onboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingWizard} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="Rewards" component={RewardsScreen} />
          <Stack.Screen name="Help" component={HelpCenterScreen} />
          <Stack.Screen name="HowTo" component={HowToScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
