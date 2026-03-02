import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  quickCommitBinary: boolean;
  setQuickCommitBinary: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      quickCommitBinary: false, // Default to false
      setQuickCommitBinary: (value) => set({ quickCommitBinary: value }),
    }),
    {
      name: 'githabit-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
