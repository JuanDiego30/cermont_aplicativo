import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';
import type { Order, ContactInfo } from '../../../domain/entities/Order.js';
import { OrderState, OrderPriority } from '../../../domain/entities/Order.js';
import type { 
  IOrderRepository, 
  OrderFilters, 
  PaginationParams, 
  SortingParams, 
  OrderDashboardStats 
} from '../../../domain/repositories/IOrderRepository.js';

export class OrderRepository implements IOrderRepository {
  
  private toDomain(prismaOrder: any): Order {
    const clientContact: ContactInfo = {
      name: prismaOrder.clientName,
      email: prismaOrder.clientEmail ?? undefined,
      phone: prismaOrder.clientPhone ?? undefined,
    };

    return {
      id: prismaOrder.id,
      orderNumber: prismaOrder.orderNumber,
      clientName: prismaOrder.clientName,
      clientContact,
      description: prismaOrder.description,
      state: prismaOrder.state as OrderState,
      priority: prismaOrder.priority as OrderPriority,
      location: prismaOrder.location ?? undefined,
      estimatedHours: prismaOrder.estimatedHours?.toNumber?.() ?? prismaOrder.estimatedHours ?? undefined,
      archived: prismaOrder.archived,
      responsibleId: prismaOrder.responsibleId ?? undefined,
      stateHistory: [], // Se llenaría con una tabla relacionada si existiera
      createdBy: prismaOrder.createdBy,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
    };
  }

