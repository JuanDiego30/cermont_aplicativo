import { apiClient } from "@/lib/http/api-client";

export interface PreflightChecklistItem {
	id: string;
	label: string;
	isBlocking: boolean;
	checked: boolean;
}

export interface SubmitPreflightInput {
	items: PreflightChecklistItem[];
	eppComplete: boolean;
	astSigned: boolean;
	ptwObtained: boolean;
	toolsValidated: boolean;
	vehicleDocumentsOk: boolean;
	certificationsCurrent: boolean;
}

export async function submitPreflight(sessionId: string, data: SubmitPreflightInput) {
	return apiClient.post(`/execution-sessions/${encodeURIComponent(sessionId)}/preflight`, data);
}
