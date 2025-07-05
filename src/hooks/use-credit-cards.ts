'use client';

import { useState, useEffect } from 'react';
import { type CreditCard } from '@/lib/types';

// Fallback key for local storage
const STORAGE_KEY = 'cardzen-credit-cards';

export function useCreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch cards from API (which gets from DB)
  useEffect(() => {
    const fetchCards = async () => {
      try {
        // First try to get cards from the API (database)
        const response = await fetch('/api/cards');

        if (response.ok) {
          const data = await response.json();
          setCards(data || []);
        } else {
          // Fallback to localStorage if API fails
          const storedItems = localStorage.getItem(STORAGE_KEY);
          if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            // Simple migration for old data structure
            const migratedCards = parsedItems.map((card: any) => {
              const newCard = { ...card };
              if (typeof card.dueDate === 'string' && card.dueDate) {
                newCard.dueDate = new Date(card.dueDate).getDate();
              }
              if (typeof card.statementDate === 'string' && card.statementDate) {
                newCard.statementDate = new Date(card.statementDate).getDate();
              }
              return newCard;
            });
            setCards(migratedCards);
          }
        }
      } catch (error) {
        console.error('Failed to load cards', error);

        // Fallback to localStorage if API fails
        try {
          const storedItems = localStorage.getItem(STORAGE_KEY);
          if (storedItems) {
            setCards(JSON.parse(storedItems));
          }
        } catch (localError) {
          console.error('Failed to load cards from localStorage', localError);
        }
      } finally {
        setIsLoaded(true);
      }
    };

    fetchCards();
  }, []);

  const saveCards = async (updatedCards: CreditCard[]) => {
    try {
      // Optimistically update UI
      setCards(updatedCards);

      // Try to save to the database first
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCards),
      });

      if (!response.ok) {
        throw new Error('Failed to save to database');
      }

      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to save cards', error);
      // Still save to localStorage even if API fails
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    }
  };

  const addCard = (card: Omit<CreditCard, 'id'>): CreditCard => {
    const newCard: CreditCard = { ...card, id: crypto.randomUUID() };
    saveCards([...cards, newCard]);
    return newCard;
  };

  const updateCard = (updatedCard: CreditCard) => {
    const updatedCards = cards.map((card) =>
      card.id === updatedCard.id ? updatedCard : card
    );
    saveCards(updatedCards);
  };

  const deleteCard = (cardId: string) => {
    const updatedCards = cards.filter((card) => card.id !== cardId);
    saveCards(updatedCards);
  };

  // Function to refresh cards from the database
  const refreshCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (response.ok) {
        const data = await response.json();
        setCards(data || []);
      }
    } catch (error) {
      console.error('Failed to refresh cards', error);
    }
  };

  return { cards, addCard, updateCard, deleteCard, refreshCards, isLoaded };
}
