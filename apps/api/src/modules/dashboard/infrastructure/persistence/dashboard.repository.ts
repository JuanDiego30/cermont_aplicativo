/**
 * @repository DashboardRepository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IDashboardRepository,
  DashboardStats,
  DashboardQueryDto,
  DashboardTrendData,
} from '../../application/dto';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(filters?: DashboardQueryDto): Promise<DashboardStats> {
    const where: any = {};
    if (filters?.fechaInicio) {
      where.createdAt = { gte: new Date(filters.fechaInicio) };
    }
    if (filters?.fechaFin) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.fechaFin) };
    }
    if (filters?.tecnicoId) {
      where.tecnicoAsignadoId = filters.tecnicoId;
    }

    const [total, byEstado, byPrioridad, completadasHoy, enProgreso, tecnicos] = await Promise.all([
      this.prisma.orden.count({ where }),
      this.prisma.orden.groupBy({
        by: ['estado'],
        where,
        _count: true,
      }),
      this.prisma.orden.groupBy({
        by: ['prioridad'],
        where,
        _count: true,
      }),
      this.prisma.orden.count({
        where: {
          ...where,
          estado: 'completada',
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.orden.count({
        where: { ...where, estado: 'ejecucion' },
      }),
      this.prisma.user.count({
        where: { rol: 'tecnico', isActive: true },
      }),
    ]);

    const ordenesPorEstado: Record<string, number> = {};
    byEstado.forEach((e) => {
      ordenesPorEstado[e.estado] = e._count;
    });

    const ordenesPorPrioridad: Record<string, number> = {};
    byPrioridad.forEach((p) => {
      ordenesPorPrioridad[p.prioridad] = p._count;
    });

    const completadas = ordenesPorEstado['completada'] || 0;
    const promedioCompletado = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return {
      totalOrdenes: total,
      ordenesPorEstado,
      ordenesPorPrioridad,
      promedioCompletado,
      ordenesCompletadasHoy: completadasHoy,
      ordenesEnProgreso: enProgreso,
      tecnicosActivos: tecnicos,
    };
  }

  async getTendencia(dias: number): Promise<DashboardTrendData[]> {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const ordenes = await this.prisma.orden.findMany({
      where: { createdAt: { gte: fechaInicio } },
      select: { createdAt: true, estado: true, updatedAt: true },
    });

    const tendencia: Map<string, { completadas: number; creadas: number }> = new Map();

    for (let i = 0; i < dias; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const key = fecha.toISOString().split('T')[0];
      tendencia.set(key, { completadas: 0, creadas: 0 });
    }

    ordenes.forEach((o) => {
      const creadaKey = o.createdAt.toISOString().split('T')[0];
      if (tendencia.has(creadaKey)) {
        const data = tendencia.get(creadaKey)!;
        data.creadas++;
      }

      if (o.estado === 'completada') {
        const completadaKey = o.updatedAt.toISOString().split('T')[0];
        if (tendencia.has(completadaKey)) {
          const data = tendencia.get(completadaKey)!;
          data.completadas++;
        }
      }
    });

    return Array.from(tendencia.entries())
      .map(([fecha, data]) => ({ fecha, ...data }))
      .reverse();
  }

  async getUltimasOrdenes(limit: number): Promise<any[]> {
    return this.prisma.orden.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        numero: true,
        estado: true,
        prioridad: true,
        createdAt: true,
      },
    });
  }
}
