/**
 * @repository ReporteRepository
 * Prisma implementation for Reportes
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IReporteRepository, ReporteQueryDto } from '../../application/dto';

@Injectable()
export class ReporteRepository implements IReporteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrdenesReporte(filters: ReporteQueryDto): Promise<any[]> {
    const where: any = {};

    if (filters.fechaInicio) {
      where.createdAt = { gte: new Date(filters.fechaInicio) };
    }
    if (filters.fechaFin) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.fechaFin) };
    }
    if (filters.estado) {
      where.estado = filters.estado;
    }
    if (filters.tecnicoId) {
      where.asignadoId = filters.tecnicoId;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        asignado: { select: { name: true } },
        ejecucion: { select: { horasActuales: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrdenDetalle(ordenId: string): Promise<any> {
    return this.prisma.order.findUnique({
      where: { id: ordenId },
      include: {
        asignado: true,
        planeacion: true,
        ejecucion: true,
        costos: true,
        evidencias: true,
      },
    });
  }
}
