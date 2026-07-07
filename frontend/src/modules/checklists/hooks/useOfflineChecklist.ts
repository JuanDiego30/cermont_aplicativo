"use client";

import type { Checklist, ChecklistItem, CreateChecklistInput } from "@cermont/shared-types";
import { type UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { createLogger } from "@/lib/monitoring/logger";
import { enqueue, type SyncQueueEntry } from "@/lib/offline/sync-queue";
import { useOfflineStore } from "@/store/offline.store";
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
	if (!useOfflineStore.getState().isOnline) {
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

export function useOfflineChecklist() {
	const queryClient = useQueryClient();
	const createChecklistMutation = useCreateChecklist();
	const updateChecklistItemMutation = useUpdateChecklistItem();
	const completeChecklistMutation = useCompleteChecklist();

	const wrappedCreateChecklistMutation = wrapMutation(
		createChecklistMutation,
		async (variables: CreateChecklistInput) => {
			const entryId = createUuid();
			const entry: SyncQueueEntry = {
				id: entryId,
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

			const mockChecklist = {
				_id: entryId,
				orderId: variables.orderId,
				templateName: "Checklist estándar (Borrador offline)",
				status: "pending",
				items: [
					{
						id: "equipment-1",
						category: "equipment",
						description: "Equipo principal revisado y operativo",
						required: true,
						completed: false,
					},
					{
						id: "ppe-1",
						category: "ppe",
						description: "Equipo de proteccion personal completo",
						required: true,
						completed: false,
					},
					{
						id: "procedure-1",
						category: "procedure",
						description: "Permiso de trabajo y AST verificados",
						required: true,
						completed: false,
					},
				],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			queryClient.setQueryData(["checklists", "order", variables.orderId], mockChecklist);
		},
	);

	const wrappedUpdateChecklistItemMutation = wrapMutation(
		updateChecklistItemMutation,
		async (variables: UpdateChecklistItemVariables) => {
			const payload = {
				result: variables.result,
				...(variables.observation ? { observation: variables.observation } : {}),
			};
			const entry: SyncQueueEntry = {
				id: createUuid(),
				endpoint: `/checklists/${variables.checklistId}/items/${variables.itemId}`,
				method: "PATCH",
				payload,
				createdAt: Date.now(),
				retryCount: 0,
				idempotencyKey: createUuid(),
				dedupeKey: `checklists:update:${variables.checklistId}:${variables.itemId}:${variables.result}:${variables.observation ?? ""}`,
			};

			logger.info("Queued checklist item update for offline sync", {
				checklistId: variables.checklistId,
				itemId: variables.itemId,
				idempotencyKey: entry.idempotencyKey,
			});

			await enqueue(entry);

			queryClient.setQueryData(
				["checklists", "order", variables.orderId],
				(old: Checklist | undefined) => {
					if (!old) {
						return old;
					}
					const updatedItems = old.items.map((item: ChecklistItem) =>
						item.id === variables.itemId
							? {
									...item,
									result: variables.result,
									completed: variables.result !== "pending",
									observation: variables.observation,
								}
							: item,
					);
					const hasCompleted = updatedItems.some((item: ChecklistItem) => item.completed);
					const status = hasCompleted ? "in_progress" : "pending";
					return {
						...old,
						status,
						items: updatedItems,
					};
				},
			);
		},
	);

	const wrappedCompleteChecklistMutation = wrapMutation(
		completeChecklistMutation,
		async (variables: CompleteChecklistVariables) => {
			const payload = {
				signature: variables.signature,
				...(variables.observations ? { observations: variables.observations } : {}),
			};
			const entry: SyncQueueEntry = {
				id: createUuid(),
				endpoint: `/checklists/${variables.checklistId}/validate`,
				method: "POST",
				payload,
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

			queryClient.setQueryData(
				["checklists", "order", variables.orderId],
				(old: Checklist | undefined) => {
					if (!old) {
						return old;
					}
					return {
						...old,
						status: "completed",
						signature: variables.signature,
						observations: variables.observations,
						completedAt: new Date().toISOString(),
					};
				},
			);
		},
	);

	return {
		createChecklistMutation: wrappedCreateChecklistMutation,
		updateChecklistItemMutation: wrappedUpdateChecklistItemMutation,
		completeChecklistMutation: wrappedCompleteChecklistMutation,
	};
}
