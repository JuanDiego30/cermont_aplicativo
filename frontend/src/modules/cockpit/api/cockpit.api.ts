import type { ServiceCaseWorkflowViewModel } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";
import type { CockpitData } from "../model/cockpit.types";
import { transformWorkflowToCockpitData } from "../utils/cockpitTransformer";

interface WorkflowResponse {
	success: boolean;
	data: ServiceCaseWorkflowViewModel;
}

export async function fetchCockpit(serviceCaseId: string): Promise<CockpitData> {
	const body = await apiClient.get<WorkflowResponse>(
		`/service-cases/${encodeURIComponent(serviceCaseId)}/cockpit`,
	);
	if (!body.success) {
		throw new Error("Failed to fetch cockpit data");
	}
	return transformWorkflowToCockpitData(body.data);
}

export async function triggerCockpitAction(serviceCaseId: string, action: string): Promise<void> {
	await apiClient.post(`/service-cases/${encodeURIComponent(serviceCaseId)}/step/advance`, {
		action,
	});
}
