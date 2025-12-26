import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';

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
        redirectTo: '/dashboard/ecommerce',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then(m => m.dashboardRoutes),
      },
      {
        path: 'ordenes',
        loadChildren: () => import('./features/ordenes/ordenes.routes')
          .then(m => m.ordenesRoutes),
      },
      {
        path: 'ecommerce',
        component: EcommerceComponent,
        title: 'E-Commerce | Cermont',
      },
      {
        path: 'calendar',
        component: CalenderComponent,
        title: 'Calendario | Cermont'
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Perfil | Cermont'
      },
      {
        path: 'form-elements',
        component: FormElementsComponent,
        title: 'Formularios | Cermont'
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'Tablas | Cermont'
      },
      {
        path: 'blank',
        component: BlankComponent,
        title: 'Página en Blanco | Cermont'
      },
      {
        path: 'invoice',
        component: InvoicesComponent,
        title: 'Facturas | Cermont'
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Gráfico de Líneas | Cermont'
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Gráfico de Barras | Cermont'
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        title: 'Alertas | Cermont'
      },
      {
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'Avatares | Cermont'
      },
      {
        path: 'badge',
        component: BadgesComponent,
        title: 'Insignias | Cermont'
      },
      {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'Botones | Cermont'
      },
      {
        path: 'images',
        component: ImagesComponent,
        title: 'Imágenes | Cermont'
      },
      {
        path: 'videos',
        component: VideosComponent,
        title: 'Videos | Cermont'
      },
    ]
  },
  // auth pages (lazy loading)
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth-pages/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // solo para admin (ejemplo)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página No Encontrada | Cermont'
  },
];
