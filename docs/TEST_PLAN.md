# Test Plan

Testing strategy for Tydified. Current coverage is minimal — this plan defines
the target and the order to build it.

## Tooling

- **Runner:** Jest via the `jest-expo` preset (handles the RN/Expo transform).
- **Component tests:** `@testing-library/react-native`.
- **Location:** `tests/` mirrors `src/` (e.g. `tests/utils/ageTier.test.ts`).

### One-time setup

These dev dependencies are declared in `package.json`; install them once:

```bash
npx expo install jest-expo
npm install --save-dev jest @testing-library/react-native @types/jest
npm test
```

> Heads-up: disk pressure has truncated `node_modules` before — if installs
> misbehave, run `npm ci`.

## What to test (priority order)

1. **Pure utilities (start here — fast, no mocks).**
   - `src/utils/ageTier.ts` — `ageFromDob`, `getAgeTier`, `effectiveTier`,
     `tierLabel`, `tierShortLabel`. (Sample test included.)
   - `src/utils/date.ts` — formatting/relative-date helpers.
2. **Stores (Zustand).** Reducers/actions in `src/store/*` with mocked services.
3. **Services (`src/services/*`).** Mock the Supabase client; assert correct
   query/RPC calls and error handling. No live network.
4. **Components.** Critical UI: `ChoreRow`, `RewardCard`, modals — render +
   interaction with `@testing-library/react-native`.
5. **Critical flows (integration).** Onboarding, create→submit→approve chore
   (points awarded), redeem reward (points deducted), goal reached.

## Conventions

- Test behavior, not implementation. Fix the implementation, not the test,
  unless the test is wrong.
- Keep tests isolated (no shared mutable state); reset mocks between tests.
- Do not hit the real Supabase project from tests — mock the client.

## Coverage target

Aim for **80%** on utilities, stores, and services first (the logic with the
highest bug risk), then expand to components and flows. RPC business logic
(point math, streaks, redemption guards) lives in Postgres functions and is best
validated with integration tests against a disposable/seeded database.

## E2E (later)

Detox or Maestro for device-level flows is a post-v1.0 consideration; not
required for the first store submission.
