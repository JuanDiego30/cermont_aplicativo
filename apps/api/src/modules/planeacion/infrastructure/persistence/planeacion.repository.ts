/**
 * @repository PlaneacionRepository
 * @description Implementación Prisma del repositorio de planeación
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IPlaneacionRepository, PlaneacionData } from '../../domain/repositories';

@Injectable()
export class PlaneacionRepository implements IPlaneacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrdenId(ordenId: string): Promise<PlaneacionData | null> {
    const planeacion = await this.prisma.planeacion.findUnique({
      where: { ordenId },
    });

    if (!planeacion) return null;

    return this.toDomain(planeacion);
  }

  async createOrUpdate(ordenId: string, data: Partial<PlaneacionData>): Promise<PlaneacionData> {
    const planeacion = await this.prisma.planeacion.upsert({
      where: { ordenId },
      create: {
        ordenId,
        cronograma: data.cronograma ?? {},
        manoDeObra: data.manoDeObra ?? {},
        observaciones: data.observaciones,
        kitId: data.kitId,
        estado: 'borrador',
      },
      update: {
        cronograma: data.cronograma,
        manoDeObra: data.manoDeObra,
        observaciones: data.observaciones,
        kitId: data.kitId,
      },
    });

    return this.toDomain(planeacion);
  }

  async aprobar(id: string, aprobadorId: string): Promise<PlaneacionData> {
    const planeacion = await this.prisma.planeacion.update({
      where: { id },
      data: {
        estado: 'aprobada',
        aprobadoPorId: aprobadorId,
        fechaAprobacion: new Date(),
      },
    });

    return this.toDomain(planeacion);
  }

  async rechazar(id: string, motivo: string): Promise<PlaneacionData> {
    const planeacion = await this.prisma.planeacion.update({
      where: { id },
      data: {
        estado: 'rechazada',
        observaciones: motivo,
      },
    });

    return this.toDomain(planeacion);
  }

  private toDomain(raw: any): PlaneacionData {
    return {
      id: raw.id,
      ordenId: raw.ordenId,
      estado: raw.estado,
      cronograma: raw.cronograma ?? {},
      manoDeObra: raw.manoDeObra ?? {},
      observaciones: raw.observaciones,
      aprobadoPorId: raw.aprobadoPorId,
      fechaAprobacion: raw.fechaAprobacion,
      kitId: raw.kitId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
