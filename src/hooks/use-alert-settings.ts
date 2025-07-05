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
    const fetchSettings = async () => {
      try {
        // First try to get settings from the API
        const response = await fetch('/api/alert-settings');
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          // Fallback to localStorage if API fails
          const storedItem = localStorage.getItem(STORAGE_KEY);
          if (storedItem) {
            const parsedSettings = JSON.parse(storedItem);
            if(parsedSettings.alertDays !== undefined) {
                setSettings(parsedSettings);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load alert settings', error);
        
        // Fallback to localStorage if API fails
        try {
          const storedItem = localStorage.getItem(STORAGE_KEY);
          if (storedItem) {
            const parsedSettings = JSON.parse(storedItem);
            if(parsedSettings.alertDays !== undefined) {
                setSettings(parsedSettings);
            }
          }
        } catch (localError) {
          console.error('Failed to load alert settings from localStorage', localError);
        }
      } finally {
        setIsLoaded(true);
      }
    };

    fetchSettings();
  }, []);

  const saveAlertSettings = async (updatedSettings: AlertSettings) => {
    try {
      // Optimistically update UI
      setSettings(updatedSettings);
      
      // Try to save to the API first
      const response = await fetch('/api/alert-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save to API');
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save alert settings', error);
      // Still save to localStorage even if API fails
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    }
  };

  const saveAlertDays = (days: number) => {
    const valueToSave = Math.max(0, Math.min(30, days)); // Cap at 30 days
    saveAlertSettings({ alertDays: valueToSave });
  }

  return { alertDays: settings.alertDays, saveAlertDays, isLoaded };
}
