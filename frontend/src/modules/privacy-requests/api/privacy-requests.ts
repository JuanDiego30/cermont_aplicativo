/**
 * Privacy requests API service
 */
import { apiClient } from "@/lib/http/api-client";

export interface PrivacyRequest {
	_id: string;
	userId: string;
	type: "access" | "rectification" | "erasure" | "restriction" | "portability";
	status: "pending" | "in_progress" | "completed" | "rejected";
	description: string;
	submittedAt: string;
	resolvedAt?: string;
}

export interface PrivacyRequestInput {
	type: PrivacyRequest["type"];
	description: string;
}

const BASE = "/privacy-requests";

export const privacyRequestsApi = {
	list: async (): Promise<PrivacyRequest[]> => {
		const res = await apiClient.get<{ success: boolean; data: PrivacyRequest[] }>(BASE);
		return res.data;
	},
	get: async (id: string): Promise<PrivacyRequest> => {
		const res = await apiClient.get<{ success: boolean; data: PrivacyRequest }>(`${BASE}/${id}`);
		return res.data;
	},
	create: async (input: PrivacyRequestInput): Promise<PrivacyRequest> => {
		const res = await apiClient.post<{ success: boolean; data: PrivacyRequest }>(BASE, input);
		return res.data;
	},
};
