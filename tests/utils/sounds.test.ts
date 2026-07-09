import { playSound } from '../../src/utils/sounds';
import { useSettingsStore } from '../../src/store/settingsStore';

const mockPlay = jest.fn();
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({ play: mockPlay, remove: jest.fn() })),
}));
jest.mock(
  '../../assets/sounds/success.wav',
  () => 'success.wav',
  { virtual: true }
);
jest.mock(
  '../../assets/sounds/celebrate.wav',
  () => 'celebrate.wav',
  { virtual: true }
);
jest.mock('../../assets/sounds/pop.wav', () => 'pop.wav', { virtual: true });
jest.mock('../../assets/sounds/womp.wav', () => 'womp.wav', { virtual: true });
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest factory must be lazy
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('playSound sound toggle', () => {
  beforeEach(() => {
    mockPlay.mockClear();
  });

  it('defaults to sound on', () => {
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
  });

  it('plays when enabled', () => {
    useSettingsStore.getState().setSoundEnabled(true);
    playSound('pop');
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('is silent when disabled', () => {
    useSettingsStore.getState().setSoundEnabled(false);
    playSound('pop');
    playSound('celebrate');
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('reset restores the default (on)', () => {
    useSettingsStore.getState().setSoundEnabled(false);
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
  });
});
