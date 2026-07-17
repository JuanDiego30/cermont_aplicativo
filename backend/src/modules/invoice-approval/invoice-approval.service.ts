import type { ListInvoiceApprovalsQuery, RequestInvoiceApprovalInput } from "@cermont/shared-types";
import { Types } from "mongoose";
import { ForbiddenError, NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { requireValidTransition } from "../../common/fsm/fsm-engine";
import { Invoice, type InvoiceDocument } from "../../models/Invoice";
import { createAuditLog } from "../audit/audit.service";
import { InvoiceApproval, type InvoiceApprovalDocument } from "./InvoiceApproval";

type ApprovalDoc = InvoiceApprovalDocument;

async function requireInvoice(invoiceId: string): Promise<InvoiceDocument> {
	const invoice = await Invoice.findById(invoiceId);
	if (!invoice) {
		throw new NotFoundError("Invoice", invoiceId);
	}
	return invoice;
}

function requireClientLink(invoice: InvoiceDocument, clientId: string): void {
	if (invoice.clientId.toString() !== clientId) {
		throw new UnprocessableError(
			"Invoice does not belong to the requested client",
			"INVOICE_APPROVAL_CLIENT_MISMATCH",
		);
	}
}

function requireClientActor(doc: ApprovalDoc, userId: string): void {
	if (doc.clientId.toString() !== userId) {
		throw new ForbiddenError("Only the linked client can decide this invoice approval");
	}
}

function requireInvoiceStatus(invoice: InvoiceDocument, allowed: readonly string[]): void {
	if (!allowed.includes(invoice.status)) {
		throw new UnprocessableError(
			`Invoice must be ${allowed.join(" or ")} for this approval action`,
			"INVOICE_APPROVAL_INVALID_INVOICE_STATUS",
		);
	}
}

export async function requestApproval(
	input: RequestInvoiceApprovalInput & { requestedBy: string },
): Promise<ApprovalDoc> {
	const invoice = await requireInvoice(input.invoiceId);
	requireClientLink(invoice, input.clientId);
	requireInvoiceStatus(invoice, ["submitted"]);

	const exists = await InvoiceApproval.findOne({
		invoiceId: invoice._id,
		status: { $nin: ["cancelled"] },
	}).lean();

	if (exists) {
		throw new UnprocessableError("An active approval request already exists for this invoice");
	}

	const doc = await InvoiceApproval.create({
		invoiceId: invoice._id,
		workOrderId: invoice.workOrderId,
		clientId: invoice.clientId,
		clientName: invoice.clientName,
		clientEmail: input.clientEmail,
		requestedBy: new Types.ObjectId(input.requestedBy),
		requestedAt: new Date(),
		status: "pending",
		expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
		clientMutationId: input.clientMutationId,
		createdBy: new Types.ObjectId(input.requestedBy),
	});

	await createAuditLog({
		action: "INVOICE_SENT",
		entity: "InvoiceApproval",
		entityId: String(doc._id),
		userId: input.requestedBy,
		metadata: { invoiceId: input.invoiceId, clientId: input.clientId },
	});

	return doc.toObject();
}

export async function approve(
	approvalId: string,
	userId: string,
	clientMutationId?: string,
): Promise<ApprovalDoc> {
	const doc = await InvoiceApproval.findById(approvalId);
	if (!doc) {
		throw new NotFoundError("InvoiceApproval", approvalId);
	}
	requireClientActor(doc, userId);
	const invoice = await requireInvoice(doc.invoiceId.toString());
	requireClientLink(invoice, doc.clientId.toString());
	requireInvoiceStatus(invoice, ["submitted", "approved"]);

	if (clientMutationId) {
		const existing = await InvoiceApproval.findOne({
			clientMutationId,
			_id: { $ne: approvalId },
		}).lean();
		if (existing) {
			throw new UnprocessableError("Mutation already processed");
		}
	}

	requireValidTransition("InvoiceApproval", doc.status, "approved", approvalId);

	const before = doc.toObject();
	const approvedAt = new Date();
	invoice.status = "approved";
	invoice.approvedBy = new Types.ObjectId(userId);
	invoice.approvedAt = approvedAt;
	invoice.rejectedBy = void 0;
	invoice.rejectedAt = void 0;
	invoice.rejectionReason = void 0;
	await invoice.save();

	doc.status = "approved";
	doc.approvedBy = new Types.ObjectId(userId);
	doc.approvedAt = approvedAt;
	if (clientMutationId) {
		doc.clientMutationId = clientMutationId;
	}
	await doc.save();

	await createAuditLog({
		action: "INVOICE_APPROVED",
		entity: "InvoiceApproval",
		entityId: approvalId,
		userId,
		metadata: { invoiceId: String(doc.invoiceId) },
		before: { status: before.status },
		after: { status: "approved" },
	});

	return doc.toObject();
}

export async function reject(
	approvalId: string,
	reason: string,
	details: string,
	userId: string,
	clientMutationId?: string,
): Promise<ApprovalDoc> {
	const doc = await InvoiceApproval.findById(approvalId);
	if (!doc) {
		throw new NotFoundError("InvoiceApproval", approvalId);
	}
	requireClientActor(doc, userId);
	const invoice = await requireInvoice(doc.invoiceId.toString());
	requireClientLink(invoice, doc.clientId.toString());
	requireInvoiceStatus(invoice, ["submitted", "rejected"]);

	if (clientMutationId) {
		const existing = await InvoiceApproval.findOne({
			clientMutationId,
			_id: { $ne: approvalId },
		}).lean();
		if (existing) {
			throw new UnprocessableError("Mutation already processed");
		}
	}

	requireValidTransition("InvoiceApproval", doc.status, "rejected", approvalId);

	const before = doc.toObject();
	const rejectedAt = new Date();
	invoice.status = "rejected";
	invoice.rejectedBy = new Types.ObjectId(userId);
	invoice.rejectedAt = rejectedAt;
	invoice.rejectionReason = reason;
	invoice.approvedBy = void 0;
	invoice.approvedAt = void 0;
	await invoice.save();

	doc.status = "rejected";
	doc.rejectedBy = new Types.ObjectId(userId);
	doc.rejectedAt = rejectedAt;
	doc.rejectionReason = reason as InvoiceApprovalDocument["rejectionReason"];
	doc.rejectionDetails = details || void 0;
	if (clientMutationId) {
		doc.clientMutationId = clientMutationId;
	}
	await doc.save();

	const meta: Record<string, string> = { invoiceId: String(doc.invoiceId), reason };
	if (details) {
		meta.details = details;
	}

	await createAuditLog({
		action: "INVOICE_REJECTED",
		entity: "InvoiceApproval",
		entityId: approvalId,
		userId,
		metadata: meta,
		before: { status: before.status },
		after: { status: "rejected", rejectionReason: reason },
	});

	return doc.toObject();
}

export async function correct(
	approvalId: string,
	correctionNotes: string,
	userId: string,
): Promise<ApprovalDoc> {
	const doc = await InvoiceApproval.findById(approvalId);
	if (!doc) {
		throw new NotFoundError("InvoiceApproval", approvalId);
	}

	if (doc.status !== "rejected") {
		throw new UnprocessableError("Only rejected approvals can be corrected");
	}
	const invoice = await requireInvoice(doc.invoiceId.toString());
	requireClientLink(invoice, doc.clientId.toString());
	requireInvoiceStatus(invoice, ["rejected", "submitted"]);

	const before = doc.toObject();
	invoice.status = "submitted";
	invoice.rejectedAt = void 0;
	invoice.rejectedBy = void 0;
	invoice.rejectionReason = void 0;
	invoice.approvedAt = void 0;
	invoice.approvedBy = void 0;
	await invoice.save();

	doc.status = "pending";
	doc.correctedAt = new Date();
	doc.correctedBy = new Types.ObjectId(userId);
	doc.correctionNotes = correctionNotes;
	doc.rejectedAt = undefined;
	doc.rejectedBy = undefined;
	doc.rejectionReason = undefined;
	doc.rejectionDetails = undefined;
	await doc.save();

	await createAuditLog({
		action: "STATUS_CHANGED",
		entity: "InvoiceApproval",
		entityId: approvalId,
		userId,
		metadata: { invoiceId: String(doc.invoiceId), correctionNotes },
		before: { status: before.status },
		after: { status: "pending" },
	});

	return doc.toObject();
}

export async function list(
	query: ListInvoiceApprovalsQuery,
): Promise<{ data: ApprovalDoc[]; total: number; page: number; limit: number; pages: number }> {
	const filter: Record<string, unknown> = {};
	if (query.invoiceId) {
		filter.invoiceId = new Types.ObjectId(query.invoiceId);
	}
	if (query.clientId) {
		filter.clientId = new Types.ObjectId(query.clientId);
	}
	if (query.status) {
		filter.status = query.status;
	}

	const page = query.page || 1;
	const limit = query.limit || 20;
	const skip = (page - 1) * limit;

	const [data, total] = await Promise.all([
		InvoiceApproval.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		InvoiceApproval.countDocuments(filter),
	]);

	return {
		data: data as unknown as ApprovalDoc[],
		total,
		page,
		limit,
		pages: Math.ceil(total / limit),
	};
}

export async function getById(id: string): Promise<ApprovalDoc> {
	const doc = await InvoiceApproval.findById(id).lean();
	if (!doc) {
		throw new NotFoundError("InvoiceApproval", id);
	}
	return doc as unknown as ApprovalDoc;
}
