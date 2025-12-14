/**
 * @repository HESRepository
 * Usa el modelo HES de Prisma (hes_registros)
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IHESRepository, CreateHESDto, HESQueryDto } from '../../application/dto';

@Injectable()
export class HESRepository implements IHESRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: HESQueryDto): Promise<any[]> {
    const where: any = {};
    if (filters.equipoId) where.equipoId = filters.equipoId;
    if (filters.ordenId) where.ordenId = filters.ordenId;
    if (filters.aprobado !== undefined) {
      where.aprobado = filters.aprobado;
    }
    if (filters.fechaDesde) where.createdAt = { gte: new Date(filters.fechaDesde) };
    if (filters.fechaHasta) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.fechaHasta) };
    }

    return this.prisma.hES.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.hES.findUnique({ where: { id } });
  }

  async findByEquipo(equipoId: string): Promise<any[]> {
    return this.prisma.hES.findMany({
      where: { equipoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateHESDto, inspectorId: string): Promise<any> {
    return this.prisma.hES.create({
      data: {
        equipoId: data.equipoId,
        ordenId: data.ordenId,
        tipo: data.tipo,
        resultados: data.resultados as any,
        inspectorId,
        aprobado: data.aprobado,
        observaciones: data.observaciones,
      },
    });
  }
}
