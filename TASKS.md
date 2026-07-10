# TASKS.md — Tydified Frontend Build

Legend: `[ ]` pending, `[x]` complete, `[-]` skipped

> **⭐ ACTIVE (2026-07-09): Tydified Plus payment setup** — resume at the first
> unchecked box in [docs/launch/PLUS_PAYWALL_SETUP.md](docs/launch/PLUS_PAYWALL_SETUP.md).
> Both stores' testing is LIVE (TestFlight + direct APK); payments are the
> remaining gate before sandbox purchase tests.

---

## Phase 0: Prep (completed 2026-05-27)

- [x] Delete other Tydified folders and IDE caches outside `~/Desktop/Chorely 2/`
- [x] Flatten `uploads/` contents into project root; remove `uploads/`
- [x] Split CLAUDE.md → CLAUDE.md (project rules) + DESIGN.md (visual system)
- [x] Reset TASKS.md to match actual project state (no code yet)
- [x] Rewrite PLANNING.md "What Is Changing" → "Build Approach" (fresh build framing)
- [x] Delete prototype files (`app.jsx`, `components.jsx`, `mascot.jsx`, `screens-child.jsx`, `screens-parent.jsx`, `tweaks-panel.jsx`, `styles.css`, `Chorely Prototype.html`, `.DS_Store`)

## Phase 1: Foundation (repo + skeleton) — completed 2026-05-27

- [x] Get GitHub repo URL from user (personal account repo — migrated 2026-06-23)
- [x] `git init` in `Chorely 2/`, add remote, set default branch to `main`
- [x] Add `.gitignore` (Node, Expo, EAS, `.env`, `.DS_Store`, `ios/`, `android/`)
- [x] Add `.env.example` (4 env vars from CLAUDE.md §3)
- [x] Audit `package.json` against required deps (RN Nav v7 confirmed, CLAUDE.md §2 corrected from v6)
- [x] Create directory skeleton (`src/{screens/{auth,parent},components/{brand,ui,layout,modals},navigation,store,services,lib,theme,types,utils,hooks}`, `supabase/migrations/`)
- [x] Write `src/theme/tokens.ts` (Lumina Bloom tokens)
- [x] Write `src/theme/ThemeProvider.tsx` (light default, dark stub)
- [x] Write `src/theme/index.ts` (re-exports for App.tsx)
- [x] Write `src/navigation/RootNavigator.tsx` (Hello-Tydified placeholder via `@react-navigation/stack`)
- [x] `npm install` clean (953 packages, 14s)
- [x] `npx tsc --noEmit` clean (no type errors)
- [x] First commit (`chore: scaffold Tydified v1.0 (Phase 1 foundation)`) pushed to `origin/main`
- [ ] **Visual verification**: launch `npx expo start` and confirm the Hello-Tydified placeholder renders in iOS Simulator / Expo Go

## Phase 2: Supabase Wiring

### Phase 2a: Schema (completed 2026-05-27)

- [x] Get Supabase URL + anon key from user; paste into `.env.local` (never committed)
- [x] Verify Supabase project is reachable; discover it's empty (plan assumed schema existed; it didn't)
- [x] Author migrations 001-010 implementing CLAUDE.md §5 schema (tables, FKs, RLS policies, RPCs)
- [x] Author migration 011 (set search_path on helpers, revoke PUBLIC on SECURITY DEFINER fns)
- [x] Author migration 012 (revoke anon EXECUTE on RPCs at GRANT layer; defense-in-depth)
- [x] Apply migrations 001-016 to `zinbukzmkorkawbgckkh` (Chorely App, personal account) via MCP
- [x] Verify all 11 tables exist with RLS enabled
- [x] Verify anon role has zero SECURITY DEFINER access; authenticated has user-callable RPCs only
- [x] Generate `src/types/database.types.ts` from live schema via MCP

### Phase 2b: Client + smoke test (completed 2026-05-27)

