import { Routes } from '@angular/router';

export const HES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/hes-home.component')
            .then(m => m.HesHomeComponent),
        title: 'HES | Cermont'
    },
    {
        path: 'nueva',
        loadComponent: () => import('./components/hes-form/hes-form.component')
            .then(m => m.HesFormComponent),
        title: 'Nueva HES | Cermont'
    }
];
