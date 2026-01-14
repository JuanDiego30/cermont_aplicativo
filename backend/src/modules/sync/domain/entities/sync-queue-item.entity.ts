import { randomUUID } from "crypto";
import { SyncStatus, SyncStatusType } from "../value-objects/sync-status.vo";
import {
  SyncPriority,
  SyncPriorityType,
} from "../value-objects/sync-priority.vo";
import { DeviceId } from "../value-objects/device-id.vo";

/**
 * Sync operation type
 */
export type SyncOperationType = "CREATE" | "UPDATE" | "DELETE";

/**
 * Sync item type
 */
export type SyncItemType =
  | "EJECUCION"
  | "CHECKLIST"
  | "EVIDENCIA"
  | "TAREA"
  | "COSTO"
  | "AST"
  | "HES"
  | "FIRMA";

/**
 * SyncQueueItem Entity
 * Represents a single item in the sync queue
 */
export class SyncQueueItem {
  private readonly _id: string;
  private readonly _tipo: SyncItemType;
  private readonly _operacion: SyncOperationType;
  private readonly _datos: Record<string, unknown>;
  private readonly _timestamp: Date;
  private readonly _deviceId: DeviceId;
  private readonly _userId: string;
  private readonly _ordenId?: string;
  private readonly _ejecucionId?: string;

  private _status: SyncStatus;
  private _priority: SyncPriority;
  private _retryCount: number;
  private _lastRetryAt?: Date;
  private _errorMessage?: string;
  private _syncedAt?: Date;

  private static readonly MAX_RETRIES = 5;

  private constructor(props: {
    id: string;
    tipo: SyncItemType;
    operacion: SyncOperationType;
    datos: Record<string, unknown>;
    timestamp: Date;
    deviceId: DeviceId;
    userId: string;
    ordenId?: string;
    ejecucionId?: string;
    status: SyncStatus;
    priority: SyncPriority;
    retryCount: number;
    lastRetryAt?: Date;
    errorMessage?: string;
    syncedAt?: Date;
  }) {
    this._id = props.id;
    this._tipo = props.tipo;
    this._operacion = props.operacion;
    this._datos = props.datos;
    this._timestamp = props.timestamp;
    this._deviceId = props.deviceId;
    this._userId = props.userId;
    this._ordenId = props.ordenId;
    this._ejecucionId = props.ejecucionId;
    this._status = props.status;
    this._priority = props.priority;
    this._retryCount = props.retryCount;
    this._lastRetryAt = props.lastRetryAt;
    this._errorMessage = props.errorMessage;
    this._syncedAt = props.syncedAt;
  }

  /**
   * Create a new sync queue item
   */
  static create(props: {
    tipo: SyncItemType;
    operacion: SyncOperationType;
    datos: Record<string, unknown>;
    deviceId: DeviceId;
    userId: string;
    ordenId?: string;
    ejecucionId?: string;
    timestamp?: Date;
  }): SyncQueueItem {
    return new SyncQueueItem({
      id: randomUUID(),
      tipo: props.tipo,
      operacion: props.operacion,
      datos: props.datos,
      timestamp: props.timestamp || new Date(),
      deviceId: props.deviceId,
      userId: props.userId,
      ordenId: props.ordenId,
      ejecucionId: props.ejecucionId,
      status: SyncStatus.pending(),
      priority: SyncPriority.forItemType(props.tipo),
      retryCount: 0,
    });
  }

