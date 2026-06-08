"use client";

import type {
	ApiEnvelope,
	OfflineDraft,
	OfflineEntityType,
	OfflineFile,
	OfflineFormSnapshot,
	OfflineJsonObject,
	OfflineOutboxItem,
	OfflineSyncItemResult,
	OfflineSyncStatus,
	ServiceCase,
	ServiceCaseWorkflowViewModel,
	SiteVisitRecord,
	WorkRequest,
} from "@cermont/shared-types";
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import Dexie, { type Table } from "dexie";

export interface OfflineFileRecord extends OfflineFile {
	blob: Blob;
}

export interface OfflineSyncLog {
	batchId: string;
	status: "started" | "completed" | "failed";
	startedAt: string;
	finishedAt?: string;
	results: OfflineSyncItemResult[];
}

export interface OfflineMetaRecord {
	key: string;
	value: OfflineJsonObject;
	updatedAt: string;
}

export interface OfflineQueryCacheRecord {
	key: string;
	client: PersistedClient;
	updatedAt: string;
}

export interface OfflineServiceCaseListSnapshotRecord {
	key: string;
	items: ServiceCase[];
	total: number;
	page: number;
	limit: number;
	pages: number;
	updatedAt: string;
}

export interface OfflineServiceCaseDetailSnapshotRecord {
	key: string;
	serviceCaseId: string;
	envelope: ApiEnvelope<ServiceCaseWorkflowViewModel>;
	updatedAt: string;
}

export interface OfflineWorkRequestListSnapshotRecord {
	key: string;
	items: WorkRequest[];
	updatedAt: string;
}

export interface OfflineSiteVisitListSnapshotRecord {
	key: string;
	items: SiteVisitRecord[];
	total: number;
	page: number;
	limit: number;
	pages: number;
	updatedAt: string;
}

export interface OfflineDocumentTemplateItem {
	_id: string;
	name: string;
	description?: string;
	version?: number;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface OfflineDocumentTemplateListSnapshotRecord {
	key: string;
	items: OfflineDocumentTemplateItem[];
	total: number;
	updatedAt: string;
}

export interface LegacySyncQueueEntry {
	id: string;
	endpoint: string;
	method: "POST" | "PATCH" | "PUT" | "DELETE";
	payload: OfflineJsonObject;
	createdAt: number;
	retryCount: number;
	idempotencyKey: string;
	status?: "pending" | "dead_letter";
	nextRetryAt?: number;
	lastError?: string;
	dedupeKey?: string;
}

export interface LegacyBlobOutboxEntry {
	id: string;
	blob: Blob;
	originalName: string;
	mimeType: string;
	sizeBytes: number;
	entityType: string;
	entityId: string;
	category: string;
	description?: string;
	tags?: string[];
	clientMutationId: string;
	createdAt: number;
	retryCount: number;
	status: "pending" | "in_flight" | "dead_letter";
	lastError?: string;
}

const DB_NAME = "CermontOfflineDB";
const ISO_FALLBACK_DATE = "1970-01-01T00:00:00.000Z";
const LEGACY_SYNC_QUEUE_STORAGE_KEY = "cermont.sync.queue.v1";
const LEGACY_SYNC_QUEUE_DB_NAME = "CermontSyncQueueDB";
const LEGACY_SYNC_QUEUE_STORE_NAME = "sync_queue";
const LEGACY_BLOB_DB_NAME = "CermontBlobOutboxDB";
const LEGACY_BLOB_STORE_NAME = "blob_outbox";

class CermontOfflineDatabase extends Dexie {
	offlineDrafts!: Table<OfflineDraft, string>;
	offlineOutbox!: Table<OfflineOutboxItem, string>;
	offlineFiles!: Table<OfflineFileRecord, string>;
	offlineSyncLogs!: Table<OfflineSyncLog, string>;
	offlineFormSnapshots!: Table<OfflineFormSnapshot, string>;
	offlineMeta!: Table<OfflineMetaRecord, string>;
	offlineQueryCache!: Table<OfflineQueryCacheRecord, string>;
	offlineServiceCaseLists!: Table<OfflineServiceCaseListSnapshotRecord, string>;
	offlineServiceCaseDetails!: Table<OfflineServiceCaseDetailSnapshotRecord, string>;
	offlineWorkRequestLists!: Table<OfflineWorkRequestListSnapshotRecord, string>;
	offlineSiteVisitLists!: Table<OfflineSiteVisitListSnapshotRecord, string>;
	offlineDocumentTemplateLists!: Table<OfflineDocumentTemplateListSnapshotRecord, string>;

