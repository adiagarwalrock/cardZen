'use client';

import { useState, useEffect } from 'react';
import { type SpendingHabit } from '@/lib/types';

const STORAGE_KEY = 'cardzen-spending-habits';

export function useSpendingHabits() {
  const [habits, setHabits] = useState<SpendingHabit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        setHabits(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Failed to load habits from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveHabits = (updatedHabits: SpendingHabit[]) => {
    try {
      setHabits(updatedHabits);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHabits));
    } catch (error) {
      console.error('Failed to save habits to localStorage', error);
    }
  };

  return { habits, saveHabits, isLoaded };
}
