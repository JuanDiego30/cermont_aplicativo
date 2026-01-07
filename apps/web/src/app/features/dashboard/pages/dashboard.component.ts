import { Component, OnInit, inject } from '@angular/core';
import { DashboardApi } from '@app/core/api/dashboard.api';
import { ToastService } from '@app/shared/services/toast.service';
import { catchError, tap, throwError } from 'rxjs';

interface DashboardStats {
  totalOrdenes: number;
  ordenesCompletadas: number;
  ordenesPendientes: number;
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
export class DashboardComponent implements OnInit {
  private dashboardApi = inject(DashboardApi);
  private toastService = inject(ToastService);

  loading = true;
  stats: DashboardStats = {
    totalOrdenes: 0,
    ordenesCompletadas: 0,
    ordenesPendientes: 0,
    ingresoTotal: 0,
    promedioOrdenes: 0,
    tasaCrecimiento: 0
  };
  ordenesRecientes: OrdenReciente[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.dashboardApi.getStats()
      .pipe(
        tap((response: any) => {
          this.stats = response.stats;
          this.ordenesRecientes = response.ordenesRecientes;
          this.loading = false;
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.error('Error cargando datos del dashboard');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'pendiente': 'badge-warning',
      'planeacion': 'badge-info',
      'ejecucion': 'badge-info',
      'pausada': 'badge-warning',
      'completada': 'badge-success',
      'cancelada': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }

  getGrowthTrendClass(): string {
    return this.stats.tasaCrecimiento >= 0 ? 'text-success' : 'text-danger';
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
