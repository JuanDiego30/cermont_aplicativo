import type { PaginationQuery } from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { Invoice as InvoiceModel } from "../../models/Invoice";

type InvDoc = Record<string, unknown>;

const VALID_TRANSITIONS: Record<string, string[]> = {
	draft: ["submitted", "cancelled"],
	submitted: ["approved", "rejected", "cancelled"],
	approved: ["paid", "cancelled"],
	paid: [],
	rejected: ["cancelled"],
	cancelled: [],
};

function assertTransition(current: string, target: string): void {
	const allowed = VALID_TRANSITIONS[current];
	if (!allowed?.includes(target)) {
		throw new UnprocessableError(`Cannot transition Invoice from '${current}' to '${target}'`);
	}
}

interface ListQuery extends PaginationQuery {
	orderId?: string;
	status?: string;
}

export async function listInvoices(
	query: ListQuery,
): Promise<{ data: InvDoc[]; total: number; page: number; limit: number; pages: number }> {
	const filter: Record<string, unknown> = {};
	if (query.orderId) {
		filter.workOrderId = new Types.ObjectId(query.orderId);
	}
	if (query.status) {
		filter.status = query.status;
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

export async function submitInvoice(id: string, _actor: string): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	assertTransition(doc.status, "submitted");
	doc.status = "submitted";
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as InvDoc;
}

export async function approveInvoice(id: string, _actor: string): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	assertTransition(doc.status, "approved");
	doc.status = "approved";
	doc.approvedBy = new Types.ObjectId(_actor);
	doc.approvedAt = new Date();
	await doc.save();
	return doc.toObject() as unknown as InvDoc;
}

export async function rejectInvoice(id: string, reason: string, _actor: string): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	assertTransition(doc.status, "rejected");
	doc.status = "rejected";
	doc.rejectionReason = reason;
	await doc.save();
	return doc.toObject() as unknown as InvDoc;
}

export async function markInvoicePaid(id: string, _paymentId: string): Promise<InvDoc> {
	const doc = await InvoiceModel.findById(id);
	if (!doc) {
		throw new NotFoundError("Invoice", id);
	}
	assertTransition(doc.status, "paid");
	doc.status = "paid";
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
	return doc.toObject() as unknown as InvDoc;
}

export async function calculateInvoiceAging(): Promise<void> {
	const now = new Date();
	await InvoiceModel.updateMany({ status: { $in: ["submitted", "approved"] } }, [
		{
			$set: { agingDays: { $floor: { $divide: [{ $subtract: [now, "$createdAt"] }, 86400000] } } },
		},
	]);
}
