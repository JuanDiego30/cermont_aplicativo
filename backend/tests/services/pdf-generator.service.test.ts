/**
 * PDF Generator Service Tests
 *
 * Covers the live PDF builder used by order reports and delivery PDFs.
 */

import { PDFDocument } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/common/errors/AppError";
import { Checklist } from "../../src/models/Checklist";
import { Cost } from "../../src/models/Cost";
import { Evidence } from "../../src/models/Evidence";
import { Order } from "../../src/models/Order";
import { generateOrderPdf } from "../../src/services/pdf-generator.service";

vi.mock("../../src/models/Order", () => ({
	Order: {
		findById: vi.fn(),
		updateOne: vi.fn(),
	},
}));

vi.mock("../../src/models/Cost", () => ({
	Cost: {
		find: vi.fn(),
	},
}));

vi.mock("../../src/models/Evidence", () => ({
	Evidence: {
		find: vi.fn(),
	},
}));

vi.mock("../../src/models/Checklist", () => ({
	Checklist: {
		find: vi.fn(),
	},
}));

vi.mock("../../src/common/utils/logger", () => ({
	createLogger: vi.fn().mockReturnValue({
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}),
}));

const OrderMock = vi.mocked(Order);
const CostMock = vi.mocked(Cost);
const EvidenceMock = vi.mocked(Evidence);
const ChecklistMock = vi.mocked(Checklist);

function _makePopulateQuery<T>(result: T) {
	return {
		populate: vi.fn().mockReturnThis(),
		lean: vi.fn().mockResolvedValue(result),
	};
}

function makeSortQuery<T>(result: T) {
	return {
		sort: vi.fn().mockReturnThis(),
		lean: vi.fn().mockResolvedValue(result),
	};
}

function mockDefaultRelatedData() {
	CostMock.find.mockReturnValue(makeSortQuery([]) as never);
	EvidenceMock.find.mockReturnValue(makeSortQuery([]) as never);
	ChecklistMock.find.mockReturnValue(makeSortQuery([]) as never);
	OrderMock.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as never);
}

describe("PdfGeneratorService", () => {
	const mockOrderId = "507f1f77bcf86cd799439011";

	beforeEach(() => {
		vi.clearAllMocks();
		mockDefaultRelatedData();
	});

	describe("generateOrderPdf", () => {
		it("should generate a technical report PDF and update the report flag", async () => {
			const mockOrder = {
				_id: { toString: () => mockOrderId },
				code: "OT-260401-0001",
				type: "maintenance",
				status: "completed",
				priority: "high",
				description: "Test order for PDF generation",
				assetId: "PUMP-01",
				assetName: "Main Pump",
				location: "Plant A",
				assignedTo: { name: "Test Technician" },
				assignedToName: "Test Technician",
				supervisedBy: { name: "Supervisor" },
				materials: [
					{
						name: "Replacement filter",
						quantity: 2,
						unit: "u",
						unitCost: 35000,
						delivered: true,
					},
				],
				observations: "Execution completed successfully.",
				invoiceReady: true,
				reportGenerated: false,
				createdBy: { name: "Reporter" },
				createdAt: new Date("2026-03-23T12:00:00Z"),
				updatedAt: new Date("2026-03-23T13:00:00Z"),
				startedAt: new Date("2026-03-23T12:30:00Z"),
				completedAt: new Date("2026-03-23T13:30:00Z"),
			};

			OrderMock.findById.mockReturnValue({
				populate: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue(mockOrder),
			} as never);

			const pdfBuffer = await generateOrderPdf({ orderId: mockOrderId, type: "technical" });

			expect(pdfBuffer).toBeInstanceOf(Buffer);
			expect(pdfBuffer.length).toBeGreaterThan(0);
			expect(pdfBuffer.subarray(0, 5).toString()).toBe("%PDF-");

			const pdf = await PDFDocument.load(pdfBuffer);
			expect(pdf.getPageCount()).toBeGreaterThan(0);
			expect(OrderMock.updateOne).toHaveBeenCalledWith(
				{ _id: mockOrderId },
				{ $set: { reportGenerated: true } },
			);
		});

		it("should generate a delivery report PDF", async () => {
			const mockOrder = {
				_id: { toString: () => mockOrderId },
				code: "OT-260401-0002",
				type: "inspection",
				status: "completed",
				priority: "medium",
				description: "Delivery order",
				assetId: "INS-01",
				assetName: "Inspection Asset",
				location: "Plant B",
				assignedTo: { name: "Delivery Tech" },
				assignedToName: "Delivery Tech",
				supervisedBy: { name: "Supervisor" },
				createdBy: { name: "Reporter" },
				materials: [],
				invoiceReady: false,
				reportGenerated: false,
				createdAt: new Date("2026-03-23T12:00:00Z"),
				updatedAt: new Date("2026-03-23T13:00:00Z"),
			};

			OrderMock.findById.mockReturnValue({
				populate: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue(mockOrder),
			} as never);

			const pdfBuffer = await generateOrderPdf({ orderId: mockOrderId, type: "delivery" });

			expect(pdfBuffer).toBeInstanceOf(Buffer);
			expect(pdfBuffer.length).toBeGreaterThan(0);
			expect(pdfBuffer.subarray(0, 5).toString()).toBe("%PDF-");
		});

		it("should throw AppError when order not found", async () => {
			OrderMock.findById.mockReturnValue({
				populate: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue(null),
			} as never);

			await expect(generateOrderPdf({ orderId: "nonexistent", type: "technical" })).rejects.toThrow(
				AppError,
			);
		});

		it("should handle orders with minimal data", async () => {
			const mockOrder = {
				_id: { toString: () => mockOrderId },
				code: "OT-260401-0003",
				type: "maintenance",
				status: "open",
				priority: "low",
				assetId: "ASSET-1",
				assetName: "Asset 1",
				location: "Unknown location",
				description: "Minimal order payload",
				materials: [],
				invoiceReady: false,
				reportGenerated: false,
				createdAt: new Date("2026-03-23T12:00:00Z"),
				updatedAt: new Date("2026-03-23T13:00:00Z"),
			};

			OrderMock.findById.mockReturnValue({
				populate: vi.fn().mockReturnThis(),
				lean: vi.fn().mockResolvedValue(mockOrder),
			} as never);

			const pdfBuffer = await generateOrderPdf({ orderId: mockOrderId, type: "technical" });

			expect(pdfBuffer).toBeInstanceOf(Buffer);
			expect(pdfBuffer.length).toBeGreaterThan(0);
		});
	});
});
