# Sound toggle, cartoon avatar icons, How-to page — design

Date: 2026-07-09 · Approved by Santiago in-session.

## 1. Sound effects toggle
- New `soundEnabled: boolean` (default `true`) in `settingsStore` (persisted locally via the store's existing AsyncStorage persist; NOT synced to `user_settings` — per-device preference, same as the removed 2026-06-01 toggle).
- Gate lives in `playSound()` (`src/utils/sounds.ts`) — single choke point; all 4 call sites (approval chime, celebrate, tab pop, login womp) inherit it.
- UI: "Sound effects" Switch row in MoreScreen's Settings group, beside notification toggles.

## 2. Cartoon avatar icons
- Scope (user choice): avatar picker + kid-facing fun spots only. Tab bar / settings rows / chrome stay Ionicons.
- Redraw the ~28 `ICON_OPTIONS` Ionicons in `ProfileEditModal` as glossy 3D cartoon stickers matching `assets/cartoon/` (Canva MCP pipeline: generate-design → export → PIL flood-fill bg removal, transparent PNG).
- Extend `CartoonIcon.tsx` name map; `Avatar` renders CartoonIcon when the stored `avatar_icon` matches a cartoon name, falling back to Ionicons for legacy values (no DB migration; `avatar_icon` stays a text column).
- Keep `null` (initials) and `AVATAR_FACE` (Tydified smiley) options.
- QA gate: review every generated sticker; regenerate duds before shipping.

## 3. "How Tydified works" page
- New `HowToScreen` (RootStack route `HowTo`), opened from a new MoreScreen row (book icon) above Help center.
- Scrollable illustrated steps, each = cartoon icon + 1–2 plain sentences:
  1. Add your kids · 2. Create chores · 3. Kids do them, you approve · 4. Points become rewards · 5. Set goals.
- Footer link → existing Help center. No first-launch forced tour (v1.1 idea list).

## Order
1. Sound toggle + How-to page (no artwork) → 2. sticker generation + wiring → 3. one rebuild of both platforms carrying all three.

## Testing
- Unit: settingsStore default + toggle persistence shape; playSound respects flag (mock expo-audio).
- tsc + eslint + jest green before build; visual pass on sim for picker grid + How-to page.
