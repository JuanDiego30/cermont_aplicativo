/**
 * usePortalServiceCases — TanStack Query hooks for the client portal module.
 *
 * Provides read-only access to the authenticated client's service cases and
 * their detail view. Query keys are stable and centralized via `portalKeys`
 * for cache invalidation across portal pages.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

const BASE = "/portal/service-cases";

export const portalKeys = {
	all: ["portal"] as const,
	serviceCases: () => [...portalKeys.all, "service-cases"] as const,
	serviceCaseDetail: (id: string) => [...portalKeys.all, "detail", id] as const,
};

type PortalServiceCase = {
	_id: string;
	code?: string;
	status: string;
	serviceType?: string;
	scheduledStartDate?: string;
};

type PortalServiceCaseDetail = PortalServiceCase & {
	documents: Array<{ _id: string; originalName: string; url: string }>;
	stages: Array<{ key: string; label: string; status: string }>;
};

export function usePortalServiceCases() {
	return useQuery({
		queryKey: portalKeys.serviceCases(),
		queryFn: async () => {
			const envelope = await apiClient.get<{ success: true; data: PortalServiceCase[] }>(BASE);
			return envelope.data;
		},
	});
}

export function usePortalServiceCaseDetail(id: string) {
	return useQuery({
		queryKey: portalKeys.serviceCaseDetail(id),
		queryFn: async () => {
			const envelope = await apiClient.get<{ success: true; data: PortalServiceCaseDetail }>(
				`${BASE}/${id}`,
			);
			return envelope.data;
		},
		enabled: !!id,
	});
}