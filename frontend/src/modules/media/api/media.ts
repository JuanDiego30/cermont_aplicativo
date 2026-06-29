import { apiClient } from "@/lib/http/api-client";

export interface MediaAsset {
	id: string;
	ownerType: string;
	ownerId: string;
	category: string;
	description?: string;
	tags?: string[];
	fileAssets: Array<{
		id: string;
		originalName: string;
		storedName: string;
		mimeType: string;
		sizeBytes: number;
		url: string;
		thumbnailUrl?: string;
		storageKey: string;
		checksum?: string;
		width?: number;
		height?: number;
		uploadedBy: string;
		uploadedAt: string;
		entityType: string;
		entityId: string;
		category: string;
		description?: string;
		tags?: string[];
		offlineLocalId?: string;
		syncStatus?: string;
	}>;
	createdAt: string;
	updatedAt: string;
}

export interface MediaListParams {
	ownerType: string;
	ownerId: string;
	page?: number;
	limit?: number;
	category?: string;
}

export interface MediaListResult {
	data: MediaAsset[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export async function listMediaAssets(params: MediaListParams): Promise<MediaListResult> {
	const { ownerType, ownerId, page = 1, limit = 20, category } = params;
	const searchParams = new URLSearchParams({
		ownerType,
		ownerId,
		page: String(page),
		limit: String(limit),
	});
	if (category) {
		searchParams.set("category", category);
	}

	const response = await apiClient.get<MediaListResult>(
		`/media/${ownerType}/${ownerId}?${searchParams}`,
	);
	return response;
}

export async function getMediaAsset(id: string): Promise<MediaAsset> {
	const response = await apiClient.get<{ success: boolean; data: MediaAsset }>(`/media/${id}`);
	return response.data;
}

export async function uploadMediaAsset(
	params: {
		ownerType: string;
		ownerId: string;
		category: string;
		description?: string;
		tags?: string[];
	},
	file: File,
): Promise<MediaAsset> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("ownerType", params.ownerType);
	formData.append("ownerId", params.ownerId);
	formData.append("category", params.category);
	if (params.description) {
		formData.append("description", params.description);
	}
	if (params.tags) {
		formData.append("tags", JSON.stringify(params.tags));
	}

	const response = await apiClient.post<{ success: boolean; data: MediaAsset }>(
		`/media/${params.ownerType}/${params.ownerId}/upload`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return response.data;
}

export async function deleteMediaAsset(id: string): Promise<void> {
	await apiClient.delete(`/media/${id}`);
}
