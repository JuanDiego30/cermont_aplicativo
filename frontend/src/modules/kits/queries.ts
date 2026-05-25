import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/http/api-client";

// ── Types ──────────────────────────────────────────────────────
interface KitTemplate {
	id: string;
	name: string;
	description: string;
	type: "maintenance" | "inspection" | "installation" | "repair" | "decommission" | "other";
	materials: Array<{
		name: string;
		quantity: number;
		unit: string;
		unitCost?: number;
		delivered?: boolean;
	}>;
}

interface KitTemplatesResponse {
	success?: boolean;
	data?: KitTemplate[];
}

// ── Query Keys ────────────────────────────────────────────────
const KITS_KEYS = {
	all: ["kits"] as const,
	templates: ["kits", "templates"] as const,
} as const;

// ── Queries ───────────────────────────────────────────────────
export function useKitTemplates() {
	return useQuery({
		queryKey: KITS_KEYS.templates,
		queryFn: async () => {
			const body = await apiClient.get<KitTemplatesResponse>("/kits/templates");
			return body?.data ?? [];
		},
		staleTime: 30_000,
		placeholderData: keepPreviousData,
	});
}
