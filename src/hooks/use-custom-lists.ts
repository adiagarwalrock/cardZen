'use client';

import { useState, useEffect } from 'react';
import { type CustomListItem, CustomListType } from '@/lib/types';

const defaultProviders: CustomListItem[] = [
  { id: 'prov-1', name: 'Chase' },
  { id: 'prov-2', name: 'American Express' },
  { id: 'prov-3', name: 'Capital One' },
  { id: 'prov-4', name: 'Bank of America' },
  { id: 'prov-5', name: 'Citi' },
  { id: 'prov-6', name: 'Discover' },
];

const defaultNetworks: CustomListItem[] = [
  { id: 'net-1', name: 'Visa' },
  { id: 'net-2', name: 'Mastercard' },
  { id: 'net-3', name: 'American Express' },
  { id: 'net-4', name: 'Discover' },
];

const defaultPerks: CustomListItem[] = [
  { id: 'perk-1', name: 'Lounge Access' },
  { id: 'perk-2', name: 'Travel Insurance' },
  { id: 'perk-3', name: 'No Foreign Transaction Fees' },
  { id: 'perk-4', name: 'Extended Warranty' },
  { id: 'perk-5', name: 'Purchase Protection' },
];


export function useCustomLists() {
  const [providers, setProviders] = useState<CustomListItem[]>([]);
  const [networks, setNetworks] = useState<CustomListItem[]>([]);
  const [perks, setPerks] = useState<CustomListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use a flag to prevent duplicate requests
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Track last refresh time to prevent excessive calls
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  const fetchLists = async () => {
    // Prevent multiple concurrent fetches
    if (isRefreshing) return;

    // Don't refresh if we've refreshed in the last 5 seconds
    const now = Date.now();
    if (now - lastRefreshTime < 5000 && isLoaded) return;

    try {
      setIsRefreshing(true);
      const response = await fetch('/api/custom-lists', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      if (data) {
        setProviders(data.providers || defaultProviders);
        setNetworks(data.networks || defaultNetworks);
        setPerks(data.perks || defaultPerks);
      }
      setLastRefreshTime(now);
    } catch (error) {
      console.error('Failed to load custom lists', error);
    } finally {
      setIsLoaded(true);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const saveLists = async (type: CustomListType, items: CustomListItem[]) => {
    try {
      await fetch('/api/custom-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, items }),
      });
      // Fetch the updated lists after saving
      await fetchLists();
    } catch (error) {
      console.error('Failed to save custom lists', error);
    }
  };

  const addProvider = (name: string) => {
    if (!name.trim() || providers.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      return;
    }
    const newItem: CustomListItem = { id: crypto.randomUUID(), name: name.trim() };
    const updatedProviders = [...providers, newItem].sort((a, b) => a.name.localeCompare(b.name));
    setProviders(updatedProviders); // Optimistic update
    saveLists(CustomListType.Provider, updatedProviders);
  };

  const deleteProvider = (id: string) => {
    const updatedProviders = providers.filter((item) => item.id !== id);
    setProviders(updatedProviders); // Optimistic update
    saveLists(CustomListType.Provider, updatedProviders);
  };

  const addNetwork = (name: string) => {
    if (!name.trim() || networks.some(n => n.name.toLowerCase() === name.trim().toLowerCase())) {
      return;
    }
    const newItem: CustomListItem = { id: crypto.randomUUID(), name: name.trim() };
    const updatedNetworks = [...networks, newItem].sort((a, b) => a.name.localeCompare(b.name));
    setNetworks(updatedNetworks); // Optimistic update
    saveLists(CustomListType.Network, updatedNetworks);
  };

  const deleteNetwork = (id: string) => {
    const updatedNetworks = networks.filter((item) => item.id !== id);
    setNetworks(updatedNetworks); // Optimistic update
    saveLists(CustomListType.Network, updatedNetworks);
  };

  const addPerk = (name: string) => {
    if (!name.trim() || perks.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      return;
    }
    const newItem: CustomListItem = { id: crypto.randomUUID(), name: name.trim() };
    const updatedPerks = [...perks, newItem].sort((a, b) => a.name.localeCompare(b.name));
    setPerks(updatedPerks); // Optimistic update
    saveLists(CustomListType.Perk, updatedPerks);
  };

  const deletePerk = (id: string) => {
    const updatedPerks = perks.filter((item) => item.id !== id);
    setPerks(updatedPerks); // Optimistic update
    saveLists(CustomListType.Perk, updatedPerks);
  };

  return {
    providers,
    addProvider,
    deleteProvider,
    networks,
    addNetwork,
    deleteNetwork,
    perks,
    addPerk,
    deletePerk,
    isLoaded,
    refreshLists: fetchLists, // Expose refresh function
  };
}
