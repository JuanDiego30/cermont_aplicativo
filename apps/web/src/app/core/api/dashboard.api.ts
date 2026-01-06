import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '@env/environment';
import {
  DashboardStats,
  DashboardMetricas,
  OrdenReciente,
  KPIConsolidado,
  CostoBreakdown,
  PerformanceTrend
} from '../models/dashboard.model';

/**
 * Dashboard API Service
 * Resilient error handling: returns defaults on 500 instead of crashing UI.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardApi {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Get dashboard statistics - resilient
   */
  getStats(): Observable<DashboardStats> {
    const defaults: DashboardStats = {
      totalOrdenes: 0,
      ordenesPendientes: 0,
      ordenesEnProceso: 0,
      ordenesCompletadas: 0,
      totalTecnicos: 0,
      totalClientes: 0
    };
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`).pipe(
      catchError((err) => {
        console.warn('[DashboardApi] stats failed:', err.status);
        return of(defaults);
      })
    );
  }

  /**
   * Get dashboard metrics - resilient
   */
  getMetricas(): Observable<DashboardMetricas> {
    const defaults: DashboardMetricas = {
      tiempoPromedioEjecucion: 0,
      eficiencia: 0,
      costoTotal: 0,
      costoPromedio: 0,
      ordenesCompletadasMes: 0,
      ordenesPendientesMes: 0
    };
    return this.http.get<DashboardMetricas>(`${this.apiUrl}/metricas`).pipe(
      catchError((err) => {
        console.warn('[DashboardApi] metricas failed:', err.status);
        return of(defaults);
      })
    );
  }

  /**
   * Get recent orders - resilient
   */
  getOrdenesRecientes(): Observable<{ data: OrdenReciente[] }> {
    return this.http.get<{ data: OrdenReciente[] }>(`${this.apiUrl}/ordenes-recientes`).pipe(
      catchError((err) => {
        console.warn('[DashboardApi] ordenes-recientes failed:', err.status);
        return of({ data: [] });
      })
    );
  }

  /**
   * Get consolidated KPIs - resilient
   */
  getKPIs(): Observable<KPIConsolidado> {
    const defaults: KPIConsolidado = {
      operativos: { ordenesCompletadas: 0, eficiencia: 0, tiempoPromedio: 0 },
      financieros: { ingresos: 0, costos: 0, margen: 0 },
      tecnicos: { tecnicosActivos: 0, ordenesPorTecnico: 0, satisfaccion: 0 }
    };
    return this.http.get<KPIConsolidado>(`${this.apiUrl}/kpis`).pipe(
      catchError((err) => {
        console.warn('[DashboardApi] kpis failed:', err.status);
        return of(defaults);
      })
    );
  }

  /**
   * Get cost breakdown - resilient
   */
  getCostosBreakdown(): Observable<{ data: CostoBreakdown[] }> {
    return this.http.get<{ data: CostoBreakdown[] }>(`${this.apiUrl}/costos-breakdown`).pipe(
      catchError((err) => {
        console.warn('[DashboardApi] costos-breakdown failed:', err.status);
        return of({ data: [] });
      })
    );
  }

  /**
   * Get performance trends - resilient
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

    return this.http.get<PerformanceTrend[]>(`${this.apiUrl}/performance-trends`, { params: httpParams }).pipe(
      catchError((err) => {
        console.warn('[DashboardApi] performance-trends failed:', err.status);
        return of([]);
      })
    );
  }

  /**
   * Refresh KPIs (admin only)
   */
  refreshKPIs(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/kpis/refresh`, {}).pipe(
      catchError((err) => {
        console.warn('[DashboardApi] refresh failed:', err.status);
        return of({ message: 'Refresh failed' });
      })
    );
  }
}
