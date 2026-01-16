/**
 * @repository PlaneacionRepository
 * Usa el modelo Planeacion de Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreatePlaneacionDto } from '../../application/dto';
import {
  IPlaneacionRepository,
  PlaneacionData,
} from '../../domain/repositories/planeacion.repository.interface';

@Injectable()
export class PlaneacionRepository implements IPlaneacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrdenId(ordenId: string): Promise<PlaneacionData | null> {
    const planeacion = await this.prisma.planeacion.findUnique({
      where: { ordenId },
      include: {
        kit: true,
        items: true,
      },
    });
    if (!planeacion) return null;
    return this.mapToPlaneacionData(planeacion);
  }

  async createOrUpdate(ordenId: string, data: Partial<PlaneacionData>): Promise<PlaneacionData> {
    const existing = await this.prisma.planeacion.findUnique({
      where: { ordenId },
    });

    if (existing) {
      return this.update(existing.id, data);
    }

    return this.create(ordenId, data as CreatePlaneacionDto);
  }

  async create(ordenId: string, data: CreatePlaneacionDto): Promise<PlaneacionData> {
    const planeacion = await this.prisma.planeacion.create({
      data: {
        ordenId,
        cronograma: (data.cronograma || {}) as object,
        manoDeObra: (data.manoDeObra || {}) as object,
        documentosApoyo: [],
        observaciones: data.observaciones,
        kitId: data.kitId,
        estado: 'borrador',
      },
    });
    return this.mapToPlaneacionData(planeacion);
  }

  async update(id: string, data: Partial<PlaneacionData>): Promise<PlaneacionData> {
    const planeacion = await this.prisma.planeacion.update({
      where: { id },
      data: {
        cronograma: data.cronograma as object | undefined,
        manoDeObra: data.manoDeObra as object | undefined,
        observaciones: data.observaciones,
        kitId: data.kitId,
      },
    });
    return this.mapToPlaneacionData(planeacion);
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
    return this.mapToPlaneacionData(planeacion);
  }

  async rechazar(id: string, motivo: string): Promise<PlaneacionData> {
    const planeacion = await this.prisma.planeacion.update({
      where: { id },
      data: {
        estado: 'borrador',
        observaciones: motivo,
      },
    });
    return this.mapToPlaneacionData(planeacion);
  }

  private mapToPlaneacionData(planeacion: any): PlaneacionData {
    return {
      id: planeacion.id,
      ordenId: planeacion.ordenId,
      estado: planeacion.estado,
      cronograma: planeacion.cronograma as Record<string, unknown>,
      manoDeObra: planeacion.manoDeObra as Record<string, unknown>,
      observaciones: planeacion.observaciones,
      aprobadoPorId: planeacion.aprobadoPorId,
      fechaAprobacion: planeacion.fechaAprobacion,
      kitId: planeacion.kitId,
      createdAt: planeacion.createdAt,
      updatedAt: planeacion.updatedAt,
    };
  }
}
