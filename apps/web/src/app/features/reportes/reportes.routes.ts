import { Routes } from '@angular/router';

export const REPORTES_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'financieros',
        pathMatch: 'full'
    },
    {
        path: 'financieros',
        loadComponent: () => import('./pages/reportes-financieros.component')
            .then(m => m.ReportesFinancierosComponent),
        title: 'Reportes Financieros | Cermont'
    },
    {
        path: 'operativos',
        loadComponent: () => import('./pages/reportes-operativos.component')
            .then(m => m.ReportesOperativosComponent),
        title: 'Reportes Operativos | Cermont'
    }
];
