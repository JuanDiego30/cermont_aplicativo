/**
 * Offline Queue — Public API
 *
 * Manages offline action queue with IndexedDB persistence.
 * Split into:
 * - offline-queue-types.ts: Type definitions and constants
 * - offline-queue-storage.ts: IndexedDB operations
 * - offline-queue-executor.ts: Action execution logic
 */
import { createLogger } from "@/_shared/lib/monitoring/logger";
import { buildDedupeKey, executeAction } from "./offline-queue-executor";
import { getPendingActions, removeAction, saveAction, updateAction } from "./offline-queue-storage";
import {
	MAX_RETRIES,
	type OfflineAction,
	type OfflineQueueStats,
	RETRY_BASE_DELAY_MS,
} from "./offline-queue-types";

// Re-export types
export type { OfflineAction, OfflineQueueStats } from "./offline-queue-types";

const logger = createLogger("pwa:offline-queue");

function calculateNextRetryAt(retries: number): number {
	return Date.now() + RETRY_BASE_DELAY_MS * 2 ** Math.max(retries - 1, 0);
}

function shouldSkipAction(action: OfflineAction, now: number): boolean {
	if (action.status === "failed") {
		return true;
	}
	if (typeof action.nextRetryAt === "number" && action.nextRetryAt > now) {
		return true;
	}
	return false;
}

async function processAction(
	action: OfflineAction,
): Promise<{ synced: boolean; shouldFail: boolean }> {
	const result = await executeAction(action);

	if (result.ok) {
		await removeAction(action.id);
		return { synced: true, shouldFail: false };
	}

	const nextRetries = action.retries + 1;
	const shouldFail = result.permanent || nextRetries >= MAX_RETRIES;

	await updateAction({
		...action,
		retries: nextRetries,
		status: shouldFail ? "failed" : "pending",
		lastError: result.error,
		nextRetryAt: shouldFail ? undefined : calculateNextRetryAt(nextRetries),
	});

	return { synced: false, shouldFail };
}

/**
 * Enqueue an action for later synchronization
 */
export async function queueOfflineAction(
	action: Omit<OfflineAction, "id" | "createdAt" | "retries">,
): Promise<void> {
	try {
		const dedupeKey = buildDedupeKey(action);
		const existingActions = await getPendingActions();
		const duplicateAction = existingActions.find(
			(pendingAction) => pendingAction.dedupeKey === dedupeKey && pendingAction.status !== "failed",
		);

		if (duplicateAction) {
			logger.info("Duplicate offline action ignored", {
				actionType: action.type,
				actionId: duplicateAction.id,
			});
			return;
		}

		const offlineAction: OfflineAction = {
			...action,
			id: `${action.type}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
			createdAt: Date.now(),
			retries: 0,
			status: "pending",
			dedupeKey,
		};

		await saveAction(offlineAction);
	} catch (err) {
		logger.error("Failed to enqueue offline action", {
			error: err instanceof Error ? err.message : String(err),
			name: err instanceof Error ? err.name : "UnknownError",
		});
		throw err;
	}
}

/**
 * Sync all pending actions
 */
export async function flushOfflineQueue(): Promise<{ synced: number; failed: number }> {
	const pendingActions = (await getPendingActions()).sort((a, b) => a.createdAt - b.createdAt);
	let synced = 0;
	let failed = 0;
	const now = Date.now();

	for (const action of pendingActions) {
		if (shouldSkipAction(action, now)) {
			continue;
		}

		const result = await processAction(action);

		if (result.synced) {
			synced++;
		} else {
			failed++;
		}
	}

	return { synced, failed };
}

/**
 * Get queue statistics
 */
export async function getOfflineQueueStats(): Promise<OfflineQueueStats> {
	const actions = await getPendingActions();
	const failed = actions.filter((a) => a.status === "failed").length;
	return { pending: actions.length - failed, failed, total: actions.length };
}
