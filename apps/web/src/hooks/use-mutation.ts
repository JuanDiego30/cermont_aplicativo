/**
 * ARCHIVO: use-mutation.ts
 * FUNCION: Hook de mutación compatible con SWR para operaciones CRUD
 * IMPLEMENTACION: Emula API de React Query, gestiona estado loading/error/success e invalida cache SWR
 * DEPENDENCIAS: React hooks, SWR (useSWRConfig)
 * EXPORTS: useMutation, useInvalidate
 */
'use client';
import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';

interface MutationState<TData> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface MutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  invalidateKeys?: string[];
}

interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

/**
 * Hook para mutaciones compatible con la API de React Query
 * 
 * @example
 * const { mutate, isLoading } = useMutation({
 *   mutationFn: (data) => api.create(data),
 *   onSuccess: () => toast.success('Creado'),
 *   invalidateKeys: ['items'],
 * });
 */
export function useMutation<TData = unknown, TVariables = unknown>(
  options: MutationOptions<TData, TVariables>
): MutationResult<TData, TVariables> {
  const { mutate: globalMutate } = useSWRConfig();
  const [state, setState] = useState<MutationState<TData>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      }));

      try {
        const data = await options.mutationFn(variables);

        setState({
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });

        // Invalidar keys si se especificaron
        if (options.invalidateKeys) {
          await Promise.all(
            options.invalidateKeys.map((key) =>
              globalMutate(
                (k) => typeof k === 'string' && k.startsWith(key),
                undefined,
                { revalidate: true }
              )
            )
          );
        }

        // Callback onSuccess
        if (options.onSuccess) {
          await options.onSuccess(data, variables);
        }

        // Callback onSettled
        if (options.onSettled) {
          options.onSettled(data, null, variables);
        }

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        setState({
          data: null,
          error,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });

        // Callback onError
        if (options.onError) {
          options.onError(error, variables);
        }

        // Callback onSettled
        if (options.onSettled) {
          options.onSettled(null, error, variables);
        }

        throw error;
      }
    },
    [options, globalMutate]
  );

  const mutate = useCallback(
    (variables: TVariables): Promise<TData> => {
      return mutateAsync(variables).catch((error) => {
        // Error ya manejado en mutateAsync, re-throw para el caller
        throw error;
      });
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync,
    reset,
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    isPending: state.isLoading,
    isSuccess: state.isSuccess,
    isError: state.isError,
    isIdle: !state.isLoading && !state.isSuccess && !state.isError,
  };
}

/**
 * Hook para invalidar keys de SWR
 */
export function useInvalidate() {
  const { mutate } = useSWRConfig();

  return useCallback(
    (keyPattern: string) => {
      return mutate(
        (key) => typeof key === 'string' && key.startsWith(keyPattern),
        undefined,
        { revalidate: true }
      );
    },
    [mutate]
  );
}
