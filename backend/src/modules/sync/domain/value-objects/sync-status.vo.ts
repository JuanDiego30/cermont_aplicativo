/**
 * Sync Status Value Object
 * Represents the possible states of a sync operation
 */
export enum SyncStatusType {
  PENDING = "PENDING",
  SYNCING = "SYNCING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CONFLICT = "CONFLICT",
}

export class SyncStatus {
  private constructor(private readonly value: SyncStatusType) {}

  static pending(): SyncStatus {
    return new SyncStatus(SyncStatusType.PENDING);
  }

  static syncing(): SyncStatus {
    return new SyncStatus(SyncStatusType.SYNCING);
  }

  static completed(): SyncStatus {
    return new SyncStatus(SyncStatusType.COMPLETED);
  }

  static failed(): SyncStatus {
    return new SyncStatus(SyncStatusType.FAILED);
  }

  static conflict(): SyncStatus {
    return new SyncStatus(SyncStatusType.CONFLICT);
  }

  static fromString(value: string): SyncStatus {
    if (!Object.values(SyncStatusType).includes(value as SyncStatusType)) {
      throw new Error(`Invalid sync status: ${value}`);
    }
    return new SyncStatus(value as SyncStatusType);
  }

  getValue(): SyncStatusType {
    return this.value;
  }

  isPending(): boolean {
    return this.value === SyncStatusType.PENDING;
  }

  isSyncing(): boolean {
    return this.value === SyncStatusType.SYNCING;
  }

  isCompleted(): boolean {
    return this.value === SyncStatusType.COMPLETED;
  }

  isFailed(): boolean {
    return this.value === SyncStatusType.FAILED;
  }

  hasConflict(): boolean {
    return this.value === SyncStatusType.CONFLICT;
  }

  canRetry(): boolean {
    return (
      this.value === SyncStatusType.FAILED ||
      this.value === SyncStatusType.PENDING
    );
  }

  equals(other: SyncStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
