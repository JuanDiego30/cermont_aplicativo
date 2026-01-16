/**
 * @repository PrismaOrderRepository
 * @description Implementación de IOrderRepository usando Prisma
 * @layer Infrastructure
 *
 * Principios aplicados:
 * - DIP: Implementa interfaz de dominio
 * - SRP: Solo responsable de persistencia
 * - OCP: Extensible sin modificar dominio
 */
import type { OrderPriority, OrderStatus, Prisma } from '@/prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderEntity, OrderProps } from '../../domain/entities';
import { IOrderRepository, OrderFilters, OrderListResult } from '../../domain/repositories';
import { EstadoOrder, PrioridadLevel } from '../../domain/value-objects';

type OrderFullTextItem = Prisma.OrderGetPayload<{
  include: {
    asignado: {
      select: {
        id: true;
        name: true;
        email: true;
        phone: true;
      };
    };
  };
}>;

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca todas las órdenes con filtros y paginación
   */
  async findAll(filters: OrderFilters): Promise<OrderListResult> {
    const { page, limit, estado, cliente, prioridad, asignadoId, creadorId } = filters;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          creador: { select: { id: true, name: true } },
          asignado: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    const data = orders.map(order => this.toDomainEntity(order));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca órdenes con búsqueda full-text
   */
  async findWithFullTextSearch(query: {
    searchTerm?: string;
    estado?: string;
    prioridad?: string;
    page: number;
    limit: number;
  }): Promise<{
    items: OrderFullTextItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const { searchTerm, estado, prioridad, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      deletedAt: null, // Excluir eliminados
      ...(estado && { estado: estado as unknown as OrderStatus }),
      ...(prioridad && { prioridad: prioridad as unknown as OrderPriority }),
      ...(searchTerm && {
        OR: [
          { numero: { contains: searchTerm, mode: 'insensitive' } },
          { descripcion: { contains: searchTerm, mode: 'insensitive' } },
          { cliente: { contains: searchTerm, mode: 'insensitive' } },
          {
            asignado: {
              is: { name: { contains: searchTerm, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { prioridad: 'desc' }, // Urgente primero
          { createdAt: 'desc' },
        ],
        include: {
          asignado: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  /**
   * Busca una Order por ID
   */
  async findById(id: string): Promise<OrderEntity | null> {
    // findUnique no permite combinar con deletedAt; usamos findFirst para excluir soft-deleted
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    if (!order) return null;

    return this.toDomainEntity(order);
  }

  /**
   * Busca una Order por número
   */
  async findByNumero(numero: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: { numero, deletedAt: null },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    if (!order) return null;

    return this.toDomainEntity(order);
  }

  /**
   * Crea una nueva Order
   */
  async create(Order: OrderEntity): Promise<OrderEntity> {
    const created = await this.prisma.order.create({
      data: {
        numero: Order.numero.value,
        descripcion: Order.descripcion,
        cliente: Order.cliente,
        estado: Order.estado.value,
        prioridad: Order.prioridad.value,
        fechaFinEstimada: Order.fechaFinEstimada,
        presupuestoEstimado: Order.presupuestoEstimado,
        creadorId: Order.creadorId,
        asignadoId: Order.asignadoId,
      },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    return this.toDomainEntity(created);
  }

  /**
   * Actualiza una Order existente
   */
  async update(Order: OrderEntity): Promise<OrderEntity> {
    const updated = await this.prisma.order.update({
      where: { id: Order.id },
      data: {
        descripcion: Order.descripcion,
        cliente: Order.cliente,
        estado: Order.estado.value,
        prioridad: Order.prioridad.value,
        fechaInicio: Order.fechaInicio,
        fechaFin: Order.fechaFin,
        fechaFinEstimada: Order.fechaFinEstimada,
        presupuestoEstimado: Order.presupuestoEstimado,
        asignadoId: Order.asignadoId,
        updatedAt: new Date(),
      },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    return this.toDomainEntity(updated);
  }

  /**
   * Actualiza solo el estado de una Order
   */
  async updateEstado(id: string, estado: EstadoOrder): Promise<OrderEntity> {
    const updateData: Record<string, unknown> = {
      estado,
      updatedAt: new Date(),
    };

    // Actualizar fechas según el estado (lógica de negocio en infraestructura
    // solo para eficiencia - la validación está en el dominio)
    if (estado === 'ejecucion') {
      updateData.fechaInicio = new Date();
    } else if (estado === 'completada') {
      updateData.fechaFin = new Date();
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    return this.toDomainEntity(updated);
  }

  /**
   * Elimina una Order
   */
  async delete(id: string): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deleteReason: 'deleted',
      },
    });
  }

  /**
   * Cuenta el total de órdenes
   */
  async count(): Promise<number> {
    return this.prisma.order.count();
  }

  /**
   * Obtiene el siguiente número de secuencia
   */
  async getNextSequence(): Promise<number> {
    const count = await this.prisma.order.count();
    return count + 1;
  }

  // =====================================================
  // MÉTODOS PRIVADOS - Mappers y Builders
  // =====================================================

  /**
   * Construye la cláusula WHERE de Prisma desde los filtros
   */
  private buildWhereClause(filters: OrderFilters): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (filters.estado) {
      where.estado = filters.estado as unknown as OrderStatus;
    }

    if (filters.cliente) {
      where.cliente = {
        contains: filters.cliente,
        mode: 'insensitive',
      };
    }

    if (filters.prioridad) {
      where.prioridad = filters.prioridad as unknown as OrderPriority;
    }

    if (filters.asignadoId) {
      where.asignadoId = filters.asignadoId;
    }

    if (filters.creadorId) {
      where.creadorId = filters.creadorId;
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (filters.fechaDesde) {
        createdAt.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        createdAt.lte = filters.fechaHasta;
      }
      where.createdAt = createdAt;
    }

    return where;
  }

  /**
   * Convierte un registro de Prisma a entidad de dominio
   * Aplica el patrón Mapper para separar persistencia de dominio
   */
  private toDomainEntity(order: PrismaOrderWithRelations): OrderEntity {
    const props: OrderProps = {
      id: order.id,
      numero: order.numero,
      descripcion: order.descripcion,
      cliente: order.cliente,
      estado: order.estado as EstadoOrder,
      prioridad: order.prioridad as PrioridadLevel,
      fechaInicio: order.fechaInicio ?? undefined,
      fechaFin: order.fechaFin ?? undefined,
      fechaFinEstimada: order.fechaFinEstimada ?? undefined,
      presupuestoEstimado: order.presupuestoEstimado ?? undefined,
      creadorId: order.creadorId ?? undefined,
      asignadoId: order.asignadoId ?? undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    const creador = order.creador ? { id: order.creador.id, name: order.creador.name } : undefined;

    const asignado = order.asignado
      ? { id: order.asignado.id, name: order.asignado.name }
      : undefined;

    return OrderEntity.fromPersistence(props, creador, asignado);
  }
}

/**
 * Tipo auxiliar para el resultado de Prisma con relaciones
 */
interface PrismaOrderWithRelations {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  estado: string;
  prioridad: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  fechaFinEstimada: Date | null;
  presupuestoEstimado: number | null;
  creadorId: string | null;
  asignadoId: string | null;
  createdAt: Date;
  updatedAt: Date;
  creador: { id: string; name: string } | null;
  asignado: { id: string; name: string } | null;
}
