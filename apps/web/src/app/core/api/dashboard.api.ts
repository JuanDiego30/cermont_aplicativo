import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
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
export class DashboardApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Get dashboard statistics
   */
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Get dashboard metrics
   */
  getMetricas(): Observable<DashboardMetricas> {
    return this.http.get<DashboardMetricas>(`${this.apiUrl}/metricas`);
  }

  /**
   * Get recent orders
   */
  getOrdenesRecientes(): Observable<{ data: OrdenReciente[] }> {
    return this.http.get<{ data: OrdenReciente[] }>(`${this.apiUrl}/ordenes-recientes`);
  }

  /**
   * Get consolidated KPIs
   */
  getKPIs(): Observable<KPIConsolidado> {
    return this.http.get<KPIConsolidado>(`${this.apiUrl}/overview`);
  }

  /**
   * Get cost breakdown
   */
  getCostosBreakdown(): Observable<{ data: CostoBreakdown[] }> {
    return this.http.get<{ data: CostoBreakdown[] }>(`${this.apiUrl}/costs/breakdown`);
  }

  /**
   * Get performance trends
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

    return this.http.get<PerformanceTrend[]>(`${this.apiUrl}/performance/trends`, { params: httpParams });
  }

  /**
   * Refresh KPIs (admin only)
   */
  refreshKPIs(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/kpis/refresh`, {});
  }
}
