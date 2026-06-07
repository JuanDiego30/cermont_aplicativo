"use client";

import type {
	ApiEnvelope,
	ServiceCase,
	ServiceCaseWorkflowViewModel,
	SiteVisitRecord,
	WorkRequest,
} from "@cermont/shared-types";
import {
	hasIndexedDBSupport,
	nowIso,
	type OfflineDocumentTemplateItem,
	type OfflineDocumentTemplateListSnapshotRecord,
	type OfflineServiceCaseDetailSnapshotRecord,
	type OfflineServiceCaseListSnapshotRecord,
	type OfflineSiteVisitListSnapshotRecord,
	type OfflineWorkRequestListSnapshotRecord,
	offlineDb,
} from "./offline-db";

const SERVICE_CASE_LIST_KEY = "service-cases:list:v1";
const WORK_REQUEST_LIST_KEY = "work-requests:list:v1";
const SITE_VISIT_LIST_KEY = "site-visits:list:v1";
const DOCUMENT_TEMPLATE_LIST_KEY = "document-templates:list:v1";

export type OfflineReadResult<TSnapshot> =
	| {
			status: "found";
			snapshot: TSnapshot;
	  }
	| {
			status: "missing";
	  };

export interface ServiceCaseListSnapshotInput {
	items: ServiceCase[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}

export type ServiceCaseListSnapshot = OfflineServiceCaseListSnapshotRecord;
export type ServiceCaseDetailSnapshot = OfflineServiceCaseDetailSnapshotRecord;
export type WorkRequestListSnapshot = OfflineWorkRequestListSnapshotRecord;
export type SiteVisitListSnapshot = OfflineSiteVisitListSnapshotRecord;
export type DocumentTemplateListSnapshot = OfflineDocumentTemplateListSnapshotRecord;
export type { OfflineDocumentTemplateItem };

function detailKey(serviceCaseId: string): string {
	return `service-cases:detail:v1:${serviceCaseId}`;
}

export async function saveServiceCaseListSnapshot(
	snapshot: ServiceCaseListSnapshotInput,
): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}

	await offlineDb.offlineServiceCaseLists.put({
		key: SERVICE_CASE_LIST_KEY,
		items: snapshot.items,
		total: snapshot.total,
		page: snapshot.page,
		limit: snapshot.limit,
		pages: snapshot.pages,
		updatedAt: nowIso(),
	});
}

export async function readServiceCaseListSnapshot(): Promise<
	OfflineReadResult<ServiceCaseListSnapshot>
> {
	if (!hasIndexedDBSupport()) {
		return { status: "missing" };
	}

	const snapshot = await offlineDb.offlineServiceCaseLists.get(SERVICE_CASE_LIST_KEY);
	if (!snapshot) {
		return { status: "missing" };
	}

	return { status: "found", snapshot };
}

export async function saveServiceCaseDetailSnapshot(
	serviceCaseId: string,
	envelope: ApiEnvelope<ServiceCaseWorkflowViewModel>,
): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}

	await offlineDb.offlineServiceCaseDetails.put({
		key: detailKey(serviceCaseId),
		serviceCaseId,
		envelope,
		updatedAt: nowIso(),
	});
}

export async function readServiceCaseDetailSnapshot(
	serviceCaseId: string,
): Promise<OfflineReadResult<ServiceCaseDetailSnapshot>> {
	if (!hasIndexedDBSupport()) {
		return { status: "missing" };
	}

	const snapshot = await offlineDb.offlineServiceCaseDetails.get(detailKey(serviceCaseId));
	if (!snapshot) {
		return { status: "missing" };
	}

	return { status: "found", snapshot };
}

export async function saveWorkRequestListSnapshot(items: WorkRequest[]): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}

	await offlineDb.offlineWorkRequestLists.put({
		key: WORK_REQUEST_LIST_KEY,
		items,
		updatedAt: nowIso(),
	});
}

export async function readWorkRequestListSnapshot(): Promise<
	OfflineReadResult<WorkRequestListSnapshot>
> {
	if (!hasIndexedDBSupport()) {
		return { status: "missing" };
	}

	const snapshot = await offlineDb.offlineWorkRequestLists.get(WORK_REQUEST_LIST_KEY);
	if (!snapshot) {
		return { status: "missing" };
	}

	return { status: "found", snapshot };
}

export interface SiteVisitListSnapshotInput {
	items: SiteVisitRecord[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}

export async function saveSiteVisitListSnapshot(
	snapshot: SiteVisitListSnapshotInput,
): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}

	await offlineDb.offlineSiteVisitLists.put({
		key: SITE_VISIT_LIST_KEY,
		items: snapshot.items,
		total: snapshot.total,
		page: snapshot.page,
		limit: snapshot.limit,
		pages: snapshot.pages,
		updatedAt: nowIso(),
	});
}

export async function readSiteVisitListSnapshot(): Promise<
	OfflineReadResult<SiteVisitListSnapshot>
> {
	if (!hasIndexedDBSupport()) {
		return { status: "missing" };
	}

	const snapshot = await offlineDb.offlineSiteVisitLists.get(SITE_VISIT_LIST_KEY);
	if (!snapshot) {
		return { status: "missing" };
	}

	return { status: "found", snapshot };
}

export interface DocumentTemplateListSnapshotInput {
	items: OfflineDocumentTemplateItem[];
	total: number;
}

export async function saveDocumentTemplateListSnapshot(
	snapshot: DocumentTemplateListSnapshotInput,
): Promise<void> {
	if (!hasIndexedDBSupport()) {
		return;
	}

	await offlineDb.offlineDocumentTemplateLists.put({
		key: DOCUMENT_TEMPLATE_LIST_KEY,
		items: snapshot.items,
		total: snapshot.total,
		updatedAt: nowIso(),
	});
}

export async function readDocumentTemplateListSnapshot(): Promise<
	OfflineReadResult<DocumentTemplateListSnapshot>
> {
	if (!hasIndexedDBSupport()) {
		return { status: "missing" };
	}

	const snapshot = await offlineDb.offlineDocumentTemplateLists.get(DOCUMENT_TEMPLATE_LIST_KEY);
	if (!snapshot) {
		return { status: "missing" };
	}

	return { status: "found", snapshot };
}
