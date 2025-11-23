import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi } from '../api/checklists';
import type { CreateChecklistTemplateDTO } from '../types/checklist';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
}
