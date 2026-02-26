export interface Habit {
  id: number;
  name: string;
  description: string;
  color: string; // The category dot color
  createdAt: number; // Unix timestamp
  status: 'active' | 'archived';
}

export interface CheckIn {
  id: number;
  habitId: number;
  message: string;
  timestamp: number; // Unix timestamp
  dateString: string; // YYYY-MM-DD for easy grouping (the heatmap logic)
}

export interface ContributionData {
  dateString: string;
  count: number;
}