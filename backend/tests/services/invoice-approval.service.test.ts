import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	approvalCreate: vi.fn(),
	approvalFindById: vi.fn(),
	approvalFindOne: vi.fn(),
	audit: vi.fn(),
	invoiceFindById: vi.fn(),
	requireValidTransition: vi.fn(),
}));

vi.mock("../../src/models/Invoice", () => ({
	Invoice: { findById: mocks.invoiceFindById },
}));

vi.mock("../../src/modules/invoice-approval/InvoiceApproval", () => ({
	InvoiceApproval: {
		create: mocks.approvalCreate,
		findById: mocks.approvalFindById,
		findOne: mocks.approvalFindOne,
	},
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.audit,
}));

vi.mock("../../src/common/fsm/fsm-engine", () => ({
	requireValidTransition: mocks.requireValidTransition,
}));

import * as service from "../../src/modules/invoice-approval/invoice-approval.service";

const invoiceId = new Types.ObjectId();
const approvalId = new Types.ObjectId();
const workOrderId = new Types.ObjectId();
const clientId = new Types.ObjectId();
const actorId = new Types.ObjectId();

function buildInvoice(status = "submitted") {
	return {
		_id: invoiceId,
		workOrderId,
		clientId,
		clientName: "Cliente canónico",
		status,
		approvedAt: void 0,
		approvedBy: void 0,
		rejectedAt: void 0,
		rejectedBy: void 0,
		rejectionReason: void 0,
		save: vi.fn().mockResolvedValue(null),
	};
}

function buildApproval(status = "pending") {
	const doc = {
		_id: approvalId,
		invoiceId,
		workOrderId,
		clientId,
		status,
		approvedAt: void 0,
		approvedBy: void 0,
		rejectedAt: void 0,
		rejectedBy: void 0,
		rejectionReason: void 0,
		rejectionDetails: void 0,
		correctedAt: void 0,
		correctedBy: void 0,
		correctionNotes: void 0,
		clientMutationId: void 0,
		save: vi.fn().mockResolvedValue(null),
		toObject: vi.fn(),
	};
	doc.toObject.mockImplementation(() => ({ ...doc }));
	return doc;
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.approvalFindOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
	mocks.audit.mockResolvedValue(null);
});

describe("invoice approval service", () => {
	it("derives work order and client data from the canonical invoice", async () => {
		const invoice = buildInvoice();
		const created = buildApproval();
		mocks.invoiceFindById.mockResolvedValue(invoice);
		mocks.approvalCreate.mockResolvedValue(created);

		await service.requestApproval({
			invoiceId: invoiceId.toString(),
			clientId: clientId.toString(),
			clientName: "Dato manipulable",
			requestedBy: actorId.toString(),
		});

		expect(mocks.approvalCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				invoiceId,
				workOrderId,
				clientId,
				clientName: "Cliente canónico",
			}),
		);
	});

	it("fails with a domain error when the invoice does not exist", async () => {
		mocks.invoiceFindById.mockResolvedValue(null);

		await expect(
			service.requestApproval({
				invoiceId: invoiceId.toString(),
				clientId: clientId.toString(),
				clientName: "Cliente",
				requestedBy: actorId.toString(),
			}),
		).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
		expect(mocks.approvalCreate).not.toHaveBeenCalled();
	});

	it("rejects a request whose client does not own the invoice", async () => {
		mocks.invoiceFindById.mockResolvedValue(buildInvoice());

		await expect(
			service.requestApproval({
				invoiceId: invoiceId.toString(),
				clientId: new Types.ObjectId().toString(),
				clientName: "Otro cliente",
				requestedBy: actorId.toString(),
			}),
		).rejects.toMatchObject({
			statusCode: 422,
			code: "INVOICE_APPROVAL_CLIENT_MISMATCH",
		});
	});

	it("rejects approval requests for invoices that were not submitted", async () => {
		mocks.invoiceFindById.mockResolvedValue(buildInvoice("issued"));

		await expect(
			service.requestApproval({
				invoiceId: invoiceId.toString(),
				clientId: clientId.toString(),
				clientName: "Cliente",
				requestedBy: actorId.toString(),
			}),
		).rejects.toMatchObject({
			statusCode: 422,
			code: "INVOICE_APPROVAL_INVALID_INVOICE_STATUS",
		});
	});

	it("approves both approval record and canonical invoice", async () => {
		const invoice = buildInvoice();
		const approval = buildApproval();
		mocks.approvalFindById.mockResolvedValue(approval);
		mocks.invoiceFindById.mockResolvedValue(invoice);

		await service.approve(approvalId.toString(), clientId.toString());

		expect(invoice.status).toBe("approved");
		expect(invoice.approvedBy?.toString()).toBe(clientId.toString());
		expect(invoice.save).toHaveBeenCalledOnce();
		expect(approval.status).toBe("approved");
		expect(approval.save).toHaveBeenCalledOnce();
	});

	it("prevents a different client from deciding the approval", async () => {
		mocks.approvalFindById.mockResolvedValue(buildApproval());

		await expect(
			service.approve(approvalId.toString(), new Types.ObjectId().toString()),
		).rejects.toMatchObject({ statusCode: 403, code: "FORBIDDEN" });
		expect(mocks.invoiceFindById).not.toHaveBeenCalled();
	});

	it("rejects the approval and canonical invoice with the same decision", async () => {
		const invoice = buildInvoice();
		const approval = buildApproval();
		mocks.approvalFindById.mockResolvedValue(approval);
		mocks.invoiceFindById.mockResolvedValue(invoice);

		await service.reject(
			approvalId.toString(),
			"amount_incorrect",
			"Valor no coincide",
			clientId.toString(),
		);

		expect(invoice.status).toBe("rejected");
		expect(invoice.rejectionReason).toBe("amount_incorrect");
		expect(invoice.save).toHaveBeenCalledOnce();
		expect(approval.status).toBe("rejected");
		expect(approval.rejectionDetails).toBe("Valor no coincide");
	});

	it("returns a corrected invoice to submitted state for a new decision", async () => {
		const invoice = buildInvoice("rejected");
		invoice.rejectionReason = "amount_incorrect";
		const approval = buildApproval("rejected");
		approval.rejectionReason = "amount_incorrect";
		mocks.approvalFindById.mockResolvedValue(approval);
		mocks.invoiceFindById.mockResolvedValue(invoice);

		await service.correct(approvalId.toString(), "Factura corregida", actorId.toString());

		expect(invoice.status).toBe("submitted");
		expect(invoice.rejectionReason).toBeUndefined();
		expect(invoice.save).toHaveBeenCalledOnce();
		expect(approval.status).toBe("pending");
		expect(approval.correctionNotes).toBe("Factura corregida");
	});
});
