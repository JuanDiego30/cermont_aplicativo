/**
 * @hook useFilters
 * @description Reusable filter state management with URL sync
 * Eliminates duplicate filter logic across dashboard pages
 */
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface UseFiltersOptions<T> {
    initialFilters: T;
    syncToUrl?: boolean;
    debounceMs?: number;
}

export interface UseFiltersReturn<T> {
    filters: T;
    setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
    setFilters: (newFilters: Partial<T>) => void;
    resetFilters: () => void;
    clearFilter: (key: keyof T) => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    toQueryString: () => string;
}

export function useFilters<T extends Record<string, any>>({
    initialFilters,
    syncToUrl = false,
}: UseFiltersOptions<T>): UseFiltersReturn<T> {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize from URL if syncToUrl is enabled
    const getInitialState = (): T => {
        if (!syncToUrl) return initialFilters;

        const fromUrl: Partial<T> = {};
        Object.keys(initialFilters).forEach((key) => {
            const value = searchParams.get(key);
            if (value !== null) {
                // Try to parse as JSON, fallback to string
                try {
                    fromUrl[key as keyof T] = JSON.parse(value);
                } catch {
                    fromUrl[key as keyof T] = value as T[keyof T];
                }
            }
        });

        return { ...initialFilters, ...fromUrl };
    };

    const [filters, setFiltersState] = useState<T>(getInitialState);

    const updateUrl = useCallback((newFilters: T) => {
        if (!syncToUrl) return;

        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
            }
        });

        const query = params.toString();
        router.push(query ? `?${query}` : window.location.pathname, { scroll: false });
    }, [syncToUrl, router]);

    const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setFiltersState(prev => {
            const newFilters = { ...prev, [key]: value };
            updateUrl(newFilters);
            return newFilters;
        });
    }, [updateUrl]);

    const setFilters = useCallback((newFilters: Partial<T>) => {
        setFiltersState(prev => {
            const updated = { ...prev, ...newFilters };
            updateUrl(updated);
            return updated;
        });
    }, [updateUrl]);

    const resetFilters = useCallback(() => {
        setFiltersState(initialFilters);
        updateUrl(initialFilters);
    }, [initialFilters, updateUrl]);

    const clearFilter = useCallback((key: keyof T) => {
        setFiltersState(prev => {
            const newFilters = { ...prev, [key]: initialFilters[key] };
            updateUrl(newFilters);
            return newFilters;
        });
    }, [initialFilters, updateUrl]);

    const hasActiveFilters = useMemo(() => {
        return Object.keys(filters).some(key => {
            const value = filters[key];
            const initial = initialFilters[key];
            return value !== initial && value !== undefined && value !== null && value !== '';
        });
    }, [filters, initialFilters]);

    const activeFilterCount = useMemo(() => {
        return Object.keys(filters).filter(key => {
            const value = filters[key];
            const initial = initialFilters[key];
            return value !== initial && value !== undefined && value !== null && value !== '';
        }).length;
    }, [filters, initialFilters]);

    const toQueryString = useCallback(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value));
            }
        });
        return params.toString();
    }, [filters]);

    return {
        filters,
        setFilter,
        setFilters,
        resetFilters,
        clearFilter,
        hasActiveFilters,
        activeFilterCount,
        toQueryString,
    };
}
