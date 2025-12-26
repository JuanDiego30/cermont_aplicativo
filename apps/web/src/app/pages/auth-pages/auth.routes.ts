import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },
  {
    path: 'signin',
    loadComponent: () => import('./sign-in/sign-in.component').then(m => m.SignInComponent),
    title: 'Iniciar Sesión | Cermont'
  },
  {
    path: 'signup',
    loadComponent: () => import('./sign-up/sign-up.component').then(m => m.SignUpComponent),
    title: 'Registrarse | Cermont'
  }
];