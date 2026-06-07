import type {
	CostDataState,
	CostSummary,
	CreateCostInput,
	ListCostsQuery,
	UpdateCostInput,
} from "@cermont/shared-types";
import type { CostResponse as CostSnapshot } from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../common/errors/AppError";
import { Cost, Document, Evidence, Invoice, Order, Payment } from "../../models";
import type { ICostDocument } from "../../models/Cost";

export type CostDashboard = {
	generatedAt: string;
	totalEstimated: number;
	totalActual: number;
	totalTax: number;
	variance: number;
	variancePercent: number | null;
	hasNegativeVariance: boolean;
	byCategory: CostSummary["byCategory"];
};

const COST_CATEGORY_ORDER = [
	"labor",
	"materials",
	"equipment",
	"transport",
	"subcontract",
	"overhead",
	"tax",
	"other",
] satisfies readonly CostSummary["byCategory"][number]["category"][];

type EvidenceSupportQuery = {
	_id: { $in: Types.ObjectId[] };
	deletedAt: { $exists: false };
	$or: Array<{ orderId: Types.ObjectId } | { workOrderId: Types.ObjectId }>;
};

type DocumentSupportQuery = {
	_id: { $in: Types.ObjectId[] };
	lifecycleStatus: { $ne: "deleted" };
	$or: Array<
		| { order_id: Types.ObjectId }
		| { "associations.orderId": Types.ObjectId }
		| {
				linkedEntityType: { $in: ["order", "work_order"] };
				linkedEntityId: Types.ObjectId;
		  }
	>;
};

function parseObjectId(value: string, fieldName: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestError(`Invalid ${fieldName}`, `INVALID_${fieldName.toUpperCase()}`);
	}

	return new Types.ObjectId(value);
}

