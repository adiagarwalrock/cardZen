'use server';

import fs from 'fs';
import path from 'path';
import { CustomListItem, CustomListType, CreditCard } from './types';

// Make sure this is only used in server components
if (typeof window !== 'undefined') {
    throw new Error('This module can only be used in server components');
}

// Define the data directory
const DATA_DIR = path.join(process.cwd(), 'data', 'json');

// Ensure the data directory exists
export async function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Helper function to read JSON file
async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return defaultValue;
    }

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data) as T;
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return defaultValue;
    }
}

// Helper function to write JSON file
async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        throw error;
    }
}

// User Profile functions
export async function getUserProfileJson() {
    return readJsonFile<{ theme: string; name: string; id?: number }>('user-profile.json', { theme: 'system', name: '' });
}

export async function saveUserProfileJson(profile: { theme?: string; name?: string }) {
    const existingProfile = await getUserProfileJson();
    const updatedProfile = {
        ...existingProfile,
        theme: profile.theme ?? existingProfile.theme,
        name: profile.name ?? existingProfile.name,
        id: existingProfile.id || 1
    };

    await writeJsonFile('user-profile.json', updatedProfile);
    return updatedProfile;
}

// Custom Lists functions
export async function getCustomListsJson(type?: CustomListType, defaultItems: CustomListItem[] = []) {
    if (type) {
        return readJsonFile<CustomListItem[]>(`custom-lists-${type}.json`, defaultItems);
    } else {
        // Get all custom lists
        const providers = await readJsonFile<CustomListItem[]>(`custom-lists-${CustomListType.Provider}.json`, []);
        const networks = await readJsonFile<CustomListItem[]>(`custom-lists-${CustomListType.Network}.json`, []);
        const perks = await readJsonFile<CustomListItem[]>(`custom-lists-${CustomListType.Perk}.json`, []);

        return [
            { type: CustomListType.Provider, items: providers },
            { type: CustomListType.Network, items: networks },
            { type: CustomListType.Perk, items: perks }
        ];
    }
}

export async function saveCustomListsJson(type: CustomListType, items: CustomListItem[]) {
    await writeJsonFile(`custom-lists-${type}.json`, items);
    return { success: true };
}

// Cards functions
export async function getCardsJson() {
    return readJsonFile<CreditCard[]>('cards.json', []);
}

export async function saveCardsJson(cards: CreditCard[]) {
    await writeJsonFile('cards.json', cards);
    return { success: true };
}

// Settings functions
export async function getSafeSpendJson() {
    const settings = await readJsonFile<{ safeSpendPercentage: number }>('settings.json', { safeSpendPercentage: 30 });
    return settings.safeSpendPercentage;
}

export async function saveSafeSpendJson(percentage: number) {
    const settings = await readJsonFile<Record<string, any>>('settings.json', {});
    settings.safeSpendPercentage = percentage;
    await writeJsonFile('settings.json', settings);
    return { success: true };
}

// Alert Settings functions
export async function getAlertSettingsJson() {
    return readJsonFile<{ alertDays: number }>('alert-settings.json', { alertDays: 7 });
}

export async function saveAlertSettingsJson(settings: { alertDays: number }) {
    await writeJsonFile('alert-settings.json', settings);
    return { success: true };
}

// Security Settings functions
export async function getSecuritySettingsJson() {
    return readJsonFile<{ biometricEnabled: boolean, pinEnabled: boolean }>('security-settings.json', { biometricEnabled: false, pinEnabled: false });
}

export async function saveSecuritySettingsJson(settings: { biometricEnabled?: boolean, pinEnabled?: boolean }) {
    const existingSettings = await getSecuritySettingsJson();
    const updatedSettings = {
        ...existingSettings,
        ...settings
    };
    await writeJsonFile('security-settings.json', updatedSettings);
    return { success: true };
}

// Spending Habits functions
export async function getSpendingHabitsJson() {
    return readJsonFile<Array<{ id: string, category: string, amount: number }>>('spending-habits.json', []);
}

export async function saveSpendingHabitsJson(habits: Array<{ id: string, category: string, amount: number }>) {
    await writeJsonFile('spending-habits.json', habits);
    return { success: true };
}

// Initialize default data for first-time setup
export async function initializeDefaultData() {
    // Default providers
    const defaultProviders: CustomListItem[] = [
        { id: 'chase', name: 'Chase' },
        { id: 'amex', name: 'American Express' },
        { id: 'citi', name: 'Citibank' },
        { id: 'capital-one', name: 'Capital One' },
        { id: 'discover', name: 'Discover' },
        { id: 'wells-fargo', name: 'Wells Fargo' },
        { id: 'bank-of-america', name: 'Bank of America' }
    ];

    // Default networks
    const defaultNetworks: CustomListItem[] = [
        { id: 'visa', name: 'Visa' },
        { id: 'mastercard', name: 'Mastercard' },
        { id: 'amex', name: 'American Express' },
        { id: 'discover', name: 'Discover' }
    ];

    // Default perks
    const defaultPerks: CustomListItem[] = [
        { id: 'airport-lounge', name: 'Airport Lounge Access' },
        { id: 'travel-credit', name: 'Annual Travel Credit' },
        { id: 'purchase-protection', name: 'Purchase Protection' },
        { id: 'extended-warranty', name: 'Extended Warranty' },
        { id: 'rental-insurance', name: 'Rental Car Insurance' },
        { id: 'tsa-precheck', name: 'TSA PreCheck/Global Entry Credit' },
        { id: 'no-foreign-transaction', name: 'No Foreign Transaction Fees' },
        { id: 'hotel-status', name: 'Hotel Elite Status' },
        { id: 'concierge', name: 'Concierge Service' },
        { id: 'cell-phone-protection', name: 'Cell Phone Protection' }
    ];

    // Check if these files already exist, and only create them if they don't
    const providersPath = path.join(DATA_DIR, `custom-lists-${CustomListType.Provider}.json`);
    const networksPath = path.join(DATA_DIR, `custom-lists-${CustomListType.Network}.json`);
    const perksPath = path.join(DATA_DIR, `custom-lists-${CustomListType.Perk}.json`);
    const settingsPath = path.join(DATA_DIR, 'settings.json');
    const userProfilePath = path.join(DATA_DIR, 'user-profile.json');

    // Only initialize if the files don't exist
    if (!fs.existsSync(providersPath)) {
        await saveCustomListsJson(CustomListType.Provider, defaultProviders);
    }

    if (!fs.existsSync(networksPath)) {
        await saveCustomListsJson(CustomListType.Network, defaultNetworks);
    }

    if (!fs.existsSync(perksPath)) {
        await saveCustomListsJson(CustomListType.Perk, defaultPerks);
    }

    // Initialize settings if they don't exist
    if (!fs.existsSync(settingsPath)) {
        await saveSafeSpendJson(30); // Default safe spend percentage is 30%
    }

    // Initialize user profile if it doesn't exist
    if (!fs.existsSync(userProfilePath)) {
        await saveUserProfileJson({ theme: 'system', name: 'CardZen User' });
    }
}
