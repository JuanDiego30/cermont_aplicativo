import { Routes } from '@angular/router';

export const KITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/kits-list/kits-list.component')
      .then(m => m.KitsListComponent),
    title: 'Kits | Cermont'
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./components/kit-form/kit-form.component')
      .then(m => m.KitFormComponent),
    title: 'Nuevo Kit | Cermont'
  },
  {
    path: ':id',
    loadComponent: () => import('./components/kit-detail/kit-detail.component')
      .then(m => m.KitDetailComponent),
    title: 'Detalle de Kit | Cermont'
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./components/kit-form/kit-form.component')
      .then(m => m.KitFormComponent),
    title: 'Editar Kit | Cermont'
  }
];
