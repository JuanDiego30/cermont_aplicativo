// app/users/page.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
// Universal Components
import { PageHeader } from '@/components/patterns/PageHeader';
import { InfoBox } from '@/components/patterns/InfoBox';
import { FeatureCard } from '@/components/patterns/FeatureCard';

// Icons
import { Users, Construction, Shield, UserPlus, Activity } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================
const UPCOMING_FEATURES = [
  {
    title: 'Control de Accesos',
    description: 'Sistema de roles y permisos basado en políticas RBAC',
    icon: <Shield className="h-8 w-8" />,
  },
  {
    title: 'Gestión de Usuarios',
    description: 'CRUD completo de usuarios con validación y seguridad',
    icon: <UserPlus className="h-8 w-8" />,
  },
  {
    title: 'Auditoría Completa',
    description: 'Registro de actividad y trazabilidad de todas las acciones',
    icon: <Activity className="h-8 w-8" />,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function UsersPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ========================================
          SECTION: Page Header
      ========================================== */}
      <PageHeader
        icon={Users}
        title="Gestión de Usuarios"
        description="Control de accesos, roles y permisos del sistema"
        badge={{ text: 'En Desarrollo', variant: 'warning' }}
      />

      {/* ========================================
          SECTION: Under Construction Notice
      ========================================== */}
      <div className="rounded-3xl border-2 border-dashed border-warning-300 bg-gradient-to-br from-warning-50 to-warning-100 p-12 text-center shadow-xl dark:border-warning-800 dark:from-warning-950 dark:to-warning-900">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-warning-100 shadow-inner dark:bg-warning-900">
          <Construction className="h-12 w-12 text-warning-600 dark:text-warning-400" />
        </div>

        <h2 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Módulo en Construcción
        </h2>

        <p className="mx-auto mb-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          Este módulo permitirá gestionar usuarios, roles y permisos del sistema de forma integral.
          Será implementado en la próxima fase del desarrollo.
        </p>

        <div className="mx-auto max-w-xl rounded-2xl border-2 border-warning-200 bg-white p-6 dark:border-warning-800 dark:bg-neutral-800">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-warning-500"></div>
            <span className="text-sm font-bold uppercase tracking-wider text-warning-700 dark:text-warning-400">
              Próximamente
            </span>
            <div className="h-2 w-2 animate-pulse rounded-full bg-warning-500"></div>
          </div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Sistema completo de gestión de roles RBAC, creación de usuarios con validación,
            asignación de permisos granulares y auditoría de accesos
          </p>
        </div>
      </div>

      {/* ========================================
          SECTION: Info Box
      ========================================== */}
      <InfoBox
        title="Estado Actual del Backend"
        icon={Shield}
        variant="info"
      >
        <p className="mb-3">
          El backend ya implementa las rutas necesarias para la gestión de usuarios:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-info-500"></div>
            <span>
              <code className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-xs dark:bg-neutral-700">
                POST /api/users
              </code>{' '}
              - Creación de usuarios (requiere política{' '}
              <code className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-xs dark:bg-neutral-700">
                USERSCREATE
              </code>
              )
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-info-500"></div>
            <span>
              <code className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-xs dark:bg-neutral-700">
                GET /api/users
              </code>{' '}
              - Listado de usuarios con paginación
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-info-500"></div>
            <span>Sistema de autenticación JWT con refresh tokens</span>
          </li>
        </ul>
        <p className="mt-4 rounded-xl border-2 border-info-200 bg-info-50 p-4 text-sm font-medium text-info-700 dark:border-info-800 dark:bg-info-950 dark:text-info-300">
          La interfaz de usuario para administrar estos recursos será implementada próximamente.
        </p>
      </InfoBox>

      {/* ========================================
          SECTION: Upcoming Features
      ========================================== */}
      <div>
        <h3 className="mb-6 text-xl font-bold text-neutral-900 dark:text-neutral-50">
          Funcionalidades Planificadas
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
          {UPCOMING_FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



