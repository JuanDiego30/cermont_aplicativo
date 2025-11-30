'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aribaApi } from '../api/ariba-service';
import type { AribaSES, AribaInvoice, AribaSESStatus, AribaInvoiceStatus } from '../types';

const QUERY_KEYS = {
  ses: (id: string) => ['ariba', 'ses', id] as const,
  sesByOrder: (orderId: string) => ['ariba', 'ses', 'order', orderId] as const,
  sesList: (filters?: Record<string, unknown>) => ['ariba', 'ses', 'list', filters] as const,
  invoice: (id: string) => ['ariba', 'invoice', id] as const,
  invoiceBySES: (sesId: string) => ['ariba', 'invoice', 'ses', sesId] as const,
  invoiceList: (filters?: Record<string, unknown>) => ['ariba', 'invoices', 'list', filters] as const,
  orderMapping: (orderId: string) => ['ariba', 'mapping', orderId] as const,
  configStatus: ['ariba', 'config'] as const,
};

// ============================================================================
// SES Hooks
// ============================================================================

/**
 * Hook for managing SES for an order
 */
export function useOrderSES(orderId: string) {
  const queryClient = useQueryClient();

  const { data: ses, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.sesByOrder(orderId),
    queryFn: () => aribaApi.getSESByOrder(orderId),
    enabled: !!orderId,
  });

  const createMutation = useMutation({
    mutationFn: () => aribaApi.createSES(orderId),
    onSuccess: (newSES) => {
      queryClient.setQueryData(QUERY_KEYS.sesByOrder(orderId), newSES);
      queryClient.invalidateQueries({ queryKey: ['ariba', 'ses'] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (sesId: string) => aribaApi.submitSES(sesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sesByOrder(orderId) });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (sesId: string) => aribaApi.syncSESStatus(sesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sesByOrder(orderId) });
    },
  });

  return {
    ses,
    isLoading,
    error,
    refetch,
    hasSES: !!ses,
    // Mutations
    createSES: createMutation.mutate,
    isCreating: createMutation.isPending,
    submitSES: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    syncStatus: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}

/**
 * Hook for listing SES with filters
 */
export function useSESList(filters?: {
  status?: AribaSESStatus;
  vendorId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.sesList(filters),
    queryFn: () => aribaApi.listSES(filters),
  });

  return {
    sesList: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// Invoice Hooks
// ============================================================================

/**
 * Hook for managing invoice for a SES
 */
export function useSESInvoice(sesId: string) {
  const queryClient = useQueryClient();

  const { data: invoice, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.invoiceBySES(sesId),
    queryFn: () => aribaApi.getInvoiceBySES(sesId),
    enabled: !!sesId,
  });

  const createMutation = useMutation({
    mutationFn: (invoiceData: {
      invoiceNumber: string;
      invoiceDate: string;
      dueDate: string;
    }) => aribaApi.createInvoice(sesId, invoiceData),
    onSuccess: (newInvoice) => {
      queryClient.setQueryData(QUERY_KEYS.invoiceBySES(sesId), newInvoice);
      queryClient.invalidateQueries({ queryKey: ['ariba', 'invoices'] });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (invoiceId: string) => aribaApi.submitInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoiceBySES(sesId) });
    },
  });

  return {
    invoice,
    isLoading,
    error,
    refetch,
    hasInvoice: !!invoice,
    // Mutations
    createInvoice: createMutation.mutate,
    isCreating: createMutation.isPending,
    submitInvoice: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
  };
}

/**
 * Hook for listing invoices with filters
 */
export function useInvoiceList(filters?: {
  status?: AribaInvoiceStatus;
  vendorId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.invoiceList(filters),
    queryFn: () => aribaApi.listInvoices(filters),
  });

  return {
    invoices: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// Config & Connection Hooks
// ============================================================================

/**
 * Hook for Ariba connection status
 */
export function useAribaConfig() {
  const queryClient = useQueryClient();

  const { data: configStatus, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.configStatus,
    queryFn: () => aribaApi.getConfigStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const testConnectionMutation = useMutation({
    mutationFn: () => aribaApi.testConnection(),
  });

  const syncAllMutation = useMutation({
    mutationFn: () => aribaApi.syncAllPending(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ariba'] });
    },
  });

  return {
    configStatus,
    isLoading,
    error,
    refetch,
    isConfigured: configStatus?.configured ?? false,
    // Mutations
    testConnection: testConnectionMutation.mutateAsync,
    isTesting: testConnectionMutation.isPending,
    testResult: testConnectionMutation.data,
    syncAll: syncAllMutation.mutate,
    isSyncing: syncAllMutation.isPending,
    syncResult: syncAllMutation.data,
  };
}
