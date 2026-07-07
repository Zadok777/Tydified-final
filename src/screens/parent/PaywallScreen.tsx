import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import type { PurchasesPackage } from 'react-native-purchases';

import { Header } from '../../components/layout/Header';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { GradientCard } from '../../components/ui/GradientCard';
import { useToast } from '../../components/ui/Toast';
import { FREE_LIMITS } from '../../config/entitlements';
import {
  getCurrentOffering,
  purchase,
  purchasesAvailable,
  restorePurchases,
} from '../../lib/revenuecat';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { trialLabelForDisplay } from '../../utils/trial';
import {
  GRADIENTS,
  radii,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Palette,
} from '../../theme';
import type { RootStackParamList } from '../../types/app.types';
import { hapticLight } from '../../utils/haptics';

// DEV-ONLY preview: shows the trial badge/CTA/disclosure on the annual plan even
// when no real store trial exists yet (RevenueCat Test Store has none), so the
// trial UI can be verified in a simulator/dev build. Always false in production
// builds (`__DEV__` is false). Flip the `&& true` to disable while keeping the
// build dev. This affects display copy only — never the purchase call.
const PREVIEW_TRIAL = __DEV__ && true;

// These must be live, publicly-hosted pages before App Store / Play submission
// (see docs/RELEASE_CHECKLIST.md). Apple requires functional Terms + Privacy
// links on any paywall.
const TERMS_URL = 'https://tydified.app/terms';
const PRIVACY_URL = 'https://tydified.app/privacy';

const BENEFITS = [
  `Unlimited children (free tier stops at ${FREE_LIMITS.maxChildren})`,
  `Unlimited chores per child (free tier stops at ${FREE_LIMITS.maxActiveChoresPerChild})`,
  'Unlimited rewards & savings goals',
  'Support ongoing development',
] as const;

function periodLabel(pkg: PurchasesPackage): string {
  switch (pkg.packageType) {
    case 'ANNUAL':
      return 'Yearly';
    case 'MONTHLY':
      return 'Monthly';
    case 'WEEKLY':
      return 'Weekly';
    default:
      return pkg.product.title;
  }
}

