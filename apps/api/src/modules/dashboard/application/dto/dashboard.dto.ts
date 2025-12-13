/**
 * @module Dashboard - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const DashboardQuerySchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  tecnicoId: z.string().uuid().optional(),
});

export type DashboardQueryDto = z.infer<typeof DashboardQuerySchema>;

export interface DashboardStats {
  totalOrdenes: number;
  ordenesPorEstado: Record<string, number>;
  ordenesPorPrioridad: Record<string, number>;
  promedioCompletado: number;
  ordenesCompletadasHoy: number;
  ordenesEnProgreso: number;
  tecnicosActivos: number;
}

export interface DashboardTrendData {
  fecha: string;
  completadas: number;
  creadas: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  tendencia: DashboardTrendData[];
  ultimasOrdenes: Array<{
    id: string;
    numero: string;
    estado: string;
    prioridad: string;
    fechaCreacion: string;
  }>;
}

// Repository Interface
export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface IDashboardRepository {
  getStats(filters?: DashboardQueryDto): Promise<DashboardStats>;
  getTendencia(dias: number): Promise<DashboardTrendData[]>;
  getUltimasOrdenes(limit: number): Promise<any[]>;
}
