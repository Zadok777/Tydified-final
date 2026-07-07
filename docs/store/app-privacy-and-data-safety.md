# Tydified — App Store App Privacy + Google Play Data Safety answers

Fill these into App Store Connect (**App Privacy**) and Google Play Console (**Data safety**) at submission. Derived from `docs/legal/privacy-policy.md`. **Keep all three in sync** — reviewers compare them.

> ⚠️ These answers assume the **current** build: no third-party analytics, no crash-reporting SDK, no ads/tracking SDKs, parent-only auth, children are records (name + optional DOB only). **If you later add analytics or crash reporting (e.g. Sentry, Firebase), you must update these.**

---

## Key framing (read first)

- **Target audience: adults (parents/guardians), 18+.** Children do **not** use the app directly. Do **not** enroll in Apple's Kids Category or Google's "Designed for Families" program — Tydified is a parent productivity tool. (You still answer COPPA-style questions honestly; you just aren't a child-directed app.)
- **No tracking / no ads.** No data is used to track users across apps or for advertising. Apple "Data used to Track You" = **None**.
- **Service providers ≠ "sharing."** Supabase and RevenueCat process data **on our behalf** as service providers. Under both Apple's and Google's definitions this is **collection**, not third-party **sharing/selling**. So "shared with third parties" = **No**.
- **Payments:** card/payment details are handled entirely by Apple/Google — we never see them, so we don't declare payment info. We do hold **subscription status**.

---

## A. Apple — App Store Connect "App Privacy"

For each type Apple asks: *Linked to the user?* and *Used for tracking?* For us: everything is **Linked = Yes**, **Tracking = No**, and **Purpose = App Functionality** (plus Account Management where noted).

### Data Used to Track You
**None.**

### Data Linked to You
| Apple data type | Collected? | Purpose | Linked | Tracking |
|---|---|---|---|---|
| **Contact Info → Name** (parent name) | Yes | App Functionality | Yes | No |
| **Contact Info → Email Address** (parent login) | Yes | App Functionality | Yes | No |
| **User Content → Other User Content** (family name, child name + optional DOB, chores, rewards, points, goals, activity) | Yes | App Functionality | Yes | No |
| **Identifiers → User ID** (account ID used by Supabase/RevenueCat) | Yes | App Functionality | Yes | No |
| **Purchases → Purchase History** (Tydified Plus subscription status) | Yes | App Functionality | Yes | No |

### Data Not Linked to You
**None.** (We don't collect anonymous analytics/diagnostics in the current build.)

### Other App Privacy answers
- **Do you collect data?** Yes.
- **Diagnostics / Crash data?** **No** (no crash SDK currently — change if you add one).
- **Used for Third-Party Advertising / Developer's Advertising / Analytics / Product Personalization?** **No** to all. Only **App Functionality** (and account management).
- **Privacy Policy URL:** _[your hosted privacy-policy URL]_

---

## B. Google — Play Console "Data safety"

### Top-level questions
- **Does your app collect or share any required user data?** **Yes** (collects).
- **Is all of the user data collected by your app encrypted in transit?** **Yes** (HTTPS/TLS to Supabase).
- **Do you provide a way for users to request that their data be deleted?** **Yes** — in-app (More → Delete account) and by email. Provide the account-deletion URL.
- **Has your app been independently validated against a security standard?** Optional — leave unset unless you've done one.

### Data types — Collected (not shared; processed on secure servers, not ephemeral)
| Google data type | Collected | Shared | Required/Optional | Purpose |
|---|---|---|---|---|
| **Personal info → Name** | Yes | No | Required | App functionality, Account management |
| **Personal info → Email address** | Yes | No | Required | App functionality, Account management |
| **Personal info → User IDs** | Yes | No | Required | App functionality |
| **Personal info → Other info** (child name + optional date of birth) | Yes | No | Required | App functionality |
| **App activity → Other user-generated content** (chores, rewards, points, goals, activity) | Yes | No | Required | App functionality |
| **Financial info → Purchase history** (Tydified Plus subscription status) | Yes | No | Optional | App functionality |

### Data types — NOT collected (declare as not collected)
- Location (precise or approximate), Contacts, Photos/Videos, Audio, Calendar, Health/Fitness, Web browsing, Installed apps.
- App activity → App interactions / in-app search / **analytics** — **not collected** (no analytics SDK).
- App info & performance → **Crash logs / Diagnostics** — **not collected** (no crash SDK).
- Device or other identifiers (advertising ID) — **not collected**.

### Notes for the Google form
- For each collected type Google asks "Is this data **shared**?" → **No** for all (service providers acting on your behalf are not "sharing").
- "Is this data **processed ephemerally**?" → **No** (it's stored to run the app).
- "Is collection **required** or can users choose?" → Account/email/name and core content are **Required** to use the app; subscription is **Optional**.

---

## C. Content rating / target audience (related forms)

- **Google "Target audience and content":** select an **adult** age band (18+) — Tydified is parent-facing. Do **not** declare children as a target audience (avoids Families policy obligations the app isn't designed for).
- **Google content rating questionnaire (IARC):** answer honestly — no violence, no user-to-user open communication, no ads, no gambling. Should land at **Everyone**.
- **Apple age rating:** answer the questionnaire honestly (no objectionable content) → typically **4+**. Position Tydified as a **parent/family productivity** app, **not** Kids Category.

---

## D. When to revisit
Update all three (Apple App Privacy, Google Data Safety, and the privacy policy) if you add: analytics, crash reporting, push notifications (device token), photo upload, child sign-in/PIN (v1.1), or any new third-party SDK that touches user data.