- [x] Write `src/lib/supabase.ts` (typed client with AsyncStorage session persistence)
- [x] Write `src/types/app.types.ts` (Row aliases, ChoreStatus/Category/Frequency literal types, typed RootStackParamList)
- [x] Update `RootNavigator` placeholder to call `supabase.auth.getSession()` on mount and render the connection state
- [x] `tsc --noEmit` clean
- [x] Commit + push (`49091b7`)

### Phase 2c: Services + Stores (completed 2026-05-28)

- [x] Write `src/types/result.ts` (`ServiceResult<T>` tagged union + ok/fail/fromError helpers)
- [x] Write `src/services/auth.ts` (signUp, signIn, signOut, getSession, getUser, getMyProfile, updateMyProfile, onAuthStateChange)
- [x] Write `src/services/families.ts` (listMyFamilies, getFamily, renameFamily, listFamilyMembers)
- [x] Write `src/services/children.ts` (CRUD)
- [x] Write `src/services/chores.ts` (CRUD + assignChore + listAssignmentsForFamily/Child + listPendingApprovals)
- [x] Write `src/services/rewards.ts` (CRUD + listRedemptionsForFamily/Child + markRedemptionFulfilled)
- [x] Write `src/services/activity.ts` (listActivity + listActivityForChild)
- [x] Write `src/services/settings.ts` (getMySettings, updateMySettings)
- [x] Write `src/services/rpc.ts` (typed wrappers for the 8 RPCs)
- [x] Write `src/store/authStore.ts` (session + profile; in-memory mirror — supabase client owns persistence)
- [x] Write `src/store/familyStore.ts` (current family + members + children)
- [x] Write `src/store/choreStore.ts` (chores + assignments + filter)
- [x] Write `src/store/rewardStore.ts` (rewards + redemptions)
- [x] Write `src/store/activityStore.ts` (activity feed)
- [x] Write `src/store/settingsStore.ts` (dark mode + notification prefs, with persist middleware)
- [x] `tsc --noEmit` clean
- [x] Wire smoke-test button into Placeholder screen (RootNavigator.tsx)
- [x] Verify temp smoke-test screen can sign up a real user end-to-end — passed 2026-05-28 with invite code `Q7JQ6926` (auth → profile autocreate → onboarding RPC → families list reads back)
- [x] Disable "Confirm email" in Supabase dev project (Auth → Providers → Email) so signups return a session immediately

> The smoke-test button stays on the Placeholder screen until Phase 4 replaces RootNavigator with the real auth-gated flow. The orphan `smoke-*@example.com` users in `auth.users` can be cleared via the Supabase Dashboard or by calling `delete_user_account()` once we have a screen for it.

## Phase 3: UI Atoms + Layout

### Batch 1 — Everyday primitives (completed 2026-05-28)

- [x] `layout/ScreenContainer.tsx` (safe-area + lavender bg + optional scroll + optional keyboardAvoiding)
- [x] `ui/GlassCard.tsx` (two-layer pattern: outer shadow wrapper + inner BlurView-on-iOS clip; designed alphas via tint prop)
- [x] `ui/Button.tsx` (primary/secondary/ghost/danger; sm/md/lg; loading + disabled; `scale(0.98)` press; secondary uses BlurView + glass tint)
- [x] `ui/Input.tsx` (text input with label + helper + error; focus state lifts border to borderPink; multiline support)
- [x] `ui/Avatar.tsx` (LinearGradient circle with initial; sm/md/lg/xl; stable hash assigns gradient when index omitted)
- [x] `ui/Badge.tsx` (pill; neutral/pink/orange/green/danger/muted tones; sm/md sizes)
- [x] `ui/PointsBadge.tsx` (star icon + formatted number; balance/earn/spend tones)
- [x] `ui/EmptyState.tsx` (icon bubble + title + description + optional Button CTA)
- [x] `tsc --noEmit` clean

### Batch 2 — Composites + polish (completed 2026-05-28)

