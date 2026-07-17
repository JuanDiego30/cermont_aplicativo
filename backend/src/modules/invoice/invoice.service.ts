import type { PaginationQuery } from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { Invoice as InvoiceModel } from "../../models/Invoice";
import { assertSESApproved } from "../../services/workflow-preconditions.service";
import { notifyRoleGroup } from "../notifications/notification.service";

type InvDoc = Record<string, unknown>;

const VALID_TRANSITIONS: Record<string, string[]> = {
	draft: ["issued", "cancelled"],
	issued: ["submitted", "cancelled"],
	submitted: ["approved", "rejected", "cancelled"],
	approved: ["partially_paid", "paid", "cancelled"],
	partially_paid: ["paid", "cancelled"],
	paid: [],
	rejected: ["cancelled"],
	cancelled: [],
};

function assertTransition(current: string, target: string): void {
	const allowed = VALID_TRANSITIONS[current];
	if (!allowed?.includes(target)) {
		throw new UnprocessableError(
			`No se puede transicionar factura de '${current}' a '${target}'`,
			"INVOICE_INVALID_TRANSITION",
		);
	}
}

interface ListQuery extends PaginationQuery {
	orderId?: string;
	status?: string | string[];
	workOrderId?: string;
	clientId?: string;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

export async function listInvoices(
	query: ListQuery,
): Promise<{ data: InvDoc[]; total: number; page: number; limit: number; pages: number }> {
	const filter: Record<string, unknown> = {};
	if (query.workOrderId) {
		filter.workOrderId = new Types.ObjectId(query.workOrderId);
	}
	if (query.orderId) {
		filter.workOrderId = new Types.ObjectId(query.orderId);
	}
	if (query.clientId) {
		filter.clientId = new Types.ObjectId(query.clientId);
	}
	if (query.status) {
		if (Array.isArray(query.status)) {
			filter.status = { $in: query.status };
		} else {
			filter.status = query.status;
		}
	}

	const page = query.page || 1;
	const limit = query.limit || 20;
	const skip = (page - 1) * limit;

	const [data, total] = await Promise.all([
		InvoiceModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		InvoiceModel.countDocuments(filter),
	]);

	return { data: data as unknown as InvDoc[], total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getInvoiceById(id: string): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id).lean();
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	return doc as unknown as InvDoc;
}

export async function createInvoiceFromSES(
	input: Record<string, unknown>,
	actor: string,
): Promise<InvDoc> {
	const doc = await InvoiceModel.create({
		...input,
		status: "draft",
		createdBy: new Types.ObjectId(actor),
	});
	return JSON.parse(JSON.stringify(doc)) as unknown as InvDoc;
}

export async function createInvoiceFromServiceEntrySheet(
	serviceEntrySheetId: string,
	input: Record<string, unknown>,
	actor: string,
): Promise<InvDoc> {
	await assertSESApproved(serviceEntrySheetId);

	const existing = await InvoiceModel.findOne({
		serviceEntrySheetId: new Types.ObjectId(serviceEntrySheetId),
		status: { $ne: "cancelled" },
	});
	if (existing) {
		return JSON.parse(JSON.stringify(existing)) as unknown as InvDoc;
	}

	const doc = await InvoiceModel.create({
		...input,
		serviceEntrySheetId: new Types.ObjectId(serviceEntrySheetId),
		status: "issued",
		createdBy: new Types.ObjectId(actor),
	});

	// F28-T086: Notify administrativo when invoice is created from SES
	await notifyRoleGroup(
		"INVOICE_CREATED",
		["administrativo"],
		"Factura generada desde SES",
		`Se ha generado una factura a partir de la Hoja de Entrada de Servicio.`,
		doc.serviceCaseId
			? { entityType: "ServiceCase", entityId: doc.serviceCaseId.toString() }
			: undefined,
		{ invoiceId: String(doc._id), serviceEntrySheetId, createdBy: actor },
	);

	return JSON.parse(JSON.stringify(doc)) as unknown as InvDoc;
}

export async function submitInvoice(
	id: string,
	actor: string,
	input?: { clientMutationId?: string },
): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	assertTransition(doc.status, "submitted");
	doc.status = "submitted";
	doc.submittedAt = new Date();
	doc.submittedBy = new Types.ObjectId(actor);
	if (input?.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "submit_invoice",
			recordedAt: new Date(),
		});
	}
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as InvDoc;
}

export async function approveInvoice(
	id: string,
	actor: string,
	input?: { clientMutationId?: string },
): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	assertTransition(doc.status, "approved");
	doc.status = "approved";
	doc.approvedBy = new Types.ObjectId(actor);
	doc.approvedAt = new Date();
	if (input?.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "approve_invoice",
			recordedAt: new Date(),
		});
	}
	await doc.save();

	// F28-T086: Notify administrativo when invoice is approved
	await notifyRoleGroup(
		"INVOICE_APPROVED",
		["administrativo"],
		"Factura aprobada",
		`La factura ha sido aprobada.`,
		doc.serviceCaseId
			? { entityType: "ServiceCase", entityId: doc.serviceCaseId.toString() }
			: undefined,
		{ invoiceId: id, approvedBy: actor },
	);

	return JSON.parse(JSON.stringify(doc)) as unknown as InvDoc;
}

export async function rejectInvoice(
	id: string,
	reason: string,
	actor: string,
	input?: { clientMutationId?: string },
): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	assertTransition(doc.status, "rejected");
	doc.status = "rejected";
	doc.rejectionReason = reason;
	doc.rejectedBy = new Types.ObjectId(actor);
	doc.rejectedAt = new Date();
	if (input?.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "reject_invoice",
			recordedAt: new Date(),
		});
	}
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as InvDoc;
}

export async function cancelInvoice(id: string): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	assertTransition(doc.status, "cancelled");
	doc.status = "cancelled";
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as InvDoc;
}

export async function calculateInvoiceAging(): Promise<void> {
	const now = new Date();
	await InvoiceModel.updateMany({ status: { $in: ["submitted", "approved"] } }, [
		{
			$set: { agingDays: { $floor: { $divide: [{ $subtract: [now, "$createdAt"] }, 86400000] } } },
		},
	]);
}
