"use client";

import type {
	ApiEnvelope,
	CreateDeliveryRecordV2Input,
	CreateOrderInvoiceInput,
	CreateOrderServiceEntrySheetInput,
	DeliveryRecord,
	DeliveryRecordReadModel,
	Invoice,
	ListDeliveryRecordsQuery,
	ListInvoicesQuery,
	ListPaymentsQuery,
	ListServiceEntrySheetsQuery,
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
	TechnicalReportReadModel,
} from "@cermont/shared-types";
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

type WorkflowFilterValue = string | number | readonly string[] | undefined;
type WorkflowQueryKeyPart = string | number | boolean | object | undefined;

const BILLING_KEYS = {
	technicalReports: {
		byOrder: (orderId: string) => ["technical-reports", "by-order", orderId] as const,
	},
	deliveryRecords: {
		all: ["delivery-records"] as const,
		list: (filters?: Record<string, WorkflowFilterValue>) =>
			[...BILLING_KEYS.deliveryRecords.all, "list", filters] as const,
		detail: (id: string) => [...BILLING_KEYS.deliveryRecords.all, "detail", id] as const,
		byOrder: (orderId: string) =>
			[...BILLING_KEYS.deliveryRecords.all, "by-order", orderId] as const,
	},
	serviceEntrySheets: {
		all: ["service-entry-sheets"] as const,
		list: (filters?: Record<string, WorkflowFilterValue>) =>
			[...BILLING_KEYS.serviceEntrySheets.all, "list", filters] as const,
		detail: (id: string) => [...BILLING_KEYS.serviceEntrySheets.all, "detail", id] as const,
	},
	invoices: {
		all: ["invoices"] as const,
		list: (filters?: Record<string, WorkflowFilterValue>) =>
			[...BILLING_KEYS.invoices.all, "list", filters] as const,
		detail: (id: string) => [...BILLING_KEYS.invoices.all, "detail", id] as const,
	},
	payments: {
		all: ["payments"] as const,
		list: (filters?: Record<string, WorkflowFilterValue>) =>
			[...BILLING_KEYS.payments.all, "list", filters] as const,
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

function normalizeStringFilter(value: string | undefined): string | undefined {
	const trimmedValue = value?.trim();
	return trimmedValue ? trimmedValue : undefined;
}

function buildWorkflowEndpoint(
	basePath: string,
	filters: Record<string, WorkflowFilterValue>,
): string {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(filters)) {
		if (value === undefined) {
			continue;
		}

		if (Array.isArray(value)) {
			for (const item of value) {
				const trimmedItem = item.trim();
				if (trimmedItem) {
					params.append(key, trimmedItem);
				}
			}
			continue;
		}

		params.set(key, String(value));
	}

	const queryString = params.toString();
	return queryString ? `${basePath}?${queryString}` : basePath;
}

function useWorkflowList<T>(queryKey: readonly WorkflowQueryKeyPart[], endpoint: string) {
	return useQuery({
		queryKey,
		queryFn: async () => unwrapList(await apiClient.get<ListEnvelope<T>>(endpoint)),
		staleTime: STALE_TIMES.REALTIME,
		placeholderData: keepPreviousData,
	});
}

// ─── Detail queries ──────────────────────────────────────────────────────

export function useOrderTechnicalReport(orderId: string) {
	const normalizedOrderId = orderId.trim();

	return useQuery({
		queryKey: BILLING_KEYS.technicalReports.byOrder(normalizedOrderId),
		queryFn: async () => {
			const response = await apiClient.get<ApiEnvelope<TechnicalReportReadModel>>(
				`/orders/${normalizedOrderId}/technical-report`,
			);
			if (!response.data) {
				throw new Error("No se pudo cargar el informe técnico de la orden");
			}
			return response.data;
		},
		enabled: normalizedOrderId.length > 0,
		staleTime: STALE_TIMES.DETAIL,
	});
}

export function useOrderDeliveryRecord(orderId: string) {
	const normalizedOrderId = orderId.trim();

	return useQuery({
		queryKey: BILLING_KEYS.deliveryRecords.byOrder(normalizedOrderId),
		queryFn: async () => {
			const response = await apiClient.get<ApiEnvelope<DeliveryRecordReadModel>>(
				`/orders/${normalizedOrderId}/delivery-record`,
			);
			if (!response.data) {
				throw new Error("No se pudo cargar el acta de entrega de la orden");
			}
			return response.data;
		},
		enabled: normalizedOrderId.length > 0,
		staleTime: STALE_TIMES.DETAIL,
	});
}

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

export function useDeliveryRecordsList(filters?: Partial<ListDeliveryRecordsQuery>) {
	const normalizedFilters = {
		workOrderId: normalizeStringFilter(filters?.workOrderId),
		technicalReportId: normalizeStringFilter(filters?.technicalReportId),
		status: filters?.status,
		page: filters?.page,
		limit: filters?.limit ?? 50,
	};

	return useWorkflowList<DeliveryRecord>(
		BILLING_KEYS.deliveryRecords.list(normalizedFilters),
		buildWorkflowEndpoint("/delivery-records", normalizedFilters),
	);
}

export function useServiceEntrySheetsList(filters?: Partial<ListServiceEntrySheetsQuery>) {
	const normalizedFilters = {
		status: filters?.status?.filter((value) => value.trim().length > 0),
		workOrderId: normalizeStringFilter(filters?.workOrderId),
		clientId: normalizeStringFilter(filters?.clientId),
		search: normalizeStringFilter(filters?.search),
		dateFrom: normalizeStringFilter(filters?.dateFrom),
		dateTo: normalizeStringFilter(filters?.dateTo),
		page: filters?.page,
		limit: filters?.limit ?? 50,
	};

	return useWorkflowList<ServiceEntrySheet>(
		BILLING_KEYS.serviceEntrySheets.list(normalizedFilters),
		buildWorkflowEndpoint("/service-entry-sheets", normalizedFilters),
	);
}

export function useInvoicesList(filters?: Partial<ListInvoicesQuery>) {
	const normalizedFilters = {
		status: filters?.status?.filter((value) => value.trim().length > 0),
		workOrderId: normalizeStringFilter(filters?.workOrderId),
		clientId: normalizeStringFilter(filters?.clientId),
		search: normalizeStringFilter(filters?.search),
		dateFrom: normalizeStringFilter(filters?.dateFrom),
		dateTo: normalizeStringFilter(filters?.dateTo),
		page: filters?.page,
		limit: filters?.limit ?? 50,
	};

	return useWorkflowList<Invoice>(
		BILLING_KEYS.invoices.list(normalizedFilters),
		buildWorkflowEndpoint("/invoices", normalizedFilters),
	);
}

export function usePaymentsList(filters?: Partial<ListPaymentsQuery>) {
	const normalizedFilters = {
		invoiceId: normalizeStringFilter(filters?.invoiceId),
		workOrderId: normalizeStringFilter(filters?.workOrderId),
		clientId: normalizeStringFilter(filters?.clientId),
		status: filters?.status,
		page: filters?.page,
		limit: filters?.limit ?? 50,
	};

	return useWorkflowList<Payment>(
		BILLING_KEYS.payments.list(normalizedFilters),
		buildWorkflowEndpoint("/payments", normalizedFilters),
	);
}

// ─── Delivery Record mutations ───────────────────────────────────────────

export function useCreateDeliveryRecordFromTechnicalReport(technicalReportId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateDeliveryRecordV2Input) =>
			apiClient.post<ApiEnvelope<DeliveryRecord>>(
				`/delivery-records/from-technical-report/${technicalReportId}`,
				data,
			),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.all });
		},
	});
}

