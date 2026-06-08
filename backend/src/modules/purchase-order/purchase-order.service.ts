import type { PurchaseOrderAuthorization, PurchaseOrderStatus } from "@cermont/shared-types";
import { Types } from "mongoose";
import {
	AppError,
	ConflictError,
	ServiceUnavailableError,
	UnprocessableError,
} from "../../common/errors";
import { createLogger } from "../../common/utils/logger";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { Proposal } from "../../models";
import { type PurchaseOrderDocument, PurchaseOrderModel } from "../../models/PurchaseOrder";

const log = createLogger("purchase-order-service");
const APPROVED_PURCHASE_ORDER_STATUSES = ["approved", "validated"] as const;
const PENDING_PURCHASE_ORDER_STATUSES = ["pending", "received"] as const;

function toCanonicalPurchaseOrderStatus(status: unknown): PurchaseOrderStatus {
	if (status === "validated") {
		return "approved";
	}

	if (status === "received") {
		return "pending";
	}

	if (status === "pending" || status === "approved" || status === "rejected") {
		return status;
	}

	return "rejected";
}

function buildStatusFilter(status?: PurchaseOrderStatus) {
	if (!status) {
		return undefined;
	}

	if (status === "approved") {
		return { $in: APPROVED_PURCHASE_ORDER_STATUSES };
	}

	if (status === "pending") {
		return { $in: PENDING_PURCHASE_ORDER_STATUSES };
	}

	return status;
}

async function assertProposalApproved(proposalId: string): Promise<void> {
	const proposal = await Proposal.findById(proposalId).select("status").lean<{ status?: string }>();

	if (!proposal) {
		throw new AppError("Proposal not found", 404, "PROPOSAL_NOT_FOUND");
	}

	if (proposal.status !== "approved") {
		throw new UnprocessableError(
			"An approved proposal is required before registering a purchase order",
			"PROPOSAL_NOT_APPROVED",
		);
	}
}

export async function assertProposalReadyForWorkOrder(proposalId: string): Promise<void> {
	await assertProposalApproved(proposalId);

	const approvedPurchaseOrder = await PurchaseOrderModel.findOne({
		proposalId,
		status: { $in: APPROVED_PURCHASE_ORDER_STATUSES },
	})
		.sort({ updatedAt: -1 })
		.lean<{ _id: string } | null>();

	if (!approvedPurchaseOrder) {
		throw new UnprocessableError(
			"An approved purchase order is required before creating a work order",
			"PURCHASE_ORDER_NOT_APPROVED",
		);
	}
}

function toRecord(doc: PurchaseOrderDocument): PurchaseOrderAuthorization {
	const obj = doc.toJSON() as Record<string, unknown>;
	return {
		_id: String(obj._id),
		proposalId: String(obj.proposalId),
		poNumber: String(obj.poNumber),
		contractReference: obj.contractReference ? String(obj.contractReference) : undefined,
		serviceAccount: String(obj.serviceAccount),
		billingAccount: String(obj.billingAccount),
		approvedAmount: Number(obj.approvedAmount),
		currency: String(obj.currency) as PurchaseOrderAuthorization["currency"],
		receivedAt:
			obj.receivedAt instanceof Date ? obj.receivedAt.toISOString() : String(obj.receivedAt),
		attachments: Array.isArray(obj.attachments)
			? obj.attachments.map((a) => ({
					url: String((a as Record<string, unknown>).url),
					filename: String((a as Record<string, unknown>).filename),
					uploadedAt:
						(a as Record<string, unknown>).uploadedAt instanceof Date
							? ((a as Record<string, unknown>).uploadedAt as Date).toISOString()
							: String((a as Record<string, unknown>).uploadedAt),
				}))
			: [],
		validatedBy: obj.validatedBy ? String(obj.validatedBy) : undefined,
		status: toCanonicalPurchaseOrderStatus(obj.status),
		rejectionReason: obj.rejectionReason ? String(obj.rejectionReason) : undefined,
		createdBy: String(obj.createdBy),
		createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(obj.createdAt),
		updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(obj.updatedAt),
	} as unknown as PurchaseOrderAuthorization;
}

