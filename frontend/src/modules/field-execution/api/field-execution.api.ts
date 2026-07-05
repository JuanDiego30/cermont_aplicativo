import { apiClient } from "@/lib/http/api-client";

interface PreflightChecklistItem {
	id: string;
	label: string;
	isBlocking: boolean;
	checked: boolean;
}

interface SubmitPreflightInput {
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

export async function fetchExecutionSession(sessionId: string) {
	return apiClient.get(`/execution-sessions/${encodeURIComponent(sessionId)}`);
}

export async function startExecution(sessionId: string) {
	return apiClient.post(`/execution-sessions/${encodeURIComponent(sessionId)}/start`, {});
}

export async function completeExecution(sessionId: string) {
	return apiClient.post(`/execution-sessions/${encodeURIComponent(sessionId)}/complete`, {});
}
