import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
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
    private readonly api = inject(ApiService);

    /**
     * Estadísticas básicas del dashboard
     */
    getStats(): Observable<DashboardStats> {
        return this.api.get<DashboardStats>('/dashboard/stats');
    }

    /**
     * Métricas generales
     */
    getMetricas(): Observable<DashboardMetricas> {
        return this.api.get<DashboardMetricas>('/dashboard/metricas');
    }

    /**
     * Órdenes recientes (últimas 10)
     */
    getOrdenesRecientes(): Observable<{ data: OrdenReciente[] }> {
        return this.api.get<{ data: OrdenReciente[] }>('/dashboard/ordenes-recientes');
    }

    /**
     * KPIs consolidados (solo supervisor/admin)
     */
    getKPIs(): Observable<KPIConsolidado> {
        return this.api.get<KPIConsolidado>('/dashboard/kpis');
    }

    /**
     * Desglose de costos
     */
    getCostosBreakdown(): Observable<{ data: CostoBreakdown[] }> {
        return this.api.get<{ data: CostoBreakdown[] }>('/dashboard/costs/breakdown');
    }

    /**
     * Tendencias de performance
     */
    getPerformanceTrends(params: {
        desde: string;
        hasta: string;
        granularidad?: 'DIA' | 'SEMANA' | 'MES';
    }): Observable<PerformanceTrend[]> {
        let httpParams = new HttpParams()
            .set('desde', params.desde)
            .set('hasta', params.hasta);

        if (params.granularidad) {
            httpParams = httpParams.set('granularidad', params.granularidad);
        }

        return this.api.get<PerformanceTrend[]>('/dashboard/performance/trends', httpParams);
    }

    /**
     * Refrescar KPIs (solo admin)
     */
    refreshKPIs(): Observable<{ message: string }> {
        return this.api.get<{ message: string }>('/dashboard/kpis/refresh');
    }
}
