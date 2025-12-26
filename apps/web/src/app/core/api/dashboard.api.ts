/**
 * DashboardApi - Dashboard API client
 * Handles dashboard statistics and metrics
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import {
  DashboardStats,
  DashboardMetricas,
  OrdenReciente,
  KPIConsolidado,
  CostoBreakdown,
  PerformanceTrend
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardApi extends ApiBaseService {
  /**
   * Get dashboard statistics
   */
  getStats(): Observable<DashboardStats> {
    return this.get<DashboardStats>('/dashboard/stats');
  }

  /**
   * Get dashboard metrics
   */
  getMetricas(): Observable<DashboardMetricas> {
    return this.get<DashboardMetricas>('/dashboard/metricas');
  }

  /**
   * Get recent orders
   */
  getOrdenesRecientes(): Observable<{ data: OrdenReciente[] }> {
    return this.get<{ data: OrdenReciente[] }>('/dashboard/ordenes-recientes');
  }

  /**
   * Get consolidated KPIs (supervisor/admin only)
   */
  getKPIs(): Observable<KPIConsolidado> {
    return this.get<KPIConsolidado>('/dashboard/overview');
  }

  /**
   * Get cost breakdown
   */
  getCostosBreakdown(): Observable<{ data: CostoBreakdown[] }> {
    return this.get<{ data: CostoBreakdown[] }>('/dashboard/costs/breakdown');
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(params: {
    desde: string;
    hasta: string;
    granularidad?: 'DIA' | 'SEMANA' | 'MES';
  }): Observable<PerformanceTrend[]> {
    return this.get<PerformanceTrend[]>('/dashboard/performance/trends', params);
  }

  /**
   * Refresh KPIs (admin only)
   */
  refreshKPIs(): Observable<{ message: string }> {
    return this.get<{ message: string }>('/dashboard/kpis/refresh');
  }
}

