# DESIGN.md — Chorely Visual System

> **Append-only:** Whenever you discover a new design token, rule, or anti-pattern during the project, add it to the correct section below. CLAUDE.md never duplicates design content — this file is the single source of truth for the visual system.

---

## 1. Brand

The visual design follows the **Lumina Bloom** design system: pink, orange, and green on a light lavender background with intentional glassmorphism.

### Brand Logo

The Chorely logo is a rounded-square smiley face with a pink→orange gradient border, and a "Chorely" wordmark in pink below. Logo components live in `src/components/brand/`:

- `ChorelyLogo` — three variants: `full` (stacked icon + wordmark), `horizontal` (inline), `icon` (smiley only)
- `ChorelyIcon` — standalone smiley-square icon

The wordmark uses **Nunito ExtraBold** (`@expo-google-fonts/nunito`).

---

## 2. Color Tokens

Authored in hex for React Native compatibility. Values are perceptually balanced — do not introduce a new hue without recording it here first.

> Updated 2026-07-02 to match the §12 Calm & Refined refresh (teal accent, solid surfaces, warm near-white canvas). `tokens.ts` is the executable source; dark-mode values live in `darkC` there.

```ts
// Brand palette (light)
pink:       '#0EA5A4'   // PRIMARY ACCENT (teal) — CTAs, active nav, progress fills. Token key kept as `pink` (§12).
pinkText:   '#0B807F'   // Darker teal for accent-colored TEXT on light surfaces (#0EA5A4 is ~2.9:1 on white — fills/icons only)
orange:     '#FF8C42'   // Points / reward energy ONLY
green:      '#00A92A'   // Success ONLY — completed/approved states
bg:         '#FAF9FB'   // Warm near-white canvas, every screen

// Text
textDark:   '#22222B'   // Headings, primary body
textMid:    '#6B6B80'   // Secondary text, captions
textLight:  '#A8A8B8'   // Placeholder, muted labels
textWhite:  '#FFFFFF'   // Text on colored/gradient backgrounds

// Surfaces — SOLID with a hairline border, not frosted glass (§12)
glass:      '#FFFFFF'                  // Primary card surface (name is historical)
glassLight: '#F3F1F7'                  // Recessed / subtle container
border:     'rgba(24, 20, 40, 0.06)'   // Hairline for definition on near-white
borderPink: 'rgba(14, 165, 164, 0.32)' // Active/selected card borders (teal)

// Tinted alphas (teal-based)
pinkAlpha15:  'rgba(14, 165, 164, 0.15)'
pinkAlpha10:  'rgba(14, 165, 164, 0.10)'
orangeAlpha15:'rgba(255, 140, 66, 0.15)'
orangeAlpha10:'rgba(255, 140, 66, 0.10)'
greenAlpha15: 'rgba(0, 169, 42, 0.15)'
greenAlpha20: 'rgba(0, 169, 42, 0.20)'
mutedAlpha20: 'rgba(168, 168, 184, 0.20)'
redAlpha15:   'rgba(220, 38, 38, 0.15)'
```

**Accent-text rule:** any teal-colored *text* (ghost buttons, active tab labels, selected chips, the invite code, greeting name) uses `pinkText`, never `pink`. `pink` stays for fills, icons, and borders where 3:1 suffices.

---

## 3. Avatar Gradients

Five gradient pairs cycled for family members, in fixed order so the same child always gets the same gradient. One cohesive **warm family** (§12) — not a multi-hue rainbow.

```ts
['#FF8C42', '#FF4D8D']   // Peach → Pink    (child 1)
['#FF6F91', '#FF4D8D']   // Rose  → Pink    (child 2)
['#FFB36B', '#FF7A59']   // Amber → Coral   (child 3)
['#FF9472', '#FF5C8A']   // Coral → Rose    (child 4)
['#FFC04D', '#FF8C42']   // Gold  → Orange  (child 5)
```

---

## 4. Border Radius Scale

```ts
r8:    8     // Inner chips, small badges
r10:   10    // Small pill badges
r12:   12    // Compact buttons, toggle tracks
r14:   14    // Inputs, medium buttons
r16:   16    // Section headers
r18:   18    // Standard cards
r20:   20    // Large reward cards
r24:   24    // Hero cards, bottom navigation
rFull: 9999  // Avatars, pill labels
```

---

## 5. Shadows

Softened in the §12 refresh — premium = small, soft, low-opacity.

