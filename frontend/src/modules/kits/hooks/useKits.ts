/**
 * TanStack Query hooks for the Kits module.
 */

import type { CreateKitInput } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	activateKit,
	archiveKit,
	createKit as createKitApi,
	deleteKit as deleteKitApi,
	duplicateKit,
	getKitById,
	type KitListFilters,
	listKits,
	restoreKit,
} from "../api/kits.api";
import { kitKeys } from "../model/queryKeys";

// ─── Queries ───────────────────────────────────────────────────────────────

export function useKitList(filters: KitListFilters = {}) {
	return useQuery({
		queryKey: kitKeys.list(filters),
		queryFn: () => listKits(filters),
		staleTime: 30_000,
	});
}

export function useKitDetail(id: string) {
	return useQuery({
		queryKey: kitKeys.detail(id),
		queryFn: () => getKitById(id),
		enabled: !!id,
		staleTime: 30_000,
	});
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useCreateKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateKitInput) => createKitApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

export function useDeleteKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteKitApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

export function useActivateKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => activateKit(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: kitKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

export function useArchiveKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, reason }: { id: string; reason: string }) => archiveKit(id, reason),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: kitKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

export function useRestoreKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => restoreKit(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: kitKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}

export function useDuplicateKit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => duplicateKit(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: kitKeys.lists() });
		},
	});
}