function toIsoString(value?: Date | string): string {
	if (!value) {
		return new Date(0).toISOString();
	}

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

function computeVariance(estimatedAmount: number, actualAmount: number): number {
	return Number(actualAmount ?? 0) - Number(estimatedAmount ?? 0);
}

function computeVariancePercent(estimatedAmount: number, actualAmount: number): number {
	if (estimatedAmount <= 0) {
		return 0;
	}

	return computeVariance(estimatedAmount, actualAmount) / estimatedAmount;
}

function resolveAmountDataState(estimatedAmount: number, actualAmount: number): CostDataState {
	const hasEstimated = estimatedAmount > 0;
	const hasActual = actualAmount > 0;
	if (hasEstimated && hasActual) {
		return "ESTIMATED_AND_ACTUAL";
	}
	if (hasEstimated) {
		return "ESTIMATED_ONLY";
	}
	if (hasActual) {
		return "ACTUAL_ONLY";
	}
	return "NO_DATA";
}

async function resolveBillingDataState(
	orderId: Types.ObjectId,
	fallback: CostDataState,
): Promise<CostDataState> {
	const paidPayment = await Payment.findOne({
		workOrderId: orderId,
		status: { $in: ["recorded", "reconciled"] },
	})
		.select("_id")
		.lean();
	if (paidPayment) {
		return "PAID";
	}

	const invoice = await Invoice.findOne({
		workOrderId: orderId,
		status: {
			$in: ["issued", "sent", "submitted", "approved", "accepted", "partially_paid", "paid"],
		},
	})
		.select("status")
		.lean<{ status?: string }>();

	if (invoice?.status === "paid") {
		return "PAID";
	}
	if (invoice) {
		return "INVOICED";
	}

	return fallback;
}

function formatCostResponse(doc: ICostDocument): CostSnapshot {
	const estimatedAmount = Number(doc.estimatedAmount ?? 0);
	const actualAmount = Number(doc.actualAmount ?? 0);
	const taxAmount = Number(doc.taxAmount ?? 0);
	const voidMetadata = {
		...(doc.voidedAt ? { voidedAt: toIsoString(doc.voidedAt) } : {}),
		...(doc.voidedBy ? { voidedBy: doc.voidedBy.toString() } : {}),
		...(doc.voidReason ? { voidReason: doc.voidReason } : {}),
	};

	return {
		_id: doc._id.toString(),
		orderId: doc.orderId.toString(),
		category: doc.category,
		description: doc.description,
		estimatedAmount,
		actualAmount,
		taxAmount,
		taxRate: Number(doc.taxRate ?? 0),
		currency: doc.currency ?? "COP",
		notes: doc.notes,
		supportEvidenceIds: (doc.supportEvidenceIds ?? []).map((id) => id.toString()),
		supportDocumentIds: (doc.supportDocumentIds ?? []).map((id) => id.toString()),
		status: doc.status ?? "active",
		...voidMetadata,
		recordedBy: doc.recordedBy.toString(),
		recordedAt: toIsoString(doc.recordedAt),
		createdAt: toIsoString(doc.createdAt),
		updatedAt: toIsoString(doc.updatedAt),
		variance: computeVariance(estimatedAmount, actualAmount),
		variancePercent: { status: "present" as const, value: computeVariancePercent(estimatedAmount, actualAmount) },
		dataState: resolveAmountDataState(estimatedAmount, actualAmount),
	};
}

function parseObjectIds(values: readonly string[] = [], fieldName: string): Types.ObjectId[] {
	return values.map((value) => parseObjectId(value, fieldName));
}

function hasDefinedPayloadKey<K extends keyof UpdateCostInput>(
	payload: UpdateCostInput,
	key: K,
): payload is UpdateCostInput & { [P in K]-?: Exclude<UpdateCostInput[P], void> } {
	return Object.hasOwn(payload, key) && payload[key] !== void 0;
}

function ensureActualCostHasSupport(input: {
	actualAmount: number;
	supportEvidenceIds: readonly Types.ObjectId[];
	supportDocumentIds: readonly Types.ObjectId[];
}): void {
	if (input.actualAmount <= 0) {
		return;
	}

	if (input.supportEvidenceIds.length + input.supportDocumentIds.length === 0) {
		throw new BadRequestError(
			"Actual cost entries require at least one support evidence or document",
			"COST_SUPPORT_REQUIRED",
		);
	}
}

function buildEvidenceSupportQuery(
	orderObjectId: Types.ObjectId,
	supportEvidenceIds: Types.ObjectId[],
): EvidenceSupportQuery {
	return {
		_id: { $in: supportEvidenceIds },
		deletedAt: { $exists: false },
		$or: [{ orderId: orderObjectId }, { workOrderId: orderObjectId }],
	};
}

function buildDocumentSupportQuery(
	orderObjectId: Types.ObjectId,
	supportDocumentIds: Types.ObjectId[],
): DocumentSupportQuery {
	return {
		_id: { $in: supportDocumentIds },
		lifecycleStatus: { $ne: "deleted" },
		$or: [
			{ order_id: orderObjectId },
			{ "associations.orderId": orderObjectId },
			{
				linkedEntityType: { $in: ["order", "work_order"] },
				linkedEntityId: orderObjectId,
			},
		],
	};
}

async function ensureCostSupportsBelongToOrder(input: {
	orderObjectId: Types.ObjectId;
	supportEvidenceIds: Types.ObjectId[];
	supportDocumentIds: Types.ObjectId[];
}): Promise<void> {
	if (input.supportEvidenceIds.length > 0) {
		const evidenceCount = await Evidence.countDocuments(
			buildEvidenceSupportQuery(input.orderObjectId, input.supportEvidenceIds),
		);

		if (evidenceCount !== input.supportEvidenceIds.length) {
			throw new BadRequestError(
				"Cost support evidence must exist and belong to the order",
				"COST_SUPPORT_EVIDENCE_INVALID",
			);
		}
	}

	if (input.supportDocumentIds.length > 0) {
		const documentCount = await Document.countDocuments(
			buildDocumentSupportQuery(input.orderObjectId, input.supportDocumentIds),
		);

		if (documentCount !== input.supportDocumentIds.length) {
			throw new BadRequestError(
				"Cost support document must exist and belong to the order",
				"COST_SUPPORT_DOCUMENT_INVALID",
			);
		}
	}
}

function ensureCostWriteAccess(cost: ICostDocument, userId: string, userRole: string): void {
	const isOwner = cost.recordedBy.toString() === userId;
	const isSupervisor = userRole === "supervisor";

	if (!isOwner && !isSupervisor) {
		throw new ForbiddenError("Only the recorded user or a supervisor can modify this cost");
	}
}

async function ensureOrderExists(orderId: string): Promise<void> {
	const order = await Order.findById(orderId).lean();

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}
}

