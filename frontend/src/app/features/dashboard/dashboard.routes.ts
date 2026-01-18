import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard-main.component').then(m => m.DashboardMainComponent),
    title: 'Dashboard | Cermont',
  },
];
