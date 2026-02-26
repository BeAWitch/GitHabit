import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'auto',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'githabit-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
