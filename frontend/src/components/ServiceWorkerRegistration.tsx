'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/serviceWorker';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        // Only register in production
        if (process.env.NODE_ENV === 'production') {
            registerServiceWorker().then((registration) => {
                if (registration) {
                    console.log('[App] Service worker registered successfully');
                }
            });
        }
    }, []);

    return null;
}
