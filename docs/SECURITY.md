# Security

Security model for Tydified. See also CLAUDE.md §7 (auth), §10 (code standards),
§11 (Supabase rules), and [DATA_MODEL.md](./DATA_MODEL.md).

## Authentication & authorization

- **Parent-only auth** via Supabase email/password. Children are data records,
  never authenticated users.
- **RLS on every table**, gated by `is_family_member()`. Cross-family access is
  not possible; isolation has been audited.
- **Point/redemption mutations** run exclusively through `SECURITY DEFINER` RPCs
  with `FOR UPDATE` row locks to prevent race conditions. Clients cannot `UPDATE`
  points directly through the intended API path.
- `anon` has **no** EXECUTE on any RPC (revoked at the GRANT layer, migration
  012). `authenticated` holds EXECUTE only on user-facing RPCs + `is_family_member`
  (needed for RLS predicates).

## Secrets

- All keys live in `.env.local` (gitignored). Only the Supabase **anon** key and
  the RevenueCat **public** keys ship in the app.
- **Never** put the `service_role` key in the app or repo.
- Validate required env vars are present at startup.

## Data protection / COPPA

- Children: name + optional DOB only. Never prompt for email/phone/PII.
- `is_under_13` is auto-derived from DOB (`set_child_under_13` trigger);
  `parental_consent_*` fields support consent tracking.
- Audience is adults 18+ (not the Kids/Families category).
- In-app account deletion via `delete_user_account()` cascades all user data.

## Applied hardening

- **Migration 017 (2026-06-23):** revoked `authenticated` UPDATE on
  `children.points` / `streak_days` / `last_streak_date` / `is_under_13` and the
  identity columns; points/streaks now change only via the SECURITY DEFINER RPCs.
  Reimplemented `generate_invite_code` with `pgcrypto` (`gen_random_bytes`).
  Full rationale + verification in [STAGE1_BETA_READINESS_LOG.md](./STAGE1_BETA_READINESS_LOG.md) (Step 1).
- **Migration 018 (2026-06-25):** added `goals` FK covering indexes
  (`created_by`, `reward_id`) — clears the performance advisor warnings.
- **Migration 019 (2026-06-25):** revoked the broad table-level INSERT on
  `children` and re-granted INSERT on every column **except** `points` /
  `streak_days`, so a client can't seed a child with an arbitrary starting
  balance at creation time (audit follow-up; complements migration 017's UPDATE
  revoke).
- **`updateChild` boundary whitelist (2026-06-25):** the service filters patches
  through `pickAllowedChildUpdate` (`src/utils/childUpdate.ts`) so the app only
  ever sends client-writable columns — defense-in-depth above the DB grants.

## Static security re-audit (2026-06-23)

Re-ran the code/migration-level checks; all passed:

- `.env`, `.env.local`, `.env.*.local` are gitignored; no `service_role` key in
  app or repo (only a comment reference in migration 012).
- No hardcoded Supabase/RevenueCat secrets in `src` (the `test_…` RevenueCat key
  in `lib/revenuecat.ts` is a public Test Store key, replaced by real public
  `EXPO_PUBLIC_…` keys at build time).
- RLS enabled on all 12 tables (12 `enable row level security` for 12
  `create table`); 35 policies across them.
- Screens never import `lib/supabase` directly — all DB access goes through
  `src/services/`.
- No client-side point/streak mutation: the only `updateChild` caller writes
  cosmetic columns (`avatar_gradient`, `avatar_icon`, `age_tier_override`); points
  and streaks change only via the SECURITY DEFINER RPCs, and migration 017 revokes
  `authenticated` UPDATE on those columns at the DB grant layer.
- Startup validates `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  and throws if missing.
- Only 5 `console.*` calls, all `__DEV__`-guarded `console.warn` in
  `lib/revenuecat.ts`; none log sensitive data and all are stripped from
  production builds.

## Live advisor run (2026-06-25)

Ran the Supabase security + performance advisors against the live "Chorely App"
project (`zinbukzmkorkawbgckkh`, Postgres 17). Results matched the static audit —
no surprises:

- **Security (10 warnings, all expected):**
  - 9 × "Signed-In Users Can Execute SECURITY DEFINER Function" — the by-design
    RPC API (`approve_chore`, `submit_chore`, `reject_chore`, `redeem_reward`,
    `update_streak`, `complete_onboarding`, `join_family_by_code`,
    `delete_user_account`, `is_family_member`); each checks `is_family_member()`.
  - 1 × Leaked Password Protection Disabled — tracked below (needs Supabase Pro).
  - No missing-RLS or unexpected findings.
- **Performance (informational / minor):**
  - 2 × unindexed FK on `goals` (`created_by`, `reward_id`) — optional cheap fix.
  - ~18 × "unused index" — noise on a near-empty DB; do **not** drop, revisit
    under real traffic.
  - `profiles` has two overlapping permissive SELECT policies
    (`profiles_family_member_select` + `profiles_self_select`) — optional RLS
    consolidation, low impact.

Re-run after any DDL change and before TestFlight (Advisors tab or the Supabase
MCP `get_advisors`).

## Known advisor notes (by design)

Supabase flags `authenticated`-executable `SECURITY DEFINER` functions. These are
**intentional** — they are the app's RPC API, and each function checks
`is_family_member()` before acting. No action required.

## Open / pre-launch items

- [ ] Enable **leaked-password protection** (requires Supabase Pro).
- [ ] Re-enable **email confirmation** before TestFlight/production (currently
      OFF in dev).
- [ ] Confirm no `console.log` of sensitive data before any TestFlight build.
- [ ] Decide production vs. dev Supabase project for launch.

## Pre-commit security checklist

- [ ] No hardcoded secrets (keys, tokens, passwords).
- [ ] All user input validated (Yup schemas at form boundaries).
- [ ] RLS enabled + policy present on any new table.
- [ ] Point mutations go through an RPC, not a client `UPDATE`.
- [ ] Error messages don't leak sensitive data.
