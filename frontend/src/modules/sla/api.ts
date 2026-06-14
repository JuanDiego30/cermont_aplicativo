import type { SlaDashboard } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

interface ApiEnvelope<T> {
	success: true;
	data: T;
}

export async function getSlaDashboard(): Promise<SlaDashboard> {
	const response = await apiClient.get<ApiEnvelope<SlaDashboard>>("/sla/dashboard");
	return response.data;
}