- [x] `brand/TydifiedIcon.tsx` (SVG rounded-square smiley with pink→orange gradient stroke)
- [x] `brand/TydifiedLogo.tsx` (3 variants: `full` stacked, `horizontal` inline, `icon` smiley-only)
- [x] `ui/ProgressBar.tsx` (clamp + optional label/valueLabel header)
- [x] `ui/ProgressRing.tsx` (SVG, optional gradient stroke, custom center label, unique gradient id per instance)
- [x] `ui/ChoreRow.tsx` (status-tone Badge + PointsBadge + Avatar; pure-UI props decoupled from DB row shapes)
- [x] `ui/RewardCard.tsx` (icon halo + locked/just-unlocked states + accentColor hex→rgba helper)
- [x] `ui/SkeletonLoader.tsx` (Reanimated opacity pulse 0.4↔0.8; shapes: block/line/circle; `SkeletonRow` convenience composite)
- [x] `ui/Toast.tsx` (`ToastProvider` + `useToast()` hook; tones success/error/info; safe-area aware; auto-dismiss + tap-to-dismiss)
- [x] `layout/Header.tsx` (avatar OR back chevron leading + title/subtitle + up to 3 trailing icon actions with optional badge dot)
- [x] `layout/TabBar.tsx` (glassmorphism pill, simple `tabs/activeKey/onChange` API — Phase 4 writes the React Navigation adapter)
- [x] `tsc --noEmit` clean
- [ ] Visual parity check against DESIGN.md §11 screen specs (deferred to when a real screen renders them — Phase 4)
- [ ] Wire `<ToastProvider>` into `App.tsx` (do this in Phase 4 when App.tsx tree is set up)
- [ ] Add `@expo/vector-icons` as an explicit dependency before TestFlight (currently transitive via `expo`)

## Phase 4: Navigation + Auth + Onboarding

### Batch 1 — Auth gate + Welcome / SignUp / SignIn (completed 2026-05-28)

- [x] `src/hooks/useAuthBootstrap.ts` — restores session at launch + subscribes to onAuthStateChange; hydrates authStore
- [x] `src/navigation/RootNavigator.tsx` — Auth ↔ Main switch driven by `authStore.session` (conditional `<Stack.Screen>` blocks; React Navigation 7 idiomatic)
- [x] `src/screens/auth/WelcomeScreen.tsx` — animated TydifiedLogo hero + Create account / I already have an account CTAs
- [x] `src/screens/auth/SignUpScreen.tsx` — RHF + Yup (displayName + email + password); calls `auth.signUp`; handles email-confirmation case by redirecting to Login with an info toast
- [x] `src/screens/auth/LoginScreen.tsx` — RHF + Yup (email + password); calls `auth.signIn`; ghost "Create one" link to SignUp
- [x] `src/screens/parent/DashboardStub.tsx` — placeholder post-sign-in landing; greeting + status card + showcase shortcut + sign-out
- [x] `App.tsx` — wired `useAuthBootstrap()`; gates navigator on both fontsReady AND authReady so signed-in users don't flash Welcome
- [x] Removed `PlaceholderScreen` + smoke-test code (the auth flow now exercises the same code paths end-to-end)
- [x] `tsc --noEmit` clean
- [ ] Test: sign up → land on DashboardStub
- [ ] Test: sign out → return to Welcome
- [ ] Test: sign in → land on DashboardStub
- [ ] Test: kill + relaunch app while signed in → still on DashboardStub (no Welcome flash)

### Batch 2 — Onboarding + Main shell (code complete 2026-05-28, ⏳ awaiting manual verification)

- [x] `src/screens/auth/OnboardingWizard.tsx` — 2-step wizard (family name → first child + optional DOB); calls `rpc.completeOnboarding`, hydrates familyStore, plus a "Not you? Sign out" escape hatch
- [x] Detect post-signup state (no family yet) and route to OnboardingWizard — `useFamilyBootstrap` loads family context; RootNavigator gates session → Onboarding → Main
- [x] `src/navigation/MainNavigator.tsx` — bottom tabs (Home / Chores / Rewards / Family / Settings) using TabBar via a `TydifiedTabBar` React Navigation adapter (emits `tabPress`)
- [x] Replace DashboardStub with the tabbed Main shell — deleted `DashboardStub.tsx`; `HomeScreen` is minimal-real (family summary + roster + pending-approvals placeholder); Chores/Rewards stubs; Family read-only roster; Settings carries sign-out + dev showcase link
- [x] `App.tsx` gates navigator on fontsReady && authReady && **familyReady** (no flash of Welcome or Onboarding for returning users)
- [x] `src/screens/parent/layout.ts` — `TAB_BAR_CLEARANCE` so scroll content clears the floating glass tab bar
- [~] Delete ComponentShowcase + Showcase route — **deferred** (condition not met: tab screens are still stubs in Batch 2). Showcase kept reachable from Settings; delete in Phase 5+ once real screens render the components in real contexts.
- [ ] Add `@expo/vector-icons` as an explicit dependency (currently transitive) — still pending

