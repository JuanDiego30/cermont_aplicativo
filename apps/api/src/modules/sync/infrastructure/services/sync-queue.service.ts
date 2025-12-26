import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SyncQueueItem, SyncItemType, SyncOperationType } from '../../domain/entities/sync-queue-item.entity';
import { DeviceId } from '../../domain/value-objects/device-id.vo';
import { SyncStatusType } from '../../domain/value-objects/sync-status.vo';

export interface QueueStats {
    total: number;
    pending: number;
    syncing: number;
    completed: number;
    failed: number;
    conflict: number;
}

/**
 * Sync Queue Service
 * Manages the in-memory sync queue with persistence fallback
 * Uses EventEmitter for async processing (no Redis required)
 */
@Injectable()
export class SyncQueueService {
    private readonly logger = new Logger(SyncQueueService.name);
    private readonly queue: Map<string, SyncQueueItem> = new Map();
    private isProcessing = false;

    constructor(private readonly eventEmitter: EventEmitter2) { }

    /**
     * Add item to sync queue
     */
    async addToQueue(props: {
        tipo: SyncItemType;
        operacion: SyncOperationType;
        datos: Record<string, unknown>;
        userId: string;
        deviceId?: string;
        ordenId?: string;
        ejecucionId?: string;
        timestamp?: Date;
    }): Promise<SyncQueueItem> {
        const item = SyncQueueItem.create({
            tipo: props.tipo,
            operacion: props.operacion,
            datos: props.datos,
            deviceId: props.deviceId ? DeviceId.create(props.deviceId) : DeviceId.generate(),
            userId: props.userId,
            ordenId: props.ordenId,
            ejecucionId: props.ejecucionId,
            timestamp: props.timestamp,
        });

        this.queue.set(item.id, item);

        this.logger.log(`Added item to queue: ${item.id} (${item.tipo}:${item.operacion})`, {
            queueSize: this.queue.size,
            priority: item.priority.getValue(),
        });

        // Emit event for async processing
        this.eventEmitter.emit('sync.item.added', { itemId: item.id });

        return item;
    }

    /**
     * Get all pending items for a user, sorted by priority and timestamp
     */
    getPendingItems(userId?: string): SyncQueueItem[] {
        const items = Array.from(this.queue.values())
            .filter((item) => {
                const isPending = item.status.isPending() || item.status.hasConflict();
                const matchesUser = !userId || item.userId === userId;
                return isPending && matchesUser;
            })
            .sort((a, b) => {
                // First by priority (lower order = higher priority)
                const priorityDiff = a.priority.getOrder() - b.priority.getOrder();
                if (priorityDiff !== 0) return priorityDiff;
                // Then by timestamp (older first)
                return a.timestamp.getTime() - b.timestamp.getTime();
            });

        return items;
    }

    /**
     * Get item by ID
     */
    getItem(id: string): SyncQueueItem | undefined {
        return this.queue.get(id);
    }

    /**
     * Update item in queue
     */
    updateItem(item: SyncQueueItem): void {
        this.queue.set(item.id, item);
    }

    /**
     * Remove completed items from queue
     */
    pruneCompleted(): number {
        let removed = 0;
        for (const [id, item] of this.queue.entries()) {
            if (item.status.isCompleted()) {
                this.queue.delete(id);
                removed++;
            }
        }
        if (removed > 0) {
            this.logger.log(`Pruned ${removed} completed items from queue`);
        }
        return removed;
    }

    /**
     * Get queue statistics
     */
    getStats(): QueueStats {
        const stats: QueueStats = {
            total: 0,
            pending: 0,
            syncing: 0,
            completed: 0,
            failed: 0,
            conflict: 0,
        };

        for (const item of this.queue.values()) {
            stats.total++;
            switch (item.status.getValue()) {
                case SyncStatusType.PENDING:
                    stats.pending++;
                    break;
                case SyncStatusType.SYNCING:
                    stats.syncing++;
                    break;
                case SyncStatusType.COMPLETED:
                    stats.completed++;
                    break;
                case SyncStatusType.FAILED:
                    stats.failed++;
                    break;
                case SyncStatusType.CONFLICT:
                    stats.conflict++;
                    break;
            }
        }

        return stats;
    }

    /**
     * Check if queue is currently processing
     */
    isQueueProcessing(): boolean {
        return this.isProcessing;
    }

    /**
     * Set processing state
     */
    setProcessing(state: boolean): void {
        this.isProcessing = state;
    }

    /**
     * Get all items for export/persistence
     */
    exportQueue(): Record<string, unknown>[] {
        return Array.from(this.queue.values()).map((item) => item.toPersistence());
    }

    /**
     * Import items from persistence
     */
    importQueue(items: Record<string, unknown>[]): number {
        let imported = 0;
        for (const data of items) {
            try {
                const item = SyncQueueItem.fromPersistence(data as any);
                // Only import non-completed items
                if (!item.status.isCompleted()) {
                    this.queue.set(item.id, item);
                    imported++;
                }
            } catch (error) {
                this.logger.error('Failed to import queue item', error);
            }
        }
        this.logger.log(`Imported ${imported} items to queue`);
        return imported;
    }

    /**
     * Clear entire queue
     */
    clear(): void {
        this.queue.clear();
        this.isProcessing = false;
        this.logger.log('Queue cleared');
    }

    /**
     * Get items by order ID
     */
    getItemsByOrden(ordenId: string): SyncQueueItem[] {
        return Array.from(this.queue.values())
            .filter((item) => item.ordenId === ordenId);
    }

    /**
     * Get items by user ID
     */
    getItemsByUser(userId: string): SyncQueueItem[] {
        return Array.from(this.queue.values())
            .filter((item) => item.userId === userId);
    }
}
