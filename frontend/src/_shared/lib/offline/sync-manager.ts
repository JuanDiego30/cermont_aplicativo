"use client";

import { toSerializedError } from "@cermont/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toApiUrl } from "@/_shared/lib/http/api-client";
import { createLogger } from "@/_shared/lib/monitoring/logger";
import { useAuthStore } from "@/_shared/store/auth.store";
import { useConnectivity } from "./connectivity";
import { getNextRetryDelay, hasExceededMaxRetries } from "./retry-strategy";
import {
	dequeue,
	getAll,
	QUEUE_CHANGED_EVENT,
	type SyncQueueEntry,
	updateEntry,
} from "./sync-queue";

export type SyncManagerStatus = "idle" | "syncing" | "error";

export interface SyncManagerState {
	status: SyncManagerStatus;
	pendingCount: number;
	deadLetterCount: number;
}

const logger = createLogger("offline-sync:manager");

const RETRYABLE_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

class SyncRequestError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
		this.name = "SyncRequestError";
	}
}

function buildAuthHeaders(): HeadersInit {
	const token = useAuthStore.getState().accessToken;
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function isFilePayload(payload: Record<string, unknown>): boolean {
	return typeof payload.fileBase64 === "string" && payload.fileBase64.length > 0;
}

function decodeBase64ToFile(payload: Record<string, unknown>): File {
	const fileName =
		typeof payload.fileName === "string" && payload.fileName.length > 0
			? payload.fileName
			: "evidence";
	const fileType =
		typeof payload.fileType === "string" && payload.fileType.length > 0
			? payload.fileType
			: "application/octet-stream";
	const fileBase64 = String(payload.fileBase64);
	const binary = atob(fileBase64);
	const bytes = new Uint8Array(binary.length);

	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}

	return new File([bytes], fileName, { type: fileType });
}

function appendFormDataField(formData: FormData, key: string, value: unknown): void {
	if (value === null || value === undefined) {
		return;
	}

	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		formData.append(key, String(value));
	}
}

function buildRequestBody(entry: SyncQueueEntry): BodyInit | FormData | undefined {
	if (!isFilePayload(entry.payload)) {
		return JSON.stringify(entry.payload);
	}

	const formData = new FormData();
	formData.append("file", decodeBase64ToFile(entry.payload));

	for (const [key, value] of Object.entries(entry.payload)) {
		if (key === "fileBase64" || key === "fileName" || key === "fileType") {
			continue;
		}

		appendFormDataField(formData, key, value);
	}

	return formData;
}

async function readResponseError(response: Response): Promise<string> {
	try {
		const text = (await response.clone().text()).trim();
		if (!text) {
			return response.statusText || `HTTP ${response.status}`;
		}

		try {
			const payload = JSON.parse(text) as { error?: unknown; message?: unknown };
			if (payload && typeof payload.error === "string" && payload.error.trim().length > 0) {
				return payload.error.trim();
			}
			if (payload && typeof payload.message === "string" && payload.message.trim().length > 0) {
				return payload.message.trim();
			}
		} catch {
			return text;
		}
	} catch {
		// Ignore body parsing issues and fall back to the status text.
	}

	return response.statusText || `HTTP ${response.status}`;
}

function isRetryableStatus(status: number): boolean {
	return RETRYABLE_HTTP_STATUSES.has(status) || status >= 500;
}

async function sendQueuedRequest(entry: SyncQueueEntry): Promise<void> {
	const headers = new Headers(buildAuthHeaders());
	headers.set("Idempotency-Key", entry.idempotencyKey);

	const body = buildRequestBody(entry);
	if (!(body instanceof FormData)) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(toApiUrl(entry.endpoint), {
		method: entry.method,
		headers,
		body,
		cache: "no-store",
		credentials: "include",
	});

	if (!response.ok) {
		throw new SyncRequestError(await readResponseError(response), response.status);
	}
}

async function refreshQueueCounts(
	setPendingCount: (value: number) => void,
	setDeadLetterCount: (value: number) => void,
): Promise<SyncQueueEntry[]> {
	const entries = await getAll();
	const deadLetterCount = entries.filter((entry) => entry.status === "dead_letter").length;
	const pendingCount = entries.length - deadLetterCount;

	setPendingCount(pendingCount);
	setDeadLetterCount(deadLetterCount);

	return entries;
}

export function useSyncManager(): SyncManagerState {
	const { isOnline } = useConnectivity();
	const [status, setStatus] = useState<SyncManagerStatus>("idle");
	const [pendingCount, setPendingCount] = useState(0);
	const [deadLetterCount, setDeadLetterCount] = useState(0);
	const sweepInProgressRef = useRef(false);

	const sweepQueue = useCallback(async (): Promise<void> => {
		if (sweepInProgressRef.current) {
			return;
		}

		sweepInProgressRef.current = true;
		setStatus("syncing");

		try {
			const now = Date.now();
			const entries = await getAll();
			const eligibleEntries = entries
				.filter((entry) => entry.status !== "dead_letter")
				.filter((entry) => typeof entry.nextRetryAt !== "number" || entry.nextRetryAt <= now)
				.sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id));

			let hasFailure = false;

			for (const entry of eligibleEntries) {
				try {
					await sendQueuedRequest(entry);
					await dequeue(entry.id);
				} catch (rawError: unknown) {
					hasFailure = true;
					const nextRetryCount = entry.retryCount + 1;
					const { message } = toSerializedError(rawError);
					const syncError = rawError instanceof SyncRequestError ? rawError : null;

					if (syncError && !isRetryableStatus(syncError.status)) {
						await updateEntry({
							...entry,
							retryCount: nextRetryCount,
							status: "dead_letter",
							lastError: message,
						});
						break;
					}

					if (hasExceededMaxRetries(nextRetryCount)) {
						await updateEntry({
							...entry,
							retryCount: nextRetryCount,
							status: "dead_letter",
							lastError: message,
						});
						break;
					}

					await updateEntry({
						...entry,
						retryCount: nextRetryCount,
						status: "pending",
						lastError: message,
						nextRetryAt: Date.now() + getNextRetryDelay(nextRetryCount),
					});

					break;
				}
			}

			await refreshQueueCounts(setPendingCount, setDeadLetterCount);
			setStatus(hasFailure ? "error" : "idle");
		} catch (rawError: unknown) {
			const error = toSerializedError(rawError);
			logger.error("Failed to sweep sync queue", error);
			await refreshQueueCounts(setPendingCount, setDeadLetterCount);
			setStatus("error");
		} finally {
			sweepInProgressRef.current = false;
		}
	}, []);

	useEffect(() => {
		void refreshQueueCounts(setPendingCount, setDeadLetterCount);
	}, []);

	useEffect(() => {
		if (!isOnline) {
			setStatus("idle");
			return;
		}

		void sweepQueue();
	}, [isOnline, sweepQueue]);

	useEffect(() => {
		const handleQueueChange = () => {
			void refreshQueueCounts(setPendingCount, setDeadLetterCount);
			if (isOnline) {
				void sweepQueue();
			}
		};

		window.addEventListener(QUEUE_CHANGED_EVENT, handleQueueChange);

		return () => {
			window.removeEventListener(QUEUE_CHANGED_EVENT, handleQueueChange);
		};
	}, [isOnline, sweepQueue]);

	return {
		status,
		pendingCount,
		deadLetterCount,
	};
}
