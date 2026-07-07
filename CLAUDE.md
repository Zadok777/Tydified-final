# CLAUDE.md — Chorely

This file is read by Claude Code at the start of every session. It is the single source of truth for project rules, schema, and code standards. **Design tokens and screen specs live in `DESIGN.md`, not here.** On project rules, this file wins. On visual decisions, DESIGN.md wins.

---

## Session Protocol

At the start of every new conversation:

1. Read this file (CLAUDE.md) completely.
2. Read PLANNING.md and DESIGN.md.
3. Open TASKS.md and review which tasks are complete and which are pending.
4. Ask the user what they want to work on before writing any code.

During every session:

- Mark tasks complete in TASKS.md as soon as they are finished.
- Add newly discovered tasks to TASKS.md immediately when they surface.
- Commit working code at the end of every feature or phase. Never leave the project in a broken state between sessions.
- Ask before making changes that affect the database schema, navigation structure, or authentication logic.

---

## 1. What Chorely Is

Chorely is a family chore and reward management mobile app. Parents create a family, add children, assign chores, approve completions, and define rewards. Children earn points for completing assigned chores, then redeem those points for parent-defined rewards.

The app targets three age brackets with distinct visual experiences:

- Elementary: ages 5 to 10, playful and high-contrast UI
- Middle School: ages 11 to 14, structured and energetic UI
- High School: ages 15 to 18, clean and mature UI

The content of the app is entirely secular. There are no religious references, faith-based content, or ministry-related elements anywhere in the codebase or UI copy.

---

## 2. Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | React Native via Expo Managed Workflow | **Expo SDK 54 / RN 0.81 / React 19 / Reanimated 4** — do not change SDK versions independently; run `npx expo install --fix` if a bump is needed, then verify the full app boots in Expo Go before committing |
| Language | TypeScript (strict) | No `.js` or `.jsx` files anywhere in the project |
| Backend | Supabase | PostgreSQL, Auth, Storage, Realtime |
| State | Zustand with persist middleware | AsyncStorage as the persistence adapter |
| Navigation | React Navigation 7 | Stack Navigator + Bottom Tab Navigator |
| Forms | React Hook Form + Yup | All form validation goes through Yup schemas |
| Payments | RevenueCat | iOS StoreKit 2 + Google Play Billing — not Stripe |
| Fonts | Nunito (headlines), DM Sans (body) | Via `@expo-google-fonts/nunito` + `@expo-google-fonts/dm-sans` |
| Icons | `@expo/vector-icons` (Ionicons) | Not Lucide (see DESIGN.md §10 anti-patterns) |
| Image Storage | Supabase Storage | Used for reward images only in v1.0 |

**On payments:** Stripe cannot be used for in-app subscriptions on iOS or Android. Apple and Google both require native in-app purchase systems. RevenueCat wraps StoreKit 2 and Google Play Billing. It is the correct and only approved tool for subscriptions in this project.

**On Expo:** Stay in Managed Workflow. Do not run `expo eject` under any circumstances without an explicit decision recorded in §13.

---

## 3. Environment Variables

