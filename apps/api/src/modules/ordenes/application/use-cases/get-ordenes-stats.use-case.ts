/**
 * @useCase GetOrdenesStatsUseCase
 * @description Obtiene estadísticas de órdenes por estado y prioridad
 */
import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";

export interface OrdenesStats {
  total: number;
  porEstado: Record<string, number>;
  porPrioridad: Record<string, number>;
}

@Injectable()
export class GetOrdenesStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<OrdenesStats> {
    // Contar total de órdenes activas
    const total = await this.prisma.order.count({
      where: { deletedAt: null },
    });

    // Contar por estado
    const estadoCounts = await this.prisma.order.groupBy({
      by: ["estado"],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const porEstado: Record<string, number> = {};
    for (const item of estadoCounts) {
      porEstado[item.estado] = item._count.id;
    }

    // Contar por prioridad
    const prioridadCounts = await this.prisma.order.groupBy({
      by: ["prioridad"],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const porPrioridad: Record<string, number> = {};
    for (const item of prioridadCounts) {
      porPrioridad[item.prioridad] = item._count.id;
    }

    return {
      total,
      porEstado,
      porPrioridad,
    };
  }
}
