import * as SQLite from 'expo-sqlite';

// Open the database synchronously (new in Expo SQLite)
export const db = SQLite.openDatabaseSync('githabit.db');

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
        pinned INTEGER DEFAULT 0
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

    try {
      db.execSync('ALTER TABLE habits ADD COLUMN pinned INTEGER DEFAULT 0;');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('duplicate column name')) {
        console.error('Failed to migrate habits.pinned:', error);
      }
    }

    try {
      db.execSync('ALTER TABLE habits ADD COLUMN targetValue INTEGER DEFAULT 1;');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('duplicate column name')) {
        console.error('Failed to migrate habits.targetValue:', error);
      }
    }

    try {
      db.execSync('ALTER TABLE habits ADD COLUMN deletedAt INTEGER;');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('duplicate column name')) {
        console.error('Failed to migrate habits.deletedAt:', error);
      }
    }

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

    try {
      db.execSync('ALTER TABLE habits ADD COLUMN categoryId INTEGER;');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('duplicate column name')) {
        console.error('Failed to migrate habits.categoryId:', error);
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
