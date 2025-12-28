import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MetricData {
  label: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="getCardClasses()">
      <!-- Icon + Label -->
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ metric.label }}</span>
        <div [ngClass]="getIconClasses()">
          {{ metric.icon || '📊' }}
        </div>
      </div>

      <!-- Value -->
      <div class="mb-3">
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ metric.value }}</p>
      </div>

      <!-- Trend -->
      <div *ngIf="metric.trend" [ngClass]="getTrendClasses()">
        <span class="font-medium text-sm">
          {{ metric.trend.direction === 'up' ? '↑' : '↓' }}
          {{ metric.trend.value }}%
        </span>
        <span class="text-xs ml-2">vs mes anterior</span>
      </div>
    </div>
  `,
  styles: []
})
export class MetricCardComponent {
  @Input() metric!: MetricData;

  getCardClasses(): string {
    return `
      bg-white dark:bg-gray-900
      rounded-xl
      border border-gray-200 dark:border-gray-800
      p-6
      shadow-sm hover:shadow-md
      transition-all duration-300
      cursor-pointer
    `;
  }

  getIconClasses(): string {
    const colorMap: Record<string, string> = {
      primary: 'bg-cermont-primary-100 dark:bg-cermont-primary-900/30 text-cermont-primary-600 dark:text-cermont-primary-400',
      success: 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400',
      warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
      error: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
      info: 'bg-info-100 dark:bg-info-900/30 text-info-600 dark:text-info-400',
    };

    const color = this.metric.color || 'primary';
    return `
      inline-flex items-center justify-center
      w-10 h-10
      rounded-lg
      text-lg
      ${colorMap[color]}
    `;
  }

  getTrendClasses(): string {
    const isPositive = this.metric.trend?.direction === 'up';
    return `
      inline-flex items-center
      text-sm font-medium
      ${isPositive
        ? 'text-success-600 dark:text-success-400'
        : 'text-error-600 dark:text-error-400'
      }
    `;
  }
}
