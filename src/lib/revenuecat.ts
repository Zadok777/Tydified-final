import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import { ENTITLEMENT_ID } from '../config/entitlements';
import { useSubscriptionStore } from '../store/subscriptionStore';

// Public SDK keys are safe to ship in the client. We default to RevenueCat's
// Test Store key so the integration works before the real App Store / Play
// Store apps exist. Once those are created in RevenueCat, drop the real
// `appl_…` / `goog_…` keys into .env (EXPO_PUBLIC_-prefixed so Expo exposes
// them to the bundle) and they automatically override the test key — no code
// change needed.
const TEST_STORE_KEY = 'test_eJhCgXXDTmxbYWntEkIWaoRhxYx';

const iosApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? TEST_STORE_KEY;
const androidApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? TEST_STORE_KEY;

let configured = false;

/** True once the SDK is configured (native build). False in Expo Go / web. */
export function purchasesAvailable(): boolean {
  return configured;
}

// Push the entitlement state into the subscription store (also marks it ready).
function syncEntitlement(info: CustomerInfo): void {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID];
  useSubscriptionStore
    .getState()
    .setPro(entitlement !== undefined, entitlement?.productIdentifier ?? null);
}

/**
 * Configure RevenueCat once at app launch. No-ops on web and inside Expo Go
 * (the native module isn't present in either), so it never breaks the dev
 * flow. Identity is handled separately via identifyPurchaser/logoutPurchaser.
 */
export function initPurchases(): void {
  if (Platform.OS === 'web' || configured) {
    // No native SDK here — mark ready (not Pro) so gating uses the free tier.
    useSubscriptionStore.getState().setReady();
    return;
  }
  const apiKey = Platform.OS === 'ios' ? iosApiKey : androidApiKey;
  // The SDK force-closes release builds configured with a Test Store key
  // ("Wrong API Key" alert). Until real appl_/goog_ keys are provided via
  // env, run release builds with purchases disabled instead of crashing.
  if (!__DEV__ && apiKey.startsWith('test_')) {
    useSubscriptionStore.getState().setReady();
    return;
  }
  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey });
    configured = true;
    Purchases.addCustomerInfoUpdateListener(syncEntitlement);
    void refreshCustomerInfo();
  } catch (err) {
    // Expo Go / unsupported runtime — purchases just stay disabled.
    if (__DEV__) console.warn('[revenuecat] SDK unavailable, skipping:', err);
    useSubscriptionStore.getState().setReady();
  }
}

/** Re-read the purchaser's entitlements from RevenueCat. */
export async function refreshCustomerInfo(): Promise<void> {
  if (Platform.OS === 'web' || !configured) {
    useSubscriptionStore.getState().setReady();
    return;
  }
  try {
    const info = await Purchases.getCustomerInfo();
    syncEntitlement(info);
  } catch (err) {
    if (__DEV__) console.warn('[revenuecat] getCustomerInfo failed:', err);
    useSubscriptionStore.getState().setReady();
  }
}

/** Link RevenueCat to a specific signed-in parent (call on sign-in). */
export async function identifyPurchaser(userId: string): Promise<void> {
  if (Platform.OS === 'web' || !configured) return;
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    syncEntitlement(customerInfo);
  } catch (err) {
    if (__DEV__) console.warn('[revenuecat] logIn failed:', err);
  }
}

/** Reset RevenueCat to an anonymous user (call on sign-out). */
export async function logoutPurchaser(): Promise<void> {
  if (Platform.OS === 'web' || !configured) return;
  try {
    const info = await Purchases.logOut();
    syncEntitlement(info);
  } catch (err) {
    if (__DEV__) console.warn('[revenuecat] logOut failed:', err);
  }
}

/** The current offering (its packages back the paywall). Null if unavailable. */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (Platform.OS === 'web' || !configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (err) {
    if (__DEV__) console.warn('[revenuecat] getOfferings failed:', err);
    return null;
  }
}

export interface PurchaseResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}

/** Purchase a package. Returns ok=true only if the entitlement is now active. */
export async function purchase(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (Platform.OS === 'web' || !configured) {
    return { ok: false, error: 'Purchases are unavailable in this build.' };
  }
  try {
    const activeProductIdentifier =
      useSubscriptionStore.getState().activeProductIdentifier;
    const productChangeInfo =
      Platform.OS === 'android' &&
      activeProductIdentifier !== null &&
      activeProductIdentifier !== pkg.product.identifier
        ? {
            oldProductIdentifier: activeProductIdentifier,
            replacementMode: Purchases.STORE_REPLACEMENT_MODE.WITHOUT_PRORATION,
          }
        : null;
    const { customerInfo } = await Purchases.purchasePackage(
      pkg,
      null,
      productChangeInfo
    );
    syncEntitlement(customerInfo);
    return { ok: customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, error: err.message ?? 'Purchase failed.' };
  }
}

/** Restore prior purchases (App Store / Play account). */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (Platform.OS === 'web' || !configured) {
    return { ok: false, error: 'Purchases are unavailable in this build.' };
  }
  try {
    const info = await Purchases.restorePurchases();
    syncEntitlement(info);
    return { ok: info.entitlements.active[ENTITLEMENT_ID] !== undefined };
  } catch (e: unknown) {
    const err = e as { message?: string };
    return { ok: false, error: err.message ?? 'Restore failed.' };
  }
}
