'use client';

import { useUsers, useToggleUserStatus } from '@/lib/hooks/useUsers';
import { HeroStats } from '@/components/patterns/HeroStats';
import { FormCard } from '@/components/patterns/FormCard';
import { LoadingState } from '@/components/patterns/LoadingState';
import { ErrorState } from '@/components/patterns/ErrorState';
import { Users, UserPlus, Search, Filter, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { UserRole } from '@/lib/types/user';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  const { data: usersResponse, isLoading, isError } = useUsers({ search: searchTerm, role: roleFilter });
  const toggleStatus = useToggleUserStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState
          message="Cargando usuarios..."
          subMessage="Obteniendo listado de usuarios del sistema"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title="Error al cargar usuarios"
          message="No se pudo conectar con el servidor. Por favor intenta nuevamente."
          action={{
            label: 'Reintentar',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  const users = usersResponse?.data || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <HeroStats
        title="Gestión de Usuarios"
        description="Control de accesos, roles y permisos del sistema."
        badge={{
          icon: Users,
          text: 'Administración',
        }}
        kpis={[
          { title: 'Total Usuarios', value: (usersResponse?.pagination.total || 0).toString(), hint: 'Registrados' },
          { title: 'Activos', value: (users.filter(u => u.active).length).toString(), hint: 'En línea' },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-neutral-800 dark:bg-neutral-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="primary" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <FormCard title="Usuarios del Sistema" description="Listado completo de usuarios con acceso al aplicativo">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">MFA</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        <span className="text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.active
                        ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.mfaEnabled ? (
                      <span className="text-success-600 dark:text-success-400">
                        <CheckCircle className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="text-neutral-400">
                        <XCircle className="h-4 w-4" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus.mutate({ id: user.id, active: !user.active })}
                      isLoading={toggleStatus.isPending}
                    >
                      {user.active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-neutral-500">No se encontraron usuarios.</p>
          </div>
        )}
      </FormCard>
    </div>
  );
}
