# Tydified

A family chore and reward management mobile app. Parents create a family, add
children, assign chores, approve completions, and define rewards. Children earn
points for completing chores and redeem them for parent-defined rewards.

> **v1.0 is parent-only.** Children are data records, not authenticated users.
> Child PIN auth and kid-facing screens are planned for v1.1. The app content is
> entirely secular.

## Tech stack

| Layer | Tool |
|---|---|
| Framework | React Native via Expo (Managed Workflow), **SDK 54 / RN 0.81 / React 19** |
| Language | TypeScript (strict) |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| State | Zustand (+ persist via AsyncStorage) |
| Navigation | React Navigation 7 (stack + bottom tabs) |
| Forms | React Hook Form + Yup |
| Payments | RevenueCat (StoreKit 2 / Play Billing) |
| Design system | "Lumina Bloom" — see [DESIGN.md](./DESIGN.md) |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run ios                  # or: npm run android / npm run web
```

### Environment variables

Create `.env.local` (never committed — see `.gitignore`):

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
REVENUECAT_IOS_API_KEY=
REVENUECAT_ANDROID_API_KEY=
```

The glassmorphism UI (`BlurView`) is a no-op on web — **use the iOS Simulator
for an accurate preview**.

## Scripts

| Command | Purpose |
|---|---|
| `npm run ios` / `android` / `web` | Start Expo on a target |
| `npm start` | Start the Expo dev server |
| `npm test` | Run the Jest test suite (see [docs/TEST_PLAN.md](./docs/TEST_PLAN.md)) |
| `npx tsc --noEmit` | Type-check |

## Documentation map

| File | What it covers |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | **Source of truth** — project rules, schema, decisions log |
| [AGENTS.md](./AGENTS.md) | Entry point for AI coding agents |
| [DESIGN.md](./DESIGN.md) | Visual system (Lumina Bloom) |
| [PLANNING.md](./PLANNING.md) | Build approach, architecture, phases |
| [TASKS.md](./TASKS.md) | Per-task progress log |
| [docs/PRODUCT_SPEC.md](./docs/PRODUCT_SPEC.md) | Product scope and feature spec |
| [docs/PROJECT_STATE.md](./docs/PROJECT_STATE.md) | Current "resume here" snapshot |
| [docs/BUILD_LOG.md](./docs/BUILD_LOG.md) | Chronological build milestones |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Architectural decisions |
| [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) | Database schema reference |
| [docs/SECURITY.md](./docs/SECURITY.md) | Security model and checklist |
| [docs/TEST_PLAN.md](./docs/TEST_PLAN.md) | Testing strategy |
| [docs/RELEASE_CHECKLIST.md](./docs/RELEASE_CHECKLIST.md) | App Store / Play release steps |
| [docs/legal/](./docs/legal/) · [docs/store/](./docs/store/) · [docs/launch/](./docs/launch/) | Legal pages, store copy, launch guides |

## Project layout

```
Tydified/
├── src/            App source (screens, components, navigation, store, services, theme)
├── supabase/
│   ├── migrations/ SQL migrations (mirror of remote)
│   └── seed.sql    Optional dev seed data
├── tests/          Jest tests
├── assets/         Icons, splash, brand images
└── docs/           Product, engineering, legal & store docs
```
