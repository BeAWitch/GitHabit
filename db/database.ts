import * as SQLite from 'expo-sqlite';

// Open the database synchronously (new in Expo SQLite)
export const db = SQLite.openDatabaseSync('githabit.db');

export const initDB = () => {
  try {
    // Create Habits (Repositories) table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT 'ghGreen',
        createdAt INTEGER NOT NULL,
        status TEXT DEFAULT 'active'
      );
    `);

    // Create CheckIns (Commits) table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habitId INTEGER NOT NULL,
        message TEXT,
        timestamp INTEGER NOT NULL,
        dateString TEXT NOT NULL,
        FOREIGN KEY(habitId) REFERENCES habits(id) ON DELETE CASCADE
      );
    `);
    
    // Create an index for faster heatmap queries
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(dateString);
    `);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize DB:', error);
  }
};
