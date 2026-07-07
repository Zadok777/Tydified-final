# Project State — "Resume Here"

> Living snapshot of where the project stands. Update at the end of each work
> session. For the full task history see [TASKS.md](../TASKS.md); for rules and
> schema see [CLAUDE.md](../CLAUDE.md).

_Last updated: 2026-06-23_

## Status at a glance

- **Phase:** v1.0 feature-complete; in App Store / Play readiness.
- **App folder:** `~/Desktop/Chorely 2/` (package name `tydified`).
- **Repo:** `https://github.com/Zadok777/Chorely-final.git` (`origin`, branch `main`).
- **Supabase:** project **Chorely App** (`zinbukzmkorkawbgckkh`), personal account.
  17 migrations applied; 12 tables (RLS on) + 12 RPCs.
- **RevenueCat:** SDK wired; entitlement `Chorely Pro`; custom paywall + free-tier
  gates implemented locally. Real App Store / Play products and sandbox purchase
  testing are still pending (needs a real device build).

## Recently completed

- Migrated the backend to a new Supabase project on the personal account and
  re-applied all 16 migrations (2026-06-23).
- Re-pointed the app (`.env.local`) and regenerated types; verified booting in
  the iOS Simulator.
- Moved to the new GitHub repo (`Chorely-final`); removed old remotes; scrubbed
  old project/repo references from the docs.
- Added project documentation set (this file, README, AGENTS.md, docs/*).
- Completed Stage 1 security hardening, icon verification, Expo dependency hygiene,
  and custom RevenueCat paywall/free-tier-gate implementation.

## Pending (resume here)

1. **RevenueCat store setup** — create App Store Connect + Play Console IAP
   products, connect them in RevenueCat, add real SDK keys, then run sandbox
   purchase/restore tests in a real build.
2. **Build for devices** — run EAS iOS/Android builds after the RevenueCat
   product setup is ready.
3. **Email confirmation** — turn confirmation ON before real testers.
4. **Host legal pages** and verify the Terms/Privacy URLs used by the paywall.
5. **Delete old artifacts** — old GitHub repo `doulosnexus-lang/Tydified` and the
   old Supabase project `kwwhuwegzdaqstqhmths` (different account; delete in its
   own dashboard).
6. **Store readiness** — production Supabase decision + re-enable email
   confirmation; Apple Developer + Google Play accounts, app records, App
   Privacy / Data Safety forms; screenshots + metadata.
7. **Tests** — grow the Jest suite beyond the current utility coverage (see
   [TEST_PLAN.md](./TEST_PLAN.md)).

## Known gotchas

- `~/Desktop` is iCloud-synced; `.git` objects can become "dataless" and break
  pushes. If a push dies with SIGBUS/`pack-objects`, materialize files first.
- Disk pressure can truncate `node_modules` during installs — prefer `npm ci`.
- `BlurView` is a no-op on web; verify the glass UI on the iOS Simulator.
