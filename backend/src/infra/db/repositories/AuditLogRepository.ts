import { Prisma, type AuditLog as PrismaAuditLog } from '@prisma/client';
import type { AuditLog, AuditLogFilters, AuditAction } from '../../../domain/entities/AuditLog.js';
import type { IAuditLogRepository, PaginationParams, SortingParams } from '../../../domain/repositories/IAuditLogRepository.js';
import { prisma } from '../prisma.js';

/**
 * Implementación de Prisma para AuditLogRepository
 */
export class AuditLogRepository implements IAuditLogRepository {
  
  /**
   * Convierte el modelo de Prisma a la entidad de Dominio.
   * Maneja la conversión de JSON strings si la BD no soporta JSON nativo.
   */
  private toDomain(log: PrismaAuditLog): AuditLog {
    return {
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action as AuditAction,
      userId: log.userId,
      before: typeof log.before === 'string' ? JSON.parse(log.before) : log.before,
      after: typeof log.after === 'string' ? JSON.parse(log.after) : log.after,
      ip: log.ip,
      userAgent: log.userAgent ?? undefined,
      reason: log.reason ?? undefined,
      timestamp: log.timestamp,
    };
  }

  async create(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const created = await prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        // Prisma maneja la serialización - stringify para almacenar como String
        before: data.before ? JSON.stringify(data.before) : null,
        after: data.after ? JSON.stringify(data.after) : null,
        ip: data.ip ?? 'unknown',
        userAgent: data.userAgent ?? null,
        reason: data.reason ?? null,
        timestamp: new Date(), // Explícito o default DB
      },
    });

    return this.toDomain(created);
  }

  async findAll(
    filters: AuditLogFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<AuditLog[]> {
    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.entityId) where.entityId = filters.entityId;
    
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: pagination?.limit,
      skip: pagination?.skip,
      orderBy: sorting
        ? { [sorting.field]: sorting.order }
        : { timestamp: 'desc' },
    });

    return logs.map(log => this.toDomain(log));
  }

  async count(filters: AuditLogFilters): Promise<number> {
    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.entityId) where.entityId = filters.entityId;
    
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    return prisma.auditLog.count({ where });
  }

  async prune(retentionDate: Date): Promise<number> {
    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: retentionDate,
        },
      },
    });
    return result.count;
  }

  // --- Métodos Legacy / Alias para compatibilidad con UseCases antiguos ---

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.findAll({ entityType, entityId });
  }

  async findByEntityId(entityId: string): Promise<AuditLog[]> {
    return this.findAll({ entityId });
  }

  /**
   * Encuentra los logs más recientes
   */
  async findRecent(limit: number = 10): Promise<AuditLog[]> {
    return this.findAll({}, { page: 1, limit, skip: 0 }, { field: 'timestamp', order: 'desc' });
  }

  /**
   * Alias para findAll con filtros (compatibilidad)
   */
  async find(filters: any): Promise<AuditLog[]> {
    return this.findAll(filters);
  }

  async findByUser(userId: string, dateRange?: { start?: Date; end?: Date }): Promise<AuditLog[]> {
    return this.findAll({ 
      userId, 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    });
  }

  /**
   * @deprecated Use prune() instead
   */
  async deleteOlderThan(days: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.prune(date);
  }

  /**
   * @deprecated Use findAll() instead
   */
  async findByFilters(filters: any, pagination?: any, sorting?: any): Promise<AuditLog[]> {
    return this.findAll(filters, pagination, sorting);
  }

  /**
   * @deprecated Use count() instead
   */
  async countByFilters(filters: any): Promise<number> {
    return this.count(filters);
  }
}

// Exportar singleton para legacy imports (si es necesario)
export const auditLogRepository = new AuditLogRepository();
