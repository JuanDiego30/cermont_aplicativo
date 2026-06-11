"use client";

/**
 * Inventory — TanStack Query hooks
 */

import type { CreateInventoryItemInput, RegisterStockMovementInput } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createInventoryItem,
	getItemMovements,
	type InventoryListFilters,
	listInventoryItems,
	registerStockMovement,
} from "./api/inventory-api";

export const INVENTORY_KEYS = {
	all: ["inventory"] as const,
	list: (filters: InventoryListFilters) => [...INVENTORY_KEYS.all, "list", filters] as const,
	movements: (itemId: string) => [...INVENTORY_KEYS.all, "movements", itemId] as const,
};

export function useInventoryItems(filters: InventoryListFilters = {}) {
	return useQuery({
		queryKey: INVENTORY_KEYS.list(filters),
		queryFn: () => listInventoryItems(filters),
	});
}

export function useItemMovements(itemId: string) {
	return useQuery({
		queryKey: INVENTORY_KEYS.movements(itemId),
		queryFn: () => getItemMovements(itemId),
		enabled: Boolean(itemId),
	});
}

export function useCreateInventoryItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateInventoryItemInput) => createInventoryItem(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
		},
	});
}

export function useRegisterStockMovement() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ itemId, input }: { itemId: string; input: RegisterStockMovementInput }) =>
			registerStockMovement(itemId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
		},
	});
}
