import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DashboardApi } from '@app/core/api/dashboard.api';
import { ToastService } from '@app/shared/services/toast.service';
import { Subject, forkJoin, takeUntil, catchError, of } from 'rxjs';

interface DashboardStats {
  totalOrdenes: number;
  ordenesCompletadas: number;
  ordenesPendientes: number;
  ordenesEnProceso: number;
  ingresoTotal: number;
  promedioOrdenes: number;
  tasaCrecimiento: number;
}

interface OrdenReciente {
  id: string;
  numero: string;
  cliente: string;
  estado: string;
  total: number;
  fecha: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardApi = inject(DashboardApi);
  private readonly toastService = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  loading = true;
  lastUpdated = new Date();
  stats: DashboardStats = {
    totalOrdenes: 0,
    ordenesCompletadas: 0,
    ordenesPendientes: 0,
    ordenesEnProceso: 0,
    ingresoTotal: 0,
    promedioOrdenes: 0,
    tasaCrecimiento: 0
  };
  ordenesRecientes: OrdenReciente[] = [];

  // Métricas de rendimiento
  tiempoPromedio = 0;
  eficiencia = 0;
  costoPromedio = 0;
  ordenesMes = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;

    // Llamar a ambos endpoints en paralelo
    forkJoin({
      stats: this.dashboardApi.getStats().pipe(
        catchError(err => {
          console.error('Error loading stats:', err);
          return of(null);
        })
      ),
      metricas: this.dashboardApi.getMetricas().pipe(
        catchError(err => {
          console.error('Error loading metricas:', err);
          return of(null);
        })
      ),
      ordenesRecientes: this.dashboardApi.getOrdenesRecientes().pipe(
        catchError(err => {
          console.error('Error loading ordenes recientes:', err);
          return of({ data: [] });
        })
      )
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Mapear stats desde la respuesta del backend
          if (response.stats) {
            const beStats = response.stats as any;
            this.stats = {
              totalOrdenes: beStats.totalOrdenes || 0,
              ordenesCompletadas: beStats.porEstado?.['completada'] || 0,
              ordenesPendientes: beStats.porEstado?.['pendiente'] || 0,
              ordenesEnProceso: beStats.porEstado?.['en_proceso'] || beStats.porEstado?.['ejecucion'] || 0,
              ingresoTotal: 0, // Se obtiene de otro endpoint
              promedioOrdenes: beStats.ordenesRecientes || 0,
              tasaCrecimiento: 0
            };
          }

          // Mapear métricas
          if (response.metricas) {
            const metricas = response.metricas as any;
            this.tiempoPromedio = metricas.tiempoPromedio || 0;
            this.eficiencia = metricas.eficiencia || 0;
            this.costoPromedio = metricas.costoPromedio || 0;
            this.ordenesMes = metricas.ordenesMes || metricas.completedOrders || 0;
          }

          // Mapear órdenes recientes
          if (response.ordenesRecientes?.data) {
            this.ordenesRecientes = response.ordenesRecientes.data.map((orden: any) => ({
              id: orden.id,
              numero: orden.numero || `ORD-${orden.id.slice(0, 6)}`,
              cliente: orden.cliente || 'Sin cliente',
              estado: orden.estado,
              total: orden.total || 0,
              fecha: orden.createdAt || orden.fecha
            }));
          }

          this.lastUpdated = new Date();
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.toastService.error('Error cargando datos del dashboard');
          console.error('Dashboard load error:', err);
        }
      });
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'pendiente': 'badge-warning',
      'planeacion': 'badge-info',
      'ejecucion': 'badge-info',
      'en_proceso': 'badge-primary',
      'pausada': 'badge-warning',
      'completada': 'badge-success',
      'cancelada': 'badge-danger'
    };
    return classes[estado?.toLowerCase()] || 'badge-secondary';
  }

  getGrowthTrendClass(): string {
    return this.stats.tasaCrecimiento >= 0 ? 'text-success' : 'text-danger';
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
