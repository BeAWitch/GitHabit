import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  username: string;
  bio: string;
  status: string;
  avatarUri: string | null;
}

interface UserState {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  username: 'habit-builder',
  bio: '',
  status: 'Building habits...',
  avatarUri: null, // null means use default local icon
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
    }),
    {
      name: 'githabit-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
