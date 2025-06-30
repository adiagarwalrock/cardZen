'use client';

import { useState, useEffect } from 'react';
import { type CreditCard } from '@/lib/types';

const STORAGE_KEY = 'cardzen-credit-cards';

export function useCreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
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
    } catch (error) {
      console.error('Failed to load cards from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveCards = (updatedCards: CreditCard[]) => {
    try {
      setCards(updatedCards);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Failed to save cards to localStorage', error);
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

  return { cards, addCard, updateCard, deleteCard, isLoaded };
}