```ts
shadowSm:   { offset: { width: 0, height: 1 },  radius: 4,  opacity: 0.06 }                 // Subtle elevation
shadowMd:   { offset: { width: 0, height: 4 },  radius: 12, opacity: 0.05 }                 // Standard cards
shadowLg:   { offset: { width: 0, height: 8 },  radius: 24, opacity: 0.07 }                 // Prominent cards
shadow2xl:  { offset: { width: 0, height: 16 }, radius: 48, opacity: 0.16 }                 // Modals, bottom nav
shadowPink: { offset: { width: 0, height: 4 },  radius: 12, opacity: 0.16, color: C.pink }  // Primary buttons (teal glow)
```

---

## 6. Spacing (8-pt scale)

```
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 px
```

- Standard screen padding: **16px horizontal**, **24px between sections**
- Inside a card: **16px padding**
- Between sibling cards: **12px gap**

---

## 7. Typography

Font families: **Nunito** for headlines, **DM Sans** for body. Loaded via `@expo-google-fonts/nunito` + `@expo-google-fonts/dm-sans` (already in App.tsx).

```ts
// Variants loaded in App.tsx
Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold
DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold

// Type scale
display:  { fontFamily: 'Nunito_800ExtraBold', fontSize: 42, letterSpacing: -1.4 }
headline: { fontFamily: 'Nunito_800ExtraBold', fontSize: 30, letterSpacing: -0.8 }
title:    { fontFamily: 'Nunito_700Bold',      fontSize: 20, letterSpacing: -0.4 }
body:     { fontFamily: 'DMSans_400Regular',   fontSize: 15 }
caption:  { fontFamily: 'DMSans_500Medium',    fontSize: 12, letterSpacing: 0.1 }
button:   { fontFamily: 'DMSans_700Bold',      fontSize: 15, letterSpacing: -0.1 }
label:    { fontFamily: 'DMSans_700Bold',      fontSize: 11, letterSpacing: 1.1, uppercase }  // Micro stat captions (§12)
heroNum:  { fontFamily: 'Nunito_800ExtraBold', fontSize: 52, letterSpacing: -1.8, fontVariant: ['tabular-nums'] }
```

`heroNum` uses tabular figures so `useCountUp` numbers don't jitter horizontally while ticking.

App-wide accessibility cap: `maxFontSizeMultiplier: 1.5` on `Text` and `TextInput` (set in App.tsx).

---

## 8. Age-Bracket Theme Overrides

Each child's age bracket is derived from `date_of_birth` via `getAgeBracket()`. The base glass aesthetic stays the same; accent colors and motion change per bracket.

```ts
elementary: {  // ages 5–10
  primary: '#FF4D8D',
  secondary: '#FC8A40',
  successAccent: '#A8E6CF',
  backgroundGradient: ['#FFF0F7', '#FFF5EA'],
  glassTint: 'rgba(255, 77, 141, 0.14)',
  borderRadius: { card: 24, button: 999, bottomSheet: 30 },
  touchTarget: 56,
  iconVariant: 'filled',
  spring: { damping: 8, stiffness: 100 },    // bouncier
}

middle_school: {  // ages 11–14
  primary: '#6E61FF',
  secondary: '#8A80FF',
  successAccent: '#B2EBF2',
  backgroundGradient: ['#F2F0FF', '#EEF5FF'],
  glassTint: 'rgba(110, 97, 255, 0.12)',
  borderRadius: { card: 22, button: 999, bottomSheet: 26 },
  touchTarget: 48,
  iconVariant: 'mixed',
  spring: { damping: 12, stiffness: 120 },
}

high_school: {  // ages 15–18
  primary: '#5A4CE0',
  secondary: '#B388FF',
  successAccent: '#E8D5FF',
  backgroundGradient: ['#F5F1FF', '#ECE7FF'],
  glassTint: 'rgba(90, 76, 224, 0.10)',
  borderRadius: { card: 20, button: 999, bottomSheet: 24 },
  touchTarget: 48,
  iconVariant: 'outline',
  spring: { damping: 20, stiffness: 200 },   // snappier
}
```

---

## 9. Component Rules

- All cards use **solid surfaces** (`glass` token = opaque white / `#221D31` dark) with a hairline `border` — no BlurView (§12; the token name is historical).
- Primary buttons: teal (`C.pink`) fill, white text, teal-tinted shadow (`shadowPink`); a light haptic fires on press.
- Inputs: surface background with `border` token; focus state lifts to `borderPink`.
- Background is **warm near-white** (`#FAF9FB`) by default. Dark mode is an opt-in toggle, never the default.
- Minimum touch target: **48px** standard, **56px** for elementary bracket.
- Loading: skeleton shimmer, not spinners (lists + cards).
- Press feedback: `scale(0.98)` on all tappable elements.
- Progress bars animate to their value (350ms ease-out via `useAnimatedRatio`), never snap.
- List rows stagger in on first mount: `FadeInDown` 220ms, 40ms/item, delay capped at item 8 (respects system reduced-motion via Reanimated defaults).
- Active tab: `pinkAlpha10` pill + filled icon + `pinkText` label; tab switches fire a light haptic.
- Icon set: `@expo/vector-icons` (Ionicons preferred). Stroke variant by bracket per §8.

