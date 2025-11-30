'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signaturesApi } from '../api/signatures-service';
import type { SignatureRequest, SignedDocument } from '../types';

const QUERY_KEYS = {
  signatures: (entityType: string, entityId: string) => 
    ['signatures', entityType, entityId] as const,
  pending: ['signatures', 'pending'] as const,
};

/**
 * Hook for managing signatures on a document
 */
export function useSignatures(entityType: string, entityId: string) {
  const queryClient = useQueryClient();

  const { data: signedDocument, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.signatures(entityType, entityId),
    queryFn: () => signaturesApi.getSignatures(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });

  const uploadMutation = useMutation({
    mutationFn: ({
      request,
      signatureDataUrl,
    }: {
      request: SignatureRequest;
      signatureDataUrl: string;
    }) => signaturesApi.uploadSignature(request, signatureDataUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.signatures(entityType, entityId),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (signatureId: string) =>
      signaturesApi.deleteSignature(signatureId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.signatures(entityType, entityId),
      });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: () => signaturesApi.finalizeDocument(entityType, entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.signatures(entityType, entityId),
      });
    },
  });

  const hasSignature = (signatureType: string): boolean => {
    return signedDocument?.signatures.some(
      (sig) => sig.signedBy.role === signatureType
    ) ?? false;
  };

  const getSignature = (signatureType: string) => {
    return signedDocument?.signatures.find(
      (sig) => sig.signedBy.role === signatureType
    );
  };

  const isComplete = signedDocument?.status === 'complete';
  const isPending = signedDocument?.status === 'pending';
  const signatureCount = signedDocument?.signatures.length ?? 0;
  const requiredCount = signedDocument?.requiredSignatures.length ?? 0;

  return {
    signedDocument,
    isLoading,
    error,
    refetch,
    // Mutations
    uploadSignature: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    deleteSignature: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    finalizeDocument: finalizeMutation.mutate,
    isFinalizing: finalizeMutation.isPending,
    // Helpers
    hasSignature,
    getSignature,
    isComplete,
    isPending,
    signatureCount,
    requiredCount,
  };
}

/**
 * Hook for getting pending signatures
 */
export function usePendingSignatures() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.pending,
    queryFn: () => signaturesApi.getPendingSignatures(),
  });

  return {
    pendingDocuments: data ?? [],
    isLoading,
    error,
    refetch,
    count: data?.length ?? 0,
  };
}
