"use client";

import { isPresent } from "@cermont/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toApiUrl } from "@/lib/http/api-client";
import { createLogger } from "@/lib/monitoring/logger";
import { useAuthStore } from "@/store/auth.store";
import { useOfflineStore } from "@/store/offline.store";
import { useConnectivity } from "./connectivity";
import { hasIndexedDBSupport, nowIso, offlineDb } from "./offline-db";
import { getNextRetryDelay, hasExceededMaxRetries } from "./retry-strategy";
import { syncNow } from "./sync-engine";
import {
	dequeue,
	getAll,
	QUEUE_CHANGED_EVENT,
	type SyncQueueEntry,
	updateEntry,
} from "./sync-queue";

type SyncManagerStatus = "idle" | "syncing" | "error";

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
		public readonly retryAfterMs: number | false,
	) {
		super(message);
		this.name = "SyncRequestError";
	}
}

function buildAuthHeaders(): HeadersInit {
	const tokenStatus = useAuthStore.getState().accessToken;

	if (!isPresent(tokenStatus)) {
		return {};
	}

	return { Authorization: `Bearer ${tokenStatus.value}` };
}

function hasAuthenticatedSession(): boolean {
	return isPresent(useAuthStore.getState().accessToken);
}

function isFilePayload(payload: Record<string, unknown>): boolean {
	return typeof payload.fileBase64 === "string" && payload.fileBase64.length > 0;
}

function isIndexedDbFilePayload(payload: Record<string, unknown>): boolean {
	return typeof payload.fileLocalId === "string" && payload.fileLocalId.length > 0;
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

async function readIndexedDbFile(payload: Record<string, unknown>): Promise<File> {
	const fileLocalId = String(payload.fileLocalId);
	const record = await offlineDb.offlineFiles.get(fileLocalId);
	if (!record) {
		throw new Error(`Offline file '${fileLocalId}' was not found`);
	}

	return new File([record.blob], record.fileName, { type: record.mimeType });
}

function appendFormDataField(formData: FormData, key: string, value: unknown): void {
	if (value === null || value === undefined) {
		return;
	}

	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		formData.append(key, String(value));
	}
}

async function buildRequestBody(entry: SyncQueueEntry): Promise<BodyInit | FormData | undefined> {
	const hasBase64File = isFilePayload(entry.payload);
	const hasIndexedDbFile = isIndexedDbFilePayload(entry.payload);

	if (!hasBase64File && !hasIndexedDbFile) {
		return JSON.stringify(entry.payload);
	}

	const formData = new FormData();
	const file = hasIndexedDbFile
		? await readIndexedDbFile(entry.payload)
		: decodeBase64ToFile(entry.payload);
	formData.append("file", file);

	for (const [key, value] of Object.entries(entry.payload)) {
		if (key === "fileBase64" || key === "fileLocalId" || key === "fileName" || key === "fileType") {
			continue;
		}

		appendFormDataField(formData, key, value);
	}

	return formData;
}

function getQueuedFileLocalId(entry: SyncQueueEntry): string | false {
	const value = entry.payload.fileLocalId;
	if (typeof value === "string" && value.length > 0) {
		return value;
	}
	return false;
}

async function markQueuedFileUploaded(entry: SyncQueueEntry): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}

	const fileLocalId = getQueuedFileLocalId(entry);
	if (!fileLocalId) {
		return;
	}

	await offlineDb.offlineFiles.update(fileLocalId, {
		status: "uploaded",
		updatedAt: nowIso(),
	});
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

function readRetryAfterMs(response: Response): number | false {
	const value = response.headers.get("Retry-After") ?? "";
	if (!value) {
		return false;
	}

	const seconds = Number(value);
	if (Number.isFinite(seconds) && seconds >= 0) {
		return seconds * 1_000;
	}

	const retryAt = Date.parse(value);
	if (!Number.isFinite(retryAt)) {
		return false;
	}

	return Math.max(0, retryAt - Date.now());
}

async function sendQueuedRequest(entry: SyncQueueEntry): Promise<void> {
	const headers = new Headers(buildAuthHeaders());
	headers.set("Idempotency-Key", entry.idempotencyKey);

	const body = await buildRequestBody(entry);
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
		throw new SyncRequestError(
			await readResponseError(response),
			response.status,
			readRetryAfterMs(response),
		);
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

function getEligibleEntries(entries: SyncQueueEntry[], now: number): SyncQueueEntry[] {
	return entries
		.filter(
			(entry) =>
				entry.endpoint !== "/sync/offline" &&
				entry.status !== "dead_letter" &&
				(typeof entry.nextRetryAt !== "number" || entry.nextRetryAt <= now),
		)
		.sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id));
}

async function markEntryAsDeadLetter(
	entry: SyncQueueEntry,
	retryCount: number,
	lastError: string,
): Promise<void> {
	await updateEntry({
		...entry,
		retryCount,
		status: "dead_letter",
		lastError,
	});
}

async function scheduleEntryRetry(
	entry: SyncQueueEntry,
	retryCount: number,
	lastError: string,
	retryDelayMs: number,
): Promise<void> {
	await updateEntry({
		...entry,
		retryCount,
		status: "pending",
		lastError,
		nextRetryAt: Date.now() + retryDelayMs,
	});
}

