"use client";

import type { CreateChecklistInput } from "@cermont/shared-types";
import type { UseMutationResult } from "@tanstack/react-query";
import { createLogger } from "@/lib/monitoring/logger";
import { enqueue, type SyncQueueEntry } from "@/lib/offline/sync-queue";
import {
	type CompleteChecklistVariables,
	type UpdateChecklistItemVariables,
	useCompleteChecklist,
	useCreateChecklist,
	useUpdateChecklistItem,
} from "../queries";

const logger = createLogger("offline-sync:checklists");

function createUuid(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isNetworkFailure(error: unknown): boolean {
	if (typeof navigator !== "undefined" && navigator.onLine === false) {
		return true;
	}

	return error instanceof TypeError || error instanceof DOMException;
}

function wrapMutation<TData, TVariables>(
	mutation: UseMutationResult<TData, Error, TVariables>,
	queueOffline: (variables: TVariables) => Promise<void>,
): UseMutationResult<TData, Error, TVariables> {
	const mutateAsync = (async (variables: TVariables) => {
		try {
			return await mutation.mutateAsync(variables);
		} catch (error) {
			if (isNetworkFailure(error)) {
				await queueOffline(variables);
				return null as TData;
			}

			throw error;
		}
	}) as typeof mutation.mutateAsync;

	return {
		...mutation,
		mutateAsync,
	};
}

async function queueCreateChecklist(variables: CreateChecklistInput): Promise<void> {
	const entry: SyncQueueEntry = {
		id: createUuid(),
		endpoint: "/checklists",
		method: "POST",
		payload: { orderId: variables.orderId },
		createdAt: Date.now(),
		retryCount: 0,
		idempotencyKey: createUuid(),
		dedupeKey: `checklists:create:${variables.orderId}`,
	};

	logger.info("Queued checklist creation for offline sync", {
		orderId: variables.orderId,
		idempotencyKey: entry.idempotencyKey,
	});

	await enqueue(entry);
}

async function queueUpdateChecklistItem(variables: UpdateChecklistItemVariables): Promise<void> {
	const entry: SyncQueueEntry = {
		id: createUuid(),
		endpoint: `/checklists/${variables.checklistId}/items/${variables.itemId}`,
		method: "PATCH",
		payload: {
			completed: variables.completed,
			observation: variables.observation,
		},
		createdAt: Date.now(),
		retryCount: 0,
		idempotencyKey: createUuid(),
		dedupeKey: `checklists:update:${variables.checklistId}:${variables.itemId}:${variables.completed}:${variables.observation ?? ""}`,
	};

	logger.info("Queued checklist item update for offline sync", {
		checklistId: variables.checklistId,
		itemId: variables.itemId,
		idempotencyKey: entry.idempotencyKey,
	});

	await enqueue(entry);
}

async function queueCompleteChecklist(variables: CompleteChecklistVariables): Promise<void> {
	const entry: SyncQueueEntry = {
		id: createUuid(),
		endpoint: `/checklists/${variables.checklistId}/validate`,
		method: "POST",
		payload: {
			signature: variables.signature,
			observations: variables.observations,
		},
		createdAt: Date.now(),
		retryCount: 0,
		idempotencyKey: createUuid(),
		dedupeKey: `checklists:complete:${variables.checklistId}:${variables.signature}:${variables.observations ?? ""}`,
	};

	logger.info("Queued checklist completion for offline sync", {
		checklistId: variables.checklistId,
		idempotencyKey: entry.idempotencyKey,
	});

	await enqueue(entry);
}

export function useOfflineChecklist() {
	const createChecklistMutation = useCreateChecklist();
	const updateChecklistItemMutation = useUpdateChecklistItem();
	const completeChecklistMutation = useCompleteChecklist();

	const wrappedCreateChecklistMutation = wrapMutation(
		createChecklistMutation,
		queueCreateChecklist,
	);
	const wrappedUpdateChecklistItemMutation = wrapMutation(
		updateChecklistItemMutation,
		queueUpdateChecklistItem,
	);
	const wrappedCompleteChecklistMutation = wrapMutation(
		completeChecklistMutation,
		queueCompleteChecklist,
	);

	return {
		createChecklistMutation: wrappedCreateChecklistMutation,
		updateChecklistItemMutation: wrappedUpdateChecklistItemMutation,
		completeChecklistMutation: wrappedCompleteChecklistMutation,
	};
}
