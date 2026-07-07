/**
 * Files API Service
 *
 * Thin wrapper over `apiClient` for the `/api/files` endpoints. All
 * functions return the unwrapped response `data` field and throw on
 * non-2xx responses (handled centrally by `apiClient`).
 *
 * Maps to backend `backend/src/modules/files/`:
 *   POST   /api/files/upload
 *   GET    /api/files?entityType=...&entityId=...
 *   GET    /api/files/:id
 *   DELETE /api/files/:id
 */

import type { FileAssetCategory, FileAssetEntityType, FileAssetRef } from "@cermont/shared-types";

import { apiClient } from "@/lib/http/api-client";

/**
 * Multipart upload payload. Built from a browser `File` plus the
 * metadata fields required by `FileAssetUploadInputSchema`.
 */
export interface UploadFileInput {
	file: File;
	category: FileAssetCategory;
	entityType: FileAssetEntityType;
	entityId: string;
	description?: string;
	tags?: string[];
	offlineLocalId?: string;
	metadata?: Record<string, string | number | boolean>;
}

/**
 * List query for files owned by a specific entity.
 */
export interface ListFilesByEntityInput {
	entityType: FileAssetEntityType;
	entityId: string;
	category?: FileAssetCategory;
	includeDeleted?: boolean;
}

/**
 * POST /api/files/upload
 * Uploads a file via multipart/form-data and returns the persisted FileAssetRef.
 */
export async function uploadFile(input: UploadFileInput): Promise<FileAssetRef> {
	const formData = new FormData();
	formData.append("file", input.file);
	formData.append("category", input.category);
	formData.append("entityType", input.entityType);
	formData.append("entityId", input.entityId);
	if (input.description !== undefined) {
		formData.append("description", input.description);
	}
	if (input.metadata) {
		formData.append("metadata", JSON.stringify(input.metadata));
	}
	if (input.tags && input.tags.length > 0) {
		for (const tag of input.tags) {
			formData.append("tags", tag);
		}
	}
	if (input.offlineLocalId !== undefined) {
		formData.append("offlineLocalId", input.offlineLocalId);
	}

	const envelope = await apiClient.post<{ success: true; data: FileAssetRef }>(
		"/files/upload",
		formData,
	);
	return envelope.data;
}

/**
 * GET /api/files?entityType=...&entityId=...[&category=...&includeDeleted=...]
 * Lists FileAssets owned by a specific entity.
 */
export async function listFilesByEntity(input: ListFilesByEntityInput): Promise<FileAssetRef[]> {
	const searchParams = new URLSearchParams();
	searchParams.set("entityType", input.entityType);
	searchParams.set("entityId", input.entityId);
	if (input.category) {
		searchParams.set("category", input.category);
	}
	if (input.includeDeleted) {
		searchParams.set("includeDeleted", "true");
	}

	const envelope = await apiClient.get<{ success: true; data: FileAssetRef[] }>(
		`/files?${searchParams.toString()}`,
	);
	return envelope.data;
}

/**
 * GET /api/files/:id
 * Fetches a single FileAsset by id.
 */
export async function getFileById(id: string): Promise<FileAssetRef> {
	const envelope = await apiClient.get<{ success: true; data: FileAssetRef }>(
		`/files/${encodeURIComponent(id)}`,
	);
	return envelope.data;
}

/**
 * DELETE /api/files/:id
 * Soft-deletes a FileAsset and removes its ref from the parent document.
 */
export async function deleteFile(id: string): Promise<void> {
	await apiClient.delete<{ success: true; data: null }>(`/files/${encodeURIComponent(id)}`);
}
