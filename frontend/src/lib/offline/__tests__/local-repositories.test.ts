import type {
	ApiEnvelope,
	ServiceCase,
	ServiceCaseWorkflowViewModel,
	SiteVisitRecord,
	WorkRequest,
} from "@cermont/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OfflineDocumentTemplateItem } from "../offline-db";

type ServiceCaseListSnapshotRecord = {
	key: string;
	items: ServiceCase[];
	total: number;
	page: number;
	limit: number;
	pages: number;
	updatedAt: string;
};

type ServiceCaseDetailSnapshotRecord = {
	key: string;
	serviceCaseId: string;
	envelope: ApiEnvelope<ServiceCaseWorkflowViewModel>;
	updatedAt: string;
};

type WorkRequestListSnapshotRecord = {
	key: string;
	items: WorkRequest[];
	updatedAt: string;
};

type SiteVisitListSnapshotRecord = {
	key: string;
	items: SiteVisitRecord[];
	total: number;
	page: number;
	limit: number;
	pages: number;
	updatedAt: string;
};

type DocumentTemplateListSnapshotRecord = {
	key: string;
	items: OfflineDocumentTemplateItem[];
	total: number;
	updatedAt: string;
};

const listStore = new Map<string, ServiceCaseListSnapshotRecord>();
const detailStore = new Map<string, ServiceCaseDetailSnapshotRecord>();
const workRequestListStore = new Map<string, WorkRequestListSnapshotRecord>();
const siteVisitListStore = new Map<string, SiteVisitListSnapshotRecord>();
const documentTemplateListStore = new Map<string, DocumentTemplateListSnapshotRecord>();

const offlineDbMocks = vi.hoisted(() => ({
	hasIndexedDBSupport: vi.fn(() => true),
	nowIso: vi.fn(() => "2026-06-05T12:00:00.000Z"),
	offlineServiceCaseLists: {
		get: vi.fn((key: string) => Promise.resolve(listStore.get(key))),
		put: vi.fn((record: ServiceCaseListSnapshotRecord) => {
			listStore.set(record.key, record);
			return Promise.resolve(record.key);
		}),
	},
	offlineServiceCaseDetails: {
		get: vi.fn((key: string) => Promise.resolve(detailStore.get(key))),
		put: vi.fn((record: ServiceCaseDetailSnapshotRecord) => {
			detailStore.set(record.key, record);
			return Promise.resolve(record.key);
		}),
	},
	offlineWorkRequestLists: {
		get: vi.fn((key: string) => Promise.resolve(workRequestListStore.get(key))),
		put: vi.fn((record: WorkRequestListSnapshotRecord) => {
			workRequestListStore.set(record.key, record);
			return Promise.resolve(record.key);
		}),
	},
	offlineSiteVisitLists: {
		get: vi.fn((key: string) => Promise.resolve(siteVisitListStore.get(key))),
		put: vi.fn((record: SiteVisitListSnapshotRecord) => {
			siteVisitListStore.set(record.key, record);
			return Promise.resolve(record.key);
		}),
	},
	offlineDocumentTemplateLists: {
		get: vi.fn((key: string) => Promise.resolve(documentTemplateListStore.get(key))),
		put: vi.fn((record: DocumentTemplateListSnapshotRecord) => {
			documentTemplateListStore.set(record.key, record);
			return Promise.resolve(record.key);
		}),
	},
}));

vi.mock("../offline-db", () => ({
	hasIndexedDBSupport: offlineDbMocks.hasIndexedDBSupport,
	nowIso: offlineDbMocks.nowIso,
	offlineDb: {
		offlineServiceCaseLists: offlineDbMocks.offlineServiceCaseLists,
		offlineServiceCaseDetails: offlineDbMocks.offlineServiceCaseDetails,
		offlineWorkRequestLists: offlineDbMocks.offlineWorkRequestLists,
		offlineSiteVisitLists: offlineDbMocks.offlineSiteVisitLists,
		offlineDocumentTemplateLists: offlineDbMocks.offlineDocumentTemplateLists,
	},
}));

const {
	readDocumentTemplateListSnapshot,
	readServiceCaseDetailSnapshot,
	readServiceCaseListSnapshot,
	readSiteVisitListSnapshot,
	readWorkRequestListSnapshot,
	saveDocumentTemplateListSnapshot,
	saveServiceCaseDetailSnapshot,
	saveServiceCaseListSnapshot,
	saveSiteVisitListSnapshot,
	saveWorkRequestListSnapshot,
} = await import("../local-repositories");

const serviceCase: ServiceCase = {
	_id: "service-case-1",
	code: "SC-2026-0001",
	clientName: "ACME Energy",
	currentStage: "planning",
	currentStepCode: "step_05_planning",
	artifacts: {},
	blockers: [],
	currentStepRequirements: [],
	stepsChecklist: [],
	nextActions: [],
	timeline: [],
	createdAt: "2026-06-05T10:00:00.000Z",
	updatedAt: "2026-06-05T11:00:00.000Z",
};

