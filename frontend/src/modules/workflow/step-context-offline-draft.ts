"use client";

/**
 * Step Context Offline Draft — Stores step form drafts in IndexedDB for
 * offline resume capability. Each draft is keyed by serviceCaseId + stepCode
 * so users can continue working on a step even without connectivity.
 */

import type { CermontOperationalStepCode, FieldOverride, OfflineJsonObject } from "@cermont/shared-types";
import { offlineDb } from "@/lib/offline/offline-db";

export interface StepContextDraft {
	serviceCaseId: string;
	stepCode: CermontOperationalStepCode;
	payload: Record<string, unknown>;
	overrides: FieldOverride[];
	baseContextRevision: string;
	clientMutationId: string;
	updatedAt: string;
}

const DRAFT_PREFIX = "step-context-draft";

function draftKey(serviceCaseId: string, stepCode: string): string {
	return `${DRAFT_PREFIX}:${serviceCaseId}:${stepCode}`;
}

/**
 * Saves a step form draft to IndexedDB.
 */
export async function saveStepContextDraft(draft: StepContextDraft): Promise<void> {
	const key = draftKey(draft.serviceCaseId, draft.stepCode);
	await offlineDb.offlineMeta.put({
		key,
		value: draft as unknown as OfflineJsonObject,
		updatedAt: new Date().toISOString(),
	});
}

/**
 * Loads a saved step form draft from IndexedDB.
 */
export async function loadStepContextDraft(
	serviceCaseId: string,
	stepCode: CermontOperationalStepCode,
): Promise<StepContextDraft | null> {
	const key = draftKey(serviceCaseId, stepCode);
	const record = await offlineDb.offlineMeta.get(key);
	if (!record) { return null; }
	return record.value as unknown as StepContextDraft;
}

/**
 * Removes a saved step form draft after successful submission.
 */
export async function removeStepContextDraft(
	serviceCaseId: string,
	stepCode: string,
): Promise<void> {
	const key = draftKey(serviceCaseId, stepCode);
	await offlineDb.offlineMeta.delete(key);
}

/**
 * Lists all saved step context drafts for a given service case.
 */
export async function listStepContextDrafts(
	serviceCaseId: string,
): Promise<StepContextDraft[]> {
	const prefix = draftKey(serviceCaseId, "");
	const allRecords = await offlineDb.offlineMeta
		.filter((r) => r.key.startsWith(prefix))
		.toArray();
	return allRecords.map((r) => r.value as unknown as StepContextDraft);
}
