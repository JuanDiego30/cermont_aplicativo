/**
 * Archives Hooks
 * React Query hooks for archives feature
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { archivesApi, type ArchiveFilters } from '../api';

const ARCHIVES_KEY = 'archives';

export function useArchives(filters?: ArchiveFilters) {
    return useQuery({
        queryKey: [ARCHIVES_KEY, filters],
        queryFn: () => archivesApi.list(filters),
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
