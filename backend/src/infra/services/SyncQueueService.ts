/**
 * Servicio de cola de sincronización offline/online
 * Resuelve: Conectividad intermitente en campo Caño Limón
 * 
 * @file backend/src/infra/services/SyncQueueService.ts
 */

import { logger } from '../../shared/utils/logger';

/**
 * Tipos de entidades sincronizables
 */
export enum SyncEntityType {
  ORDER = 'ORDER',
  WORKPLAN = 'WORKPLAN',
  EVIDENCE = 'EVIDENCE',
}

/**
 * Estados de sincronización
 */
export enum SyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Operaciones de sincronización
 */
export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Item de cola de sincronización
 */
export interface SyncQueueItem {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  data: Record<string, unknown>;
  status: SyncStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  lastAttemptAt?: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Resultado de sincronización
 */
export interface SyncResult {
  success: boolean;
  itemId: string;
  entityType: SyncEntityType;
  entityId: string;
  error?: string;
}

/**
 * Servicio de cola de sincronización
 * @class SyncQueueService
 */
export class SyncQueueService {
  private queue: Map<string, SyncQueueItem> = new Map();
  private isProcessing = false;
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 5000;

  /**
   * Agrega un item a la cola de sincronización
   */
  async enqueue(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    data: Record<string, unknown>
  ): Promise<string> {
    const itemId = this.generateItemId();

    const item: SyncQueueItem = {
      id: itemId,
      entityType,
      entityId,
      operation,
      data,
      status: SyncStatus.PENDING,
      retryCount: 0,
      maxRetries: this.maxRetries,
      createdAt: new Date(),
    };

    this.queue.set(itemId, item);

    logger.info(`[SyncQueue] Item enqueued: ${itemId} (${entityType} ${operation})`);

    // Iniciar procesamiento si no está activo
    if (!this.isProcessing) {
      this.processQueue();
    }

    return itemId;
  }

  /**
   * Procesa la cola de sincronización
   * @private
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const pendingItems = Array.from(this.queue.values()).filter(
        (item) => item.status === SyncStatus.PENDING || item.status === SyncStatus.FAILED
      );

      for (const item of pendingItems) {
        await this.processItem(item);
        await this.delay(1000); // Delay entre items
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Procesa un item individual
   * @private
   */
  private async processItem(item: SyncQueueItem): Promise<SyncResult> {
    item.status = SyncStatus.IN_PROGRESS;
    item.lastAttemptAt = new Date();

    try {
      // Intentar sincronización según el tipo de entidad
      await this.syncEntity(item);

      item.status = SyncStatus.COMPLETED;
      item.completedAt = new Date();

      logger.info(`[SyncQueue] Item completed: ${item.id}`);

      return {
        success: true,
        itemId: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
      };
    } catch (error) {
      item.retryCount++;
      item.error = error instanceof Error ? error.message : 'Unknown error';

      if (item.retryCount >= item.maxRetries) {
        item.status = SyncStatus.FAILED;
        logger.error(`[SyncQueue] Item failed permanently: ${item.id}`, { error });
      } else {
        item.status = SyncStatus.PENDING;
        logger.warn(`[SyncQueue] Item failed, retrying (${item.retryCount}/${item.maxRetries}): ${item.id}`);
        
        // Reintentar después de un delay
        await this.delay(this.retryDelayMs * item.retryCount);
      }

      return {
        success: false,
        itemId: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        error: item.error,
      };
    }
  }

  /**
   * Sincroniza una entidad con el servidor
   * @private
   */
  private async syncEntity(item: SyncQueueItem): Promise<void> {
    switch (item.entityType) {
      case SyncEntityType.ORDER:
        await this.syncOrder(item);
        break;
      case SyncEntityType.WORKPLAN:
        await this.syncWorkPlan(item);
        break;
      case SyncEntityType.EVIDENCE:
        await this.syncEvidence(item);
        break;
      default:
        throw new Error(`Unknown entity type: ${item.entityType}`);
    }
  }

  /**
   * Sincroniza una orden
   * @private
   */
  private async syncOrder(item: SyncQueueItem): Promise<void> {
    // Implementación real dependerá de tus repositorios
    logger.info(`[SyncQueue] Syncing ORDER: ${item.entityId} (${item.operation})`);
    
    // Simular sincronización (reemplazar con lógica real)
    await this.delay(500);
  }

  /**
   * Sincroniza un plan de trabajo
   * @private
   */
  private async syncWorkPlan(item: SyncQueueItem): Promise<void> {
    logger.info(`[SyncQueue] Syncing WORKPLAN: ${item.entityId} (${item.operation})`);
    await this.delay(500);
  }

  /**
   * Sincroniza una evidencia
   * @private
   */
  private async syncEvidence(item: SyncQueueItem): Promise<void> {
    logger.info(`[SyncQueue] Syncing EVIDENCE: ${item.entityId} (${item.operation})`);
    await this.delay(500);
  }

  /**
   * Obtiene el estado de la cola
   */
  getQueueStatus(): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  } {
    const items = Array.from(this.queue.values());

    return {
      total: items.length,
      pending: items.filter((i) => i.status === SyncStatus.PENDING).length,
      inProgress: items.filter((i) => i.status === SyncStatus.IN_PROGRESS).length,
      completed: items.filter((i) => i.status === SyncStatus.COMPLETED).length,
      failed: items.filter((i) => i.status === SyncStatus.FAILED).length,
    };
  }

  /**
   * Obtiene todos los items pendientes
   */
  getPendingItems(): SyncQueueItem[] {
    return Array.from(this.queue.values()).filter(
      (item) => item.status === SyncStatus.PENDING || item.status === SyncStatus.FAILED
    );
  }

  /**
   * Limpia items completados
   */
  clearCompleted(): number {
    const completed = Array.from(this.queue.entries()).filter(
      ([, item]) => item.status === SyncStatus.COMPLETED
    );

    completed.forEach(([id]) => this.queue.delete(id));

    logger.info(`[SyncQueue] Cleared ${completed.length} completed items`);
    return completed.length;
  }

  /**
   * Reintentar items fallidos
   */
  async retryFailed(): Promise<void> {
    const failed = Array.from(this.queue.values()).filter(
      (item) => item.status === SyncStatus.FAILED
    );

    failed.forEach((item) => {
      item.status = SyncStatus.PENDING;
      item.retryCount = 0;
    });

    logger.info(`[SyncQueue] Retrying ${failed.length} failed items`);

    if (failed.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Genera un ID único para un item
   * @private
   */
  private generateItemId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Delay helper
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Instancia singleton del servicio
 */
export const syncQueueService = new SyncQueueService();
