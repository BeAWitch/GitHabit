import { db } from './database';
import type { Habit, CheckIn, ContributionData } from '@/types/models';

/**
 * Habit (Repository) Operations
 */
export const getHabits = (): Habit[] => {
  return db.getAllSync<Habit>('SELECT * FROM habits WHERE status = "active" ORDER BY createdAt DESC;');
};

export const getHabitById = (id: number): Habit | null => {
  return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
};

export const createHabit = (name: string, description: string, color: string = '#238636'): number => {
  const result = db.runSync(
    'INSERT INTO habits (name, description, color, createdAt, status) VALUES (?, ?, ?, ?, ?);',
    [name, description, color, Date.now(), 'active']
  );
  return result.lastInsertRowId;
};

export const deleteHabit = (id: number) => {
  db.runSync('DELETE FROM habits WHERE id = ?;', [id]);
};

/**
 * Check-In (Commit) Operations
 */
export const createCheckIn = (habitId: number, message: string = ''): number => {
  const now = new Date();
  const timestamp = now.getTime();
  const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD

  const result = db.runSync(
    'INSERT INTO check_ins (habitId, message, timestamp, dateString) VALUES (?, ?, ?, ?, ?);',
    [habitId, message, timestamp, dateString]
  );
  return result.lastInsertRowId;
};

export const getCheckInsForHabit = (habitId: number): CheckIn[] => {
  return db.getAllSync<CheckIn>('SELECT * FROM check_ins WHERE habitId = ? ORDER BY timestamp DESC;', [habitId]);
};

export const getAllCheckIns = (): CheckIn[] => {
  return db.getAllSync<CheckIn>('SELECT * FROM check_ins ORDER BY timestamp DESC;');
};

/**
 * Contribution (Heatmap) Data Operations
 */
export const getGlobalContributions = (): ContributionData[] => {
  // Groups all check-ins across all habits by date to generate the global heatmap
  return db.getAllSync<ContributionData>(`
    SELECT dateString, COUNT(*) as count 
    FROM check_ins 
    GROUP BY dateString;
  `);
};

export const getHabitContributions = (habitId: number): ContributionData[] => {
  return db.getAllSync<ContributionData>(`
    SELECT dateString, COUNT(*) as count 
    FROM check_ins 
    WHERE habitId = ?
    GROUP BY dateString;
  `, [habitId]);
};
