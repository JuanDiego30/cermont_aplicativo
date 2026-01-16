/**
 * Repository: HESRepository
 *
 * Implementación Prisma de IHESRepository
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IHESRepository } from '../../domain/repositories/hes.repository.interface';
import { HES } from '../../domain/entities/hes.entity';
import { HESId } from '../../domain/value-objects/hes-id.vo';
import { HESNumero } from '../../domain/value-objects/hes-numero.vo';
import { HESPrismaMapper } from './hes.prisma.mapper';

@Injectable()
export class HESRepository implements IHESRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(hes: HES): Promise<HES> {
    const prismaData = HESPrismaMapper.toPrisma(hes);

    // Usar modelo HojaEntradaServicio de Prisma
    const saved = await (this.prisma as any).hojaEntradaServicio.upsert({
      where: { id: prismaData.id },
      create: {
        id: prismaData.id,
        numero: prismaData.numero,
        ordenId: prismaData.ordenId,
        estado: prismaData.estado,
        tipoServicio: prismaData.tipoServicio,
        prioridad: prismaData.prioridad,
        nivelRiesgo: prismaData.nivelRiesgo,
        clienteInfo: prismaData.clienteInfo as any,
        condicionesEntrada: prismaData.condicionesEntrada as any,
        diagnosticoPreliminar: prismaData.diagnosticoPreliminar as any,
        requerimientosSeguridad: prismaData.requerimientosSeguridad as any,
        firmaCliente: prismaData.firmaCliente as any,
        firmaTecnico: prismaData.firmaTecnico as any,
        firmadoClienteAt: prismaData.firmadoClienteAt,
        firmadoTecnicoAt: prismaData.firmadoTecnicoAt,
        creadoPor: prismaData.creadoPor,
        completadoEn: prismaData.completadoEn,
        anuladoEn: prismaData.anuladoEn,
        anuladoPor: prismaData.anuladoPor,
        motivoAnulacion: prismaData.motivoAnulacion,
        version: prismaData.version,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        estado: prismaData.estado,
        condicionesEntrada: prismaData.condicionesEntrada as any,
        diagnosticoPreliminar: prismaData.diagnosticoPreliminar as any,
        requerimientosSeguridad: prismaData.requerimientosSeguridad as any,
        firmaCliente: prismaData.firmaCliente as any,
        firmaTecnico: prismaData.firmaTecnico as any,
        firmadoClienteAt: prismaData.firmadoClienteAt,
        firmadoTecnicoAt: prismaData.firmadoTecnicoAt,
        completadoEn: prismaData.completadoEn,
        anuladoEn: prismaData.anuladoEn,
        anuladoPor: prismaData.anuladoPor,
        motivoAnulacion: prismaData.motivoAnulacion,
        version: prismaData.version,
        updatedAt: new Date(),
      },
    });

    return HESPrismaMapper.fromPrisma(saved);
  }

  async findById(id: HESId): Promise<HES | null> {
    const data = await (this.prisma as any).hojaEntradaServicio.findUnique({
      where: { id: id.getValue() },
    });

    if (!data) {
      return null;
    }

    return HESPrismaMapper.fromPrisma(data);
  }

  async findByNumero(numero: HESNumero): Promise<HES | null> {
    const data = await (this.prisma as any).hojaEntradaServicio.findUnique({
      where: { numero: numero.getValue() },
    });

    if (!data) {
      return null;
    }

    return HESPrismaMapper.fromPrisma(data);
  }

  async findByOrden(ordenId: string): Promise<HES | null> {
    const data = await (this.prisma as any).hojaEntradaServicio.findUnique({
      where: { ordenId },
    });

    if (!data) {
      return null;
    }

    return HESPrismaMapper.fromPrisma(data);
  }

  async findLastNumberByYear(year: number): Promise<HESNumero | null> {
    const data = await (this.prisma as any).hojaEntradaServicio.findFirst({
      where: {
        numero: {
          startsWith: `HES-${year}-`,
        },
      },
      orderBy: {
        numero: 'desc',
      },
    });

    if (!data) {
      return null;
    }

    return HESNumero.create(data.numero);
  }

  async existsByNumero(numero: string): Promise<boolean> {
    const count = await (this.prisma as any).hojaEntradaServicio.count({
      where: { numero },
    });

    return count > 0;
  }

  async findAll(filters?: {
    estado?: string;
    tipoServicio?: string;
    ordenId?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<HES[]> {
    const where: any = {};

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.tipoServicio) {
      where.tipoServicio = filters.tipoServicio;
    }

    if (filters?.ordenId) {
      where.ordenId = filters.ordenId;
    }

    if (filters?.fechaDesde || filters?.fechaHasta) {
      where.createdAt = {};
      if (filters.fechaDesde) {
        where.createdAt.gte = filters.fechaDesde;
      }
      if (filters.fechaHasta) {
        where.createdAt.lte = filters.fechaHasta;
      }
    }

    const data = await (this.prisma as any).hojaEntradaServicio.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return data.map((d: any) => HESPrismaMapper.fromPrisma(d));
  }

  async delete(id: HESId): Promise<void> {
    // Soft delete
    await (this.prisma as any).hojaEntradaServicio.update({
      where: { id: id.getValue() },
      data: {
        estado: 'ANULADO',
        anuladoEn: new Date(),
      },
    });
  }
}