Required, never committed. Verify `.gitignore` includes `.env` before the first commit.

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
REVENUECAT_IOS_API_KEY=
REVENUECAT_ANDROID_API_KEY=
```

---

## 4. Project Directory Structure

On-disk folder is `/Users/santiagos4god/Projects/Chorely 2/` (note the space; package name in `package.json` stays `chorely`). Moved out of the iCloud-synced Desktop on 2026-07-02 — iCloud materialization made Metro/tsc/git unusably slow. A symlink at `~/Desktop/Chorely 2` points here.

```
Chorely 2/
├── src/
│   ├── screens/
│   │   ├── auth/                # WelcomeScreen, LoginScreen, SignUpScreen, OnboardingWizard
│   │   └── parent/              # ParentDashboard, ChoresScreen, RewardsScreen, FamilyScreen, SettingsScreen, PaywallScreen
│   ├── components/
│   │   ├── brand/               # ChorelyLogo, ChorelyIcon
│   │   ├── ui/                  # GlassCard, Button, Input, Badge, Avatar, ProgressBar, ProgressRing, PointsBadge, ChoreRow, RewardCard, EmptyState, SkeletonLoader, Toast
│   │   ├── layout/              # ScreenContainer, Header, TabBar
│   │   └── modals/              # CreateChoreModal, CreateRewardModal, AddChildModal, ChoreApprovalModal, RedeemRewardModal, CelebrationOverlay
│   ├── navigation/
│   │   ├── RootNavigator.tsx    # Auth ↔ Main switch
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx    # Bottom tabs
│   ├── store/                   # Zustand stores (authStore, familyStore, choreStore, rewardStore, activityStore, settingsStore)
│   ├── services/                # Supabase queries + RPCs (auth, families, children, chores, rewards, activity, settings)
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client init
│   │   └── revenuecat.ts        # RevenueCat init (Phase 9)
│   ├── theme/
│   │   ├── tokens.ts            # Single source of truth — C, AVATAR_GRADIENTS, shadows, radii, spacing, typography, bracketThemes
│   │   ├── ThemeProvider.tsx    # Light/dark switch + context
│   │   └── index.ts             # Re-exports (so App.tsx can `import { ThemeProvider, C } from './src/theme'`)
│   ├── types/
│   │   ├── database.types.ts    # Auto-generated from Supabase CLI
│   │   └── app.types.ts         # App-specific interfaces + typed NavigationParams
│   ├── utils/                   # getAgeBracket, formatPoints, dateHelpers, haptics
│   └── hooks/                   # useDebounce, useColorScheme, custom hooks
├── assets/                      # App icons, splash, brand images (chorely-logo.png)
├── supabase/
│   └── migrations/              # SQL migration files (mirror of remote — read-only reference)
├── App.tsx
├── index.ts
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── CLAUDE.md                    # This file (project rules)
├── DESIGN.md                    # Visual system (Lumina Bloom)
├── PLANNING.md                  # Build approach, architecture, phases
└── TASKS.md                     # Per-task progress
```

---

## 5. Database Schema

These are the tables in the Supabase backend (migrations 001–017). Do not create new tables without updating this file. The frontend must align with this schema exactly. (Migrations 011–013 are security/perf hardening — function security, anon RPC revokes, RLS perf + FK indexes — and add no new tables. Migration 015 adds nullable `avatar_gradient integer` + `avatar_icon text` to profiles and children for customizable avatars — `avatar_gradient` indexes `AVATAR_GRADIENTS`, `avatar_icon` is an Ionicon name or `'face'` for the Chorely smiley. Migration 016 adds `children.age_tier_override`. Migration 017 is security hardening — revokes `authenticated` UPDATE on `children.points`/`streak_days`/identity columns so points change only via RPCs, and makes `generate_invite_code` crypto-secure; adds no new tables. See docs/STAGE1_BETA_READINESS_LOG.md.)

### profiles (001)
```sql
id uuid PRIMARY KEY REFERENCES auth.users(id)
display_name text
avatar_url text
created_at timestamptz DEFAULT now()
updated_at timestamptz DEFAULT now()
```
Auto-created via `handle_new_user()` trigger on auth.users insert.

### families (002)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
name text NOT NULL
invite_code text UNIQUE  -- auto-generated via generate_invite_code()
created_by uuid REFERENCES profiles(id)
created_at timestamptz DEFAULT now()
```

### family_members (002)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
family_id uuid REFERENCES families(id) ON DELETE CASCADE
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
role text DEFAULT 'parent'  -- 'parent' | 'guardian'
joined_at timestamptz DEFAULT now()
UNIQUE(family_id, user_id)
```

### children (003 + 010)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
family_id uuid REFERENCES families(id) ON DELETE CASCADE
name text NOT NULL
date_of_birth date
avatar_url text
points integer DEFAULT 0
streak_days integer DEFAULT 0
last_streak_date date
parental_consent_given boolean DEFAULT false
parental_consent_at timestamptz
is_under_13 boolean DEFAULT false
created_at timestamptz DEFAULT now()
```
Children are NOT auth.users. They are records created by parents. Age bracket is derived at runtime from `date_of_birth` using `getAgeBracket()`.

### chores (004)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
family_id uuid REFERENCES families(id) ON DELETE CASCADE
title text NOT NULL
description text
category text  -- 'bedroom' | 'kitchen' | 'bathroom' | 'outdoor' | 'pets' | 'laundry' | 'homework' | 'other'
point_value integer NOT NULL CHECK (point_value > 0)
frequency text DEFAULT 'once'  -- 'once' | 'daily' | 'weekly'
is_active boolean DEFAULT true
created_by uuid REFERENCES profiles(id)
created_at timestamptz DEFAULT now()
```

### chore_assignments (004)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
chore_id uuid REFERENCES chores(id) ON DELETE CASCADE
child_id uuid REFERENCES children(id) ON DELETE CASCADE
assigned_by uuid REFERENCES profiles(id)
status text DEFAULT 'assigned'  -- 'assigned' | 'submitted' | 'approved' | 'rejected'
due_date date
assigned_at timestamptz DEFAULT now()
completed_at timestamptz
note text
```

