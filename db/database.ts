import * as SQLite from 'expo-sqlite';

// Open the database synchronously (new in Expo SQLite)
export const db = SQLite.openDatabaseSync('githabit.db');

export const initDB = () => {
  try {
    // Create Habits table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        plan TEXT,
        unitType TEXT DEFAULT 'binary',
        unitLabel TEXT DEFAULT 'done',
        color TEXT DEFAULT 'ghGreen',
        createdAt INTEGER NOT NULL,
        status TEXT DEFAULT 'active'
      );
    `);

    try {
      db.execSync('ALTER TABLE habits ADD COLUMN plan TEXT;');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('duplicate column name')) {
        console.error('Failed to migrate habits.plan:', error);
      }
    }

    try {
      db.execSync("ALTER TABLE habits ADD COLUMN unitType TEXT DEFAULT 'binary';");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('duplicate column name')) {
        console.error('Failed to migrate habits.unitType:', error);
      }
    }

    try {
      db.execSync("ALTER TABLE habits ADD COLUMN unitLabel TEXT DEFAULT 'done';");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('duplicate column name')) {
        console.error('Failed to migrate habits.unitLabel:', error);
      }
    }

    // Create CheckIns (Commits) table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS check_ins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habitId INTEGER NOT NULL,
        message TEXT,
        value INTEGER DEFAULT 1,
        timestamp INTEGER NOT NULL,
        dateString TEXT NOT NULL,
        FOREIGN KEY(habitId) REFERENCES habits(id) ON DELETE CASCADE
      );
    `);

    try {
      db.execSync('ALTER TABLE check_ins ADD COLUMN value INTEGER DEFAULT 1;');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('duplicate column name')) {
        console.error('Failed to migrate check_ins.value:', error);
      }
    }
    
    // Create an index for faster heatmap queries
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(dateString);
    `);

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize DB:', error);
  }
};
