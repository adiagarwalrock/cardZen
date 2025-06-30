'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cardzen-alert-settings';
const DEFAULT_DAYS = 7;

interface AlertSettings {
    alertDays: number;
}

export function useAlertSettings() {
  const [settings, setSettings] = useState<AlertSettings>({ alertDays: DEFAULT_DAYS });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItem = localStorage.getItem(STORAGE_KEY);
      if (storedItem) {
        const parsedSettings = JSON.parse(storedItem);
        if(parsedSettings.alertDays !== undefined) {
            setSettings(parsedSettings);
        }
      }
    } catch (error) {
      console.error('Failed to load alert settings from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveAlertSettings = (updatedSettings: AlertSettings) => {
    try {
      setSettings(updatedSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save alert settings to localStorage', error);
    }
  };

  const saveAlertDays = (days: number) => {
    const valueToSave = Math.max(0, Math.min(30, days)); // Cap at 30 days
    saveAlertSettings({ alertDays: valueToSave });
  }

  return { alertDays: settings.alertDays, saveAlertDays, isLoaded };
}
