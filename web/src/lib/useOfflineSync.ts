/**
 * ============================================
 * USE OFFLINE SYNC HOOK - Cermont FSM
 * React hook for offline-first operations
 * ============================================
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineManager, STORES, PendingSyncItem } from './offline-manager';
import { apiClient } from './api-client';

// Types
interface SyncStatus {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    lastSyncAt: Date | null;
    error: string | null;
}

interface UseOfflineSyncOptions {
    autoSync?: boolean;
    syncInterval?: number; // ms
    onSyncSuccess?: () => void;
    onSyncError?: (error: Error) => void;
}

/**
 * Hook for managing offline-first data operations
 */
export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
    const {
        autoSync = true,
        syncInterval = 30000, // 30 seconds
        onSyncSuccess,
        onSyncError,
    } = options;

    const [status, setStatus] = useState<SyncStatus>({
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncAt: null,
        error: null,
    });

    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Update pending count
     */
    const updatePendingCount = useCallback(async () => {
        try {
            const count = await offlineManager.getPendingSyncCount();
            setStatus(prev => ({ ...prev, pendingCount: count }));
        } catch (err) {
            console.error('Error getting pending count:', err);
        }
    }, []);

    /**
     * Sync a single item to the server
     */
    const syncItem = async (item: PendingSyncItem): Promise<boolean> => {
        try {
            let endpoint = `/api/${item.entity}`;

            switch (item.type) {
                case 'CREATE':
                    await apiClient.post(endpoint, item.data);
                    break;
                case 'UPDATE':
                    await apiClient.put(`${endpoint}/${item.data.id}`, item.data);
                    break;
                case 'DELETE':
                    await apiClient.delete(`${endpoint}/${item.data.id}`);
                    break;
            }

            await offlineManager.removePendingSyncItem(item.id);
            return true;
        } catch (err) {
            console.error(`Failed to sync item ${item.id}:`, err);
            await offlineManager.incrementRetries(item.id);
            return false;
        }
    };

    /**
     * Sync all pending items
     */
    const syncAll = useCallback(async () => {
        if (!status.isOnline || status.isSyncing) return;

        setStatus(prev => ({ ...prev, isSyncing: true, error: null }));

        try {
            const pendingItems = await offlineManager.getPendingSyncItems();

            if (pendingItems.length === 0) {
                setStatus(prev => ({
                    ...prev,
                    isSyncing: false,
                    pendingCount: 0,
                    lastSyncAt: new Date(),
                }));
                return;
            }

            let successCount = 0;
            let failCount = 0;

            // Sync items in order (oldest first)
            const sortedItems = pendingItems.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            for (const item of sortedItems) {
                // Skip items with too many retries
                if (item.retries >= 5) {
                    console.warn(`Skipping item ${item.id} due to too many retries`);
                    continue;
                }

                const success = await syncItem(item);
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
            }

            const newCount = await offlineManager.getPendingSyncCount();

            setStatus(prev => ({
                ...prev,
                isSyncing: false,
                pendingCount: newCount,
                lastSyncAt: new Date(),
                error: failCount > 0 ? `${failCount} items failed to sync` : null,
            }));

            if (failCount === 0 && onSyncSuccess) {
                onSyncSuccess();
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Sync failed');
            setStatus(prev => ({
                ...prev,
                isSyncing: false,
                error: error.message,
            }));
            onSyncError?.(error);
        }
    }, [status.isOnline, status.isSyncing, onSyncSuccess, onSyncError]);

    /**
     * Queue an operation for later sync
     */
    const queueOperation = useCallback(async (
        type: 'CREATE' | 'UPDATE' | 'DELETE',
        entity: string,
        data: any
    ): Promise<string> => {
        const id = await offlineManager.addToPendingSync({ type, entity, data });
        await updatePendingCount();

        // If online, try to sync immediately
        if (status.isOnline && autoSync) {
            syncAll();
        }

        return id;
    }, [status.isOnline, autoSync, syncAll, updatePendingCount]);

    /**
     * Save data with offline support
     */
    const saveOfflineFirst = useCallback(async <T extends { id?: string }>(
        entity: string,
        data: T,
        isNew: boolean = true
    ): Promise<{ success: boolean; queued: boolean }> => {
        const type = isNew ? 'CREATE' : 'UPDATE';

        if (status.isOnline) {
            try {
                // Try online first
                const endpoint = isNew ? `/${entity}` : `/${entity}/${data.id}`;
                const method = isNew ? 'post' : 'put';
                await apiClient[method](endpoint, data);
                return { success: true, queued: false };
            } catch (err) {
                // Network error - queue for later
                await queueOperation(type, entity, data);
                return { success: false, queued: true };
            }
        } else {
            // Offline - queue immediately
            await queueOperation(type, entity, data);
            return { success: false, queued: true };
        }
    }, [status.isOnline, queueOperation]);

    // Online/Offline detection
    useEffect(() => {
        const handleOnline = () => {
            setStatus(prev => ({ ...prev, isOnline: true }));
            if (autoSync) {
                syncAll();
            }
        };

        const handleOffline = () => {
            setStatus(prev => ({ ...prev, isOnline: false }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [autoSync, syncAll]);

    // Initialize IndexedDB and get initial pending count
    useEffect(() => {
        offlineManager.init().then(() => {
            updatePendingCount();
        });
    }, [updatePendingCount]);

    // Auto-sync interval
    useEffect(() => {
        if (autoSync && status.isOnline) {
            syncIntervalRef.current = setInterval(() => {
                if (status.pendingCount > 0) {
                    syncAll();
                }
            }, syncInterval);
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [autoSync, status.isOnline, status.pendingCount, syncInterval, syncAll]);

    return {
        ...status,
        syncAll,
        queueOperation,
        saveOfflineFirst,
        refreshPendingCount: updatePendingCount,
    };
}

/**
 * Offline status indicator component props
 */
export function useOfflineIndicator() {
    const { isOnline, pendingCount, isSyncing } = useOfflineSync({ autoSync: true });

    return {
        isOnline,
        pendingCount,
        isSyncing,
        showIndicator: !isOnline || pendingCount > 0,
    };
}
