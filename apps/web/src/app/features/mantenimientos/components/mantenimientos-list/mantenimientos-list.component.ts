/**
 * MantenimientosListComponent - Lista de mantenimientos con filtros y paginación
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MantenimientosService } from '../../services/mantenimientos.service';
import { 
  Mantenimiento, 
  MantenimientoEstado, 
  MantenimientoPrioridad,
  MantenimientoTipo,
  QueryMantenimientosDto 
} from '../../../../core/models/mantenimiento.model';

@Component({
  selector: 'app-mantenimientos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mantenimientos</h1>
          <p class="text-gray-600 dark:text-gray-400">Gestión de mantenimientos preventivos y correctivos</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="proximos" 
             class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
            📅 Próximos
          </a>
          <a routerLink="nuevo" 
             class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            + Nuevo Mantenimiento
          </a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select [(ngModel)]="filters.tipo" (change)="loadMantenimientos()" 
                  class="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">Todos los tipos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="predictivo">Predictivo</option>
          </select>
          <select [(ngModel)]="filters.estado" (change)="loadMantenimientos()"
                  class="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">Todos los estados</option>
            <option value="programado">Programado</option>
            <option value="en_ejecucion">En Ejecución</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
            <option value="vencido">Vencido</option>
          </select>
          <select [(ngModel)]="filters.prioridad" (change)="loadMantenimientos()"
                  class="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
          <button (click)="clearFilters()" 
                  class="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400">
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Lista -->
      @if (!loading() && mantenimientos().length > 0) {
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Descripción
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Prioridad
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Fecha Programada
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (m of mantenimientos(); track m.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td class="px-6 py-4">
                    <a [routerLink]="[m.id]" class="text-blue-600 hover:text-blue-800 font-medium">
                      {{ m.descripcion | slice:0:50 }}{{ m.descripcion.length > 50 ? '...' : '' }}
                    </a>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getTipoClass(m.tipo)">{{ m.tipo | titlecase }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getEstadoClass(m.estado)">{{ formatEstado(m.estado) }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getPrioridadClass(m.prioridad)">{{ m.prioridad | titlecase }}</span>
                  </td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {{ formatDate(m.fechaProgramada) }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <a [routerLink]="[m.id, 'editar']" 
                       class="text-indigo-600 hover:text-indigo-900 mr-3">Editar</a>
                    <a [routerLink]="[m.id]" 
                       class="text-gray-600 hover:text-gray-900">Ver</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Total: {{ total() }} mantenimientos
          </span>
          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="page() <= 1"
                    class="px-3 py-1 rounded border disabled:opacity-50">Anterior</button>
            <span class="px-3 py-1">Página {{ page() }} de {{ totalPages() }}</span>
            <button (click)="nextPage()" [disabled]="page() >= totalPages()"
                    class="px-3 py-1 rounded border disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && mantenimientos().length === 0) {
        <div class="text-center py-12">
          <div class="text-4xl mb-4">🔧</div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay mantenimientos</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Crea tu primer mantenimiento para comenzar</p>
          <a routerLink="nuevo" class="inline-block px-4 py-2 bg-green-600 text-white rounded-lg">
            + Nuevo Mantenimiento
          </a>
        </div>
      }
    </div>
  `
})
export class MantenimientosListComponent implements OnInit {
  private readonly service = inject(MantenimientosService);

  mantenimientos = signal<Mantenimiento[]>([]);
  loading = signal(false);
  total = signal(0);
  page = signal(1);
  limit = 10;
  totalPages = signal(1);

  filters: QueryMantenimientosDto = {};

  ngOnInit(): void {
    this.loadMantenimientos();
  }

  loadMantenimientos(): void {
    this.loading.set(true);
    this.service.list({ ...this.filters, page: this.page(), limit: this.limit }).subscribe({
      next: (res) => {
        this.mantenimientos.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  clearFilters(): void {
    this.filters = {};
    this.page.set(1);
    this.loadMantenimientos();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadMantenimientos();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadMantenimientos();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CO', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  }

  formatEstado(estado: string): string {
    return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getTipoClass(tipo: string): string {
    const classes: Record<string, string> = {
      'preventivo': 'px-2 py-1 rounded text-xs bg-blue-100 text-blue-800',
      'correctivo': 'px-2 py-1 rounded text-xs bg-orange-100 text-orange-800',
      'predictivo': 'px-2 py-1 rounded text-xs bg-purple-100 text-purple-800',
      'programado': 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800'
    };
    return classes[tipo] || 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800';
  }

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'programado': 'px-2 py-1 rounded text-xs bg-blue-100 text-blue-800',
      'en_ejecucion': 'px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800',
      'completado': 'px-2 py-1 rounded text-xs bg-green-100 text-green-800',
      'cancelado': 'px-2 py-1 rounded text-xs bg-red-100 text-red-800',
      'vencido': 'px-2 py-1 rounded text-xs bg-red-200 text-red-900'
    };
    return classes[estado] || 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800';
  }

  getPrioridadClass(prioridad: string): string {
    const classes: Record<string, string> = {
      'baja': 'px-2 py-1 rounded text-xs bg-green-100 text-green-800',
      'media': 'px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800',
      'alta': 'px-2 py-1 rounded text-xs bg-orange-100 text-orange-800',
      'critica': 'px-2 py-1 rounded text-xs bg-red-100 text-red-800'
    };
    return classes[prioridad] || 'px-2 py-1 rounded text-xs bg-gray-100 text-gray-800';
  }
}
