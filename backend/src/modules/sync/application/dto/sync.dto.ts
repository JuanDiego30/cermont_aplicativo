/**
 * @module Sync - Clean Architecture
 * DTOs con class-validator
 */
import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum SyncEntityType {
  ORDEN = "orden",
  EVIDENCIA = "evidencia",
  CHECKLIST = "checklist",
  EJECUCION = "ejecucion",
}

export enum SyncAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}

export class SyncItemDto {
  @ApiProperty({ enum: SyncEntityType })
  @IsEnum(SyncEntityType)
  entityType!: SyncEntityType;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ enum: SyncAction })
  @IsEnum(SyncAction)
  action!: SyncAction;

  @ApiProperty({ example: { campo: "valor" } })
  @IsObject()
  data!: Record<string, unknown>;

  @ApiProperty({ example: "local-123" })
  @IsString()
  localId!: string;

  @ApiProperty({ example: "2025-01-14T10:00:00Z" })
  @IsDateString()
  timestamp!: string;
}

export class SyncBatchDto {
  @ApiProperty({ type: [SyncItemDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SyncItemDto)
  items!: SyncItemDto[];

  @ApiProperty({ example: "device-abc123" })
  @IsString()
  deviceId!: string;

  @ApiPropertyOptional({ example: "2025-01-14T09:00:00Z" })
  @IsOptional()
  @IsDateString()
  lastSyncTimestamp?: string;
}

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
