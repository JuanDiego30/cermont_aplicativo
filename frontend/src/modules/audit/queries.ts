"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AuditListFilters } from "./api";
import { listAuditLogs } from "./api";

export const AUDIT_QUERY_KEYS = {
	all: ["audit-logs"] as const,
	list: (filters: AuditListFilters) => [...AUDIT_QUERY_KEYS.all, "list", filters] as const,
};

export function useAuditLogsQuery(filters: AuditListFilters) {
	return useQuery({
		queryKey: AUDIT_QUERY_KEYS.list(filters),
		queryFn: () => listAuditLogs(filters),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
}
