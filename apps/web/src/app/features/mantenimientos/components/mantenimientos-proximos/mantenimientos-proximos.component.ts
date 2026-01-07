/**
 * MantenimientosProximosComponent - Lista de mantenimientos próximos (7 días)
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MantenimientosService } from '../../services/mantenimientos.service';
import { Mantenimiento } from '../../../../core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimientos-proximos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <a routerLink="/dashboard/mantenimientos" 
             class="text-gray-600 hover:text-gray-900 text-sm">← Volver a lista</a>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            Mantenimientos Próximos
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            Mantenimientos programados para los próximos 7 días
          </p>
        </div>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && items().length === 0) {
        <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No hay mantenimientos próximos
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No hay mantenimientos programados para los próximos 7 días.
          </p>
          <div class="mt-6">
            <a routerLink="/dashboard/mantenimientos/nuevo"
               class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Programar Mantenimiento
            </a>
          </div>
        </div>
      }

      <!-- Timeline view -->
      @if (!loading() && items().length > 0) {
        <div class="space-y-4">
          @for (group of groupedItems(); track group.date) {
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <!-- Date header -->
              <div class="bg-green-50 dark:bg-green-900/20 px-4 py-2 border-b border-green-100 dark:border-green-800">
                <h2 class="text-sm font-semibold text-green-800 dark:text-green-200">
                  {{ formatDayHeader(group.date) }}
                </h2>
              </div>
              
              <!-- Items for this date -->
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                @for (item of group.items; track item.id) {
                  <a [routerLink]="['/dashboard/mantenimientos', item.id]"
                     class="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div class="flex items-start justify-between">
                      <div class="flex items-start gap-4">
                        <!-- Time badge -->
                        <div class="text-center min-w-[60px]">
                          <div class="text-lg font-bold text-gray-900 dark:text-white">
                            {{ formatTime(item.fechaProgramada) }}
                          </div>
                          @if (item.duracionEstimada) {
                            <div class="text-xs text-gray-500">
                              ~{{ item.duracionEstimada }}h
                            </div>
                          }
                        </div>
                        
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">
                            {{ item.descripcion }}
                          </p>
                          <div class="flex items-center gap-2 mt-1">
                            <span [class]="getTipoBadgeClass(item.tipo)">
                              {{ item.tipo }}
                            </span>
                            <span [class]="getPrioridadBadgeClass(item.prioridad)">
                              {{ item.prioridad }}
                            </span>
                            @if (item.equipo) {
                              <span class="text-sm text-gray-500 dark:text-gray-400">
                                {{ item.equipo.nombre }}
                              </span>
                            }
                          </div>
                        </div>
                      </div>
                      
                      <!-- Arrow -->
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MantenimientosProximosComponent implements OnInit {
  private readonly service = inject(MantenimientosService);

  items = signal<Mantenimiento[]>([]);
  loading = signal(true);

  groupedItems = signal<{ date: string; items: Mantenimiento[] }[]>([]);

  ngOnInit(): void {
    this.loadProximos();
  }

  loadProximos(): void {
    this.loading.set(true);
    this.service.getProximos().subscribe({
      next: (data) => {
        this.items.set(data);
        this.groupedItems.set(this.groupByDate(data));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private groupByDate(items: Mantenimiento[]): { date: string; items: Mantenimiento[] }[] {
    const groups: Record<string, Mantenimiento[]> = {};
    
    for (const item of items) {
      const dateKey = new Date(item.fechaProgramada).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    }
    
    // Sort groups by date and sort items within each group by time
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, groupItems]) => ({
        date,
        items: groupItems.sort((a, b) => 
          new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime()
        )
      }));
  }

  formatDayHeader(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  getTipoBadgeClass(tipo: string): string {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (tipo) {
      case 'preventivo':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
      case 'correctivo':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      case 'predictivo':
        return `${base} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300`;
      default:
        return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  }

  getPrioridadBadgeClass(prioridad: string): string {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (prioridad) {
      case 'critica':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      case 'alta':
        return `${base} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`;
      case 'media':
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
      case 'baja':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
      default:
        return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  }
}
