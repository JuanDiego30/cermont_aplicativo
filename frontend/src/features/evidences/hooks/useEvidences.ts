'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { evidencesApi } from '../api';
import type { Evidence } from '../types';

export function useEvidences(orderId: string) {
  const queryClient = useQueryClient();

  const evidencesQuery = useQuery<Evidence[]>({
    queryKey: ['evidences', orderId],
    queryFn: () => evidencesApi.listByOrder(orderId),
    enabled: !!orderId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (params: { file: File; stage: string; type: string }) => {
      const { file, stage, type } = params;

      const { uploadUrl, key } = await evidencesApi.getPresignedUploadUrl({
        orderId,
        stage,
        type,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
      });

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      return evidencesApi.completeUpload({
        orderId,
        stage,
        type,
        key,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['evidences', orderId] }); },
  });

  const approveMutation = useMutation({
    mutationFn: (evidenceId: string) => evidencesApi.approveEvidence(evidenceId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['evidences', orderId] }); },
  });

  return { evidencesQuery, uploadMutation, approveMutation };
}
