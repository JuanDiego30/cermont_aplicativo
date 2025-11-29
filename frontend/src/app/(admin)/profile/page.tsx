"use client";

import { useAuth } from "@/features/auth";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role?: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      technician: "Técnico",
      client: "Cliente",
      supervisor: "Supervisor",
    };
    return role ? roles[role] || role : "Usuario";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tu información personal
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Cover & Avatar */}
        <div className="relative h-32 bg-gradient-to-r from-brand-500 to-brand-600 rounded-t-xl">
          <div className="absolute -bottom-12 left-6">
            <div className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-2xl font-bold text-brand-600 dark:text-brand-400">
              {getInitials(user?.name)}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="pt-16 pb-6 px-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.name || "Usuario"}
            </h2>
            <span className="px-2 py-1 text-xs font-medium text-brand-700 bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 rounded">
              {getRoleLabel(user?.role)}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información Personal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nombre Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user?.name || "-"}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{user?.email || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  placeholder="+51 999 999 999"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">-</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuración de Cuenta
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Rol
              </label>
              <p className="text-gray-900 dark:text-white">{getRoleLabel(user?.role)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Estado
              </label>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded">
                Activo
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Último acceso
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date().toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Seguridad
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Contraseña</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Última actualización hace 30 días
              </p>
            </div>
            <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cambiar Contraseña
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Autenticación de dos factores</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Añade una capa extra de seguridad
              </p>
            </div>
            <button className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
              Activar
            </button>
          </div>
        </div>
      </div>

      {/* Save Button (when editing) */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
}
