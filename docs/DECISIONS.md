# Decisions

> The authoritative Decisions Log is **CLAUDE.md §13** (kept inline so it loads
> with the rules each session). This file mirrors the key architectural
> decisions for quick reference and links back. Record new decisions in
> CLAUDE.md §13 first, then summarize here if notable.

| Date | Decision | Why |
|---|---|---|
| 2026-07-07 | Rebranded Chorely → **Tydified**: name, tagline, exact logo-lockup palette, trophy app icon, bundle id `com.zad0k777.tydified`; RevenueCat entitlement id stays `Chorely Pro` and Supabase project display name stays "Chorely App" until renamed in dashboards | Original name/concept believed copied; features unchanged (branch `rebrand/tydified`) |
| 2026-06-23 | Tighten free tier to 1 child / 4 active chores per child; if using a trial, prefer 7 days on yearly only | Lets a parent test the app while pushing normal multi-child families toward Plus and favoring annual conversion |
| 2026-06-23 | Use a custom in-app Tydified Plus paywall instead of RevenueCat's prebuilt dashboard paywall | Keeps Lumina Bloom styling, store disclosure, Restore Purchases, and free-tier gate behavior in code |
| 2026-06-23 | Migrated backend to new Supabase project `zinbukzmkorkawbgckkh` ("Chorely App", personal account) + new repo `Chorely-final`; retired the previous project/repo | Lost access to the old project; consolidating under the personal account |
| 2026-06-01 | One paid tier "Tydified Plus" (monthly $4.99 / yearly $29.99, same features); entitlement id `Chorely Pro` | Store-standard model; avoids reviewer/user confusion |
| 2026-06-01 | Age/grade tiers **suggest, never restrict**; derived from DOB with optional per-child override | Keeps parent freedom while tailoring suggestions |
| 2026-05-29 | Parent nav = Home / Review / Chores / Family / More (rewards pushed from More) | Match the Lumina Bloom prototype |
| 2026-05-29 | `goals` table for per-child savings goals (no new RPC; family-member RLS) | Functional replacement for the "coming soon" stub |
| 2026-05-28 | Full dark mode via themed palette + `useThemedStyles` | User-requested; light stays default |
| 2026-05-28 | Adopt Expo SDK 54 (RN 0.81 / React 19 / Reanimated 4) | Came from `expo install --fix` and runs cleanly; bump together going forward |
| — | Expo Managed Workflow (no eject) | Faster builds, no native module conflicts for v1 |
| — | RevenueCat over Stripe for IAP | Apple/Google require native IAP |
| — | Zustand over Redux | Lower boilerplate for this app's state |
| — | Server-side RPCs for all point mutations | Prevents client race conditions; auditable via `point_transactions` |
| — | Child PIN auth deferred to v1.1 | COPPA; no email for under-13; out of v1.0 scope |
| — | Light-mode glassmorphism ("Lumina Bloom") | Intentional brand aesthetic |

See CLAUDE.md §13 for the full, continuously-updated log.