export function useSendDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data?: SendDeliveryRecordInput) =>
			apiClient.post<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}/send`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.detail(id) });
		},
	});
}

export function useSignDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: SignDeliveryRecordInput) =>
			apiClient.post<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}/sign`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.detail(id) });
		},
	});
}

export function useRejectDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RejectDeliveryRecordInput) =>
			apiClient.post<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}/reject`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.detail(id) });
		},
	});
}

export function useCancelDeliveryRecord(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<DeliveryRecord>>(`/delivery-records/${id}/cancel`),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.deliveryRecords.detail(id) });
		},
	});
}

// ─── Service Entry Sheet mutations ──────────────────────────────────────

export function useCreateServiceEntrySheetFromDeliveryRecord(deliveryRecordId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateOrderServiceEntrySheetInput) =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(
				`/service-entry-sheets/from-delivery-record/${deliveryRecordId}`,
				data,
			),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.all });
		},
	});
}

export function useSubmitServiceEntrySheet(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data?: SubmitServiceEntrySheetInput) =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}/submit`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.detail(id) });
		},
	});
}

export function useApproveServiceEntrySheet(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}/approve`),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.detail(id) });
		},
	});
}

export function useRejectServiceEntrySheet(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RejectServiceEntrySheetInput) =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}/reject`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.detail(id) });
		},
	});
}

