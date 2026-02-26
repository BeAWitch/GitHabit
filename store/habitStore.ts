import { create } from 'zustand';
import * as RepoAPI from '@/db/repositories';
import type { Habit, CheckIn, ContributionData } from '@/types/models';

interface HabitState {
  habits: Habit[];
  checkIns: CheckIn[];
  globalContributions: Record<string, number>; // Dictionary indexed by date string (YYYY-MM-DD)
  
  // Actions
  fetchData: () => void; // Syncs all local SQLite data into state
  addHabit: (name: string, description: string, color?: string) => void;
  removeHabit: (id: number) => void;
  commitCheckIn: (habitId: number, message: string) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  checkIns: [],
  globalContributions: {},

  fetchData: () => {
    try {
      const habits = RepoAPI.getHabits();
      const checkIns = RepoAPI.getAllCheckIns();
      const contributionsData = RepoAPI.getGlobalContributions();
      
      const contributionMap: Record<string, number> = {};
      contributionsData.forEach(c => {
        contributionMap[c.dateString] = c.count;
      });

      set({ habits, checkIns, globalContributions: contributionMap });
    } catch (error) {
      console.error('Failed to fetch data from DB:', error);
    }
  },

  addHabit: (name, description, color) => {
    RepoAPI.createHabit(name, description, color);
    get().fetchData(); // Refresh state after mutation
  },

  removeHabit: (id) => {
    RepoAPI.deleteHabit(id);
    get().fetchData();
  },

  commitCheckIn: (habitId, message) => {
    RepoAPI.createCheckIn(habitId, message);
    get().fetchData();
  },
}));
