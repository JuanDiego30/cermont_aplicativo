/**
 * @repository DashboardRepository
 * Implementación del repositorio de dashboard usando Prisma
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  IDashboardRepository,
  DashboardQueryDto,
  DashboardStatsDto,
  TendenciaDto,
  OrdenResumenDto,
} from "../../application/dto";

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(filters?: DashboardQueryDto): Promise<DashboardStatsDto> {
    const where: any = {};

    if (filters?.fechaInicio || filters?.fechaFin) {
      where.createdAt = {};
      if (filters.fechaInicio) {
        where.createdAt.gte = new Date(filters.fechaInicio);
      }
      if (filters.fechaFin) {
        where.createdAt.lte = new Date(filters.fechaFin);
      }
    }

    if (filters?.cliente) {
      where.cliente = { contains: filters.cliente, mode: "insensitive" };
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.tecnicoId) {
      where.asignadoId = filters.tecnicoId;
    }

    // Contar órdenes por estado
    const [total, planeacion, ejecucion, completadas, canceladas] =
      await Promise.all([
        this.prisma.order.count({ where }),
        this.prisma.order.count({ where: { ...where, estado: "planeacion" } }),
        this.prisma.order.count({ where: { ...where, estado: "ejecucion" } }),
        this.prisma.order.count({ where: { ...where, estado: "completada" } }),
        this.prisma.order.count({ where: { ...where, estado: "cancelada" } }),
      ]);

    // Estadísticas financieras (simplificado)
    const ordenesFinancieras = await this.prisma.order.findMany({
      where: { ...where, estado: { in: ["ejecucion", "completada"] } },
    });

    const ingresosEstimados = ordenesFinancieras.reduce(
      (sum, o) => sum + (Number((o as any).presupuestoEstimado) || 0),
      0,
    );
    const ingresosReales = ingresosEstimados; // Simplificado: usar presupuesto como ingresos
    const costosEstimados = ordenesFinancieras.reduce((sum, o) => {
      const presupuesto = Number((o as any).presupuestoEstimado) || 0;
      const margen = Number((o as any).margenUtilidad) || 0;
      return sum + presupuesto * (1 - margen / 100);
    }, 0);
    const costosReales = ordenesFinancieras.reduce(
      (sum, o) => sum + (Number((o as any).costoReal) || 0),
      0,
    );

    // Estadísticas HES (simplificado)
    const ordenesConHES = await this.prisma.order.count({
      where: { ...where, requiereHES: true },
    });

    // Estadísticas de cierre (simplificado)
    const ordenesCompletadas = await this.prisma.order.findMany({
      where: { ...where, estado: "completada", fechaFin: { not: null } },
      select: { createdAt: true, fechaFin: true },
    });

    const tiemposCierre = ordenesCompletadas
      .filter((o) => o.fechaFin)
      .map((o) => {
        const inicio = new Date(o.createdAt);
        const fin = new Date(o.fechaFin!);
        return Math.ceil(
          (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
        );
      });

    const promedioTiempoCierre =
      tiemposCierre.length > 0
        ? tiemposCierre.reduce((sum, t) => sum + t, 0) / tiemposCierre.length
        : 0;

    return {
      ordenes: {
        total,
        planeacion,
        ejecucion,
        completadas,
        canceladas,
      },
      financiero: {
        ingresosEstimados,
        ingresosReales,
        costosEstimados,
        costosReales,
        margenEstimado:
          ingresosEstimados > 0
            ? ((ingresosEstimados - costosEstimados) / ingresosEstimados) * 100
            : 0,
        margenReal:
          ingresosReales > 0
            ? ((ingresosReales - costosReales) / ingresosReales) * 100
            : 0,
      },
      hes: {
        ordenesConHES,
        cumplimiento: total > 0 ? (ordenesConHES / total) * 100 : 0,
        equiposAsignados: 0, // TODO: Implementar
        inspeccionesPendientes: 0, // TODO: Implementar
      },
      cierre: {
        actasPendientes: 0, // TODO: Implementar
        sesPendientes: 0, // TODO: Implementar
        facturasPendientes: 0, // TODO: Implementar
        promedioTiempoCierre: Math.round(promedioTiempoCierre * 100) / 100,
      },
    };
  }

  async getTendencia(dias: number): Promise<TendenciaDto[]> {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const ordenes = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: fechaInicio },
        estado: { in: ["ejecucion", "completada"] },
      },
      orderBy: { createdAt: "asc" },
    });

    // Agrupar por día
    const porDia = new Map<
      string,
      { ordenes: number; ingresos: number; gastos: number }
    >();

    ordenes.forEach((orden) => {
      const fecha = orden.createdAt.toISOString().split("T")[0];
      const existente = porDia.get(fecha) || {
        ordenes: 0,
        ingresos: 0,
        gastos: 0,
      };
      const ordenAny = orden as any;
      porDia.set(fecha, {
        ordenes: existente.ordenes + 1,
        ingresos:
          existente.ingresos + (Number(ordenAny.presupuestoEstimado) || 0),
        gastos: existente.gastos + (Number(ordenAny.costoReal) || 0),
      });
    });

    return Array.from(porDia.entries()).map(([fecha, datos]) => ({
      fecha,
      ordenes: datos.ordenes,
      ingresos: datos.ingresos,
      gastos: datos.gastos,
    }));
  }

  async getUltimasOrdenes(limit: number): Promise<OrdenResumenDto[]> {
    const ordenes = await this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        asignado: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return ordenes.map((orden) => ({
      id: orden.id,
      numero: orden.numero,
      cliente: orden.cliente,
      descripcion: orden.descripcion,
      estado: orden.estado,
      subEstado: orden.subEstado,
      prioridad: orden.prioridad,
      asignado: orden.asignado
        ? {
            id: orden.asignado.id,
            name: orden.asignado.name,
            email: orden.asignado.email,
          }
        : undefined,
      createdAt: orden.createdAt,
      fechaInicio: orden.fechaInicio || undefined,
      cumplimientoHES: orden.cumplimientoHES || false,
    }));
  }

  async getAlertasActivas(): Promise<any[]> {
    // TODO: Implementar cuando exista módulo de alertas
    return [];
  }

  async getResumenCierre(): Promise<any> {
    // TODO: Implementar cuando exista módulo de cierre
    return {};
  }
}
