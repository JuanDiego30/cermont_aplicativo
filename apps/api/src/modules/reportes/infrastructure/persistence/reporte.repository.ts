/**
 * @repository ReporteRepository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IReporteRepository, ReporteQueryDto } from '../../application/dto';

@Injectable()
export class ReporteRepository implements IReporteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrdenesReporte(filters: ReporteQueryDto): Promise<any[]> {
    const where: any = {
      createdAt: {
        gte: new Date(filters.fechaInicio),
        lte: new Date(filters.fechaFin),
      },
    };

    if (filters.estado) {
      where.estado = filters.estado;
    }
    if (filters.tecnicoId) {
      where.tecnicoAsignadoId = filters.tecnicoId;
    }

    return this.prisma.orden.findMany({
      where,
      include: {
        tecnicoAsignado: { select: { id: true, nombre: true } },
        ejecucion: { select: { horasReales: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrdenDetalle(ordenId: string): Promise<any> {
    return this.prisma.orden.findUnique({
      where: { id: ordenId },
      include: {
        tecnicoAsignado: { select: { id: true, nombre: true, email: true } },
        ejecucion: true,
        evidencias: { select: { id: true } },
        checklists: { select: { id: true } },
      },
    });
  }
}
