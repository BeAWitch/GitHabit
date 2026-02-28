import { create } from 'zustand';
import * as RepoAPI from '@/db/repositories';
import type { Habit, CheckIn, Category, TimelineActivity } from '@/types/models';

interface HabitState {
  habits: Habit[];
  categories: Category[];
  checkIns: CheckIn[];
  recentActivities: TimelineActivity[];
  globalContributions: Record<string, number>; // Dictionary indexed by date string (YYYY-MM-DD)
  habitContributions: Record<number, Record<string, number>>;
  habitTargetValues: Record<number, Record<string, number>>; // Stores target values per day per habit
  habitStats: Record<number, { total: number; lastTimestamp: number | null }>;
  
  // Actions
  fetchData: () => void; // Syncs all local SQLite data into state
  fetchHabitDetail: (habitId: number) => void;
  addHabit: (name: string, description: string, plan: string, unitType: 'count' | 'binary', unitLabel: string, targetValue: number, categoryId: number, status: 'active' | 'archived', pinned: number) => void;
  updateHabit: (id: number, name: string, description: string, plan: string, unitType: 'count' | 'binary', unitLabel: string, targetValue: number, categoryId: number, status: 'active' | 'archived', pinned: number) => void;
  removeHabit: (id: number) => void;
  commitCheckIn: (habitId: number, message: string, value: number) => void;
  updateCheckIn: (habitId: number, checkInId: number, message: string, value: number) => void;
  removeCheckIn: (habitId: number, checkInId: number) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  categories: [],
  checkIns: [],
  recentActivities: [],
  globalContributions: {},
  habitContributions: {},
  habitTargetValues: {},
  habitStats: {},

  fetchData: () => {
    try {
      const categories = RepoAPI.getCategories();
      const habits = RepoAPI.getHabits();
      const checkIns = RepoAPI.getAllCheckIns();
      const recentActivities = RepoAPI.getRecentActivities();
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

      set({ habits, categories, checkIns, recentActivities, globalContributions: contributionMap, habitStats });
    } catch (error) {
      console.error('Failed to fetch data from DB:', error);
    }
  },

  fetchHabitDetail: (habitId) => {
    try {
      const contributionsData = RepoAPI.getHabitContributions(habitId);
      const stats = RepoAPI.getHabitStats(habitId);
      const contributionMap: Record<string, number> = {};
      const targetValuesMap: Record<string, number> = {};

      contributionsData.forEach((c) => {
        contributionMap[c.dateString] = c.count;
        if (c.targetValue !== undefined) {
           targetValuesMap[c.dateString] = c.targetValue;
        }
      });

      set((state) => ({
        habitContributions: {
          ...state.habitContributions,
          [habitId]: contributionMap,
        },
        habitTargetValues: {
          ...state.habitTargetValues,
          [habitId]: targetValuesMap,
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

  addHabit: (name, description, plan, unitType, unitLabel, targetValue, categoryId, status, pinned) => {
    RepoAPI.createHabit(name, description, plan, unitType, unitLabel, targetValue, categoryId, status, pinned);
    get().fetchData(); // Refresh state after mutation
  },

  updateHabit: (id, name, description, plan, unitType, unitLabel, targetValue, categoryId, status, pinned) => {
    RepoAPI.updateHabit(id, name, description, plan, unitType, unitLabel, targetValue, categoryId, status, pinned);
    get().fetchData(); // Refresh state after mutation
  },

  removeHabit: (id) => {
    RepoAPI.deleteHabit(id);
    get().fetchData();
  },

  commitCheckIn: (habitId, message, value) => {
    const targetValue = get().habits.find(h => h.id === habitId)?.targetValue || 1;
    RepoAPI.createCheckIn(habitId, message, value, targetValue);
    get().fetchData();
    get().fetchHabitDetail(habitId);
  },

  updateCheckIn: (habitId, checkInId, message, value) => {
    RepoAPI.updateCheckIn(checkInId, message, value);
    get().fetchData();
    get().fetchHabitDetail(habitId);
  },

  removeCheckIn: (habitId, checkInId) => {
    RepoAPI.deleteCheckIn(checkInId);
    get().fetchData();
    get().fetchHabitDetail(habitId);
  },
}));
