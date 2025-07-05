'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cardzen-safe-spend-percentage';
const DEFAULT_PERCENTAGE = 30;

export function useSafeSpend() {
  const [safeSpendPercentage, setSafeSpendPercentage] = useState<number>(DEFAULT_PERCENTAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchSafeSpend = async () => {
      try {
        // First try to get the percentage from the API (database)
        const response = await fetch('/api/safe-spend');

        if (response.ok) {
          const data = await response.json();
          if (data && typeof data.percentage === 'number') {
            setSafeSpendPercentage(data.percentage);
          } else {
            // Fallback to localStorage if API doesn't return valid data
            fallbackToLocalStorage();
          }
        } else {
          // Fallback to localStorage if API fails
          fallbackToLocalStorage();
        }
      } catch (error) {
        console.error('Failed to load safe spend percentage from API', error);
        // Fallback to localStorage if API fails
        fallbackToLocalStorage();
      } finally {
        setIsLoaded(true);
      }
    };

    const fallbackToLocalStorage = () => {
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
      }
    };

    fetchSafeSpend();
  }, []);

  const saveSafeSpendPercentage = async (percentage: number) => {
    try {
      const valueToSave = Math.max(0, Math.min(100, percentage));

      // Optimistically update UI
      setSafeSpendPercentage(valueToSave);

      // Try to save to the database first
      const response = await fetch('/api/safe-spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ percentage: valueToSave }),
      });

      if (!response.ok) {
        console.warn('Failed to save safe spend percentage to database');
      }

      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, valueToSave.toString());
    } catch (error) {
      console.error('Failed to save safe spend percentage', error);
      // Still save to localStorage even if API fails
      const valueToSave = Math.max(0, Math.min(100, percentage));
      localStorage.setItem(STORAGE_KEY, valueToSave.toString());
    }
  };

  // Function to refresh safe spend percentage from the database
  const refreshSafeSpend = async () => {
    try {
      const response = await fetch('/api/safe-spend');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.percentage === 'number') {
          setSafeSpendPercentage(data.percentage);
        }
      }
    } catch (error) {
      console.error('Failed to refresh safe spend percentage', error);
    }
  };

  return { safeSpendPercentage, saveSafeSpendPercentage, refreshSafeSpend, isLoaded };
}
