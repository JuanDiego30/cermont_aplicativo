"use client";

import type { EvidenceType, JsonObject } from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiClient } from "@/_shared/lib/http/api-client";
import { createLogger } from "@/_shared/lib/monitoring/logger";
import { queueOfflineAction } from "@/_shared/lib/pwa/offline-queue";

const logger = createLogger("offline-sync:evidences");

export interface OfflineEvidenceInput {
	orderId: string;
	type: EvidenceType;
	description?: string;
	capturedAt: string;
	file: File;
}

type OfflineEvidenceResponse = {
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
	return (
		(typeof navigator !== "undefined" && !navigator.onLine) ||
		error instanceof TypeError ||
		error instanceof DOMException
	);
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
	const fileBase64 = await fileToBase64(variables.file);
	const idempotencyKey = createUuid();
	const payload: JsonObject = {
		orderId: variables.orderId,
		type: variables.type,
		capturedAt: variables.capturedAt,
		fileBase64,
		fileName: variables.file.name,
		fileType: variables.file.type,
		idempotencyKey,
	};

	if (typeof variables.description === "string" && variables.description.trim().length > 0) {
		payload.description = variables.description.trim();
	}

	logger.info("Queued evidence upload for offline sync", {
		orderId: variables.orderId,
		type: variables.type,
		idempotencyKey,
	});

	await queueOfflineAction({
		type: "CREATE_EVIDENCE",
		payload,
		status: "pending",
	});
}

function buildEvidenceFormData(data: OfflineEvidenceInput): FormData {
	const formData = new FormData();
	formData.append("file", data.file);
	formData.append("type", data.type);
	formData.append("capturedAt", data.capturedAt);
	formData.append("orderId", data.orderId);

	if (typeof data.description === "string" && data.description.trim().length > 0) {
		formData.append("description", data.description.trim());
	}

	return formData;
}

export function useOfflineEvidence() {
	const queryClient = useQueryClient();

	const uploadMutation = useMutation({
		mutationFn: async (data: OfflineEvidenceInput): Promise<OfflineEvidenceResponse> => {
			const formData = buildEvidenceFormData(data);
			const body = await apiClient.post<OfflineEvidenceResponse>("/evidences", formData);

			if (!body.success) {
				throw new Error("Evidence could not be uploaded");
			}

			return body;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["evidences"] });
		},
	});

	const mutateAsync = useCallback(
		async (data: OfflineEvidenceInput): Promise<OfflineEvidenceResponse | null> => {
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
		mutateAsync: (data: OfflineEvidenceInput) => Promise<OfflineEvidenceResponse | null>;
	};
}
