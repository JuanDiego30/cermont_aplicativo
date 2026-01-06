import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/dashboard-main.component')
            .then(m => m.DashboardMainComponent),
        title: 'Dashboard | Cermont'
    },
    {
        path: 'ordenes',
        loadChildren: () => import('../ordenes/ordenes.routes')
            .then(m => m.ORDENES_ROUTES),
    },
    {
        path: 'hes',
        loadChildren: () => import('../hes/hes.routes')
            .then(m => m.HES_ROUTES),
    },
    {
        path: 'calendario',
        loadChildren: () => import('../calendario/calendario.routes')
            .then(m => m.CALENDARIO_ROUTES),
    },
    {
        path: 'perfil',
        loadComponent: () => import('../perfil/perfil.component')
            .then(m => m.PerfilComponent),
        title: 'Mi Perfil | Cermont'
    },
    {
        path: 'reportes',
        loadChildren: () => import('../reportes/reportes.routes')
            .then(m => m.REPORTES_ROUTES),
    },
    {
        path: 'configuracion',
        loadChildren: () => import('../configuracion/configuracion.routes')
            .then(m => m.CONFIGURACION_ROUTES),
    },
];
