/**
 * Archives Hooks
 * React Query hooks for archives feature
 */

'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { archivesApi } from '../api';
import type { ArchiveFilters } from '../types';

const ARCHIVES_KEY = 'archives';

export function useArchives(filters?: ArchiveFilters) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const search = filters?.search?.trim() ?? '';
    const month = filters?.month ?? '';

    return useQuery({
        queryKey: [ARCHIVES_KEY, page, limit, search, month],
        queryFn: () =>
            archivesApi.list({
                page,
                limit,
                month: month || undefined,
                search: search || undefined,
            }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
}

export function useExportArchives() {
    return useMutation({
        mutationFn: async (month: string) => {
            const blob = await archivesApi.export(month);
            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${month}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return blob;
        },
    });
}

export function useTriggerArchive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => archivesApi.triggerArchive(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ARCHIVES_KEY] });
        },
    });
}
