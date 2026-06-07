/**
 * Kits API Service
 *
 * Thin wrapper over `apiClient` for `/api/kits` endpoints.
 *
 * Maps to backend `backend/src/modules/kit/`:
 *   POST   /api/kits
 *   GET    /api/kits
 *   PUT    /api/kits/:id
 *   POST   /api/kits/:id/publish
 *   POST   /api/kits/:id/archive
 *   DELETE /api/kits/:id
 */

import type { CreateKitInput, KitTemplate, UpdateKitInput } from "@cermont/shared-types";

import { apiClient } from "@/lib/http/api-client";

export interface KitListFilters {
	status?: string;
	category?: string;
	serviceType?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export interface PageEnvelope<T> {
	success: boolean;
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

/**
 * POST /api/kits — create a new kit template
 */
export async function createKit(input: CreateKitInput): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>("/kits", input);
	return envelope.data;
}

/**
 * GET /api/kits — list kit templates with optional filters
 */
export async function listKits(filters: KitListFilters = {}): Promise<PageEnvelope<KitTemplate>> {
	const searchParams = new URLSearchParams();
	if (filters.status) {
		searchParams.set("status", filters.status);
	}
	if (filters.category) {
		searchParams.set("category", filters.category);
	}
	if (filters.serviceType) {
		searchParams.set("serviceType", filters.serviceType);
	}
	if (filters.search) {
		searchParams.set("search", filters.search);
	}
	if (filters.page) {
		searchParams.set("page", String(filters.page));
	}
	if (filters.limit) {
		searchParams.set("limit", String(filters.limit));
	}

	const qs = searchParams.toString();
	return apiClient.get<PageEnvelope<KitTemplate>>(`/kits${qs ? `?${qs}` : ""}`);
}

/**
 * PUT /api/kits/:id — update a kit template
 */
export async function updateKit(id: string, input: UpdateKitInput): Promise<KitTemplate> {
	const envelope = await apiClient.put<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}`,
		input,
	);
	return envelope.data;
}

/**
 * DELETE /api/kits/:id — delete a kit template (draft only)
 */
export async function deleteKit(id: string): Promise<void> {
	await apiClient.delete<{ success: true; data: null }>(`/kits/${encodeURIComponent(id)}`);
}

/**
 * POST /api/kits/:id/publish — publish a draft kit
 */
export async function publishKit(id: string): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}/publish`,
		{},
	);
	return envelope.data;
}

/**
 * POST /api/kits/:id/archive — archive a published kit
 */
export async function archiveKit(id: string): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}/archive`,
		{},
	);
	return envelope.data;
}