export function useCancelServiceEntrySheet(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () =>
			apiClient.post<ApiEnvelope<ServiceEntrySheet>>(`/service-entry-sheets/${id}/cancel`),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.serviceEntrySheets.detail(id) });
		},
	});
}

// ─── Invoice mutations ──────────────────────────────────────────────────

export function useCreateInvoiceFromSES(serviceEntrySheetId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateOrderInvoiceInput) =>
			apiClient.post<ApiEnvelope<Invoice>>(
				`/invoices/from-service-entry-sheet/${serviceEntrySheetId}`,
				data,
			),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.all });
		},
	});
}

export function useSubmitInvoice(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<Invoice>>(`/invoices/${id}/submit`),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.detail(id) });
		},
	});
}

export function useApproveInvoice(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<Invoice>>(`/invoices/${id}/approve`),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.detail(id) });
		},
	});
}

export function useRejectInvoice(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RejectServiceEntrySheetInput) =>
			apiClient.post<ApiEnvelope<Invoice>>(`/invoices/${id}/reject`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.detail(id) });
		},
	});
}

export function useCancelInvoice(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<ApiEnvelope<Invoice>>(`/invoices/${id}/cancel`),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices.detail(id) });
		},
	});
}

// ─── Payment dashboard & aging ──────────────────────────────────────────

export function usePaymentDashboard() {
	return useQuery({
		queryKey: [...BILLING_KEYS.payments.all, "dashboard"] as const,
		queryFn: async () => {
			const res = await apiClient.get<ApiEnvelope<import("@cermont/shared-types").PaymentDashboard>>("/payments/dashboard");
			return res.data;
		},
		staleTime: STALE_TIMES.REALTIME,
	});
}

export function usePaymentAgingReport() {
	return useQuery({
		queryKey: [...BILLING_KEYS.payments.all, "aging"] as const,
		queryFn: async () => {
			const res = await apiClient.get<ApiEnvelope<import("@cermont/shared-types").PaymentAgingEntry[]>>("/payments/aging");
			return res.data;
		},
		staleTime: STALE_TIMES.REALTIME,
	});
}

export function usePaymentList(filters?: Partial<ListPaymentsQuery>) {
	return usePaymentsList(filters);
}

// ─── Payment mutations ──────────────────────────────────────────────────

export function useRegisterPaymentForInvoice(invoiceId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RegisterInvoicePaymentInput) =>
			apiClient.post<ApiEnvelope<Payment>>(`/payments/from-invoice/${invoiceId}`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.payments.all });
		},
	});
}

export function useReconcilePayment(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: ReconcilePaymentInput) =>
			apiClient.post<ApiEnvelope<Payment>>(`/payments/${id}/reconcile`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.payments.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.payments.detail(id) });
		},
	});
}

export function useRejectPayment(id: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: RejectPaymentRecordInput) =>
			apiClient.post<ApiEnvelope<Payment>>(`/payments/${id}/reject`, data),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.payments.all });
			void qc.invalidateQueries({ queryKey: BILLING_KEYS.payments.detail(id) });
		},
	});
}

