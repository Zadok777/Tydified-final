# PLANNING.md — Tydified v1.0 Build

This document describes the architecture, phasing, and key decisions for building Tydified v1.0 in `/Users/santiagos4god/Desktop/Chorely 2/`. The full visual system lives in `DESIGN.md`. Project rules and the Supabase schema live in `CLAUDE.md`. Per-task progress is tracked in `TASKS.md`.

---

## Build Approach

This is a **fresh build**, not a rebuild. The folder starts with the Expo skeleton (`App.tsx`, `package.json`, `app.json`, `eas.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `index.ts`) and the brand asset (`assets/tydified-logo.png`). Everything else is built phase by phase per `TASKS.md`.

### What exists ahead of time

- **Supabase backend**: the live project at the Supabase URL (provided when wiring Phase 2) already has migrations 001–010 applied, all RPC functions deployed, and RLS policies enforced. The schema is documented in CLAUDE.md §5. We connect to it from the new app; we do not re-create it.
- **GitHub repo**: hosted on the personal GitHub account as of the 2026-06-23 migration. Phase 1 wires the local folder to the remote and pushes the first commit.
- **Brand asset**: `assets/tydified-logo.png` is the pink→orange smiley used by the `TydifiedLogo` and `TydifiedIcon` components.
- **App.tsx**: stubs in font loading (Nunito + DM Sans), `SafeAreaProvider`, `GestureHandlerRootView`, `NavigationContainer`, and `ThemeProvider` + `RootNavigator`. The imports it references (`./src/theme`, `./src/navigation/RootNavigator`) are created in Phase 1 / Phase 4.

### What does NOT exist yet

- No `src/` directory, no screens, no components, no services, no stores, no navigation, no types, no theme. Every file under `src/` is built during the phases below.
- No `.env` file. Supabase URL/keys and RevenueCat keys are added in Phase 2 and Phase 9 respectively.
- No `.gitignore`, no `.env.example`. Created in Phase 1.

### What we will NOT salvage

Anything from prior `~/Desktop/Chorely-new` or earlier Tydified attempts. Those folders and their IDE caches were deleted on 2026-05-27. This build references the prototype design (captured in DESIGN.md) and the live Supabase schema (captured in CLAUDE.md §5) as its only inputs.

---

## Architecture

### Navigation Structure

```
RootNavigator (Stack)
├── Auth Stack (unauthenticated)
│   ├── WelcomeScreen
│   ├── LoginScreen
│   ├── SignUpScreen
│   └── OnboardingWizard (create family + first child)
│
└── Main Stack (authenticated + has family)
    └── Bottom Tabs
        ├── Home (ParentDashboard)
        │   └── Stack: Dashboard → ChoreDetail → ApprovalDetail
        ├── Chores
        │   └── Stack: ChoreList → CreateChore → ChoreDetail
        ├── Rewards
        │   └── Stack: RewardList → CreateReward → RedeemReward
        ├── Family
        │   └── Stack: FamilyOverview → ChildDetail → AddChild
        └── Settings
            └── Stack: SettingsMain → AccountSettings → Paywall
```

No child-specific navigation in v1.0. Parents manage everything. Child views are a v1.1+ feature.

### Design Token Architecture

Single source of truth: `src/theme/tokens.ts`

Exports:
- `C` — color constants (pink, orange, green, bg, text colors, glass, alphas)
- `AVATAR_GRADIENTS` — array of gradient pairs for child avatars
- `shadows` — RN shadow objects (sm, md, lg, 2xl, pink)
- `radii` — border radius scale (r8 through rFull)
- `spacing` — 8pt spacing scale
- `typography` — font family + size scale objects
- `bracketThemes` — age-bracket-specific overrides (elementary, middle_school, high_school)

### Component Architecture

```
src/components/
├── brand/                  # Logo and brand assets
│   ├── TydifiedLogo.tsx     # Full/horizontal/icon variants
│   ├── TydifiedIcon.tsx     # Standalone smiley-square icon
│   └── index.ts
├── ui/                     # Atomic design elements
│   ├── GlassCard.tsx       # Glass card with blur + border
│   ├── Button.tsx          # Primary, secondary, ghost, danger variants
│   ├── Input.tsx           # Text, number, date inputs with label + error
│   ├── Badge.tsx           # Status badges (available, pending, locked, approved, denied)
│   ├── Avatar.tsx          # Gradient circle with initial letter
│   ├── ProgressBar.tsx     # Linear progress with color fill
│   ├── ProgressRing.tsx    # Circular SVG progress
│   ├── PointsBadge.tsx     # Points display with coin icon
│   ├── ChoreRow.tsx        # Chore list item with status variants
│   ├── RewardCard.tsx      # Reward grid card with locked/available states
│   ├── EmptyState.tsx      # Empty state with illustration
│   ├── SkeletonLoader.tsx  # Shimmer loading placeholder
│   └── Toast.tsx           # Toast notification
├── layout/
│   ├── ScreenContainer.tsx # Safe area + background + scroll wrapper
│   ├── Header.tsx          # Screen header with back button
│   └── TabBar.tsx          # Bottom navigation (glassmorphism pill)
└── modals/
    ├── CreateChoreModal.tsx
    ├── CreateRewardModal.tsx
    ├── AddChildModal.tsx
    ├── ChoreApprovalModal.tsx
    ├── RedeemRewardModal.tsx
    └── CelebrationOverlay.tsx
```

### State Flow

```
Supabase DB
    ↕ (RPC + queries)
src/services/supabase/   ← kept as-is
    ↕ (function calls)
src/store/               ← kept as-is (Zustand)
    ↕ (hooks: useStore)
src/screens/             ← NEW (rebuilt)
    ↕ (props)
src/components/          ← NEW (rebuilt)
```

---

## Phasing

### Phase 1: Foundation
- Delete old frontend files (screens, components, navigation, contexts, constants)
- Create new `src/theme/tokens.ts` with prototype design tokens
- Create new theme provider (light mode default, dark mode support)
- Create `ScreenContainer`, `Header`, `TabBar` layout components
- Create core UI atoms: `GlassCard`, `Button`, `Input`, `Badge`, `Avatar`
- Verify existing stores and services still work with new theme

### Phase 2: Auth & Onboarding
- Rebuild `WelcomeScreen` with new design
- Rebuild `LoginScreen` with new design
- Rebuild `SignUpScreen` with new design
- Rebuild `OnboardingWizard` (family name + first child)
- Rebuild `AuthNavigator` and `RootNavigator`
- Test full auth flow: sign up → onboarding → main app

### Phase 3: Parent Dashboard & Navigation
- Build `MainNavigator` (bottom tabs with glassmorphism TabBar)
- Build `ParentDashboard` screen (greeting, pending approvals, today's snapshot, quick actions, family progress)
- Wire up tab navigation: Dashboard, Chores, Rewards, Family, Settings

### Phase 4: Chore Management
- Build `ChoresScreen` (chore list with filters, status chips)
- Build `CreateChoreModal` (form with child assignment pills, frequency, points)
- Build `ChoreDetailModal` (view + approve/reject)
- Build `ChoreRow` component with status-dependent styles
- Wire up to choreStore and chore service RPCs

### Phase 5: Rewards & Points
- Build `RewardsScreen` (reward grid with filter tabs)
- Build `RewardCard` component (locked/available/just-unlocked states)
- Build `CreateRewardModal`
- Build `RedeemRewardModal` with confirmation
- Build `CelebrationOverlay` for approved chores and redemptions
- Wire up to rewardStore and reward service RPCs

### Phase 6: Family & Settings
- Build `FamilyScreen` (child cards with points, streaks, progress)
- Build `AddChildModal`
- Build `SettingsScreen` (family name, manage children, sign out, delete account)
- Build invite code sharing (join family flow)

### Phase 7: Polish & Paywall
- Add RevenueCat SDK and paywall screen
- Implement free tier limits (1 child, 4 active chores)
- Add skeleton loading states to all screens
- Add pull-to-refresh on all list screens
- Add haptic feedback on key interactions
- Audit touch targets (48px min, 56px elementary)
- Test on real iOS + Android devices

### Phase 8: Pre-Submission
- Remove all console.log statements
- Audit for COPPA compliance
- Test full user flow end-to-end
- Verify RLS policies work correctly with new frontend
- Build with EAS and test on TestFlight / internal testing track

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Parent-only app in v1.0 | Children don't have auth; parent manages everything. Child views are v1.1. |
| Prototype design tokens win | New frontend uses #FF4D8D pink, #FF8C42 orange, #F3F0FF bg — not old theme |
| Keep stores + services | Backend logic is solid; only the presentation layer changes |
| No Expo Router | Stay with React Navigation 6 (already in dependencies) |
| Modals over new screens | Create/edit flows use modals to reduce navigation complexity |
| Dark mode toggle in Settings | Added by request. Theme state persists through `settingsStore`; v1.0 keeps the light visual system as the default. |
