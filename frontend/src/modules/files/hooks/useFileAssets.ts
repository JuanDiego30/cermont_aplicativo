/**
 * TanStack Query hooks for the Files module.
 *
 * Exposes:
 *   - useUploadFile      — mutation to upload a file (multipart)
 *   - useFilesByEntity   — query to list files owned by an entity
 *   - useDeleteFile      — mutation to soft-delete a file
 *
 * All hooks follow the codebase conventions:
 *   - Stable query keys via filesKeys
 *   - Cache invalidation on mutation success (refetch entity lists)
 *   - No direct fetch — all calls go through files.api.ts → apiClient
 */

import type { FileAssetRef } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	deleteFile,
	type ListFilesByEntityInput,
	listFilesByEntity,
	type UploadFileInput,
	uploadFile,
} from "../api/files.api";
import { filesKeys, type ListFilesFilters } from "../model/queryKeys";

/**
 * Upload a file. On success, invalidates the entity list cache so the
 * new ref appears in any open `useFilesByEntity` hooks.
 */
export function useUploadFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UploadFileInput) => uploadFile(input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: filesKeys.list({
					entityType: variables.entityType,
					entityId: variables.entityId,
				} as ListFilesFilters),
			});
		},
	});
}

/**
 * List all files owned by a specific entity.
 */
export function useFilesByEntity(input: ListFilesByEntityInput) {
	return useQuery<FileAssetRef[]>({
		queryKey: filesKeys.list(input as ListFilesFilters),
		queryFn: () => listFilesByEntity(input),
		staleTime: 30_000,
		enabled: Boolean(input.entityType && input.entityId),
	});
}

/**
 * Soft-delete a file. On success, invalidates both the detail and any
 * list queries for the affected entity (entityType/entityId are derived
 * from the variables passed to mutate, since the backend doesn't echo them
 * back on delete).
 */
export function useDeleteFile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: {
			id: string;
			entityType: import("@cermont/shared-types").FileAssetEntityType;
			entityId: string;
		}) => deleteFile(input.id),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: filesKeys.detail(variables.id) });
			queryClient.invalidateQueries({
				queryKey: filesKeys.list({
					entityType: variables.entityType,
					entityId: variables.entityId,
				} as ListFilesFilters),
			});
		},
	});
}
