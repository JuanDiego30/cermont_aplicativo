import type {
	CostDataState,
	CostResponse as CostResponseType,
	CostSummary,
	CreateCostInput,
	ListCostsQuery,
	UpdateCostInput,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../common/errors/AppError";
import { Cost, Invoice, Order, Payment } from "../../models";
import type { ICostDocument } from "../../models/Cost";

type CostResponse = CostResponseType;

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

function parseObjectId(value: string, fieldName: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestError(`Invalid ${fieldName}`, `INVALID_${fieldName.toUpperCase()}`);
	}

	return new Types.ObjectId(value);
}

function toIsoString(value: Date | string | undefined): string {
	if (!value) {
		return new Date(0).toISOString();
	}

	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

function computeVariance(estimatedAmount: number, actualAmount: number): number {
	return Number(actualAmount ?? 0) - Number(estimatedAmount ?? 0);
}

function computeVariancePercent(estimatedAmount: number, actualAmount: number): number | null {
	if (estimatedAmount <= 0) {
		return null;
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

function formatCostResponse(doc: ICostDocument): CostResponse {
	const estimatedAmount = Number(doc.estimatedAmount ?? 0);
	const actualAmount = Number(doc.actualAmount ?? 0);
	const taxAmount = Number(doc.taxAmount ?? 0);

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
		recordedBy: doc.recordedBy.toString(),
		recordedAt: toIsoString(doc.recordedAt),
		createdAt: toIsoString(doc.createdAt),
		updatedAt: toIsoString(doc.updatedAt),
		variance: computeVariance(estimatedAmount, actualAmount),
		variancePercent: computeVariancePercent(estimatedAmount, actualAmount),
		dataState: resolveAmountDataState(estimatedAmount, actualAmount),
	};
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
export async function createCost(data: CreateCostInput, userId: string): Promise<CostResponse> {
	const orderObjectId = parseObjectId(data.orderId, "orderId");
	await ensureOrderExists(orderObjectId.toString());

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
	costs: CostResponse[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	const page = query.page ?? 1;
	const limit = query.limit ?? 20;
	const skip = (page - 1) * limit;

	const filter: Record<string, unknown> = {};

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
	costs: CostResponse[];
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
export async function getCostById(costId: string): Promise<CostResponse> {
	const costObjectId = parseObjectId(costId, "costId");
	const cost = await Cost.findById(costObjectId).lean();

	if (!cost) {
		throw new NotFoundError("Cost", costId);
	}

	return formatCostResponse(cost as unknown as ICostDocument);
}

/**
 * Get the cost summary for an order.
 */
export async function getOrderSummary(orderId: string): Promise<CostSummary> {
	const orderObjectId = parseObjectId(orderId, "orderId");
	await ensureOrderExists(orderObjectId.toString());

	const [totalsResult, categoryResult] = await Promise.all([
		Cost.aggregate([
			{ $match: { orderId: orderObjectId } },
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
			{ $match: { orderId: orderObjectId } },
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
		variancePercent: totalEstimated > 0 ? variance / totalEstimated : null,
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
): Promise<CostResponse> {
	const costObjectId = parseObjectId(costId, "costId");
	const cost = await Cost.findById(costObjectId);

	if (!cost) {
		throw new NotFoundError("Cost", costId);
	}

	ensureCostWriteAccess(cost, userId, userRole);

	if (payload.category !== undefined) {
		cost.category = payload.category;
	}
	if (payload.description !== undefined) {
		cost.description = payload.description;
	}
	if (payload.estimatedAmount !== undefined) {
		cost.estimatedAmount = payload.estimatedAmount;
	}
	if (payload.actualAmount !== undefined) {
		cost.actualAmount = payload.actualAmount;
	}
	if (payload.taxAmount !== undefined) {
		cost.taxAmount = payload.taxAmount;
	}
	if (payload.taxRate !== undefined) {
		cost.taxRate = payload.taxRate;
	}
	if (payload.currency !== undefined) {
		cost.currency = payload.currency;
	}
	if (payload.notes !== undefined) {
		cost.notes = payload.notes;
	}

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
): Promise<CostResponse> {
	const costObjectId = parseObjectId(costId, "costId");
	const cost = await Cost.findById(costObjectId).lean();

	if (!cost) {
		throw new NotFoundError("Cost", costId);
	}

	ensureCostWriteAccess(cost as unknown as ICostDocument, userId, userRole);

	await Cost.deleteOne({ _id: costObjectId });

	return formatCostResponse(cost as unknown as ICostDocument);
}