**Verification gate (run in iOS Simulator):**
1. New signup → lands on OnboardingWizard (not Home)
2. Step 1 family name → Continue → Step 2 child name (+ optional DOB) → Create my family → lands on Home tab
3. Home shows family name, invite code, 1 child in roster, total points
4. Tab bar switches between Home / Chores / Rewards / Family / Settings
5. Settings → Sign out → Welcome; sign back in → lands straight on Home (no Onboarding flash)
6. Settings → "View component showcase" still works and back returns to Settings

## Phase 5: Parent Dashboard (code complete 2026-05-28, tsc + Metro green)

- [x] `screens/parent/ParentDashboard.tsx` — greeting header (avatar + family name); replaces the minimal HomeScreen as the Home tab; HomeScreen deleted
- [x] Pending Approvals card with counter + preview (green "all caught up" vs pink "N waiting" + Review button → Chores tab)
- [x] Today's Snapshot — 3 stat tiles (Assigned/pink, Completed/green, Points/orange) computed from assignments + children points
- [x] Quick Actions grid — Add chore / Create reward / View family / Review requests (navigate to tabs; modals arrive Phase 6/7; Review shows a pending-count badge)
- [x] Family Progress cards — one per child: avatar, points, streak, completion ProgressRing (approved/total, gradient ring)
- [x] Wire to `familyStore`, `choreStore`, `activityStore` — loads assignments/chores/activity/children on mount; toasts first error
- [x] Pull-to-refresh — added `refreshControl` prop to `ScreenContainer`; dashboard re-fetches all four datasets

Note: chore/assignment data only populates after Phase 6, so snapshot/progress show zeros today (by design). Activity is fetched into `activityStore` but not yet surfaced (no recent-activity card in the spec; revisit if added).

## Phase 6: Chore Management (code complete 2026-05-28, tsc + Metro green)

- [x] `screens/parent/ChoresScreen.tsx` — filter SegmentedControl (All / To do / Pending); assignment-centric list via ChoreRow; tap an assigned/returned row to submit-on-behalf (`submit_chore`), tap a submitted row to open approval; `+` header action + empty-state CTA open create; reloads on focus + pull-to-refresh
- [x] `modals/CreateChoreModal.tsx` — RHF + Yup; title, child pills (multi-select), point value, frequency segmented, category pills (optional), due date (optional text), notes. Creates chore then one assignment per child. **Photo-proof toggle omitted — photo verification is v1.1 (CLAUDE.md §9) and there's no schema column for it.**
- [x] `modals/ChoreApprovalModal.tsx` — child banner (avatar + relative submit time), chore detail chips, points-impact preview (Current → +N → After), Approve (`approve_chore`) / Send back (`reject_chore` with optional note)
- [x] `ChoreRow` status-variant rendering integrated (To do / Pending / Approved / Returned)
- [x] New reusable primitives: `ui/SegmentedControl.tsx`, `modals/ModalSheet.tsx` (glass bottom-sheet), `utils/date.ts` (formatDueLabel + formatRelativeTime); `ScreenContainer` already had refreshControl from Phase 5
- [ ] Manual test in Simulator: create chore → tap to submit → approve → child points credit (verify on Dashboard/Family)
- [ ] Manual test: create chore → submit → send back → status shows "Returned"

Build note (2026-05-28): mid-phase, node_modules got truncated (expo-blur/build, supabase-js/dist `.d.ts` files missing — runtime JS intact so Metro bundled, but tsc broke). Disk is at 94%. Fixed with `npm ci`. Watch disk; if tsc shows mass "Cannot find module", run `npm ci`.

