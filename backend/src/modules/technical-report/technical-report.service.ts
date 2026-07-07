import type { PaginationQuery } from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { TechnicalReport as TechnicalReportModel } from "../../models/TechnicalReport";

type TechReportDoc = Record<string, unknown>;

const VALID_TRANSITIONS: Record<string, string[]> = {
	draft: ["pending_review", "cancelled"],
	pending_review: ["approved", "rejected", "cancelled"],
	approved: [],
	rejected: ["cancelled"],
	cancelled: [],
};

function assertTransition(current: string, target: string): void {
	const allowed = VALID_TRANSITIONS[current];
	if (!allowed?.includes(target)) {
		throw new UnprocessableError(
			`Cannot transition TechnicalReport from '${current}' to '${target}'`,
		);
	}
}

interface ListQuery extends PaginationQuery {
	orderId?: string;
}

export async function listTechnicalReports(
	query: ListQuery,
): Promise<{ data: TechReportDoc[]; total: number; page: number; limit: number; pages: number }> {
	const filter: Record<string, unknown> = {};
	if (query.orderId) {
		filter.workOrderId = new Types.ObjectId(query.orderId);
	}

	const page = query.page || 1;
	const limit = query.limit || 20;
	const skip = (page - 1) * limit;

	const [data, total] = await Promise.all([
		TechnicalReportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		TechnicalReportModel.countDocuments(filter),
	]);

	return {
		data: data as unknown as TechReportDoc[],
		total,
		page,
		limit,
		pages: Math.ceil(total / limit),
	};
}

export async function getTechnicalReportById(id: string): Promise<TechReportDoc> {
	const doc = await TechnicalReportModel.findById(id).lean();
	if (!doc) {
		throw new NotFoundError("TechnicalReport", id);
	}
	return doc as unknown as TechReportDoc;
}

export async function getTechnicalReportByOrder(orderId: string): Promise<TechReportDoc | null> {
	const doc = await TechnicalReportModel.findOne({ workOrderId: new Types.ObjectId(orderId) })
		.sort({ createdAt: -1 })
		.lean();
	return doc as unknown as TechReportDoc | null;
}

export async function createTechnicalReport(
	input: Record<string, unknown>,
	actor: string,
): Promise<TechReportDoc> {
	const doc = await TechnicalReportModel.create({
		...input,
		status: "draft",
		generatedBy: new Types.ObjectId(actor),
		generatedAt: new Date(),
		evidenceIds: [],
		documentIds: [],
		clientMutationIds: [],
	});
	return doc.toObject() as unknown as TechReportDoc;
}

export async function submitTechnicalReport(id: string, _actor: string): Promise<TechReportDoc> {
	const doc = await TechnicalReportModel.findById(id);
	if (!doc) {
		throw new NotFoundError("TechnicalReport", id);
	}
	assertTransition(doc.status, "pending_review");
	doc.status = "pending_review";
	doc.reviewedBy = new Types.ObjectId(_actor);
	doc.reviewedAt = new Date();
	await doc.save();
	return doc.toObject() as unknown as TechReportDoc;
}

export async function approveTechnicalReport(id: string, _actor: string): Promise<TechReportDoc> {
	const doc = await TechnicalReportModel.findById(id);
	if (!doc) {
		throw new NotFoundError("TechnicalReport", id);
	}
	assertTransition(doc.status, "approved");
	doc.status = "approved";
	doc.approvedBy = new Types.ObjectId(_actor);
	doc.approvedAt = new Date();
	await doc.save();
	return doc.toObject() as unknown as TechReportDoc;
}

export async function rejectTechnicalReport(
	id: string,
	reason: string,
	_actor: string,
): Promise<TechReportDoc> {
	const doc = await TechnicalReportModel.findById(id);
	if (!doc) {
		throw new NotFoundError("TechnicalReport", id);
	}
	assertTransition(doc.status, "rejected");
	doc.status = "rejected";
	doc.rejectedBy = new Types.ObjectId(_actor);
	doc.rejectedAt = new Date();
	doc.rejectionReason = reason;
	await doc.save();
	return doc.toObject() as unknown as TechReportDoc;
}

export async function cancelTechnicalReport(id: string): Promise<TechReportDoc> {
	const doc = await TechnicalReportModel.findById(id);
	if (!doc) {
		throw new NotFoundError("TechnicalReport", id);
	}
	assertTransition(doc.status, "cancelled");
	doc.status = "cancelled";
	await doc.save();
	return doc.toObject() as unknown as TechReportDoc;
}
