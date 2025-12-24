import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService, PaginatedOrdenes } from '../services/ordenes.service';
import { Orden, OrderEstado, OrderPriority } from '../../../core/models/orden.model';

@Component({
    selector: 'app-ordenes-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Órdenes de Servicio</h1>
        <a routerLink="create" 
           class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva Orden
        </a>
      </div>

      <!-- Filters -->
      <div class="p-4 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
        <div class="grid gap-4 md:grid-cols-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Buscar</label>
            <input type="text" 
                   [(ngModel)]="searchTerm"
                   (ngModelChange)="onSearch()"
                   placeholder="Buscar por número, cliente..."
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
            <select [(ngModel)]="selectedEstado" (ngModelChange)="loadOrdenes()"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Todos</option>
              <option value="planeacion">Planeación</option>
              <option value="ejecucion">Ejecución</option>
              <option value="pausada">Pausada</option>
              <option value="completada">Completada</option>
            </select>
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad</label>
            <select [(ngModel)]="selectedPrioridad" (ngModelChange)="loadOrdenes()"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Todas</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
        @if (loading()) {
          <div class="flex items-center justify-center p-12">
            <div class="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (ordenes().length === 0) {
          <div class="p-12 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No hay órdenes</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">Crea tu primera orden de servicio</p>
          </div>
        } @else {
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Número</th>
                <th class="px-6 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Descripción</th>
                <th class="px-6 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Cliente</th>
                <th class="px-6 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Estado</th>
                <th class="px-6 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Prioridad</th>
                <th class="px-6 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (orden of ordenes(); track orden.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ orden.numero }}</td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-300">{{ orden.descripcion | slice:0:50 }}...</td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-300">{{ orden.cliente }}</td>
                  <td class="px-6 py-4">
                    <span [class]="getEstadoBadgeClass(orden.estado)" class="px-2.5 py-1 text-xs font-medium rounded-full">
                      {{ orden.estado }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class]="getPrioridadBadgeClass(orden.prioridad)" class="px-2.5 py-1 text-xs font-medium rounded-full">
                      {{ orden.prioridad }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <a [routerLink]="[orden.id]" class="text-brand-500 hover:text-brand-600 font-medium">
                      Ver detalle
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {{ (currentPage() - 1) * pageSize + 1 }} - {{ Math.min(currentPage() * pageSize, total()) }} de {{ total() }}
            </div>
            <div class="flex gap-2">
              <button (click)="goToPage(currentPage() - 1)" 
                      [disabled]="currentPage() === 1"
                      class="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                Anterior
              </button>
              <button (click)="goToPage(currentPage() + 1)" 
                      [disabled]="currentPage() === totalPages()"
                      class="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                Siguiente
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class OrdenesListComponent implements OnInit {
    private readonly ordenesService = inject(OrdenesService);

    // State with Signals
    ordenes = signal<Orden[]>([]);
    loading = signal(true);
    total = signal(0);
    currentPage = signal(1);
    pageSize = 10;
    totalPages = computed(() => Math.ceil(this.total() / this.pageSize));

    // Filters
    searchTerm = '';
    selectedEstado = '';
    selectedPrioridad = '';

    Math = Math;

    ngOnInit() {
        this.loadOrdenes();
    }

    loadOrdenes() {
        this.loading.set(true);

        this.ordenesService.list({
            page: this.currentPage(),
            limit: this.pageSize,
            search: this.searchTerm || undefined,
            estado: this.selectedEstado as OrderEstado || undefined,
            prioridad: this.selectedPrioridad as OrderPriority || undefined,
        }).subscribe({
            next: (response) => {
                this.ordenes.set(response.data);
                this.total.set(response.total);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading ordenes:', err);
                this.loading.set(false);
            }
        });
    }

    onSearch() {
        this.currentPage.set(1);
        this.loadOrdenes();
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
            this.loadOrdenes();
        }
    }

    getEstadoBadgeClass(estado: OrderEstado): string {
        const classes: Record<string, string> = {
            'planeacion': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'ejecucion': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'pausada': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            'completada': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'cancelada': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return classes[estado] || 'bg-gray-100 text-gray-800';
    }

    getPrioridadBadgeClass(prioridad: OrderPriority): string {
        const classes: Record<string, string> = {
            'baja': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            'media': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'alta': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            'urgente': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return classes[prioridad] || 'bg-gray-100 text-gray-800';
    }
}
