import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Hoisted mocks ───────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
	deliveryRecordFindById: vi.fn(),
	deliveryRecordFindOne: vi.fn(),
	serviceEntrySheetFindById: vi.fn(),
	serviceEntrySheetFindOne: vi.fn(),
	serviceEntrySheetCreate: vi.fn(),
	serviceEntrySheetCountDocuments: vi.fn(),
	invoiceFindById: vi.fn(),
	invoiceFindOne: vi.fn(),
	invoiceCreate: vi.fn(),
	invoiceCountDocuments: vi.fn(),
	paymentFindById: vi.fn(),
	paymentFindOne: vi.fn(),
	paymentCreate: vi.fn(),
	paymentAggregate: vi.fn(),
	orderFindById: vi.fn(),
	serviceCaseFindByIdAndUpdate: vi.fn(),
	technicalReportFindById: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	DeliveryRecord: { findById: mocks.deliveryRecordFindById, findOne: mocks.deliveryRecordFindOne },
	Invoice: { findById: mocks.invoiceFindById, findOne: mocks.invoiceFindOne, aggregate: vi.fn() },
	Order: { findById: mocks.orderFindById },
	Payment: Object.assign(mocks.paymentCreate, {
		findById: mocks.paymentFindById,
		findOne: mocks.paymentFindOne,
		aggregate: mocks.paymentAggregate,
	}),
	ServiceCase: { findByIdAndUpdate: mocks.serviceCaseFindByIdAndUpdate },
	ServiceEntrySheet: {
		findById: mocks.serviceEntrySheetFindById,
		findOne: mocks.serviceEntrySheetFindOne,
		create: mocks.serviceEntrySheetCreate,
		countDocuments: mocks.serviceEntrySheetCountDocuments,
	},
	TechnicalReport: { findById: mocks.technicalReportFindById },
}));

vi.mock("../../src/models/DeliveryRecord", () => ({
	DeliveryRecord: { findById: mocks.deliveryRecordFindById, findOne: mocks.deliveryRecordFindOne },
}));

vi.mock("../../src/models/ServiceEntrySheet", () => ({
	ServiceEntrySheet: {
		findById: mocks.serviceEntrySheetFindById,
		findOne: mocks.serviceEntrySheetFindOne,
		create: mocks.serviceEntrySheetCreate,
		countDocuments: mocks.serviceEntrySheetCountDocuments,
	},
}));

vi.mock("../../src/models/Invoice", () => ({
	Invoice: {
		findById: mocks.invoiceFindById,
		findOne: mocks.invoiceFindOne,
		create: mocks.invoiceCreate,
		countDocuments: mocks.invoiceCountDocuments,
	},
}));

vi.mock("../../src/models/Payment", () => ({
	Payment: {
		findById: mocks.paymentFindById,
		findOne: mocks.paymentFindOne,
		create: mocks.paymentCreate,
		aggregate: mocks.paymentAggregate,
	},
}));

vi.mock("../../src/modules/notifications/notification.service", () => ({
	createNotification: vi.fn().mockResolvedValue(undefined),
	notifyRoleGroup: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../src/services/invoice-integrity.service", () => ({
	assertInvoiceMatchesServiceEntrySheet: vi.fn(),
}));

// ─── IDs ──────────────────────────────────────────────────────────────────────
const DR_ID = new Types.ObjectId().toString();
const SES_ID = new Types.ObjectId().toString();
const INV_ID = new Types.ObjectId().toString();
const WO_ID = new Types.ObjectId().toString();
const USER_ID = new Types.ObjectId().toString();
const SC_ID = new Types.ObjectId();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildDeliveryRecord(status: string) {
	return {
		_id: new Types.ObjectId(DR_ID),
		workOrderId: new Types.ObjectId(WO_ID),
		technicalReportId: new Types.ObjectId(),
		serviceCaseId: SC_ID,
		clientRepresentative: "Cliente Test",
		status,
		save: vi.fn().mockResolvedValue(undefined),
		toObject: () => ({
			_id: DR_ID,
			status,
			workOrderId: WO_ID,
			serviceCaseId: SC_ID,
			technicalReportId: new Types.ObjectId().toString(),
		}),
	};
}

