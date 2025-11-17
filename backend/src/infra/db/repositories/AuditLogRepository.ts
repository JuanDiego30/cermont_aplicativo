import prisma from '../prisma';
import type { AuditLog } from '@/domain/entities/AuditLog';
import { AuditAction } from '@/domain/entities/AuditLog';
import type {
  AuditLogFilters,
  IAuditLogRepository,
} from '@/domain/repositories/IAuditLogRepository';

/**
 * Implementaci�n de Prisma para AuditLogRepository
 * @class AuditLogRepository
 * @implements {IAuditLogRepository}
 */
export class AuditLogRepository implements IAuditLogRepository {
  private toDomain(log: any): AuditLog {
    return {
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action as AuditAction,
      userId: log.userId,
      before: log.before ? JSON.parse(log.before) : null,
      after: log.after ? JSON.parse(log.after) : null,
      ip: log.ip,
      userAgent: log.userAgent ?? undefined,
      reason: log.reason ?? undefined,
      timestamp: log.timestamp,
    };
  }
  /**
   * Crea un nuevo registro de auditor�a
   */
  async create(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const created = await prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        before: data.before ? JSON.stringify(data.before) : null,
        after: data.after ? JSON.stringify(data.after) : null,
        ip: data.ip ?? 'unknown',
        userAgent: data.userAgent ?? null,
        reason: data.reason ?? null,
      },
      include: {
        user: true,
      },
    });

    return this.toDomain(created);
  }

  /**
   * Busca registros por ID de entidad
   */
  async findByEntityId(entityId: string): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      where: { entityId },
      include: {
        user: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((log: any) => this.toDomain(log));
  }

  /**
   * Busca registros por usuario
   */
  async findByUser(userId: string, startDate?: Date, endDate?: Date): Promise<AuditLog[]> {
    const where: any = { userId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: {
        user: true,
      },
    });

    return logs.map((log: any) => this.toDomain(log));
  }

  /**
   * Elimina registros m�s antiguos que X d�as
   */
  async deleteOlderThan(days: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: date,
        },
      },
    });

    return result.count;
  }

  async find(filters: AuditLogFilters): Promise<AuditLog[]> {
    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: filters.limit || 50,
      skip: filters.skip || 0,
      include: { user: true },
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((log: any) => this.toDomain(log));
  }

  async count(filters: Omit<AuditLogFilters, 'limit' | 'skip'>): Promise<number> {
    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    return await prisma.auditLog.count({ where });
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      where: { entityType, entityId },
      include: { user: true },
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((log: any) => this.toDomain(log));
  }

  // M�todo adicional requerido
  async findRecent(limit: number): Promise<AuditLog[]> {
    const logs = await prisma.auditLog.findMany({
      take: limit,
      include: { user: true },
      orderBy: { timestamp: 'desc' },
    });

    return logs.map((log: any) => ({
      ...log,
      before: log.before ? JSON.parse(log.before) : null,
      after: log.after ? JSON.parse(log.after) : null,
    }));
  }
}

export const auditLogRepository = new AuditLogRepository();
