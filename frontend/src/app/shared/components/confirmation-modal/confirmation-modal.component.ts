import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [],
  template: `
    @if (show) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="onCancel()">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ title }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {{ message }}
            </p>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                {{ cancelText }}
              </button>
              <button
                type="button"
                (click)="onConfirm()"
                [class]="confirmButtonClass"
                class="px-4 py-2 text-sm font-medium text-white rounded-md">
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmationModalComponent {
  @Input() show = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Estás seguro de realizar esta acción?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() variant: 'danger' | 'warning' | 'info' = 'danger';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get confirmButtonClass(): string {
    const classes = {
      danger: 'bg-red-600 hover:bg-red-700',
      warning: 'bg-yellow-600 hover:bg-yellow-700',
      info: 'bg-blue-600 hover:bg-blue-700'
    };
    return classes[this.variant];
  }

  onConfirm(): void {
    this.confirmed.emit();
    this.show = false;
  }

  onCancel(): void {
    this.cancelled.emit();
    this.show = false;
  }
}

