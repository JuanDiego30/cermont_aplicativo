"use client";

import type { EvidenceType, OfflineJsonObject } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiClient } from "@/lib/http/api-client";
import { createLogger } from "@/lib/monitoring/logger";
import { OFFLINE_MUTATION_KEYS } from "@/lib/offline/mutation-defaults";
import { hasIndexedDBSupport, nowIso, offlineDb } from "@/lib/offline/offline-db";
import { enqueue, type SyncQueueEntry } from "@/lib/offline/sync-queue";
import { useOfflineStore } from "@/store/offline.store";

const logger = createLogger("offline-sync:evidences");

export interface OfflineEvidenceInput {
	orderId: string;
	type: EvidenceType;
	title?: string;
	description?: string;
	capturedAt: string;
	file: File;
	gpsLocation?: {
		lat: number;
		lng: number;
		capturedAt?: string;
	};
}

type OfflineEvidenceOutcome = {
	success: boolean;
	data: {
		_id: string;
		url: string;
	};
};

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

async function fileToBase64(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	let binary = "";

	for (let index = 0; index < bytes.length; index += 1) {
		binary += String.fromCharCode(bytes[index]);
	}

	return btoa(binary);
}

async function queueEvidenceUpload(variables: OfflineEvidenceInput): Promise<void> {
	const entryId = createUuid();
	const idempotencyKey = createUuid();
	const fileLocalId = createUuid();
	const payload: OfflineJsonObject = {
		orderId: variables.orderId,
		category: "evidence_photo",
		idempotencyKey,
		type: variables.type,
		capturedAt: variables.capturedAt,
		fileLocalId,
		fileName: variables.file.name,
		fileType: variables.file.type,
	};

	if (!hasIndexedDBSupport()) {
		payload.fileBase64 = await fileToBase64(variables.file);
	}

	if (typeof variables.title === "string" && variables.title.trim().length > 0) {
		payload.title = variables.title.trim();
	}

	if (typeof variables.description === "string" && variables.description.trim().length > 0) {
		payload.description = variables.description.trim();
	}

	if (variables.gpsLocation) {
		payload.gpsLocation = {
			lat: variables.gpsLocation.lat,
			lng: variables.gpsLocation.lng,
			...(variables.gpsLocation.capturedAt ? { capturedAt: variables.gpsLocation.capturedAt } : {}),
		};
	}

	const entry: SyncQueueEntry = {
		id: entryId,
		endpoint: "/evidences",
		method: "POST",
		payload,
		createdAt: Date.now(),
		retryCount: 0,
		idempotencyKey,
		dedupeKey: `evidences:create:${variables.orderId}:${variables.type}:${variables.file.name}:${variables.file.type}:${variables.capturedAt}:${variables.title ?? ""}:${variables.description ?? ""}`,
	};

	if (hasIndexedDBSupport()) {
		const timestamp = nowIso();
		await offlineDb.transaction("rw", offlineDb.offlineFiles, async () => {
			await offlineDb.offlineFiles.put({
				localId: fileLocalId,
				outboxLocalId: entry.id,
				workOrderId: variables.orderId,
				entityType: "evidence",
				entityId: variables.orderId,
				flowStep: 7,
				fileName: variables.file.name,
				mimeType: variables.file.type || "application/octet-stream",
				sizeBytes: variables.file.size,
				category: "evidence_photo",
				status: "pending_upload",
				createdAt: timestamp,
				updatedAt: timestamp,
				idempotencyKey,
				blob: variables.file,
			});
		});
	}

	logger.info("Queued evidence upload for offline sync", {
		orderId: variables.orderId,
		type: variables.type,
		idempotencyKey: entry.idempotencyKey,
	});

	await enqueue(entry);
}

function buildEvidenceFormData(data: OfflineEvidenceInput): FormData {
	const formData = new FormData();
	formData.append("file", data.file);
	formData.append("type", data.type);
	formData.append("capturedAt", data.capturedAt);
	formData.append("orderId", data.orderId);

	if (typeof data.title === "string" && data.title.trim().length > 0) {
		formData.append("title", data.title.trim());
	}

	if (typeof data.description === "string" && data.description.trim().length > 0) {
		formData.append("description", data.description.trim());
	}

	if (data.gpsLocation) {
		formData.append("gpsLocation", JSON.stringify(data.gpsLocation));
	}

	return formData;
}

export function useOfflineEvidence() {
	const queryClient = useQueryClient();

	const uploadMutation = useMutation({
		mutationKey: OFFLINE_MUTATION_KEYS.evidenceUpload,
		mutationFn: async (data: OfflineEvidenceInput): Promise<OfflineEvidenceOutcome> => {
			const formData = buildEvidenceFormData(data);
			const body = await apiClient.post<OfflineEvidenceOutcome>("/evidences", formData);

			if (!body?.success) {
				throw new Error("Failed to upload evidence");
			}

			return body;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["evidences"] });
		},
	});

	const mutateAsync = useCallback(
		async (data: OfflineEvidenceInput): Promise<OfflineEvidenceOutcome | null> => {
			try {
				return await uploadMutation.mutateAsync(data);
			} catch (error) {
				if (isNetworkFailure(error)) {
					await queueEvidenceUpload(data);
					return null;
				}

				throw error;
			}
		},
		[uploadMutation],
	);

	return {
		...uploadMutation,
		mutateAsync,
	} as typeof uploadMutation & {
		mutateAsync: (data: OfflineEvidenceInput) => Promise<OfflineEvidenceOutcome | null>;
	};
}
