import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

const INITIAL_STATS: DashboardStats = {
  totalOrdenes: 0,
  ordenesCompletadas: 0,
  ordenesPendientes: 0,
  ingresoTotal: 0,
  promedioOrdenes: 0,
  tasaCrecimiento: 0
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly dashboardApi = inject(DashboardApi);
  private readonly toastService = inject(ToastService);

  // Signals for reactive state
  readonly loading = signal(true);
  readonly stats = signal<DashboardStats>(INITIAL_STATS);
  readonly ordenesRecientes = signal<OrdenReciente[]>([]);

  // Computed values
  readonly growthTrendClass = computed(() =>
    this.stats().tasaCrecimiento >= 0 ? 'text-success' : 'text-danger'
  );

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.dashboardApi.getStats()
      .pipe(
        tap((response: any) => {
          this.stats.set(response.stats);
          this.ordenesRecientes.set(response.ordenesRecientes);
          this.loading.set(false);
        }),
        catchError((err) => {
          this.loading.set(false);
          this.toastService.error('Error cargando datos del dashboard');
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'pendiente': 'badge-warning',
      'en_progreso': 'badge-info',
      'completada': 'badge-success',
      'cancelada': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}