function buildSES(status: string) {
	return {
		_id: new Types.ObjectId(SES_ID),
		workOrderId: new Types.ObjectId(WO_ID),
		serviceCaseId: SC_ID,
		clientId: new Types.ObjectId(),
		clientName: "Test",
		code: "SES-2026-0001",
		amount: 1000000,
		taxAmount: 190000,
		totalAmount: 1190000,
		currency: "COP",
		subtotal: 1000000,
		total: 1190000,
		serviceLines: [],
		taxLines: [],
		status,
		commandHistory: [],
		save: vi.fn().mockResolvedValue(undefined),
		toObject: () => ({ _id: SES_ID, status, totalAmount: 1190000, currency: "COP" }),
	};
}

function buildInvoice(status: string) {
	return {
		_id: new Types.ObjectId(INV_ID),
		workOrderId: new Types.ObjectId(WO_ID),
		serviceEntrySheetId: new Types.ObjectId(SES_ID),
		serviceCaseId: SC_ID,
		clientId: new Types.ObjectId(),
		clientName: "Test",
		code: "INV-2026-0001",
		totalAmount: 1190000,
		amount: 1000000,
		taxAmount: 190000,
		currency: "COP",
		status,
		commandHistory: [],
		save: vi.fn().mockResolvedValue(undefined),
		toObject: () => ({ _id: INV_ID, status, totalAmount: 1190000, currency: "COP" }),
	};
}

import {
	assertDeliveryRecordSigned,
	assertInvoiceApproved,
	assertPaymentNotExceedsOutstanding,
	assertSESApproved,
} from "../../src/services/workflow-preconditions.service";