### rewards (005)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
family_id uuid REFERENCES families(id) ON DELETE CASCADE
title text NOT NULL
description text
point_cost integer NOT NULL CHECK (point_cost > 0)
icon_name text
color text
is_active boolean DEFAULT true
created_by uuid REFERENCES profiles(id)
created_at timestamptz DEFAULT now()
```

### reward_redemptions (005)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
reward_id uuid REFERENCES rewards(id)
child_id uuid REFERENCES children(id) ON DELETE CASCADE
points_spent integer NOT NULL
redeemed_at timestamptz DEFAULT now()
fulfilled_at timestamptz
fulfilled_by uuid REFERENCES profiles(id)
```
Insert only via `redeem_reward()` RPC.

### point_transactions (006)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
child_id uuid REFERENCES children(id) ON DELETE CASCADE
amount integer NOT NULL
type text  -- 'earned' | 'redeemed' | 'adjustment'
reference_id uuid
reference_type text
note text
created_at timestamptz DEFAULT now()
```

### activity_log (006)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
family_id uuid REFERENCES families(id) ON DELETE CASCADE
type text  -- 'chore_completed' | 'chore_approved' | 'chore_rejected' | 'reward_redeemed' | 'points_earned' | 'child_added' | 'chore_created'
child_id uuid REFERENCES children(id)
actor_id uuid REFERENCES profiles(id)
title text
point_value integer
metadata jsonb DEFAULT '{}'
created_at timestamptz DEFAULT now()
```

### user_settings (007)
```sql
user_id uuid PRIMARY KEY REFERENCES profiles(id)
dark_mode boolean DEFAULT false
notifications_enabled boolean DEFAULT true
notification_chore_complete boolean DEFAULT true
notification_reward_redeemed boolean DEFAULT true
notification_daily_summary boolean DEFAULT true
updated_at timestamptz DEFAULT now()
```

### goals (014)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE
child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE
kind text NOT NULL CHECK (kind IN ('reward', 'points'))  -- 'reward' saves toward a reward_id; 'points' is a custom target
reward_id uuid REFERENCES rewards(id) ON DELETE SET NULL  -- set when kind='reward'; target_points snapshots the reward cost
title text NOT NULL
target_points integer NOT NULL CHECK (target_points > 0)
is_active boolean NOT NULL DEFAULT true
reached_at timestamptz  -- stamped once when the child's balance first meets target; gates the one-time celebration
created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
created_at timestamptz NOT NULL DEFAULT now()
```
Per-child savings goals. `kind='reward'` saves toward a specific reward (target snapshots its `point_cost`); `kind='points'` is a custom point target. Indexed on `child_id` and `family_id`.

### RPC Functions (008–009)
- `submit_chore(p_assignment_id)` — Mark chore done
- `approve_chore(p_assignment_id)` — Parent approves, awards points, updates streak
- `reject_chore(p_assignment_id, p_note)` — Parent rejects with note
- `redeem_reward(p_reward_id, p_child_id)` — Spend points
- `update_streak(p_child_id, p_family_id, p_actor_id)` — Streak tracking with milestone bonuses
- `join_family_by_code(p_code)` — Join family via invite code
- `complete_onboarding(p_family_name, p_child_name, p_child_dob)` — Create family + first child in one transaction
- `delete_user_account()` — Cascade delete all user data

**All tables have Row Level Security enabled.** Access is gated by the `is_family_member()` helper function. Parents can read/write all family records. Point and redemption mutations must go through RPC functions with `FOR UPDATE` locks to prevent race conditions.

---

## 6. Visual System

The visual system — colors, gradients, shadows, radii, spacing, typography, age-bracket overrides, component rules, anti-patterns, and screen specifications — lives in **`DESIGN.md`**. Read it at session start. CLAUDE.md never duplicates design tokens.

Branding summary (context only — not load-bearing):

- Design system name: **Lumina Bloom**
- Palette: pink `#FF4D8D` / orange `#FF8C42` / green `#00A92A` / lavender bg `#F3F0FF`
- Fonts: Nunito (headlines), DM Sans (body)
- Aesthetic: light-mode glassmorphism, intentional and brand-defining (see DESIGN.md §10 on anti-pattern distinction)

---

## 7. Authentication Model

Chorely uses a parent-only auth model. Children are data records, not authenticated users.

### Parent Auth
Parents authenticate using Supabase email/password auth (`supabase.auth.signInWithPassword`). On first login they complete onboarding (via `complete_onboarding` RPC) which creates the family, first child, and user settings in one transaction. Parents hold an `auth.users` record and a corresponding `profiles` record. They can also join an existing family via invite code (`join_family_by_code` RPC).

