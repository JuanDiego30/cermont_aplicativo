import { apiClient } from "@/lib/http/api-client";
import type { CockpitData } from "../model/cockpit.types";

interface CockpitResponse {
	success: boolean;
	data: CockpitData;
}

export async function fetchCockpit(serviceCaseId: string): Promise<CockpitData> {
	const body = await apiClient.get<CockpitResponse>(
		`/service-cases/${encodeURIComponent(serviceCaseId)}/cockpit`,
	);
	if (!body.success) {
		throw new Error("Failed to fetch cockpit data");
	}
	return body.data;
}

export async function triggerCockpitAction(serviceCaseId: string, action: string): Promise<void> {
	await apiClient.post(`/service-cases/${encodeURIComponent(serviceCaseId)}/step/advance`, {
		action,
	});
}
