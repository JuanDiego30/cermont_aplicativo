/**
 * @repository CostoRepository
 * Usa el modelo Cost de Prisma
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RegistrarCostoDto,
  CostoQueryDto,
  CostoData,
  CostoAnalysis,
  ICostoRepository,
} from '../../application/dto';

@Injectable()
export class CostoRepository implements ICostoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByOrden(ordenId: string): Promise<CostoData[]> {
    const costos = await this.prisma.cost.findMany({
      where: { orderId: ordenId },
      orderBy: { createdAt: 'desc' },
    });

    return costos.map(this.mapToCostoData);
  }

  async findAll(filters: CostoQueryDto): Promise<CostoData[]> {
    const where: any = {};
    if (filters.ordenId) where.orderId = filters.ordenId;
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.fechaDesde) where.createdAt = { gte: new Date(filters.fechaDesde) };
    if (filters.fechaHasta) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.fechaHasta) };
    }

    const costos = await this.prisma.cost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return costos.map(this.mapToCostoData);
  }

  async create(data: RegistrarCostoDto): Promise<CostoData> {
    const total = data.cantidad * data.precioUnitario;
    
    const costo = await this.prisma.cost.create({
      data: {
        orderId: data.ordenId,
        tipo: data.tipo,
        concepto: data.descripcion,
        monto: total,
        descripcion: data.proveedor ? `Proveedor: ${data.proveedor}` : undefined,
      },
    });

    return {
      id: costo.id,
      ordenId: costo.orderId,
      tipo: costo.tipo,
      descripcion: costo.concepto,
      cantidad: data.cantidad,
      precioUnitario: data.precioUnitario,
      total: costo.monto,
      proveedor: data.proveedor,
      createdAt: costo.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cost.delete({ where: { id } });
  }

  async getAnalisis(ordenId: string): Promise<CostoAnalysis> {
    const [costos, orden] = await Promise.all([
      this.prisma.cost.findMany({ where: { orderId: ordenId } }),
      this.prisma.order.findUnique({
        where: { id: ordenId },
        select: { presupuestoEstimado: true },
      }),
    ]);

    const costoReal = costos.reduce((sum, c) => sum + c.monto, 0);
    const costoPresupuestado = orden?.presupuestoEstimado || 0;
    const varianza = costoPresupuestado - costoReal;
    const varianzaPorcentual = costoPresupuestado > 0
      ? (varianza / costoPresupuestado) * 100
      : 0;

    const desglosePorTipo = costos.reduce((acc, c) => {
      acc[c.tipo] = (acc[c.tipo] || 0) + c.monto;
      return acc;
    }, {} as Record<string, number>);

    return {
      ordenId,
      costoPresupuestado,
      costoReal,
      varianza,
      varianzaPorcentual,
      desglosePorTipo,
    };
  }

  private mapToCostoData(costo: any): CostoData {
    return {
      id: costo.id,
      ordenId: costo.orderId,
      tipo: costo.tipo,
      descripcion: costo.concepto,
      cantidad: 1,
      precioUnitario: costo.monto,
      total: costo.monto,
      proveedor: costo.descripcion?.replace('Proveedor: ', ''),
      createdAt: costo.createdAt,
    };
  }
}