/**
 * Create cost entry.
 */
export async function createCost(data: CreateCostInput, userId: string): Promise<CostSnapshot> {
	const orderObjectId = parseObjectId(data.orderId, "orderId");
	await ensureOrderExists(orderObjectId.toString());
	const supportEvidenceIds = parseObjectIds(data.supportEvidenceIds, "supportEvidenceId");
	const supportDocumentIds = parseObjectIds(data.supportDocumentIds, "supportDocumentId");
	ensureActualCostHasSupport({
		actualAmount: data.actualAmount,
		supportEvidenceIds,
		supportDocumentIds,
	});
	await ensureCostSupportsBelongToOrder({
		orderObjectId,
		supportEvidenceIds,
		supportDocumentIds,
	});

	const cost = new Cost({
		orderId: orderObjectId,
		category: data.category,
		description: data.description,
		estimatedAmount: data.estimatedAmount,
		actualAmount: data.actualAmount,
		taxAmount: data.taxAmount ?? 0,
		taxRate: data.taxRate ?? 0,
		currency: data.currency ?? "COP",
		notes: data.notes,
		supportEvidenceIds,
		supportDocumentIds,
		status: "active",
		recordedBy: parseObjectId(userId, "userId"),
		recordedAt: new Date(),
	});

	await cost.save();
	return formatCostResponse(cost);
}

/**
 * List costs with optional filters and pagination.
 */
