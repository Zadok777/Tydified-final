import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// This is the only store that uses Zustand's persist middleware, because dark
// mode and notification prefs need to survive app relaunch *before* the user
// is signed in (e.g. dark mode should apply on the Welcome screen). Server
// settings in `user_settings` are the source of truth post-sign-in; this
// local cache is rehydrated to match after `getMySettings()` returns.

interface SettingsState {
  darkMode: boolean;
  notificationsEnabled: boolean;
  notificationChoreComplete: boolean;
  notificationRewardRedeemed: boolean;
  notificationDailySummary: boolean;
  /** UI chimes on/off. Per-device (not synced to user_settings). */
  soundEnabled: boolean;
  setDarkMode(value: boolean): void;
  setSoundEnabled(value: boolean): void;
  setNotificationsEnabled(value: boolean): void;
  setNotificationChoreComplete(value: boolean): void;
  setNotificationRewardRedeemed(value: boolean): void;
  setNotificationDailySummary(value: boolean): void;
  hydrateFromServer(server: {
    dark_mode: boolean;
    notifications_enabled: boolean;
    notification_chore_complete: boolean;
    notification_reward_redeemed: boolean;
    notification_daily_summary: boolean;
  }): void;
  reset(): void;
}

const defaults = {
  darkMode: false,
  notificationsEnabled: true,
  notificationChoreComplete: true,
  notificationRewardRedeemed: true,
  notificationDailySummary: true,
  soundEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setDarkMode: (darkMode) => set({ darkMode }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
      setNotificationChoreComplete: (notificationChoreComplete) =>
        set({ notificationChoreComplete }),
      setNotificationRewardRedeemed: (notificationRewardRedeemed) =>
        set({ notificationRewardRedeemed }),
      setNotificationDailySummary: (notificationDailySummary) =>
        set({ notificationDailySummary }),
      hydrateFromServer: (server) =>
        set({
          darkMode: server.dark_mode,
          notificationsEnabled: server.notifications_enabled,
          notificationChoreComplete: server.notification_chore_complete,
          notificationRewardRedeemed: server.notification_reward_redeemed,
          notificationDailySummary: server.notification_daily_summary,
        }),
      reset: () => set(defaults),
    }),
    {
      name: 'tydified.settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
