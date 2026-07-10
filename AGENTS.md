# AGENTS.md

Shared project instructions for AI coding agents working in this repository, including Codex, Claude Code, and other coding assistants.

This file contains the durable project rules that should be followed in every session. Keep it short, practical, and current. Do not turn this file into a full project history.

For Codex, this file is the primary project instruction file. Claude-specific notes may also exist in `CLAUDE.md`, but they should not override the project rules in this file unless the user explicitly says so.

## Project identity

This repository is for the Chorely App.

Tydified is an Expo-managed React Native app using TypeScript, Supabase, theming, parent/child records, points, streaks, chores, and household workflows.

The app must remain simple, stable, privacy-conscious, and safe for family use.

## Start-of-session protocol

Before making code changes:

1. Read this `AGENTS.md`.
2. Inspect the relevant source files for the requested task.
3. Check `docs/PROJECT_STATE.md` only when the user is continuing previous work or asks where the project left off.
4. Review `TASKS.md` only when the task depends on what is already done or pending.
5. Read `PLANNING.md` or `DESIGN.md` only when architecture, UX, navigation, or product direction is involved.
6. Read `docs/DATA_MODEL.md` only when the task involves Supabase schema, RPCs, RLS, services, points, streaks, chores, households, or child records.
7. Read `CLAUDE.md` only when the task refers to older decisions, Claude-specific notes, schema history, or project rules not found here.
8. For non-trivial work, explain the intended plan before changing files.
9. For small fixes, make the smallest safe change and explain what changed afterward.

Do not read every project document by default. Use the smallest amount of context needed to complete the task correctly.

## Hard rules

* Expo Managed Workflow only.
* Never run `expo eject`.
* Bump Expo SDK packages only through the proper Expo flow, such as `npx expo install --fix`, and verify the app still boots in Expo Go.
* TypeScript strict mode is required.
* Do not add `.js` or `.jsx` files.
* Do not use `any`. Use `unknown` and narrow the type.
* Screens must not call `supabase` directly.
* All Supabase queries belong in `src/services/`.
* Point mutations must go through SQL RPCs only.
* Never directly update `children.points` or `children.streak_days` from the client.
* New components must use `useTheme().C` and `useThemedStyles`.
* Do not statically import `C` in new components.
* Secrets must stay in `.env.local` or another gitignored environment file.
* Never hardcode API keys, Supabase service keys, OpenAI keys, Stripe keys, or other secrets.
* COPPA-sensitive design must be preserved.
* Children are records, not app users.
* Do not collect child PII beyond name and optional DOB unless the user explicitly approves a privacy-safe change.
* Ask before changing the database schema, navigation structure, auth logic, payment logic, or child-data model.

## Architecture rules

Use this basic separation:

* `src/screens/` contains UI screens.
* `src/components/` contains reusable UI components.
* `src/services/` contains Supabase and backend access.
* `src/types/` contains shared TypeScript types.
* `src/theme/` contains theme-related code.
* `docs/` contains project documentation and state notes.

Screens may call service functions. Screens may not embed raw Supabase queries.

If a task requires database logic, inspect the existing service layer and RPC pattern before changing anything.

Do not invent tables, columns, RPC names, RLS policies, or service functions. Confirm them from existing code, documentation, or migrations.

## Backend

Supabase project: Chorely App
Supabase project ID: `zinbukzmkorkawbgckkh`

Schema and RPC details may be documented in:

* `docs/DATA_MODEL.md`
* Supabase migration files, if present
* `CLAUDE.md`, if older project history is needed

After any schema change, regenerate Supabase types and update:

```bash
src/types/database.types.ts
```

Use the project’s existing type-generation command if one already exists in package scripts, documentation, or previous setup notes.

Do not change schema, RLS, auth, or RPC behavior without user approval.

## Build and verification commands

Use these commands when relevant:

```bash
npm run ios
npx tsc --noEmit
npm test
```

`npm run ios` is the preferred local verification path for the iOS Simulator and glass UI.

`npx tsc --noEmit` must pass after TypeScript changes.

`npm test` should be run when logic, services, data handling, or reusable utilities are changed.

If a command fails because dependencies, simulator setup, or local environment are unavailable, report that clearly and do not pretend verification passed.

## Coding style

Prefer small, focused changes.

Do not rewrite unrelated files.

Do not refactor large areas unless the user specifically asks for it or the existing structure blocks the requested task.

Preserve existing naming conventions, folder structure, and component patterns.

Use clear TypeScript types.

Avoid clever code when simple code is safer.

Do not introduce new libraries without explaining why they are needed and getting approval when the package affects app architecture, auth, payments, AI, analytics, or child data.

## UI and theming

Follow the current design system.

Use the project theme utilities.

New components should use:

```ts
useTheme().C
useThemedStyles
```

Do not introduce hardcoded color systems unless the user explicitly asks for a design-system change.

If a change affects layout, spacing, glass UI, tabs, navigation, onboarding, parent screens, child screens, or chore flows, inspect related screens before editing.

## Privacy and family-safety rules

This app involves children and household workflows.

Do not add features that expose child data publicly.

Do not add social features involving children unless the user explicitly approves the design.

Do not add location tracking, public profiles, direct messaging, or external sharing for children without a specific privacy review.

Keep parent control clear.

Keep child-facing flows simple and safe.

## OpenAI or AI feature rules

If adding OpenAI-powered features:

* Never expose OpenAI API keys in the frontend.
* Use a backend route, server function, or secure service boundary.
* Keep prompts short and task-specific.
* Use structured outputs when the app needs predictable JSON.
* Validate model output before writing to the database.
* Do not allow AI output to directly mutate points, streaks, chores, rewards, payments, user records, or child records without app-side validation.
* Keep AI features optional and explainable.
* Prefer simple deterministic logic over AI when the feature does not need model reasoning.

## When to ask before proceeding

Ask before making changes involving:

* Database schema
* Supabase RLS policies
* Auth flow
* Navigation structure
* Payment logic
* Child data collection
* App-wide theming
* New package installation
* Major file restructuring
* Production deployment
* Anything that could break existing user data

For ordinary component fixes, TypeScript fixes, copy changes, styling adjustments, and isolated bug fixes, proceed with the smallest safe change and explain afterward.

## Definition of done

A task is done only when:

* The requested behavior is implemented.
* The change is limited to the necessary files.
* TypeScript still passes, or any inability to run it is clearly reported.
* Code generated or changed by an agent is scanned with Semgrep for security vulnerabilities, or any inability to run Semgrep is clearly reported.
* Tests are run when relevant, or the reason they were not run is stated.
* The final response explains what changed, where it changed, and what still needs attention.

## Notes for Codex

Codex should treat this file as the primary repository guidance.

Use additional files only as needed:

* `docs/PROJECT_STATE.md` for current project status
* `TASKS.md` for task tracking
* `PLANNING.md` for product and architecture direction
* `DESIGN.md` for design direction
* `docs/DATA_MODEL.md` for schema and backend information
* `CLAUDE.md` for older project notes or Claude-specific context

Do not consume unnecessary context. Read only what is needed for the task.

## Notes for Claude Code

Claude Code may also read `CLAUDE.md` for additional project history, memory, or Claude-specific behavior.

If `CLAUDE.md` conflicts with this file, follow this `AGENTS.md` for Codex sessions unless the user explicitly says otherwise.
