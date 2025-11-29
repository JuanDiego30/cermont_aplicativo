"use client";

import { useUsers, UserRole, type User } from "@/features/users";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const usersQuery = useUsers({ limit: 1000 });
  const users = usersQuery.data?.data ?? [];
  const isLoading = usersQuery.isLoading;
  const user = users.find((u: User) => u.id === userId);

  const getRoleLabel = (role?: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      technician: "Técnico",
      client: "Cliente",
      supervisor: "Supervisor",
    };
    return role ? roles[role] || role : "Usuario";
  };

  const getRoleColor = (role?: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      technician: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      client: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      supervisor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return role ? colors[role] || colors.client : colors.client;
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Usuario no encontrado
          </h1>
          <Link
            href="/users"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Volver a Usuarios
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            El usuario que buscas no existe o fue eliminado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xl font-bold text-brand-600 dark:text-brand-400">
            {getInitials(user.name)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/users"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Volver
          </Link>
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
            Editar
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información del Usuario
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre Completo</p>
                <p className="font-medium text-gray-900 dark:text-white">{user.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{user.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rol</p>
                <p className="font-medium text-gray-900 dark:text-white">{getRoleLabel(user.role)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                  user.active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {user.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creado</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString("es-ES") 
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Activity / Orders assigned */}
          {user.role === UserRole.TECHNICIAN && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Órdenes Asignadas
              </h3>
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  No hay órdenes asignadas actualmente
                </p>
                <Link
                  href={`/orders?technician=${userId}`}
                  className="inline-block mt-4 text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Ver historial de órdenes →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Estadísticas
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Órdenes completadas</span>
                <span className="font-bold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Órdenes en progreso</span>
                <span className="font-bold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Último acceso</span>
                <span className="text-gray-900 dark:text-white">-</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Acciones
            </h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                Editar Usuario
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Restablecer Contraseña
              </button>
              <button className="w-full px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                {user.active ? "Desactivar Usuario" : "Activar Usuario"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
