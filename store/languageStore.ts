import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from '@/utils/i18n';

export type LanguageMode = 'auto' | 'en' | 'zh';

interface LanguageState {
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'auto',
      setLanguage: (lang) => {
        set({ language: lang });
        // Sync i18n current language
        const targetLang = lang === 'auto' 
          ? Localization.getLocales()[0]?.languageCode || 'en' 
          : lang;
        i18n.changeLanguage(targetLang);
      },
    }),
    {
      name: 'githabit-language-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Make sure language is set correctly when state is rehydrated
      onRehydrateStorage: () => (state) => {
        if (state && state.language !== 'auto') {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);