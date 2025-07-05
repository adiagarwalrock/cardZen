'use client';

import { useEffect, useState } from 'react';
import { initDbOnStartup } from '@/lib/actions';

export default function AppInitializer() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Only run initialization once
        if (!isInitialized) {
            const initialize = async () => {
                try {
                    await initDbOnStartup();
                    console.log('App initialization complete');
                    setIsInitialized(true);
                } catch (error) {
                    console.error('Failed to initialize app:', error);
                }
            };

            initialize();
        }
    }, [isInitialized]);

    // This component doesn't render anything
    return null;
}
