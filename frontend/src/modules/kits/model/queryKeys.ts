/**
 * Stable TanStack Query keys for the Kits module.
 */

import type { KitListFilters } from "../api/kits.api";

export const kitKeys = {
	all: ["kits"] as const,
	lists: () => [...kitKeys.all, "list"] as const,
	list: (filters?: KitListFilters) => [...kitKeys.lists(), filters ?? {}] as const,
	details: () => [...kitKeys.all, "detail"] as const,
	detail: (id: string) => [...kitKeys.details(), id] as const,
	templates: () => [...kitKeys.all, "templates"] as const,
	byServiceType: (serviceTypeId: string) =>
		[...kitKeys.all, "byServiceType", serviceTypeId] as const,
};