	constructor() {
		super(DB_NAME);
		this.version(1).stores({
			offlineDrafts: "localId, entityType, workOrderId, userId, status, updatedAt",
			offlineOutbox:
				"localId, entityType, operation, status, idempotencyKey, userId, workOrderId, createdAt, attempts, nextRetryAt",
			offlineFiles:
				"localId, outboxLocalId, entityType, entityId, workOrderId, status, idempotencyKey, updatedAt",
			offlineSyncLogs: "batchId, status, startedAt, finishedAt",
			offlineFormSnapshots: "localId, formTemplateId, workOrderId, userId, status, updatedAt",
			offlineMeta: "key, updatedAt",
			offlineQueryCache: "key, updatedAt",
		});
		this.version(2).stores({
			offlineServiceCaseLists: "key, updatedAt",
			offlineServiceCaseDetails: "key, serviceCaseId, updatedAt",
		});
		this.version(3).stores({
			offlineWorkRequestLists: "key, updatedAt",
			offlineSiteVisitLists: "key, updatedAt",
			offlineDocumentTemplateLists: "key, updatedAt",
		});
		// CRITICAL: Version 4 re-declares ALL stores to ensure Dexie creates
		// any object stores that might be missing from a previous version.
		// When a browser has a stale DB at version 1 or 2 (from a previous
		// deployment), stores added in later versions don't exist and
		// transactions throw NotFoundError. Re-declaring all stores forces
		// Dexie to bring the schema up to date.
		this.version(4).stores({
			offlineDrafts: "localId, entityType, workOrderId, userId, status, updatedAt",
			offlineOutbox:
				"localId, entityType, operation, status, idempotencyKey, userId, workOrderId, createdAt, attempts, nextRetryAt",
			offlineFiles:
				"localId, outboxLocalId, entityType, entityId, workOrderId, status, idempotencyKey, updatedAt",
			offlineSyncLogs: "batchId, status, startedAt, finishedAt",
			offlineFormSnapshots: "localId, formTemplateId, workOrderId, userId, status, updatedAt",
			offlineMeta: "key, updatedAt",
			offlineQueryCache: "key, updatedAt",
			offlineServiceCaseLists: "key, updatedAt",
			offlineServiceCaseDetails: "key, serviceCaseId, updatedAt",
			offlineWorkRequestLists: "key, updatedAt",
			offlineSiteVisitLists: "key, updatedAt",
			offlineDocumentTemplateLists: "key, updatedAt",
		});
	}
}

export const offlineDb = new CermontOfflineDatabase();

export type OfflineDbOpenResult =
	| {
			status: "ready";
	  }
	| {
			status: "recovery_required";
			reason: string;
	  };

export async function openOfflineDb(): Promise<OfflineDbOpenResult> {
	try {
		await offlineDb.open();
		return { status: "ready" };
	} catch (error) {
		return {
			status: "recovery_required",
			reason: error instanceof Error ? error.message : "No se pudo abrir el almacenamiento local.",
		};
	}
}

export function hasIndexedDBSupport(): boolean {
	return "indexedDB" in globalThis;
}

export function nowIso(): string {
	return new Date().toISOString();
}

function inferEntityTypeFromEndpoint(endpoint: string): OfflineEntityType {
	if (endpoint.includes("site-visits")) {
		return "site_visit";
	}
	if (endpoint.includes("planning")) {
		return "planning_packet";
	}
	if (endpoint.includes("execution")) {
		return "execution_session";
	}
	if (endpoint.includes("checklists")) {
		return "checklist_submission";
	}
	if (endpoint.includes("evidences") || endpoint.includes("files")) {
		return "evidence";
	}
	if (endpoint.includes("reports")) {
		return "technical_report";
	}
	if (endpoint.includes("delivery-records")) {
		return "delivery_record";
	}
	if (endpoint.includes("ses") || endpoint.includes("service-entry-sheets")) {
		return "service_entry_sheet";
	}
	if (endpoint.includes("invoices")) {
		return "invoice";
	}
	if (endpoint.includes("payments")) {
		return "payment_record";
	}
	if (endpoint.includes("costs")) {
		return "cost_record";
	}
	if (endpoint.includes("work-requests")) {
		return "work_request";
	}
	return "work_order";
}

function normalizeLegacyEntityType(entityType: string): OfflineEntityType {
	switch (entityType) {
		case "delivery_record":
			return "delivery_record";
		case "technical_report":
			return "technical_report";
		case "execution_session":
			return "execution_session";
		case "planning":
			return "planning_packet";
		case "checklist_item":
			return "checklist_submission";
		case "work_order":
			return "work_order";
		case "evidence":
			return "evidence";
		default:
			return inferEntityTypeFromEndpoint(entityType);
	}
}

function inferOperation(method: LegacySyncQueueEntry["method"]) {
	switch (method) {
		case "DELETE":
			return "delete" as const;
		case "PATCH":
		case "PUT":
			return "update" as const;
		case "POST":
			return "create" as const;
	}
}

function mapLegacyStatus(status: LegacySyncQueueEntry["status"]): OfflineSyncStatus {
	return status === "dead_letter" ? "failed" : "pending_sync";
}

function isLegacySyncQueueEntry(
	value: Partial<LegacySyncQueueEntry>,
): value is LegacySyncQueueEntry {
	if (!value || typeof value !== "object") {
		return false;
	}

	const method = value.method;
	return (
		typeof value.id === "string" &&
		typeof value.endpoint === "string" &&
		(method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE") &&
		Boolean(value.payload && typeof value.payload === "object") &&
		typeof value.createdAt === "number" &&
		typeof value.retryCount === "number" &&
		typeof value.idempotencyKey === "string"
	);
}

function readLegacySyncQueueEntries(): LegacySyncQueueEntry[] {
	if (!("window" in globalThis)) {
		return [];
	}

	const raw = globalThis.window.localStorage.getItem(LEGACY_SYNC_QUEUE_STORAGE_KEY);
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw) as Array<Partial<LegacySyncQueueEntry>>;
		if (!Array.isArray(parsed)) {
			return [];
		}
		return parsed.filter(isLegacySyncQueueEntry);
	} catch {
		return [];
	}
}

