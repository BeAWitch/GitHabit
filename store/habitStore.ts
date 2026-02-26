import { create } from 'zustand';
import * as RepoAPI from '@/db/repositories';
import type { Habit, CheckIn, Category } from '@/types/models';

interface HabitState {
  habits: Habit[];
  categories: Category[];
  checkIns: CheckIn[];
  globalContributions: Record<string, number>; // Dictionary indexed by date string (YYYY-MM-DD)
  habitContributions: Record<number, Record<string, number>>;
  habitStats: Record<number, { total: number; lastTimestamp: number | null }>;
  
  // Actions
  fetchData: () => void; // Syncs all local SQLite data into state
  fetchHabitDetail: (habitId: number) => void;
  addHabit: (name: string, description: string, plan: string, unitType: 'count' | 'binary', unitLabel: string, categoryId: number) => void;
  removeHabit: (id: number) => void;
  commitCheckIn: (habitId: number, message: string, value: number) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  categories: [],
  checkIns: [],
  globalContributions: {},
  habitContributions: {},
  habitStats: {},

  fetchData: () => {
    try {
      const categories = RepoAPI.getCategories();
      const habits = RepoAPI.getHabits();
      const checkIns = RepoAPI.getAllCheckIns();
      const contributionsData = RepoAPI.getGlobalContributions();
      const habitStats: Record<number, { total: number; lastTimestamp: number | null }> = {};
      
      const contributionMap: Record<string, number> = {};
      contributionsData.forEach(c => {
        contributionMap[c.dateString] = c.count;
      });

      checkIns.forEach((checkIn) => {
        const current = habitStats[checkIn.habitId] ?? { total: 0, lastTimestamp: null };
        const nextTotal = current.total + checkIn.value;
        const nextLast = current.lastTimestamp
          ? Math.max(current.lastTimestamp, checkIn.timestamp)
          : checkIn.timestamp;
        habitStats[checkIn.habitId] = {
          total: nextTotal,
          lastTimestamp: nextLast,
        };
      });

      set({ habits, categories, checkIns, globalContributions: contributionMap, habitStats });
    } catch (error) {
      console.error('Failed to fetch data from DB:', error);
    }
  },

  fetchHabitDetail: (habitId) => {
    try {
      const contributionsData = RepoAPI.getHabitContributions(habitId);
      const stats = RepoAPI.getHabitStats(habitId);
      const contributionMap: Record<string, number> = {};

      contributionsData.forEach((c) => {
        contributionMap[c.dateString] = c.count;
      });

      set((state) => ({
        habitContributions: {
          ...state.habitContributions,
          [habitId]: contributionMap,
        },
        habitStats: {
          ...state.habitStats,
          [habitId]: stats,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch habit detail from DB:', error);
    }
  },

  addHabit: (name, description, plan, unitType, unitLabel, categoryId) => {
    RepoAPI.createHabit(name, description, plan, unitType, unitLabel, categoryId);
    get().fetchData(); // Refresh state after mutation
  },

  removeHabit: (id) => {
    RepoAPI.deleteHabit(id);
    get().fetchData();
  },

  commitCheckIn: (habitId, message, value) => {
    RepoAPI.createCheckIn(habitId, message, value);
    get().fetchData();
    get().fetchHabitDetail(habitId);
  },
}));
