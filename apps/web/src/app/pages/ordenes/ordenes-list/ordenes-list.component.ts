import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AdvancedTableComponent, TableColumn, TableAction } from '../../../shared/components/advanced-table/advanced-table.component';

interface Orden {
  id: string;
  numero: string;
  cliente: string;
  estado: 'completada' | 'pendiente' | 'en-progreso' | 'cancelada';
  monto: number;
  fecha: string;
  items: number;
}

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [FormsModule, AdvancedTableComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Órdenes</h1>
          <p class="text-gray-600 dark:text-gray-400">Gestiona y controla todas tus órdenes</p>
        </div>
        <button class="px-6 py-2.5 bg-cermont-primary-600 text-white rounded-lg hover:bg-cermont-primary-700 font-medium transition">
          + Nueva Orden
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-col md:flex-row gap-3">
        <select
          [(ngModel)]="filterEstado"
          (change)="onFilterChange()"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
        >
          <option value="">Todos los estados</option>
          <option value="completada">Completadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="en-progreso">En Progreso</option>
          <option value="cancelada">Canceladas</option>
        </select>

        <select
          [(ngModel)]="sortBy"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
        >
          <option value="fecha">Ordenar por fecha</option>
          <option value="monto">Ordenar por monto</option>
          <option value="cliente">Ordenar por cliente</option>
        </select>
      </div>

      <!-- Tabla Avanzada -->
      <app-advanced-table
        [columns]="columns"
        [data]="filteredOrdenes"
        [actions]="tableActions"
        [selectable]="true"
      ></app-advanced-table>
    </div>
  `,
  styles: []
})
export class OrdenesListComponent implements OnInit {
  columns: TableColumn[] = [
    { key: 'numero', label: 'Número de Orden', sortable: true },
    { key: 'cliente', label: 'Cliente', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'monto', label: 'Monto', sortable: true },
    { key: 'items', label: 'Items', sortable: false },
    { key: 'fecha', label: 'Fecha', sortable: true },
  ];

  ordenes: Orden[] = [];
  filteredOrdenes: Orden[] = [];
  filterEstado = '';
  sortBy = 'fecha';

  tableActions: TableAction[] = [
    {
      label: 'Ver',
      icon: '👁️',
      color: 'primary',
      onClick: (item) => this.verOrden(item),
    },
    {
      label: 'Editar',
      icon: '✏️',
      color: 'primary',
      onClick: (item) => this.editarOrden(item),
    },
    {
      label: 'Eliminar',
      icon: '🗑️',
      color: 'error',
      onClick: (item) => this.eliminarOrden(item),
    },
  ];

  ngOnInit() {
    this.loadOrdenes();
  }

  private loadOrdenes() {
    // Datos simulados - en producción venir de backend
    this.ordenes = [
      {
        id: '1',
        numero: '#ORD-001',
        cliente: 'Empresa XYZ',
        estado: 'completada',
        monto: 1250.50,
        fecha: '2025-12-28',
        items: 5,
      },
      {
        id: '2',
        numero: '#ORD-002',
        cliente: 'Cliente ABC',
        estado: 'pendiente',
        monto: 750.00,
        fecha: '2025-12-27',
        items: 3,
      },
      {
        id: '3',
        numero: '#ORD-003',
        cliente: 'Negocio 123',
        estado: 'en-progreso',
        monto: 2100.75,
        fecha: '2025-12-26',
        items: 8,
      },
      {
        id: '4',
        numero: '#ORD-004',
        cliente: 'Tienda del Centro',
        estado: 'completada',
        monto: 580.25,
        fecha: '2025-12-25',
        items: 2,
      },
      {
        id: '5',
        numero: '#ORD-005',
        cliente: 'Retail Store',
        estado: 'cancelada',
        monto: 1500.00,
        fecha: '2025-12-24',
        items: 6,
      },
    ];
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredOrdenes = this.ordenes.filter(orden => {
      if (this.filterEstado && orden.estado !== this.filterEstado) {
        return false;
      }
      return true;
    });

    // Sort
    this.filteredOrdenes.sort((a, b) => {
      switch (this.sortBy) {
        case 'monto':
          return b.monto - a.monto;
        case 'cliente':
          return a.cliente.localeCompare(b.cliente);
        case 'fecha':
        default:
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      }
    });
  }

  verOrden(orden: Orden) {
    // Implementar navegación a detalle
  }

  editarOrden(orden: Orden) {
    // Implementar edición
  }

  eliminarOrden(orden: Orden) {
    // Implementar eliminación con confirmación
  }
}
