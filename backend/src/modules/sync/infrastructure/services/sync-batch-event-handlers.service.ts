import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../prisma/prisma.service';
import { SyncService } from '../../sync.service';
import { ConflictResolverService, ConflictStrategy } from './conflict-resolver.service';
import { ISyncRepository, SYNC_REPOSITORY } from '../../application/dto';
import { Inject } from '@nestjs/common';

type SyncEventPayload = {
  userId: string;
  localId: string;
  pendingId: string;
  data: Record<string, unknown>;
};

@Injectable()
export class SyncBatchEventHandlersService {
  private readonly logger = new Logger(SyncBatchEventHandlersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly legacySync: SyncService,
    private readonly conflictResolver: ConflictResolverService,
    @Inject(SYNC_REPOSITORY) private readonly repo: ISyncRepository
  ) {}

  @OnEvent('sync.ejecucion.create')
  handleEjecucionCreate(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('ejecucion', 'create', payload);
  }

  @OnEvent('sync.ejecucion.update')
  handleEjecucionUpdate(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('ejecucion', 'update', payload);
  }

  @OnEvent('sync.ejecucion.delete')
  handleEjecucionDelete(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('ejecucion', 'delete', payload);
  }

  @OnEvent('sync.checklist.create')
  handleChecklistCreate(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('checklist', 'create', payload);
  }

  @OnEvent('sync.checklist.update')
  handleChecklistUpdate(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('checklist', 'update', payload);
  }

  @OnEvent('sync.checklist.delete')
  handleChecklistDelete(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('checklist', 'delete', payload);
  }

  @OnEvent('sync.evidencia.create')
  handleEvidenciaCreate(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('evidencia', 'create', payload);
  }

  @OnEvent('sync.evidencia.update')
  handleEvidenciaUpdate(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('evidencia', 'update', payload);
  }

  @OnEvent('sync.evidencia.delete')
  handleEvidenciaDelete(payload: SyncEventPayload) {
    return this.handleWithLegacyMapping('evidencia', 'delete', payload);
  }

  // Orden no está soportado por SyncService legacy. Se deja como pendiente.
  @OnEvent('sync.orden.create')
  async handleOrdenCreate(payload: SyncEventPayload) {
    await this.repo.markAsFailed(
      payload.pendingId,
      'Entidad "orden" no soportada por el pipeline actual de sync.'
    );
  }

  @OnEvent('sync.orden.update')
  async handleOrdenUpdate(payload: SyncEventPayload) {
    await this.repo.markAsFailed(
      payload.pendingId,
      'Entidad "orden" no soportada por el pipeline actual de sync.'
    );
  }

  @OnEvent('sync.orden.delete')
  async handleOrdenDelete(payload: SyncEventPayload) {
    await this.repo.markAsFailed(
      payload.pendingId,
      'Entidad "orden" no soportada por el pipeline actual de sync.'
    );
  }

