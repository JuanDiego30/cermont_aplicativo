"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/features/users";
import { SkeletonTable } from "@/components/common";
import Button from "@/shared/components/ui/button/Button";

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { label: string; color: string }> = {
    ADMIN: { label: "Administrador", color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
    SUPERVISOR: { label: "Supervisor", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" },
    TECHNICIAN: { label: "Técnico", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
    CLIENT: { label: "Cliente", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
    FIELD_OPERATOR: { label: "Operador de Campo", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" },
  };

  const config = roleConfig[role] || { label: role, color: "bg-gray-100 text-gray-700" };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Status badge
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}

const USERS_PER_PAGE = 10;

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const usersQuery = useUsers({ page, limit: USERS_PER_PAGE });
  
  // Extract data from the query response
  const users = usersQuery.data?.data ?? [];
  const totalPages = usersQuery.data?.pagination?.totalPages ?? 1;
  const isLoading = usersQuery.isLoading;

  const handleNewUser = () => {
    router.push("/users/new");
  };

  const handleRowClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los usuarios del sistema
          </p>
        </div>
        <Button onClick={handleNewUser} size="sm">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={USERS_PER_PAGE} columns={5} hasHeader />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                No hay usuarios registrados
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Crea el primer usuario para comenzar
              </p>
            </div>
            <Button onClick={handleNewUser} size="sm">
              Crear Usuario
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user.id)}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-semibold">
                            {getInitials(user.name || user.email)}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.name || "Sin nombre"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge isActive={user.active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Página <span className="font-medium text-gray-900 dark:text-white">{page}</span> de{" "}
                  <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
