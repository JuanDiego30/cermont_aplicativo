import { Routes } from '@angular/router';

export const HES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/hes-home.component')
            .then(m => m.HesHomeComponent),
        title: 'HES | Cermont'
    }
];
