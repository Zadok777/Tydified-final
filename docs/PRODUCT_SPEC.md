# Product Spec — Tydified

> Canonical scope lives in CLAUDE.md §1, §8, §9. This document expands on the
> product intent. When they disagree, CLAUDE.md wins.

## What Tydified is

A family chore and reward management app. Parents run everything; children earn
points and redeem rewards. Content is entirely secular.

Three age brackets inform suggestions and (in v1.1) kid-facing visuals:

- **Elementary** (5–10) — playful, high-contrast
- **Middle School** (11–14) — structured, energetic
- **High School** (15–18) — clean, mature

## Personas

- **Parent / Guardian** — the only authenticated user. Creates the family,
  manages children, assigns and approves chores, defines and grants rewards.
- **Child** — a record owned by a family (name + optional DOB). Not an account
  in v1.0. The parent acts on their behalf.

## Core user flows (v1.0)

1. **Onboarding** — sign up → `complete_onboarding` creates family + first child.
2. **Add children** — name + optional DOB (COPPA: flags under-13).
3. **Create chores** — title, points, assignee(s), due date, frequency, category.
4. **Submit** — parent marks a chore done on the child's behalf.
5. **Approve / reject** — approval awards points via `approve_chore` RPC and
   updates the streak; rejection records a note.
6. **Rewards** — parent creates rewards (title, point cost, icon, color) and
   redeems them for a child via `redeem_reward` (points deducted server-side).
7. **Goals** — per-child savings goals toward a reward or a custom point target,
   with a one-time "reached" celebration.
8. **Settings** — rename family, manage children, dark mode, sign out, delete
   account, help center, customizable avatars.

## Navigation (parent)

Bottom tabs: **Home · Review · Chores · Family · More**. The reward catalog is
pushed from More (not a tab).

## Monetization

One paid tier, **"Tydified Plus"** (RevenueCat entitlement id `Chorely Pro`):

- Free: up to **1 child** and **4 active chores per child**.
- Plus: unlimited children + chores + premium features.
- Pricing: monthly **$4.99** / yearly **$29.99** (same features; yearly is just
  cheaper). Never hard-gate on subscription status alone — check status **and** a
  feature flag so limits can change without an app update.
- Trial strategy: no app-side trial logic. If offered, configure a **7-day
  introductory trial on yearly** in App Store Connect / Google Play / RevenueCat.
  Keep monthly paid immediately for launch tests unless conversion data says
  otherwise.

## Out of scope for v1.0 (see CLAUDE.md §9)

Child PIN auth + kid screens, photo verification, push notifications, recurring
chore auto-generation, offline write queue, leaderboard, achievement badges,
chore templates library. Do not build these before the v1.0 store submission.

## Compliance

- **COPPA** — children never prompted for email/phone/PII; name + DOB only.
- Audience is adults 18+ (not the Kids/Families category).
- Legal entity: **DS Santiago LLC (d/b/a Doulos Nexus)**; support email
  `doulosnexus@gmail.com`. Legal pages live in [legal/](./legal/).
