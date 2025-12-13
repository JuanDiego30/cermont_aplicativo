/**
 * @repository OrdenRepository
 * @description Implementación del repositorio de órdenes con Prisma
 * @layer Infrastructure
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IOrdenRepository, OrdenFilters, OrdenListResult } from '../../domain/repositories';
import { OrdenEntity } from '../../domain/entities';
import { EstadoOrden, PrioridadLevel } from '../../domain/value-objects';

@Injectable()
export class OrdenRepository implements IOrdenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: OrdenFilters): Promise<OrdenListResult> {
    const where: any = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.cliente) {
      where.cliente = { contains: filters.cliente, mode: 'insensitive' };
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

    const skip = (filters.page - 1) * filters.limit;

    const [ordenes, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: filters.limit,
        include: {
          creador: { select: { id: true, name: true } },
          asignado: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / filters.limit);

    return {
      data: ordenes.map((o) => this.toDomain(o)),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<OrdenEntity | null> {
    const orden = await this.prisma.order.findUnique({
      where: { id },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
        items: true,
        evidencias: true,
        costos: true,
        planeacion: true,
        ejecucion: true,
      },
    });

    if (!orden) return null;

    return this.toDomain(orden);
  }

  async findByNumero(numero: string): Promise<OrdenEntity | null> {
    const orden = await this.prisma.order.findFirst({
      where: { numero },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    if (!orden) return null;

    return this.toDomain(orden);
  }

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

    return this.toDomain(created);
  }

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
      },
      include: {
        creador: { select: { id: true, name: true } },
        asignado: { select: { id: true, name: true } },
      },
    });

    return this.toDomain(updated);
  }

  async updateEstado(id: string, estado: EstadoOrden): Promise<OrdenEntity> {
    const updateData: any = { estado };

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

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return this.prisma.order.count();
  }

  async getNextSequence(): Promise<number> {
    const count = await this.prisma.order.count();
    return count + 1;
  }

  private toDomain(data: any): OrdenEntity {
    return OrdenEntity.fromPersistence(
      {
        id: data.id,
        numero: data.numero,
        descripcion: data.descripcion,
        cliente: data.cliente,
        estado: data.estado as EstadoOrden,
        prioridad: data.prioridad as PrioridadLevel,
        fechaInicio: data.fechaInicio ?? undefined,
        fechaFin: data.fechaFin ?? undefined,
        fechaFinEstimada: data.fechaFinEstimada ?? undefined,
        presupuestoEstimado: data.presupuestoEstimado ?? undefined,
        creadorId: data.creadorId,
        asignadoId: data.asignadoId ?? undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      data.creador ? { id: data.creador.id, name: data.creador.name } : undefined,
      data.asignado ? { id: data.asignado.id, name: data.asignado.name } : undefined,
    );
  }
}
