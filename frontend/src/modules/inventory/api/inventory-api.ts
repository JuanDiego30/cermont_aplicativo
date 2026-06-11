/**
 * Inventory API Service
 *
 * Thin wrapper over `apiClient` for `/api/inventory` endpoints.
 */

import type {
	CreateInventoryItemInput,
	InventoryItem,
	RegisterStockMovementInput,
	StockMovement,
} from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

export interface InventoryListFilters {
	page?: number;
	limit?: number;
	category?: string;
	lowStock?: boolean;
	search?: string;
}

export interface InventoryListEnvelope {
	success: boolean;
	data: InventoryItem[];
	pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function listInventoryItems(
	filters: InventoryListFilters = {},
): Promise<InventoryListEnvelope> {
	const searchParams = new URLSearchParams();
	if (filters.page) {
		searchParams.set("page", String(filters.page));
	}
	if (filters.limit) {
		searchParams.set("limit", String(filters.limit));
	}
	if (filters.category) {
		searchParams.set("category", filters.category);
	}
	if (filters.lowStock) {
		searchParams.set("lowStock", "true");
	}
	if (filters.search) {
		searchParams.set("search", filters.search);
	}
	const query = searchParams.toString();
	return apiClient.get<InventoryListEnvelope>(`/inventory${query ? `?${query}` : ""}`);
}

export async function createInventoryItem(input: CreateInventoryItemInput): Promise<InventoryItem> {
	const envelope = await apiClient.post<{ success: true; data: InventoryItem }>(
		"/inventory",
		input,
	);
	return envelope.data;
}

export async function registerStockMovement(
	itemId: string,
	input: RegisterStockMovementInput,
): Promise<{ item: InventoryItem; movement: StockMovement }> {
	const envelope = await apiClient.post<{
		success: true;
		data: { item: InventoryItem; movement: StockMovement };
	}>(`/inventory/${itemId}/movements`, input);
	return envelope.data;
}

export async function getItemMovements(itemId: string): Promise<StockMovement[]> {
	const envelope = await apiClient.get<{ success: boolean; data: StockMovement[] }>(
		`/inventory/${itemId}/movements`,
	);
	return envelope.data;
}
