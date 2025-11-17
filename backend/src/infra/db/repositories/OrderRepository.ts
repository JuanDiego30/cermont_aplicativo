/**
 * Order Repository - Prisma Implementation
 * SQLite con conversión a Domain Entities
 * 
 * @file src/infra/db/repositories/OrderRepository.ts
 */

import prisma from '../prisma.js';
import type { Order as PrismaOrder } from '@prisma/client';
import type { Order, OrderPriority, OrderState } from '../../../domain/entities/Order.js';
import type { IOrderRepository, OrderStats } from '../../../domain/repositories/IOrderRepository.js';

export class OrderRepository implements IOrderRepository {
  /**
   * Convertir Prisma Order a Domain Order
   */
  private toDomain(prismaOrder: PrismaOrder): Order {
    const priority = prismaOrder.priority as OrderPriority;

    return {
      id: prismaOrder.id,
      orderNumber: prismaOrder.orderNumber,
      clientName: prismaOrder.clientName,
      clientEmail: prismaOrder.clientEmail ?? undefined,
      clientPhone: prismaOrder.clientPhone ?? undefined,
      description: prismaOrder.description,
      state: prismaOrder.state as OrderState,
      priority,
      location: prismaOrder.location ?? undefined,
      estimatedHours: prismaOrder.estimatedHours ?? undefined,
      archived: prismaOrder.archived,
      responsibleId: prismaOrder.responsibleId,
      createdBy: prismaOrder.createdBy,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
    };
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<Order | null> {
    const prismaOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        responsible: true,
        workPlans: true,
        evidences: true,
      },
    });

    return prismaOrder ? this.toDomain(prismaOrder) : null;
  }

  /**
   * Find by Order Number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const prismaOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        responsible: true,
      },
    });

    return prismaOrder ? this.toDomain(prismaOrder) : null;
  }

  /**
   * Create Order
   * 
   * ✅ FIX: Generar orderNumber automáticamente
   */
  async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<Order> {
    // Generar orderNumber único
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `OT-${timestamp}-${random}`;

    const prismaOrder = await prisma.order.create({
      data: {
        orderNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail || null,
        clientPhone: data.clientPhone || null,
        description: data.description,
        state: data.state,
        priority: data.priority || 'NORMAL',
        location: data.location || null,
        estimatedHours: data.estimatedHours || null,
        archived: data.archived || false,
        responsibleId: data.responsibleId,
        createdBy: data.createdBy,
      },
      include: {
        responsible: true,
      },
    });

    return this.toDomain(prismaOrder);
  }

  /**
   * Update Order
   */
  async update(id: string, data: Partial<Order>): Promise<Order> {
    const updateData: any = {};

    if (data.clientName !== undefined) updateData.clientName = data.clientName;
    if (data.clientEmail !== undefined) updateData.clientEmail = data.clientEmail;
    if (data.clientPhone !== undefined) updateData.clientPhone = data.clientPhone;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
    if (data.archived !== undefined) updateData.archived = data.archived;
    if (data.responsibleId !== undefined) updateData.responsibleId = data.responsibleId;

    const prismaOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        responsible: true,
      },
    });

    return this.toDomain(prismaOrder);
  }

  /**
   * Delete Order
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.order.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Find with filters (compatible con ambas interfaces)
   */
  async find(filters?: {
    page?: number;
    limit?: number;
    state?: OrderState;
    responsableId?: string; // ← typo mantenido para compatibilidad
    responsibleId?: string; // ← correcto
    archived?: boolean;
  }): Promise<Order[]> {
    const where: any = {};

    if (filters?.state) where.state = filters.state;
    
    // Manejar ambos: responsableId (typo) y responsibleId (correcto)
    const responsibleId = filters?.responsibleId || filters?.responsableId;
    if (responsibleId) where.responsibleId = responsibleId;
    
    if (filters?.archived !== undefined) where.archived = filters.archived;

    const prismaOrders = await prisma.order.findMany({
      where,
      take: filters?.limit || 50,
      skip: filters?.page ? (filters.page - 1) * (filters.limit || 50) : 0,
      include: {
        responsible: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaOrders.map((order) => this.toDomain(order));
  }

  /**
   * Count with filters
   */
  async count(filters?: {
    state?: OrderState;
    responsableId?: string; // ← typo mantenido
    responsibleId?: string; // ← correcto
    archived?: boolean;
  }): Promise<number> {
    const where: any = {};

    if (filters?.state) where.state = filters.state;
    
    const responsibleId = filters?.responsibleId || filters?.responsableId;
    if (responsibleId) where.responsibleId = responsibleId;
    
    if (filters?.archived !== undefined) where.archived = filters.archived;

    return await prisma.order.count({ where });
  }

  /**
   * Find all with advanced filters
   */
  async findAll(filters?: {
    state?: string;
    responsibleId?: string;
    archived?: boolean;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    const where: any = {};

    if (filters?.state) where.state = filters.state;
    if (filters?.responsibleId) where.responsibleId = filters.responsibleId;
    if (filters?.archived !== undefined) where.archived = filters.archived;
    
    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { clientName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [prismaOrders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: filters?.limit || 50,
        skip: filters?.skip || 0,
        include: {
          responsible: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    const orders = prismaOrders.map((order) => this.toDomain(order));

    return { orders, total };
  }

  /**
   * Find by state
   */
  async findByState(state: OrderState): Promise<Order[]> {
    const prismaOrders = await prisma.order.findMany({
      where: { state },
      include: { responsible: true },
      orderBy: { createdAt: 'desc' },
    });

    return prismaOrders.map((order) => this.toDomain(order));
  }

  /**
   * Find active orders
   */
  async findActive(filters?: { page?: number; limit?: number }): Promise<Order[]> {
    const prismaOrders = await prisma.order.findMany({
      where: { archived: false },
      include: { responsible: true },
      take: filters?.limit,
      skip: filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return prismaOrders.map((order) => this.toDomain(order));
  }

  /**
   * Find archived orders
   */
  async findArchived(): Promise<Order[]> {
    const prismaOrders = await prisma.order.findMany({
      where: { archived: true },
      include: { responsible: true },
      orderBy: { createdAt: 'desc' },
    });

    return prismaOrders.map((order) => this.toDomain(order));
  }

  /**
   * Transition state
   */
  /**
   * Assign to user
   */
  async assignToUser(id: string, userId: string): Promise<Order> {
    const prismaOrder = await prisma.order.update({
      where: { id },
      data: { responsibleId: userId },
      include: { responsible: true },
    });

    return this.toDomain(prismaOrder);
  }

  /**
   * Archive order
   */
  async archive(id: string): Promise<Order> {
    const prismaOrder = await prisma.order.update({
      where: { id },
      data: { archived: true },
    });

    return this.toDomain(prismaOrder);
  }

  /**
   * Unarchive order
   */
  async unarchive(id: string): Promise<Order> {
    const prismaOrder = await prisma.order.update({
      where: { id },
      data: { archived: false },
    });

    return this.toDomain(prismaOrder);
  }

  /**
   * Get statistics
   */
  async getStats(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<OrderStats> {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const orders = await prisma.order.findMany({
      where,
      select: { state: true, archived: true },
    });

    const total = orders.length;
    const active = orders.filter((order) => !order.archived).length;
    const archivedCount = orders.filter((order) => order.archived).length;

    const byState: Record<string, number> = {};
    orders.forEach((order) => {
      byState[order.state] = (byState[order.state] || 0) + 1;
    });

    return {
      total,
      active,
      archived: archivedCount,
      byState: byState as Record<OrderState, number>,
    };
  }

  /**
   * Find by responsible
   */
  async findByResponsible(responsibleId: string): Promise<Order[]> {
    const prismaOrders = await prisma.order.findMany({
      where: { responsibleId },
      include: { responsible: true },
      orderBy: { createdAt: 'desc' },
    });

    return prismaOrders.map((order) => this.toDomain(order));
  }

  /**
   * Count by state
   */
  async countByState(state: string): Promise<number> {
    return await prisma.order.count({
      where: { state },
    });
  }

  /**
   * Archive completed orders older than cutoff date
   */
  async archiveCompleted(cutoffDate: Date): Promise<number> {
    const result = await prisma.order.updateMany({
      where: {
        state: 'COMPLETADO',
        updatedAt: {
          lt: cutoffDate,
        },
        archived: false,
      },
      data: {
        archived: true,
      },
    });

    return result.count;
  }
}

export const orderRepository = new OrderRepository();

