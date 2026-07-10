// Subscription entitlement + free-tier limits.
//
// These constants are the "feature flags" the app checks ALONGSIDE the live
// subscription status (CLAUDE.md §12): gating logic consults BOTH `isPro` AND
// these limits, so the limits can be tuned here — or sourced remotely later —
// without shipping new gating code. Never hard-gate on subscription status alone.
//
// ENTITLEMENT_ID must match the RevenueCat dashboard entitlement identifier
// EXACTLY, including the space.

// ponytail: identifier stays 'Chorely Pro' — it must match the RevenueCat dashboard
// entitlement exactly; rename it there first (pre-launch) before changing this.
export const ENTITLEMENT_ID = 'Chorely Pro';

export const FREE_LIMITS = {
  /** Max children a free family can create. */
  maxChildren: 1,
  /** Max active chores assignable to a single child on the free tier. */
  maxActiveChoresPerChild: 4,
} as const;

export type PaywallReason = 'children' | 'chores' | 'generic';
