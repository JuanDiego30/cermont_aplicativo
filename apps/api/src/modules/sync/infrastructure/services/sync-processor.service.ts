import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { SyncQueueService } from './sync-queue.service';
import { ConnectivityDetectorService } from './connectivity-detector.service';
import { ConflictResolverService } from './conflict-resolver.service';
import { SyncService } from '../../sync.service';
import { SyncQueueItem } from '../../domain/entities/sync-queue-item.entity';

/**
 * Sync Processor Service
 * Background process that handles sync queue items
 */
@Injectable()
export class SyncProcessorService implements OnModuleInit {
    private readonly logger = new Logger(SyncProcessorService.name);
    private isProcessingEnabled = true;

    constructor(
        private readonly queueService: SyncQueueService,
        private readonly connectivityService: ConnectivityDetectorService,
        private readonly conflictResolver: ConflictResolverService,
        private readonly syncService: SyncService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    onModuleInit() {
        this.logger.log('Sync Processor initialized');
    }

    /**
     * Listen for new items added to queue
     */
    @OnEvent('sync.item.added')
    async handleItemAdded(payload: { itemId: string }) {
        this.logger.debug(`Item added event received: ${payload.itemId}`);
        await this.tryProcessQueue();
    }

    /**
     * Periodic queue processing (every 30 seconds)
     */
    @Interval(30000)
    async periodicProcess() {
        if (!this.isProcessingEnabled) {
            return;
        }
        await this.tryProcessQueue();
    }

    /**
     * Try to process the queue if conditions are met
     */
    async tryProcessQueue(): Promise<void> {
        // Check if already processing
        if (this.queueService.isQueueProcessing()) {
            this.logger.debug('Queue already processing, skipping');
            return;
        }

        // Check connectivity
        const connectivity = await this.connectivityService.checkConnectivity();
        if (!connectivity.isOnline) {
            this.logger.debug('Offline, queue processing deferred');
            return;
        }

        // Get pending items
        const pendingItems = this.queueService.getPendingItems();
        if (pendingItems.length === 0) {
            return;
        }

        this.logger.log(`Processing ${pendingItems.length} pending items`);
        await this.processQueue(pendingItems);
    }

    /**
     * Process queue items
     */
    private async processQueue(items: SyncQueueItem[]): Promise<void> {
        this.queueService.setProcessing(true);

        try {
            for (const item of items) {
                await this.processItem(item);
            }

            // Prune completed items
            this.queueService.pruneCompleted();

            // Emit completion event
            const stats = this.queueService.getStats();
            this.eventEmitter.emit('sync.queue.processed', { stats });

        } finally {
            this.queueService.setProcessing(false);
        }
    }

    /**
     * Process a single queue item
     */
    private async processItem(item: SyncQueueItem): Promise<void> {
        try {
            item.markAsSyncing();
            this.queueService.updateItem(item);

            // Convert to sync service format
            const syncData = {
                id: item.id,
                tipo: item.tipo as 'EJECUCION' | 'CHECKLIST' | 'EVIDENCIA' | 'TAREA' | 'COSTO',
                operacion: item.operacion as 'CREATE' | 'UPDATE' | 'DELETE',
                datos: item.datos,
                timestamp: item.timestamp.toISOString(),
                ordenId: item.ordenId,
                ejecucionId: item.ejecucionId,
            };

            // Process using existing sync service
            const results = await this.syncService.syncPendingData(item.userId, [syncData]);
            const result = results[0];

            if (result.success) {
                item.markAsCompleted();
                this.logger.debug(`Item synced successfully: ${item.id}`);
                this.eventEmitter.emit('sync.item.completed', { itemId: item.id, result });
            } else {
                item.markAsFailed(result.mensaje);
                this.logger.warn(`Item sync failed: ${item.id}`, { message: result.mensaje });
                this.eventEmitter.emit('sync.item.failed', { itemId: item.id, error: result.mensaje });
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            item.markAsFailed(errorMessage);
            this.logger.error(`Error processing item ${item.id}:`, error);
            this.eventEmitter.emit('sync.item.failed', { itemId: item.id, error: errorMessage });
        }

        this.queueService.updateItem(item);

        // If failed and can retry, schedule retry with delay
        if (item.canRetry()) {
            const delayMs = item.getRetryDelayMs();
            this.logger.debug(`Scheduling retry for ${item.id} in ${delayMs}ms`);
            setTimeout(() => {
                this.eventEmitter.emit('sync.item.retry', { itemId: item.id });
            }, delayMs);
        }
    }

    /**
     * Handle retry events
     */
    @OnEvent('sync.item.retry')
    async handleRetry(payload: { itemId: string }) {
        const item = this.queueService.getItem(payload.itemId);
        if (item && item.canRetry()) {
            await this.processItem(item);
        }
    }

    /**
     * Force process all pending items (manual trigger)
     */
    async forceProcess(): Promise<{ processed: number; failed: number }> {
        const pendingItems = this.queueService.getPendingItems();

        if (pendingItems.length === 0) {
            return { processed: 0, failed: 0 };
        }

        await this.processQueue(pendingItems);

        const stats = this.queueService.getStats();
        return {
            processed: stats.completed,
            failed: stats.failed,
        };
    }

    /**
     * Enable/disable automatic processing
     */
    setProcessingEnabled(enabled: boolean): void {
        this.isProcessingEnabled = enabled;
        this.logger.log(`Automatic processing ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Check if processing is enabled
     */
    isEnabled(): boolean {
        return this.isProcessingEnabled;
    }
}
