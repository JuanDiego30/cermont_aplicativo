"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInvoicePipeline } from "../api/invoice.api";

export function useInvoicePipeline(serviceCaseId: string) {
	return useQuery({
		queryKey: ["invoice-pipeline", serviceCaseId],
		queryFn: () => fetchInvoicePipeline(serviceCaseId),
		enabled: !!serviceCaseId,
		staleTime: 30_000,
	});
}