export async function listCosts(query: ListCostsQuery): Promise<{
	costs: CostSnapshot[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	const page = query.page ?? 1;
	const limit = query.limit ?? 20;
	const skip = (page - 1) * limit;

	const filter: {
		status: { $ne: "voided" };
		orderId?: Types.ObjectId;
		category?: ListCostsQuery["category"];
	} = { status: { $ne: "voided" } };

	if (query.orderId) {
		const orderObjectId = parseObjectId(query.orderId, "orderId");
		await ensureOrderExists(orderObjectId.toString());
		filter.orderId = orderObjectId;
	}

	if (query.category) {
		filter.category = query.category;
	}

	const [total, costs] = await Promise.all([
		Cost.countDocuments(filter),
		Cost.find(filter)
			.sort({ createdAt: -1, _id: -1 })
			.skip(skip)
			.limit(limit)
			.lean<ICostDocument[]>(),
	]);

	return {
		costs: costs.map((doc) => formatCostResponse(doc as ICostDocument)),
		total,
		page,
		limit,
		pages: Math.max(Math.ceil(total / limit), 1),
	};
}

/**
 * Compatibility helper for the legacy `/order/:orderId` route.
 */
export async function getCostsByOrderId(
	orderId: string,
	page: number = 1,
	limit: number = 20,
	category?: ListCostsQuery["category"],
): Promise<{
	costs: CostSnapshot[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	return listCosts({
		orderId,
		category,
		page,
		limit,
	});
}

/**
 * Fetch a single cost by ID.
 */
export async function getCostById(costId: string): Promise<CostSnapshot> {
	const costObjectId = parseObjectId(costId, "costId");
	const cost = await Cost.findById(costObjectId).lean<ICostDocument>();

	if (!cost) {
		throw new NotFoundError("Cost", costId);
	}

	return formatCostResponse(cost);
}

/**
 * Get the cost summary for an order.
 */
export async function getOrderSummary(orderId: string): Promise<CostSummary> {
	const orderObjectId = parseObjectId(orderId, "orderId");
	await ensureOrderExists(orderObjectId.toString());

	const [totalsResult, categoryResult] = await Promise.all([
		Cost.aggregate([
			{ $match: { orderId: orderObjectId, status: { $ne: "voided" } } },
			{
				$group: {
					_id: null,
					totalEstimated: { $sum: "$estimatedAmount" },
					totalActual: { $sum: "$actualAmount" },
					totalTax: { $sum: "$taxAmount" },
				},
			},
		]),
		Cost.aggregate([
			{ $match: { orderId: orderObjectId, status: { $ne: "voided" } } },
			{
				$group: {
					_id: "$category",
					estimated: { $sum: "$estimatedAmount" },
					actual: { $sum: "$actualAmount" },
					tax: { $sum: "$taxAmount" },
				},
			},
			{
				$project: {
					_id: 0,
					category: "$_id",
					estimated: 1,
					actual: 1,
					tax: 1,
					variance: { $subtract: ["$actual", "$estimated"] },
				},
			},
		]),
	]);

	const totals = totalsResult[0] ?? {
		totalEstimated: 0,
		totalActual: 0,
		totalTax: 0,
	};

	const byCategory = [...categoryResult]
		.map((item) => {
			const estimated = Number(item.estimated ?? 0);
			const actual = Number(item.actual ?? 0);
			return {
				category: item.category as CostSummary["byCategory"][number]["category"],
				estimated,
				actual,
				tax: Number(item.tax ?? 0),
				variance: Number(item.variance ?? 0),
				dataState: resolveAmountDataState(estimated, actual),
			};
		})
		.sort(
			(left, right) =>
				COST_CATEGORY_ORDER.indexOf(left.category) - COST_CATEGORY_ORDER.indexOf(right.category),
		);

	const totalEstimated = Number(totals.totalEstimated ?? 0);
	const totalActual = Number(totals.totalActual ?? 0);
	const totalTax = Number(totals.totalTax ?? 0);
	const variance = totalActual - totalEstimated;
	const amountDataState = resolveAmountDataState(totalEstimated, totalActual);
	const dataState = await resolveBillingDataState(orderObjectId, amountDataState);

	return {
		orderId: orderObjectId.toString(),
		totalEstimated,
		totalActual,
		totalTax,
		variance,
		variancePercent: totalEstimated > 0
			? { status: "present", value: variance / totalEstimated }
			: { status: "absent" },
		hasCosts: dataState !== "NO_DATA",
		dataState,
		byCategory,
	};
}

/**
 * Compatibility helper for the legacy summary-by-order route.
 */
export async function getCostSummary(orderId: string): Promise<CostSummary> {
	return getOrderSummary(orderId);
}

export async function getCostDashboard(): Promise<CostDashboard> {
	const [totalsResult, categoryResult] = await Promise.all([
		Cost.aggregate<{ totalEstimated: number; totalActual: number; totalTax: number }>([
			{ $match: { status: { $ne: "voided" } } },
			{
				$group: {
					_id: null,
					totalEstimated: { $sum: "$estimatedAmount" },
					totalActual: { $sum: "$actualAmount" },
					totalTax: { $sum: "$taxAmount" },
				},
			},
		]),
		Cost.aggregate<CostSummary["byCategory"][number]>([
			{ $match: { status: { $ne: "voided" } } },
			{
				$group: {
					_id: "$category",
					estimated: { $sum: "$estimatedAmount" },
					actual: { $sum: "$actualAmount" },
					tax: { $sum: "$taxAmount" },
				},
			},
			{
				$project: {
					_id: 0,
					category: "$_id",
					estimated: 1,
					actual: 1,
					tax: 1,
					variance: { $subtract: ["$actual", "$estimated"] },
				},
			},
		]),
	]);
	const totals = totalsResult[0] ?? { totalEstimated: 0, totalActual: 0, totalTax: 0 };
	const totalEstimated = Number(totals.totalEstimated ?? 0);
	const totalActual = Number(totals.totalActual ?? 0);
	const totalTax = Number(totals.totalTax ?? 0);
	const variance = totalActual - totalEstimated;
	const byCategory = [...categoryResult]
		.map((item) => ({
			...item,
			dataState: resolveAmountDataState(Number(item.estimated ?? 0), Number(item.actual ?? 0)),
		}))
		.sort(
			(left, right) =>
				COST_CATEGORY_ORDER.indexOf(left.category) - COST_CATEGORY_ORDER.indexOf(right.category),
		);

	return {
		generatedAt: new Date().toISOString(),
		totalEstimated,
		totalActual,
		totalTax,
		variance,
		variancePercent: totalEstimated > 0 ? variance / totalEstimated : null,
		hasNegativeVariance: variance > 0,
		byCategory,
	};
}

/**
 * Update cost.
 */
export async function updateCost(
	costId: string,
	payload: UpdateCostInput,
	userId: string,
	userRole: string,
): Promise<CostSnapshot> {
	const costObjectId = parseObjectId(costId, "costId");
	const cost = await Cost.findById(costObjectId);

	if (!cost) {
		throw new NotFoundError("Cost", costId);
	}

	ensureCostWriteAccess(cost, userId, userRole);

	if (hasDefinedPayloadKey(payload, "category")) {
		cost.category = payload.category;
	}
	if (hasDefinedPayloadKey(payload, "description")) {
		cost.description = payload.description;
	}
	if (hasDefinedPayloadKey(payload, "estimatedAmount")) {
		cost.estimatedAmount = payload.estimatedAmount;
	}
	if (hasDefinedPayloadKey(payload, "actualAmount")) {
		cost.actualAmount = payload.actualAmount;
	}
	if (hasDefinedPayloadKey(payload, "taxAmount")) {
		cost.taxAmount = payload.taxAmount;
	}
	if (hasDefinedPayloadKey(payload, "taxRate")) {
		cost.taxRate = payload.taxRate;
	}
	if (hasDefinedPayloadKey(payload, "currency")) {
		cost.currency = payload.currency;
	}
	if (hasDefinedPayloadKey(payload, "notes")) {
		cost.notes = payload.notes;
	}
	if (hasDefinedPayloadKey(payload, "supportEvidenceIds")) {
		cost.supportEvidenceIds = parseObjectIds(payload.supportEvidenceIds, "supportEvidenceId");
	}
	if (hasDefinedPayloadKey(payload, "supportDocumentIds")) {
		cost.supportDocumentIds = parseObjectIds(payload.supportDocumentIds, "supportDocumentId");
	}

	ensureActualCostHasSupport({
		actualAmount: cost.actualAmount,
		supportEvidenceIds: cost.supportEvidenceIds ?? [],
		supportDocumentIds: cost.supportDocumentIds ?? [],
	});
	await ensureCostSupportsBelongToOrder({
		orderObjectId: cost.orderId,
		supportEvidenceIds: cost.supportEvidenceIds ?? [],
		supportDocumentIds: cost.supportDocumentIds ?? [],
	});

	await cost.save();
	return formatCostResponse(cost);
}

/**
 * Delete cost.
 */
export async function deleteCost(
	costId: string,
	userId: string,
	userRole: string,
): Promise<CostSnapshot> {
	const costObjectId = parseObjectId(costId, "costId");
	const cost = await Cost.findById(costObjectId);

	if (!cost) {
		throw new NotFoundError("Cost", costId);
	}

	ensureCostWriteAccess(cost, userId, userRole);

	cost.status = "voided";
	cost.voidedAt = new Date();
	cost.voidedBy = parseObjectId(userId, "userId");
	cost.voidReason = "Voided through cost deletion endpoint";
	await cost.save();

	return formatCostResponse(cost);
}
