import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../services/ordenes.service';
import { Orden, OrdenEstado, Prioridad, ListOrdenesQuery } from '../../../../core/models/orden.model';

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ordenes-list.component.html',
  styleUrls: ['./ordenes-list.component.css']
})
export class OrdenesListComponent implements OnInit {
  private readonly ordenesService = inject(OrdenesService);

  // State with Signals
  ordenes = signal<Orden[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Filters
  searchTerm = '';
  filtroEstado = '';
  filtroPrioridad = '';

  // Options for filters
  estadosOptions = Object.values(OrdenEstado);
  prioridadesOptions = Object.values(Prioridad);

  Math = Math;

  ngOnInit() {
    this.loadOrdenes();
  }

  loadOrdenes() {
    this.loading.set(true);
    this.error.set(null);

    this.ordenesService.list({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm || undefined,
      estado: this.filtroEstado as OrdenEstado || undefined,
      prioridad: this.filtroPrioridad as Prioridad || undefined,
    }).subscribe({
      next: (response) => {
        this.ordenes.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading ordenes:', err);
        this.error.set('Error al cargar las órdenes');
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadOrdenes();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadOrdenes();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.filtroPrioridad = '';
    this.currentPage.set(1);
    this.loadOrdenes();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadOrdenes();
    }
  }

  getEstadoColor(estado: OrdenEstado): string {
    const colors: Record<OrdenEstado, string> = {
      [OrdenEstado.PENDIENTE]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      [OrdenEstado.PLANEACION]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [OrdenEstado.EN_PROGRESO]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [OrdenEstado.EJECUCION]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      [OrdenEstado.COMPLETADA]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [OrdenEstado.CANCELADA]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      [OrdenEstado.ARCHIVADA]: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  }

  getPrioridadColor(prioridad: Prioridad): string {
    const colors: Record<Prioridad, string> = {
      [Prioridad.BAJA]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [Prioridad.MEDIA]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [Prioridad.ALTA]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      [Prioridad.URGENTE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
