import { Routes } from '@angular/router';

export const ordenesRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/ordenes-list.component')
            .then(m => m.OrdenesListComponent),
        title: 'Órdenes | Cermont'
    },
    // Add more routes as needed:
    // {
    //   path: 'create',
    //   loadComponent: () => import('./components/orden-form.component')
    //     .then(m => m.OrdenFormComponent),
    //   title: 'Nueva Orden | Cermont'
    // },
    // {
    //   path: ':id',
    //   loadComponent: () => import('./components/orden-detail.component')
    //     .then(m => m.OrdenDetailComponent),
    //   title: 'Detalle Orden | Cermont'
    // },
];
