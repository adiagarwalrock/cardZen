"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cardzen-safe-spend-percentage";
const DEFAULT_PERCENTAGE = 30;

export function useSafeSpend() {
  const [safeSpendPercentage, setSafeSpendPercentage] =
    useState<number>(DEFAULT_PERCENTAGE);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. DRY localStorage fallback
  const fallbackToLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const value = parseInt(stored, 10);
        if (!isNaN(value) && value >= 0 && value <= 100) {
          setSafeSpendPercentage(value);
          return;
        }
      }
    } catch (err) {
      console.error("LocalStorage parse error", err);
    }
    // default if anything’s wrong
    setSafeSpendPercentage(DEFAULT_PERCENTAGE);
  }, []);

  // 2. Memoized fetch that always has the same identity
  const fetchSafeSpend = useCallback(async () => {
    try {
      const res = await fetch("/api/safe-spend");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.percentage === "number") {
          setSafeSpendPercentage(data.percentage);
        } else {
          fallbackToLocalStorage();
        }
      } else {
        fallbackToLocalStorage();
      }
    } catch (err) {
      console.error("Failed loading from API", err);
      fallbackToLocalStorage();
    } finally {
      setIsLoaded(true);
    }
  }, [fallbackToLocalStorage]);

  // 3. Run it only once, on mount
  useEffect(() => {
    fetchSafeSpend();
  }, [fetchSafeSpend]);

  // 4. Memoized save
  const saveSafeSpendPercentage = useCallback(async (percentage: number) => {
    // clamp
    const valueToSave = Math.max(0, Math.min(100, percentage));
    setSafeSpendPercentage(valueToSave);

    try {
      const res = await fetch("/api/safe-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentage: valueToSave }),
      });
      if (!res.ok) {
        console.warn("API save failed, falling back to localStorage");
      }
    } catch (err) {
      console.error("Error saving to API", err);
    } finally {
      // always back up locally
      localStorage.setItem(STORAGE_KEY, valueToSave.toString());
    }
  }, []);

  // 5. Expose a stable refresh
  const refreshSafeSpend = fetchSafeSpend;

  return {
    safeSpendPercentage,
    saveSafeSpendPercentage,
    refreshSafeSpend,
    isLoaded,
  };
}
