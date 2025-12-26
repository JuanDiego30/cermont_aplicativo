import { Routes } from '@angular/router';

export const ORDENES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/ordenes-list/ordenes-list.component')
            .then(m => m.OrdenesListComponent)
    },
    {
        path: 'nueva',
        loadComponent: () => import('./components/orden-form/orden-form.component')
            .then(m => m.OrdenFormComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./components/orden-detail/orden-detail.component')
            .then(m => m.OrdenDetailComponent)
    },
    {
        path: ':id/editar',
        loadComponent: () => import('./components/orden-form/orden-form.component')
            .then(m => m.OrdenFormComponent)
    }
];
