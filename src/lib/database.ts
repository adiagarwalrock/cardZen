'use server';

import { CustomListItem, CustomListType } from './types';
import fs from 'fs';
import path from 'path';
import {
  getUserProfileJson,
  saveUserProfileJson,
  getCustomListsJson,
  saveCustomListsJson,
  getCardsJson,
  saveCardsJson,
  getSafeSpendJson,
  saveSafeSpendJson,
  ensureDataDir,
  initializeDefaultData
} from './json-storage';

// Make sure this is only used in server components
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used in server components');
}

let isInitialized = false;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

export async function initializeDatabase() {
  // If already fully initialized, no need to proceed
  if (isInitialized) {
    return;
  }

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
      await ensureDataDir();
      // Initialize default data for first-time setup
      await initializeDefaultData();
      isInitialized = true;
      console.log('JSON data directory initialized successfully');
    } catch (error) {
      console.error('Error initializing JSON data directory:', error);
      throw error;
    } finally {
      isInitializing = false;
      initPromise = null;
    }
  })();

  await initPromise;
}

export async function getUserProfile() {
  await initializeDatabase();
  return getUserProfileJson();
}

export async function saveUserProfile(profile: { theme?: string, name?: string }) {
  await initializeDatabase();
  return saveUserProfileJson(profile);
}

export async function getCustomLists(type?: CustomListType, defaultItems: CustomListItem[] = []) {
  await initializeDatabase();
  return getCustomListsJson(type, defaultItems);
}

export async function saveCustomLists(type: CustomListType, items: CustomListItem[]) {
  await initializeDatabase();
  return saveCustomListsJson(type, items);
}

export async function deleteCustomList(id: number) {
  // This function is kept for API compatibility
  // In our JSON implementation, we manage lists directly in the saveCustomLists function
  console.warn('deleteCustomList is not directly supported in JSON storage - use saveCustomLists instead');
  return { success: true };
}

export async function getCards() {
  await initializeDatabase();
  return getCardsJson();
}

export async function saveCards(cards: any[]) {
  await initializeDatabase();
  return saveCardsJson(cards);
}

export async function getSafeSpend() {
  await initializeDatabase();
  return getSafeSpendJson();
}

export async function saveSafeSpend(percentage: number) {
  await initializeDatabase();
  return saveSafeSpendJson(percentage);
}