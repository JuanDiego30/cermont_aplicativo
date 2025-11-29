export type SyncQueueItemStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SyncQueueItem<T = unknown> {
  id: string;
  tempId?: string;
  type: string;
  data: T;
  status: SyncQueueItemStatus;
  priority: number;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
}

/**
 * Servicio de Cola de Sincronización (Offline-First)
 * Gestiona la persistencia y reintento de operaciones cuando no hay red.
 */
export interface ISyncQueueService {
  enqueue<T>(item: Omit<SyncQueueItem<T>, 'id' | 'status' | 'createdAt' | 'retryCount'>): Promise<string>;

  dequeue(): Promise<SyncQueueItem | null>;

  markAsProcessed(itemId: string): Promise<void>;

  markAsFailed(itemId: string, error: string): Promise<void>;

  /**
   * Reencola para intento inmediato o programado.
   */
  retry(itemId: string): Promise<void>;

  size(): Promise<number>;

  getPending(): Promise<SyncQueueItem[]>;

  /**
   * Limpieza de items procesados antiguos para liberar espacio.
   * @returns Cantidad de items eliminados.
   */
  pruneCompleted(olderThan: Date): Promise<number>;
}

