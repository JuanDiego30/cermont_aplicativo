import type { SystemConfig, UpdateSystemSettings } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

interface ApiEnvelope<T> {
	success: true;
	data: T;
}

export async function getSystemConfig(): Promise<SystemConfig> {
	const response = await apiClient.get<ApiEnvelope<SystemConfig>>("/system-config");
	return response.data;
}

export async function toggleSystemFeatureFlag(
	key: string,
	enabled: boolean,
): Promise<SystemConfig> {
	const response = await apiClient.put<ApiEnvelope<SystemConfig>>(
		`/system-config/toggle-flag/${encodeURIComponent(key)}`,
		{ enabled },
	);
	return response.data;
}

export async function updateSystemSettings(settings: UpdateSystemSettings): Promise<SystemConfig> {
	const response = await apiClient.put<ApiEnvelope<SystemConfig>>(
		"/system-config/settings",
		settings,
	);
	return response.data;
}
