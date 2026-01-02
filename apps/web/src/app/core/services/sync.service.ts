import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { logError } from '../utils/logger';

interface SyncQueueItem {
    id: string;
    method: 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    data: any;
    timestamp: number;
}

@Injectable({
    providedIn: 'root',
})
export class SyncService implements OnDestroy {
    private syncQueue: SyncQueueItem[] = [];
    private isSyncing = false;
    private syncStatus$ = new BehaviorSubject<'idle' | 'syncing' | 'synced'>('idle');
    private readonly destroy$ = new Subject<void>();

    constructor() {
        this.loadQueueFromStorage();
        this.setupPeriodicSync();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Agregar operación a la cola de sincronización
     */
    addToQueue(
        method: 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data: any
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
     * Obtener estado de sincronización
     */
    getSyncStatus$(): Observable<string> {
        return this.syncStatus$.asObservable();
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
            .pipe(takeUntil(this.destroy$))
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
        this.syncStatus$.next('syncing');

        // Implementar lógica de sincronización real aquí
        // Por ahora, solo simulamos
        try {
            // Aquí iría la lógica real de sincronización
            await new Promise((resolve) => setTimeout(resolve, 1000));

            this.syncQueue = [];
            this.saveQueueToStorage();
            this.syncStatus$.next('synced');
        } catch (error) {
            logError('Error durante sincronización', error);
            this.syncStatus$.next('idle');
        } finally {
            this.isSyncing = false;
        }
    }
}
