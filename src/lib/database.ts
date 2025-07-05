'use server';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { CustomListItem, CustomListType } from './types';
import fs from 'fs';
import path from 'path';

// Make sure this is only used in server components
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used in server components');
}

let db: any = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

export async function initializeDatabase() {
  // If already initialized, return immediately
  if (db) return;

  // If initialization is in progress, wait for it to complete
  if (initPromise) {
    await initPromise;
    return;
  }

  // Set initializing flag
  isInitializing = true;

  // Create a promise to track initialization
  initPromise = (async () => {
    try {
      // Ensure the data directory exists
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dbPath = path.join(dataDir, 'cardzen.db');
      console.log(`Initializing database at ${dbPath}`);

      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });

      await db.exec(`
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          theme TEXT,
          name TEXT
        );

        CREATE TABLE IF NOT EXISTS custom_lists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          items TEXT
        );

        CREATE TABLE IF NOT EXISTS cards (
          id TEXT PRIMARY KEY,
          data TEXT
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      db = null;
      throw error;
    } finally {
      isInitializing = false;
      initPromise = null;
    }
  })();

  await initPromise;
}

export async function getUserProfile() {
  if (!db) await initializeDatabase();

  try {
    const profile = await db.get('SELECT * FROM user_profile LIMIT 1');
    return profile || { theme: 'system', name: '' }; // Return default if no profile exists
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { theme: 'system', name: '' }; // Return default on error
  }
}

export async function saveUserProfile(profile: { theme?: string, name?: string }) {
  if (!db) await initializeDatabase();

  try {
    const existingProfile = await getUserProfile();
    if (existingProfile && existingProfile.id) {
      // Update existing profile with provided fields, keeping existing values for any missing fields
      const updatedTheme = profile.theme ?? existingProfile.theme;
      const updatedName = profile.name ?? existingProfile.name;

      await db.run(
        'UPDATE user_profile SET theme = ?, name = ? WHERE id = ?',
        updatedTheme,
        updatedName,
        existingProfile.id
      );

      return { ...existingProfile, theme: updatedTheme, name: updatedName };
    } else {
      // Insert new profile with defaults for any missing fields
      const result = await db.run(
        'INSERT INTO user_profile (theme, name) VALUES (?, ?)',
        profile.theme || 'system',
        profile.name || ''
      );
      return {
        id: result.lastID,
        theme: profile.theme || 'system',
        name: profile.name || ''
      };
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

export async function getCustomLists(type?: CustomListType, defaultItems: CustomListItem[] = []) {
  if (!db) await initializeDatabase();

  try {
    if (type) {
      const result = await db.get('SELECT items FROM custom_lists WHERE type = ?', type);
      if (result && result.items) {
        try {
          return JSON.parse(result.items);
        } catch (parseError) {
          console.error(`Error parsing JSON for ${type}:`, parseError);
          return defaultItems;
        }
      }
      return defaultItems;
    } else {
      // Return all lists if no type specified
      const results = await db.all('SELECT * FROM custom_lists');

      // Parse items JSON for each list
      return results.map((list: any) => {
        if (list.items) {
          try {
            list.items = JSON.parse(list.items);
          } catch (parseError) {
            console.error(`Error parsing JSON for list ${list.type}:`, parseError);
            list.items = [];
          }
        }
        return list;
      }) || [];
    }
  } catch (error) {
    console.error(`Error getting custom lists:`, error);
    return type ? defaultItems : [];
  }
}

export async function saveCustomLists(type: CustomListType, items: CustomListItem[]) {
  if (!db) await initializeDatabase();

  try {
    const itemsJson = JSON.stringify(items);
    const existing = await db.get('SELECT id FROM custom_lists WHERE type = ?', type);

    if (existing) {
      return db.run('UPDATE custom_lists SET items = ? WHERE type = ?', itemsJson, type);
    } else {
      return db.run('INSERT INTO custom_lists (type, items) VALUES (?, ?)', type, itemsJson);
    }
  } catch (error) {
    console.error(`Error saving custom lists for type ${type}:`, error);
    throw error;
  }
}

export async function deleteCustomList(id: number) {
  return db.run('DELETE FROM custom_lists WHERE id = ?', id);
}

export async function getCards() {
  if (!db) await initializeDatabase();

  try {
    const result = await db.all('SELECT data FROM cards');
    return result.map((row: any) => {
      try {
        return JSON.parse(row.data);
      } catch (error) {
        console.error('Error parsing card data:', error);
        return null;
      }
    }).filter((card: any) => card !== null);
  } catch (error) {
    console.error('Error getting cards:', error);
    return [];
  }
}

export async function saveCards(cards: any[]) {
  if (!db) await initializeDatabase();

  try {
    // Start a transaction
    await db.run('BEGIN TRANSACTION');

    // Clear existing cards
    await db.run('DELETE FROM cards');

    // Insert each card
    for (const card of cards) {
      await db.run(
        'INSERT INTO cards (id, data) VALUES (?, ?)',
        card.id,
        JSON.stringify(card)
      );
    }

    // Commit the transaction
    await db.run('COMMIT');

    return { success: true };
  } catch (error) {
    // Rollback on error
    await db.run('ROLLBACK');
    console.error('Error saving cards:', error);
    throw error;
  }
}

export async function getSafeSpend() {
  if (!db) await initializeDatabase();

  try {
    const result = await db.get('SELECT value FROM settings WHERE key = ?', 'safeSpendPercentage');
    if (result && result.value) {
      return parseInt(result.value, 10);
    }
    return 30; // Default percentage if not found
  } catch (error) {
    console.error('Error getting safe spend percentage:', error);
    return 30; // Default on error
  }
}

export async function saveSafeSpend(percentage: number) {
  if (!db) await initializeDatabase();

  try {
    const existing = await db.get('SELECT 1 FROM settings WHERE key = ?', 'safeSpendPercentage');
    if (existing) {
      return db.run('UPDATE settings SET value = ? WHERE key = ?', percentage.toString(), 'safeSpendPercentage');
    } else {
      return db.run('INSERT INTO settings (key, value) VALUES (?, ?)', 'safeSpendPercentage', percentage.toString());
    }
  } catch (error) {
    console.error('Error saving safe spend percentage:', error);
    throw error;
  }
}