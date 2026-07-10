# Tydified — Beta Deployment Guide (TestFlight + Google Play Testing)

Written for a non-developer. Read top to bottom. You do **not** need a Mac or Xcode — Tydified is an **Expo** app, so we build in the cloud with a tool called **EAS** (Expo Application Services). Think of EAS as a robot that takes your code and produces the installable app files for Apple and Google.

**Your app's identity (already set):**
- App name: **Tydified**
- iOS Bundle ID: `com.zad0k777.tydified`
- Android package: `com.zad0k777.tydified`
- Expo owner/account: `zad0k777`
- Version: `1.0.0`

---

## PHASE 1 — Pre-Launch Audit (pass/fail)

Based on a real review of your current code.

| Area | Status | What it means / what to do |
|---|---|---|
| Authentication | ✅ PASS | Email + password sign-in works; the app remembers you after closing. |
| Login | ✅ PASS | Login screen validates input. |
| Registration | ⚠️ FIX FIRST | Sign-up works, but **email confirmation is turned OFF** in the database. Turn it ON before real testers (so people verify their email). |
| **Password Reset** | ✅ PASS | "Forgot password?" and reset-code screens are present. |
| User Profiles | ✅ PASS | Parent + child profiles, avatars, age-group editing. |
| Navigation | ✅ PASS | Tabs + screens work. |
| Database Connections | ✅ PASS | Supabase connected; row-level security on. (Re-enable email confirmation; optionally move to a dedicated production project.) |
| Push Notifications | ⬜ N/A | Not built (planned for v1.1). Fine for beta — just declare "no notifications." |
| Subscription Features | ⚠️ TESTING NEEDED | RevenueCat is wired and the custom Tydified Plus paywall exists. Real App Store / Play products still need to be created and tested in a real build. |
| Premium Features (limits) | ✅ CODED | Free-tier gates are implemented: 1 child and 4 active chores per child unless the `Chorely Pro` entitlement is active. Verify manually in QA. |
| Offline Functionality | ⚠️ LIMITED | App needs internet (it's normal for this kind of app). It remembers your login offline but needs a connection to load data. Acceptable for beta. |
| Error Handling | ✅ PASS (basic) | Friendly error messages appear; no crash-reporting tool yet (optional: add Sentry later to see crashes testers hit). |
| Privacy Compliance | ⚠️ FIX FIRST | Legal pages are written but **not yet published online**. Apple & Google require a public **Privacy Policy URL**. Host the pages (see Phase 5). |

### Must-fix before inviting testers
1. **Re-enable email confirmation** in Supabase.
2. **Host the legal pages** and get public Terms + Privacy URLs.
3. **Create App Store / Play in-app-purchase products** and connect them in RevenueCat.
4. **Run a real-device sandbox purchase + restore test.**

### Safe to defer for the first beta
- Full monetized beta, if store products are not approved yet (the app can still be tested free).
- Push notifications.
- Crash reporting (nice to have).

---

## One-time setup: EAS (do this once)

This is how you'll build the app without a Mac. You (or Claude on your behalf) run these in the Terminal **once**:

1. Make sure you have a free **Expo account** at https://expo.dev (the username is already `zad0k777` — sign in or create it).
2. In Terminal, from the project folder:
   ```
   npx eas login
   npx eas build:configure
   ```
   - `eas login` asks for your Expo email/password.
   - `build:configure` confirms your `eas.json` (already present).

You'll use `eas build` and `eas submit` in the phases below.

---

## PHASE 2 — Apple TestFlight

### 2.1 Create an Apple Developer Account
1. Go to https://developer.apple.com/programs/enroll
2. Sign in with your Apple ID (or create one).
3. Enroll as an **Individual** or **Organization**. Cost: **$99/year**.
   - Organization needs a D-U-N-S number (free, can take days). **Individual is faster** — choose Individual unless you specifically need the company name shown as the seller.
4. Wait for approval email (usually 24–48 hours).
- **Avoid:** using a personal Apple ID you share with family devices; make a dedicated one if possible.

### 2.2 Create the App in App Store Connect
1. Go to https://appstoreconnect.apple.com → **My Apps** → **+** → **New App**.
2. Fill in:
   - Platform: **iOS**
   - Name: **Tydified** (must be unique across the App Store — if taken, try "Tydified: Chores & Rewards")
   - Primary language: **English (U.S.)**
   - Bundle ID: choose **com.zad0k777.tydified** (see 2.3 if it's not listed)
   - SKU: any text, e.g. `tydified-001`
   - User Access: Full Access
3. Click **Create**.

### 2.3 Create the Bundle Identifier (if not already there)
1. https://developer.apple.com/account → **Certificates, IDs & Profiles** → **Identifiers** → **+**
2. Select **App IDs** → **App** → Continue.
3. Description: `Tydified`. Bundle ID: **Explicit** → `com.zad0k777.tydified`.
4. Capabilities: leave defaults (you don't need special ones for v1.0). Register.

### 2.4 Certificates & Signing — **let EAS do it**
You do **not** need to make certificates by hand. When you run the build, EAS asks to manage signing for you — **say yes**.
```
npx eas build --platform ios --profile production
```
- When prompted "Generate a new Apple Distribution Certificate?" → **Yes**.
- Log in with your Apple Developer account when asked.
- EAS creates the certificate + provisioning profile automatically and stores them.

### 2.5 App Icons & Splash Screen — already done ✅
Your app icon and splash screen are already configured (`assets/`). EAS bakes them into the build. Nothing to do unless you want to change the art.

### 2.6 Upload the Build to TestFlight
Easiest path — EAS submits for you:
```
npx eas submit --platform ios --profile production --latest
```
- It asks for your **Apple ID**, **app-specific password** (create one at https://appleid.apple.com → Sign-In & Security → App-Specific Passwords), and your **Team ID** (shown in your Apple Developer account).
- These can also be saved in `eas.json` under `submit.production.ios` (the fields `appleId`, `ascAppId`, `appleTeamId` are currently blank — fill them once).
- After upload, the build appears in **App Store Connect → TestFlight** after ~5–15 min of Apple "processing."

### 2.7 Internal Testing (fastest — no Apple review)
1. App Store Connect → your app → **TestFlight** tab.
2. Under **Internal Testing**, create a group, add testers by **Apple ID email** (must be users in your App Store Connect team; up to 100).
3. Internal builds are available **immediately** — no review.

### 2.8 External Testing (for friends/family beta)
1. TestFlight → **External Testing** → create a group (e.g. "Beta Testers").
2. Add testers by email (up to **10,000**), OR enable a **Public Link**.
3. Provide **"What to test"** notes + a **Beta App Description**.
4. The **first** external build needs a quick **Beta App Review** (usually < 24h). Later builds are faster.

### 2.9 Public TestFlight Link
- In the External group, toggle **Public Link** → copy the URL → share it. Anyone with the link + the free **TestFlight** app can install Tydified.

### 2.10 Common rejection reasons (and fixes)
| Reason | Fix |
|---|---|
| No privacy policy URL | Host your privacy page; add the URL (Phase 5). |
| Account-based app with no demo login | Give Apple a **test email + password** + steps in "App Review notes." |
| Account deletion missing | You have it (More → Delete account) — mention it in notes. |
| Crashes on launch | Test the build on a real iPhone first via TestFlight Internal. |
| Subscriptions unclear | If you ship a paywall, disclose price/renewal clearly + add Restore Purchases. (Not an issue if beta is free.) |
| Placeholder/incomplete content | Make sure no "coming soon" stubs remain in the build. |

---

## PHASE 3 — Google Play Testing

### 3.1 Create a Google Play Developer Account
1. https://play.google.com/console/signup
2. Sign in with a Google account (recommend **doulosnexus@gmail.com**).
3. Choose **Organization** (your LLC) or **Personal**. Cost: **$25 one-time**.
4. Verify identity (ID + possibly address). Can take 1–3 days.
- ⚠️ **Important timeline rule:** brand-new **personal** Google Play accounts created after Nov 2023 must run a **closed test with at least 12 testers for 14 continuous days** before you can publish to production. **Start your closed test early.** (An Organization/business account may be exempt — choose Organization with your LLC if you can.)

### 3.2 Create the App Listing
1. Play Console → **Create app**.
2. Enter: App name **Tydified**, default language **English (US)**, app type **App**, **Free**.
3. Accept declarations → **Create app**.

### 3.3 Build the Android File (AAB) with EAS
```
npx eas build --platform android --profile production
```
- EAS produces an **.aab** file (Android App Bundle — the format Google wants) and manages signing automatically.

### 3.4 Upload the AAB
Easiest — EAS submits for you (first time, you'll set up a Google service account key; EAS walks you through it):
```
npx eas submit --platform android --profile production --latest
```
Or upload manually: Play Console → your app → **Testing → Internal testing → Create new release → Upload** the .aab.

### 3.5 Internal Testing Track (fastest)
1. Play Console → **Testing → Internal testing**.
2. **Create new release** → add the .aab → **Save → Review release → Start rollout**.
3. Available to your internal testers within minutes.

### 3.6 Closed Testing Track (the 12-tester / 14-day requirement)
1. **Testing → Closed testing** → create a track (e.g. "Beta").
2. Add testers (see 3.8). You need **≥12 testers opted in for 14 days** if your account requires it.
3. Create release → upload .aab → roll out.

### 3.7 Open Testing Track (public)
- **Testing → Open testing** → anyone with the link can join. Use later, once closed testing looks good.

### 3.8 Add Testers / Create Groups / Invitations
1. In a track → **Testers** tab → **Create email list** → paste tester emails (or a Google Group).
2. Save → copy the **join link** (e.g. `https://play.google.com/apps/internaltest/....`).
3. Send the link to testers. They tap it, accept, then install from the Play Store.
- **Avoid:** expecting testers to find the app by searching — they **must** use the opt-in link.

### 3.9 Publish the Beta Build
- After rollout on a testing track, the build is live to that track's testers. Production release comes later (Phase 6).

---

## PHASE 5 — App Store Readiness (final content checklist)

| Item | Status | Action |
|---|---|---|
| Screenshots | ⬜ TODO | See "Screenshots needed" below. |
| Privacy Policy | ✅ written / ⬜ host | Publish `docs/legal/privacy-policy.md`; use its URL. |
| Terms of Service | ✅ written / ⬜ host | Publish `docs/legal/terms-of-use.md`. |
| Support Website | ✅ written / ⬜ host | Publish `docs/legal/support.md`. |
| Contact Email | ✅ | doulosnexus@gmail.com |
| App Description | ✅ ready | In `docs/store/store-listing-copy.md`. |
| Keywords | ✅ ready | Same file (Apple keyword string). |
| Categories | ✅ decided | Apple: Lifestyle/Productivity. Google: Parenting. |
| Age Rating | ✅ guidance | Answer questionnaires honestly → 4+ / Everyone. |
| Permissions | ✅ minimal | No camera/location/contacts/mic in v1.0. |
| Analytics | ⬜ none | None installed. Optional later. |

### Screenshots needed (exact)
Take these on the iOS Simulator / an Android emulator (or real devices). Show **real app screens**, no placeholders:
1. **Home / dashboard** (the snapshot tiles + quick actions)
2. **Chores** (a list with a chore or two)
3. **Approve a chore** (the approval modal)
4. **Rewards** (the reward catalog)
5. **Family** (kid cards with points)

**Apple sizes (required):**
- 6.7" iPhone (e.g. iPhone 15 Pro Max) — **1290 × 2796** px — *required*
- 6.5" iPhone (e.g. iPhone 11 Pro Max) — **1242 × 2688** px — *recommended*
Provide **3–10** screenshots.

**Google Play:**
- Phone screenshots: **at least 2** (4+ recommended), min 1080 px on the short side.
- **Feature graphic:** **1024 × 500** px (a banner — required).
- App icon: **512 × 512** px PNG.

*(Ask Claude to capture these from the Simulator once a build is running.)*

---

## PHASE 6 — Launch Readiness (Go / No-Go)

Mark each line. **All "Go" in a section = you may proceed.**

### ✅ Ready for TestFlight (internal)
- [ ] Apple Developer account active
- [ ] App created in App Store Connect
- [ ] Production build uploaded via EAS
- [ ] App launches + core flow works on a real iPhone
- [ ] "Forgot password" added; email confirmation re-enabled
- [ ] Test account + review notes prepared

### ✅ Ready for Google Closed Testing
- [ ] Play Developer account active
- [ ] App listing created
- [ ] AAB uploaded to a testing track
- [ ] ≥12 testers lined up (if your account needs it) — start the 14-day clock
- [ ] App launches + core flow works on a real Android phone

### ✅ Ready for App Store Submission (public)
- [ ] Privacy Policy + Support URLs live
- [ ] App Privacy form completed (`docs/store/app-privacy-and-data-safety.md`)
- [ ] Screenshots uploaded
- [ ] Description/keywords/category set
- [ ] Age rating completed
- [ ] If monetized: paywall built, IAP products approved, Restore Purchases works, tested in sandbox
- [ ] Beta feedback addressed; no known crashes

### ✅ Ready for Google Play Production
- [ ] Data Safety form completed
- [ ] Closed testing requirement satisfied (12 testers / 14 days, if applicable)
- [ ] Store listing complete (feature graphic, screenshots, description)
- [ ] Content rating questionnaire done
- [ ] Beta feedback addressed; no known crashes

---

## Suggested timeline

| Week | Focus |
|---|---|
| **Week 1** | Create Apple + Google accounts (approvals take days). Add "Forgot password," re-enable email confirmation, host legal pages. |
| **Week 2** | First EAS builds → TestFlight Internal + Play Internal. Fix launch bugs on real devices. Capture screenshots. |
| **Week 3** | TestFlight External + Play Closed test (start the 12-tester / 14-day clock now). Collect feedback. |
| **Week 4** | Address feedback. (If monetizing) build + test the paywall. Prep store listings. |
| **Week 5+** | Submit to App Store review + finish Google closed-test window → production. |

---

## What to ask Claude to do for you (it can do these)
- Build the **"Forgot password"** screen + flow (recommended before beta).
- Run the **EAS build/submit** commands and fill `eas.json` submit fields.
- **Capture screenshots** from the Simulator.
- **Re-check** everything green before each submission.
- Help **host the legal pages** (e.g., GitHub Pages or the Required Site).
