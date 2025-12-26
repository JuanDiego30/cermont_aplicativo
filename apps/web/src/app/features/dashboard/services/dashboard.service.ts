import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
        return this.dashboardApi.getStats();
    }

    /**
     * Métricas generales
     */
    getMetricas(): Observable<DashboardMetricas> {
        return this.dashboardApi.getMetricas();
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