async function openLegacySyncQueueDatabase(): Promise<IDBDatabase | false> {
	if (!hasIndexedDBSupport()) {
		return false;
	}

	if (typeof globalThis.indexedDB.databases === "function") {
		try {
			const dbs = await globalThis.indexedDB.databases();
			const exists = dbs.some((db) => db.name === LEGACY_SYNC_QUEUE_DB_NAME);
			if (!exists) {
				return false;
			}
		} catch {
			// Fallback if databases() fails or permission denied
		}
	}

	return new Promise((resolve, reject) => {
		let createdForInspection = false;
		const request = globalThis.indexedDB.open(LEGACY_SYNC_QUEUE_DB_NAME);
		request.onerror = () =>
			reject(request.error ?? new Error("Legacy sync queue database open failed"));
		request.onupgradeneeded = () => {
			createdForInspection = true;
		};
		request.onsuccess = () => {
			const database = request.result;
			if (
				createdForInspection ||
				!database.objectStoreNames.contains(LEGACY_SYNC_QUEUE_STORE_NAME)
			) {
				database.close();
				if (createdForInspection) {
					globalThis.indexedDB.deleteDatabase(LEGACY_SYNC_QUEUE_DB_NAME);
				}
				resolve(false);
				return;
			}
			resolve(database);
		};
	});
}

async function readLegacyIndexedDbQueueEntries(): Promise<LegacySyncQueueEntry[]> {
	const database = await openLegacySyncQueueDatabase();
	if (!database) {
		return [];
	}

	return new Promise((resolve, reject) => {
		const transaction = database.transaction(LEGACY_SYNC_QUEUE_STORE_NAME, "readonly");
		const store = transaction.objectStore(LEGACY_SYNC_QUEUE_STORE_NAME);
		const request = store.getAll();

		request.onerror = () =>
			reject(request.error ?? new Error("Legacy sync queue database read failed"));
		request.onsuccess = () => {
			const entries = (request.result as Array<Partial<LegacySyncQueueEntry>>).filter(
				isLegacySyncQueueEntry,
			);
			database.close();
			resolve(entries);
		};
	});
}

async function openLegacyBlobDatabase(): Promise<IDBDatabase | false> {
	if (!hasIndexedDBSupport()) {
		return false;
	}

	if (typeof globalThis.indexedDB.databases === "function") {
		try {
			const dbs = await globalThis.indexedDB.databases();
			const exists = dbs.some((db) => db.name === LEGACY_BLOB_DB_NAME);
			if (!exists) {
				return false;
			}
		} catch {
			// Fallback
		}
	}

	return new Promise((resolve, reject) => {
		let createdForInspection = false;
		const request = globalThis.indexedDB.open(LEGACY_BLOB_DB_NAME);
		request.onerror = () => reject(request.error || new Error("Legacy blob database open failed"));
		request.onupgradeneeded = () => {
			createdForInspection = true;
		};
		request.onsuccess = () => {
			const database = request.result;
			if (createdForInspection || !database.objectStoreNames.contains(LEGACY_BLOB_STORE_NAME)) {
				database.close();
				if (createdForInspection) {
					globalThis.indexedDB.deleteDatabase(LEGACY_BLOB_DB_NAME);
				}
				resolve(false);
				return;
			}
			resolve(database);
		};
	});
}

async function readLegacyBlobEntries(): Promise<LegacyBlobOutboxEntry[]> {
	const database = await openLegacyBlobDatabase();
	if (!database) {
		return [];
	}

	return new Promise((resolve, reject) => {
		const transaction = database.transaction(LEGACY_BLOB_STORE_NAME, "readonly");
		const store = transaction.objectStore(LEGACY_BLOB_STORE_NAME);
		const request = store.getAll();

		request.onerror = () => reject(request.error || new Error("Legacy blob read failed"));
		request.onsuccess = () => {
			const entries = request.result as LegacyBlobOutboxEntry[];
			database.close();
			resolve(entries);
		};
	});
}

