import type { Evidence } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

interface EvidenceListContract {
	success?: boolean;
	data?: Evidence[];
}

export async function listEvidences(orderId: string): Promise<Evidence[]> {
	const body = await apiClient.get<EvidenceListContract>(`/evidences/order/${orderId}`);

	if (!body?.success || !Array.isArray(body.data)) {
		return [];
	}

	return body.data;
}
