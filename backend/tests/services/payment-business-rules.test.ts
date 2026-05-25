/**
 * P0 Business Rule Tests — Payment / SES / Invoice Gates
 *
 * Proves that Cermont's 14-step workflow orchestrator blocks illegal transitions.
 * Each gate is tested by mocking the service precondition and asserting
 * the specific error code thrown.
 */

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UnprocessableError } from "../../src/common/errors/AppError";

// ── Test constants ──────────────────────────────────────────────────

const INVOICE_ID = "507f1f77bcf86cd799439011";
const SES_ID = "507f1f77bcf86cd799439012";
const RECORD_ID = "507f1f77bcf86cd799439013";
const ORDER_ID = "507f1f77bcf86cd799439014";
const CLIENT_ID = "507f1f77bcf86cd799439015";
const USER_ID = "507f1f77bcf86cd799439016";

// ── Hoisted mocks ───────────────────────────────────────────────────

const m = vi.hoisted(() => ({
	drFindById: vi.fn(), // DeliveryRecord.findById
	invFindById: vi.fn(), // Invoice.findById
	invFindOne: vi.fn(), // Invoice.findOne
	payAggregate: vi.fn(), // Payment.aggregate
	payFindOne: vi.fn(), // Payment.findOne
	sesFindById: vi.fn(), // ServiceEntrySheet.findById
	sesFindOne: vi.fn(), // ServiceEntrySheet.findOne
	ordFindById: vi.fn(), // Order.findById
}));

// ── Model mocks ─────────────────────────────────────────────────────

vi.mock("../../src/models", () => ({
	DeliveryRecord: { findById: m.drFindById },
	ExecutionSession: { findById: vi.fn(), findOne: vi.fn() },
	Invoice: { findById: m.invFindById, findOne: m.invFindOne, countDocuments: vi.fn() },
	Order: { findById: m.ordFindById },
	Payment: { aggregate: m.payAggregate, findOne: m.payFindOne },
	ServiceCase: { findByIdAndUpdate: vi.fn().mockResolvedValue({}) },
	ServiceEntrySheet: { findById: m.sesFindById, findOne: m.sesFindOne, countDocuments: vi.fn() },
	TechnicalReport: { findById: vi.fn() },
}));

// ── Dynamic imports after mock setup ────────────────────────────────

const svc = await import("../../src/modules/order/administrative-workflow.service");

const actor = { _id: USER_ID, role: "administrativo" as const };

// ── Helper factories ────────────────────────────────────────────────

/** Build a lean Mongoose Invoice mock with status + optional missing SES link. */
function inv(status: string, withoutSesLink = false) {
	return {
		_id: new Types.ObjectId(INVOICE_ID),
		serviceEntrySheetId: withoutSesLink ? undefined : new Types.ObjectId(SES_ID),
		workOrderId: new Types.ObjectId(ORDER_ID),
		clientId: new Types.ObjectId(CLIENT_ID),
		totalAmount: 1_500_000,
		currency: "COP",
		status,
		approvedBy: undefined as Types.ObjectId | undefined,
		attachments: [],
		commandHistory: [],
		invoiceLines: [],
		taxBreakdown: [],
		createdBy: new Types.ObjectId(USER_ID),
		createdAt: new Date(),
		updatedAt: new Date(),
		save: vi.fn().mockResolvedValue(undefined),
	};
}

/** Build a lean DeliveryRecord mock with given status. */
function dr(status: string) {
	return {
		_id: new Types.ObjectId(RECORD_ID),
		status,
		workOrderId: new Types.ObjectId(ORDER_ID),
		technicalReportId: new Types.ObjectId(),
		clientRepresentative: "Test Client",
	};
}

/** Build a lean SES mock with given status. */
function ses(status: string) {
	return {
		_id: new Types.ObjectId(SES_ID),
		code: "SES-TEST",
		status,
		workOrderId: new Types.ObjectId(ORDER_ID),
		clientId: new Types.ObjectId(CLIENT_ID),
		clientName: "Test Client",
		amount: 1_500_000,
		totalAmount: 1_785_000,
		currency: "COP",
		serviceLines: [],
		taxLines: [],
		attachments: [],
		save: vi.fn().mockResolvedValue(undefined),
	};
}