## Phase 7: Rewards & Points (code complete 2026-05-28, tsc green; Metro verify deferred — dev server off)

- [x] `screens/parent/RewardsScreen.tsx` — child picker (multi-child), balance card, filter (All/Available/Locked), 2-col RewardCard grid; create + redeem flows; reload on focus + pull-to-refresh
- [x] `modals/CreateRewardModal.tsx` — RHF+Yup; title, point cost, curated icon picker, accent-color swatches, description → `createReward`
- [x] `modals/RedeemRewardModal.tsx` — reward + child summary, points-impact preview (Balance → −Cost → After), guards affordability, `redeem_reward` RPC
- [x] `modals/CelebrationOverlay.tsx` — RN Animated (no confetti lib): spring-in success badge + fan-out emoji particles, auto-dismiss ~1.6s; fired on redeem
- [ ] Manual test in Simulator: create reward → redeem → child points decrement + redemption logged + celebration plays

Note: locked/available is computed against the selected child's balance. `CelebrationOverlay` is reusable for chore approval too (not yet wired there — optional polish).

## Phase 8: Family + Settings (code complete 2026-05-28, tsc + Metro green)

- [x] `screens/parent/FamilyScreen.tsx` — real screen (child cards: avatar, points, streak; invite-code card; add via header `+`; remove via per-card trash with Alert confirm); focus reload + pull-to-refresh
- [x] `modals/AddChildModal.tsx` — name + optional DOB only (COPPA); auto-flags `is_under_13` + records parental consent when under 13
- [~] Child detail view (point/chore history) — deferred to a later pass; not required for v1.0 core
- [x] `screens/parent/SettingsScreen.tsx` — profile card, **dark-mode toggle**, notifications toggle, rename family (inline), sign out, delete account (`delete_user_account` RPC + Alert confirm → sign out), dev showcase link
- [x] **Full dark mode** (this is the big one — see below)
- [ ] Manual test in Simulator: toggle dark mode → whole app recolors + persists across relaunch; add child → appears + assignable; rename family; delete account

### Full dark mode (2026-05-28)

Added a complete dark theme, app-wide:
- `theme/tokens.ts` — `lightC` + new `darkC` palette + `Palette` type; `C` kept as a light alias for mode-invariant/dev use
- `theme/ThemeProvider.tsx` — reactive to `settingsStore.darkMode`; exposes active `C` + `mode`; new `useThemedStyles(makeStyles)` hook
- Converted ~24 components/screens from static `C` to `useTheme().C` + `useThemedStyles` (primitives, layout, all 5 modals, auth + parent screens). `BlurView` tint + StatusBar + App loading bg now follow the mode.
- `hooks/useSettingsBootstrap.ts` syncs `user_settings` → store on sign-in
- Static `C` intentionally retained for: Avatar/TydifiedIcon/TydifiedLogo/CelebrationOverlay (mode-invariant brand colors), ComponentShowcase (dev-only), and shadow colors. ChoresScreen uses no colors (theme-agnostic).

## Design Alignment — Lumina Bloom prototype (2026-05-29, tsc + Metro green)

Aligned the parent app to the prototype screenshots (the original design intent). Kid screens stay v1.1.

