# tests/

Jest test suite for Tydified. Mirrors the `src/` layout (e.g.
`tests/utils/` ↔ `src/utils/`). See [../docs/TEST_PLAN.md](../docs/TEST_PLAN.md)
for strategy and priorities.

## Setup (one time)

```bash
npx expo install jest-expo
npm install --save-dev jest @testing-library/react-native @types/jest
```

## Run

```bash
npm test            # run once
npm run test:watch  # watch mode
```

Start with pure utilities (no mocks) — see `tests/utils/ageTier.test.ts`.
Do not hit the real Supabase project from tests; mock the client instead.
