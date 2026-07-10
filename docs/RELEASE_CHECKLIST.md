# Release Checklist

Steps to ship Tydified to the App Store and Google Play. Cross-reference:
TASKS.md (Phase 10), [docs/store/](./store/), [docs/launch/](./launch/),
[docs/legal/](./legal/), and [SECURITY.md](./SECURITY.md).

## 1. Backend hardening

- [ ] Decide production vs. dev Supabase project for launch.
- [ ] Re-enable **email confirmation** (currently OFF in dev).
- [ ] Enable **leaked-password protection** (requires Supabase Pro).
- [x] Re-run security + performance advisors (2026-06-25); only by-design
      warnings + the tracked leaked-password item. See SECURITY.md.
- [ ] Verify RLS on every table; confirm cross-family isolation.

## 2. App configuration

- [ ] Replace placeholder app icons / splash with final assets.
- [ ] Confirm `app.json` (name, slug, bundle id, version, build number).
- [ ] Android adaptive icon assets present.
- [ ] Remove any `console.log` before building.
- [ ] `npx tsc --noEmit` clean; `npm test` green.

## 3. Payments (RevenueCat)

- [ ] Create App Store Connect + Play Console IAP products.
- [ ] Build a **dev/EAS build** (IAP doesn't work in Expo Go / Simulator).
- [x] Build the custom paywall screen; verify entitlement string `Chorely Pro`.
- [x] Keep monthly/yearly plan choices visible for existing Plus users so they
      can switch plans later through the store purchase flow.
- [x] Paywall shows a free-trial badge + trial-aware CTA/disclosure when a
      store-configured introductory free trial exists (driven by RevenueCat
      `introPrice`; no app-side trial timer).
- [ ] Configure the **7-day intro trial on yearly** in App Store Connect /
      Google Play / RevenueCat, then verify the trial copy appears in a build.
- [ ] Run a **sandbox purchase test** end-to-end.
- [x] Confirm free-tier limits (1 child / 4 active chores per child) + the
      feature-flag fallback.

## 4. Legal & privacy

- [ ] Fill placeholders in [legal/](./legal/) (entity, address, contact, URLs).
- [ ] Host the privacy policy publicly; add the URL in-app.
- [ ] Complete **App Store App Privacy** + **Play Data Safety** forms
      (see [store/app-privacy-and-data-safety.md](./store/app-privacy-and-data-safety.md)).
- [ ] Audience set to **18+** (not Kids/Families).

## 5. Store listings

- [ ] App name, subtitle, description, keywords
      (see [store/store-listing-copy.md](./store/store-listing-copy.md)).
- [ ] Screenshots for required device sizes.
- [ ] Support URL + marketing URL.

## 6. Accounts & submission

- [ ] Apple Developer Program enrollment + app record.
- [ ] Google Play Console + app record.
- [ ] EAS production build (iOS + Android).
- [ ] TestFlight internal test pass.
- [ ] Google closed testing (12 testers / 14 days) if required for the account.
- [ ] Submit for review.

## 7. Post-launch

- [ ] Monitor crash/error reporting.
- [ ] Watch Supabase usage; upgrade plan as growth justifies.
- [ ] Triage reviews; queue v1.1 (child PIN auth + kid screens).
