/**
 * @repository SyncRepository
 * Implementación simplificada para sincronización offline
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ISyncRepository, PendingSync, SyncItemDto } from '../../application/dto';

@Injectable()
export class SyncRepository implements ISyncRepository {
  constructor(private readonly prisma: PrismaService) {}

  async savePending(userId: string, item: SyncItemDto & { deviceId: string }): Promise<PendingSync> {
    // Idempotencia fuerte: un mismo item reenviado no debe duplicarse.
    // Clave: (userId, deviceId, localId) con constraint única en DB.
    const existing = await this.prisma.pendingSync.findUnique({
      where: {
        pendingSync_user_device_local: {
          userId,
          deviceId: item.deviceId,
          localId: item.localId,
        },
      },
    });

    // Si ya fue sincronizado, devolvemos el registro sin mutar.
    if (existing && existing.status === 'synced') {
      return {
        id: existing.id,
        userId: existing.userId,
        deviceId: existing.deviceId,
        entityType: existing.entityType,
        entityId: existing.entityId ?? undefined,
        action: existing.action,
        data: (existing.data ?? {}) as any,
        localId: existing.localId,
        timestamp: existing.timestamp,
        status: existing.status as any,
        error: existing.error ?? undefined,
      };
    }

    const record = await this.prisma.pendingSync.upsert({
      where: {
        pendingSync_user_device_local: {
          userId,
          deviceId: item.deviceId,
          localId: item.localId,
        },
      },
      create: {
        userId,
        deviceId: item.deviceId,
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action,
        data: item.data as any,
        localId: item.localId,
        timestamp: new Date(item.timestamp),
        status: 'pending',
      },
      update: {
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action,
        data: item.data as any,
        timestamp: new Date(item.timestamp),
        status: 'pending',
        error: null,
      },
    });

    return {
      id: record.id,
      userId: record.userId,
      deviceId: record.deviceId,
      entityType: record.entityType,
      entityId: record.entityId ?? undefined,
      action: record.action,
      data: (record.data ?? {}) as any,
      localId: record.localId,
      timestamp: record.timestamp,
      status: (record.status as any) || 'pending',
      error: record.error ?? undefined,
    };
  }

  async markAsSynced(id: string, serverId: string): Promise<void> {
    await this.prisma.pendingSync.update({
      where: { id },
      data: {
        status: 'synced',
        entityId: serverId,
      },
    });
  }

  async markAsFailed(id: string, error: string): Promise<void> {
    await this.prisma.pendingSync.update({
      where: { id },
      data: {
        status: 'failed',
        error,
      },
    });
  }

  async markAsConflict(id: string, error: string): Promise<void> {
    await this.prisma.pendingSync.update({
      where: { id },
      data: {
        status: 'conflict',
        error,
      },
    });
  }

  async getServerChanges(userId: string, since?: Date): Promise<any[]> {
    const lastSyncDate = since ?? new Date(0);
    const [ordenes, ejecuciones] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          updatedAt: { gte: lastSyncDate },
          OR: [
            { creadorId: userId },
            { asignadoId: userId },
          ],
        },
        select: {
          id: true,
          numero: true,
          estado: true,
          updatedAt: true,
        },
      }),
      this.prisma.ejecucion.findMany({
        where: {
          updatedAt: { gte: lastSyncDate },
        },
        select: {
          id: true,
          ordenId: true,
          estado: true,
          updatedAt: true,
        },
      }),
    ]);

    // Shape consistente con ProcessSyncBatchUseCase.
    return [
      ...ordenes.map((o) => ({
        entityType: 'orden',
        entityId: o.id,
        action: 'update',
        data: {
          id: o.id,
          numero: o.numero,
          estado: o.estado,
        },
        timestamp: o.updatedAt,
      })),
      ...ejecuciones.map((e) => ({
        entityType: 'ejecucion',
        entityId: e.id,
        action: 'update',
        data: {
          id: e.id,
          ordenId: e.ordenId,
          estado: e.estado,
        },
        timestamp: e.updatedAt,
      })),
    ];
  }

  async getPendingByUser(userId: string): Promise<PendingSync[]> {
    const records = await this.prisma.pendingSync.findMany({
      where: {
        userId,
        status: { in: ['pending', 'failed', 'conflict'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((r) => ({
      id: r.id,
      userId: r.userId,
      deviceId: r.deviceId,
      entityType: r.entityType,
      entityId: r.entityId ?? undefined,
      action: r.action,
      data: (r.data ?? {}) as any,
      localId: r.localId,
      timestamp: r.timestamp,
      status: r.status as any,
      error: r.error ?? undefined,
    }));
  }
}
