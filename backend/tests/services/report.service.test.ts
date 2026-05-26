import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnprocessableError } from "../../src/common/errors/AppError";

const mocks = vi.hoisted(() => ({
	orderFindById: vi.fn(),
	checklistFindOne: vi.fn(),
	evidenceCountDocuments: vi.fn(),
	costGetOrderSummary: vi.fn(),
	workReportFindOne: vi.fn(),
	workReportFindById: vi.fn(),
	workReportFind: vi.fn(),
	workReportCountDocuments: vi.fn(),
	workReportConstructor: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	Order: {
		findById: mocks.orderFindById,
	},
	Checklist: {
		findOne: mocks.checklistFindOne,
	},
	Evidence: {
		countDocuments: mocks.evidenceCountDocuments,
	},
	WorkReport: Object.assign(mocks.workReportConstructor, {
		findOne: mocks.workReportFindOne,
		findById: mocks.workReportFindById,
		find: mocks.workReportFind,
		countDocuments: mocks.workReportCountDocuments,
	}),
	Cost: {
		find: vi.fn(),
		findOne: vi.fn(),
	},
}));

vi.mock("../../src/modules/cost/cost.service", () => ({
	getOrderSummary: mocks.costGetOrderSummary,
}));

vi.mock("../../src/services/pdf-generator.service", () => ({
	generateOrderPdf: vi.fn().mockResolvedValue(Buffer.from("%PDF-1.4")),
}));

vi.mock("../../src/common/storage/local-storage", () => ({
	saveFile: vi.fn().mockResolvedValue("/uploads/work-report.pdf"),
}));

import { WorkReport } from "../../src/models";
import * as ReportService from "../../src/modules/report/report.service";

const ORDER_ID = "507f1f77bcf86cd799439011";
const REPORT_ID = "507f1f77bcf86cd799439021";
const USER_ID = "507f1f77bcf86cd799439031";

function buildOrder(overrides: Record<string, unknown> = {}) {
	return {
		_id: new Types.ObjectId(ORDER_ID),
		code: "OT-202604-0001",
		status: "completed",
		description: "Replace pump seal",
		...overrides,
	};
}

function buildChecklist(overrides: Record<string, unknown> = {}) {
	return {
		_id: new Types.ObjectId("507f1f77bcf86cd799439041"),
		orderId: new Types.ObjectId(ORDER_ID),
		status: "completed",
		items: [{ checked: true, description: "Safety check" }],
		signature: "data:image/png;base64,ZmFrZQ==",
		...overrides,
	};
}

function buildReportDoc(overrides: Record<string, unknown> = {}) {
	const save = vi.fn().mockResolvedValue(undefined);

	return {
		_id: new Types.ObjectId(REPORT_ID),
		orderId: new Types.ObjectId(ORDER_ID),
		title: "Work report - OT-202604-0001",
		summary: "Summary",
		status: "draft",
		generatedBy: new Types.ObjectId(USER_ID),
		approvedBy: undefined,
		approvedAt: undefined,
		rejectionReason: undefined,
		pdfPath: undefined,
		includesChecklist: true,
		includesCosts: true,
		includesEvidences: true,
		createdAt: new Date("2026-03-23T12:00:00Z"),
		updatedAt: new Date("2026-03-23T13:00:00Z"),
		save,
		...overrides,
	};
}

describe("ReportService", () => {
	const WorkReportModel = WorkReport as unknown as {
		mockImplementation: (implementation: (...args: unknown[]) => unknown) => void;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.orderFindById.mockReturnValue({
			lean: vi.fn().mockResolvedValue(buildOrder()),
		});
		mocks.checklistFindOne.mockReturnValue({
			lean: vi.fn().mockResolvedValue(buildChecklist()),
		});
		mocks.evidenceCountDocuments.mockResolvedValue(2);
		mocks.costGetOrderSummary.mockResolvedValue({
			orderId: ORDER_ID,
			totalEstimated: 1000,
			totalActual: 1200,
			totalTax: 190,
			variance: 200,
			variancePercent: 0.2,
			hasCosts: true,
			byCategory: [],
		});
		mocks.workReportFindOne.mockReturnValue({
			lean: vi.fn().mockResolvedValue(null),
		});
		mocks.workReportFindById.mockResolvedValue(null);
		mocks.workReportFind.mockReturnValue({
			sort: vi.fn().mockReturnThis(),
			skip: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnValue({
				lean: vi.fn().mockResolvedValue([]),
			}),
		});
		mocks.workReportCountDocuments.mockResolvedValue(0);
		WorkReportModel.mockImplementation(function (this: unknown, doc: Record<string, unknown>) {
			return buildReportDoc(doc) as never;
		});
	});

	it("createReport crea un borrador cuando la orden y el checklist están completos", async () => {
		WorkReportModel.mockImplementationOnce(function (this: unknown, doc: Record<string, unknown>) {
			return buildReportDoc(doc) as never;
		});

		const report = await ReportService.ReportService.create(
			{ orderId: ORDER_ID, title: "Informe técnico", summary: "Resumen" },
			USER_ID,
		);

		expect(report.status).toBe("draft");
		expect(report.title).toBe("Informe técnico");
		expect(report.includesChecklist).toBe(true);
		expect(report.includesCosts).toBe(true);
	});

	it("createReport lanza REPORT_CHECKLIST_INCOMPLETE si el checklist no está completado", async () => {
		mocks.checklistFindOne.mockReturnValueOnce({
			lean: vi.fn().mockResolvedValue(buildChecklist({ status: "pending" })),
		});

		await expect(
			ReportService.ReportService.create({ orderId: ORDER_ID, title: "Informe técnico" }, USER_ID),
		).rejects.toThrow(UnprocessableError);
	});

	it("createReport lanza REPORT_NO_COSTS si no hay costos registrados", async () => {
		mocks.costGetOrderSummary.mockResolvedValueOnce({
			orderId: ORDER_ID,
			totalEstimated: 0,
			totalActual: 0,
			totalTax: 0,
			variance: 0,
			variancePercent: null,
			hasCosts: false,
			byCategory: [],
		});
		mocks.checklistFindOne.mockReturnValueOnce({
			lean: vi.fn().mockResolvedValue(buildChecklist()),
		});

		await expect(
			ReportService.ReportService.create({ orderId: ORDER_ID, title: "Informe técnico" }, USER_ID),
		).rejects.toThrow("The order must contain at least one cost before creating a report");
	});

	it("approveReport cambia el estado a approved y registra el aprobador", async () => {
		const reportDoc = buildReportDoc();
		mocks.workReportFindById.mockResolvedValueOnce(reportDoc);

		const report = await ReportService.ReportService.approveReport(
			REPORT_ID,
			USER_ID,
			"supervisor",
		);

		expect(report.status).toBe("approved");
		expect(report.approvedBy).toBe(USER_ID);
		expect(report.approvedAt).toBeDefined();
	});

	it("approveReport lanza ForbiddenError si el rol no puede aprobar", async () => {
		await expect(
			ReportService.ReportService.approveReport(REPORT_ID, USER_ID, "tecnico"),
		).rejects.toThrow(ForbiddenError);
	});
});
