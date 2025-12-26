import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Panel de Administración</h1>
      <p class="text-gray-600">Bienvenido al panel de administración de Cermont.</p>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent {

}