/**
 * @repository SyncRepository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ISyncRepository, SyncItemDto, PendingSync } from '../../application/dto';

@Injectable()
export class SyncRepository implements ISyncRepository {
  constructor(private readonly prisma: PrismaService) {}

  async savePending(
    userId: string,
    item: SyncItemDto & { deviceId: string },
  ): Promise<PendingSync> {
    const pending = await this.prisma.pendingSync.create({
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

    return this.toDomain(pending);
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
    const where: any = {};
    if (since) {
      where.updatedAt = { gte: since };
    }

    // Get changes from relevant tables
    const ordenes = await this.prisma.orden.findMany({
      where: {
        ...where,
        OR: [{ tecnicoAsignadoId: userId }, { creadoPorId: userId }],
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    return ordenes.map((o) => ({
      entityType: 'orden',
      entityId: o.id,
      action: 'update',
      data: {},
      timestamp: o.updatedAt,
    }));
  }

  async getPendingByUser(userId: string): Promise<PendingSync[]> {
    const pending = await this.prisma.pendingSync.findMany({
      where: { userId, status: 'pending' },
      orderBy: { timestamp: 'asc' },
    });

    return pending.map(this.toDomain);
  }

  private toDomain(raw: any): PendingSync {
    return {
      id: raw.id,
      userId: raw.userId,
      deviceId: raw.deviceId,
      entityType: raw.entityType,
      entityId: raw.entityId,
      action: raw.action,
      data: raw.data,
      localId: raw.localId,
      timestamp: raw.timestamp,
      status: raw.status,
      error: raw.error,
    };
  }
}