// ═══════════════════════════════════════════════════════════════════
//  GATE 1 – Payment blocked on draft invoice
// ═══════════════════════════════════════════════════════════════════

describe("GATE 1 — Payment on draft invoice", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		m.payFindOne.mockResolvedValue(null);
		m.payAggregate.mockResolvedValue([{ paidTotal: 0 }]);
	});

	it("throws PAYMENT_INVOICE_NOT_APPROVED when invoice.status is 'draft'", async () => {
		m.invFindById.mockResolvedValue(inv("draft"));

		await expect(
			svc.registerPaymentForInvoice(
				INVOICE_ID,
				{
					paymentReference: "PAY-001",
					paidAt: "2026-05-23T12:00:00Z",
					amount: 1_500_000,
					paymentMethod: "bank_transfer",
				},
				actor,
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "PAYMENT_INVOICE_NOT_APPROVED",
		});
	});

	it("throws PAYMENT_INVOICE_NOT_APPROVED when invoice.status is 'sent'", async () => {
		m.invFindById.mockResolvedValue(inv("sent"));

		await expect(
			svc.registerPaymentForInvoice(
				INVOICE_ID,
				{
					paymentReference: "PAY-002",
					paidAt: "2026-05-23T12:00:00Z",
					amount: 1_500_000,
					paymentMethod: "bank_transfer",
				},
				actor,
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "PAYMENT_INVOICE_NOT_APPROVED",
		});
	});
});

// ═══════════════════════════════════════════════════════════════════
//  GATE 2B — Payment over invoice balance
// ═══════════════════════════════════════════════════════════════════

describe("GATE 2B — Payment over invoice balance", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		m.payFindOne.mockResolvedValue(null);
		m.payAggregate.mockResolvedValue([{ paidTotal: 1_000_000 }]);
	});

	it("throws PAYMENT_AMOUNT_EXCEEDS_OUTSTANDING when payment overpays invoice", async () => {
		m.invFindById.mockResolvedValue(inv("approved"));

		await expect(
			svc.registerPaymentForInvoice(
				INVOICE_ID,
				{
					paymentReference: "PAY-OVER-001",
					paidAt: "2026-05-23T12:00:00Z",
					amount: 600_000,
					paymentMethod: "bank_transfer",
				},
				actor,
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "PAYMENT_AMOUNT_EXCEEDS_OUTSTANDING",
		});
	});
});

// ═══════════════════════════════════════════════════════════════════
//  GATE 2 – Payment blocked when invoice has no SES link
// ═══════════════════════════════════════════════════════════════════

describe("GATE 2 — Payment on invoice without SES", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		m.payFindOne.mockResolvedValue(null);
	});

	it("throws PAYMENT_INVOICE_WITHOUT_SES when invoice has no serviceEntrySheetId", async () => {
		// Invoice is approved but not linked to any SES
		m.invFindById.mockResolvedValue(inv("approved", true));

		await expect(
			svc.registerPaymentForInvoice(
				INVOICE_ID,
				{
					paymentReference: "PAY-003",
					paidAt: "2026-05-23T12:00:00Z",
					amount: 1_500_000,
					paymentMethod: "bank_transfer",
				},
				actor,
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "PAYMENT_INVOICE_WITHOUT_SES",
		});
	});
});

// ═══════════════════════════════════════════════════════════════════
//  GATE 3 — SES blocked on unsigned delivery record
// ═══════════════════════════════════════════════════════════════════

describe("GATE 3 — SES on unsigned delivery record", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		m.sesFindOne.mockResolvedValue(null);
		m.ordFindById.mockResolvedValue(null);
	});

	it("throws SES_DELIVERY_RECORD_NOT_SIGNED when delivery record is 'draft'", async () => {
		m.drFindById.mockResolvedValue(dr("draft"));

		await expect(
			svc.createServiceEntrySheetFromDeliveryRecord(
				RECORD_ID,
				{
					total: 5_000_000,
					subtotal: 4_200_000,
					currency: "COP",
					serviceLines: [],
					taxLines: [],
					description: "Test SES",
				},
				actor,
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "SES_DELIVERY_RECORD_NOT_SIGNED",
		});
	});

	it("throws SES_DELIVERY_RECORD_NOT_SIGNED when delivery record is 'submitted'", async () => {
		m.drFindById.mockResolvedValue(dr("submitted"));

		await expect(
			svc.createServiceEntrySheetFromDeliveryRecord(
				RECORD_ID,
				{
					total: 5_000_000,
					subtotal: 4_200_000,
					currency: "COP",
					serviceLines: [],
					taxLines: [],
					description: "Test SES",
				},
				actor,
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "SES_DELIVERY_RECORD_NOT_SIGNED",
		});
	});
});

