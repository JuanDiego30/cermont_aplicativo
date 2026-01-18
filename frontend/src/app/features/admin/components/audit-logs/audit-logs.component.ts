import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Logs de Auditoría</h1>
      <div class="card">
        <p class="text-gray-600 dark:text-gray-400">Componente en desarrollo</p>
      </div>
    </div>
  `,
})
export class AuditLogsComponent {}
