import { db } from './database';
import type { Habit, CheckIn, ContributionData, Category, TimelineActivity } from '@/types/models';

/**
 * Category Operations
 */
export const getCategories = (): Category[] => {
  return db.getAllSync<Category>('SELECT * FROM categories ORDER BY id ASC;');
};

/**
 * Habit Operations
 */
export const getHabits = (): Habit[] => {
  return db.getAllSync<Habit>(`
    SELECT h.*, c.color as categoryColor, c.name as categoryName 
    FROM habits h
    LEFT JOIN categories c ON h.categoryId = c.id
    WHERE h.status = 'active' 
    ORDER BY h.createdAt DESC;
  `).map(row => ({
    ...row,
    color: (row as any).categoryColor || row.color, // Fallback to legacy color if category missing
  }));
};

export const getHabitById = (id: number): Habit | null => {
  return db.getFirstSync<Habit>('SELECT * FROM habits WHERE id = ?;', [id]);
};

export const getHabitStats = (habitId: number): { total: number; lastTimestamp: number | null } => {
  const result = db.getFirstSync<{ total: number; lastTimestamp: number | null }>(
    `
      SELECT COALESCE(SUM(value), 0) as total,
      MAX(timestamp) as lastTimestamp
      FROM check_ins
      WHERE habitId = ?;
    `,
    [habitId]
  );

  return {
    total: result?.total ?? 0,
    lastTimestamp: result?.lastTimestamp ?? null,
  };
};

export const createHabit = (
  name: string,
  description: string,
  plan: string,
  unitType: 'count' | 'binary',
  unitLabel: string,
  targetValue: number,
  categoryId: number,
  status: 'active' | 'archived' = 'active',
  pinned: number = 0,
  color: string = '#238636' // Fallback
): number => {
  const result = db.runSync(
    'INSERT INTO habits (name, description, plan, unitType, unitLabel, targetValue, categoryId, color, createdAt, status, pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [name, description, plan, unitType, unitLabel, targetValue, categoryId, color, Date.now(), status, pinned]
  );
  return result.lastInsertRowId;
};

export const updateHabit = (
  id: number,
  name: string,
  description: string,
  plan: string,
  unitType: 'count' | 'binary',
  unitLabel: string,
  targetValue: number,
  categoryId: number,
  status: 'active' | 'archived',
  pinned: number
) => {
  db.runSync(
    'UPDATE habits SET name = ?, description = ?, plan = ?, unitType = ?, unitLabel = ?, targetValue = ?, categoryId = ?, status = ?, pinned = ? WHERE id = ?;',
    [name, description, plan, unitType, unitLabel, targetValue, categoryId, status, pinned, id]
  );
};

export const deleteHabit = (id: number) => {
  db.runSync('UPDATE habits SET status = ?, deletedAt = ? WHERE id = ?;', ['deleted', Date.now(), id]);
};

/**
 * Check-In (Commit) Operations
 */
export const createCheckIn = (habitId: number, message: string = '', value: number = 1, targetValue: number = 1): number => {
  const now = new Date();
  const timestamp = now.getTime();
  const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD

  const result = db.runSync(
    'INSERT INTO check_ins (habitId, message, value, targetValue, timestamp, dateString) VALUES (?, ?, ?, ?, ?, ?);',
    [habitId, message, value, targetValue, timestamp, dateString]
  );
  return result.lastInsertRowId;
};

export const updateCheckIn = (id: number, message: string, value: number) => {
  db.runSync(
    'UPDATE check_ins SET message = ?, value = ? WHERE id = ?;',
    [message, value, id]
  );
};

export const deleteCheckIn = (id: number) => {
  db.runSync('DELETE FROM check_ins WHERE id = ?;', [id]);
};

export const getCheckInsForHabit = (habitId: number): CheckIn[] => {
  return db.getAllSync<CheckIn>('SELECT * FROM check_ins WHERE habitId = ? ORDER BY timestamp DESC;', [habitId]);
};

export const getAllCheckIns = (): CheckIn[] => {
  return db.getAllSync<CheckIn>('SELECT * FROM check_ins ORDER BY timestamp DESC;');
};

export const getRecentActivities = (): TimelineActivity[] => {
  return db.getAllSync<TimelineActivity>(`
    SELECT 
      'checkin_' || c.id AS id,
      'check_in' AS type,
      h.id AS habitId,
      h.name AS habitName,
      h.unitLabel AS unitLabel,
      c.timestamp AS timestamp,
      c.message AS message,
      c.value AS value
    FROM check_ins c
    JOIN habits h ON c.habitId = h.id

    UNION ALL

    SELECT 
      'create_' || h.id AS id,
      'create' AS type,
      h.id AS habitId,
      h.name AS habitName,
      h.unitLabel AS unitLabel,
      h.createdAt AS timestamp,
      NULL AS message,
      NULL AS value
    FROM habits h

    UNION ALL

    SELECT 
      'delete_' || h.id AS id,
      'delete' AS type,
      h.id AS habitId,
      h.name AS habitName,
      h.unitLabel AS unitLabel,
      h.deletedAt AS timestamp,
      NULL AS message,
      NULL AS value
    FROM habits h
    WHERE h.status = 'deleted' AND h.deletedAt IS NOT NULL

    ORDER BY timestamp DESC
    LIMIT 100;
  `);
};

/**
 * Contribution (Heatmap) Data Operations
 */
export const getGlobalContributions = (): ContributionData[] => {
  // Groups all check-ins across all habits by date to generate the global heatmap
  return db.getAllSync<ContributionData>(`
    SELECT dateString, SUM(value) as count, MAX(targetValue) as targetValue
    FROM check_ins 
    GROUP BY dateString;
  `);
};

export const getHabitContributions = (habitId: number): ContributionData[] => {
  return db.getAllSync<ContributionData>(`
    SELECT dateString, SUM(value) as count, MAX(targetValue) as targetValue
    FROM check_ins 
    WHERE habitId = ?
    GROUP BY dateString;
  `, [habitId]);
};
