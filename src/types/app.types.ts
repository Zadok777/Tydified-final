// App-level domain types and typed navigation params.
// Row aliases re-export from the generated database.types so the rest of
// the codebase can `import { Profile, Family, Child, ... } from '../types/app.types'`
// without binding to the Supabase generator's `Tables<'name'>` helper.

import type { NavigatorScreenParams } from '@react-navigation/native';

import type { PaywallReason } from '../config/entitlements';
import type { Tables } from './database.types';

export type Profile = Tables<'profiles'>;
export type Family = Tables<'families'>;
export type FamilyMember = Tables<'family_members'>;
export type Child = Tables<'children'>;
export type Chore = Tables<'chores'>;
export type ChoreAssignment = Tables<'chore_assignments'>;
export type Reward = Tables<'rewards'>;
export type RewardRedemption = Tables<'reward_redemptions'>;
export type PointTransaction = Tables<'point_transactions'>;
export type ActivityLog = Tables<'activity_log'>;
export type UserSettings = Tables<'user_settings'>;
export type Goal = Tables<'goals'>;

// Goal kind string literals matching the DB CHECK constraint.
export type GoalKind = 'reward' | 'points';

// Re-export the age-bracket type from the theme module so consumers don't have
// to know it lives in tokens.ts. The theme module owns the type because the
// bracket-themes map is keyed by it; the domain happens to share the name.
export type { AgeBracket } from '../theme/tokens';

// Chore assignment status string literals matching the DB CHECK constraint.
export type ChoreStatus = 'assigned' | 'submitted' | 'approved' | 'rejected';

// Chore category string literals matching the DB CHECK constraint.
export type ChoreCategory =
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'outdoor'
  | 'pets'
  | 'laundry'
  | 'homework'
  | 'other';

// Chore frequency string literals matching the DB CHECK constraint.
export type ChoreFrequency = 'once' | 'daily' | 'weekly';

// Typed navigation routes. Never use string literals at navigation call sites.
//
// The root navigator renders one of three mutually exclusive sets, gated at
// runtime in RootNavigator:
//   1. session === null            → auth screens (Welcome / Login / SignUp)
//   2. session && no family yet     → Onboarding
//   3. session && family present    → Main (the bottom-tab shell)
// React Navigation 7 doesn't model that split in the type system, so the auth
// routes and the post-auth routes share one param list at compile time.

export type RootStackParamList = {
  // Auth stack — rendered when session is null
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };

  // Rendered when signed in but the user belongs to no family yet.
  Onboarding: undefined;

  // The signed-in, onboarded shell. Hosts the bottom-tab navigator.
  Main: NavigatorScreenParams<MainTabParamList> | undefined;

  // Reward catalog — pushed from the More tab (not a top-level tab, matching
  // the prototype where rewards live under More).
  Rewards: undefined;
  // Help center — pushed from the More tab.
  Help: undefined;
  // Tydified Plus paywall — pushed from More or when a free-tier limit is hit.
  Paywall: { reason?: PaywallReason } | undefined;
};

// Bottom-tab routes inside the Main shell (parent navigation), matching the
// Lumina Bloom prototype: Home / Review / Chores / Family / More.
export type MainTabParamList = {
  Home: undefined;
  Review: undefined;
  Chores: undefined;
  Family: undefined;
  More: undefined;
};