// ═══════════════════════════════════════════════════════════════════════════════
// Workflow Preconditions Unit Tests
// ═══════════════════════════════════════════════════════════════════════════════
describe("WorkflowPreconditions — individual checks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("assertDeliveryRecordSigned", () => {
		it("passes when delivery record is signed", async () => {
			mocks.deliveryRecordFindById.mockResolvedValue(buildDeliveryRecord("signed"));
			await expect(assertDeliveryRecordSigned(DR_ID)).resolves.toBeUndefined();
		});

		it("blocks when delivery record does not exist", async () => {
			mocks.deliveryRecordFindById.mockResolvedValue(null);
			await expect(assertDeliveryRecordSigned(DR_ID)).rejects.toThrow();
		});

		it("blocks when delivery record is not signed", async () => {
			mocks.deliveryRecordFindById.mockResolvedValue(buildDeliveryRecord("draft"));
			await expect(assertDeliveryRecordSigned(DR_ID)).rejects.toThrowError(/debe estar firmada/);
		});

		it("blocks when delivery record is rejected", async () => {
			mocks.deliveryRecordFindById.mockResolvedValue(buildDeliveryRecord("rejected"));
			await expect(assertDeliveryRecordSigned(DR_ID)).rejects.toThrowError(/debe estar firmada/);
		});
	});

	describe("assertSESApproved", () => {
		it("passes when SES is approved", async () => {
			mocks.serviceEntrySheetFindById.mockResolvedValue(buildSES("approved"));
			await expect(assertSESApproved(SES_ID)).resolves.toBeUndefined();
		});

		it("blocks when SES does not exist", async () => {
			mocks.serviceEntrySheetFindById.mockResolvedValue(null);
			await expect(assertSESApproved(SES_ID)).rejects.toThrow();
		});

		it("blocks when SES is still in draft", async () => {
			mocks.serviceEntrySheetFindById.mockResolvedValue(buildSES("draft"));
			await expect(assertSESApproved(SES_ID)).rejects.toThrowError(/debe estar aprobada/);
		});

		it("blocks when SES is rejected", async () => {
			mocks.serviceEntrySheetFindById.mockResolvedValue(buildSES("rejected"));
			await expect(assertSESApproved(SES_ID)).rejects.toThrowError(/debe estar aprobada/);
		});
	});

	describe("assertInvoiceApproved", () => {
		it("passes when invoice is approved", async () => {
			mocks.invoiceFindById.mockResolvedValue(buildInvoice("approved"));
			await expect(assertInvoiceApproved(INV_ID)).resolves.toBeUndefined();
		});

		it("passes when invoice is accepted (flexible status)", async () => {
			mocks.invoiceFindById.mockResolvedValue(buildInvoice("accepted"));
			await expect(assertInvoiceApproved(INV_ID)).resolves.toBeUndefined();
		});

		it("passes when invoice is partially paid", async () => {
			mocks.invoiceFindById.mockResolvedValue(buildInvoice("partially_paid"));
			await expect(assertInvoiceApproved(INV_ID)).resolves.toBeUndefined();
		});

		it("blocks when invoice does not exist", async () => {
			mocks.invoiceFindById.mockResolvedValue(null);
			await expect(assertInvoiceApproved(INV_ID)).rejects.toThrow();
		});

		it("blocks when invoice is draft", async () => {
			mocks.invoiceFindById.mockResolvedValue(buildInvoice("draft"));
			await expect(assertInvoiceApproved(INV_ID)).rejects.toThrowError(/debe estar aprobada/);
		});

		it("blocks when invoice is rejected", async () => {
			mocks.invoiceFindById.mockResolvedValue(buildInvoice("rejected"));
			await expect(assertInvoiceApproved(INV_ID)).rejects.toThrowError(/debe estar aprobada/);
		});
	});

	describe("assertPaymentNotExceedsOutstanding", () => {
		it("passes when amount is within outstanding balance", async () => {
			mocks.invoiceFindById.mockResolvedValue(buildInvoice("approved"));
			mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 0 }]);
			const result = await assertPaymentNotExceedsOutstanding(INV_ID, 500000);
			expect(result).toEqual({ paidBefore: 0, outstandingAmount: 1190000 });
		});

		it("passes with partial payment within remaining balance", async () => {
			mocks.invoiceFindById.mockResolvedValue(buildInvoice("approved"));
			mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 500000 }]);
			const result = await assertPaymentNotExceedsOutstanding(INV_ID, 690000);
			expect(result.paidBefore).toBe(500000);
			expect(result.outstandingAmount).toBe(690000);
		});

		it("blocks when amount exceeds outstanding balance", async () => {
			mocks.invoiceFindById.mockResolvedValue(buildInvoice("approved"));
			mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 0 }]);
			await expect(assertPaymentNotExceedsOutstanding(INV_ID, 2000000)).rejects.toThrowError(
				/excede/,
			);
		});
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// SES Service — precondition-gated operations
// ═══════════════════════════════════════════════════════════════════════════════
describe("SES Service — precondition-gated operations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.serviceEntrySheetCountDocuments.mockResolvedValue(0);
	});

	it("creates SES when delivery record is signed", async () => {
		mocks.deliveryRecordFindById.mockResolvedValue(buildDeliveryRecord("signed"));
		mocks.serviceEntrySheetFindOne.mockResolvedValue(null);
		mocks.serviceEntrySheetCreate.mockResolvedValue({
			toObject: () => ({ _id: SES_ID, status: "draft" }),
		});

		const { createServiceEntrySheetFromDeliveryRecord } = await import(
			"../../src/modules/service-entry-sheet/service-entry-sheet.service"
		);
		const result = await createServiceEntrySheetFromDeliveryRecord(
			DR_ID,
			{ amount: 1000000, currency: "COP" },
			USER_ID,
		);
		expect(result).toBeDefined();
		expect(mocks.serviceEntrySheetCreate).toHaveBeenCalled();
	});

	it("blocks SES creation when delivery record is not signed", async () => {
		mocks.deliveryRecordFindById.mockResolvedValue(buildDeliveryRecord("draft"));

		const { createServiceEntrySheetFromDeliveryRecord } = await import(
			"../../src/modules/service-entry-sheet/service-entry-sheet.service"
		);
		await expect(
			createServiceEntrySheetFromDeliveryRecord(DR_ID, {}, USER_ID),
		).rejects.toThrowError(/debe estar firmada/);
		expect(mocks.serviceEntrySheetCreate).not.toHaveBeenCalled();
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// Invoice Service — precondition-gated operations
// ═══════════════════════════════════════════════════════════════════════════════
describe("Invoice Service — precondition-gated operations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.invoiceCountDocuments.mockResolvedValue(0);
	});

	it("creates invoice when SES is approved", async () => {
		mocks.serviceEntrySheetFindById.mockResolvedValue(buildSES("approved"));
		mocks.invoiceFindOne.mockResolvedValue(null);
		mocks.invoiceCreate.mockResolvedValue({
			toJSON: () => ({ _id: INV_ID, status: "issued" }),
		});

		const { createInvoiceFromServiceEntrySheet } = await import(
			"../../src/modules/invoice/invoice.service"
		);
		const result = await createInvoiceFromServiceEntrySheet(SES_ID, {}, USER_ID);
		expect(result).toBeDefined();
		expect(mocks.invoiceCreate).toHaveBeenCalled();
	});

	it("blocks invoice creation when SES is draft", async () => {
		mocks.serviceEntrySheetFindById.mockResolvedValue(buildSES("draft"));

		const { createInvoiceFromServiceEntrySheet } = await import(
			"../../src/modules/invoice/invoice.service"
		);
		await expect(createInvoiceFromServiceEntrySheet(SES_ID, {}, USER_ID)).rejects.toThrowError(
			/debe estar aprobada/,
		);
		expect(mocks.invoiceCreate).not.toHaveBeenCalled();
	});

	it("blocks invoice creation when SES is rejected", async () => {
		mocks.serviceEntrySheetFindById.mockResolvedValue(buildSES("rejected"));

		const { createInvoiceFromServiceEntrySheet } = await import(
			"../../src/modules/invoice/invoice.service"
		);
		await expect(createInvoiceFromServiceEntrySheet(SES_ID, {}, USER_ID)).rejects.toThrowError(
			/debe estar aprobada/,
		);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// Payment Service — precondition-gated operations + partial payments
// ═══════════════════════════════════════════════════════════════════════════════
describe("Payment Service — precondition-gated operations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("registers payment when invoice is approved", async () => {
		mocks.invoiceFindById.mockResolvedValue(buildInvoice("approved"));
		mocks.paymentFindOne.mockResolvedValue(null);
		mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 0 }]);
		mocks.paymentCreate.mockResolvedValue({
			toJSON: () => ({ _id: new Types.ObjectId(), status: "recorded", amount: 1190000 }),
		});

		const { registerPaymentForInvoice } = await import("../../src/modules/payment/payment.service");
		const result = await registerPaymentForInvoice(
			{ invoiceId: INV_ID, paidAt: new Date().toISOString() },
			USER_ID,
		);
		expect(result).toBeDefined();
		expect(mocks.paymentCreate).toHaveBeenCalled();
	});

	it("blocks payment when invoice is draft", async () => {
		mocks.invoiceFindById.mockResolvedValue(buildInvoice("draft"));

		const { registerPaymentForInvoice } = await import("../../src/modules/payment/payment.service");
		await expect(
			registerPaymentForInvoice({ invoiceId: INV_ID, paidAt: new Date().toISOString() }, USER_ID),
		).rejects.toThrowError(/debe estar aprobada/);
		expect(mocks.paymentCreate).not.toHaveBeenCalled();
	});

	it("blocks payment when invoice does not exist", async () => {
		mocks.invoiceFindById.mockResolvedValue(null);

		const { registerPaymentForInvoice } = await import("../../src/modules/payment/payment.service");
		await expect(
			registerPaymentForInvoice({ invoiceId: INV_ID, paidAt: new Date().toISOString() }, USER_ID),
		).rejects.toThrow();
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// Partial Payments
// ═══════════════════════════════════════════════════════════════════════════════
describe("Partial Payments", () => {
	const TOTAL = 1190000;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("registers first partial payment and marks invoice partially_paid", async () => {
		const invoice = buildInvoice("approved");
		invoice.totalAmount = TOTAL;
		mocks.invoiceFindById.mockResolvedValue(invoice);
		mocks.paymentFindOne.mockResolvedValue(null);
		mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 0 }]);
		mocks.paymentCreate.mockResolvedValue({
			toJSON: () => ({ _id: new Types.ObjectId(), status: "recorded", amount: 500000 }),
		});

		const { registerPaymentForInvoice } = await import("../../src/modules/payment/payment.service");
		await registerPaymentForInvoice(
			{ invoiceId: INV_ID, amount: 500000, paidAt: new Date().toISOString() },
			USER_ID,
		);

		expect(invoice.status).toBe("partially_paid");
		expect(invoice.save).toHaveBeenCalled();
	});

	it("registers second partial payment and marks invoice paid", async () => {
		const invoice = buildInvoice("partially_paid");
		invoice.totalAmount = TOTAL;
		mocks.invoiceFindById.mockResolvedValue(invoice);
		mocks.paymentFindOne.mockResolvedValue(null);
		mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 500000 }]);
		mocks.paymentCreate.mockResolvedValue({
			toJSON: () => ({ _id: new Types.ObjectId(), status: "recorded", amount: 690000 }),
		});

		const { registerPaymentForInvoice } = await import("../../src/modules/payment/payment.service");
		await registerPaymentForInvoice(
			{ invoiceId: INV_ID, amount: 690000, paidAt: new Date().toISOString() },
			USER_ID,
		);

		expect(invoice.status).toBe("paid");
		expect(invoice.save).toHaveBeenCalled();
	});

	it("rejects payment that exceeds the outstanding balance", async () => {
		const invoice = buildInvoice("approved");
		invoice.totalAmount = TOTAL;
		mocks.invoiceFindById.mockResolvedValue(invoice);
		mocks.paymentFindOne.mockResolvedValue(null);
		mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 1000000 }]);

		const { registerPaymentForInvoice } = await import("../../src/modules/payment/payment.service");
		await expect(
			registerPaymentForInvoice(
				{ invoiceId: INV_ID, amount: 500000, paidAt: new Date().toISOString() },
				USER_ID,
			),
		).rejects.toThrowError(/excede/);
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// Admin Override (bypass preconditions)
// ═══════════════════════════════════════════════════════════════════════════════
describe("Admin Override — bypass preconditions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("allows payment registration bypassing preconditions", async () => {
		// Invoice is draft (should be blocked normally)
		mocks.invoiceFindById.mockResolvedValue(buildInvoice("draft"));
		mocks.paymentFindOne.mockResolvedValue(null);
		mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 0 }]);
		mocks.paymentCreate.mockResolvedValue({
			toJSON: () => ({ _id: new Types.ObjectId(), status: "recorded", amount: 1190000 }),
		});

		const { registerPaymentForInvoice } = await import("../../src/modules/payment/payment.service");
		const result = await registerPaymentForInvoice(
			{ invoiceId: INV_ID, paidAt: new Date().toISOString() },
			USER_ID,
			{ bypassPreconditions: true },
		);

		expect(result).toBeDefined();
		expect(mocks.paymentCreate).toHaveBeenCalled();
	});
});

