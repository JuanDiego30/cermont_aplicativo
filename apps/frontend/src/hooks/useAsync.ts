// Hook personalizado para manejar el estado de carga y error
import { useState, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: unknown[]) => Promise<T | undefined>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useAsync<T = unknown>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isError: false,
    isSuccess: false,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isError: false,
      }));

      try {
        const data = await asyncFunction(...args);
        setState({
          data,
          error: null,
          isLoading: false,
          isError: false,
          isSuccess: true,
        });
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setState({
          data: null,
          error: err,
          isLoading: false,
          isError: true,
          isSuccess: false,
        });
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
      isSuccess: data !== null,
    }));
  }, []);

  return { ...state, execute, reset, setData };
}