- [x] **Nav restructure**: parent tabs now Home / Review / Chores / Family / More. Rewards moved OUT of tabs → pushed from More ("Reward catalog"). `MainNavigator` + `MainTabParamList` + `RootStackParamList` (added `Rewards`) updated; deleted `SettingsScreen.tsx` (replaced by `MoreScreen`).
- [x] **Foundation**: `GRADIENTS` tokens (brand/violet/sky) + `ui/GradientCard.tsx` (LinearGradient surface).
- [x] **ParentDashboard (Home)** rebuilt: date+greeting (name in pink)+bell(+dot)+avatar header; **gradient** approval hero (→Review); color-tinted snapshot tiles (Assigned/Done/Points); colored-icon quick actions (Add Chore/New Reward/Add Kid → modals; Set Goal → `SetGoalModal`); kid cards with **gradient progress bars**.
- [x] **ReviewScreen** (new tab): lists submitted chores → opens approval modal; "all caught up" empty state.
- [x] **ChoreApprovalModal** restyled: gradient banner (white avatar + submitter + time), metadata chips, dashed photo-proof placeholder (v1.1), points-impact, approve/deny.
- [x] **FamilyScreen** enhanced: invite-code card + **Share**, kid cards with 3 mini stat tiles (POINTS/STREAK/THIS WK) + gear (remove), **recent-activity feed**.
- [x] **MoreScreen** (new, replaces Settings tab): grouped iOS-style list — Preferences (dark mode, notifications, Privacy & COPPA), Family (rename, manage kids→Family, reward catalog→Rewards), Subscription (Plus/Billing → Phase 9 toasts), Support (help/rate/showcase), sign out + delete account, footer.
- [x] All new UI is theme-aware (dark mode intact). ChoresScreen left as-is (parent chore mgmt already on-brand).
- [ ] Manual Simulator pass: verify the gradients/tiles/nav feel right in both light + dark.

## Goals (2026-05-29)

- [x] **`goals` table** (migration 014): per-child reward-savings (`kind='reward'`) + custom-point (`kind='points'`) goals; `reached_at` gates a one-time celebration; family-member RLS, no RPC (no point mutations).
- [x] **`SetGoalModal`** + `goalStore` + `services/goals.ts` + `database.types.ts`/`app.types.ts` types; wired into ParentDashboard (replaced the "Set Goal → coming-soon" stub).
- [ ] Manual pass: create both goal kinds, confirm the "reached" celebration fires exactly once.

## Sound effects (2026-05-29)

