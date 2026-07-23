import { calculateGrossMargin, evaluateCostBudgetRisk } from "@cermont/domain";
import type {
	CostCategory,
	CostDataState,
	CostIntelligenceSummary,
	CostResponse as CostSnapshot,
	CostSummary,
	CostVarianceReport,
	CreateCostInput,
	ListCostsQuery,
	RegisterEquipmentCostInput,
	RegisterLaborCostInput,
	RegisterMaterialCostInput,
	RegisterSubcontractorCostInput,
	RegisterTaxCostInput,
	RegisterTransportCostInput,
	UpdateCostInput,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
	ServiceUnavailableError,
} from "../../common/errors/AppError";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import {
	Cost,
	CostBaseline,
	Document,
	Evidence,
	Invoice,
	Order,
	Payment,
	Proposal,
	ServiceCase,
} from "../../models";
import type { ICostDocument } from "../../models/Cost";
import type { ICostBaselineDocument } from "../../models/CostBaseline";

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
		variancePercent: {
			status: "present" as const,
			value: computeVariancePercent(estimatedAmount, actualAmount),
		},
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

	let total: number;
	let costs: ICostDocument[];

	try {
		[total, costs] = await Promise.all([
			Cost.countDocuments(filter),
			Cost.find(filter)
				.sort({ createdAt: -1, _id: -1 })
				.skip(skip)
				.limit(limit)
				.lean<ICostDocument[]>(),
		]);
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}

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

	const approvedBudget = await resolveApprovedBudget(orderObjectId);
	const actualCostWithTax = totalActual + totalTax;
	const budgetAssessment = evaluateCostBudgetRisk({
		actualAmount: actualCostWithTax,
		approvedBudget,
	});
	const profitability = calculateGrossMargin({
		revenue: approvedBudget,
		actualCost: actualCostWithTax,
	});

	return {
		orderId: orderObjectId.toString(),
		totalEstimated,
		totalActual,
		totalTax,
		variance,
		variancePercent:
			totalEstimated > 0
				? { status: "present", value: variance / totalEstimated }
				: { status: "absent" },
		approvedBudget,
		budgetConsumptionPercent: budgetAssessment.consumptionPercent,
		budgetRisk: budgetAssessment.risk,
		budgetAlertThreshold: budgetAssessment.threshold,
		actualCostWithTax,
		grossProfit: profitability.grossProfit,
		grossMarginPercent: profitability.grossMarginPercent,
		hasCosts: dataState !== "NO_DATA",
		dataState,
		byCategory,
	};
}

async function resolveApprovedBudget(
	orderObjectId: Types.ObjectId,
): Promise<{ status: "present"; value: number } | { status: "absent" }> {
	const order = await Order.findById(orderObjectId).lean<{
		_id: Types.ObjectId;
		proposalId?: Types.ObjectId;
	}>();
	if (!order?.proposalId) {
		return { status: "absent" };
	}
	const proposal = await Proposal.findOne({ _id: order.proposalId, status: "approved" })
		.select("total")
		.lean<{ total?: number }>();
	if (!proposal || typeof proposal.total !== "number" || proposal.total <= 0) {
		return { status: "absent" };
	}
	return { status: "present", value: proposal.total };
}

/**
 * Compatibility helper for the legacy summary-by-order route.
 */
export async function getCostSummary(orderId: string): Promise<CostSummary> {
	return getOrderSummary(orderId);
}

/**
 * Spec-015: baseline vs actual cost intelligence for one order.
 */
