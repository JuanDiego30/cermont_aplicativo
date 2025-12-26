/**
 * @repository PrismaOrdenRepository
 * @description Implementación de IOrdenRepository usando Prisma
 * @layer Infrastructure
 * 
 * Principios aplicados:
 * - DIP: Implementa interfaz de dominio
 * - SRP: Solo responsable de persistencia
 * - OCP: Extensible sin modificar dominio
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IOrdenRepository,
  OrdenFilters,
  OrdenListResult,
} from '../../domain/repositories';
import { OrdenEntity, OrdenProps } from '../../domain/entities';
import { EstadoOrden, PrioridadLevel } from '../../domain/value-objects';

@Injectable()
export class PrismaOrdenRepository implements IOrdenRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Busca todas las órdenes con filtros y paginación
   */
  async findAll(filters: OrdenFilters): Promise<OrdenListResult> {
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

    const data = orders.map((order) => this.toDomainEntity(order));

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
  }): Promise<{ items: any[]; total: number; page: number; limit: number; totalPages: number; hasMore: boolean }> {
    const { searchTerm, estado, prioridad, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null, // Excluir eliminados
      ...(estado && { estado }),
      ...(prioridad && { prioridad }),
      ...(searchTerm && {
        OR: [
          { numero: { contains: searchTerm, mode: 'insensitive' } },
          { descripcion: { contains: searchTerm, mode: 'insensitive' } },
          { cliente: { contains: searchTerm, mode: 'insensitive' } },
          { 
            asignado: { 
              name: { contains: searchTerm, mode: 'insensitive' } 
            } 
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
   * Busca una orden por ID
   */
  async findById(id: string): Promise<OrdenEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    if (!order) return null;

    return this.toDomainEntity(order);
  }

  /**
   * Busca una orden por número
   */
  async findByNumero(numero: string): Promise<OrdenEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: { numero },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    if (!order) return null;

    return this.toDomainEntity(order);
  }

  /**
   * Crea una nueva orden
   */
  async create(orden: OrdenEntity): Promise<OrdenEntity> {
    const created = await this.prisma.order.create({
      data: {
        numero: orden.numero.value,
        descripcion: orden.descripcion,
        cliente: orden.cliente,
        estado: orden.estado.value,
        prioridad: orden.prioridad.value,
        fechaFinEstimada: orden.fechaFinEstimada,
        presupuestoEstimado: orden.presupuestoEstimado,
        creadorId: orden.creadorId,
        asignadoId: orden.asignadoId,
      },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    return this.toDomainEntity(created);
  }

  /**
   * Actualiza una orden existente
   */
  async update(orden: OrdenEntity): Promise<OrdenEntity> {
    const updated = await this.prisma.order.update({
      where: { id: orden.id },
      data: {
        descripcion: orden.descripcion,
        cliente: orden.cliente,
        estado: orden.estado.value,
        prioridad: orden.prioridad.value,
        fechaInicio: orden.fechaInicio,
        fechaFin: orden.fechaFin,
        fechaFinEstimada: orden.fechaFinEstimada,
        presupuestoEstimado: orden.presupuestoEstimado,
        asignadoId: orden.asignadoId,
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
   * Actualiza solo el estado de una orden
   */
  async updateEstado(id: string, estado: EstadoOrden): Promise<OrdenEntity> {
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
   * Elimina una orden
   */
  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
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
  private buildWhereClause(filters: OrdenFilters): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.cliente) {
      where.cliente = {
        contains: filters.cliente,
        mode: 'insensitive',
      };
    }

    if (filters.prioridad) {
      where.prioridad = filters.prioridad;
    }

    if (filters.asignadoId) {
      where.asignadoId = filters.asignadoId;
    }

    if (filters.creadorId) {
      where.creadorId = filters.creadorId;
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      where.createdAt = {};
      if (filters.fechaDesde) {
        (where.createdAt as Record<string, unknown>).gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        (where.createdAt as Record<string, unknown>).lte = filters.fechaHasta;
      }
    }

    return where;
  }

  /**
   * Convierte un registro de Prisma a entidad de dominio
   * Aplica el patrón Mapper para separar persistencia de dominio
   */
  private toDomainEntity(order: PrismaOrderWithRelations): OrdenEntity {
    const props: OrdenProps = {
      id: order.id,
      numero: order.numero,
      descripcion: order.descripcion,
      cliente: order.cliente,
      estado: order.estado as EstadoOrden,
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

    const creador = order.creador
      ? { id: order.creador.id, name: order.creador.name }
      : undefined;

    const asignado = order.asignado
      ? { id: order.asignado.id, name: order.asignado.name }
      : undefined;

    return OrdenEntity.fromPersistence(props, creador, asignado);
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