async function handleEntryFailure(entry: SyncQueueEntry, error: unknown): Promise<void> {
	const nextRetryCount = entry.retryCount + 1;
	const message = error instanceof Error ? error.message : "Sync request failed";

	if (error instanceof SyncRequestError && !isRetryableStatus(error.status)) {
		await markEntryAsDeadLetter(entry, nextRetryCount, message);
		return;
	}

	if (hasExceededMaxRetries(nextRetryCount)) {
		await markEntryAsDeadLetter(entry, nextRetryCount, message);
		return;
	}

	const retryDelayMs =
		error instanceof SyncRequestError && error.retryAfterMs !== false
			? error.retryAfterMs
			: getNextRetryDelay(nextRetryCount);
	await scheduleEntryRetry(entry, nextRetryCount, message, retryDelayMs);
}

export function useSyncManager(): SyncManagerState {
	const { isOnline } = useConnectivity();
	const hasAccessToken = useAuthStore((state) => isPresent(state.accessToken));
	const [status, setStatus] = useState<SyncManagerStatus>("idle");
	const [pendingCount, setPendingCount] = useState(0);
	const [deadLetterCount, setDeadLetterCount] = useState(0);
	const sweepInProgressRef = useRef(false);
	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | false>(false);

	const scheduleRetrySweep = useCallback((entries: SyncQueueEntry[]): void => {
		if (retryTimerRef.current) {
			clearTimeout(retryTimerRef.current);
			retryTimerRef.current = false;
		}

		const now = Date.now();
		const retryTimes = entries
			.filter(
				(entry) =>
					entry.endpoint !== "/sync/offline" &&
					entry.status !== "dead_letter" &&
					typeof entry.nextRetryAt === "number" &&
					entry.nextRetryAt > now,
			)
			.map((entry) => entry.nextRetryAt as number);

		if (retryTimes.length === 0) {
			return;
		}

		const nextRetryAt = Math.min(...retryTimes);
		retryTimerRef.current = setTimeout(
			() => {
				retryTimerRef.current = false;
				window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
			},
			Math.max(0, nextRetryAt - Date.now()),
		);
	}, []);

	const sweepQueue = useCallback(async (): Promise<void> => {
		if (sweepInProgressRef.current) {
			return;
		}

		if (!hasAuthenticatedSession()) {
			const entries = await refreshQueueCounts(setPendingCount, setDeadLetterCount);
			scheduleRetrySweep(entries);
			setStatus("idle");
			return;
		}

		sweepInProgressRef.current = true;
		setStatus("syncing");

		try {
			const now = Date.now();
			const entries = await getAll();
			const eligibleEntries = getEligibleEntries(entries, now);

			let hasFailure = false;

			// Sequential processing is intentional: entries are ordered by createdAt
			// to respect CERMONT's 14-step business flow (e.g., evidence before report,
			// SES before invoice). Each entry's pipeline (send → mark → dequeue) is
			// inherently sequential. Breaking on first error prevents out-of-order sync.
			for (const entry of eligibleEntries) {
				try {
					await sendQueuedRequest(entry);
					await markQueuedFileUploaded(entry);
					await dequeue(entry.id);
				} catch (error) {
					hasFailure = true;
					await handleEntryFailure(entry, error);
					break;
				}
			}

			const batchSummary = await syncNow();
			if (batchSummary.failed > 0 || batchSummary.conflicts > 0) {
				hasFailure = true;
			}

			const remainingEntries = await refreshQueueCounts(setPendingCount, setDeadLetterCount);
			scheduleRetrySweep(remainingEntries);
			setStatus(hasFailure ? "error" : "idle");
		} catch (error) {
			logger.error("Failed to sweep sync queue", error);
			const remainingEntries = await refreshQueueCounts(setPendingCount, setDeadLetterCount);
			scheduleRetrySweep(remainingEntries);
			setStatus("error");
		} finally {
			sweepInProgressRef.current = false;
		}
	}, [scheduleRetrySweep]);

	useEffect(() => {
		void refreshQueueCounts(setPendingCount, setDeadLetterCount).then(scheduleRetrySweep);
	}, [scheduleRetrySweep]);

	useEffect(() => {
		if (!isOnline || !hasAccessToken) {
			if (!isOnline && retryTimerRef.current) {
				clearTimeout(retryTimerRef.current);
				retryTimerRef.current = false;
			}
			setStatus("idle");
			return;
		}

		void sweepQueue();
	}, [hasAccessToken, isOnline, sweepQueue]);

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

	useEffect(
		() => () => {
			if (retryTimerRef.current) {
				clearTimeout(retryTimerRef.current);
			}
		},
		[],
	);

	useEffect(() => {
		useOfflineStore.getState().setSyncState({
			isSyncing: status === "syncing",
			pendingCount,
			failedCount: deadLetterCount,
			syncError: status === "error" ? "Hay cambios offline que requieren revisión." : "",
			lastSyncAt: status === "idle" && pendingCount === 0 ? new Date().toISOString() : void 0,
		});
	}, [status, pendingCount, deadLetterCount]);

	return {
		status,
		pendingCount,
		deadLetterCount,
	};
}
