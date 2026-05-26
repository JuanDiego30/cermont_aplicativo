"use client";

import type {
	ApiEnvelope,
	CreateDeliveryRecordV2Input,
	CreateOrderInvoiceInput,
	CreateOrderServiceEntrySheetInput,
	DeliveryRecord,
	Invoice,
	Payment,
	ReconcilePaymentInput,
	RegisterInvoicePaymentInput,
	RejectDeliveryRecordInput,
	RejectPaymentRecordInput,
	RejectServiceEntrySheetInput,
	SendDeliveryRecordInput,
	ServiceEntrySheet,
	SignDeliveryRecordInput,
	SubmitServiceEntrySheetInput,
} from "@cermont/shared-types";
import type { QueryClient } from "@tanstack/react-query";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIMES } from "@/lib/constants/query-config";
import { apiClient } from "@/lib/http/api-client";

type ListEnvelope<T> = ApiEnvelope<T[]> & {
	meta?: {
		total?: number;
		page?: number;
		limit?: number;
		pages?: number;
	};
};

export type WorkflowList<T> = {
	items: T[];
	total: number;
	page: number;
	limit: number;
	pages: number;
};

const BILLING_KEYS = {
	deliveryRecords: {
		all: ["delivery-records"] as const,
		list: () => [...BILLING_KEYS.deliveryRecords.all, "list"] as const,
		detail: (id: string) => [...BILLING_KEYS.deliveryRecords.all, "detail", id] as const,
	},
	serviceEntrySheets: {
		all: ["service-entry-sheets"] as const,
		list: () => [...BILLING_KEYS.serviceEntrySheets.all, "list"] as const,
		detail: (id: string) => [...BILLING_KEYS.serviceEntrySheets.all, "detail", id] as const,
	},
	invoices: {
		all: ["invoices"] as const,
		list: () => [...BILLING_KEYS.invoices.all, "list"] as const,
		detail: (id: string) => [...BILLING_KEYS.invoices.all, "detail", id] as const,
	},
	payments: {
		all: ["payments"] as const,
		list: () => [...BILLING_KEYS.payments.all, "list"] as const,
		detail: (id: string) => [...BILLING_KEYS.payments.all, "detail", id] as const,
	},
} as const;

function unwrapList<T>(response: ListEnvelope<T>): WorkflowList<T> {
	return {
		items: response.data,
		total: response.meta?.total ?? response.data.length,
		page: response.meta?.page ?? 1,
		limit: response.meta?.limit ?? response.data.length,
		pages: response.meta?.pages ?? 1,
	};
}

function useWorkflowList<T>(queryKey: readonly string[], endpoint: string) {
	return useQuery({
		queryKey,
		queryFn: async () => unwrapList(await apiClient.get<ListEnvelope<T>>(endpoint)),
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

// ─── Detail queries ──────────────────────────────────────────────────────

export function useDeliveryRecord(id: string) {
	return useQuery({
		queryKey: BILLING_KEYS.deliveryRecords.detail(id),
		queryFn: () => apiClient.get<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useServiceEntrySheet(id: string) {
	return useQuery({
		queryKey: BILLING_KEYS.serviceEntrySheets.detail(id),
		queryFn: () => apiClient.get<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useInvoice(id: string) {
	return useQuery({
		queryKey: BILLING_KEYS.invoices.detail(id),
		queryFn: () => apiClient.get<ApiEnvelope<Invoice>>(`/invoices/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function usePayment(id: string) {
	return useQuery({
		queryKey: BILLING_KEYS.payments.detail(id),
		queryFn: () => apiClient.get<ApiEnvelope<Payment>>(`/payments/${id}`),
		enabled: !!id,
		staleTime: STALE_TIMES.DETAIL,
	});
}

// ─── List queries (existing) ─────────────────────────────────────────────

export function useDeliveryRecordsList() {
	return useWorkflowList<DeliveryRecord>(
		BILLING_KEYS.deliveryRecords.list(),
		"/delivery-records?limit=50",
	);
}

export function useServiceEntrySheetsList() {
	return useWorkflowList<ServiceEntrySheet>(
		BILLING_KEYS.serviceEntrySheets.list(),
		"/service-entry-sheets?limit=50",
	);
}

export function useInvoicesList() {
	return useWorkflowList<Invoice>(BILLING_KEYS.invoices.list(), "/invoices?limit=50");
}

export function usePaymentsList() {
	return useWorkflowList<Payment>(BILLING_KEYS.payments.list(), "/payments?limit=50");
}

// ─── Delivery Record mutations ───────────────────────────────────────────

function invalidateDR(qc: QueryClient, id?: string) {
	qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.all });
	if (id) {
		qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.detail(id) });
	}
}

export function useCreateDeliveryRecordFromTechnicalReport(technicalReportId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateDeliveryRecordV2Input) =>
			apiClient.post<ApiEnvelope<DeliveryRecord>>(
				`/delivery-records/from-technical-report/${technicalReportId}`,
				data,
			),
		onSuccess: () => invalidateDR(qc),
	});
}

export function useSendDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data?: SendDeliveryRecordInput) =>
			apiClient.post<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}/send`, data),
		onSuccess: () => invalidateDR(qc, id),
	});
}

export function useSignDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: SignDeliveryRecordInput) =>
			apiClient.post<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}/sign`, data),
		onSuccess: () => invalidateDR(qc, id),
	});
}

export function useRejectDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RejectDeliveryRecordInput) =>
			apiClient.post<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}/reject`, data),
		onSuccess: () => invalidateDR(qc, id),
	});
}

export function useCancelDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}/cancel`),
		onSuccess: () => invalidateDR(qc, id),
	});
}

// ─── Service Entry Sheet mutations ──────────────────────────────────────

function invalidateSES(qc: QueryClient, id?: string) {
	qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.all });
	if (id) {
		qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.detail(id) });
	}
}

export function useCreateServiceEntrySheetFromDeliveryRecord(deliveryRecordId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateOrderServiceEntrySheetInput) =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(
				`/service-entry-sheets/from-delivery-record/${deliveryRecordId}`,
				data,
			),
		onSuccess: () => invalidateSES(qc),
	});
}

export function useSubmitServiceEntrySheet(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data?: SubmitServiceEntrySheetInput) =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}/submit`, data),
		onSuccess: () => invalidateSES(qc, id),
	});
}

