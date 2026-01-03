import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface TableAction {
  label: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  onClick: (item: any) => void;
}

@Component({
  selector: 'app-advanced-table',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header con búsqueda y filtros -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1">
          <input
            type="text"
            placeholder="Buscar..."
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cermont-primary-500"
          />
        </div>
        <slot name="filters"></slot>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <tr>
              @if (selectable) {
                <th class="px-4 py-3 text-left">
                  <input type="checkbox" class="checkbox" />
                </th>
              }
              @for (col of columns; track col.key) {
                <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                  <div class="flex items-center justify-between">
                    <span>{{ col.label }}</span>
                    @if (col.sortable) {
                      <span class="cursor-pointer text-gray-500">↕</span>
                    }
                  </div>
                </th>
              }
              @if (actions.length) {
                <th class="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Acciones</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (item of filteredData; track $index) {
              <tr class="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                @if (selectable) {
                  <td class="px-4 py-3">
                    <input type="checkbox" class="checkbox" />
                  </td>
                }
                @for (col of columns; track col.key) {
                  <td class="px-4 py-3 text-gray-900 dark:text-white">
                    {{ getValueByKey(item, col.key) }}
                  </td>
                }
                @if (actions.length) {
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      @for (action of actions; track action.label) {
                        <button
                          (click)="action.onClick(item)"
                          [title]="action.label"
                          class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm"
                        >
                          {{ action.icon || action.label }}
                        </button>
                      }
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Mostrando {{ filteredData.length }} de {{ data.length }} resultados</span>
        <div class="flex gap-2">
          <button class="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50" [disabled]="currentPage === 1">
            ← Anterior
          </button>
          <span class="px-3 py-1">Página {{ currentPage }}</span>
          <button class="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdvancedTableComponent implements OnInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() selectable = false;
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<any>();

  searchTerm = '';
  filteredData: any[] = [];
  currentPage = 1;

  ngOnInit() {
    this.applyFilters();
  }

  ngOnChanges(_changes: SimpleChanges) {
    this.applyFilters();
  }

  onSearch() {
    this.searchChange.emit(this.searchTerm);
    this.applyFilters();
  }

  applyFilters() {
    this.filteredData = this.data.filter(item =>
      this.columns.some(col =>
        String(this.getValueByKey(item, col.key))
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      )
    );
  }

  getValueByKey(obj: any, key: string): any {
    return key.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