export async function getIntelligence(orderId: string): Promise<CostIntelligenceSummary> {
	if (!Types.ObjectId.isValid(orderId)) {
		throw new BadRequestError("Invalid order id");
	}
	const orderObjectId = new Types.ObjectId(orderId);
	const order = await Order.findById(orderObjectId)
		.select("code proposalId")
		.lean<{ _id: Types.ObjectId; code?: string; proposalId?: Types.ObjectId }>();
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	const summary = await getOrderSummary(orderId);
	const baselineCost = await resolveBaselineCost(order, summary);
	const totalMargin = computeMargin(summary);
	const marginPercent = computeMarginPercent(summary, totalMargin);
	const budgetConsumedPercent = computeBudgetConsumedPercent(summary);

	return {
		orderId,
		orderCode: order.code,
		baselineCost,
		totalEstimated: summary.totalEstimated,
		totalActual: summary.totalActual,
		totalTaxCOP: summary.totalTax,
		totalMargin,
		marginPercent,
		budgetConsumedPercent,
		isAtRisk: summary.budgetRisk === "threshold_reached" || summary.budgetRisk === "over_budget",
		isCritical: summary.budgetRisk === "over_budget",
		deviationByCategory: summary.byCategory.map((entry) => ({
			category: entry.category,
			estimated: entry.estimated,
			actual: entry.actual,
			deviationPercent:
				entry.estimated > 0 ? ((entry.actual - entry.estimated) / entry.estimated) * 100 : 0,
		})),
		lastUpdatedAt: new Date().toISOString(),
	};
}

async function resolveBaselineCost(
	order: { _id: Types.ObjectId; code?: string; proposalId?: Types.ObjectId },
	summary: CostSummary,
): Promise<CostIntelligenceSummary["baselineCost"]> {
	if (!order.proposalId) {
		return undefined;
	}
	const proposal = await Proposal.findOne({ _id: order.proposalId, status: "approved" })
		.select("code total taxTotal updatedAt")
		.lean<{
			_id: Types.ObjectId;
			code?: string;
			total?: number;
			taxTotal?: number;
			updatedAt?: Date;
		}>();
	if (!proposal || typeof proposal.total !== "number" || proposal.total <= 0) {
		return undefined;
	}
	return {
		proposalId: proposal._id.toString(),
		proposalCode: proposal.code,
		frozenAt: (proposal.updatedAt ?? new Date()).toISOString(),
		totalEstimatedCOP: proposal.total,
		totalTaxCOP: Number(proposal.taxTotal ?? 0),
		byCategory: summary.byCategory.map((entry) => ({
			category: entry.category,
			estimatedCOP: entry.estimated,
		})),
	};
}

function computeMargin(summary: CostSummary): number {
	return summary.grossProfit.status === "present"
		? summary.grossProfit.value
		: summary.totalEstimated - summary.actualCostWithTax;
}

function computeMarginPercent(summary: CostSummary, totalMargin: number): number {
	if (summary.grossMarginPercent.status === "present") {
		return summary.grossMarginPercent.value * 100;
	}
	return summary.totalEstimated > 0 ? (totalMargin / summary.totalEstimated) * 100 : 0;
}

