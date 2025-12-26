import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../features/dashboard/services/dashboard.service';

interface ProgressItem {
  label: string;
  current: number;
  total: number;
  color?: string;
}

interface SummaryStat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-mobile-progress-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Budget/Progress Overview Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
        <button class="text-sm text-brand-500 hover:text-brand-600 font-medium">
          Ver todo
        </button>
      </div>

      <!-- Summary Stats -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        @for (summary of summaryStats; track summary.label) {
          <div class="text-center">
            <p class="text-lg font-bold text-gray-900 dark:text-white">{{ summary.value }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ summary.label }}</p>
          </div>
        }
      </div>

      <!-- Progress Bars -->
      <div class="space-y-4">
        @for (item of progressItems; track item.label) {
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ item.label }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ item.current }} / {{ item.total }}
              </span>
            </div>
            <div class="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                [ngClass]="item.color || 'bg-brand-500'"
                [style.width.%]="getPercentage(item.current, item.total)"
              ></div>
            </div>
          </div>
        }
      </div>

      <!-- Status indicator -->
      @if (statusMessage) {
        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-green-500">✓</span>
            <span class="text-gray-600 dark:text-gray-400">{{ statusMessage }}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class MobileProgressSectionComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  @Input() title = 'Resumen del Día';
  @Input() statusMessage = '¡Vas por buen camino!';
  @Input() summaryStats: SummaryStat[] = [];
  @Input() progressItems: ProgressItem[] = [];

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.dashboardService.getStats().subscribe(data => {
      const total = data.totalOrdenes;
      const executed = data.ordenesCompletadas * 150000; // Estimate per order
      const pending = data.ordenesPendientes * 150000;

      this.summaryStats = [
        { label: 'Total', value: this.formatCurrency(executed + pending) },
        { label: 'Ejecutado', value: this.formatCurrency(executed) },
        { label: 'Pendiente', value: this.formatCurrency(pending) },
      ];

      this.progressItems = [
        { label: 'Órdenes Completadas', current: data.ordenesCompletadas, total: total, color: 'bg-green-500' },
        { label: 'Pendientes de Revisión', current: data.ordenesPendientes, total: data.totalOrdenes, color: 'bg-yellow-500' },
        { label: 'Técnicos Activos', current: data.totalTecnicos, total: 20, color: 'bg-blue-500' },
      ];
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  getPercentage(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.min((current / total) * 100, 100);
  }
}