  /**
   * Reconstitute from persistence
   */
  static fromPersistence(data: {
    id: string;
    tipo: string;
    operacion: string;
    datos: Record<string, unknown>;
    timestamp: Date | string;
    deviceId: string;
    userId: string;
    ordenId?: string;
    ejecucionId?: string;
    status: string;
    priority: string;
    retryCount: number;
    lastRetryAt?: Date | string;
    errorMessage?: string;
    syncedAt?: Date | string;
  }): SyncQueueItem {
    return new SyncQueueItem({
      id: data.id,
      tipo: data.tipo as SyncItemType,
      operacion: data.operacion as SyncOperationType,
      datos: data.datos,
      timestamp: new Date(data.timestamp),
      deviceId: DeviceId.create(data.deviceId),
      userId: data.userId,
      ordenId: data.ordenId,
      ejecucionId: data.ejecucionId,
      status: SyncStatus.fromString(data.status),
      priority: SyncPriority.fromString(data.priority),
      retryCount: data.retryCount,
      lastRetryAt: data.lastRetryAt ? new Date(data.lastRetryAt) : undefined,
      errorMessage: data.errorMessage,
      syncedAt: data.syncedAt ? new Date(data.syncedAt) : undefined,
    });
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get tipo(): SyncItemType {
    return this._tipo;
  }
  get operacion(): SyncOperationType {
    return this._operacion;
  }
  get datos(): Record<string, unknown> {
    return { ...this._datos };
  }
  get timestamp(): Date {
    return this._timestamp;
  }
  get deviceId(): DeviceId {
    return this._deviceId;
  }
  get userId(): string {
    return this._userId;
  }
  get ordenId(): string | undefined {
    return this._ordenId;
  }
  get ejecucionId(): string | undefined {
    return this._ejecucionId;
  }
  get status(): SyncStatus {
    return this._status;
  }
  get priority(): SyncPriority {
    return this._priority;
  }
  get retryCount(): number {
    return this._retryCount;
  }
  get lastRetryAt(): Date | undefined {
    return this._lastRetryAt;
  }
  get errorMessage(): string | undefined {
    return this._errorMessage;
  }
  get syncedAt(): Date | undefined {
    return this._syncedAt;
  }

  /**
   * Mark as syncing
   */
  markAsSyncing(): void {
    if (!this._status.canRetry()) {
      throw new Error(`Cannot sync item in status: ${this._status.getValue()}`);
    }
    this._status = SyncStatus.syncing();
    this._lastRetryAt = new Date();
  }

  /**
   * Mark as completed
   */
  markAsCompleted(): void {
    this._status = SyncStatus.completed();
    this._syncedAt = new Date();
    this._errorMessage = undefined;
  }

  /**
   * Mark as failed with error
   */
  markAsFailed(errorMessage: string): void {
    this._retryCount++;
    this._errorMessage = errorMessage;

    if (this._retryCount >= SyncQueueItem.MAX_RETRIES) {
      this._status = SyncStatus.failed();
    } else {
      this._status = SyncStatus.pending(); // Allow retry
    }
  }

  /**
   * Mark as having conflict
   */
  markAsConflict(details: string): void {
    this._status = SyncStatus.conflict();
    this._errorMessage = `Conflict: ${details}`;
  }

  /**
   * Check if item can be retried
   */
  canRetry(): boolean {
    return (
      this._status.canRetry() && this._retryCount < SyncQueueItem.MAX_RETRIES
    );
  }

  /**
   * Calculate delay for next retry (exponential backoff)
   */
  getRetryDelayMs(): number {
    // Base delay: 1 second, max: 5 minutes
    const baseDelay = 1000;
    const maxDelay = 5 * 60 * 1000;
    const delay = Math.min(baseDelay * Math.pow(2, this._retryCount), maxDelay);
    return delay;
  }

  /**
   * Elevate priority (for critical operations)
   */
  elevatePriority(): void {
    if (this._priority.getValue() !== SyncPriorityType.CRITICAL) {
      this._priority = SyncPriority.critical();
    }
  }

  /**
   * Convert to persistence format
   */
  toPersistence(): Record<string, unknown> {
    return {
      id: this._id,
      tipo: this._tipo,
      operacion: this._operacion,
      datos: this._datos,
      timestamp: this._timestamp.toISOString(),
      deviceId: this._deviceId.getValue(),
      userId: this._userId,
      ordenId: this._ordenId,
      ejecucionId: this._ejecucionId,
      status: this._status.getValue(),
      priority: this._priority.getValue(),
      retryCount: this._retryCount,
      lastRetryAt: this._lastRetryAt?.toISOString(),
      errorMessage: this._errorMessage,
      syncedAt: this._syncedAt?.toISOString(),
    };
  }

  /**
   * Convert to DTO
   */
  toDTO(): Record<string, unknown> {
    return {
      id: this._id,
      tipo: this._tipo,
      operacion: this._operacion,
      timestamp: this._timestamp.toISOString(),
      ordenId: this._ordenId,
      ejecucionId: this._ejecucionId,
      status: this._status.getValue(),
      priority: this._priority.getValue(),
      retryCount: this._retryCount,
      errorMessage: this._errorMessage,
      syncedAt: this._syncedAt?.toISOString(),
    };
  }
}
