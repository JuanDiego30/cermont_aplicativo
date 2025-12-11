'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, ListUsersParams, CreateUserInput, UpdateUserInput } from '@/services/users.service';
import type { UserRole } from '@/types/user';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ListUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  technicians: () => [...userKeys.all, 'technicians'] as const,
};

/**
 * Hook para listar usuarios
 */
export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersService.list(params),
  });
}

/**
 * Hook para obtener un usuario específico
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener técnicos disponibles
 */
export function useTechnicians() {
  return useQuery({
    queryKey: userKeys.technicians(),
    queryFn: () => usersService.getTechnicians(),
  });
}

/**
 * Hook para crear usuario
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar usuario
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => 
      usersService.update(id, data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
    },
  });
}

/**
 * Hook para eliminar usuario
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook para activar/desactivar usuario
 */
export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      usersService.toggleActive(id, active),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
    },
  });
}

/**
 * Hook para cambiar rol de usuario
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => 
      usersService.changeRole(id, role),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
    },
  });
}
