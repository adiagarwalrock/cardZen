'use client';

import { useEffect } from 'react';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { useCustomLists } from '@/hooks/use-custom-lists';
import { useSafeSpend } from '@/hooks/use-safe-spend';
import { useUserProfile } from '@/hooks/use-user-profile';

/**
 * Preload all application data for improved user experience
 */
export default function DataPreloader() {
    // Initialize all data hooks to preload data
    const { refreshCards } = useCreditCards();
    const { refreshLists } = useCustomLists();
    const { refreshSafeSpend } = useSafeSpend();
    const { isLoaded: isProfileLoaded } = useUserProfile();

    useEffect(() => {
      // Preload all data
      const preloadData = async () => {
        try {
          console.log("Preloading application data...");

          // Load all data in parallel
          await Promise.all([
            refreshCards(),
            refreshLists(),
            refreshSafeSpend(),
          ]);

          console.log("Data preloading complete");
        } catch (error) {
          console.error("Error preloading data:", error);
        }
      };

      preloadData();
    }, []);

    // This component doesn't render anything
    return null;
}