export function PaywallScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList, 'Paywall'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Paywall'>>();
  const reason = route.params?.reason ?? 'generic';
  const toast = useToast();
  const { C } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const activeProductIdentifier = useSubscriptionStore(
    (s) => s.activeProductIdentifier
  );

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const offering = await getCurrentOffering();
      if (!active) return;
      if (offering) {
        // Annual first (best value), then monthly, then anything else.
        const ordered = [...offering.availablePackages].sort(
          (a, b) => rank(a) - rank(b)
        );
        setPackages(ordered);
        setSelectedId(ordered[0]?.identifier ?? null);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const headline =
    reason === 'children'
      ? `Free families can add ${FREE_LIMITS.maxChildren} children`
      : reason === 'chores'
        ? `Free families get ${FREE_LIMITS.maxActiveChoresPerChild} chores per child`
        : 'Unlock everything in Tydified';

  const onSubscribe = useCallback(async () => {
    const pkg = packages.find((p) => p.identifier === selectedId);
    if (!pkg || working) return;
    setWorking(true);
    const res = await purchase(pkg);
    setWorking(false);
    if (res.ok) {
      hapticLight();
      toast.show({ message: 'Welcome to Tydified Plus!', tone: 'success' });
      nav.goBack();
    } else if (!res.cancelled) {
      toast.show({
        message: res.error ?? 'Purchase failed.',
        tone: 'error',
        duration: 5000,
      });
    }
  }, [packages, selectedId, working, toast, nav]);

  const onRestore = useCallback(async () => {
    if (working) return;
    setWorking(true);
    const res = await restorePurchases();
    setWorking(false);
    if (res.ok) {
      toast.show({ message: 'Purchases restored.', tone: 'success' });
      nav.goBack();
    } else {
      toast.show({
        message: res.error ?? 'No active subscription found.',
        tone: 'error',
      });
    }
  }, [working, toast, nav]);

  const selectedPkg = packages.find((p) => p.identifier === selectedId) ?? null;
  const selectedIsCurrent =
    selectedPkg !== null &&
    activeProductIdentifier !== null &&
    selectedPkg.product.identifier === activeProductIdentifier;
  // A store-configured free trial only applies to a new subscriber, so suppress
  // the trial copy once the user is already on Plus.
  const selectedTrial =
    !isPro && selectedPkg
      ? trialLabelForDisplay(selectedPkg, PREVIEW_TRIAL)
      : null;

  return (
    <ScreenContainer scroll edges={['top', 'bottom']}>
      <Header title="Tydified Plus" onBack={() => nav.goBack()} />

      <GradientCard colors={GRADIENTS.brand} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="star" size={26} color={C.textWhite} />
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.3}>
          {headline}
        </Text>
        <Text style={styles.heroSub} maxFontSizeMultiplier={1.4}>
          Tydified Plus removes the limits and unlocks premium features.
        </Text>
      </GradientCard>

      <View style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={C.green} />
            <Text style={styles.benefitText} maxFontSizeMultiplier={1.4}>
              {b}
            </Text>
          </View>
        ))}
      </View>

      {isPro ? (
        <View style={styles.activeCard}>
          <Ionicons name="checkmark-circle" size={22} color={C.green} />
          <Text style={styles.activeText} maxFontSizeMultiplier={1.3}>
            {`You're on Tydified Plus. You can switch plans below, or manage/cancel anytime in your ${platformStore()} subscription settings.`}
          </Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={C.pink} />
        </View>
      ) : packages.length === 0 ? (
        <View style={styles.unavailable}>
          <Text style={styles.unavailableText} maxFontSizeMultiplier={1.4}>
            {purchasesAvailable()
              ? 'Plans are not available right now. Please try again later.'
              : 'Subscriptions are available in the published app (not in Expo Go).'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.plans}>
            {packages.map((pkg) => {
              const selected = pkg.identifier === selectedId;
              const isAnnual = pkg.packageType === 'ANNUAL';
              const trial = isPro ? null : trialLabelForDisplay(pkg, PREVIEW_TRIAL);
              return (
                <Pressable
                  key={pkg.identifier}
                  onPress={() => {
                    setSelectedId(pkg.identifier);
                    hapticLight();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.plan, selected && styles.planSelected]}
                >
                  <View style={styles.planLeft}>
                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={C.textWhite}
                        />
                      ) : null}
                    </View>
                    <View>
                      <Text style={styles.planPeriod} maxFontSizeMultiplier={1.3}>
                        {periodLabel(pkg)}
                      </Text>
                      {isAnnual ? (
                        <Text style={styles.planBadge}>Best value</Text>
                      ) : null}
                      {trial ? (
                        <Text style={styles.planTrial}>{trial}</Text>
                      ) : null}
                      {pkg.product.identifier === activeProductIdentifier ? (
                        <Text style={styles.planCurrent}>Current plan</Text>
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.planPrice} maxFontSizeMultiplier={1.3}>
                    {pkg.product.priceString}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label={
              selectedIsCurrent
                ? 'Current plan'
                : selectedPkg
                  ? isPro
                    ? `Change plan — ${selectedPkg.product.priceString}`
                    : selectedTrial
                      ? `Start ${selectedTrial}`
                      : `Subscribe — ${selectedPkg.product.priceString}`
                  : isPro
                    ? 'Change plan'
                    : 'Subscribe'
            }
            onPress={onSubscribe}
            loading={working}
            disabled={!selectedPkg || selectedIsCurrent}
            fullWidth
            size="lg"
          />
          <Button
            label="Restore purchases"
            variant="ghost"
            onPress={onRestore}
            fullWidth
          />

          <Text style={styles.disclosure} maxFontSizeMultiplier={1.4}>
            {selectedTrial && selectedPkg
              ? `Free for the first ${selectedTrial.replace(' free trial', '')}, then ${selectedPkg.product.priceString} per ${periodLabel(selectedPkg).toLowerCase().replace('ly', '')} period unless cancelled during the trial. `
              : selectedPkg
                ? `${selectedPkg.product.priceString} per ${periodLabel(selectedPkg).toLowerCase().replace('ly', '')} period. `
                : ''}
            Payment is charged to your {platformStore()} account
            {selectedTrial ? ' at the end of the free trial' : ' at confirmation'}.
            Subscriptions renew automatically unless cancelled at least 24 hours
            before the end of the period. Manage or cancel in your account
            settings. Plan changes are handled by {platformStore()}.
          </Text>

          <View style={styles.legalRow}>
            <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
              <Text style={styles.legalLink}>Terms</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}>
              <Text style={styles.legalLink}>Privacy</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

// Order packages: annual, monthly, then the rest.
function rank(pkg: PurchasesPackage): number {
  if (pkg.packageType === 'ANNUAL') return 0;
  if (pkg.packageType === 'MONTHLY') return 1;
  return 2;
}

function platformStore(): string {
  return Platform.OS === 'ios' ? 'App Store' : 'Google Play';
}

const makeStyles = (C: Palette) =>
  StyleSheet.create({
    hero: {
      marginTop: spacing.s8,
      marginBottom: spacing.s20,
    },
    heroIcon: {
      width: 48,
      height: 48,
      borderRadius: radii.rFull,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.s12,
    },
    heroTitle: {
      ...typography.title,
      color: C.textWhite,
      marginBottom: spacing.s4,
    },
    heroSub: {
      ...typography.body,
      color: 'rgba(255,255,255,0.92)',
    },
    benefits: {
      gap: spacing.s12,
      marginBottom: spacing.s24,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
    },
    benefitText: {
      ...typography.body,
      color: C.textDark,
      flex: 1,
    },
    loading: {
      paddingVertical: spacing.s32,
      alignItems: 'center',
    },
    unavailable: {
      padding: spacing.s20,
      borderRadius: radii.r16,
      backgroundColor: C.glassLight,
      borderWidth: 1,
      borderColor: C.border,
    },
    unavailableText: {
      ...typography.body,
      color: C.textMid,
      textAlign: 'center',
    },
    activeCard: {
      flexDirection: 'row',
      gap: spacing.s12,
      alignItems: 'center',
      padding: spacing.s16,
      borderRadius: radii.r16,
      backgroundColor: C.glassLight,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: spacing.s20,
    },
    activeText: {
      ...typography.body,
      color: C.textDark,
      flex: 1,
    },
    plans: {
      gap: spacing.s12,
      marginBottom: spacing.s20,
    },
    plan: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.s16,
      borderRadius: radii.r16,
      borderWidth: 1.5,
      borderColor: C.border,
      backgroundColor: C.glassLight,
    },
    planSelected: {
      borderColor: C.pink,
      backgroundColor: C.pinkAlpha10,
    },
    planLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s12,
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: radii.rFull,
      borderWidth: 2,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: C.pink,
      backgroundColor: C.pink,
    },
    planPeriod: {
      ...typography.button,
      color: C.textDark,
    },
    planBadge: {
      ...typography.caption,
      color: C.pink,
      marginTop: 2,
    },
    planCurrent: {
      ...typography.caption,
      color: C.greenText,
      marginTop: 2,
    },
    planTrial: {
      ...typography.caption,
      color: C.greenText,
      marginTop: 2,
    },
    planPrice: {
      ...typography.title,
      fontSize: 18,
      color: C.textDark,
    },
    disclosure: {
      ...typography.caption,
      color: C.textMid,
      marginTop: spacing.s16,
      lineHeight: 18,
    },
    legalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.s8,
      marginTop: spacing.s12,
    },
    legalLink: {
      ...typography.caption,
      color: C.pink,
    },
    legalDot: {
      ...typography.caption,
      color: C.textMid,
    },
  });
