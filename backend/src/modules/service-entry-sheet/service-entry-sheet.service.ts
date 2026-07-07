import type { PaginationQuery } from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { ServiceEntrySheet as ServiceEntrySheetModel } from "../../models/ServiceEntrySheet";

type SesDoc = Record<string, unknown>;

const VALID_TRANSITIONS: Record<string, string[]> = {
	draft: ["submitted", "cancelled"],
	submitted: ["approved", "rejected", "cancelled"],
	approved: [],
	rejected: ["cancelled"],
	cancelled: [],
};

function assertTransition(current: string, target: string): void {
	const allowed = VALID_TRANSITIONS[current];
	if (!allowed?.includes(target)) {
		throw new UnprocessableError(
			`Cannot transition ServiceEntrySheet from '${current}' to '${target}'`,
		);
	}
}

interface ListQuery extends PaginationQuery {
	orderId?: string;
	status?: string;
}

export async function listServiceEntrySheets(
	query: ListQuery,
): Promise<{ data: SesDoc[]; total: number; page: number; limit: number; pages: number }> {
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
		ServiceEntrySheetModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		ServiceEntrySheetModel.countDocuments(filter),
	]);

	return { data: data as unknown as SesDoc[], total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getServiceEntrySheetById(id: string): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.findById(id).lean();
	if (!doc) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	return doc as unknown as SesDoc;
}

export async function createServiceEntrySheet(
	input: Record<string, unknown>,
	actor: string,
): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.create({
		...input,
		status: "draft",
		createdBy: new Types.ObjectId(actor),
	});
	return doc.toObject() as unknown as SesDoc;
}

export async function submitServiceEntrySheet(id: string, _actor: string): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.findById(id);
	if (!doc) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	assertTransition(doc.status, "submitted");
	doc.status = "submitted";
	await doc.save();
	return doc.toObject() as unknown as SesDoc;
}

export async function approveServiceEntrySheet(id: string, _actor: string): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.findById(id);
	if (!doc) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	assertTransition(doc.status, "approved");
	doc.status = "approved";
	doc.approvedBy = new Types.ObjectId(_actor);
	doc.approvedAt = new Date();
	await doc.save();
	return doc.toObject() as unknown as SesDoc;
}

export async function rejectServiceEntrySheet(
	id: string,
	reason: string,
	_actor: string,
): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.findById(id);
	if (!doc) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	assertTransition(doc.status, "rejected");
	doc.status = "rejected";
	doc.rejectionReason = reason;
	await doc.save();
	return doc.toObject() as unknown as SesDoc;
}

export async function cancelServiceEntrySheet(id: string): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.findById(id);
	if (!doc) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	assertTransition(doc.status, "cancelled");
	doc.status = "cancelled";
	await doc.save();
	return doc.toObject() as unknown as SesDoc;
}