// ═══════════════════════════════════════════════════════════════════
//  GATE 4 — Invoice blocked on non-approved SES
// ═══════════════════════════════════════════════════════════════════

describe("GATE 4 — Invoice on non-approved SES", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		m.invFindOne.mockResolvedValue(null);
		m.ordFindById.mockResolvedValue(null);
	});

	it("throws INVOICE_SES_NOT_APPROVED when SES status is 'draft'", async () => {
		m.sesFindById.mockResolvedValue(ses("draft"));

		await expect(
			svc.createInvoiceFromServiceEntrySheet(
				SES_ID,
				{
					invoiceNumber: "INV-2026-001",
					issueDate: "2026-05-23",
					dueDate: "2026-06-22",
				},
				actor,
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "INVOICE_SES_NOT_APPROVED",
		});
	});

	it("throws INVOICE_SES_NOT_APPROVED when SES status is 'submitted'", async () => {
		m.sesFindById.mockResolvedValue(ses("submitted"));

		await expect(
			svc.createInvoiceFromServiceEntrySheet(
				SES_ID,
				{
					invoiceNumber: "INV-2026-002",
					issueDate: "2026-05-23",
					dueDate: "2026-06-22",
				},
				actor,
			),
		).rejects.toMatchObject<Partial<UnprocessableError>>({
			code: "INVOICE_SES_NOT_APPROVED",
		});
	});
});

// ═══════════════════════════════════════════════════════════════════
//  GATE 5 — Idempotency: duplicate payment reference returns existing
// ═══════════════════════════════════════════════════════════════════

describe("GATE 5 — Payment idempotency", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		m.invFindById.mockResolvedValue(inv("approved"));
		m.payAggregate.mockResolvedValue([{ paidTotal: 0 }]);
	});

	it("returns existing payment when same reference is re-submitted", async () => {
		m.payFindOne.mockResolvedValue({
			_id: new Types.ObjectId(),
			invoiceId: new Types.ObjectId(INVOICE_ID),
			workOrderId: new Types.ObjectId(ORDER_ID),
			serviceEntrySheetId: new Types.ObjectId(SES_ID),
			clientId: new Types.ObjectId(CLIENT_ID),
			paymentReference: "PAY-DUP-001",
			paidAt: new Date(),
			amount: 1_000_000,
			currency: "COP",
			status: "recorded",
			commandHistory: [],
			recordedBy: new Types.ObjectId(USER_ID),
			recordedAt: new Date(),
			reconciledBy: undefined,
			reconciledAt: undefined,
			supportingDocument: undefined,
			supportingDocumentUrl: undefined,
			updatedAt: new Date(),
			createdAt: new Date(),
		});

		const result = await svc.registerPaymentForInvoice(
			INVOICE_ID,
			{
				paymentReference: "PAY-DUP-001",
				paidAt: "2026-05-23T12:00:00Z",
				amount: 1_000_000,
				paymentMethod: "bank_transfer",
			},
			actor,
		);

		expect(result.paymentReference).toBe("PAY-DUP-001");
	});
});

// ═══════════════════════════════════════════════════════════════════
//  GATE 6 — Invoice approval requires persisted actor
// ═══════════════════════════════════════════════════════════════════

describe("GATE 6 — Invoice approval actor", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("persists approvedBy when approving invoice", async () => {
		const invoice = inv("submitted");
		m.invFindById.mockResolvedValue(invoice);

		await svc.approveInvoice(INVOICE_ID, actor);

		expect(invoice.approvedBy?.toString()).toBe(USER_ID);
		expect(invoice.save).toHaveBeenCalledTimes(1);
	});
});
