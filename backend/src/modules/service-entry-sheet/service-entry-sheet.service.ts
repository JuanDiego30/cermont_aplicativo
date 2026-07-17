import type { PaginationQuery } from "@cermont/shared-types";
import { Types } from "mongoose";
import { NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { ServiceEntrySheet as ServiceEntrySheetModel } from "../../models/ServiceEntrySheet";
import { assertDeliveryRecordSigned } from "../../services/workflow-preconditions.service";
import { notifyRoleGroup } from "../notifications/notification.service";

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
			`No se puede transicionar SES de '${current}' a '${target}'`,
			"SES_INVALID_TRANSITION",
		);
	}
}

interface ListQuery extends PaginationQuery {
	orderId?: string;
	status?: string | string[];
	workOrderId?: string;
	clientId?: string;
}

export async function listServiceEntrySheets(
	query: ListQuery,
): Promise<{ data: SesDoc[]; total: number; page: number; limit: number; pages: number }> {
	const filter: Record<string, unknown> = {};
	if (query.workOrderId) {
		filter.workOrderId = new Types.ObjectId(query.workOrderId);
	}
	if (query.orderId) {
		filter.workOrderId = new Types.ObjectId(query.orderId);
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

export async function getServiceEntrySheetByDeliveryRecord(
	deliveryRecordId: string,
): Promise<SesDoc | { deliveryRecordId: string; status: "not_created"; message: string }> {
	const ses = await ServiceEntrySheetModel.findOne({
		deliveryRecordId: new Types.ObjectId(deliveryRecordId),
		status: { $ne: "cancelled" },
	});
	return ses
		? (ses.toObject() as unknown as SesDoc)
		: { deliveryRecordId, status: "not_created", message: "No hay SES creada." };
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

export async function createServiceEntrySheetFromDeliveryRecord(
	deliveryRecordId: string,
	input: Record<string, unknown>,
	actor: string,
): Promise<SesDoc> {
	await assertDeliveryRecordSigned(deliveryRecordId);

	const existing = await ServiceEntrySheetModel.findOne({
		deliveryRecordId: new Types.ObjectId(deliveryRecordId),
		status: { $ne: "cancelled" },
	});
	if (existing) {
		return existing.toObject() as unknown as SesDoc;
	}

	const doc = await ServiceEntrySheetModel.create({
		...input,
		deliveryRecordId: new Types.ObjectId(deliveryRecordId),
		status: "draft",
		createdBy: new Types.ObjectId(actor),
	});
	return doc.toObject() as unknown as SesDoc;
}

export async function submitServiceEntrySheet(
	id: string,
	actor: string,
	input?: { clientMutationId?: string },
): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.findById(id);
	if (!doc) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	assertTransition(doc.status, "submitted");
	doc.status = "submitted";
	doc.submittedAt = new Date();
	doc.submittedBy = new Types.ObjectId(actor);
	if (input?.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "submit_service_entry_sheet",
			recordedAt: new Date(),
		});
	}
	await doc.save();
	return doc.toObject() as unknown as SesDoc;
}

export async function approveServiceEntrySheet(
	id: string,
	actor: string,
	input?: { approverReference?: string; clientMutationId?: string },
): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.findById(id);
	if (!doc) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	assertTransition(doc.status, "approved");
	doc.status = "approved";
	doc.approvedBy = new Types.ObjectId(actor);
	doc.approvedAt = new Date();
	doc.approverReference = input?.approverReference;
	if (input?.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "approve_service_entry_sheet",
			recordedAt: new Date(),
		});
	}
	await doc.save();

	// F28-T086: Notify administrativo when SES is approved
	await notifyRoleGroup(
		"SES_APPROVED",
		["administrativo"],
		"SES aprobada",
		`La Hoja de Entrada de Servicio ha sido aprobada.`,
		doc.serviceCaseId
			? { entityType: "ServiceCase", entityId: doc.serviceCaseId.toString() }
			: undefined,
		{ sesId: id, approvedBy: actor },
	);

	return doc.toObject() as unknown as SesDoc;
}

export async function rejectServiceEntrySheet(
	id: string,
	reason: string,
	actor: string,
	input?: { clientMutationId?: string },
): Promise<SesDoc> {
	const doc = await ServiceEntrySheetModel.findById(id);
	if (!doc) {
		throw new NotFoundError("ServiceEntrySheet", id);
	}
	assertTransition(doc.status, "rejected");
	doc.status = "rejected";
	doc.rejectionReason = reason;
	doc.rejectedBy = new Types.ObjectId(actor);
	doc.rejectedAt = new Date();
	if (input?.clientMutationId) {
		doc.commandHistory.push({
			clientMutationId: input.clientMutationId,
			command: "reject_service_entry_sheet",
			recordedAt: new Date(),
		});
	}
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
