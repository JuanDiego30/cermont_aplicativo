/**
 * Resources API Service
 *
 * Thin wrapper over `apiClient` for `/api/resources` endpoints.
 *
 * Maps to backend `backend/src/modules/resource/`:
 *   POST   /api/resources
 *   GET    /api/resources
 *   GET    /api/resources/:id
 *   PATCH  /api/resources/:id
 *   DELETE /api/resources/:id
 *   POST   /api/resources/:id/images
 *   DELETE /api/resources/:id/images
 */

import type { CreateResource, Resource, UpdateResource } from "@cermont/shared-types";

import { apiClient } from "@/lib/http/api-client";

export interface ResourceListFilters {
	type?: string;
	status?: string;
	active?: boolean;
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
 * POST /api/resources — create a new resource
 */
export async function createResource(input: CreateResource): Promise<Resource> {
	const envelope = await apiClient.post<{ success: true; data: Resource }>("/resources", input);
	return envelope.data;
}

/**
 * GET /api/resources — list resources with optional filters
 */
export async function listResources(
	filters: ResourceListFilters = {},
): Promise<PageEnvelope<Resource>> {
	const searchParams = new URLSearchParams();
	if (filters.type) {
		searchParams.set("type", filters.type);
	}
	if (filters.status) {
		searchParams.set("status", filters.status);
	}
	if (filters.active !== undefined) {
		searchParams.set("active", String(filters.active));
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
	return apiClient.get<PageEnvelope<Resource>>(`/resources${qs ? `?${qs}` : ""}`);
}

/**
 * GET /api/resources/:id — get a single resource
 */
export async function getResourceById(id: string): Promise<Resource> {
	const envelope = await apiClient.get<{ success: true; data: Resource }>(
		`/resources/${encodeURIComponent(id)}`,
	);
	return envelope.data;
}

/**
 * PATCH /api/resources/:id — update a resource
 */
export async function updateResource(id: string, input: UpdateResource): Promise<Resource> {
	const envelope = await apiClient.patch<{ success: true; data: Resource }>(
		`/resources/${encodeURIComponent(id)}`,
		input,
	);
	return envelope.data;
}

/**
 * DELETE /api/resources/:id — delete a resource
 */
export async function deleteResource(id: string): Promise<void> {
	await apiClient.delete<{ success: true; data: null }>(`/resources/${encodeURIComponent(id)}`);
}