- [x] Installed `expo-audio` (~1.1.1, SDK 54 compatible); removed its auto-added config plugin from `app.json` (playback doesn't need the mic permission it injects).
- [x] `src/utils/sounds.ts` — fire-and-forget `playSound(name)` mirroring `haptics.ts`; gated on `soundEnabled`; respects the silent switch; swallows errors. Audio files are an **optional** drop-in via a `SOURCES` registry, so the bundle builds without them.
- [x] `settingsStore.soundEnabled` (default on, **local-only** — no `user_settings` column, so it doesn't sync across devices) + "Sound effects" toggle in MoreScreen → Preferences.
- [x] Wired `playSound('celebrate')` into `CelebrationOverlay` (goal reached + reward redeem) and `playSound('success')` into `ChoreApprovalModal` approve. Reject path stays haptic-only by design (no punishing buzzer for kids).
- [ ] **Drop in audio**: add `celebrate.mp3` + `success.mp3` to `assets/sounds/` and uncomment the two lines in `sounds.ts` (see `assets/sounds/README.md` for specs + CC0 sources). Couldn't auto-source from the sandbox (Pixabay is behind Cloudflare; OpenGameArt ships zips) and licenses need human verification before an App Store build.
- [ ] Manual pass on device: toggle on/off, confirm celebrate fires on goal-reached/redeem and success on approve, and that silent-switch is respected.

## Phase 9: Paywall (RevenueCat)

- [ ] Install `react-native-purchases`
- [ ] `src/lib/revenuecat.ts` — initialize before app mounts
- [ ] `screens/parent/PaywallScreen.tsx` — free / monthly / yearly tiers
- [ ] Hard limits read from a feature-flag map (free: 1 child, 4 active chores per child) — not direct subscription check
- [ ] Test on a real device — simulator IAP is unreliable

## Phase 10: Polish + Pre-Submission

- [ ] **Enable Supabase leaked-password protection** (Auth → Passwords; HaveIBeenPwned check) — ⚠️ requires the **Supabase Pro plan**, so do this once upgraded. (Flagged by security advisor 2026-05-29.)
- [ ] Re-enable Supabase email confirmation (currently OFF in dev)
- [x] Skeleton loaders on every list screen (2026-05-29): `SkeletonRow` on Dashboard/Chores/Review/Family, `SkeletonLoader` blocks on Rewards grid. Each screen gates its primary list on a first-load `loading` flag (initialized from whether the store slice is already populated, so no skeleton flash when navigating back). Replaces the empty-state flash on cold load. (DESIGN.md §9: shimmer, not spinners.)
- [ ] Pull-to-refresh everywhere lists appear
- [ ] Haptics on key interactions (`expo-haptics`)
- [ ] Touch-target audit (48px / 56px elementary)
- [ ] Strip all `console.log`
- [ ] COPPA audit (no PII prompts for children data)
- [ ] Verify RLS policies block cross-family reads (test with two accounts)
- [x] Replace placeholder app icons + add missing Android adaptive-icon assets (2026-05-29): branded Tydified smiley generated via `scripts/gen-icons.py` (icon/adaptive fg+bg+mono/splash logo/favicon); expo-doctor config-schema check now passes.
- [ ] Install `expo-asset` peer dep (`npx expo install expo-asset`) — flagged by expo-doctor (needed by expo-audio for non-Expo-Go builds); + resolve minor expo/expo-font patch drift via `npx expo install --check`
- [ ] Decide on `ProgressBar` primitive (still unused — wire in or remove); `SkeletonLoader`/`SkeletonRow` now wired into all list screens
- [ ] EAS build → TestFlight + Google internal track

## Audit log (2026-05-29)

Ran a full security / dead-code / correctness audit. Findings + actions:
- Fixed: **add-chore-not-saving** (client-side child-selection gate; auto-select single child) and **toast bleed-through** at top (opaque surface).
- Applied **migration 013**: wrapped `auth.uid()` → `(select auth.uid())` in RLS policies (advisor `auth_rls_initplan`) + added 6 FK covering indexes (`unindexed_foreign_keys`).
- Removed the dev **ComponentShowcase** screen + its nav route/links (was shipping in the bundle).
- Security verdict: no critical vulns. No hardcoded secrets, no `console.log`, RLS verified. Remaining: enable leaked-password protection (Pro plan — see above); the "authenticated can call SECURITY DEFINER" advisor warnings are by-design (our RPC API, auth-checked internally).

## Phase 11: Age/Grade-Tier Chores & Rewards (v1.0 — decided 2026-06-01)

Tailor chore & reward SUGGESTIONS (and default point values) to a child's age/grade tier. **Suggestions only — never restrict** what a parent can assign. Tier auto-derived from `date_of_birth`, with an optional per-child override.

**Tiers (4):** `early` Pre-K–2nd (~5–7) · `lower` Grades 3–6 (~8–11) · `middle` Grades 7–9 (~12–14) · `upper` Grades 10–12 (~15–18).

- [x] `src/utils/ageTier.ts` — `getAgeTier(dob)`, `effectiveTier(child)`, `ageFromDob`, `tierLabel`/`tierShortLabel`, `AGE_TIERS`.
- [x] `src/data/choreSuggestions.ts` — `CHORE_SUGGESTIONS: Record<AgeTier, ChoreSuggestion[]>` (title/category/points; points scale by tier).
- [x] `src/data/rewardSuggestions.ts` — `REWARD_SUGGESTIONS: Record<AgeTier, RewardSuggestion[]>` (title/cost/icon).
- [x] CreateChoreModal — "Suggested for {tier}" tap-to-add chips for the selected child's tier; tapping prefills title/category/points.
- [x] CreateRewardModal — suggested rewards via a tier picker (rewards are family-level); tapping prefills title/cost/icon.
- [x] Consolidate duplicated `ageFromDob`/`bracketLabel` (FamilyScreen + ParentDashboard) onto `ageTier.ts`; FamilyScreen now shows the grade-tier label (respects override).
- [x] Migration 016 — `children.age_tier_override` (nullable text + CHECK in early/lower/middle/upper); applied remote + local mirror; `database.types.ts` updated.
- [x] Tier override picker in ProfileEditModal ("Age group": Auto + 4 tiers; tap a kid's avatar to edit).
- [ ] (v1.1) Kid-facing visual tiers — expand `bracketThemes` from the old 3-bracket/pre-teal system to 4 tiers + teal.
