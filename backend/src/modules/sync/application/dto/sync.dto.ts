/**
 * @module Sync - Clean Architecture
 */
import { z } from "zod";

// DTOs
export const SyncItemSchema = z.object({
  entityType: z.enum(["orden", "evidencia", "checklist", "ejecucion"]),
  entityId: z.string().optional(),
  action: z.enum(["create", "update", "delete"]),
  data: z.record(z.string(), z.unknown()),
  localId: z.string(),
  timestamp: z.string(),
});

export type SyncItemDto = z.infer<typeof SyncItemSchema>;

export const SyncBatchSchema = z.object({
  items: z.array(SyncItemSchema).min(1),
  deviceId: z.string(),
  lastSyncTimestamp: z.string().optional(),
});

export type SyncBatchDto = z.infer<typeof SyncBatchSchema>;

export interface SyncResult {
  localId: string;
  serverId?: string;
  success: boolean;
  error?: string;
}

export interface SyncResponse {
  synced: SyncResult[];
  serverChanges: Array<{
    entityType: string;
    entityId: string;
    action: string;
    data: Record<string, unknown>;
    timestamp: string;
  }>;
  syncTimestamp: string;
}

// Repository Interface
export const SYNC_REPOSITORY = Symbol("SYNC_REPOSITORY");

export interface PendingSync {
  id: string;
  userId: string;
  deviceId: string;
  entityType: string;
  entityId?: string;
  action: string;
  data: Record<string, unknown>;
  localId: string;
  timestamp: Date;
  status: "pending" | "processing" | "synced" | "failed" | "conflict";
  error?: string;
}

export interface ISyncRepository {
  savePending(
    userId: string,
    item: SyncItemDto & { deviceId: string },
  ): Promise<PendingSync>;
  tryMarkAsProcessing(id: string): Promise<boolean>;
  markAsSynced(id: string, serverId: string): Promise<void>;
  markAsFailed(id: string, error: string): Promise<void>;
  markAsConflict(id: string, error: string): Promise<void>;
  getServerChanges(userId: string, since?: Date): Promise<any[]>;
  getPendingByUser(userId: string): Promise<PendingSync[]>;
}