export function useApproveServiceEntrySheet(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}/approve`),
		onSuccess: () => invalidateSES(qc, id),
	});
}

export function useRejectServiceEntrySheet(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RejectServiceEntrySheetInput) =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}/reject`, data),
		onSuccess: () => invalidateSES(qc, id),
	});
}

export function useCancelServiceEntrySheet(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}/cancel`),
		onSuccess: () => invalidateSES(qc, id),
	});
}

// ─── Invoice mutations ──────────────────────────────────────────────────

function invalidateInvoice(qc: QueryClient, id?: string) {
	qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.all });
	if (id) {
		qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.detail(id) });
	}
}

export function useCreateInvoiceFromSES(serviceEntrySheetId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateOrderInvoiceInput) =>
			apiClient.post<ApiEnvelope<Invoice>>(
				`/invoices/from-service-entry-sheet/${serviceEntrySheetId}`,
				data,
			),
		onSuccess: () => invalidateInvoice(qc),
	});
}

export function useSubmitInvoice(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<Invoice>>(`/invoices/${id}/submit`),
		onSuccess: () => invalidateInvoice(qc, id),
	});
}

export function useApproveInvoice(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<Invoice>>(`/invoices/${id}/approve`),
		onSuccess: () => invalidateInvoice(qc, id),
	});
}

export function useRejectInvoice(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RejectServiceEntrySheetInput) =>
			apiClient.post<ApiEnvelope<Invoice>>(`/invoices/${id}/reject`, data),
		onSuccess: () => invalidateInvoice(qc, id),
	});
}

export function useCancelInvoice(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<Invoice>>(`/invoices/${id}/cancel`),
		onSuccess: () => invalidateInvoice(qc, id),
	});
}

// ─── Payment mutations ──────────────────────────────────────────────────

function invalidatePayment(qc: QueryClient, id?: string) {
	qc.invalidateQueries({ queryKey: BILLING_KEYS.payments.all });
	if (id) {
		qc.invalidateQueries({ queryKey: BILLING_KEYS.payments.detail(id) });
	}
}

export function useRegisterPaymentForInvoice(invoiceId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RegisterInvoicePaymentInput) =>
			apiClient.post<ApiEnvelope<Payment>>(`/payments/from-invoice/${invoiceId}`, data),
		onSuccess: () => invalidatePayment(qc),
	});
}

export function useReconcilePayment(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: ReconcilePaymentInput) =>
			apiClient.post<ApiEnvelope<Payment>>(`/payments/${id}/reconcile`, data),
		onSuccess: () => invalidatePayment(qc, id),
	});
}

export function useRejectPayment(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RejectPaymentRecordInput) =>
			apiClient.post<ApiEnvelope<Payment>>(`/payments/${id}/reject`, data),
		onSuccess: () => invalidatePayment(qc, id),
	});
}
