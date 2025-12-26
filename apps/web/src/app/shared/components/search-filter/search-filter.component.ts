import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange';
  placeholder?: string;
  options?: FilterOption[];
  value?: any;
}

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700">
      <div class="grid gap-4" [class]="gridClass">
        @for (field of fields; track field.key) {
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ field.label }}
            </label>
            
            @switch (field.type) {
              @case ('text') {
                <input
                  type="text"
                  [placeholder]="field.placeholder || 'Buscar...'"
                  [value]="field.value || ''"
                  (input)="onFieldChange(field.key, $any($event.target).value)"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              }
              
              @case ('select') {
                <select
                  [value]="field.value || ''"
                  (change)="onFieldChange(field.key, $any($event.target).value)"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">{{ field.placeholder || 'Todos' }}</option>
                  @for (option of field.options; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
              }
              
              @case ('date') {
                <input
                  type="date"
                  [value]="field.value || ''"
                  (change)="onFieldChange(field.key, $any($event.target).value)"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              }
              
              @case ('daterange') {
                <div class="flex gap-2">
                  <input
                    type="date"
                    [value]="field.value?.from || ''"
                    (change)="onDateRangeChange(field.key, 'from', $any($event.target).value)"
                    placeholder="Desde"
                    class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <input
                    type="date"
                    [value]="field.value?.to || ''"
                    (change)="onDateRangeChange(field.key, 'to', $any($event.target).value)"
                    placeholder="Hasta"
                    class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>
              }
            }
          </div>
        }
        
        @if (showActions) {
          <div class="flex items-end gap-2">
            <button
              (click)="onClear()"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
              Limpiar
            </button>
            <button
              (click)="onApply()"
              class="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600">
              Aplicar
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class SearchFilterComponent {
  @Input() fields: FilterField[] = [];
  @Input() columns: number = 4;
  @Input() showActions = false;
  @Output() filterChange = new EventEmitter<Record<string, any>>();
  @Output() clear = new EventEmitter<void>();
  @Output() apply = new EventEmitter<Record<string, any>>();

  filterValues = signal<Record<string, any>>({});

  get gridClass(): string {
    const cols = {
      1: 'grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      5: 'md:grid-cols-5',
      6: 'md:grid-cols-6'
    };
    return `grid ${cols[this.columns as keyof typeof cols] || cols[4]}`;
  }

  onFieldChange(key: string, value: any): void {
    const current = this.filterValues();
    this.filterValues.set({ ...current, [key]: value || undefined });
    
    if (!this.showActions) {
      this.filterChange.emit(this.filterValues());
    }
  }

  onDateRangeChange(key: string, type: 'from' | 'to', value: string): void {
    const current = this.filterValues();
    const range = current[key] || {};
    this.filterValues.set({
      ...current,
      [key]: { ...range, [type]: value || undefined }
    });
    
    if (!this.showActions) {
      this.filterChange.emit(this.filterValues());
    }
  }

  onClear(): void {
    this.filterValues.set({});
    this.clear.emit();
    if (!this.showActions) {
      this.filterChange.emit({});
    }
  }

  onApply(): void {
    this.apply.emit(this.filterValues());
  }
}

