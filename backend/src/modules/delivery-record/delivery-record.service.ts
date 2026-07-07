import type { PaginationQuery } from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { DeliveryRecord as DeliveryRecordModel } from "../../models/DeliveryRecord";

type DrDoc = Record<string, unknown>;

const VALID_TRANSITIONS: Record<string, string[]> = {
	draft: ["sent", "cancelled"],
	sent: ["signed", "rejected", "cancelled"],
	signed: [],
	rejected: ["cancelled"],
	cancelled: [],
};

function assertTransition(current: string, target: string): void {
	const allowed = VALID_TRANSITIONS[current];
	if (!allowed?.includes(target)) {
		throw new UnprocessableError(
			`Cannot transition DeliveryRecord from '${current}' to '${target}'`,
		);
	}
}

interface ListQuery extends PaginationQuery {
	orderId?: string;
}

export async function listDeliveryRecords(
	query: ListQuery,
): Promise<{ data: DrDoc[]; total: number; page: number; limit: number; pages: number }> {
	const filter: Record<string, unknown> = {};
	if (query.orderId) {
		filter.workOrderId = new Types.ObjectId(query.orderId);
	}

	const page = query.page || 1;
	const limit = query.limit || 20;
	const skip = (page - 1) * limit;

	const [data, total] = await Promise.all([
		DeliveryRecordModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		DeliveryRecordModel.countDocuments(filter),
	]);

	return { data: data as unknown as DrDoc[], total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getDeliveryRecordById(id: string): Promise<DrDoc> {
	const doc = await DeliveryRecordModel.findById(id).lean();
	if (!doc) {
		throw new NotFoundError("DeliveryRecord", id);
	}
	return doc as unknown as DrDoc;
}

export async function createDeliveryRecordFromTechnicalReport(
	technicalReportId: string,
	orderId: string,
	_input: { recipientName: string; recipientEmail?: string; notes?: string },
	actor: string,
): Promise<DrDoc> {
	const doc = await DeliveryRecordModel.create({
		technicalReportId: new Types.ObjectId(technicalReportId),
		workOrderId: new Types.ObjectId(orderId),
		status: "draft",
		sentBy: new Types.ObjectId(actor),
	});
	return JSON.parse(JSON.stringify(doc)) as unknown as DrDoc;
}

export async function sendDeliveryRecord(id: string, _actor: string): Promise<DrDoc> {
	const doc = await DeliveryRecordModel.findById(id);
	if (!doc) {
		throw new NotFoundError("DeliveryRecord", id);
	}
	assertTransition(doc.status, "sent");
	doc.status = "sent";
	doc.sentAt = new Date();
	doc.sentBy = new Types.ObjectId(_actor);
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as DrDoc;
}

export async function signDeliveryRecord(
	id: string,
	_actor: string,
	signatureImageId?: string,
): Promise<DrDoc> {
	const doc = await DeliveryRecordModel.findById(id);
	if (!doc) {
		throw new NotFoundError("DeliveryRecord", id);
	}
	assertTransition(doc.status, "signed");
	doc.status = "signed";
	doc.signedBy = _actor;
	doc.signedAt = new Date();
	if (signatureImageId) {
		doc.signedDocumentRef = signatureImageId;
	}
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as DrDoc;
}

export async function rejectDeliveryRecord(
	id: string,
	reason: string,
	_actor: string,
): Promise<DrDoc> {
	const doc = await DeliveryRecordModel.findById(id);
	if (!doc) {
		throw new NotFoundError("DeliveryRecord", id);
	}
	assertTransition(doc.status, "rejected");
	doc.status = "rejected";
	doc.rejectionReason = reason;
	doc.rejectedBy = new Types.ObjectId(_actor);
	doc.rejectedAt = new Date();
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as DrDoc;
}

export async function cancelDeliveryRecord(id: string): Promise<DrDoc> {
	const doc = await DeliveryRecordModel.findById(id);
	if (!doc) {
		throw new NotFoundError("DeliveryRecord", id);
	}
	assertTransition(doc.status, "cancelled");
	doc.status = "cancelled";
	await doc.save();
	return JSON.parse(JSON.stringify(doc)) as unknown as DrDoc;
}
