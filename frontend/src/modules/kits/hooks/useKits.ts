/**
 * TanStack Query hooks for the Kits module.
 *
 * Exposes:
 *   - useCreateKit       — mutation to create
 *   - useKitList         — query to list with filters
 *   - useUpdateKit       — mutation to update
 *   - useDeleteKit       — mutation to delete
 *   - usePublishKit      — mutation to publish
 *   - useArchiveKit      — mutation to archive
 */

import type { CreateKitInput, UpdateKitInput } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	archiveKit,
	createKit,
	deleteKit,
	type KitListFilters,
	listKits,
	publishKit,
	updateKit,
} from "../api/kits.api";
import { kitKeys } from "../model/queryKeys";

/**
 * Create a kit template. Invalidates the kit list on success.
 */
export function useCreateKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateKitInput) => createKit(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

/**
 * List kit templates with optional filters.
 */
export function useKitList(filters: KitListFilters = {}) {
	return useQuery({
		queryKey: kitKeys.list(filters),
		queryFn: () => listKits(filters),
		staleTime: 30_000,
	});
}

/**
 * Update a kit template. Invalidates both the detail and list caches.
 */
export function useUpdateKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateKitInput }) => updateKit(id, input),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: kitKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

/**
 * Delete a kit template (draft only). Invalidates the list cache.
 */
export function useDeleteKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteKit(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

/**
 * Publish a draft kit. Invalidates detail and list caches.
 */
export function usePublishKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => publishKit(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: kitKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

/**
 * Archive a published kit. Invalidates detail and list caches.
 */
export function useArchiveKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => archiveKit(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: kitKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}