// ═══════════════════════════════════════════════════════════════════════════════
// Workflow Service — chain orchestration
// ═══════════════════════════════════════════════════════════════════════════════
describe("AdministrativeWorkflowService — chain orchestration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.serviceEntrySheetCountDocuments.mockResolvedValue(0);
		mocks.invoiceCountDocuments.mockResolvedValue(0);
	});

	it("blocks payment registration when the invoice is still draft (via workflow service)", async () => {
		mocks.invoiceFindById.mockResolvedValue(buildInvoice("draft"));

		const { registerPaymentForInvoice } = await import(
			"../../src/modules/order/administrative-workflow.service"
		);
		await expect(
			registerPaymentForInvoice(
				INV_ID,
				{
					paymentReference: "PAY-2026-0001",
					paidAt: "2026-05-23T12:00:00.000Z",
					amount: 1500000,
					paymentMethod: "bank_transfer",
				},
				{ _id: USER_ID, role: "administrativo" },
			),
		).rejects.toMatchObject({ code: "PAYMENT_INVOICE_NOT_APPROVED" });
	});

	it("allows admin to bypass payment precondition via workflow service", async () => {
		const invoice = buildInvoice("draft");
		invoice.totalAmount = 1500000;
		const paymentId = new Types.ObjectId();
		const paymentRecord = {
			_id: paymentId,
			invoiceId: new Types.ObjectId(INV_ID),
			workOrderId: new Types.ObjectId(WO_ID),
			serviceEntrySheetId: new Types.ObjectId(SES_ID),
			serviceCaseId: SC_ID,
			clientId: new Types.ObjectId(),
			paymentReference: "PAY-ADMIN-001",
			paidAt: new Date("2026-05-23T12:00:00.000Z"),
			amount: 1500000,
			currency: "COP",
			paymentMethod: "bank_transfer",
			status: "recorded",
			recordedBy: new Types.ObjectId(USER_ID),
			recordedAt: new Date(),
			commandHistory: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			save: vi.fn().mockResolvedValue(undefined),
			toObject: function () {
				return {
					_id: this._id,
					invoiceId: this.invoiceId,
					workOrderId: this.workOrderId,
					serviceEntrySheetId: this.serviceEntrySheetId,
					clientId: this.clientId,
					paymentReference: this.paymentReference,
					paidAt: this.paidAt,
					amount: this.amount,
					currency: this.currency,
					paymentMethod: this.paymentMethod,
					status: this.status,
					recordedBy: this.recordedBy,
					recordedAt: this.recordedAt,
					commandHistory: this.commandHistory,
					createdAt: this.createdAt,
					updatedAt: this.updatedAt,
				};
			},
		};
		mocks.invoiceFindById.mockResolvedValue(invoice);
		mocks.paymentFindOne.mockResolvedValue(null);
		mocks.paymentAggregate.mockResolvedValue([{ paidTotal: 0 }]);
		mocks.paymentCreate.mockResolvedValue({
			toJSON: () => ({ _id: paymentId, status: "recorded" }),
		});
		mocks.paymentFindById.mockResolvedValue(paymentRecord);
		mocks.serviceCaseFindByIdAndUpdate.mockResolvedValue(undefined);

		const { registerPaymentForInvoice } = await import(
			"../../src/modules/order/administrative-workflow.service"
		);
		const result = await registerPaymentForInvoice(
			INV_ID,
			{
				paymentReference: "PAY-ADMIN-001",
				paidAt: "2026-05-23T12:00:00.000Z",
				amount: 1500000,
				paymentMethod: "bank_transfer",
			},
			{ _id: USER_ID, role: "gerente" },
			{ bypassPreconditions: true },
		);

		expect(result).toBeDefined();
		expect(mocks.paymentCreate).toHaveBeenCalled();
	});
});
