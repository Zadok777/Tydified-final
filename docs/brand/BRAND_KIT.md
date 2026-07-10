# Tydified Brand Kit

One-page source of truth for anything wearing the Tydified name — app, store
listings, website, social, print. Tokens mirror `src/theme/tokens.ts` (that
file wins if they ever drift). Visual system details: [DESIGN.md](../../DESIGN.md).

## Name & voice

- **Name:** Tydified (always capitalized T, one word — never "TidyFied"/"Tydify")
- **Tagline:** *Do chores. Earn points. Unlock rewards. Level up!*
- **Voice:** warm, playful, parent-to-parent plain English. Celebrates kids;
  never nags. Secular — no religious references anywhere.
- **Audience:** parents (18+ store rating); kids see the app through them.

## Logo

Files in [`assets/brand/`](../../assets/brand/):

| File | Use |
|---|---|
| `tydified-lockup.svg` | Source (1254×1254, embedded raster) |
| `tydified-lockup-white.png` | On light backgrounds needing a plate |
| `tydified-lockup-transparent.png` | Anywhere else (trimmed, alpha) |
| `tydified-lockup-1024.png` / `-512.png` | Web/social/email sizes |

The lockup = bubble wordmark "Tydi🏆fied" (gold trophy as the middle glyph,
confetti burst above) over a navy tagline pill. Related in-app marks:
`assets/icon.png` (trophy app icon), `assets/tydified-logo.png` (splash),
`TydifiedLogo`/`TydifiedIcon` components.

**Rules:** don't recolor, stretch, add effects, or set the wordmark in another
font. Keep clear space ≥ the trophy's width on all sides. Minimum legible
width ~160px; below that use the trophy app icon instead.

## Color

Exact lockup samples (from `tokens.ts`):

| Role | Hex | Notes |
|---|---|---|
| Tydi Blue (primary) | `#14B0FE` | token key `pink` (legacy name) |
| Blue text-safe | `#0059AE` | `pinkText` — use for blue TEXT on white |
| Trophy Amber | `#FEAA01` | points, trophy, highlights |
| Amber text-safe | `#A36A00` | `orangeText` |
| Tagline Green | `#60DB01` | success |
| Green text-safe | `#3D9800` | `greenText` |
| Brand Navy | `#00001B` | wordmark outline, tagline pill, dark text |
| Fied Pink | `#FC5499` | celebration reserve |
| Purple | `#B353FC` | celebration reserve |
| Cyan | `#5FFCFE` | celebration reserve |
| Canvas | warm near-white | solid surfaces + hairline borders (DESIGN.md §12) |

Raw amber/blue/green FAIL 4.5:1 contrast as text on white — always use the
`*Text` variants for copy.

## Typography

- **Headlines:** Nunito ExtraBold / Bold (rounded, kid-warm)
- **Body/UI:** DM Sans Regular/Medium/Bold
- Google Fonts on web; bundled via `@expo-google-fonts` in-app.

## Illustration style

Glossy 3D "sticker" icons (see `assets/cartoon/` + `assets/cartoon/avatars/`,
36 pieces). Bright saturated colors, soft shadows, rounded forms. New art is
generated with the Canva sticker-sheet pipeline documented in
docs/superpowers/specs/2026-07-09-sounds-cartoons-howto-design.md — match this
style; never mix in flat emoji or thin-line art on kid-facing surfaces.

## Identity facts (for listings/legal)

- Entity: DS Santiago LLC (d/b/a Doulos Nexus), Tampa FL
- Support email: doulosnexus@gmail.com
- Bundle/package id: `com.zad0k777.tydified`
- Subscription brand: **Tydified Plus** ($4.99/mo, $29.99/yr)
