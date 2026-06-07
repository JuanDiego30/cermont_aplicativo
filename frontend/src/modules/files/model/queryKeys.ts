/**
 * Stable TanStack Query keys for the Files module.
 *
 * Centralizing query keys here prevents stale-cache bugs caused by ad-hoc
 * key construction at call sites.
 *
 * Pattern:
 *   - list:    filesKeys.list(filters)
 *   - detail:  filesKeys.detail(id)
 */

import type { FileAssetCategory, FileAssetEntityType } from "@cermont/shared-types";

export interface ListFilesFilters {
	entityType: FileAssetEntityType;
	entityId: string;
	category?: FileAssetCategory;
	includeDeleted?: boolean;
}

export const filesKeys = {
	all: ["files"] as const,
	lists: () => [...filesKeys.all, "list"] as const,
	list: (filters: ListFilesFilters) => [...filesKeys.lists(), filters] as const,
	details: () => [...filesKeys.all, "detail"] as const,
	detail: (id: string) => [...filesKeys.details(), id] as const,
};
