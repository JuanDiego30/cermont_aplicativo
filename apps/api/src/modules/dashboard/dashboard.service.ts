/**
 * @service DashboardService
 * @description Servicio para métricas y estadísticas del dashboard
 *
 * Principios aplicados:
 * - SRP: Solo maneja lógica de dashboard
 * - Clean Code: Código legible con nombres descriptivos
 * - Type Safety: Interfaces para todos los retornos
 */
import { Injectable, Logger } from "@nestjs/common";
import { CacheTTL } from "@nestjs/cache-manager";
import { PrismaService } from "../../prisma/prisma.service";

// ============================================================================
// Interfaces
// ============================================================================

export interface DashboardStats {
  totalOrdenes: number;
  totalUsuarios: number;
  ordenesRecientes: number;
  porEstado: Record<string, number>;
}

export interface DashboardMetricas {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  techniciansActive: number;
}

export interface OrdenResumen {
  id: string;
  numero: string;
  cliente: string;
  estado: string;
  prioridad: string;
  createdAt: Date;
}

export interface PaginatedOrdenes {
  data: OrdenResumen[];
}

// ============================================================================
// Constantes
// ============================================================================

const DIAS_RECIENTES = 7;
const ORDENES_RECIENTES_LIMIT = 10;
const ESTADOS_PENDIENTES = ["planeacion", "ejecucion", "pausada"] as const;
const ESTADO_COMPLETADA = "completada";

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene estadísticas generales del dashboard
   */
  @CacheTTL(300) // 5 minutos
  async getStats(): Promise<DashboardStats> {
    const fechaReciente = this.calcularFechaReciente(DIAS_RECIENTES);

    const [totalOrdenes, ordenesPorEstado, totalUsuarios, ordenesRecientes] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.groupBy({
          by: ["estado"],
          _count: { id: true },
        }),
        this.prisma.user.count({ where: { active: true } }),
        this.prisma.order.count({
          where: { createdAt: { gte: fechaReciente } },
        }),
      ]);

    return {
      totalOrdenes,
      totalUsuarios,
      ordenesRecientes,
      porEstado: this.transformarEstadosAObjeto(ordenesPorEstado),
    };
  }

  /**
   * Obtiene las órdenes más recientes
   */
  async getOrdenesRecientes(): Promise<PaginatedOrdenes> {
    const ordenes = await this.prisma.order.findMany({
      take: ORDENES_RECIENTES_LIMIT,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        numero: true,
        cliente: true,
        estado: true,
        prioridad: true,
        createdAt: true,
      },
    });

    return { data: ordenes };
  }

  /**
   * Obtiene métricas para widgets del dashboard
   */
  @CacheTTL(600) // 10 minutos
  async getMetricas(): Promise<DashboardMetricas> {
    try {
      const [totalOrders, completedOrders, pendingOrders, techniciansActive] =
        await Promise.all([
          this.prisma.order.count(),
          this.prisma.order.count({
            where: { estado: ESTADO_COMPLETADA },
          }),
          this.prisma.order.count({
            where: { estado: { in: [...ESTADOS_PENDIENTES] } },
          }),
          this.prisma.user.count({
            where: { role: "tecnico", active: true },
          }),
        ]);

      return {
        totalOrders,
        completedOrders,
        pendingOrders,
        techniciansActive,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error("Error en getMetricas", err.stack);
      throw error;
    }
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Calcula fecha límite para consultas recientes
   */
  private calcularFechaReciente(dias: number): Date {
    return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  }

  /**
   * Transforma agrupación de Prisma a objeto Record
   */
  private transformarEstadosAObjeto(
    agrupacion: Array<{ estado: string; _count: { id: number } }>,
  ): Record<string, number> {
    return agrupacion.reduce(
      (acc, item) => {
        acc[item.estado] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
