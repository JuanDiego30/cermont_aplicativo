import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalConfig {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  backdrop?: boolean;
}

export interface ModalAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onBackdropClick()">
      <div 
        class="modal-content"
        [ngClass]="getSizeClass()"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="modal-header border-b border-gray-200 dark:border-gray-800 flex items-center justify-between p-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ config.title }}</h2>
            <p *ngIf="config.subtitle" class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ config.subtitle }}</p>
          </div>
          <button 
            *ngIf="config.closeButton !== false"
            (click)="close()"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ×
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div 
          *ngIf="actions.length"
          class="modal-footer border-t border-gray-200 dark:border-gray-800 p-6 flex gap-3 justify-end"
        >
          <button
            *ngFor="let action of actions"
            (click)="action.onClick()"
            [disabled]="action.disabled || action.loading"
            [ngClass]="getActionClasses(action)"
          >
            <span *ngIf="!action.loading">{{ action.label }}</span>
            <span *ngIf="action.loading" class="inline-flex items-center gap-2">
              <span class="spinner"></span>
              Procesando...
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
      position: relative;
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03);
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    :host ::ng-deep .dark .modal-content {
      background-color: #111827;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ModalComponent {
  @Input() config: ModalConfig = { title: 'Modal' };
  @Input() actions: ModalAction[] = [];
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  getSizeClass(): string {
    const sizes: Record<string, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };
    return sizes[this.config.size || 'md'];
  }

  getActionClasses(action: ModalAction): string {
    const baseClasses = `px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`;
    
    const typeClasses: Record<string, string> = {
      primary: `bg-cermont-primary-600 text-white hover:bg-cermont-primary-700`,
      secondary: `bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700`,
      danger: `bg-error-600 text-white hover:bg-error-700`,
    };

    return `${baseClasses} ${typeClasses[action.type]}`;
  }

  onBackdropClick() {
    if (this.config.backdrop !== false) {
      this.close();
    }
  }

  close() {
    this.closeEvent.emit();
    this.isOpen = false;
  }
}
