/**
 * @useCase ProcessSyncBatchUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  SYNC_REPOSITORY,
  ISyncRepository,
  SyncBatchDto,
  SyncResponse,
  SyncResult,
} from '../dto';

@Injectable()
export class ProcessSyncBatchUseCase {
  constructor(
    @Inject(SYNC_REPOSITORY)
    private readonly repo: ISyncRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, batch: SyncBatchDto): Promise<SyncResponse> {
    const results: SyncResult[] = [];

    for (const item of batch.items) {
      try {
        const pending = await this.repo.savePending(userId, {
          ...item,
          deviceId: batch.deviceId,
        });

        // Emit event for each entity processor to handle
        this.eventEmitter.emit(`sync.${item.entityType}.${item.action}`, {
          userId,
          data: item.data,
          localId: item.localId,
          pendingId: pending.id,
        });

        results.push({
          localId: item.localId,
          serverId: pending.id,
          success: true,
        });
      } catch (error) {
        results.push({
          localId: item.localId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const lastSync = batch.lastSyncTimestamp
      ? new Date(batch.lastSyncTimestamp)
      : undefined;
    const serverChanges = await this.repo.getServerChanges(userId, lastSync);

    return {
      synced: results,
      serverChanges: serverChanges.map((c) => ({
        entityType: c.entityType,
        entityId: c.entityId,
        action: c.action,
        data: c.data,
        timestamp: c.timestamp.toISOString(),
      })),
      syncTimestamp: new Date().toISOString(),
    };
  }
}
