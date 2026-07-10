# Build Log

Reverse-chronological log of significant build milestones. Append a dated entry
whenever a phase or notable change lands. Commit history is the finer-grained
record; this is the human-readable summary.

## 2026-06-23 — Backend & repo migration + docs

- Migrated the backend to a new Supabase project **Chorely App**
  (`zinbukzmkorkawbgckkh`) on the personal account; re-applied all 16 migrations
  (12 tables + 12 RPCs), advisors clean.
- Updated `.env.local`, confirmed types in sync, verified the app boots against
  the new backend in the iOS Simulator.
- Switched the Git remote to `Zadok777/Chorely-final`; pushed full history.
  Removed old remotes and scrubbed old project/repo references from docs.
- Added the project documentation set (README, AGENTS.md, `docs/*`, `seed.sql`,
  `tests/` scaffold).
- Added Stage 1 security hardening (migration 017), dependency cleanup, and the
  custom Tydified Plus paywall/free-tier gate implementation.

## 2026-06-01 — RevenueCat + design refresh + legal/store prep

- Integrated RevenueCat SDK (entitlement `Chorely Pro`); paywall was deferred
  until the 2026-06-23 beta-readiness pass.
- "Calm & Refined" design pass: de-glassed solid surfaces, teal accent, motion.
- Age/grade-tier chore & reward suggestions (migration 016).
- Help Center, legal drafts (`docs/legal/`), store copy (`docs/store/`).

## 2026-05-29 — UX polish + prototype alignment

- Animations/haptics/icons, Goals (migration 014), skeleton loaders, sound
  effects, profile editing + customizable avatars (migration 015).
- Restructured parent navigation to Home / Review / Chores / Family / More to
  match the Lumina Bloom prototype.
- Full security/dead-code audit; RLS perf + FK indexes (migration 013).

## 2026-05-28 — Core app phases

- Phase 4: auth gate + Welcome / SignUp / SignIn + onboarding + main shell.
- Phase 5: Parent Dashboard. Phase 6: chore management. Phase 7: rewards &
  points. Phase 8: family management + full dark mode.
- Upgraded to Expo SDK 54 (RN 0.81 / React 19 / Reanimated 4).

## 2026-05-27 — Project genesis

- Fresh build scaffolded to match the Lumina Bloom prototype.
- Supabase schema migrations 001–012 (tables, RLS, RPCs, security hardening).
- Repo + skeleton + theme tokens + navigation placeholder.