### Children Are Records, Not Users
Children do not have accounts, emails, or authentication. They are rows in the `children` table, created by parents. The parent's authenticated session is used for all operations on behalf of children. RLS policies gate access by family membership.

### COPPA Compliance
Children under 13 are flagged via `is_under_13` and `parental_consent_given` fields on the `children` table. Children must never be prompted for email, phone, or any PII. Display name and date of birth only. COPPA compliance is non-negotiable.

### Future: Child PIN Auth (v1.1+)
PIN-based child login (where a child selects their profile and enters a PIN) is a v1.1 feature. It would require adding a `pin_hash` column to the `children` table and a new migration. Do not build this in v1.0.

---

## 8. V1.0 Scope (Build These First)

The following features constitute the v1.0 MVP. Do not build v1.1 features until every item on this list is complete and tested.

- Family creation and parent account setup
- Add child profiles with display name and date of birth (no PIN — that is v1.1+)
- Parent dashboard: view all children, pending approvals, family summary
- Chore creation (parent): title, point value, assigned child, due date, frequency
- Chore submission stub: in v1.0 the parent marks a chore submitted on the child's behalf (no child auth)
- Chore approval (parent): approve or reject submitted chores
- Points awarded automatically on approval via server-side RPC (`approve_chore`)
- Reward creation (parent): title, point cost, optional description
- Reward redemption: parent redeems on behalf of child (no child auth in v1.0)
- RevenueCat paywall: free tier (up to 1 child, 4 active chores per child), monthly plan, yearly plan
- Basic settings: rename family, manage children, sign out, delete account, dark-mode toggle

---

## 9. V1.1 Features (Do Not Build Yet)

These features are planned but must not be touched until the v1.0 App Store submission is complete.

- Child PIN auth + child-facing screens (Child Home, My Chores, Rewards, Profile)
- Photo verification for chore completion
- Push notifications (Expo Notifications + APNs setup)
- Recurring chore auto-generation
- Offline write queue and conflict resolution
- Family leaderboard
- Achievement badges
- Chore templates library

If a user or prompt asks you to build any of these before v1.0 is submitted, decline and note the reason.

---

## 10. Code Standards

- Use TypeScript strict mode. No `any` types — use `unknown` and narrow.
- All Supabase query functions live in `src/services/`. Screens never call `supabase` directly.
- All Zustand stores are typed. No untyped state.
- All UI strings are written in plain, secular American English. No religious references.
- Navigation never uses string literals. All route names are defined in a typed `NavigationParams` object in `src/types/app.types.ts`.
- Component files use PascalCase. Utility and service files use camelCase.
- No inline styles. All `StyleSheet.create()` objects live at the bottom of the file or in a companion styles file.
- `console.log` statements are acceptable during development but must be removed before any TestFlight build.

---

## 11. Supabase Rules

- Never use the `service_role` key in the app. Only the anon key goes in the app.
- Always enable RLS on every new table before pushing to production.
- Point mutations (awarding, deducting) must use server-side RPC functions — never direct UPDATE from the client.
- Storage bucket for reward images is named `reward-images`. Policy: authenticated reads, parent-only writes.
- Regenerate TypeScript types from the schema using `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts` after every schema change.

---

## 12. RevenueCat Setup Notes

- Initialize RevenueCat in `src/lib/revenuecat.ts` before the app mounts.
- iOS API key and Android API key are separate environment variables.
- The paywall screen must be tested on a real device. Simulator IAP does not work reliably.
- Free tier limits: 1 child, 4 active chores per child.
- **Tier model (decided 2026-06-01): ONE paid tier, "Chorely Plus."** Same features on monthly ($4.99) and yearly ($29.99) — yearly is just cheaper (no feature differences by billing period; this is the store-standard model and avoids reviewer/user confusion). Plus unlocks unlimited children + chores + premium features. The RevenueCat entitlement identifier is `Chorely Pro` (note the space — the exact string the app checks via `customerInfo.entitlements.active['Chorely Pro']`).
- **Trial strategy (decided 2026-06-23):** no app-side trial logic. If we offer a trial, configure it as a store/RevenueCat introductory offer, preferably **7 days on yearly** to drive annual conversion. Monthly can stay paid immediately during the first launch tests.
- Never hard-gate features on subscription status alone. Always check both subscription status AND the feature flag, so limits can be adjusted without an app update.

---

## 13. Decisions Log

Record all architectural decisions here. Format: date and one-sentence reason.

