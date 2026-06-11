/**
 * Kits API Service
 *
 * Thin wrapper over `apiClient` for `/api/kits` endpoints.
 */

import type {
	CreateKitInput,
	KitCatalogOptions,
	KitTemplate,
	UpdateKitInput,
} from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

export interface KitListFilters {
	status?: string;
	activityType?: string;
	serviceCategory?: string;
	riskLevel?: string;
	search?: string;
	tags?: string;
	page?: number;
	limit?: number;
}

export interface KitListEnvelope {
	success: boolean;
	data: KitTemplate[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface KitDeleteResult {
	success: boolean;
	data: {
		deleted: boolean;
		message: string;
	};
}

export interface KitApplyResult {
	planningId: string;
	kitId: string;
	addedItems: number;
	duplicatedItems: number;
	missingCriticalItems: string[];
	readinessScore: number;
	readinessStatus: string;
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

export async function createKit(input: CreateKitInput): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>("/kits", input);
	return envelope.data;
}

export async function listKits(filters: KitListFilters = {}): Promise<KitListEnvelope> {
	const searchParams = new URLSearchParams();
	if (filters.status) {
		searchParams.set("status", filters.status);
	}
	if (filters.activityType) {
		searchParams.set("activityType", filters.activityType);
	}
	if (filters.serviceCategory) {
		searchParams.set("serviceCategory", filters.serviceCategory);
	}
	if (filters.riskLevel) {
		searchParams.set("riskLevel", filters.riskLevel);
	}
	if (filters.search) {
		searchParams.set("search", filters.search);
	}
	if (filters.tags) {
		searchParams.set("tags", filters.tags);
	}
	if (filters.page) {
		searchParams.set("page", String(filters.page));
	}
	if (filters.limit) {
		searchParams.set("limit", String(filters.limit));
	}

	const qs = searchParams.toString();
	return apiClient.get<KitListEnvelope>(`/kits${qs ? `?${qs}` : ""}`);
}

export async function getKitById(id: string): Promise<KitTemplate> {
	const envelope = await apiClient.get<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}`,
	);
	return envelope.data;
}

export async function updateKit(id: string, input: UpdateKitInput): Promise<KitTemplate> {
	const envelope = await apiClient.patch<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}`,
		input,
	);
	return envelope.data;
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────

export async function deleteKit(id: string): Promise<KitDeleteResult> {
	return apiClient.delete<KitDeleteResult>(`/kits/${encodeURIComponent(id)}`);
}

export async function activateKit(id: string): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}/activate`,
		{},
	);
	return envelope.data;
}

export async function archiveKit(id: string, reason: string): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}/archive`,
		{ reason },
	);
	return envelope.data;
}

export async function restoreKit(id: string): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}/restore`,
		{},
	);
	return envelope.data;
}

export async function duplicateKit(id: string, name?: string): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(id)}/duplicate`,
		{ name },
	);
	return envelope.data;
}

// ─── Planning Integration ──────────────────────────────────────────────────

export async function applyKitToPlanning(
	kitId: string,
	planningId: string,
): Promise<KitApplyResult> {
	const envelope = await apiClient.post<{ success: true; data: KitApplyResult }>(
		`/kits/${encodeURIComponent(kitId)}/apply-to-planning/${encodeURIComponent(planningId)}`,
		{ planningId },
	);
	return envelope.data;
}

// ─── Attachments ───────────────────────────────────────────────────────────

export async function addKitAttachment(
	kitId: string,
	attachment: {
		fileName: string;
		originalName: string;
		mimeType: string;
		fileSize: number;
		url: string;
		purpose: string;
	},
): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(kitId)}/attachments`,
		attachment,
	);
	return envelope.data;
}

export async function removeKitAttachment(
	kitId: string,
	attachmentId: string,
): Promise<KitTemplate> {
	const envelope = await apiClient.delete<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(kitId)}/attachments/${encodeURIComponent(attachmentId)}`,
	);
	return envelope.data;
}

// ─── Catalog Options ───────────────────────────────────────────────────────

export async function getKitCatalogOptions(): Promise<KitCatalogOptions> {
	const envelope = await apiClient.get<{ success: true; data: KitCatalogOptions }>(
		"/kits/catalog/options",
	);
	return envelope.data;
}

// ─── Attachments ───────────────────────────────────────────────────────────

export interface KitAttachmentInput {
	fileName: string;
	originalName: string;
	mimeType: string;
	fileSize: number;
	url: string;
	purpose: string;
}

export async function addKitAttachmentApi(
	kitId: string,
	attachment: KitAttachmentInput,
): Promise<KitTemplate> {
	const envelope = await apiClient.post<{ success: true; data: KitTemplate }>(
		`/kits/${encodeURIComponent(kitId)}/attachments`,
		attachment,
	);
	return envelope.data;
}

export async function removeKitAttachmentApi(kitId: string, attachmentId: string): Promise<void> {
	await apiClient.delete(
		`/kits/${encodeURIComponent(kitId)}/attachments/${encodeURIComponent(attachmentId)}`,
	);
}
