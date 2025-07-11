"use client";

import { useState, useEffect, useCallback } from "react";
import { type CreditCard } from "@/lib/types";

const STORAGE_KEY = "cardzen-credit-cards";

export function useCreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. DRY fallback
  const loadFromStorage = useCallback(() => {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return;
    try {
      const parsed = JSON.parse(json) as any[];
      const migrated = parsed.map((card) => {
        const c: any = { ...card };
        if (typeof card.dueDate === "string") {
          c.dueDate = new Date(card.dueDate).getDate();
        }
        if (typeof card.statementDate === "string") {
          c.statementDate = new Date(card.statementDate).getDate();
        }
        return c as CreditCard;
      });
      setCards(migrated);
    } catch {
      console.error("Failed to parse stored cards");
    }
  }, []);

  // 2. Memoized fetch
  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/cards");
      if (res.ok) {
        const data: CreditCard[] = await res.json();
        setCards(data);
      } else {
        loadFromStorage();
      }
    } catch (err) {
      console.error("Fetch failed, loading from storage", err);
      loadFromStorage();
    } finally {
      setIsLoaded(true);
    }
  }, [loadFromStorage]);

  // 3. Run once on mount
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const saveCards = useCallback(async (updated: CreditCard[]) => {
    setCards(updated);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Save failed, falling back to storage", err);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, []);

  const addCard = useCallback(
    (card: Omit<CreditCard, "id">) => {
      const newCard = { ...card, id: crypto.randomUUID() };
      saveCards([...cards, newCard]);
      return newCard;
    },
    [cards, saveCards]
  );

  const updateCard = useCallback(
    (updatedCard: CreditCard) => {
      saveCards(cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    },
    [cards, saveCards]
  );

  const deleteCard = useCallback(
    (id: string) => {
      saveCards(cards.filter((c) => c.id !== id));
    },
    [cards, saveCards]
  );

  // Expose the same memoized fetch
  const refreshCards = fetchCards;

  return {
    cards,
    isLoaded,
    addCard,
    updateCard,
    deleteCard,
    refreshCards,
  };
}
