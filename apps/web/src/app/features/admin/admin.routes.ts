import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/users-list/users-list.component')
              .then(m => m.UsersListComponent)
          },
          {
            path: 'nuevo',
            loadComponent: () => import('./components/user-form/user-form.component')
              .then(m => m.UserFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/user-detail/user-detail.component')
              .then(m => m.UserDetailComponent)
          },
          {
            path: ':id/editar',
            loadComponent: () => import('./components/user-form/user-form.component')
              .then(m => m.UserFormComponent)
          }
        ]
      },
      {
        path: 'roles',
        loadComponent: () => import('./components/roles-permissions/roles-permissions.component')
          .then(m => m.RolesPermissionsComponent),
        data: { roles: ['admin'] }
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./components/audit-logs/audit-logs.component')
          .then(m => m.AuditLogsComponent),
        data: { roles: ['admin'] }
      },
      {
        path: 'stats',
        loadComponent: () => import('./components/user-stats/user-stats.component')
          .then(m => m.UserStatsComponent),
        data: { roles: ['admin', 'supervisor'] }
      }
    ]
  }
];

