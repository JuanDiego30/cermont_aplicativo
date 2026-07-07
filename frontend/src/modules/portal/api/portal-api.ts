import type { SignDeliveryRecordInput } from "@cermont/shared-types";
import type { UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";
import { uploadFile } from "@/modules/files/api/files.api";

export interface PortalDashboard {
	clientName: string;
	totalOrders: number;
	activeOrders: number;
	pendingApprovals: number;
	unpaidInvoices: number;
}

export interface PortalOrderSummary {
	_id: string;
	code: string;
	status: string;
	serviceType: string;
	createdAt: string;
	updatedAt: string;
}

export interface PortalOrderDetail extends PortalOrderSummary {
	description: string;
	assignedTo?: string;
	serviceSite?: string;
	proposals: Array<{ _id: string; code: string; status: string; total: number }>;
	invoices: Array<{ _id: string; code: string; status: string; totalAmount: number }>;
	technicalReports: Array<{ _id: string; code: string; status: string }>;
	deliveryRecords: Array<{ _id: string; code: string; status: string }>;
}

export interface PortalInvoiceSummary {
	_id: string;
	code: string;
	status: string;
	amount: number;
	totalAmount: number;
	issueDate?: string;
	dueDate?: string;
}

export interface PortalProposalSummary {
	_id: string;
	code?: string;
	status: string;
	total: number;
	createdAt: string;
}

const portalKeys = {
	dashboard: ["portal", "dashboard"] as const,
	orders: ["portal", "orders"] as const,
	orderDetail: (id: string) => ["portal", "orders", id] as const,
	invoices: ["portal", "invoices"] as const,
	proposals: ["portal", "proposals"] as const,
};

export function usePortalDashboard(): UseQueryResult<PortalDashboard> {
	return useQuery({
		queryKey: portalKeys.dashboard,
		queryFn: () => apiClient.get<PortalDashboard>("/portal/dashboard"),
		refetchInterval: 60_000,
	});
}

export function usePortalOrders(): UseQueryResult<PortalOrderSummary[]> {
	return useQuery({
		queryKey: portalKeys.orders,
		queryFn: () => apiClient.get<PortalOrderSummary[]>("/portal/orders"),
		refetchInterval: 60_000,
	});
}

export function usePortalOrderDetail(
	id: string,
	options?: Partial<UseQueryOptions<PortalOrderDetail>>,
): UseQueryResult<PortalOrderDetail> {
	return useQuery({
		queryKey: portalKeys.orderDetail(id),
		queryFn: () => apiClient.get<PortalOrderDetail>(`/portal/orders/${id}`),
		enabled: Boolean(id),
		...options,
	});
}

export function usePortalInvoices(): UseQueryResult<PortalInvoiceSummary[]> {
	return useQuery({
		queryKey: portalKeys.invoices,
		queryFn: () => apiClient.get<PortalInvoiceSummary[]>("/portal/invoices"),
		refetchInterval: 60_000,
	});
}

export function usePortalProposals(): UseQueryResult<PortalProposalSummary[]> {
	return useQuery({
		queryKey: portalKeys.proposals,
		queryFn: () => apiClient.get<PortalProposalSummary[]>("/portal/proposals"),
		refetchInterval: 60_000,
	});
}

export interface SignDeliveryRecordVariables {
	deliveryRecordId: string;
	clientName: string;
	clientDocumentType?: "CC" | "CE" | "NIT" | "PASAPORTE";
	clientDocumentNumber?: string;
	captureMethod: "canvas_touch" | "canvas_mouse";
	/** PNG signature image, base64 without the data-url prefix. */
	imageData: string;
}

function base64ToPngFile(base64: string, fileName: string): File {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return new File([bytes], fileName, { type: "image/png" });
}

/**
 * Signs a delivery record from the client portal: uploads the captured
 * signature as a FileAsset and then executes the sign transition with the
 * uploaded asset as the signed document reference.
 */
export function useSignDeliveryRecord(options?: {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}): UseMutationResult<unknown, Error, SignDeliveryRecordVariables> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (variables: SignDeliveryRecordVariables) => {
			const signatureFile = base64ToPngFile(
				variables.imageData,
				`portal-signature-${variables.deliveryRecordId}.png`,
			);
			const uploaded = await uploadFile({
				file: signatureFile,
				category: "signature_image",
				entityType: "delivery_record",
				entityId: variables.deliveryRecordId,
				description: `Firma de ${variables.clientName}`,
				tags: variables.clientDocumentNumber
					? [`doc:${variables.clientDocumentType ?? "CC"}:${variables.clientDocumentNumber}`]
					: [],
			});

			const payload: SignDeliveryRecordInput = {
				signedDocumentRef: uploaded.id,
				signatureMethod: "digital",
				signedAt: new Date().toISOString(),
				signedBy: variables.clientName,
			};
			return apiClient.post(
				`/delivery-records/${encodeURIComponent(variables.deliveryRecordId)}/sign`,
				payload,
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: portalKeys.orders });
			options?.onSuccess?.();
		},
		onError: (error: Error) => {
			options?.onError?.(error);
		},
	});
}
