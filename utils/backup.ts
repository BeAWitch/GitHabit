import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { db } from '@/db/database';
import { useHabitStore } from '@/store/habitStore';
import { useUserStore } from '@/store/userStore';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

export interface BackupData {
  version: string;
  timestamp: number;
  database: {
    categories: any[];
    habits: any[];
    check_ins: any[];
  };
  preferences: {
    user: any;
    theme: any;
    language: any;
  };
}

export const exportDataToJSON = async (): Promise<boolean> => {
  try {
    // 1. Gather Database Data
    const categories = db.getAllSync('SELECT * FROM categories');
    const habits = db.getAllSync('SELECT * FROM habits');
    const checkIns = db.getAllSync('SELECT * FROM check_ins');

    // 2. Gather Preferences Data
    const userProfile = { ...useUserStore.getState().profile };
    // Do not include avatarUri in export
    userProfile.avatarUri = null;

    const themeMode = useThemeStore.getState().theme;
    const languageMode = useLanguageStore.getState().language;

    // 3. Construct Backup Object
    const backupData: BackupData = {
      version: '1.0',
      timestamp: Date.now(),
      database: {
        categories,
        habits,
        check_ins: checkIns,
      },
      preferences: {
        user: { profile: userProfile },
        theme: { theme: themeMode },
        language: { language: languageMode },
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    // 4. Save to temporary file
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `githabit_backup_${dateStr}.json`;
    const file = new File(Paths.cache, fileName);
    if (file.exists) {
      file.delete();
    }
    file.create();
    file.write(jsonString, { encoding: 'utf8' });

    // 5. Share / Export the file
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export GitHabit Data',
      });
      return true;
    } else {
      console.warn('Sharing is not available on this platform');
      return false;
    }
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
};

export const importDataFromJSON = async (): Promise<boolean> => {
  try {
    // 1. Pick a file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return false; // User canceled
    }

    const fileUri = result.assets[0].uri;

    // 2. Read and parse file
    const file = new File(fileUri);
    const fileContent = await file.text();

    let backupData: BackupData;
    try {
      backupData = JSON.parse(fileContent);
    } catch (e) {
      throw new Error('INVALID_JSON');
    }

    // 3. Validate Data Structure
    if (!backupData.version || !backupData.database || !backupData.preferences) {
      throw new Error('INVALID_FORMAT');
    }

    // 4. Restore Database (Inside a transaction)
    db.withTransactionSync(() => {
      // Clear existing tables
      db.execSync('DELETE FROM check_ins;');
      db.execSync('DELETE FROM habits;');
      db.execSync('DELETE FROM categories;');

      const { categories, habits, check_ins } = backupData.database;

      // Restore categories
      if (categories && categories.length > 0) {
        const catStmt = db.prepareSync('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)');
        for (const cat of categories) {
          catStmt.executeSync([cat.id, cat.name, cat.color]);
        }
        catStmt.finalizeSync();
      }

      // Restore habits
      if (habits && habits.length > 0) {
        const habitStmt = db.prepareSync(
          'INSERT INTO habits (id, name, description, plan, unitType, unitLabel, targetValue, color, createdAt, status, pinned, categoryId, deletedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const h of habits) {
          habitStmt.executeSync([
            h.id, h.name, h.description, h.plan, h.unitType, h.unitLabel, h.targetValue, h.color, h.createdAt, h.status, h.pinned, h.categoryId, h.deletedAt
          ]);
        }
        habitStmt.finalizeSync();
      }

      // Restore check_ins
      if (check_ins && check_ins.length > 0) {
        const checkInStmt = db.prepareSync(
          'INSERT INTO check_ins (id, habitId, message, value, targetValue, timestamp, dateString) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        for (const c of check_ins) {
          checkInStmt.executeSync([
            c.id, c.habitId, c.message, c.value, c.targetValue, c.timestamp, c.dateString
          ]);
        }
        checkInStmt.finalizeSync();
      }
    });

    // 5. Restore Preferences
    if (backupData.preferences.user && backupData.preferences.user.profile) {
      const importedProfile = { ...backupData.preferences.user.profile };
      // Preserve current avatar URI, do not overwrite it with imported data
      importedProfile.avatarUri = useUserStore.getState().profile.avatarUri;
      useUserStore.getState().updateProfile(importedProfile);
    }
    
    if (backupData.preferences.theme && backupData.preferences.theme.theme) {
      useThemeStore.getState().setTheme(backupData.preferences.theme.theme);
    }

    if (backupData.preferences.language && backupData.preferences.language.language) {
      useLanguageStore.getState().setLanguage(backupData.preferences.language.language);
    }

    // 6. Refresh Data in Stores
    useHabitStore.getState().fetchData();

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
};
