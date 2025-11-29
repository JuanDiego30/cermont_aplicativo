'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi } from '../api';
import type { CreateChecklistTemplateDTO, UpdateChecklistTemplateDTO } from '../types';

export function useChecklists() {
  return useQuery({
    queryKey: ['checklists'],
    queryFn: checklistsApi.getAllTemplates,
  });
}

export function useChecklist(id: string) {
  return useQuery({
    queryKey: ['checklist', id],
    queryFn: () => checklistsApi.getTemplateById(id),
    enabled: !!id,
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChecklistTemplateDTO) => checklistsApi.createTemplate(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['checklists'] }); },
  });
}

export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChecklistTemplateDTO }) => checklistsApi.updateTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['checklist', variables.id] });
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistsApi.deleteTemplate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['checklists'] }); },
  });
}

export function useDuplicateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checklistsApi.duplicateTemplate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['checklists'] }); },
  });
}