const workflowEnvelope: ApiEnvelope<ServiceCaseWorkflowViewModel> = {
	success: true,
	data: {
		serviceCaseId: "service-case-1",
		code: "SC-2026-0001",
		clientName: "ACME Energy",
		globalStatus: "planning",
		updatedAt: "2026-06-05T11:00:00.000Z",
		currentStepCode: "step_05_planning",
		steps: [],
		activeStepRequirements: [],
		blockers: [],
		nextActions: [],
		artifacts: {},
		timeline: [],
		documents: [],
		evidences: [],
		costs: {
			estimated: {
				proposalValue: 0,
				estimatedLabor: 0,
				estimatedMaterials: 0,
				estimatedEquipment: 0,
				estimatedTaxes: 0,
				estimatedTotalCost: 0,
				estimatedMargin: 0,
			},
			actual: {
				actualLabor: 0,
				actualMaterials: 0,
				actualEquipment: 0,
				actualTaxes: 0,
				actualTotalCost: 0,
				actualMargin: 0,
			},
			billing: {
				sesValue: 0,
				invoiceValue: 0,
				paidValue: 0,
				pendingValue: 0,
			},
			variance: {
				costDifference: 0,
				marginDifference: 0,
				status: "ok",
			},
		},
		closure: {
			deliveryRecordSigned: false,
			sesSubmitted: false,
			sesApproved: false,
			invoiceSubmitted: false,
			invoiceApproved: false,
			paymentReconciled: false,
			caseClosed: false,
			daysOverdue: 0,
			closingPackageReady: false,
		},
		generatedAt: "2026-06-05T12:00:00.000Z",
	},
};

const workRequest: WorkRequest = {
	_id: "work-request-1",
	code: "WR-2026-0001",
	status: "submitted",
	urgency: "medium",
	requesterName: "Ana Cliente",
	requesterEmail: "ana@example.com",
	requesterPhone: "3000000000",
	clientName: "ACME Energy",
	serviceSite: "Arauca",
	serviceType: "Mantenimiento",
	sourceChannel: "email",
	shortDescription: "Mantenimiento preventivo CCTV",
	description: "Solicitud de mantenimiento preventivo del sistema CCTV de la sede.",
	tags: [],
	classifications: [],
	initialEvidences: [],
	requiresSiteVisit: true,
	customFields: {},
	createdBy: "user-1",
	createdAt: "2026-06-05T10:00:00.000Z",
	updatedAt: "2026-06-05T11:00:00.000Z",
	archived: false,
};

const siteVisit: SiteVisitRecord = {
	_id: "site-visit-1",
	code: "SV-2026-0001",
	workRequestId: "work-request-1",
	serviceCaseId: "service-case-1",
	clientId: "client-1",
	clientName: "ACME Energy",
	visitDate: "2026-06-05T14:00:00.000Z",
	location: "Arauca",
	responsibleUserId: "user-1",
	responsibleName: "Residente",
	measurements: [],
	findings: [],
	photos: [],
	commandHistory: [],
	status: "scheduled",
	createdBy: "user-1",
	createdAt: "2026-06-05T10:00:00.000Z",
	updatedAt: "2026-06-05T11:00:00.000Z",
};

const documentTemplate: OfflineDocumentTemplateItem = {
	_id: "template-1",
	name: "Formato mantenimiento CCTV",
	description: "Plantilla de mantenimiento preventivo",
	version: 1,
	status: "published",
	createdAt: "2026-06-05T10:00:00.000Z",
	updatedAt: "2026-06-05T11:00:00.000Z",
};

describe("local offline repositories", () => {
	beforeEach(() => {
		listStore.clear();
		detailStore.clear();
		workRequestListStore.clear();
		siteVisitListStore.clear();
		documentTemplateListStore.clear();
		vi.clearAllMocks();
		offlineDbMocks.hasIndexedDBSupport.mockReturnValue(true);
	});

	it("stores and reads service case list snapshots from IndexedDB", async () => {
		await saveServiceCaseListSnapshot({
			items: [serviceCase],
			total: 1,
			page: 1,
			limit: 50,
			pages: 1,
		});

		const result = await readServiceCaseListSnapshot();

		expect(result.status).toBe("found");
		if (result.status === "found") {
			expect(result.snapshot.items).toEqual([serviceCase]);
			expect(result.snapshot.updatedAt).toBe("2026-06-05T12:00:00.000Z");
		}
	});

	it("returns a status object when no local service cases exist", async () => {
		await expect(readServiceCaseListSnapshot()).resolves.toEqual({ status: "missing" });
	});

	it("stores and reads service case workflow snapshots by case id", async () => {
		await saveServiceCaseDetailSnapshot("service-case-1", workflowEnvelope);

		const result = await readServiceCaseDetailSnapshot("service-case-1");

		expect(result.status).toBe("found");
		if (result.status === "found") {
			expect(result.snapshot.envelope).toEqual(workflowEnvelope);
			expect(result.snapshot.serviceCaseId).toBe("service-case-1");
		}
	});

	it("stores and reads work request list snapshots from IndexedDB", async () => {
		await saveWorkRequestListSnapshot([workRequest]);

		const result = await readWorkRequestListSnapshot();

		expect(result.status).toBe("found");
		if (result.status === "found") {
			expect(result.snapshot.items).toEqual([workRequest]);
			expect(result.snapshot.updatedAt).toBe("2026-06-05T12:00:00.000Z");
		}
	});

	it("stores and reads site visit list snapshots from IndexedDB", async () => {
		await saveSiteVisitListSnapshot({
			items: [siteVisit],
			total: 1,
			page: 1,
			limit: 50,
			pages: 1,
		});

		const result = await readSiteVisitListSnapshot();

		expect(result.status).toBe("found");
		if (result.status === "found") {
			expect(result.snapshot.items).toEqual([siteVisit]);
			expect(result.snapshot.total).toBe(1);
		}
	});

	it("stores and reads document template list snapshots from IndexedDB", async () => {
		await saveDocumentTemplateListSnapshot({
			items: [documentTemplate],
			total: 1,
		});

		const result = await readDocumentTemplateListSnapshot();

		expect(result.status).toBe("found");
		if (result.status === "found") {
			expect(result.snapshot.items).toEqual([documentTemplate]);
			expect(result.snapshot.total).toBe(1);
		}
	});
});
