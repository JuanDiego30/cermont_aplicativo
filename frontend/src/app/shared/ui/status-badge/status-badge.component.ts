import { Component, Input } from '@angular/core';

export type StatusType = 'orden' | 'mantenimiento' | 'general';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  template: `
    <span
      [class]="badgeClass"
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    >
      {{ label || status }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() status!: string;
  @Input() label?: string;
  @Input() type: StatusType = 'general';

  get badgeClass(): string {
    const statusLower = this.status.toLowerCase();

    // Mapeo de estados de órdenes
    if (
      this.type === 'orden' ||
      statusLower.includes('planeacion') ||
      statusLower.includes('ejecucion') ||
      statusLower.includes('pausada') ||
      statusLower.includes('completada') ||
      statusLower.includes('cancelada')
    ) {
      return this.getOrdenBadgeClass(statusLower);
    }

    // Mapeo de estados de mantenimientos
    if (
      this.type === 'mantenimiento' ||
      statusLower.includes('programado') ||
      statusLower.includes('en_ejecucion') ||
      statusLower.includes('completado') ||
      statusLower.includes('vencido')
    ) {
      return this.getMantenimientoBadgeClass(statusLower);
    }

    // Mapeo general
    return this.getGeneralBadgeClass(statusLower);
  }

  private getOrdenBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      planeacion: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      ejecucion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      pausada: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      completada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }

  private getMantenimientoBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      programado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      en_ejecucion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      completado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      vencido: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }

  private getGeneralBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      activo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactivo: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      disponible: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      ocupado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      no_disponible: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}
