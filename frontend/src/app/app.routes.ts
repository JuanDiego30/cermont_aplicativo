import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { NotFoundComponent } from './shared/pages/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';


export const routes: Routes = [
  // Landing page (public)
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component')
      .then(m => m.LandingComponent),
    title: 'CERMONT S.A.S - Soluciones en Refrigeración Industrial'
  },
  {
    path: 'dashboard',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then(m => m.dashboardRoutes),
      },
      {
        path: 'ordenes',
        loadChildren: () => import('./features/ordenes/ordenes.routes')
          .then(m => m.ORDENES_ROUTES),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
        title: 'Mi Perfil | Cermont'
      },
    ]
  },
  // Rutas públicas de autenticación
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Módulo de Administración (COMPLETO)
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página No Encontrada | Cermont'
  },
];
