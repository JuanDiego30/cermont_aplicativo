import { Component, Input, Output, EventEmitter, TemplateRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  icon?: string;
  action: (row: any) => void;
  variant?: 'primary' | 'danger' | 'warning' | 'info';
  condition?: (row: any) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="overflow-hidden bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
      @if (loading()) {
        <div class="flex items-center justify-center p-12">
          <app-loading-spinner [size]="'md'" [message]="loadingMessage"></app-loading-spinner>
        </div>
      } @else if (data().length === 0) {
        <div class="p-12 text-center">
          <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">{{ emptyMessage }}</h3>
          @if (emptySubmessage) {
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ emptySubmessage }}</p>
          }
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                @for (column of columns; track column.key) {
                  <th 
                    [class]="getHeaderClass(column)"
                    [style.width]="column.width"
                    (click)="onSort(column)"
                    [class.cursor-pointer]="column.sortable">
                    <div class="flex items-center gap-2">
                      <span>{{ column.label }}</span>
                      @if (column.sortable) {
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          @if (sortColumn() === column.key) {
                            @if (sortDirection() === 'asc') {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                            } @else {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            }
                          } @else {
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                          }
                        </svg>
                      }
                    </div>
                  </th>
                }
                @if (actions && actions.length > 0) {
                  <th class="px-6 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">Acciones</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              @for (row of sortedData(); track trackByFn(row)) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  @for (column of columns; track column.key) {
                    <td [class]="getCellClass(column)" [style.width]="column.width">
                      @if (customCellTemplates && customCellTemplates[column.key]) {
                        <ng-container *ngTemplateOutlet="customCellTemplates[column.key]; context: { $implicit: row, column: column }"></ng-container>
                      } @else {
                        {{ getCellValue(row, column.key) }}
                      }
                    </td>
                  }
                  @if (actions && actions.length > 0) {
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        @for (action of getRowActions(row); track action.label) {
                          <button
                            (click)="action.action(row)"
                            [class]="getActionButtonClass(action.variant || 'primary')"
                            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors">
                            @if (action.icon) {
                              <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="action.icon"/>
                              </svg>
                            }
                            {{ action.label }}
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

        <!-- Pagination -->
        @if (showPagination && totalPages() > 1) {
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {{ (currentPage() - 1) * pageSize + 1 }} - {{ Math.min(currentPage() * pageSize, total()) }} de {{ total() }}
            </div>
            <div class="flex gap-2">
              <button 
                (click)="goToPage(currentPage() - 1)" 
                [disabled]="currentPage() === 1"
                class="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                Anterior
              </button>
              <span class="px-3 py-1.5 text-sm">
                Página {{ currentPage() }} de {{ totalPages() }}
              </span>
              <button 
                (click)="goToPage(currentPage() + 1)" 
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                Siguiente
              </button>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class DataTableComponent<T = any> {
  @Input() columns: TableColumn[] = [];
  @Input() data = signal<T[]>([]);
  @Input() loading = signal(false);
  @Input() loadingMessage = 'Cargando datos...';
  @Input() emptyMessage = 'No hay datos disponibles';
  @Input() emptySubmessage?: string;
  @Input() actions?: TableAction[];
  @Input() customCellTemplates?: Record<string, TemplateRef<any>>;
  @Input() trackByFn: (item: T) => any = (item: any) => item.id || item;
  @Input() showPagination = true;
  @Input() pageSize = 10;
  @Input() total = signal(0);
  @Input() currentPage = signal(1);
  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();

  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  Math = Math;

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize));

  sortedData = computed(() => {
    const data = this.data();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    if (!column) return data;

    return [...data].sort((a, b) => {
      const aVal = this.getCellValue(a, column);
      const bVal = this.getCellValue(b, column);

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  getCellValue(row: T, key: string): any {
    const keys = key.split('.');
    let value: any = row;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    return value;
  }

  getHeaderClass(column: TableColumn): string {
    const base = 'px-6 py-4 text-xs font-medium text-gray-500 uppercase dark:text-gray-300';
    const align = column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';
    return `${base} ${align}`;
  }

  getCellClass(column: TableColumn): string {
    const base = 'px-6 py-4 text-sm text-gray-900 dark:text-white';
    const align = column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left';
    return `${base} ${align}`;
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn() === column.key) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column.key);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({ column: column.key, direction: this.sortDirection() });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.pageChange.emit(page);
    }
  }

  getRowActions(row: T): TableAction[] {
    if (!this.actions) return [];
    return this.actions.filter(action => !action.condition || action.condition(row));
  }

  getActionButtonClass(variant: 'primary' | 'danger' | 'warning' | 'info'): string {
    const classes = {
      primary: 'bg-brand-500 text-white hover:bg-brand-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
      info: 'bg-blue-500 text-white hover:bg-blue-600'
    };
    return classes[variant];
  }
}

