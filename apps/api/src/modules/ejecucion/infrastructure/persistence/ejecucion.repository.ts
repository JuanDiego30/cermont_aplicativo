/**
 * @repository EjecucionRepository
 * Usa el modelo Ejecucion de Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { EstadoEjecucion } from '.prisma/client';
import { IEjecucionRepository, EjecucionData } from '../../domain/repositories/ejecucion.repository.interface';

@Injectable()
export class EjecucionRepository implements IEjecucionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrdenId(ordenId: string): Promise<EjecucionData | null> {
    const ejecucion = await this.prisma.ejecucion.findUnique({
      where: { ordenId },
      include: {
        tareas: true,
        checklists: true,
      },
    });
    if (!ejecucion) return null;
    return this.mapToEjecucionData(ejecucion);
  }

  async iniciar(ordenId: string, tecnicoId: string, observaciones?: string): Promise<EjecucionData> {
    // Buscar planeación aprobada
    const planeacion = await this.prisma.planeacion.findUnique({
      where: { ordenId },
    });

    if (!planeacion || planeacion.estado !== 'aprobada') {
      throw new Error('No existe planeación aprobada para esta orden');
    }

    const ejecucion = await this.prisma.ejecucion.create({
      data: {
        ordenId,
        planeacionId: planeacion.id,
        estado: EstadoEjecucion.EN_PROGRESO,
        fechaInicio: new Date(),
        avancePercentaje: 0,
        horasEstimadas: 8, // Default
        observacionesInicio: observaciones,
      },
    });

    // Actualizar estado de la orden
    await this.prisma.order.update({
      where: { id: ordenId },
      data: {
        estado: 'ejecucion',
        fechaInicio: new Date(),
      },
    });

    return this.mapToEjecucionData(ejecucion);
  }

  async updateAvance(id: string, avance: number, observaciones?: string): Promise<EjecucionData> {
    const ejecucion = await this.prisma.ejecucion.update({
      where: { id },
      data: {
        avancePercentaje: Math.round(avance),
        observaciones: observaciones || undefined,
      },
    });
    return this.mapToEjecucionData(ejecucion);
  }

  async completar(
    id: string,
    data: { observacionesFinales?: string; firmaDigital?: string },
  ): Promise<EjecucionData> {
    const ejecucion = await this.prisma.ejecucion.update({
      where: { id },
      data: {
        estado: EstadoEjecucion.COMPLETADA,
        fechaTermino: new Date(),
        avancePercentaje: 100,
        observaciones: data.observacionesFinales,
      },
    });

    // Actualizar estado de la orden
    const orden = await this.prisma.order.findUnique({
      where: { id: ejecucion.ordenId },
    });

    if (orden) {
      await this.prisma.order.update({
        where: { id: orden.id },
        data: {
          estado: 'completada',
          fechaFin: new Date(),
        },
      });
    }

    return this.mapToEjecucionData(ejecucion);
  }

  private mapToEjecucionData(ejecucion: any): EjecucionData {
    return {
      id: ejecucion.id,
      ordenId: ejecucion.ordenId,
      tecnicoId: ejecucion.iniciadoPorId || ejecucion.finalizadoPorId || '',
      estado: ejecucion.estado,
      avance: ejecucion.avancePercentaje || 0,
      horasReales: ejecucion.horasActuales || 0,
      fechaInicio: ejecucion.fechaInicio || ejecucion.createdAt,
      fechaFin: ejecucion.fechaTermino,
      observaciones: ejecucion.observaciones || ejecucion.observacionesInicio,
      createdAt: ejecucion.createdAt,
      updatedAt: ejecucion.updatedAt,
    };
  }
}

