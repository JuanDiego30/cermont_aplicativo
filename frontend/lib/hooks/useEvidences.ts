'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { evidencesApi } from '@/lib/api/evidences';
import type { Evidence } from '@/lib/types/evidence';

export function useEvidences(orderId: string) {
  const queryClient = useQueryClient();

  const evidencesQuery = useQuery<Evidence[]>({
    queryKey: ['evidences', orderId],
    queryFn: () => evidencesApi.listByOrder(orderId),
    enabled: !!orderId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (params: {
      file: File;
      stage: string;
      type: string;
    }) => {
      const { file, stage, type } = params;

      const { uploadUrl, key } = await evidencesApi.getPresignedUploadUrl({
        orderId,
        stage,
        type,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
      });

      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      const evidence = await evidencesApi.completeUpload({
        orderId,
        stage,
        type,
        key,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
      });

      return evidence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['evidences', orderId],
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (evidenceId: string) =>
      evidencesApi.approveEvidence(evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['evidences', orderId],
      });
    },
  });

  return {
    evidencesQuery,
    uploadMutation,
    approveMutation,
  };
}
