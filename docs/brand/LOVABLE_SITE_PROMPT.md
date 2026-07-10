# Lovable prompt — Tydified marketing/legal site

Self-contained prompt for the Lovable-built app site (required for App Store /
Play submission). Paste the block below into Lovable; upload the two assets
listed first. Keep this file updated when brand facts change (CLAUDE.md rule).

**Upload to Lovable before/with the prompt:**
- `assets/brand/tydified-lockup-transparent.png` (header/hero logo)
- `assets/icon.png` (favicon / app-icon imagery)

---

## PASTE FROM HERE

Build a polished, mobile-first marketing + legal site for **Tydified**, a family
chore & rewards iOS/Android app. Most visitors arrive on phones from the App
Store listing — readable text and large tap targets are non-negotiable.

### Brand
- Name: **Tydified** (always one word, capital T). Logo: use the uploaded
  transparent lockup in the header and hero; never recolor, stretch, or re-set
  the wordmark in another font. Keep clear space around it.
- Tagline: **Do chores. Earn points. Unlock rewards. Level up!**
- Voice: warm, playful, parent-to-parent plain English. Celebrates kids, never
  nags. No religious references.
- Fonts (Google Fonts): **Nunito ExtraBold/Bold** for headlines, **DM Sans**
  for body text.
- Colors:
  - Tydi Blue `#14B0FE` — primary accent, buttons, links (on white text use
    the darker `#0059AE` for accessibility)
  - Trophy Amber `#FEAA01` (text-safe variant `#A36A00`)
  - Tagline Green `#60DB01` (text-safe `#3D9800`)
  - Brand Navy `#00001B` — headings, footer background
  - Celebration accents (sparingly): pink `#FC5499`, purple `#B353FC`
  - Canvas: warm near-white (e.g. `#FCFBF9`), solid surfaces, hairline borders,
    soft shadows, generously rounded corners (kid-warm but calm — the parents
    are the audience)
- Never use the bright blue/amber/green as small body text on white — use the
  text-safe variants.

### Pages (exact routes)
1. `/` — Landing:
   - Hero: lockup, one-line pitch "Turn everyday chores into points, rewards,
     and better routines — you stay in control.", App Store + Google Play badge
     placeholders.
   - "How it works" — 5 friendly steps: 1) Create your family and add your
     kids 2) Create chores and set point values 3) Approve completed chores
     with a tap 4) Kids redeem points for rewards you choose 5) Streaks and
     savings goals keep them motivated.
   - Feature trio: "You're always in control" / "Real motivation — points,
     streaks & goals" / "Safe by design — kids never sign in or enter personal
     info. No ads. No third-party tracking."
   - Pricing strip: **Free to start** (1 child, 4 active chores per child) ·
     **Tydified Plus** — unlimited kids & chores, $4.99/month or $29.99/year
     (7-day free trial on yearly), cancel anytime in your App Store / Play
     account settings.
   - FAQ (accordion): Is Tydified safe for kids? (parent-managed, COPPA-aware,
     children are profiles not accounts) · What does Plus include? · How do I
     cancel? (through Apple/Google account settings) · Can teens log in?
     (coming later — today parents run everything) · How do I delete my
     account? (in-app: More → Delete account — removes all family data).
   - Footer: logo, links to all legal pages, support email, © DS Santiago LLC.
2. `/privacy` — Privacy Policy (COPPA-aware; I will paste the full text).
3. `/terms` — Terms of Use (I will paste the full text).
4. `/support` — Support: email doulosnexus@gmail.com (mailto button), short FAQ
   echo, promise of a reply within a few business days.
5. `/delete-account` — How to delete your account: open Tydified → More tab →
   Delete account → confirm. Explains it permanently removes family, children,
   chores, rewards, and history; subscriptions are canceled separately in
   Apple/Google account settings. Contact email as fallback.
6. `/data-safety` — plain-English summary of what the app stores (parent email
   + name; child first name + optional birthday only; no ads, no tracking, no
   selling data; data stored with Supabase; payments handled by Apple/Google
   via RevenueCat — Tydified never sees card numbers).

### Business facts (footer/legal)
- Entity: **DS Santiago LLC (d/b/a Doulos Nexus)**, 2780 E. Fowler Ave #421,
  Tampa, FL 33612, USA
- Support email: **doulosnexus@gmail.com**
- App audience/rating: adults 18+ manage it (not a "kids app" listing)
- Governing law: Florida

### Subscription disclosure (must appear on the landing pricing section)
"Tydified Plus is an auto-renewable subscription billed through your Apple or
Google account. It renews automatically unless canceled at least 24 hours
before the end of the current period. Manage or cancel anytime in your device's
account settings."

### SEO/meta
Title: "Tydified — Family chores, points & rewards". Description: "Turn chores
into points and rewards. Parents stay in control, kids stay motivated. Free to
start on iPhone and Android." Favicon from the uploaded app icon. Open Graph
image: the lockup on warm near-white.

## PASTE TO HERE

---

**After Lovable generates:** paste the real privacy/terms text from
`docs/legal/privacy-policy.md` and `docs/legal/terms-of-use.md` (fill their
placeholder fields first), then record the live site URL here and in
docs/launch/PLUS_PAYWALL_SETUP.md — the privacy URL is required in App Store
Connect App Privacy and Play Data Safety.

- [ ] Live site URL: ____________
- [ ] Privacy policy URL added to ASC + Play forms
