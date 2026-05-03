/**
 * Offline Queue — Type Definitions
 */

export interface OfflineAction {
	id: string;
	type:
		| "CREATE_EVIDENCE"
		| "CREATE_CHECKLIST"
		| "UPDATE_CHECKLIST"
		| "COMPLETE_CHECKLIST"
		| "UPDATE_ORDER_STATUS"
		| "ADD_COST"
		| "UPDATE_ORDER"
		| "CREATE_INSPECTION"
		| "UPDATE_INSPECTION"
		| "UPSERT_CLOSURE"
		| "COMPLETE_EXECUTION_PHASE"
		| "COMPLETE_PROCEDURE_STEP";
	payload: Record<string, unknown>;
	createdAt: number;
	retries: number;
	status?: "pending" | "failed";
	lastError?: string;
	nextRetryAt?: number;
	dedupeKey?: string;
}

export interface OfflineQueueStats {
	pending: number;
	failed: number;
	total: number;
}

export type OfflineExecutionResult =
	| { ok: true }
	| { ok: false; error: string; permanent: boolean };

export const DB_NAME = "CermontOfflineDB";
export const DB_VERSION = 2;
export const STORE_NAME = "pending_actions";
export const MAX_RETRIES = 3;
export const RETRY_BASE_DELAY_MS = 30_000;
export const PERMANENT_FAILURE_STATUSES = new Set([400, 401, 403, 404, 409, 410, 413, 415, 422]);