  async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<Order> {
    // Generación de número de orden (Fallback si nextOrderNumber falla)
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const fallbackOrderNumber = `OT-${timestamp}-${random}`;

    const createData: Prisma.OrderUncheckedCreateInput = {
      orderNumber: fallbackOrderNumber,
      clientName: data.clientName,
      clientEmail: data.clientContact?.email || null,
      clientPhone: data.clientContact?.phone || null,
      description: data.description,
      state: data.state,
      priority: data.priority || OrderPriority.MEDIUM,
      location: data.location || null,
      estimatedHours: data.estimatedHours || null,
      archived: data.archived || false,
      responsibleId: data.responsibleId,
      createdBy: data.createdBy,
    };

    const created = await prisma.order.create({ data: createData });
    return this.toDomain(created);
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const updateData: any = {};
    
    if (order.clientName) updateData.clientName = order.clientName;
    if (order.clientContact) {
      if (order.clientContact.email !== undefined) updateData.clientEmail = order.clientContact.email;
      if (order.clientContact.phone !== undefined) updateData.clientPhone = order.clientContact.phone;
    }
    if (order.description) updateData.description = order.description;
    if (order.state) updateData.state = order.state;
    if (order.priority) updateData.priority = order.priority;
    if (order.location) updateData.location = order.location;
    if (order.estimatedHours !== undefined) updateData.estimatedHours = order.estimatedHours;
    if (order.responsibleId !== undefined) updateData.responsibleId = order.responsibleId;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Order | null> {
    const found = await prisma.order.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(
    filters: OrderFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = {};

    if (filters.state) where.state = filters.state;
    if (filters.responsibleId) where.responsibleId = filters.responsibleId;
    if (filters.createdBy) where.createdBy = filters.createdBy;
    if (filters.archived !== undefined) where.archived = filters.archived;

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search } }, // mode insensitive si postgres
        { description: { contains: filters.search } },
        { clientName: { contains: filters.search } },
      ];
    }

    if (filters.dateRange) {
      // Solo aplicar dateRange para campos que existen en Prisma
      const fieldMap: Record<string, keyof Prisma.OrderWhereInput> = {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };
      const prismaField = fieldMap[filters.dateRange.field];
      if (prismaField) {
        (where as any)[prismaField] = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        };
      }
    }

    const items = await prisma.order.findMany({
      where,
      take: pagination?.limit,
      skip: pagination?.skip,
      orderBy: sorting 
        ? { [sorting.field]: sorting.order }
        : { createdAt: 'desc' },
    });

    return items.map(o => this.toDomain(o));
  }

  async count(filters: OrderFilters): Promise<number> {
    const where: Prisma.OrderWhereInput = {};
    if (filters.state) where.state = filters.state;
    if (filters.responsibleId) where.responsibleId = filters.responsibleId;
    if (filters.archived !== undefined) where.archived = filters.archived;
    
    return prisma.order.count({ where });
  }

  async archive(id: string, _userId: string): Promise<Order> {
    const archived = await prisma.order.update({
      where: { id },
      data: { 
        archived: true,
      },
    });
    return this.toDomain(archived);
  }

  async unarchive(id: string): Promise<Order> {
    const restored = await prisma.order.update({
      where: { id },
      data: { 
        archived: false,
      },
    });
    return this.toDomain(restored);
  }

  async delete(id: string): Promise<void> {
    await prisma.order.delete({ where: { id } });
  }

  async nextOrderNumber(year: number): Promise<string> {
    const prefix = `${year}-`;
    const lastOrder = await prisma.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
    });

    let nextNum = 1;
    if (lastOrder) {
      const parts = lastOrder.orderNumber.split('-');
      if (parts.length >= 2) {
        const seq = parseInt(parts[1], 10);
        if (!isNaN(seq)) nextNum = seq + 1;
      }
    }

    return `${year}-${nextNum.toString().padStart(4, '0')}`;
  }

  async getDashboardStats(filters?: OrderFilters): Promise<OrderDashboardStats> {
    const where: Prisma.OrderWhereInput = {};
    if (filters?.dateRange) {
      // Solo aplicar dateRange para campos que existen en Prisma
      const fieldMap: Record<string, keyof Prisma.OrderWhereInput> = {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      };
      const prismaField = fieldMap[filters.dateRange.field];
      if (prismaField) {
        (where as any)[prismaField] = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        };
      }
    }

    // Agregaciones
    const [total, active, archived, byStateRaw, byRespRaw] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, archived: false } }),
      prisma.order.count({ where: { ...where, archived: true } }),
      prisma.order.groupBy({
        by: ['state'],
        where,
        _count: { state: true },
      }),
      prisma.order.groupBy({
        by: ['responsibleId'],
        where,
        _count: { _all: true },
      }),
    ]);

    const byState: Record<OrderState, number> = {} as any;
    byStateRaw.forEach(g => {
      byState[g.state as OrderState] = g._count.state;
    });

    const byResponsible = byRespRaw
      .filter(g => g.responsibleId !== null)
      .map(g => ({
        id: g.responsibleId!,
        name: `User ${g.responsibleId}`, // Idealmente hacer join con Users
        count: g._count._all,
      }));

    return {
      total,
      active,
      archived,
      byState,
      byResponsible,
      completionRate: { averageHours: 0, medianHours: 0 }, // Calcular si hay datos reales
    };
  }

  // --- Métodos Legacy (Compatibilidad) ---

  async find(filters: any): Promise<Order[]> {
    return this.findAll(filters);
  }

  async countByState(filters?: any): Promise<Record<string, number>> {
    const stats = await this.getDashboardStats(filters);
    return stats.byState;
  }
  
  async findByResponsible(responsibleId: string): Promise<Order[]> {
    return this.findAll({ responsibleId });
  }

  async findArchived(): Promise<Order[]> {
    return this.findAll({ archived: true });
  }

  async findActive(): Promise<Order[]> {
    return this.findAll({ archived: false });
  }

  /**
   * Encuentra órdenes elegibles para archivar.
   * Órdenes completadas o canceladas antes de la fecha de corte.
   */
  async findArchivable(cutoffDate: Date): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: {
        archived: false,
        state: { in: ['COMPLETED', 'CANCELLED'] },
        updatedAt: { lt: cutoffDate },
      },
      take: 100, // Batch limit
    });
    return orders.map(o => this.toDomain(o));
  }

  /**
   * Obtiene los datos completos de una orden con todas sus relaciones.
   */
  async getFullOrderData(id: string): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        workPlans: true,
        evidences: true,
        responsible: true,
        creator: true,
      },
    });
    return order;
  }

  /**
   * Archiva órdenes completadas antes de la fecha de corte.
   * Retorna el número de órdenes archivadas.
   */
  async archiveCompleted(cutoffDate: Date): Promise<number> {
    const result = await prisma.order.updateMany({
      where: {
        archived: false,
        state: { in: ['COMPLETED', 'CANCELLED'] },
        updatedAt: { lt: cutoffDate },
      },
      data: {
        archived: true,
      },
    });
    return result.count;
  }

  // Estos métodos cruzan dominios, deberían eliminarse en refactorización futura
  async findWorkPlansByOrderId(orderId: string): Promise<any[]> { return []; }
  async findEvidencesByOrderId(orderId: string): Promise<any[]> { return []; }
  async findAuditLogByOrderId(orderId: string): Promise<any[]> { return []; }

  // --- Métodos adicionales requeridos por IOrderRepository ---

  async countOrders(filters?: any): Promise<number> {
    return this.count(filters || {});
  }

  async countByResponsible(_filters?: any): Promise<Record<string, number>> {
    const stats = await this.getDashboardStats();
    const result: Record<string, number> = {};
    stats.byResponsible.forEach(r => {
      result[r.id] = r.count;
    });
    return result;
  }

  async countArchived(_filters?: any): Promise<number> {
    return prisma.order.count({ where: { archived: true } });
  }

  async countCompletedThisMonth(_filters?: any): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    return prisma.order.count({
      where: {
        state: 'COMPLETED',
        updatedAt: { gte: startOfMonth },
      },
    });
  }

  async countCompletedThisWeek(_filters?: any): Promise<number> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return prisma.order.count({
      where: {
        state: 'COMPLETED',
        updatedAt: { gte: startOfWeek },
      },
    });
  }

  async getCompletionStats(_filters?: any): Promise<any> {
    const stats = await this.getDashboardStats();
    return {
      averageHours: stats.completionRate.averageHours,
      medianHours: stats.completionRate.medianHours,
    };
  }
}

// Singleton export
export const orderRepository = new OrderRepository();