export function legacyQueueEntryToOutboxItem(
	entry: LegacySyncQueueEntry,
	userId: string,
): OfflineOutboxItem {
	const createdAt = Number.isFinite(entry.createdAt)
		? new Date(entry.createdAt).toISOString()
		: ISO_FALLBACK_DATE;
	const updatedAt = nowIso();
	// Preserve the caller-supplied `dedupeKey` across the IDB round-trip by
	// tucking it into the payload under a reserved, backend-stripped key.
	// Without this, `toQueueEntry` would have to synthesize a key from
	// `entityType:operation:idempotencyKey` and the `enqueue` dedupe check
	// would never match the caller's intent.
	const payload: OfflineJsonObject =
		typeof entry.dedupeKey === "string" && entry.dedupeKey.length > 0
			? { ...entry.payload, __cermontDedupeKey: entry.dedupeKey }
			: entry.payload;
	return {
		localId: entry.id,
		entityType: inferEntityTypeFromEndpoint(entry.endpoint),
		operation: inferOperation(entry.method),
		payload,
		status: mapLegacyStatus(entry.status),
		attempts: Number.isFinite(entry.retryCount) ? entry.retryCount : 0,
		lastError: entry.lastError,
		nextRetryAt: entry.nextRetryAt,
		createdAt,
		updatedAt,
		idempotencyKey: entry.idempotencyKey,
		schemaVersion: "offline.v1",
		userId,
		endpoint: entry.endpoint,
		method: entry.method,
	};
}

export function legacyBlobEntryToOfflineFile(entry: LegacyBlobOutboxEntry): OfflineFileRecord {
	const createdAt = Number.isFinite(entry.createdAt)
		? new Date(entry.createdAt).toISOString()
		: ISO_FALLBACK_DATE;
	const updatedAt = nowIso();
	const entityType = normalizeLegacyEntityType(entry.entityType);
	return {
		localId: entry.id,
		workOrderId: entry.entityId,
		entityType,
		entityId: entry.entityId,
		flowStep: entityType === "delivery_record" ? 9 : 7,
		fileName: entry.originalName,
		mimeType: entry.mimeType,
		sizeBytes: entry.sizeBytes,
		category: entry.category,
		status: entry.status === "dead_letter" ? "failed" : "pending_upload",
		createdAt,
		updatedAt,
		idempotencyKey: entry.clientMutationId,
		blob: entry.blob,
	};
}

export interface OfflineLegacyMigrationSummary {
	syncQueueItems: number;
	blobItems: number;
}

export async function migrateLegacyOfflineStores(
	userId: string,
): Promise<OfflineLegacyMigrationSummary> {
	if (!hasIndexedDBSupport()) {
		return { syncQueueItems: 0, blobItems: 0 };
	}

	const [indexedDbQueueEntries, blobEntries] = await Promise.all([
		readLegacyIndexedDbQueueEntries(),
		readLegacyBlobEntries(),
	]);
	const uniqueQueueEntries = new Map<string, LegacySyncQueueEntry>();
	for (const entry of [...readLegacySyncQueueEntries(), ...indexedDbQueueEntries]) {
		uniqueQueueEntries.set(entry.id, entry);
	}
	const legacyQueueItems = Array.from(uniqueQueueEntries.values()).map((entry) =>
		legacyQueueEntryToOutboxItem(entry, userId),
	);
	const legacyBlobItems = blobEntries.map((entry) => legacyBlobEntryToOfflineFile(entry));

	await offlineDb.transaction("rw", offlineDb.offlineOutbox, offlineDb.offlineFiles, async () => {
		if (legacyQueueItems.length > 0) {
			await offlineDb.offlineOutbox.bulkPut(legacyQueueItems);
		}
		if (legacyBlobItems.length > 0) {
			await offlineDb.offlineFiles.bulkPut(legacyBlobItems);
		}
	});

	await saveOfflineMeta("legacy-offline-migration", {
		userId,
		syncQueueItems: legacyQueueItems.length,
		blobItems: legacyBlobItems.length,
		migratedAt: nowIso(),
	});

	return {
		syncQueueItems: legacyQueueItems.length,
		blobItems: legacyBlobItems.length,
	};
}

export async function saveOfflineMeta(key: string, value: OfflineJsonObject): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}
	await offlineDb.offlineMeta.put({ key, value, updatedAt: nowIso() });
}

export async function readOfflineMeta(key: string) {
	if (!hasIndexedDBSupport()) {
		return;
	}
	return offlineDb.offlineMeta.get(key);
}
