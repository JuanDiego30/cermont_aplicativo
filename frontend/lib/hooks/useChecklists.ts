import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi } from '@/lib/api/checklists';
import type {
  CreateChecklistTemplateDTO,
  UpdateChecklistTemplateDTO,
  StartChecklistDTO,
  SaveAnswerDTO,
  CompleteChecklistDTO,
} from '@/lib/types/checklist';

const CHECKLISTS_QUERY_KEY = 'checklists';
const TEMPLATES_QUERY_KEY = 'checklist-templates';

// ==================== TEMPLATES ====================

/**
 * Hook para obtener todos los templates
 */
export function useChecklistTemplates() {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY],
    queryFn: checklistsApi.getAllTemplates,
  });
}

/**
 * Hook para obtener un template espec�fico
 */
export function useChecklistTemplate(id: string) {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY, id],
    queryFn: () => checklistsApi.getTemplateById(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener templates por categor�a
 */
export function useChecklistTemplatesByCategory(category: string) {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY, 'category', category],
    queryFn: () => checklistsApi.getTemplatesByCategory(category),
    enabled: !!category,
  });
}

/**
 * Hook para obtener templates por kit
 */
export function useChecklistTemplatesByKit(kitId: string) {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY, 'kit', kitId],
    queryFn: () => checklistsApi.getTemplatesByKit(kitId),
    enabled: !!kitId,
  });
}

/**
 * Hook para crear template
 */
export function useCreateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChecklistTemplateDTO) => checklistsApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
    },
  });
}

/**
 * Hook para actualizar template
 */
export function useUpdateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChecklistTemplateDTO }) =>
      checklistsApi.updateTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY, variables.id] });
    },
  });
}

/**
 * Hook para eliminar template
 */
export function useDeleteChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistsApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
    },
  });
}

/**
 * Hook para duplicar template
 */
export function useDuplicateChecklistTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistsApi.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
    },
  });
}

// ==================== EJECUCI�N ====================

/**
 * Hook para iniciar checklist
 */
export function useStartChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartChecklistDTO) => checklistsApi.startChecklist(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, 'order', variables.orderId],
      });
    },
  });
}

/**
 * Hook para obtener checklist en progreso
 */
export function useChecklist(id: string) {
  return useQuery({
    queryKey: [CHECKLISTS_QUERY_KEY, id],
    queryFn: () => checklistsApi.getChecklistById(id),
    enabled: !!id,
    refetchInterval: 30000,
  });
}

/**
 * Hook para guardar respuesta
 */
export function useSaveAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveAnswerDTO) => checklistsApi.saveAnswer(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, variables.checklistId],
      });
    },
  });
}

/**
 * Hook para completar checklist
 */
export function useCompleteChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompleteChecklistDTO) => checklistsApi.completeChecklist(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKLISTS_QUERY_KEY, variables.checklistId],
      });
    },
  });
}

/**
 * Hook para aprobar checklist
 */
export function useApproveChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistsApi.approveChecklist(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [CHECKLISTS_QUERY_KEY, id] });
    },
  });
}

/**
 * Hook para rechazar checklist
 */
export function useRejectChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      checklistsApi.rejectChecklist(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CHECKLISTS_QUERY_KEY, variables.id] });
    },
  });
}

/**
 * Hook para obtener checklists de una orden
 */
export function useChecklistsByOrder(orderId: string) {
  return useQuery({
    queryKey: [CHECKLISTS_QUERY_KEY, 'order', orderId],
    queryFn: () => checklistsApi.getChecklistsByOrder(orderId),
    enabled: !!orderId,
  });
}

/**
 * Hook para exportar a PDF
 */
export function useExportChecklistPdf() {
  return useMutation({
    mutationFn: (id: string) => checklistsApi.exportToPdf(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `checklist-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