function computeBudgetConsumedPercent(summary: CostSummary): number {
	if (summary.budgetConsumptionPercent.status === "present") {
		return summary.budgetConsumptionPercent.value * 100;
	}
	return summary.totalEstimated > 0
		? (summary.actualCostWithTax / summary.totalEstimated) * 100
		: 0;
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

// ═══════════════════════════════════════════════════════════════════════════
// F22-T067: Freeze baseline at proposal approval
// ═══════════════════════════════════════════════════════════════════════════

const COST_CATEGORY_MAP: Record<string, CostCategory> = {
	"mano de obra": "labor",
	labor: "labor",
	materials: "materials",
	materiales: "materials",
	equipment: "equipment",
	equipos: "equipment",
	transport: "transport",
	transporte: "transport",
	subcontract: "subcontract",
	subcontrato: "subcontract",
	tax: "tax",
	impuesto: "tax",
	overhead: "overhead",
	other: "other",
	otro: "other",
};

function inferCostCategory(description: string): CostCategory {
	const lower = description.toLowerCase();
	for (const [keyword, category] of Object.entries(COST_CATEGORY_MAP)) {
		if (lower.includes(keyword)) {
			return category;
		}
	}
	return "other";
}

export async function freezeProposalBaseline(
	proposalId: string,
	userId: string,
): Promise<{ baselineId: string }> {
	const proposal = await Proposal.findById(proposalId).lean<{
		_id: Types.ObjectId;
		code: string;
		items: Array<{
			description: string;
			unit: string;
			quantity: number;
			unitCost: number;
			total: number;
		}>;
		subtotal: number;
		taxRate: number;
		total: number;
		serviceCaseId?: Types.ObjectId;
	}>();
	if (!proposal) {
		throw new NotFoundError("Proposal", proposalId);
	}

	const userObjectId = parseObjectId(userId, "userId");

	const baselineItems = proposal.items.map((item) => ({
		description: item.description,
		unit: item.unit,
		quantity: item.quantity,
		unitCost: item.unitCost,
		total: item.total,
		category: inferCostCategory(item.description),
	}));

	// Supersede any prior active baseline for the same service case
	if (proposal.serviceCaseId) {
		await CostBaseline.updateMany(
			{
				serviceCaseId: proposal.serviceCaseId,
				status: "active",
			},
			{
				$set: { status: "superseded", supersededAt: new Date() },
			},
		);
	}

	const baseline = new CostBaseline({
		serviceCaseId: proposal.serviceCaseId ?? undefined,
		proposalId: proposal._id,
		proposalCode: proposal.code,
		frozenAt: new Date(),
		frozenBy: userObjectId,
		items: baselineItems,
		subtotal: proposal.subtotal,
		taxRate: proposal.taxRate,
		total: proposal.total,
		status: "active",
	});

	await baseline.save();
	return { baselineId: baseline._id.toString() };
}

// ═══════════════════════════════════════════════════════════════════════════
// F22-T068: Register real costs with evidence
// ═══════════════════════════════════════════════════════════════════════════

export async function registerLaborCost(
	data: RegisterLaborCostInput,
	userId: string,
): Promise<CostSnapshot> {
	const totalAmount = data.hours * data.rate;
	return createCost(
		{
			orderId: data.orderId,
			category: "labor",
			description: data.description ?? `Mano de obra — ${data.hours}h × $${data.rate}/h`,
			estimatedAmount: 0,
			actualAmount: totalAmount,
			supportEvidenceIds: data.supportEvidenceIds,
			supportDocumentIds: data.supportDocumentIds,
			clientMutationId: data.clientMutationId,
			workerId: data.workerId ?? undefined,
		} as CreateCostInput,
		userId,
	);
}

export async function registerMaterialCost(
	data: RegisterMaterialCostInput,
	userId: string,
): Promise<CostSnapshot> {
	const totalAmount = data.quantity * data.unitPrice;
	return createCost(
		{
			orderId: data.orderId,
			category: "materials",
			description: data.description ?? `Material — ${data.quantity} × $${data.unitPrice}`,
			estimatedAmount: 0,
			actualAmount: totalAmount,
			supportEvidenceIds: data.supportEvidenceIds,
			supportDocumentIds: data.supportDocumentIds,
			clientMutationId: data.clientMutationId,
		} as CreateCostInput,
		userId,
	);
}

export async function registerEquipmentCost(
	data: RegisterEquipmentCostInput,
	userId: string,
): Promise<CostSnapshot> {
	const totalAmount = data.hours * data.rate;
	return createCost(
		{
			orderId: data.orderId,
			category: "equipment",
			description: data.description ?? `Equipo — ${data.hours}h × $${data.rate}/h`,
			estimatedAmount: 0,
			actualAmount: totalAmount,
			supportEvidenceIds: data.supportEvidenceIds,
			supportDocumentIds: data.supportDocumentIds,
			clientMutationId: data.clientMutationId,
		} as CreateCostInput,
		userId,
	);
}

export async function registerTransportCost(
	data: RegisterTransportCostInput,
	userId: string,
): Promise<CostSnapshot> {
	return createCost(
		{
			orderId: data.orderId,
			category: "transport",
			description: data.description,
			estimatedAmount: 0,
			actualAmount: data.amount,
			supportEvidenceIds: data.supportEvidenceIds,
			supportDocumentIds: data.supportDocumentIds,
			clientMutationId: data.clientMutationId,
		} as CreateCostInput,
		userId,
	);
}

export async function registerSubcontractorCost(
	data: RegisterSubcontractorCostInput,
	userId: string,
): Promise<CostSnapshot> {
	return createCost(
		{
			orderId: data.orderId,
			category: "subcontract",
			description: data.description,
			estimatedAmount: 0,
			actualAmount: data.amount,
			supportEvidenceIds: data.supportEvidenceIds,
			supportDocumentIds: data.supportDocumentIds,
			clientMutationId: data.clientMutationId,
		} as CreateCostInput,
		userId,
	);
}

export async function registerTaxCost(
	data: RegisterTaxCostInput,
	userId: string,
): Promise<CostSnapshot> {
	return createCost(
		{
			orderId: data.orderId,
			category: "tax",
			description: data.description ?? `Impuesto — ${data.taxType}`,
			estimatedAmount: 0,
			actualAmount: data.amount,
			supportEvidenceIds: data.supportEvidenceIds,
			supportDocumentIds: data.supportDocumentIds,
			clientMutationId: data.clientMutationId,
		} as CreateCostInput,
		userId,
	);
}

// ═══════════════════════════════════════════════════════════════════════════
// F22-T069: Variance calculation and cost dashboard
// ═══════════════════════════════════════════════════════════════════════════

async function fetchCostAggregates(orderIds: Types.ObjectId[]) {
	return Promise.all([
		Cost.aggregate<{ totalEstimated: number; totalActual: number }>([
			{ $match: { orderId: { $in: orderIds }, status: { $ne: "voided" } } },
			{
				$group: {
					_id: null,
					totalEstimated: { $sum: "$estimatedAmount" },
					totalActual: { $sum: "$actualAmount" },
				},
			},
		]),
		Cost.aggregate<{ category: string; description: string; estimated: number; actual: number }>([
			{ $match: { orderId: { $in: orderIds }, status: { $ne: "voided" } } },
			{
				$group: {
					_id: { category: "$category", description: "$description" },
					estimated: { $sum: "$estimatedAmount" },
					actual: { $sum: "$actualAmount" },
				},
			},
			{
				$project: {
					_id: 0,
					category: "$_id.category",
					description: "$_id.description",
					estimated: 1,
					actual: 1,
				},
			},
		]),
		Invoice.aggregate<{ totalInvoiced: number; totalPaid: number }>([
			{ $match: { workOrderId: { $in: orderIds } } },
			{
				$group: {
					_id: null,
					totalInvoiced: { $sum: "$total" },
					totalPaid: {
						$sum: { $cond: [{ $in: ["$status", ["paid", "partially_paid"]] }, "$total", 0] },
					},
				},
			},
		]),
	]);
}

function buildCategoryMaps(
	baseline: ICostBaselineDocument | null,
	categoryResult: Array<{ category: string; actual: number }>,
): { baselineByCategory: Map<string, number>; actualByCategory: Map<string, number> } {
	const baselineByCategory = new Map<string, number>();
	if (baseline) {
		for (const item of baseline.items) {
			baselineByCategory.set(
				item.category,
				(baselineByCategory.get(item.category) ?? 0) + item.total,
			);
		}
	}
	const actualByCategory = new Map<string, number>();
	for (const item of categoryResult) {
		actualByCategory.set(item.category, (actualByCategory.get(item.category) ?? 0) + item.actual);
	}
	return { baselineByCategory, actualByCategory };
}

function processCategoryEntry(
	cat: string,
	budgeted: number,
	actual: number,
	thresholdPercent: number,
): {
	entry: {
		category: CostCategory;
		description: string;
		budgeted: number;
		actual: number;
		variance: number;
		variancePercent: number;
	};
	isSignificant: boolean;
	isUnregistered: boolean;
} {
	const variance = actual - budgeted;
	const catVariancePercent = budgeted > 0 ? (variance / budgeted) * 100 : actual > 0 ? 100 : 0;
	const entry = {
		category: cat as CostCategory,
		description: "",
		budgeted,
		actual,
		variance,
		variancePercent: Math.round(catVariancePercent * 100) / 100,
	};
	return {
		entry,
		isSignificant: budgeted > 0 && Math.abs(catVariancePercent) >= thresholdPercent,
		isUnregistered: actual === 0 && cat !== "other",
	};
}

function computeCategoryBreakdown(
	baselineByCategory: Map<string, number>,
	actualByCategory: Map<string, number>,
	thresholdPercent: number,
	skipCategories: string[],
): {
	byCategory: CostVarianceReport["byCategory"];
	significantVariances: CostVarianceReport["byCategory"];
	unregisteredCategories: string[];
} {
	const allCategories = new Set([
		...baselineByCategory.keys(),
		...actualByCategory.keys(),
		"labor",
		"materials",
		"equipment",
		"transport",
		"subcontract",
		"tax",
		"overhead",
		"other",
	]);
	const byCategory: CostVarianceReport["byCategory"] = [];
	const significantVariances: CostVarianceReport["byCategory"] = [];
	const unregisteredCategories: string[] = [];
	const filtered = Array.from(allCategories).filter((c) => !skipCategories.includes(c));

	for (const cat of filtered) {
		const budgeted = baselineByCategory.get(cat) ?? 0;
		const actual = actualByCategory.get(cat) ?? 0;
		const { entry, isSignificant, isUnregistered } = processCategoryEntry(
			cat,
			budgeted,
			actual,
			thresholdPercent,
		);
		byCategory.push(entry);
		if (isSignificant) {
			significantVariances.push(entry);
		}
		if (isUnregistered) {
			unregisteredCategories.push(cat);
		}
	}
	return { byCategory, significantVariances, unregisteredCategories };
}

function resolveOrderIds(serviceCase: { orderIds?: Types.ObjectId[] }): Types.ObjectId[] {
	return (serviceCase.orderIds ?? []).map((id) =>
		typeof id === "string" ? new Types.ObjectId(id) : id,
	);
}

export async function calculateVariance(serviceCaseId: string): Promise<CostVarianceReport> {
	const serviceCaseObjectId = parseObjectId(serviceCaseId, "serviceCaseId");

	const serviceCase = await ServiceCase.findById(serviceCaseObjectId)
		.select("code orderIds")
		.lean<{ _id: Types.ObjectId; code?: string; orderIds?: Types.ObjectId[] }>();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const orderIds = resolveOrderIds(serviceCase);
	const [baseline, [totalsResult, categoryResult, invoiceTotals]] = await Promise.all([
		CostBaseline.findOne({ serviceCaseId: serviceCaseObjectId, status: "active" }).lean(),
		fetchCostAggregates(orderIds),
	]);

	const totals = totalsResult[0] ?? { totalEstimated: 0, totalActual: 0 };
	const invoiceTotalsRow = invoiceTotals[0] ?? { totalInvoiced: 0, totalPaid: 0 };

	const totalBudgeted = baseline?.total ?? totals.totalEstimated;
	const totalActual = totals.totalActual;
	const variance = totalActual - totalBudgeted;
	const variancePercent = totalBudgeted > 0 ? (variance / totalBudgeted) * 100 : 0;

	const { baselineByCategory, actualByCategory } = buildCategoryMaps(baseline, categoryResult);
	const breakdown = computeCategoryBreakdown(baselineByCategory, actualByCategory, 20, [
		"overhead",
	]);

	return {
		serviceCaseId,
		serviceCaseCode: serviceCase.code,
		generatedAt: new Date().toISOString(),
		totalBudgeted,
		totalActual,
		totalInvoiced: invoiceTotalsRow.totalInvoiced,
		totalPaid: invoiceTotalsRow.totalPaid,
		variance,
		variancePercent: Math.round(variancePercent * 100) / 100,
		byCategory: breakdown.byCategory,
		significantVariances: breakdown.significantVariances,
		unregisteredCategories: breakdown.unregisteredCategories as CostCategory[],
	};
}

export async function getServiceCaseCostDashboard(
	serviceCaseId: string,
): Promise<CostVarianceReport & { baselineId: string | null }> {
	const serviceCaseObjectId = parseObjectId(serviceCaseId, "serviceCaseId");

	const serviceCase = await ServiceCase.findById(serviceCaseObjectId)
		.select("code orderIds")
		.lean<{ _id: Types.ObjectId; code?: string; orderIds?: Types.ObjectId[] }>();
	if (!serviceCase) {
		throw new NotFoundError("ServiceCase", serviceCaseId);
	}

	const [baseline, orderIds] = await Promise.all([
		CostBaseline.findOne({ serviceCaseId: serviceCaseObjectId, status: "active" }).lean(),
		Promise.resolve(
			(serviceCase.orderIds ?? []).map((id) =>
				typeof id === "string" ? new Types.ObjectId(id) : id,
			),
		),
	]);

	const [totalsResult, categoryResult, invoiceTotals] = await Promise.all([
		Cost.aggregate<{ totalEstimated: number; totalActual: number; totalTax: number }>([
			{ $match: { orderId: { $in: orderIds }, status: { $ne: "voided" } } },
			{
				$group: {
					_id: null,
					totalEstimated: { $sum: "$estimatedAmount" },
					totalActual: { $sum: "$actualAmount" },
					totalTax: { $sum: "$taxAmount" },
				},
			},
		]),
		Cost.aggregate<{ category: string; estimated: number; actual: number }>([
			{ $match: { orderId: { $in: orderIds }, status: { $ne: "voided" } } },
			{
				$group: {
					_id: "$category",
					estimated: { $sum: "$estimatedAmount" },
					actual: { $sum: "$actualAmount" },
				},
			},
			{ $project: { _id: 0, category: "$_id", estimated: 1, actual: 1 } },
		]),
		Invoice.aggregate<{ totalInvoiced: number; totalPaid: number }>([
			{ $match: { workOrderId: { $in: orderIds } } },
			{
				$group: {
					_id: null,
					totalInvoiced: { $sum: "$total" },
					totalPaid: {
						$sum: { $cond: [{ $in: ["$status", ["paid", "partially_paid"]] }, "$total", 0] },
					},
				},
			},
		]),
	]);

	const totals = totalsResult[0] ?? { totalEstimated: 0, totalActual: 0, totalTax: 0 };
	const invoiceTotalsRow = invoiceTotals[0] ?? { totalInvoiced: 0, totalPaid: 0 };

	const totalBudgeted = baseline?.total ?? totals.totalEstimated;
	const totalActual = totals.totalActual + totals.totalTax;
	const variance = totalActual - totalBudgeted;
	const variancePercent = totalBudgeted > 0 ? (variance / totalBudgeted) * 100 : 0;

	const { baselineByCategory, actualByCategory } = buildCategoryMaps(baseline, categoryResult);
	const breakdown = computeCategoryBreakdown(baselineByCategory, actualByCategory, 20, [
		"overhead",
		"other",
	]);

	return {
		serviceCaseId,
		serviceCaseCode: serviceCase.code,
		generatedAt: new Date().toISOString(),
		totalBudgeted,
		totalActual,
		totalInvoiced: invoiceTotalsRow.totalInvoiced,
		totalPaid: invoiceTotalsRow.totalPaid,
		variance,
		variancePercent: Math.round(variancePercent * 100) / 100,
		byCategory: breakdown.byCategory,
		significantVariances: breakdown.significantVariances,
		unregisteredCategories: breakdown.unregisteredCategories as CostCategory[],
		baselineId: baseline ? baseline._id.toString() : null,
	};
}
