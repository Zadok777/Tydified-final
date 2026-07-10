import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { ThemeProvider, C, lightC } from './src/theme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastProvider } from './src/components/ui/Toast';
import { useAuthBootstrap } from './src/hooks/useAuthBootstrap';
import { useFamilyBootstrap } from './src/hooks/useFamilyBootstrap';
import { useSettingsBootstrap } from './src/hooks/useSettingsBootstrap';
import { useAuthStore } from './src/store/authStore';
import {
  initPurchases,
  identifyPurchaser,
  logoutPurchaser,
} from './src/lib/revenuecat';

// Cap font scaling for accessibility without breaking layout.
if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.maxFontSizeMultiplier = 1.5;
if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.maxFontSizeMultiplier = 1.5;

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const { ready: authReady } = useAuthBootstrap();
  const { ready: familyReady } = useFamilyBootstrap();
  useSettingsBootstrap();
  const fontsReady =
    Platform.OS === 'web' ? true : fontsLoaded || !!fontError;
  // Wait for fonts AND the persisted session restore AND the family-context
  // load before mounting the navigator. Otherwise a signed-in user would flash
  // the Welcome screen (session restore) or the Onboarding screen (family load)
  // for ~100ms before landing on their real dashboard.
  const ready = fontsReady && authReady && familyReady;

  useEffect(() => {
    if (!ready || Platform.OS === 'web') return;
    SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Configure RevenueCat once the app is ready (no-ops in Expo Go / web).
  useEffect(() => {
    if (!ready) return;
    initPurchases();
  }, [ready]);

  // Keep RevenueCat's identity in sync with the signed-in parent so paid
  // entitlements follow the account across devices.
  const userId = useAuthStore((s) => s.session?.user?.id);
  useEffect(() => {
    if (!ready) return;
    if (userId) identifyPurchaser(userId);
    else logoutPurchaser();
  }, [ready, userId]);

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: lightC.bg }]}>
        <ActivityIndicator size="large" color={C.pink} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <StatusBar style="dark" />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    ...(Platform.OS === 'web' ? { minHeight: '100vh' as unknown as number } : {}),
  },
  loading: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
