/**
 * TanStack Query hooks for the Resources module.
 *
 * Exposes:
 *   - useCreateResource       — mutation to create
 *   - useResourceList         — query to list with filters
 *   - useResourceDetail       — query to fetch single resource
 *   - useUpdateResource       — mutation to update
 *   - useDeleteResource       — mutation to delete
 *   - useAttachResourceImage  — mutation to attach image
 *   - useDetachResourceImage  — mutation to detach image
 */

import type { CreateResource, FileAssetRef, UpdateResource } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	attachResourceImage,
	createResource,
	deleteResource,
	detachResourceImage,
	getResourceById,
	listResources,
	type ResourceListFilters,
	updateResource,
} from "../api/resources.api";
import { resourceKeys } from "../model/queryKeys";

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
 * Attach an image ref to a resource. Invalidates detail cache.
 */
export function useAttachResourceImage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, image }: { id: string; image: FileAssetRef }) =>
			attachResourceImage(id, image),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: resourceKeys.detail(variables.id) });
		},
	});
}

/**
 * Detach an image ref from a resource. Invalidates detail cache.
 */
export function useDetachResourceImage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, imageId }: { id: string; imageId: string }) =>
			detachResourceImage(id, imageId),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: resourceKeys.detail(variables.id) });
		},
	});
}
