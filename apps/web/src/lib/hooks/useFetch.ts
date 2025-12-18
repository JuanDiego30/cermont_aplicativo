/**
 * @hook useFetch
 * @description Reusable data fetching hook with loading, error, and refetch
 * Eliminates duplicate fetch logic across 6+ modules
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api-client';

export interface UseFetchOptions {
    enabled?: boolean;
    refetchOnMount?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export interface UseFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    mutate: (newData: T | ((prev: T | null) => T)) => void;
}

export function useFetch<T = any>(
    url: string | null,
    options: UseFetchOptions = {},
): UseFetchReturn<T> {
    const { enabled = true, refetchOnMount = true, onSuccess, onError } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!url || !enabled) return;

        setLoading(true);
        setError(null);

        try {
            const result = await apiClient.get<T>(url);
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    }, [url, enabled, onSuccess, onError]);

    useEffect(() => {
        if (refetchOnMount) {
            fetchData();
        }
    }, [fetchData, refetchOnMount]);

    const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
        if (typeof newData === 'function') {
            setData((prev) => (newData as (prev: T | null) => T)(prev));
        } else {
            setData(newData);
        }
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        mutate,
    };
}

/**
 * @hook useMutation
 * @description Hook for POST/PUT/DELETE operations with loading state
 */
export interface UseMutationOptions<TData, TVariables> {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
}

export interface UseMutationReturn<TData, TVariables> {
    mutate: (variables: TVariables) => Promise<TData | undefined>;
    loading: boolean;
    error: Error | null;
    data: TData | null;
    reset: () => void;
}

export function useMutation<TData = any, TVariables = any>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: UseMutationOptions<TData, TVariables> = {},
): UseMutationReturn<TData, TVariables> {
    const { onSuccess, onError } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<TData | null>(null);

    const mutate = useCallback(async (variables: TVariables): Promise<TData | undefined> => {
        setLoading(true);
        setError(null);

        try {
            const result = await mutationFn(variables);
            setData(result);
            onSuccess?.(result, variables);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
            onError?.(error, variables);
            return undefined;
        } finally {
            setLoading(false);
        }
    }, [mutationFn, onSuccess, onError]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
    }, []);

    return {
        mutate,
        loading,
        error,
        data,
        reset,
    };
}
