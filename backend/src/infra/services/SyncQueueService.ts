/**
 * Servicio de cola de sincronización offline/online
 * Resuelve: Conectividad intermitente en campo Caño Limón
 * 
 * @file backend/src/infra/services/SyncQueueService.ts
 */

import { logger } from '../../shared/utils/logger.js';
import { randomUUID } from 'crypto';

// ==========================================
// Tipos y Enums
// ==========================================

export enum SyncEntityType {
  ORDER = 'ORDER',
  WORKPLAN = 'WORKPLAN',
  EVIDENCE = 'EVIDENCE',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

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

export interface SyncResult {
  success: boolean;
  itemId: string;
  entityType: SyncEntityType;
  entityId: string;
  error?: string;
}

// ==========================================
// Estrategias de Sincronización (Pattern Strategy)
// ==========================================

interface SyncStrategy {
  sync(item: SyncQueueItem): Promise<void>;
}

class OrderSyncStrategy implements SyncStrategy {
  async sync(item: SyncQueueItem): Promise<void> {
    logger.info(`[Sync:Order] Processing ${item.operation} for ${item.entityId}`);
    // Lógica real: OrderRepository.upsert(item.data)
    await new Promise(r => setTimeout(r, 500)); 
  }
}

class WorkPlanSyncStrategy implements SyncStrategy {
  async sync(item: SyncQueueItem): Promise<void> {
    logger.info(`[Sync:WorkPlan] Processing ${item.operation} for ${item.entityId}`);
    // Lógica real: WorkPlanRepository.upsert(item.data)
    await new Promise(r => setTimeout(r, 500));
  }
}

class EvidenceSyncStrategy implements SyncStrategy {
  async sync(item: SyncQueueItem): Promise<void> {
    logger.info(`[Sync:Evidence] Processing ${item.operation} for ${item.entityId}`);
    // Lógica real: EvidenceRepository.upload(item.data)
    await new Promise(r => setTimeout(r, 500));
  }
}

// ==========================================
// Servicio de Cola
// ==========================================

export class SyncQueueService {
  // Idealmente esto debería ser un repositorio persistente (Redis/DB)
  private queue: Map<string, SyncQueueItem> = new Map(); 
  private isProcessing = false;
  private readonly maxRetries = 3;
  private readonly strategies: Map<SyncEntityType, SyncStrategy>;

  constructor() {
    // Registrar estrategias
    this.strategies = new Map();
    this.strategies.set(SyncEntityType.ORDER, new OrderSyncStrategy());
    this.strategies.set(SyncEntityType.WORKPLAN, new WorkPlanSyncStrategy());
    this.strategies.set(SyncEntityType.EVIDENCE, new EvidenceSyncStrategy());
    
    // TODO: Cargar items pendientes desde persistencia al iniciar
    // this.loadQueueFromStorage(); 
  }

  async enqueue(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    data: Record<string, unknown>
  ): Promise<string> {
    const itemId = randomUUID();

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
    // TODO: Persistir item en DB

    logger.info(`[SyncQueue] Enqueued: ${itemId} (${entityType})`);

    // Trigger asíncrono (fire and forget)
    if (!this.isProcessing) {
      void this.processQueue();
    }

    return itemId;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Procesar hasta que no queden pendientes
      while (true) {
        const pendingItems = this.getPendingItemsBatch(5); // Procesar en lotes de 5
        if (pendingItems.length === 0) break;

        await Promise.all(pendingItems.map(item => this.processItem(item)));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    item.status = SyncStatus.IN_PROGRESS;
    item.lastAttemptAt = new Date();

    try {
      const strategy = this.strategies.get(item.entityType);
      if (!strategy) {
        throw new Error(`No strategy found for type: ${item.entityType}`);
      }

      await strategy.sync(item);

      item.status = SyncStatus.COMPLETED;
      item.completedAt = new Date();
      logger.info(`[SyncQueue] Completed: ${item.id}`);
      
      // TODO: Actualizar estado en DB o borrar si es efímero

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      item.retryCount++;
      item.error = message;

      if (item.retryCount >= item.maxRetries) {
        item.status = SyncStatus.FAILED;
        logger.error(`[SyncQueue] Failed permanently: ${item.id}`, { error: message });
      } else {
        item.status = SyncStatus.PENDING; // Volver a encolar
        logger.warn(`[SyncQueue] Retry ${item.retryCount}/${item.maxRetries} for ${item.id}`);
      }
      // TODO: Actualizar estado en DB
    }
  }

  // --- Métodos de Gestión y Monitoreo ---

  private getPendingItemsBatch(limit: number): SyncQueueItem[] {
    return Array.from(this.queue.values())
      .filter(i => i.status === SyncStatus.PENDING)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) // FIFO
      .slice(0, limit);
  }

  getQueueStatus() {
    const items = Array.from(this.queue.values());
    return {
      total: items.length,
      pending: items.filter(i => i.status === SyncStatus.PENDING).length,
      failed: items.filter(i => i.status === SyncStatus.FAILED).length,
    };
  }

  async retryFailed(): Promise<void> {
    const failed = Array.from(this.queue.values()).filter(i => i.status === SyncStatus.FAILED);
    
    for (const item of failed) {
      item.status = SyncStatus.PENDING;
      item.retryCount = 0;
      item.error = undefined;
    }
    
    logger.info(`[SyncQueue] Retrying ${failed.length} failed items`);
    
    if (failed.length > 0 && !this.isProcessing) {
      void this.processQueue();
    }
  }

  clearCompleted(): void {
    for (const [id, item] of this.queue) {
      if (item.status === SyncStatus.COMPLETED) {
        this.queue.delete(id);
      }
    }
  }
}

export const syncQueueService = new SyncQueueService();

