/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRISMA MANTENIMIENTO REPOSITORY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Implementación concreta del repositorio de mantenimientos usando Prisma.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Injectable } from "@nestjs/common";
import { Mantenimiento, EstadoMantenimiento } from "@prisma/client";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  IMantenimientoRepository,
  QueryMantenimientosOptions,
  PaginatedResult,
  CreateMantenimientoData,
  UpdateMantenimientoData,
  EjecutarMantenimientoData,
} from "../../domain/repositories/mantenimiento.repository.interface";

@Injectable()
export class PrismaMantenimientoRepository implements IMantenimientoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Mantenimiento | null> {
    return this.prisma.mantenimiento.findUnique({
      where: { id },
      include: {
        tecnico: {
          select: { id: true, email: true, name: true },
        },
        creadoPor: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async findMany(
    options: QueryMantenimientosOptions,
  ): Promise<PaginatedResult<Mantenimiento>> {
    const {
      activoId,
      tipo,
      estado,
      prioridad,
      tecnicoId,
      fechaDesde,
      fechaHasta,
      page = 1,
      limit = 20,
      orderBy = "fechaProgramada",
      orderDir = "asc",
    } = options;

    const where: Record<string, unknown> = {};
    if (activoId) where.activoId = activoId;
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;
    if (prioridad) where.prioridad = prioridad;
    if (tecnicoId) where.tecnicoId = tecnicoId;
    if (fechaDesde || fechaHasta) {
      where.fechaProgramada = {};
      if (fechaDesde) (where.fechaProgramada as Record<string, Date>).gte = fechaDesde;
      if (fechaHasta) (where.fechaProgramada as Record<string, Date>).lte = fechaHasta;
    }

    const [data, total] = await Promise.all([
      this.prisma.mantenimiento.findMany({
        where,
        include: {
          tecnico: {
            select: { id: true, email: true, name: true },
          },
        },
        orderBy: { [orderBy]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mantenimiento.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findProximos(dias: number): Promise<Mantenimiento[]> {
    const ahora = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    return this.prisma.mantenimiento.findMany({
      where: {
        fechaProgramada: {
          gte: ahora,
          lte: limite,
        },
        estado: {
          in: [EstadoMantenimiento.programado, EstadoMantenimiento.pendiente],
        },
      },
      include: {
        tecnico: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { fechaProgramada: "asc" },
    });
  }

  async findVencidos(): Promise<Mantenimiento[]> {
    const ahora = new Date();

    return this.prisma.mantenimiento.findMany({
      where: {
        fechaProgramada: { lt: ahora },
        estado: {
          in: [EstadoMantenimiento.programado, EstadoMantenimiento.pendiente],
        },
      },
      include: {
        tecnico: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { fechaProgramada: "asc" },
    });
  }

  async create(data: CreateMantenimientoData): Promise<Mantenimiento> {
    return this.prisma.mantenimiento.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo: data.tipo,
        prioridad: data.prioridad,
        estado: EstadoMantenimiento.programado,
        fechaProgramada: data.fechaProgramada,
        duracionEstimada: data.duracionEstimada,
        activoId: data.activoId,
        activoTipo: data.activoTipo,
        tecnicoId: data.tecnicoId,
        tareas: data.tareas ?? [],
        materiales: data.materiales ?? [],
        creadoPorId: data.creadoPorId,
      },
      include: {
        tecnico: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateMantenimientoData): Promise<Mantenimiento> {
    return this.prisma.mantenimiento.update({
      where: { id },
      data: {
        ...(data.titulo && { titulo: data.titulo }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.estado && { estado: data.estado }),
        ...(data.prioridad && { prioridad: data.prioridad }),
        ...(data.fechaProgramada && { fechaProgramada: data.fechaProgramada }),
        ...(data.duracionEstimada !== undefined && { duracionEstimada: data.duracionEstimada }),
        ...(data.tecnicoId && { tecnicoId: data.tecnicoId }),
        ...(data.tareas && { tareas: data.tareas }),
        ...(data.materiales && { materiales: data.materiales }),
        ...(data.observaciones && { observaciones: data.observaciones }),
      },
      include: {
        tecnico: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async ejecutar(id: string, data: EjecutarMantenimientoData): Promise<Mantenimiento> {
    const now = new Date();
    return this.prisma.mantenimiento.update({
      where: { id },
      data: {
        estado: EstadoMantenimiento.completado,
        fechaInicio: data.fechaInicio ?? now,
        fechaFin: data.fechaFin ?? now,
        trabajoRealizado: data.trabajoRealizado,
        tareasCompletadas: data.tareasCompletadas ?? [],
        problemasEncontrados: data.problemasEncontrados ?? [],
        repuestosUtilizados: data.repuestosUtilizados ?? [],
        observaciones: data.observaciones,
        costoTotal: data.costoTotal,
        calificacionFinal: data.calificacionFinal,
        requiereSeguimiento: data.requiereSeguimiento ?? false,
        recomendaciones: data.recomendaciones,
        evidenciaIds: data.evidenciaIds ?? [],
      },
      include: {
        tecnico: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async programar(
    id: string,
    fechaProgramada: Date,
    tecnicoId?: string,
    observaciones?: string,
  ): Promise<Mantenimiento> {
    return this.prisma.mantenimiento.update({
      where: { id },
      data: {
        fechaProgramada,
        ...(tecnicoId && { tecnicoId }),
        ...(observaciones && { observaciones }),
        estado: EstadoMantenimiento.programado,
      },
      include: {
        tecnico: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.mantenimiento.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.mantenimiento.count({ where: { id } });
    return count > 0;
  }
}
