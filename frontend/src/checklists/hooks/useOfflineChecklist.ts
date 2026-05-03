"use client";

import type { CreateChecklistInput } from "@cermont/shared-types";
import type { UseMutationResult } from "@tanstack/react-query";
import { createLogger } from "@/_shared/lib/monitoring/logger";
import { queueOfflineAction } from "@/_shared/lib/pwa/offline-queue";
import {
	type CompleteChecklistVariables,
	type UpdateChecklistItemVariables,
	useCompleteChecklist,
	useCreateChecklist,
	useUpdateChecklistItem,
} from "../queries";

const logger = createLogger("offline-sync:checklists");

function generateId(): string {
	return crypto.randomUUID();
}

function isNetworkFailure(error: unknown): boolean {
	return (
		(typeof navigator !== "undefined" && !navigator.onLine) ||
		error instanceof TypeError ||
		error instanceof DOMException
	);
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
	const idempotencyKey = generateId();

	logger.info("Queued checklist creation for offline sync", {
		orderId: variables.orderId,
		idempotencyKey,
	});

	await queueOfflineAction({
		type: "CREATE_CHECKLIST",
		payload: { orderId: variables.orderId },
		status: "pending",
	});
}

async function queueUpdateChecklistItem(variables: UpdateChecklistItemVariables): Promise<void> {
	const payload: Record<string, unknown> = {
		orderId: variables.orderId,
		checklistId: variables.checklistId,
		itemId: variables.itemId,
		completed: variables.completed,
	};

	if (typeof variables.observation === "string") {
		payload.observation = variables.observation;
	}

	const idempotencyKey = generateId();

	logger.info("Queued checklist item update for offline sync", {
		checklistId: variables.checklistId,
		itemId: variables.itemId,
		idempotencyKey,
	});

	await queueOfflineAction({
		type: "UPDATE_CHECKLIST",
		payload,
		status: "pending",
	});
}

async function queueCompleteChecklist(variables: CompleteChecklistVariables): Promise<void> {
	const payload: Record<string, unknown> = {
		orderId: variables.orderId,
		checklistId: variables.checklistId,
		signature: variables.signature,
	};

	if (typeof variables.observations === "string") {
		payload.observations = variables.observations;
	}

	const idempotencyKey = generateId();

	logger.info("Queued checklist completion for offline sync", {
		checklistId: variables.checklistId,
		idempotencyKey,
	});

	await queueOfflineAction({
		type: "COMPLETE_CHECKLIST",
		payload,
		status: "pending",
	});
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
