'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cardzen-safe-spend-percentage';
const DEFAULT_PERCENTAGE = 30;

export function useSafeSpend() {
  const [safeSpendPercentage, setSafeSpendPercentage] = useState<number>(DEFAULT_PERCENTAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItem = localStorage.getItem(STORAGE_KEY);
      if (storedItem) {
        const parsedValue = parseInt(storedItem, 10);
        if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
            setSafeSpendPercentage(parsedValue);
        } else {
            setSafeSpendPercentage(DEFAULT_PERCENTAGE);
        }
      } else {
         setSafeSpendPercentage(DEFAULT_PERCENTAGE);
      }
    } catch (error) {
      console.error('Failed to load safe spend percentage from localStorage', error);
      setSafeSpendPercentage(DEFAULT_PERCENTAGE);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveSafeSpendPercentage = (percentage: number) => {
    try {
      const valueToSave = Math.max(0, Math.min(100, percentage));
      setSafeSpendPercentage(valueToSave);
      localStorage.setItem(STORAGE_KEY, valueToSave.toString());
    } catch (error) {
      console.error('Failed to save safe spend percentage to localStorage', error);
    }
  };

  return { safeSpendPercentage, saveSafeSpendPercentage, isLoaded };
}
