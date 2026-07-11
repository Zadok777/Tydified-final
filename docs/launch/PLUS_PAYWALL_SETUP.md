# Tydified Plus — payment setup checklist

**Purpose:** everything needed before a real/sandbox purchase of Tydified Plus
($4.99/mo · $29.99/yr · 7-day free trial on yearly) can be tested end-to-end.
**Scan this file at session start; resume at the first unchecked box.**
Update boxes the moment a step completes.

Product IDs (use these exact strings everywhere):

| Item | Value |
|---|---|
| Subscription group (ASC) | `Tydified Plus` |
| Monthly product ID | `tydified_plus_monthly` — $4.99/mo |
| Yearly product ID | `tydified_plus_yearly` — $29.99/yr + 7-day intro free trial |
| RevenueCat entitlement | `Chorely Pro` (legacy id — the app checks this exact string) |
| RevenueCat offering | `default`, packages `$rc_monthly` / `$rc_annual` |
| RC project / apps | `projc6cead17` · iOS `appe1662ead69` · Android `app7158151842` |

## Leg 1 — Apple (Santiago, browser)

- [x] 1.1 (2026-07-10) Sign **Paid Applications agreement**: App Store Connect → Business →
      Paid Apps → accept + enter DS Santiago LLC bank account + tax forms.
      (Apple approval can take 1–2 days — start early.)
- [x] 1.2 (2026-07-10) Agreement status **Active** immediately (bank + W-9 also Active).
- [x] 1.3 (2026-07-10) Create subscription group `Tydified Plus`: Tydified app page →
      Monetization → Subscriptions → Create.
- [x] 1.4 (2026-07-10) Create `tydified_plus_monthly` in the group — duration 1 month,
      price $4.99, localization name "Tydified Plus Monthly".
- [x] 1.5 (2026-07-10) Create `tydified_plus_yearly` — duration 1 year, price $29.99,
      localization name "Tydified Plus Yearly".
- [x] 1.6 (2026-07-10) On the yearly: add **Introductory Offer** → Free trial → 7 days.
- [ ] 1.7 Both products: add review screenshot + notes later (needed only for
      App Store review, not sandbox testing).

## Leg 2 — Google (Santiago, browser; needs first Play upload done)

> **⚠️ REMINDER (2026-07-10): base plan IDs are LOCKED.** RevenueCat products
> were already created expecting exactly `monthly-autorenew` and
> `yearly-autorenew`. When creating the Play subscriptions (2.2/2.3), use those
> exact base plan IDs and paste the localized listing name/description for each
> (e.g. "Tydified Plus Monthly" / "Unlimited kids and chores") — Play won't
> save a subscription without them.

- [ ] 2.0 PREREQ: first `.aab` uploaded to Play Console internal testing
      (see RELEASE_CHECKLIST.md §6 — also starts the 12-tester/14-day clock).
- [ ] 2.1 Play Console → set up **payments profile** for DS Santiago LLC.
- [ ] 2.2 Monetize → Subscriptions → create `tydified_plus_monthly`
      ($4.99, 1 month) with a base plan id like `monthly-autorenew`.
- [ ] 2.3 Create `tydified_plus_yearly` ($29.99, 1 year) + 7-day free-trial
      offer on the yearly base plan.
- [ ] 2.4 Add tester Gmail addresses under Settings → License testing.

## Leg 3 — RevenueCat (Claude via API, except the two uploads)

- [ ] 3.1 Santiago: ASC → Users and Access → Integrations → In-App Purchase →
      generate an **In-App Purchase key** (.p8) → upload it in RevenueCat →
      Tydified iOS app settings (needed for RC to validate receipts).
- [ ] 3.2 Santiago: Google Cloud service account JSON with Play access →
      upload in RevenueCat → Tydified Android app settings.
      (RC dashboard → app → Service account credentials shows the wizard.)
- [x] 3.3 (2026-07-10) Claude: create products `tydified_plus_monthly` / `tydified_plus_yearly`
      on both RC apps (API v2).
- [x] 3.4 (2026-07-10) Claude: attach both products to entitlement `Chorely Pro`.
- [x] 3.5 (2026-07-10) Claude: ensure offering `default` has `$rc_monthly` / `$rc_annual`
      packages pointing at the store products.
- [ ] 3.6 Rebuild + TestFlight/Play — paywall should now show live plans with
      the 7-day trial badge on yearly.

## Leg 4 — Sandbox purchase test (both of us)

- [ ] 4.1 iPhone/TestFlight: buy monthly, verify Plus unlocks (unlimited
      kids/chores), Restore Purchases works, plan-switch UI shows.
- [ ] 4.2 iPhone: buy yearly, verify 7-day trial copy appeared pre-purchase.
- [ ] 4.3 Android via Play internal testing (NOT the direct APK link):
      license-tester purchase, same checks.
- [ ] 4.4 Cancel/expire in sandbox, verify app returns to free tier.
