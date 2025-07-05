'use client';

import { useState, useEffect } from 'react';
import { type SpendingHabit } from '@/lib/types';

const STORAGE_KEY = 'cardzen-spending-habits';

export function useSpendingHabits() {
  const [habits, setHabits] = useState<SpendingHabit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        // First try to get habits from the API
        const response = await fetch('/api/spending-habits');
        
        if (response.ok) {
          const data = await response.json();
          setHabits(data || []);
        } else {
          // Fallback to localStorage if API fails
          const storedItems = localStorage.getItem(STORAGE_KEY);
          if (storedItems) {
            setHabits(JSON.parse(storedItems));
          }
        }
      } catch (error) {
        console.error('Failed to load spending habits', error);
        
        // Fallback to localStorage if API fails
        try {
          const storedItems = localStorage.getItem(STORAGE_KEY);
          if (storedItems) {
            setHabits(JSON.parse(storedItems));
          }
        } catch (localError) {
          console.error('Failed to load spending habits from localStorage', localError);
        }
      } finally {
        setIsLoaded(true);
      }
    };

    fetchHabits();
  }, []);

  const saveHabits = async (updatedHabits: SpendingHabit[]) => {
    try {
      // Optimistically update UI
      setHabits(updatedHabits);
      
      // Try to save to the API first
      const response = await fetch('/api/spending-habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHabits),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save to API');
      }
      
      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHabits));
    } catch (error) {
      console.error('Failed to save spending habits', error);
      // Still save to localStorage even if API fails
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHabits));
    }
  };

  return { habits, saveHabits, isLoaded };
}