  private async handleWithLegacyMapping(
    entityType: 'ejecucion' | 'checklist' | 'evidencia',
    action: 'create' | 'update' | 'delete',
    payload: SyncEventPayload
  ): Promise<void> {
    const pending = await this.prisma.pendingSync.findUnique({
      where: { id: payload.pendingId },
    });

    if (!pending) {
      this.logger.warn(`PendingSync no encontrado: ${payload.pendingId}`);
      return;
    }

    // Replay protection: no reprocesar items ya resueltos.
    if (pending.status === 'synced' || pending.status === 'conflict') {
      return;
    }

    // Lock ligero en BD para evitar doble ejecución concurrente.
    const acquired = await this.repo.tryMarkAsProcessing(pending.id);
    if (!acquired) {
      this.logger.debug(`PendingSync ya en procesamiento: ${pending.id}`);
      return;
    }

    const localTimestamp = pending.timestamp;

    // Conflicto (LWW simple): si el servidor fue modificado después del cambio offline.
    if (action === 'update' && pending.entityId) {
      const serverTimestamp = await this.getServerUpdatedAt(entityType, pending.entityId);

      if (serverTimestamp) {
        const conflict = this.conflictResolver.detectConflicts(
          (pending.data ?? {}) as any,
          await this.getServerComparableData(
            entityType,
            pending.entityId,
            Object.keys((pending.data ?? {}) as any)
          ),
          localTimestamp,
          serverTimestamp
        );

        if (conflict) {
          const resolution = this.conflictResolver.resolve(
            conflict,
            ConflictStrategy.LAST_WRITE_WINS
          );
          if (resolution.requiresManualReview || resolution.resultData !== conflict.localData) {
            await this.repo.markAsConflict(
              pending.id,
              `Conflicto LWW: servidor (${serverTimestamp.toISOString()}) es más reciente que local (${localTimestamp.toISOString()}). Campos: ${conflict.fieldConflicts.join(', ')}`
            );
            return;
          }
        }
      }
    }

    try {
      const legacyItem = this.mapToLegacyPendingSync(entityType, action, pending);
      const [result] = await this.legacySync.syncPendingData(payload.userId, [legacyItem]);

      if (result?.success) {
        await this.repo.markAsSynced(pending.id, result.nuevoId ?? pending.entityId ?? pending.id);
        return;
      }

      await this.repo.markAsFailed(pending.id, result?.mensaje ?? 'Fallo desconocido');
    } catch (error) {
      await this.repo.markAsFailed(
        pending.id,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private mapToLegacyPendingSync(
    entityType: 'ejecucion' | 'checklist' | 'evidencia',
    action: 'create' | 'update' | 'delete',
    pending: {
      id: string;
      entityId: string | null;
      data: unknown;
      timestamp: Date;
    }
  ) {
    const operacion = action.toUpperCase() as 'CREATE' | 'UPDATE' | 'DELETE';

    if (entityType === 'ejecucion') {
      const datos = {
        ...(pending.data as Record<string, unknown>),
        ejecucionId: pending.entityId ?? (pending.data as any)?.ejecucionId,
      };

      return {
        id: pending.id,
        tipo: 'EJECUCION' as const,
        operacion,
        datos,
        timestamp: pending.timestamp.toISOString(),
        ordenId: (pending.data as any)?.ordenId,
        ejecucionId: pending.entityId ?? (pending.data as any)?.ejecucionId,
      };
    }

    if (entityType === 'checklist') {
      const datos = {
        ...(pending.data as Record<string, unknown>),
        checklistId: pending.entityId ?? (pending.data as any)?.checklistId,
      };

      return {
        id: pending.id,
        tipo: 'CHECKLIST' as const,
        operacion,
        datos,
        timestamp: pending.timestamp.toISOString(),
        ejecucionId: (pending.data as any)?.ejecucionId,
      };
    }

    const datos = {
      ...(pending.data as Record<string, unknown>),
      evidenciaId: pending.entityId ?? (pending.data as any)?.evidenciaId,
    };

    return {
      id: pending.id,
      tipo: 'EVIDENCIA' as const,
      operacion,
      datos,
      timestamp: pending.timestamp.toISOString(),
      ordenId: (pending.data as any)?.ordenId,
      ejecucionId: (pending.data as any)?.ejecucionId,
    };
  }

  private async getServerUpdatedAt(
    entityType: 'ejecucion' | 'checklist' | 'evidencia',
    entityId: string
  ): Promise<Date | null> {
    if (entityType === 'ejecucion') {
      const row = await this.prisma.ejecucion.findUnique({
        where: { id: entityId },
        select: { updatedAt: true },
      });
      return row?.updatedAt ?? null;
    }

    if (entityType === 'checklist') {
      const row = await this.prisma.checklistEjecucion.findUnique({
        where: { id: entityId },
        select: { updatedAt: true },
      });
      return row?.updatedAt ?? null;
    }

    const row = await this.prisma.evidenciaEjecucion.findUnique({
      where: { id: entityId },
      select: { updatedAt: true },
    });

    return row?.updatedAt ?? null;
  }

  private async getServerComparableData(
    entityType: 'ejecucion' | 'checklist' | 'evidencia',
    entityId: string,
    keys: string[]
  ): Promise<Record<string, unknown>> {
    const uniqueKeys = Array.from(new Set(keys));

    const pick = (row: Record<string, unknown> | null): Record<string, unknown> => {
      const result: Record<string, unknown> = {};
      if (!row) return result;
      for (const key of uniqueKeys) {
        result[key] = row[key];
      }
      return result;
    };

    if (entityType === 'ejecucion') {
      const row = await this.prisma.ejecucion.findUnique({
        where: { id: entityId },
      });
      return pick(row as any);
    }

    if (entityType === 'checklist') {
      const row = await this.prisma.checklistEjecucion.findUnique({
        where: { id: entityId },
      });
      return pick(row as any);
    }

    const row = await this.prisma.evidenciaEjecucion.findUnique({
      where: { id: entityId },
    });
    return pick(row as any);
  }
}