export async function listPurchaseOrders(query: {
	page: number;
	limit: number;
	proposalId?: string;
	status?: PurchaseOrderStatus;
}): Promise<{
	data: PurchaseOrderAuthorization[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	const filter: Record<string, unknown> = {};
	if (query.proposalId) {
		filter.proposalId = query.proposalId;
	}
	const statusFilter = buildStatusFilter(query.status);
	if (statusFilter) {
		filter.status = statusFilter;
	}

	let docs: PurchaseOrderDocument[];
	let total: number;

	try {
		[docs, total] = await Promise.all([
			PurchaseOrderModel.find(filter)
				.sort({ createdAt: -1 })
				.skip((query.page - 1) * query.limit)
				.limit(query.limit),
			PurchaseOrderModel.countDocuments(filter),
		]);
	} catch (error) {
		if (error instanceof Error && isTransientDatabaseError(error)) {
			log.error("Database unavailable while listing purchase orders", { error: String(error) });
			throw new ServiceUnavailableError(
				"Database temporarily unavailable while listing purchase orders.",
				"PURCHASE_ORDER_SERVICE_UNAVAILABLE",
			);
		}
		throw error;
	}

	return {
		data: docs.map(toRecord),
		total,
		page: query.page,
		limit: query.limit,
		pages: Math.ceil(total / query.limit),
	};
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrderAuthorization> {
	const doc = await PurchaseOrderModel.findById(id);
	if (!doc) {
		throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
	}
	return toRecord(doc);
}

export async function getPurchaseOrderByProposalId(
	proposalId: string,
): Promise<PurchaseOrderAuthorization> {
	const doc = await PurchaseOrderModel.findOne({ proposalId }).sort({ updatedAt: -1 });
	if (!doc) {
		throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
	}
	return toRecord(doc);
}

export async function registerPurchaseOrder(
	data: {
		proposalId: string;
		poNumber: string;
		contractReference?: string;
		serviceAccount: string;
		billingAccount: string;
		approvedAmount: number;
		currency: string;
		receivedAt: string;
		attachments?: Array<{ url: string; filename: string }>;
	},
	userId: string,
): Promise<PurchaseOrderAuthorization> {
	await assertProposalApproved(data.proposalId);

	const existingPurchaseOrder = await PurchaseOrderModel.findOne({
		proposalId: data.proposalId,
		status: { $ne: "rejected" },
	})
		.sort({ updatedAt: -1 })
		.lean<{ _id: string } | null>();

	if (existingPurchaseOrder) {
		throw new ConflictError("A purchase order is already registered for this proposal");
	}

	const doc = await PurchaseOrderModel.create({
		...data,
		attachments: (data.attachments ?? []).map((a) => ({
			...a,
			uploadedAt: new Date(),
		})),
		receivedAt: new Date(data.receivedAt),
		status: "pending",
		createdBy: userId,
	});
	return toRecord(doc);
}

export async function validatePurchaseOrder(
	id: string,
	userId: string,
): Promise<PurchaseOrderAuthorization> {
	const doc = await PurchaseOrderModel.findById(id);
	if (!doc) {
		throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
	}

	if (toCanonicalPurchaseOrderStatus(doc.status) === "rejected") {
		throw new ConflictError("Rejected purchase orders cannot be approved");
	}

	doc.status = "approved";
	doc.validatedBy = new Types.ObjectId(userId);
	await doc.save();
	return toRecord(doc);
}

export async function rejectPurchaseOrder(
	id: string,
	reason: string,
): Promise<PurchaseOrderAuthorization> {
	const doc = await PurchaseOrderModel.findById(id);
	if (!doc) {
		throw new AppError("Purchase order not found", 404, "PO_NOT_FOUND");
	}

	if (toCanonicalPurchaseOrderStatus(doc.status) === "approved") {
		throw new ConflictError("Approved purchase orders cannot be rejected");
	}

	doc.status = "rejected";
	doc.rejectionReason = reason;
	await doc.save();
	return toRecord(doc);
}
