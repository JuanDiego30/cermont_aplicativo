import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  DashboardMetricas,
  DashboardStats,
  OrdenReciente,
} from '../../../core/models/dashboard.model';
import { logError } from '../../../core/utils/logger';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {{ lastUpdate | date: 'short' }}
        </span>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Total Órdenes -->
        <div
          class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/10"
            >
              <svg
                class="w-6 h-6 text-brand-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Órdenes</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats()?.totalOrdenes || 0 }}
              </p>
            </div>
          </div>
        </div>

        <!-- Pendientes -->
        <div
          class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-500/10"
            >
              <svg
                class="w-6 h-6 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats()?.ordenesPendientes || 0 }}
              </p>
            </div>
          </div>
        </div>

        <!-- En Proceso -->
        <div
          class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10"
            >
              <svg
                class="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">En Proceso</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats()?.ordenesEnProceso || 0 }}
              </p>
            </div>
          </div>
        </div>

        <!-- Completadas -->
        <div
          class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/10"
            >
              <svg
                class="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Completadas</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats()?.ordenesCompletadas || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Métricas -->
        <div
          class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
        >
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Métricas de Rendimiento
          </h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p class="text-sm text-gray-500 dark:text-gray-400">Tiempo Promedio</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ metricas()?.tiempoPromedioEjecucion || 0 }} min
              </p>
            </div>
            <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p class="text-sm text-gray-500 dark:text-gray-400">Eficiencia</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ metricas()?.eficiencia || 0 }}%
              </p>
            </div>
            <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p class="text-sm text-gray-500 dark:text-gray-400">Costo Promedio</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ metricas()?.costoPromedio | currency: 'COP' : 'symbol' : '1.0-0' }}
              </p>
            </div>
            <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p class="text-sm text-gray-500 dark:text-gray-400">Órdenes/Mes</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ metricas()?.ordenesCompletadasMes || 0 }}
              </p>
            </div>
          </div>
        </div>

        <!-- Órdenes Recientes -->
        <div
          class="p-6 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Órdenes Recientes</h2>
            <a routerLink="/orders" class="text-sm text-brand-500 hover:text-brand-600"
              >Ver todas →</a
            >
          </div>

          @if (ordenesRecientes().length === 0) {
            <p class="text-gray-500 dark:text-gray-400">No hay órdenes recientes</p>
          } @else {
            <div class="space-y-3">
              @for (orden of ordenesRecientes().slice(0, 5); track orden.id) {
                <a
                  [routerLink]="['/orders', orden.id]"
                  class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ orden.numero }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ orden.cliente }}</p>
                  </div>
                  <span
                    [class]="getEstadoBadgeClass(orden.estado)"
                    class="px-2.5 py-1 text-xs font-medium rounded-full"
                  >
                    {{ orden.estado }}
                  </span>
                </a>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardMainComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroy$ = new Subject<void>();

  stats = signal<DashboardStats | null>(null);
  metricas = signal<DashboardMetricas | null>(null);
  ordenesRecientes = signal<OrdenReciente[]>([]);
  lastUpdate = new Date();

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Load stats
    this.dashboardService
      .getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.stats.set(data),
        error: err => logError('Error loading stats', err),
      });

    // Load metricas
    this.dashboardService
      .getMetricas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.metricas.set(data),
        error: err => logError('Error loading metricas', err),
      });

    // Load recent orders
    this.dashboardService
      .getOrdenesRecientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => this.ordenesRecientes.set(response.data || []),
        error: err => logError('Error loading ordenes recientes', err),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: Record<string, string> = {
      planeacion: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      ejecucion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      pausada: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      completada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return classes[estado] || 'bg-gray-100 text-gray-800';
  }
}
