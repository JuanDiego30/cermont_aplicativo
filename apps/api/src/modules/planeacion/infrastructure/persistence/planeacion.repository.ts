/**
 * @repository PlaneacionRepository
 * Usa el modelo Planeacion de Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreatePlaneacionDto } from '../../application/dto';

export const PLANEACION_REPOSITORY = Symbol('PLANEACION_REPOSITORY');

export interface PlaneacionData {
  ordenId: string;
  cronograma: Record<string, unknown>;
  manoDeObra: Record<string, unknown>;
  observaciones?: string;
  kitId?: string;
}

export interface IPlaneacionRepository {
  findByOrdenId(ordenId: string): Promise<any>;
  create(ordenId: string, data: CreatePlaneacionDto): Promise<any>;
  update(id: string, data: Partial<PlaneacionData>): Promise<any>;
  aprobar(id: string, aprobadorId: string): Promise<any>;
  rechazar(id: string, motivo: string): Promise<any>;
}

@Injectable()
export class PlaneacionRepository implements IPlaneacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrdenId(ordenId: string): Promise<any> {
    return this.prisma.planeacion.findUnique({
      where: { ordenId },
      include: {
        kit: true,
        items: true,
      },
    });
  }

  async create(ordenId: string, data: CreatePlaneacionDto): Promise<any> {
    return this.prisma.planeacion.create({
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
  }

  async update(id: string, data: Partial<PlaneacionData>): Promise<any> {
    return this.prisma.planeacion.update({
      where: { id },
      data: {
        cronograma: data.cronograma as object | undefined,
        manoDeObra: data.manoDeObra as object | undefined,
        observaciones: data.observaciones,
        kitId: data.kitId,
      },
    });
  }

  async aprobar(id: string, aprobadorId: string): Promise<any> {
    return this.prisma.planeacion.update({
      where: { id },
      data: {
        estado: 'aprobada',
        aprobadoPorId: aprobadorId,
        fechaAprobacion: new Date(),
      },
    });
  }

  async rechazar(id: string, motivo: string): Promise<any> {
    return this.prisma.planeacion.update({
      where: { id },
      data: {
        estado: 'borrador',
        observaciones: motivo,
      },
    });
  }
}
