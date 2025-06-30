'use client';

import { useState, useEffect } from 'react';
import { type CustomListItem } from '@/lib/types';

const PROVIDERS_STORAGE_KEY = 'cardzen-providers';
const NETWORKS_STORAGE_KEY = 'cardzen-networks';

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


export function useCustomLists() {
  const [providers, setProviders] = useState<CustomListItem[]>([]);
  const [networks, setNetworks] = useState<CustomListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProviders = localStorage.getItem(PROVIDERS_STORAGE_KEY);
      if (storedProviders && JSON.parse(storedProviders).length > 0) {
        setProviders(JSON.parse(storedProviders));
      } else {
        setProviders(defaultProviders);
        localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(defaultProviders));
      }

      const storedNetworks = localStorage.getItem(NETWORKS_STORAGE_KEY);
      if (storedNetworks && JSON.parse(storedNetworks).length > 0) {
        setNetworks(JSON.parse(storedNetworks));
      } else {
        setNetworks(defaultNetworks);
        localStorage.setItem(NETWORKS_STORAGE_KEY, JSON.stringify(defaultNetworks));
      }
    } catch (error) {
      console.error('Failed to load custom lists from localStorage', error);
      // Set defaults on error to prevent app crash
      setProviders(defaultProviders);
      setNetworks(defaultNetworks);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProviders = (updatedProviders: CustomListItem[]) => {
    try {
      setProviders(updatedProviders);
      localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(updatedProviders));
    } catch (error) {
      console.error('Failed to save providers to localStorage', error);
    }
  };
  
  const saveNetworks = (updatedNetworks: CustomListItem[]) => {
    try {
      setNetworks(updatedNetworks);
      localStorage.setItem(NETWORKS_STORAGE_KEY, JSON.stringify(updatedNetworks));
    } catch (error) {
      console.error('Failed to save networks to localStorage', error);
    }
  };

  const addProvider = (name: string) => {
    if (!name.trim() || providers.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) return;
    const newItem: CustomListItem = { id: crypto.randomUUID(), name: name.trim() };
    saveProviders([...providers, newItem].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const deleteProvider = (id: string) => {
    saveProviders(providers.filter((item) => item.id !== id));
  };
  
  const addNetwork = (name: string) => {
     if (!name.trim() || networks.some(n => n.name.toLowerCase() === name.trim().toLowerCase())) return;
    const newItem: CustomListItem = { id: crypto.randomUUID(), name: name.trim() };
    saveNetworks([...networks, newItem].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const deleteNetwork = (id: string) => {
    saveNetworks(networks.filter((item) => item.id !== id));
  };

  return { providers, addProvider, deleteProvider, networks, addNetwork, deleteNetwork, isLoaded };
}
