# Sound effects

Tydified plays short sound effects on celebratory moments, gated by the
**Settings → Sound effects** toggle (`settingsStore.soundEnabled`, default on)
and routed through `src/utils/sounds.ts`. Playback respects the device's
silent switch — we do not force audio in silent mode.

## Bundled files (active)

Two **locally synthesized** chimes ship today (generated with a small Python
script — no third-party license, fully ours to bundle), wired up in the
`SOURCES` map in `src/utils/sounds.ts`:

| File | Plays when | Feel |
|---|---|---|
| `celebrate.wav` | A goal is reached or a reward is redeemed (via `CelebrationOverlay`) | Bright ascending arpeggio + sparkle (~1s) |
| `success.wav` | A parent approves a chore (`ChoreApprovalModal`) | Light two-note confirmation ding (~0.4s) |

These play in Expo Go (expo-audio ships with the SDK) and respect the silent
switch. To swap in higher-fidelity SFX, drop a replacement at the same path
(any Metro-supported audio ext) and update the extension in `SOURCES`. A
missing entry makes that sound a silent no-op (haptics still fire).

## Format

- **`.mp3`** (AAC/`.m4a` also works — update the `require` extension to match).
- Mono is fine; keep files small (a few hundred KB max).
- Normalize so the two SFX feel balanced; the player sets volume to 0.7.

## Royalty-free sources (verify the license before shipping)

These allow commercial use without attribution. Confirm the specific clip's
license on its page — do not assume.

- **Pixabay** (Pixabay Content License, no attribution): https://pixabay.com/sound-effects/search/success%20chime/
- **Mixkit** (Mixkit Free License, no attribution): https://mixkit.co/free-sound-effects/win/
- **Kenney** (CC0 / public domain): https://kenney.nl/assets/interface-sounds
- **freegamedesigntools.com SFX board** (CC0, browser-synthesized): https://freegamedesigntools.com/sfx-board/

Keep this folder's contents secular and child-appropriate.
