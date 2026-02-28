import * as SQLite from 'expo-sqlite';

// Open the database synchronously (new in Expo SQLite)
export const db = SQLite.openDatabaseSync('githabit.db');

export const clearAllData = () => {
  try {
    db.execSync(`
      DROP TABLE IF EXISTS check_ins;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS habits;
    `);
    console.log('Database cleared successfully.');
    // Re-initialize to create empty tables
    initDB();
  } catch (error) {
    console.error('Failed to clear database:', error);
  }
};

export const initDB = () => {
  try {
    db.execSync('PRAGMA foreign_keys = ON;');
    // Create Habits table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        plan TEXT,
        unitType TEXT DEFAULT 'binary',
        unitLabel TEXT DEFAULT 'done',
        targetValue INTEGER DEFAULT 1,
        color TEXT DEFAULT 'ghGreen',
        createdAt INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        pinned INTEGER DEFAULT 0,
        categoryId INTEGER,
        deletedAt INTEGER
      );
    `);

    // Create Categories table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);

    // Insert default categories if empty
    const catCount = db.getFirstSync<{count: number}>('SELECT COUNT(*) as count FROM categories');
    if (catCount?.count === 0) {
      db.execSync(`
        INSERT INTO categories (name, color) VALUES 
        ('Programming', '#238636'),
        ('Health', '#8250df'),
        ('Learning', '#0969da'),
        ('Finance', '#bf8700'),
        ('Hobbies', '#da3633');
      `);
    }

    // Create CheckIns (Commits) table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habitId INTEGER NOT NULL,
        message TEXT,
        value INTEGER DEFAULT 1,
        targetValue INTEGER DEFAULT 1,
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
