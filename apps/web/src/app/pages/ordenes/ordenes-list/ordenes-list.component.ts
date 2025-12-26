import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OrdenesService, Orden, QueryOrdenParams, PaginatedResponse } from '../../../services/ordenes.service';

@Component({
    selector: 'app-ordenes-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
          <p class="text-gray-500 text-sm mt-1">Gestiona tus órdenes de trabajo</p>
        </div>
        <button 
          (click)="crearOrden()"
          class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva Orden
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Búsqueda -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input 
              type="text"
              [ngModel]="busqueda()"
              (ngModelChange)="onBusquedaChange($event)"
              placeholder="Buscar órdenes..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <!-- Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
              [ngModel]="filtroEstado()"
              (ngModelChange)="filtroEstado.set($event); applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Todos</option>
              @for (estado of estados; track estado) {
                <option [value]="estado">{{ estado }}</option>
              }
            </select>
          </div>
          
          <!-- Prioridad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select 
              [ngModel]="filtroPrioridad()"
              (ngModelChange)="filtroPrioridad.set($event); applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Todas</option>
              @for (prioridad of prioridades; track prioridad) {
                <option [value]="prioridad">{{ prioridad }}</option>
              }
            </select>
          </div>
          
          <!-- Limpiar filtros -->
          <div class="flex items-end">
            <button 
              (click)="clearFilters()"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      @if (error()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div class="flex">
            <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
            </svg>
            <p class="ml-3 text-sm text-red-700">{{ error() }}</p>
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span class="ml-3 text-gray-600">Cargando órdenes...</span>
        </div>
      }

      <!-- Table -->
      @if (!loading()) {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900"># Orden</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descripción</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prioridad</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha Inicio</th>
                  <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (orden of ordenes(); track orden.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 text-sm font-medium text-primary-600">{{ orden.numeroOrden }}</td>
                    <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{{ orden.descripcion }}</td>
                    <td class="px-6 py-4">
                      <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getEstadoClass(orden.estado)">
                        {{ orden.estado }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getPrioridadClass(orden.prioridad)">
                        {{ orden.prioridad }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ orden.fechaInicio | date:'dd/MM/yyyy' }}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                      <button 
                        (click)="verDetalle(orden)"
                        class="text-primary-500 hover:text-primary-600 font-medium text-sm">
                        Ver
                      </button>
                      <button 
                        (click)="editarOrden(orden)"
                        class="text-blue-500 hover:text-blue-600 font-medium text-sm">
                        Editar
                      </button>
                      <button 
                        (click)="eliminarOrden(orden)"
                        class="text-red-500 hover:text-red-600 font-medium text-sm">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                      No se encontraron órdenes
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p class="text-sm text-gray-700">
                Mostrando página {{ currentPage() }} de {{ totalPages() }} ({{ totalItems() }} resultados)
              </p>
              <div class="flex gap-2">
                <button 
                  (click)="changePage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Anterior
                </button>
                <button 
                  (click)="changePage(currentPage() + 1)"
                  [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Siguiente
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class OrdenesListComponent implements OnInit, OnDestroy {
    // State signals
    ordenes = signal<Orden[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Pagination signals
    currentPage = signal(1);
    pageSize = signal(10);
    totalItems = signal(0);
    totalPages = signal(0);

    // Filter signals
    filtroEstado = signal('');
    filtroPrioridad = signal('');
    busqueda = signal('');

    private busquedaSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    // Constants
    estados = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'ARCHIVADA'];
    prioridades = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];

    constructor(
        private ordenesService: OrdenesService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadOrdenes();
        this.setupSearch();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setupSearch(): void {
        this.busquedaSubject.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.loadOrdenes();
        });
    }

    loadOrdenes(): void {
        this.loading.set(true);
        this.error.set(null);

        const params: QueryOrdenParams = {
            page: this.currentPage(),
            limit: this.pageSize(),
            sortBy: 'createdAt',
            sortOrder: 'desc'
        };

        if (this.filtroEstado()) params.estado = this.filtroEstado();
        if (this.filtroPrioridad()) params.prioridad = this.filtroPrioridad();
        if (this.busqueda()) params.buscar = this.busqueda();

        this.ordenesService.getAll(params)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: PaginatedResponse<Orden>) => {
                    this.ordenes.set(response.data);
                    this.totalItems.set(response.meta.total);
                    this.totalPages.set(response.meta.totalPages);
                    this.currentPage.set(response.meta.page);
                    this.loading.set(false);
                },
                error: (error) => {
                    this.error.set(error.message || 'Error al cargar las órdenes');
                    this.loading.set(false);
                    console.error('Error:', error);
                }
            });
    }

    onBusquedaChange(value: string): void {
        this.busqueda.set(value);
        this.busquedaSubject.next(value);
    }

    changePage(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
            this.loadOrdenes();
        }
    }

    applyFilters(): void {
        this.currentPage.set(1);
        this.loadOrdenes();
    }

    clearFilters(): void {
        this.filtroEstado.set('');
        this.filtroPrioridad.set('');
        this.busqueda.set('');
        this.currentPage.set(1);
        this.loadOrdenes();
    }

    verDetalle(orden: Orden): void {
        this.router.navigate(['/ordenes', orden.id]);
    }

    crearOrden(): void {
        this.router.navigate(['/ordenes/nueva']);
    }

    editarOrden(orden: Orden): void {
        this.router.navigate(['/ordenes', orden.id, 'editar']);
    }

    eliminarOrden(orden: Orden): void {
        if (confirm(`¿Está seguro de eliminar la orden ${orden.numeroOrden}?`)) {
            this.loading.set(true);
            this.ordenesService.delete(orden.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loadOrdenes();
                    },
                    error: (error) => {
                        this.error.set(error.message || 'Error al eliminar la orden');
                        this.loading.set(false);
                    }
                });
        }
    }

    getEstadoClass(estado: string): string {
        const classes: Record<string, string> = {
            'PENDIENTE': 'bg-warning-100 text-warning-700',
            'EN_PROGRESO': 'bg-info-100 text-info-700',
            'COMPLETADA': 'bg-success-100 text-success-700',
            'CANCELADA': 'bg-danger-100 text-danger-700',
            'ARCHIVADA': 'bg-gray-100 text-gray-700'
        };
        return classes[estado] || 'bg-gray-100 text-gray-700';
    }

    getPrioridadClass(prioridad: string): string {
        const classes: Record<string, string> = {
            'BAJA': 'bg-gray-100 text-gray-700',
            'MEDIA': 'bg-info-100 text-info-700',
            'ALTA': 'bg-accent-100 text-accent-700',
            'URGENTE': 'bg-danger-100 text-danger-700'
        };
        return classes[prioridad] || 'bg-gray-100 text-gray-700';
    }
}
