import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardApi } from '../../../core/api/dashboard.api';
import {
    DashboardStats,
    DashboardMetricas,
    OrdenReciente,
    KPIConsolidado,
    CostoBreakdown,
    PerformanceTrend
} from '../../../core/models/dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly dashboardApi = inject(DashboardApi);

    /**
     * Estadísticas básicas del dashboard
     */
    getStats(): Observable<DashboardStats> {
        return this.dashboardApi.getStats().pipe(
            map((raw: any) => {
                const porEstado = raw?.porEstado || {};
                const planeacion = Number(porEstado['planeacion'] || 0);
                const ejecucion = Number(porEstado['ejecucion'] || 0);
                const pausada = Number(porEstado['pausada'] || 0);
                const completada = Number(porEstado['completada'] || 0);

                const mapped: DashboardStats = {
                    totalOrdenes: Number(raw?.totalOrdenes || 0),
                    ordenesPendientes: planeacion + pausada,
                    ordenesEnProceso: ejecucion,
                    ordenesCompletadas: completada,
                    totalTecnicos: Number(raw?.totalTecnicos || 0),
                    totalClientes: Number(raw?.totalClientes || 0),
                };
                return mapped;
            })
        );
    }

    /**
     * Métricas generales
     */
    getMetricas(): Observable<DashboardMetricas> {
        return this.dashboardApi.getMetricas().pipe(
            map((raw: any) => {
                const total = Number(raw?.totalOrders || 0);
                const completadas = Number(raw?.completedOrders || 0);
                const pendientes = Number(raw?.pendingOrders || 0);
                const eficiencia = total > 0 ? Math.round((completadas / total) * 100) : 0;

                const mapped: DashboardMetricas = {
                    tiempoPromedioEjecucion: Number(raw?.tiempoPromedioEjecucion || 0),
                    eficiencia,
                    costoTotal: Number(raw?.costoTotal || 0),
                    costoPromedio: Number(raw?.costoPromedio || 0),
                    ordenesCompletadasMes: Number(raw?.ordenesCompletadasMes || completadas),
                    ordenesPendientesMes: Number(raw?.ordenesPendientesMes || pendientes),
                };
                return mapped;
            })
        );
    }

    /**
     * Órdenes recientes (últimas 10)
     */
    getOrdenesRecientes(): Observable<{ data: OrdenReciente[] }> {
        return this.dashboardApi.getOrdenesRecientes();
    }

    /**
     * KPIs consolidados (solo supervisor/admin)
     */
    getKPIs(): Observable<KPIConsolidado> {
        return this.dashboardApi.getKPIs();
    }

    /**
     * Desglose de costos
     */
    getCostosBreakdown(): Observable<{ data: CostoBreakdown[] }> {
        return this.dashboardApi.getCostosBreakdown();
    }

    /**
     * Tendencias de performance
     */
    getPerformanceTrends(params: {
        desde: string;
        hasta: string;
        granularidad?: 'DIA' | 'SEMANA' | 'MES';
    }): Observable<PerformanceTrend[]> {
        return this.dashboardApi.getPerformanceTrends(params);
    }

    /**
     * Refrescar KPIs (solo admin)
     */
    refreshKPIs(): Observable<{ message: string }> {
        return this.dashboardApi.refreshKPIs();
    }
}
