/**
 * Spec 008 — New Endpoints Controller Tests
 */

import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock services ──────────────────────────────────────────────────

const mockTrackDownload = vi.fn();
const mockTrackView = vi.fn();
const mockGetWorkOrderStatus = vi.fn();
const mockGetSyncSummary = vi.fn();
const mockCreateCost = vi.fn();
const mockUploadPhoto = vi.fn();
const mockGetPhotos = vi.fn();
const mockSetPrimaryPhoto = vi.fn();
const mockUploadDocument = vi.fn();
const mockGetDocuments = vi.fn();
const mockValidateMapping = vi.fn();
const mockTestSync = vi.fn();

vi.mock("../../src/common/utils/request", () => ({
	requireUser: vi.fn(() => ({ _id: "user-1", role: "gerente" })),
}));

vi.mock("../../src/modules/evidence/evidence.service", () => ({
	trackDownload: mockTrackDownload,
	trackView: mockTrackView,
	getEvidenceById: vi.fn(),
	listEvidences: vi.fn(),
	getEvidencesByOrderId: vi.fn(),
	getEvidenceStats: vi.fn(),
	createEvidence: vi.fn(),
	deleteEvidence: vi.fn(),
	verifyEvidence: vi.fn(),
}));

vi.mock("../../src/modules/sla/sla.service", () => ({
	SLAService: {
		getConfigs: vi.fn(),
		updateConfigs: vi.fn(),
		getDashboard: vi.fn(),
		getActiveTrackings: vi.fn(),
		escalateTracking: vi.fn(),
		getWorkOrderStatus: mockGetWorkOrderStatus,
		getSyncSummary: mockGetSyncSummary,
	},
}));

vi.mock("../../src/modules/erp-connector/erp-connector.service", () => ({
	erpConnectorService: {
		list: vi.fn(),
		getById: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		sync: vi.fn(),
		validateMapping: mockValidateMapping,
		testSync: mockTestSync,
		healthCheckAll: vi.fn(),
		getMetrics: vi.fn(),
	},
}));

vi.mock("../../src/modules/cost/cost.service", () => ({
	createCost: mockCreateCost,
	updateCost: vi.fn(),
	deleteCost: vi.fn(),
	listCosts: vi.fn(),
	getCostsByOrderId: vi.fn(),
	getCostById: vi.fn(),
	getOrderSummary: vi.fn(),
	getCostDashboard: vi.fn(),
}));

vi.mock("../../src/modules/asset/asset.service", () => ({
	uploadPhoto: mockUploadPhoto,
	getPhotos: mockGetPhotos,
	setPrimaryPhoto: mockSetPrimaryPhoto,
	uploadDocument: mockUploadDocument,
	getDocuments: mockGetDocuments,
	createAsset: vi.fn(),
	getAssets: vi.fn(),
	getAssetById: vi.fn(),
	updateAsset: vi.fn(),
	updateAssetStatus: vi.fn(),
	deleteAsset: vi.fn(),
}));

// ─── Helpers ────────────────────────────────────────────────────────

function mockReq(overrides: Partial<Request> = {}): Request {
	return { query: {}, params: {}, body: {}, ...overrides } as Request;
}

