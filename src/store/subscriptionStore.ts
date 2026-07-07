import { create } from 'zustand';

// Holds the live "is this parent a Tydified Plus subscriber?" flag, kept in sync
// by src/lib/revenuecat.ts (initial fetch on launch + a customer-info listener +
// after each purchase/restore). `isReady` flips true once we've heard from
// RevenueCat at least once (or determined it's unavailable, e.g. Expo Go/web),
// so UI can avoid flashing the wrong gate. Default is the safe one: not Pro.

interface SubscriptionState {
  isPro: boolean;
  isReady: boolean;
  activeProductIdentifier: string | null;
  setPro(isPro: boolean, activeProductIdentifier?: string | null): void;
  setReady(): void;
  reset(): void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPro: false,
  isReady: false,
  activeProductIdentifier: null,
  setPro: (isPro, activeProductIdentifier = null) =>
    set({ isPro, activeProductIdentifier, isReady: true }),
  setReady: () => set({ isReady: true }),
  reset: () =>
    set({ isPro: false, activeProductIdentifier: null, isReady: false }),
}));
