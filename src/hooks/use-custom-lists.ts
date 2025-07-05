'use client';

import { useState, useEffect } from 'react';
import { type CustomListItem, CustomListType } from '@/lib/types';
import { getCustomLists, saveCustomLists } from '@/lib/database';

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

  useEffect(() => {
    const loadLists = async () => {
      try {
        const storedProviders = await getCustomLists(CustomListType.Provider, defaultProviders);
        setProviders(storedProviders);

        const storedNetworks = await getCustomLists(CustomListType.Network, defaultNetworks);
        setNetworks(storedNetworks);

        const storedPerks = await getCustomLists(CustomListType.Perk, defaultPerks);
        setPerks(storedPerks);
      }

    } catch (error) {
      console.error('Failed to load custom lists from localStorage', error);
      // Set defaults on error to prevent app crash
      setProviders(defaultProviders);
      setNetworks(defaultNetworks);
      setPerks(defaultPerks);
    } finally {
      setIsLoaded(true);
    }
    };

    loadLists();
  }, []);

  const saveProviders = (updatedProviders: CustomListItem[]) => {
    saveCustomLists(CustomListType.Provider, updatedProviders).then(() => {
      setProviders(updatedProviders);
    }).catch(error => console.error('Failed to save providers to database', error));
  };

  const saveNetworks = (updatedNetworks: CustomListItem[]) => {
    saveCustomLists(CustomListType.Network, updatedNetworks).then(() => {
      setNetworks(updatedNetworks);
    }).catch(error => console.error('Failed to save networks to database', error));
  };

  const savePerks = (updatedPerks: CustomListItem[]) => {
    saveCustomLists(CustomListType.Perk, updatedPerks).then(() => {
      setPerks(updatedPerks);
    }).catch(error => console.error('Failed to save perks to database', error));
  };

  const addProvider = (name: string) => {
    if (!name.trim() || providers.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      return;
    }
    const newItem: CustomListItem = { id: crypto.randomUUID(), name: name.trim() };
    saveProviders([...providers, newItem].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const deleteProvider = (id: string) => {
    saveProviders(providers.filter((item) => item.id !== id));
  };
  
 const addNetwork = (name: string) => {
     if (!name.trim() || networks.some(n => n.name.toLowerCase() === name.trim().toLowerCase())) return;
    if (!name.trim() || networks.some(n => n.name.toLowerCase() === name.trim().toLowerCase())) {
      return;
    }
    const newItem: CustomListItem = { id: crypto.randomUUID(), name: name.trim() };
    saveNetworks([...networks, newItem].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const deleteNetwork = (id: string) => {
    saveNetworks(networks.filter((item) => item.id !== id));
  };

  const addPerk = (name: string) => {
    if (!name.trim() || perks.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
      return;
    }
    const newItem: CustomListItem = { id: crypto.randomUUID(), name: name.trim() };
    savePerks([...perks, newItem].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const deletePerk = (id: string) => {
    savePerks(perks.filter((item) => item.id !== id));
  };

  return {
    providers, addProvider, deleteProvider,
    networks, addNetwork, deleteNetwork,
    perks, addPerk, deletePerk,
    isLoaded 
  };
}