---

## 10. Anti-Patterns (forbidden)

These are the AI-default tells that make output look machine-made. Each item should become a static or visual test in Phase 10.

- **Banned fonts:** Inter, Geist, any system-default sans. Agents reach for these by default — that's the giveaway.
- **Banned icon set:** Lucide. Use Ionicons via `@expo/vector-icons`.
- **Uniform contrast:** every element rendered at equal weight flattens the page. Pink for primary action only; green for success only; everything else recedes.
- **Centered single-CTA hero as default layout:** acceptable on Welcome screen; never on Dashboard, Chores, Rewards, Family, or Settings.
- **Lazy glassmorphism:** `background: 'rgba(255,255,255,0.5)'` slapped on everything is the AI-default tell. Our glassmorphism is intentional — it requires real `BlurView` on iOS, designed alpha values, and `border`/`borderPink` tokens that match the surface beneath.

**Note on glassmorphism in Chorely:** The Lumina Bloom system is glass-forward by deliberate brand choice. This conflicts with the general "no glassmorphic gradient panels" anti-pattern in generic web design docs. The resolution: our glass is *designed* (alpha values, blur intensity, and gradients are all specified above), not slapped on arbitrarily. If you reach for `rgba(255,255,255,0.5)` without referencing the `glass` / `glassLight` tokens above, you're in anti-pattern territory.

---

## 11. Screen Specifications

All screens must match these layouts. Pixel-level parity with the prototype is the bar.

> **Prototype alignment (2026-05-29):** the parent app was aligned to the Lumina Bloom prototype screenshots. **Parent bottom nav is Home / Review / Chores / Family / More** (Rewards is pushed from More as "Reward catalog", not a tab). Visual language now applied app-wide: gradient hero cards (`GradientCard` + `GRADIENTS`), color-tinted stat tiles (pink/green/orange), colored quick-action icon squares, gradient kid progress bars, gradient approval banner + photo-proof placeholder in the approval modal, invite-code + Share + 3 mini stat tiles + recent-activity feed on Family, and a grouped iOS-style settings list on More. Kid-facing screens (Welcome kid mode, Kid Home, Squad, Profile, XP/levels/badges) remain **v1.1** per CLAUDE.md §9.

### Parent Home Dashboard
- Personalized greeting header with parent avatar
- Pending Approvals card with counter and contextual preview
- Today's Snapshot: 3 stat tiles (Assigned/pink, Completed/green, Points/orange)
- Quick Actions grid: Add Chore, Create Reward, View Family, Review Requests
- Family Progress section: one card per child with avatar, completion ratio, points, streak
- Bottom Navigation: 5 tabs (Home, Chores, Rewards, Family, Settings) with glassmorphism pill

### Create Chore
- Form fields: Title, Assign To (child pills), Frequency (segmented), Due Date, Due Time, Point Value, Photo Proof toggle, Notes
- Save button (pink gradient) and Cancel button (glass)
- Validation required on title and point value

### Child Home (v1.1 — not built in v1.0)
- Greeting header with chore count
- Hero Progress Card: points balance, circular progress ring, goal hint banner
- Today's Chores list with status-dependent card styles (todo, pending, approved)
- Streaks & Wins: 3-stat grid (Day Streak, This Week, Total Points)
- Bottom Navigation: 4 tabs (Home, My Chores, Rewards, Profile)

### Parent Approval
- Child info banner with avatar and timestamp
- Chore detail card with metadata chips
- Photo proof section (v1.1, placeholder in v1.0)
- Points impact preview: Current → +N → After
- Approve (pink gradient) and Deny (red-tinted) action buttons

### Rewards Catalog (parent-managed in v1.0; child-redeemable in v1.1)
- Points balance card with current total (per selected child)
- Filter tabs: All, Available, Locked
- Rewards grid with card states (available, locked, just-unlocked)
- Redeem interaction with success toast

---

## Dark Mode (added 2026-05-28)

Chorely supports a full dark theme. The **Settings → Appearance** toggle flips `settingsStore.darkMode` (persisted locally and synced to `user_settings.dark_mode`), which `ThemeProvider` maps to the `darkC` palette in `tokens.ts`. The whole app recolors instantly because components read colors via `useTheme().C` and build styles with `useThemedStyles(makeStyles)` instead of importing the static `C`.

