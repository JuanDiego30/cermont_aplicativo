import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHESDto, UpdateHESDto } from './hes.dto';

/**
 * Simple HESService - Direct Prisma access
 * HES = Hoja de Entrada de Servicio
 */
@Injectable()
export class HESService {
  private readonly logger = new Logger(HESService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { estado?: string; ordenId?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.ordenId) where.ordenId = filters.ordenId;

    return this.prisma.hojaEntradaServicio.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const hes = await this.prisma.hojaEntradaServicio.findUnique({
      where: { id },
      include: { orden: true },
    });

    if (!hes) {
      throw new NotFoundException(`HES ${id} no encontrada`);
    }

    return hes;
  }

  async create(dto: CreateHESDto, userId: string) {
    const numero = await this.generateHESNumber();

    return this.prisma.hojaEntradaServicio.create({
      data: {
        numero,
        ordenId: dto.ordenId,
        tipoServicio: dto.tipoServicio,
        prioridad: dto.prioridad,
        nivelRiesgo: dto.nivelRiesgo ?? 'BAJO',
        clienteInfo: dto.clienteInfo,
        condicionesEntrada: dto.condicionesEntrada,
        diagnosticoPreliminar: dto.diagnosticoPreliminar,
        requerimientosSeguridad: dto.requerimientosSeguridad,
        estado: 'BORRADOR',
        creadoPor: userId,
      },
    });
  }

  async update(id: string, dto: UpdateHESDto) {
    await this.findOne(id);

    return this.prisma.hojaEntradaServicio.update({
      where: { id },
      data: {
        tipoServicio: dto.tipoServicio,
        prioridad: dto.prioridad,
        nivelRiesgo: dto.nivelRiesgo,
        clienteInfo: dto.clienteInfo,
        condicionesEntrada: dto.condicionesEntrada,
        diagnosticoPreliminar: dto.diagnosticoPreliminar,
        requerimientosSeguridad: dto.requerimientosSeguridad,
      },
    });
  }

  async complete(id: string) {
    await this.findOne(id);

    return this.prisma.hojaEntradaServicio.update({
      where: { id },
      data: {
        estado: 'COMPLETADO',
        completadoEn: new Date(),
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.hojaEntradaServicio.delete({ where: { id } });
  }

  private async generateHESNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.hojaEntradaServicio.count({
      where: { createdAt: { gte: new Date(`${year}-01-01`) } },
    });
    return `HES-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
