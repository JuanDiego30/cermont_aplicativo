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
    const record = await this.prisma.pendingSync.create({
      data: {
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
    });

    return {
      id: record.id,
      userId: record.userId,
      deviceId: record.deviceId || item.deviceId,
      entityType: record.entityType,
      entityId: record.entityId ?? undefined,
      action: record.action,
      data: (record.data ?? {}) as any,
      localId: record.localId || item.localId,
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

    return [
      ...ordenes.map((o) => ({ type: 'orden', data: o })),
      ...ejecuciones.map((e) => ({ type: 'ejecucion', data: e })),
    ];
  }

  async getPendingByUser(userId: string): Promise<PendingSync[]> {
    const records = await this.prisma.pendingSync.findMany({
      where: {
        userId,
        status: { in: ['pending', 'failed'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((r) => ({
      id: r.id,
      userId: r.userId,
      deviceId: r.deviceId || '',
      entityType: r.entityType,
      entityId: r.entityId ?? undefined,
      action: r.action,
      data: (r.data ?? {}) as any,
      localId: r.localId || '',
      timestamp: r.timestamp,
      status: r.status as any,
      error: r.error ?? undefined,
    }));
  }
}