| Date | Decision | Reason |
|---|---|---|
| 2026-05-27 | Fresh build in `~/Desktop/Chorely 2/` | Previous `~/Desktop/Chorely-new` and other artifacts archived; this is a clean start matching the Lumina Bloom prototype |
| 2026-06-23 | Migrated backend to new Supabase project `zinbukzmkorkawbgckkh` ("Chorely App") on the personal account + moving to a new GitHub repo; retired the previous project and repo | Consolidating Chorely under the personal account. All 16 migrations re-applied to the new project; `.env.local` and types updated. |
| 2026-06-23 | Custom Chorely Plus paywall over RevenueCat's prebuilt dashboard paywall | Keeps Lumina Bloom styling, store disclosure, Restore Purchases, and free-tier gate behavior in code while RevenueCat supplies offerings, purchases, restores, and entitlement state. |
| 2026-06-23 | Tighten free tier to 1 child / 4 active chores per child; if using a free trial, prefer 7 days on yearly only | Gives parents enough to understand the app while pushing normal multi-child families toward Plus; yearly-only trial improves annual conversion without making the monthly plan feel free by default. |
| 2026-05-27 | Visual system split into DESIGN.md | Reduces CLAUDE.md session-load footprint; matches the "design.md" pattern from `ai-design-prompt-template.md` |
| 2026-05-27 | Fonts: Nunito + DM Sans (not Plus Jakarta + Manrope) | Already loaded in App.tsx; neither is in banned-fonts list; Nunito's rounded forms match elementary bracket |
| 2026-05-28 | Upgraded to Expo SDK 54 (RN 0.81 / React 19 / Reanimated 4) | Workspace got the bump from `npx expo install --fix` and runs cleanly in Expo Go; reverting would risk breaking the working dev loop. Future SDK changes should go through `npx expo install --fix` together, not piecemeal. |
| 2026-05-28 | ChorelyIcon supports an `animated` prop (blink + bob) | Brand wanted the smiley to feel alive on Welcome / Onboarding hero moments; the prop defaults off so small chrome uses stay still and cheap |
| 2026-05-28 | Full dark mode added (themed palette) — supersedes light-only | User requested a working dark mode option. Added `darkC` palette + `useThemedStyles`/`useTheme().C` so the whole app recolors via the Settings toggle. Light stays the default. See DESIGN.md §Dark Mode. |
| 2026-05-29 | Parent nav restructured to Home / Review / Chores / Family / More (Rewards pushed from More) + full prototype visual alignment | User supplied the Lumina Bloom prototype screenshots as the original intent and asked to match them. Adopted the prototype's parent navigation + gradient/tinted-tile visual language. Kid screens stay v1.1. See DESIGN.md §11. |
| 2026-05-29 | Added `goals` table (migration 014) — per-child reward-savings + custom-point goals with one-time "reached" celebration | Replaced the dashboard "Set Goal → coming-soon" stub with a functional feature; goals are read/written under the family-member RLS policy, no new RPC needed (no point mutations). |
| 2026-05-29 | Customizable avatars (migration 015) — `avatar_gradient` + `avatar_icon` on profiles & children | Tap any avatar (parent or kid) -> `ProfileEditModal` to pick a gradient color + icon (incl. the Chorely face). Stored on the row under existing RLS; `Avatar` renders the chosen gradient/icon, falling back to name-hash gradient + initial. No photo upload (deferred). |
| 2026-05-29 | Sound effects via `expo-audio` (~1.1.1); `soundEnabled` is local-only (not in `user_settings`); `expo-audio` config plugin removed from `app.json` | Adds celebration/approval SFX through `utils/sounds.ts` (mirrors `haptics.ts`). Kept the pref local to avoid a schema migration (so it does not sync across devices yet). Removed the config plugin because it injects an iOS microphone permission we don't need for playback — unwanted for a COPPA-sensitive kids' app. SFX respect the silent switch. Audio files are an optional drop-in (`assets/sounds/`), so the bundle builds without them. |
| — | Expo Managed over React Native CLI | Faster builds, no native module conflicts for v1 scope |
| — | RevenueCat over Stripe for IAP | Apple and Google require native IAP; Stripe is not permitted |
| — | Zustand over Redux | Lower boilerplate for this app's state complexity |
| — | PIN-based child auth deferred to v1.1 | COPPA compliance; no email for users under 13; out of scope for v1.0 |
| — | Server-side RPC for point mutations | Prevents split transactions from client race conditions |
| — | Light mode with glassmorphism | Brand design uses lavender background (`#F3F0FF`) with intentional glass cards |
| — | Supabase free tier to start | Sufficient for development and early beta; upgrade when user growth justifies it |
