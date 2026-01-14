import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  template: `
    <div class="flex items-center justify-center" [class]="containerClass">
      <div class="relative">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"
             [class]="spinnerClass"></div>
        @if (message) {
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">{{ message }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullScreen = false;

  get containerClass(): string {
    if (this.fullScreen) {
      return 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-50';
    }
    return 'p-8';
  }

  get spinnerClass(): string {
    const sizes = {
      sm: 'w-6 h-6 border-2',
      md: 'w-12 h-12 border-4',
      lg: 'w-16 h-16 border-4'
    };
    return sizes[this.size];
  }
}