- **Light is the default**; dark is opt-in per user and applies even before sign-in (the store rehydrates from AsyncStorage at launch).
- Dark ground is deep violet `#171423` with light-translucent glass (`rgba(255,255,255,0.08)`) and inverted text. Brand pink/orange are unchanged; green is brightened (`#1FBF44`) for contrast. `BlurView` tint follows the mode.
- **When adding new screens/components, do not import the static `C`.** Use `const { C } = useTheme()` for inline colors and `const makeStyles = (C: Palette) => StyleSheet.create({...})` + `useThemedStyles(makeStyles)` for stylesheets. The static `C` (= light palette) remains only for mode-invariant module-scope use (e.g. shadow colors) and the dev-only ComponentShowcase.

---

## 12. Calm & Refined Refresh (2026-06-01)

The Lumina Bloom glassmorphism was tuned toward a calmer, more premium feel after the glass-heavy look read as "AI-generated." The brand (pink/orange/green, Nunito + DM Sans, mascot) is unchanged; **surfaces and color usage** changed.

- **Surfaces are now SOLID, not glass.** `glass`/`glassLight` are opaque (`#FFFFFF` / `#F3F1F7` light; `#221D31` / `#1B1726` dark). `GlassCard`, `Button` (secondary), `TabBar`, and `ModalSheet` no longer render `BlurView` — they paint a solid surface + a hairline `border`. Treat the name `GlassCard` as historical; it is a solid surface card.
- **Canvas:** light `bg` is warm near-white `#FAF9FB` (was lavender `#F3F0FF`); dark ground deepened to `#141220`.
- **Borders:** light `border` is a real hairline `rgba(24,20,40,0.06)` so solid cards have definition on near-white.
- **Shadows** softened (md radius 12 / opacity 0.05; lg 24 / 0.07; pink glow 0.16) — premium = small, soft, low-opacity.
- **Primary accent is TEAL (`#0EA5A4`; dark `#1FC2B5`), not pink.** Pink read feminine for a family app used by boys too. The token key is still `pink` (the primary-accent slot — ~24 files read `C.pink`), but its value + `pinkAlpha*`/`borderPink` are teal. `GRADIENTS.brand` is `teal → orange` (hero, logo border).
- **One-accent rule.** Teal is the single accent. Orange is reserved for **points/rewards only**; green for **success only**. Do not color decorative UI (icons, tiles, backgrounds) with secondary hues.
- **Motion (subtle, "not-AI" craft).** The `ChorelyIcon` smiley winks + bobs via its `animated` prop (forwarded through `Avatar` for `AVATAR_FACE`); enabled on the dashboard header. Stat numbers count up via `useCountUp` (src/hooks). Keep motion small and cheap — see ChorelyIcon's own notes (bob < 4px). Available next: celebration wink on approval, spring press, active-tab pop.
- **Avatar gradients** are one warm family (peach→pink→coral→amber), not a multi-hue rainbow.
- **Hero gradient** uses `GRADIENTS.brand` (pink→orange); `GRADIENTS.violet`/`sky` are deprecated for hero use.
- **Editorial typography:** big near-black display numbers + the new `typography.label` (11px, uppercase, tracked) for stat captions. Let data read through size, not color.
- **Quick actions / icon tiles:** single calm treatment — soft `pinkAlpha15` tile + pink icon — not per-action colors.

### §10 anti-pattern additions
- Frosted glass as the default surface (use solid surfaces + hairline).
- Multi-hue rainbows of unrelated gradients/colors (avatars, action tiles).
- Pastel/lavender canvas (use warm near-white).
- Coloring decorative UI with secondary hues (keep orange = points, green = success).

---

## 13. Maintenance

- Append new tokens, gradients, or rules **here**, not in CLAUDE.md.
- Add new anti-patterns to §10 whenever you catch the agent reaching for one.
- When a token changes, also update `src/theme/tokens.ts` in the same commit.

---

<!--
CHANGELOG (newest first)
- 2026-07-02 Visual polish pass: added `pinkText` token + accent-text contrast rule (§2); synced §2/§3/§5/§9 values with tokens.ts (they still showed the pre-§12 pink/lavender/glass system); tabular-nums on heroNum (§7); animated progress fills (useAnimatedRatio); staggered list entrances; active-tab pill + 11px labels; haptics on primary buttons + tab switches.
- 2026-06-01 Calm & Refined refresh (§12): solid surfaces over glass, warm near-white canvas, softened shadows, one-accent rule (orange=points, green=success), warm avatar family, brand hero gradient, editorial number typography + typography.label, unified quick-action tiles.
- 2026-05-27 Initial Lumina Bloom system split out of CLAUDE.md §6/§13. Fonts set to Nunito + DM Sans (matching App.tsx). Anti-patterns section added.
-->
