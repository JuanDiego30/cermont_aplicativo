import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService, PaginatedOrdenes } from '../../services/ordenes.service';
import { Orden, OrdenEstado, Prioridad, ListOrdenesQuery } from '../../../../core/models';
import { logError } from '../../../../core/utils/logger';

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ordenes-list.component.html',
  styleUrls: ['./ordenes-list.component.css']
})
export class OrdenesListComponent implements OnInit {
  private readonly ordenesService = inject(OrdenesService);

  // Signals para el estado
  ordenes = signal<Orden[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filtros y búsqueda
  searchTerm = signal('');
  estadoFilter = signal<string>('');
  prioridadFilter = signal<string>('');

  // Paginación
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  // Enums para template
  readonly OrdenEstado = OrdenEstado;
  readonly Prioridad = Prioridad;
  readonly estadosOptions = Object.values(OrdenEstado);
  readonly prioridadesOptions = Object.values(Prioridad);

  ngOnInit() {
    this.loadOrdenes();
  }

  loadOrdenes() {
    this.loading.set(true);
    this.error.set(null);

    const query: ListOrdenesQuery = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      estado: (this.estadoFilter() as OrdenEstado) || undefined,
      prioridad: (this.prioridadFilter() as Prioridad) || undefined
    };

    this.ordenesService.list(query).subscribe({
      next: (response: PaginatedOrdenes) => {
        // Handle both data and items properties
        this.ordenes.set(response.data ?? []);
        this.totalItems.set(response.total);
        this.totalPages.set(Math.ceil(response.total / this.pageSize()));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las órdenes');
        this.loading.set(false);
        logError('Error loading orders', err);
      }
    });
  }

  onSearchChange() {
    this.currentPage.set(1);
    this.loadOrdenes();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadOrdenes();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadOrdenes();
    }
  }

  getEstadoBadgeClass(estado: string): string {
    const colorMap: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'planeacion': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'en_progreso': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'ejecucion': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'completada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'cancelada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'archivada': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colorMap[estado] || 'bg-gray-100 text-gray-800';
  }

  getPrioridadBadgeClass(prioridad: string): string {
    const colorMap: Record<string, string> = {
      'baja': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'media': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'alta': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'urgente': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colorMap[prioridad] || 'bg-gray-100 text-gray-700';
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.estadoFilter.set('');
    this.prioridadFilter.set('');
    this.currentPage.set(1);
    this.loadOrdenes();
  }
}

