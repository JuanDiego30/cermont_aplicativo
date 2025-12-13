/**
 * @repository EjecucionRepository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IEjecucionRepository, EjecucionData } from '../../domain/repositories';

@Injectable()
export class EjecucionRepository implements IEjecucionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrdenId(ordenId: string): Promise<EjecucionData | null> {
    const ejecucion = await this.prisma.ejecucion.findUnique({
      where: { ordenId },
    });
    return ejecucion ? this.toDomain(ejecucion) : null;
  }

  async iniciar(ordenId: string, tecnicoId: string, observaciones?: string): Promise<EjecucionData> {
    const ejecucion = await this.prisma.ejecucion.create({
      data: {
        ordenId,
        tecnicoId,
        estado: 'en_progreso',
        avance: 0,
        horasReales: 0,
        fechaInicio: new Date(),
        observaciones,
      },
    });
    return this.toDomain(ejecucion);
  }

  async updateAvance(id: string, avance: number, observaciones?: string): Promise<EjecucionData> {
    const ejecucion = await this.prisma.ejecucion.update({
      where: { id },
      data: {
        avance,
        observaciones,
      },
    });
    return this.toDomain(ejecucion);
  }

  async completar(
    id: string,
    data: { observacionesFinales?: string; firmaDigital?: string },
  ): Promise<EjecucionData> {
    const current = await this.prisma.ejecucion.findUnique({ where: { id } });
    const horasReales = current
      ? Math.round((new Date().getTime() - current.fechaInicio.getTime()) / 3600000)
      : 0;

    const ejecucion = await this.prisma.ejecucion.update({
      where: { id },
      data: {
        estado: 'completada',
        avance: 100,
        fechaFin: new Date(),
        horasReales,
        observaciones: data.observacionesFinales,
      },
    });
    return this.toDomain(ejecucion);
  }

  private toDomain(raw: any): EjecucionData {
    return {
      id: raw.id,
      ordenId: raw.ordenId,
      tecnicoId: raw.tecnicoId,
      estado: raw.estado,
      avance: raw.avance,
      horasReales: raw.horasReales,
      fechaInicio: raw.fechaInicio,
      fechaFin: raw.fechaFin,
      observaciones: raw.observaciones,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
