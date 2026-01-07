import { Routes } from '@angular/router';

export const MANTENIMIENTOS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/mantenimientos-list/mantenimientos-list.component')
            .then(m => m.MantenimientosListComponent),
        title: 'Mantenimientos | Cermont'
    },
    {
        path: 'nuevo',
        loadComponent: () => import('./components/mantenimiento-form/mantenimiento-form.component')
            .then(m => m.MantenimientoFormComponent),
        title: 'Nuevo Mantenimiento | Cermont'
    },
    {
        path: 'proximos',
        loadComponent: () => import('./components/mantenimientos-proximos/mantenimientos-proximos.component')
            .then(m => m.MantenimientosProximosComponent),
        title: 'Próximos Mantenimientos | Cermont'
    },
    {
        path: ':id',
        loadComponent: () => import('./components/mantenimiento-detail/mantenimiento-detail.component')
            .then(m => m.MantenimientoDetailComponent),
        title: 'Detalle de Mantenimiento | Cermont'
    },
    {
        path: ':id/editar',
        loadComponent: () => import('./components/mantenimiento-form/mantenimiento-form.component')
            .then(m => m.MantenimientoFormComponent),
        title: 'Editar Mantenimiento | Cermont'
    }
];
