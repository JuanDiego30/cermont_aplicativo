import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from './toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-9999 space-y-3">
      @for (toast of toasts; track toast.id) {
        <div
          [@fadeInOut]
          [ngClass]="getToastClasses(toast.type)"
          class="max-w-sm p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slideUp"
        >
          <!-- Icon -->
          <span class="text-xl">{{ getIcon(toast.type) }}</span>

          <!-- Message -->
          <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>

          <!-- Close Button -->
          <button
            (click)="removeToast(toast.id)"
            class="text-2xl hover:opacity-70 transition w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
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

    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private readonly destroy$ = new Subject<void>();

  private readonly toastService = inject(ToastService);

  ngOnInit() {
    this.toastService.toasts
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        this.toasts = toasts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeToast(id: string) {
    this.toastService.remove(id);
  }

  getToastClasses(type: string): string {
    const classes: Record<string, string> = {
      success: 'bg-success-50 dark:bg-success-900/30 text-success-800 dark:text-success-100 border border-success-200 dark:border-success-800',
      error: 'bg-error-50 dark:bg-error-900/30 text-error-800 dark:text-error-100 border border-error-200 dark:border-error-800',
      warning: 'bg-warning-50 dark:bg-warning-900/30 text-warning-800 dark:text-warning-100 border border-warning-200 dark:border-warning-800',
      info: 'bg-info-50 dark:bg-info-900/30 text-info-800 dark:text-info-100 border border-info-200 dark:border-info-800',
    };
    return classes[type] || classes['info'];
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '×',
      warning: '⚠️',
      info: 'ⓘ',
    };
    return icons[type] || 'ⓘ';
  }
}
