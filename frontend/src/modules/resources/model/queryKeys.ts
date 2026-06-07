/**
 * Stable TanStack Query keys for the Resources module.
 */

import type { ResourceListFilters } from "../api/resources.api";

export const resourceKeys = {
	all: ["resources"] as const,
	lists: () => [...resourceKeys.all, "list"] as const,
	list: (filters?: ResourceListFilters) => [...resourceKeys.lists(), filters ?? {}] as const,
	details: () => [...resourceKeys.all, "detail"] as const,
	detail: (id: string) => [...resourceKeys.details(), id] as const,
};
