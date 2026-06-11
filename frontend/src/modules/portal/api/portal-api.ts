import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

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

export const portalKeys = {
	dashboard: ["portal", "dashboard"] as const,
	orders: ["portal", "orders"] as const,
	orderDetail: (id: string) => ["portal", "orders", id] as const,
	invoices: ["portal", "invoices"] as const,
	proposals: ["portal", "proposals"] as const,
};

export function usePortalDashboard(): UseQueryResult<PortalDashboard> {
	return useQuery({
		queryKey: portalKeys.dashboard,
		queryFn: () => apiClient.get<PortalDashboard>("/api/portal/dashboard"),
		refetchInterval: 60_000,
	});
}

export function usePortalOrders(): UseQueryResult<PortalOrderSummary[]> {
	return useQuery({
		queryKey: portalKeys.orders,
		queryFn: () => apiClient.get<PortalOrderSummary[]>("/api/portal/orders"),
		refetchInterval: 60_000,
	});
}

export function usePortalOrderDetail(
	id: string,
	options?: Partial<UseQueryOptions<PortalOrderDetail>>,
): UseQueryResult<PortalOrderDetail> {
	return useQuery({
		queryKey: portalKeys.orderDetail(id),
		queryFn: () => apiClient.get<PortalOrderDetail>(`/api/portal/orders/${id}`),
		enabled: Boolean(id),
		...options,
	});
}

export function usePortalInvoices(): UseQueryResult<PortalInvoiceSummary[]> {
	return useQuery({
		queryKey: portalKeys.invoices,
		queryFn: () => apiClient.get<PortalInvoiceSummary[]>("/api/portal/invoices"),
		refetchInterval: 60_000,
	});
}

export function usePortalProposals(): UseQueryResult<PortalProposalSummary[]> {
	return useQuery({
		queryKey: portalKeys.proposals,
		queryFn: () => apiClient.get<PortalProposalSummary[]>("/api/portal/proposals"),
		refetchInterval: 60_000,
	});
}
