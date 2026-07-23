import type { Evidence } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

interface EvidenceListResponse {
	success?: boolean;
	data?: Evidence[];
	meta?: { total: number; page: number; limit: number; pages: number };
}

export interface PaginatedEvidence {
	items: Evidence[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}

export async function listEvidences(
	orderId: string,
	page = 1,
	limit = 20,
): Promise<PaginatedEvidence> {
	const body = await apiClient.get<EvidenceListResponse>(
		`/evidences/order/${orderId}?page=${page}&limit=${limit}`,
	);

	if (!body?.success || !Array.isArray(body.data)) {
		return { items: [], total: 0, page, limit, pages: 0 };
	}

	return {
		items: body.data,
		total: body.meta?.total ?? body.data.length,
		page: body.meta?.page ?? page,
		limit: body.meta?.limit ?? limit,
		pages: body.meta?.pages ?? 1,
	};
}
