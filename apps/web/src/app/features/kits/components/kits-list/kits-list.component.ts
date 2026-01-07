/**
 * KitsListComponent - Lista de kits con filtros
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KitsService } from '../../services/kits.service';
import { Kit, KitCategoria, KitEstado, ListKitsQueryDto } from '../../../../core/models/kit.model';

@Component({
  selector: 'app-kits-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kits de Herramientas</h1>
          <p class="text-gray-500 dark:text-gray-400">Gestión de kits de trabajo para técnicos</p>
        </div>
        <a routerLink="nuevo"
           class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Kit
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <input type="text" [(ngModel)]="filters.search" (input)="loadKits()"
                   placeholder="Buscar kit..."
                   class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <!-- Categoría -->
          <div>
            <select [(ngModel)]="filters.categoria" (change)="loadKits()"
                    class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Todas las categorías</option>
              <option value="herramientas">Herramientas</option>
              <option value="materiales">Materiales</option>
              <option value="seguridad">Seguridad</option>
              <option value="equipos">Equipos</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <!-- Estado -->
          <div>
            <select [(ngModel)]="filters.estado" (change)="loadKits()"
                    class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
          <!-- Solo plantillas -->
          <div class="flex items-center">
            <label class="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" [(ngModel)]="filters.soloPlantillas" (change)="loadKits()"
                     class="rounded border-gray-300 text-blue-600 mr-2">
              Solo plantillas
            </label>
            <button (click)="clearFilters()" class="ml-auto text-sm text-blue-600 hover:underline">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && kits().length === 0) {
        <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay kits</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comienza creando un nuevo kit de herramientas.
          </p>
          <div class="mt-6">
            <a routerLink="nuevo"
               class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Crear Kit
            </a>
          </div>
        </div>
      }

      <!-- Kits grid -->
      @if (!loading() && kits().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (kit of kits(); track kit.id) {
            <a [routerLink]="[kit.id]"
               class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ kit.nombre }}</h3>
                  @if (kit.descripcion) {
                    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {{ kit.descripcion }}
                    </p>
                  }
                </div>
                <span [class]="getEstadoBadgeClass(kit.estado)">
                  {{ kit.estado }}
                </span>
              </div>
              
              <div class="flex items-center gap-2 mb-3">
                <span [class]="getCategoriaBadgeClass(kit.categoria)">
                  {{ kit.categoria }}
                </span>
                @if (kit.esPlantilla) {
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Plantilla
                  </span>
                }
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500 dark:text-gray-400">
                  {{ kit.items?.length || 0 }} items
                </span>
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex justify-center items-center gap-4 mt-6">
            <button (click)="prevPage()" [disabled]="page() <= 1"
                    class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
              Anterior
            </button>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Página {{ page() }} de {{ totalPages() }}
            </span>
            <button (click)="nextPage()" [disabled]="page() >= totalPages()"
                    class="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
              Siguiente
            </button>
          </div>
        }
      }
    </div>
  `
})
export class KitsListComponent implements OnInit {
  private readonly service = inject(KitsService);

  kits = signal<Kit[]>([]);
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  limit = 12;

  filters: ListKitsQueryDto = {};

  ngOnInit(): void {
    this.loadKits();
  }

  loadKits(): void {
    this.loading.set(true);
    this.service.list({ ...this.filters, page: this.page(), limit: this.limit }).subscribe({
      next: (res) => {
        this.kits.set(res.data);
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
    this.loadKits();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadKits();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadKits();
    }
  }

  getEstadoBadgeClass(estado: string): string {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (estado) {
      case 'activo':
        return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
      case 'inactivo':
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
      case 'archivado':
        return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
      default:
        return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  }

  getCategoriaBadgeClass(categoria: string): string {
    const base = 'px-2 py-0.5 text-xs font-medium rounded-full';
    switch (categoria) {
      case 'herramientas':
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
      case 'materiales':
        return `${base} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`;
      case 'seguridad':
        return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      case 'equipos':
        return `${base} bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300`;
      default:
        return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  }
}
