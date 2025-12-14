'use client';

import useSWR from 'swr';
import { useMutation, useInvalidate } from './use-mutation';
import { usersService, ListUsersParams, CreateUserInput, UpdateUserInput } from '@/services/users.service';
import { swrKeys } from '@/lib/swr-config';

/**
 * Hook para listar usuarios
 */
export function useUsers(params?: ListUsersParams) {
  return useSWR(
    swrKeys.users.list(params),
    () => usersService.list(params),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener un usuario específico
 */
export function useUser(id: string) {
  return useSWR(
    id ? swrKeys.users.detail(id) : null,
    () => usersService.getById(id),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para obtener técnicos disponibles
 */
export function useTechnicians() {
  return useSWR(
    swrKeys.users.technicians(),
    () => usersService.getTechnicians(),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook para crear usuario
 */
export function useCreateUser() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (data: CreateUserInput) => usersService.create(data),
    onSuccess: () => {
      invalidate('users');
    },
  });
}

/**
 * Hook para actualizar usuario
 */
export function useUpdateUser() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersService.update(id, data),
    onSuccess: () => {
      invalidate('users');
    },
  });
}

/**
 * Hook para eliminar usuario
 */
export function useDeleteUser() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      invalidate('users');
    },
  });
}

/**
 * Hook para activar/desactivar usuario
 */
export function useToggleUserActive() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      usersService.toggleActive(id, active),
    onSuccess: () => {
      invalidate('users');
    },
  });
}

/**
 * Hook para cambiar rol de usuario
 */
import type { UserRole } from '@/types/user';

// ... (rest of imports)

// ...

/**
 * Hook para cambiar rol de usuario
 */
export function useChangeUserRole() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersService.changeRole(id, role),
    onSuccess: () => {
      invalidate('users');
    },
  });
}

// Query keys for external use
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ListUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  technicians: () => [...userKeys.all, 'technicians'] as const,
};
