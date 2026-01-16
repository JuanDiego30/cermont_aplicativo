```typescript
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, interval } from 'rxjs';
import { logError } from '../utils/logger';

interface SyncQueueItem {
    id: string;
    method: 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    data: unknown;
    timestamp: number;
}

@Injectable({
    providedIn: 'root',
})
export class SyncService {
    private syncQueue: SyncQueueItem[] = [];
    private isSyncing = false;
    private _syncStatus = signal<'idle' | 'syncing' | 'synced'>('idle');
    public syncStatus = this._syncStatus.asReadonly();
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.loadQueueFromStorage();
        this.setupPeriodicSync();
    }

    // Este servicio vive mientras el injector esté activo; takeUntilDestroyed
    // asegura liberar subscriptions si el injector se destruye.

    /**
     * Agregar operación a la cola de sincronización
     */
    addToQueue(
        method: 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data: unknown
    ): void {
        const item: SyncQueueItem = {
            id: `${Date.now()}-${Math.random()}`,
            method,
            endpoint,
            data,
            timestamp: Date.now(),
        };

        this.syncQueue.push(item);
        this.saveQueueToStorage();
    }

    /**
     * Obtener estado de sincronización (Signal)
     */
    getSyncStatus() {
        return this.syncStatus;
    }

    /**
     * Obtener cantidad de items pendientes
     */
    getPendingCount(): number {
        return this.syncQueue.length;
    }

    /**
     * Forzar sincronización manual
     */
    async forceSync(): Promise<void> {
        if (navigator.onLine && !this.isSyncing) {
            await this.sync();
        }
    }

    /**
     * Guardar cola en localStorage
     */
    private saveQueueToStorage(): void {
        try {
            localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            logError('Error guardando cola de sincronización', error);
        }
    }

    /**
     * Cargar cola desde localStorage
     */
    private loadQueueFromStorage(): void {
        try {
            const stored = localStorage.getItem('sync_queue');
            if (stored) {
                this.syncQueue = JSON.parse(stored);
            }
        } catch (error) {
            logError('Error cargando cola de sincronización', error);
        }
    }

    /**
     * Configurar sincronización periódica
     */
    private setupPeriodicSync(): void {
        interval(30000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // Intentar sincronizar cada 30 segundos
                if (navigator.onLine && !this.isSyncing) {
                    this.sync();
                }
            });
    }

    /**
     * Sincronizar cola con servidor
     */
    private async sync(): Promise<void> {
        if (this.syncQueue.length === 0) {
            return;
        }

        this.isSyncing = true;
        this._syncStatus.set('syncing');

        // Implementar lógica de sincronización real aquí
        // Por ahora, solo simulamos
        try {
            // Aquí iría la lógica real de sincronización
            await new Promise((resolve) => setTimeout(resolve, 1000));

            this.syncQueue = [];
            this.saveQueueToStorage();
            this._syncStatus.set('synced');
        } catch (error) {
            logError('Error durante sincronización', error);
            this._syncStatus.set('idle');
        } finally {
            this.isSyncing = false;
        }
    }
}
