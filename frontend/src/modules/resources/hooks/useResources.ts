/**
 * TanStack Query hooks for the Resources module.
 *
 * Exposes:
 *   - useCreateResource       — mutation to create
 *   - useResourceList         — query to list with filters
 *   - useResourceDetail       — query to fetch single resource
 *   - useUpdateResource       — mutation to update
 *   - useDeleteResource       — mutation to delete
 *   - useUploadResourceImage  — upload and persist an image
 *   - useDeleteResourceImage  — soft-delete a persisted image
 */

import type {
	CreateResource,
	FileAssetCategory,
	FileAssetEntityType,
	FileAssetRef,
	ResourceType,
	UpdateResource,
} from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteFile, uploadFile } from "@/modules/files/api/files.api";
import {
	createResource,
	deleteResource,
	getResourceById,
	listResources,
	type ResourceListFilters,
	updateResource,
} from "../api/resources.api";
import { resourceKeys } from "../model/queryKeys";

interface ResourceImageOwnership {
	entityType: FileAssetEntityType;
	category: FileAssetCategory;
}

function getResourceImageOwnership(resourceType: ResourceType): ResourceImageOwnership {
	switch (resourceType) {
		case "equipment":
		case "vehicle":
			return { entityType: "equipment", category: "equipment_image" };
		case "material":
		case "spare_part":
			return { entityType: "material", category: "material_image" };
		case "safety_item":
			return { entityType: "safety_item", category: "safety_item_image" };
		case "tool":
		case "labor_role":
		case "certification_requirement":
			return { entityType: "tool", category: "tool_image" };
	}
}

/**
 * Create a resource. Invalidates the resource list on success.
 */
export function useCreateResource() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateResource) => createResource(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
		},
	});
}

/**
 * List resources with optional filters.
 */
export function useResourceList(filters: ResourceListFilters = {}) {
	return useQuery({
		queryKey: resourceKeys.list(filters),
		queryFn: () => listResources(filters),
		staleTime: 30_000,
	});
}

/**
 * Fetch a single resource by id.
 */
export function useResourceDetail(id: string | undefined) {
	return useQuery({
		queryKey: resourceKeys.detail(id ?? ""),
		queryFn: () => getResourceById(id as string),
		enabled: Boolean(id),
	});
}

/**
 * Update a resource. Invalidates both the detail and list caches.
 */
export function useUpdateResource() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateResource }) => updateResource(id, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: resourceKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
		},
	});
}

/**
 * Delete a resource. Invalidates the list cache.
 */
export function useDeleteResource() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteResource(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
		},
	});
}

/**
 * Persist a resource image through the canonical files service. The backend
 * appends the returned FileAssetRef to the resource atomically.
 */
export function useUploadResourceImage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			resourceId,
			resourceType,
			file,
		}: {
			resourceId: string;
			resourceType: ResourceType;
			file: File;
		}) => {
			const ownership = getResourceImageOwnership(resourceType);
			return uploadFile({
				file,
				entityId: resourceId,
				entityType: ownership.entityType,
				category: ownership.category,
			});
		},
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: resourceKeys.detail(variables.resourceId),
			});
		},
	});
}

/**
 * Soft-delete a resource image and remove its embedded FileAssetRef.
 */
export function useDeleteResourceImage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ file }: { resourceId: string; file: FileAssetRef }) => deleteFile(file.id),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: resourceKeys.detail(variables.resourceId),
			});
		},
	});
}
