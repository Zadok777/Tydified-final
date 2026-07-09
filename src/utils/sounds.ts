import { createAudioPlayer } from 'expo-audio';

// UI chimes (assets/sounds/*.wav — locally synthesized FM-bell tones).
// success = a chore was approved; celebrate = goal reached / reward redeemed.
// Playback respects the iOS silent switch (expo-audio default), and failures
// are swallowed — sound is decoration, never worth crashing a flow.
const SOURCES = {
  success: require('../../assets/sounds/success.wav'),
  celebrate: require('../../assets/sounds/celebrate.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

// ponytail: a fresh player per play, released after the chime — stateless and
// plenty for sub-second UI sounds; pool players if this ever shows in profiles.
export function playSound(name: SoundName): void {
  try {
    const player = createAudioPlayer(SOURCES[name]);
    player.play();
    setTimeout(() => {
      try {
        player.remove();
      } catch {
        // already released
      }
    }, 4000);
  } catch {
    // no audio available (web, simulator quirks) — stay silent
  }
}
