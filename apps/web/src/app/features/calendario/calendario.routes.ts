import { Routes } from '@angular/router';

export const CALENDARIO_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/calendario-home.component')
            .then(m => m.CalendarioHomeComponent),
        title: 'Calendario | Cermont'
    }
];
