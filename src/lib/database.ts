import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any;

export async function initializeDatabase() {
  db = await open({
    filename: './cardzen.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme TEXT
    );

    CREATE TABLE IF NOT EXISTS custom_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      items TEXT
    );
  `);
}

export async function getUserProfile() {
  return db.get('SELECT * FROM user_profile LIMIT 1');
}

export async function saveUserProfile(profile: { theme: string }) {
  const existingProfile = await getUserProfile();
  if (existingProfile) {
    return db.run('UPDATE user_profile SET theme = ? WHERE id = ?', profile.theme, existingProfile.id);
  } else {
    return db.run('INSERT INTO user_profile (theme) VALUES (?)', profile.theme);
  }
}

export async function getCustomLists() {
  return db.all('SELECT * FROM custom_lists');
}

export async function createCustomList(list: { name: string; items: string }) {
  return db.run('INSERT INTO custom_lists (name, items) VALUES (?, ?)', list.name, list.items);
}

export async function updateCustomList(id: number, list: { name: string; items: string }) {
  return db.run('UPDATE custom_lists SET name = ?, items = ? WHERE id = ?', list.name, list.items, id);
}

export async function deleteCustomList(id: number) {
  return db.run('DELETE FROM custom_lists WHERE id = ?', id);
}