function mockRes(): Response {
	const res: Partial<Response> = {};
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	return res as Response;
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("Evidence — download & view", () => {
	beforeEach(() => vi.clearAllMocks());

	it("downloadEvidence should log audit and return 200", async () => {
		mockTrackDownload.mockResolvedValue({ url: "/uploads/e-1.webp", filename: "e-1.webp" });
		const req = mockReq({ params: { id: "507f1f77bcf86cd799439011" } });
		const res = mockRes();
		const ctrl = await import("../../src/modules/evidence/evidence.controller");
		await ctrl.downloadEvidence(req, res);
		expect(mockTrackDownload).toHaveBeenCalledWith("507f1f77bcf86cd799439011", "user-1");
		expect(res.status).toHaveBeenCalledWith(200);
	});

	it("viewEvidence should log view and return 200", async () => {
		mockTrackView.mockResolvedValue({ _id: "507f1f77bcf86cd799439011", url: "/uploads/e-1.webp" });
		const req = mockReq({ params: { id: "507f1f77bcf86cd799439011" } });
		const res = mockRes();
		const ctrl = await import("../../src/modules/evidence/evidence.controller");
		await ctrl.viewEvidence(req, res);
		expect(mockTrackView).toHaveBeenCalledWith("507f1f77bcf86cd799439011", {
			_id: "user-1",
			role: "gerente",
		});
		expect(res.status).toHaveBeenCalledWith(200);
	});
});

describe("SLA — work-order status & summary", () => {
	beforeEach(() => vi.clearAllMocks());

	it("getWorkOrderStatus returns status with deadlines", async () => {
		mockGetWorkOrderStatus.mockResolvedValue({ status: "active", deadlines: {} });
		const req = mockReq({ params: { id: "wo-1" } });
		const res = mockRes();
		const { SLAController } = await import("../../src/modules/sla/sla.controller");
		await SLAController.getWorkOrderStatus(req, res);
		expect(mockGetWorkOrderStatus).toHaveBeenCalledWith("wo-1");
		expect(res.status).toHaveBeenCalledWith(200);
	});

	it("getSummary returns aggregated SLA data", async () => {
		mockGetSyncSummary.mockResolvedValue({ summary: { total: 10 } });
		const req = mockReq();
		const res = mockRes();
		const { SLAController } = await import("../../src/modules/sla/sla.controller");
		await SLAController.getSummary(req, res);
		expect(mockGetSyncSummary).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
	});
});

describe("ERP — validate-mapping & test-sync", () => {
	beforeEach(() => vi.clearAllMocks());

	it("validateMapping returns validation result", async () => {
		mockValidateMapping.mockResolvedValue({ valid: true, errors: [] });
		const req = mockReq({ params: { id: "c1" }, body: { fieldMappings: { a: "b" } } });
		const res = mockRes();
		const ctrl = await import("../../src/modules/erp-connector/erp-connector.controller");
		await ctrl.erpConnectorController.validateMapping(req, res);
		expect(mockValidateMapping).toHaveBeenCalledWith("c1", { a: "b" });
		expect(res.status).toHaveBeenCalledWith(200);
	});

	it("testSync returns sync result", async () => {
		mockTestSync.mockResolvedValue({ success: true, recordsProcessed: 3 });
		const req = mockReq({ params: { id: "c1" } });
		const res = mockRes();
		const ctrl = await import("../../src/modules/erp-connector/erp-connector.controller");
		await ctrl.erpConnectorController.testSync(req, res);
		expect(mockTestSync).toHaveBeenCalledWith("c1");
		expect(res.status).toHaveBeenCalledWith(200);
	});
});

describe("Cost — order items", () => {
	beforeEach(() => vi.clearAllMocks());

	it("createCostItemForOrder delegates to service with orderId", async () => {
		mockCreateCost.mockResolvedValue({ _id: "c1" });
		const req = mockReq({ params: { orderId: "o1" }, body: { category: "labor" } });
		const res = mockRes();
		const ctrl = await import("../../src/modules/cost/cost.controller");
		await ctrl.createCostItemForOrder(req, res);
		expect(mockCreateCost).toHaveBeenCalledWith(
			expect.objectContaining({ orderId: "o1" }),
			"user-1",
		);
		expect(res.status).toHaveBeenCalledWith(201);
	});
});

describe("Asset — photo & document", () => {
	beforeEach(() => vi.clearAllMocks());

	it("uploadPhoto delegates to service", async () => {
		mockUploadPhoto.mockResolvedValue({ _id: "507f1f77bcf86cd799439011" });
		const req = mockReq({
			params: { id: "507f1f77bcf86cd799439011" },
			file: { buffer: Buffer.from("x"), originalname: "x.jpg", mimetype: "image/jpeg" },
		});
		const res = mockRes();
		const ctrl = await import("../../src/modules/asset/asset.controller");
		await ctrl.uploadPhoto(req, res);
		expect(mockUploadPhoto).toHaveBeenCalledWith(
			"507f1f77bcf86cd799439011",
			expect.any(Buffer),
			"user-1",
			void 0,
		);
		expect(res.status).toHaveBeenCalledWith(201);
	});

	it("getPhotos returns photo list", async () => {
		mockGetPhotos.mockResolvedValue([{ _id: "507f1f77bcf86cd799439011", url: "/uploads/p.webp" }]);
		const req = mockReq({ params: { id: "507f1f77bcf86cd799439011" } });
		const res = mockRes();
		const ctrl = await import("../../src/modules/asset/asset.controller");
		await ctrl.getPhotos(req, res);
		expect(mockGetPhotos).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
		expect(res.status).toHaveBeenCalledWith(200);
	});

	it("uploadDocument delegates to service", async () => {
		mockUploadDocument.mockResolvedValue({ _id: "507f1f77bcf86cd799439011" });
		const req = mockReq({
			params: { id: "507f1f77bcf86cd799439011" },
			file: { buffer: Buffer.from("x"), originalname: "doc.pdf", mimetype: "application/pdf" },
		});
		const res = mockRes();
		const ctrl = await import("../../src/modules/asset/asset.controller");
		await ctrl.uploadDocument(req, res);
		expect(mockUploadDocument).toHaveBeenCalledWith(
			"507f1f77bcf86cd799439011",
			expect.any(Buffer),
			"doc.pdf",
			"application/pdf",
			"user-1",
			void 0,
		);
		expect(res.status).toHaveBeenCalledWith(201);
	});
});
