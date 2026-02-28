export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Habit {
  id: number;
  name: string;
  description: string;
  plan: string; // README-like plan/details
  unitType: 'count' | 'binary';
  unitLabel: string; // e.g. times, minutes, done
  color: string; // The category dot color
  categoryId: number;
  categoryName: string;
  createdAt: number; // Unix timestamp
  status: 'active' | 'archived';
  pinned: number; // 0 or 1
}

export interface CheckIn {
  id: number;
  habitId: number;
  message: string;
  value: number; // count or 1/0 for binary
  timestamp: number; // Unix timestamp
  dateString: string; // YYYY-MM-DD for easy grouping (the heatmap logic)
}

export interface TimelineActivity {
  id: string;
  type: 'check_in' | 'create' | 'delete';
  habitId: number;
  habitName: string;
  unitLabel?: string;
  timestamp: number;
  message?: string;
  value?: number;
}

export interface ContributionData {
  dateString: string;
  count: number;
}
