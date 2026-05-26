/**
 * Client Mutation ID — Idempotent offline mutations
 *
 * Generates and tracks clientMutationId for offline mutations,
 * preventing duplicate processing when sync is re-established.
 *
 * Backend contract:
 * - POST/PUT/PATCH/DELETE requests with clientMutationId are idempotent
 * - If backend already processed this mutationId, it returns the existing result
 * - This prevents duplicates from retries and offline sync
 */

import { v4 as uuidv4 } from "uuid";

const MUTATION_IDS_KEY = "cermont.mutation.ids";
const MAX_STORED_IDS = 500;

export interface MutationRecord {
	clientMutationId: string;
	endpoint: string;
	method: string;
	createdAt: number;
	status: "pending" | "synced" | "failed";
	responseStatus?: number;
}

function loadRecords(): MutationRecord[] {
	try {
		const stored = localStorage.getItem(MUTATION_IDS_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function saveRecords(records: MutationRecord[]): void {
	try {
		// Keep only recent records to avoid unbounded growth
		const trimmed = records.slice(0, MAX_STORED_IDS);
		localStorage.setItem(MUTATION_IDS_KEY, JSON.stringify(trimmed));
	} catch {
		// localStorage full — clear and try again
		try {
			localStorage.removeItem(MUTATION_IDS_KEY);
		} catch {
			// Silently fail
		}
	}
}

/**
 * Generate a new clientMutationId and record it
 */
export function createClientMutationId(endpoint: string, method: string): string {
	const records = loadRecords();
	const clientMutationId = uuidv4();
	records.unshift({
		clientMutationId,
		endpoint,
		method,
		createdAt: Date.now(),
		status: "pending",
	});
	saveRecords(records);
	return clientMutationId;
}

/**
 * Mark a clientMutationId as synced (successfully processed by backend)
 */
export function markMutationSynced(clientMutationId: string, responseStatus: number): void {
	const records = loadRecords();
	const record = records.find((r) => r.clientMutationId === clientMutationId);
	if (record) {
		record.status = "synced";
		record.responseStatus = responseStatus;
		saveRecords(records);
	}
}

/**
 * Mark a clientMutationId as failed
 */
export function markMutationFailed(clientMutationId: string): void {
	const records = loadRecords();
	const record = records.find((r) => r.clientMutationId === clientMutationId);
	if (record) {
		record.status = "failed";
		saveRecords(records);
	}
}

/**
 * Get all pending mutation records
 */
export function getPendingMutations(): MutationRecord[] {
	return loadRecords().filter((r) => r.status === "pending");
}

/**
 * Get pending mutation count (for badge display)
 */
export function getPendingMutationCount(): number {
	return getPendingMutations().length;
}
