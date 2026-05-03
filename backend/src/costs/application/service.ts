import type {
	CostDocument,
	CostLineDelta,
	CostResponse as CostResponseType,
	CostSummary,
	CreateCostInput,
	CreateTariffInput,
	ListCostsQuery,
	Tariff,
	UpdateCostControl,
	UpdateCostInput,
	UpdateTariffInput,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../_shared/common/errors";
import { toIsoString } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import type { TariffRecord } from "../domain/tariff.repository";

type CostResponse = CostResponseType;

interface CostTotalsAggregate {
	totalEstimated: number;
	totalActual: number;
	totalTax: number;
}

interface CostControlBaseline {
	baselineEstimated: number;
	baselineApproved: number;
}

interface CostCategoryAggregate {
	category: CostSummary["byCategory"][number]["category"];
	estimated: number;
	actual: number;
	tax: number;
	variance: number;
}

const COST_CATEGORY_ORDER = [
	"labor",
	"materials",
	"equipment",
	"transport",
	"subcontract",
	"overhead",
	"other",
] as const;
const EPOCH_ISO = new Date(0).toISOString();

function parseObjectId(value: string, fieldName: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestError(`Invalid ${fieldName}`, `INVALID_${fieldName.toUpperCase()}`);
	}

	return new Types.ObjectId(value);
}

function computeVariance(estimatedAmount: number, actualAmount: number): number {
	return Number(actualAmount ?? 0) - Number(estimatedAmount ?? 0);
}

function computeVariancePercent(estimatedAmount: number, actualAmount: number): number | undefined {
	if (estimatedAmount <= 0) {
		return undefined;
	}

	return computeVariance(estimatedAmount, actualAmount) / estimatedAmount;
}

async function getBaselineForOrder(orderId: Types.ObjectId): Promise<CostControlBaseline> {
	const costControl = await container.costControlRepository.findOneLean({ order_id: orderId });

	if (!costControl) {
		return {
			baselineEstimated: 0,
			baselineApproved: 0,
		};
	}

	return {
		baselineEstimated: Number(costControl.budget_estimated ?? 0),
		baselineApproved: Number(costControl.budget_approved ?? costControl.budget_estimated ?? 0),
	};
}

function formatCostResponse(doc: CostDocument): CostResponse {
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
		recordedAt: toIsoString(doc.recordedAt) ?? EPOCH_ISO,
		createdAt: toIsoString(doc.createdAt) ?? EPOCH_ISO,
		updatedAt: toIsoString(doc.updatedAt) ?? EPOCH_ISO,
		variance: computeVariance(estimatedAmount, actualAmount),
		variancePercent: computeVariancePercent(estimatedAmount, actualAmount),
	};
}

function ensureCostWriteAccess(cost: CostDocument, userId: string, userRole: string): void {
	const isOwner = cost.recordedBy.toString() === userId;
	const isSupervisor = userRole === "supervisor";

	if (!isOwner && !isSupervisor) {
		throw new ForbiddenError("Only the recorded user or a supervisor can modify this cost");
	}
}

function formatCostControlResponse(
	orderId: string,
	costControl: {
		_id?: { toString(): string };
		currency?: string;
		budget_estimated?: number;
		budget_approved?: number;
		actual_items?: Array<{
			category: string;
			description: string;
			unit?: string;
			quantity?: number;
			unit_price?: number;
			total?: number;
			isBudgeted?: boolean;
			notes?: string;
		}>;
		actual_total?: number;
		variance?: number;
		variance_pct?: number;
		closed?: boolean;
		closed_at?: Date;
		closed_by?: { toString(): string };
		approved_by?: { toString(): string };
		notes?: string;
		created_by?: { toString(): string };
		createdAt?: Date;
		updatedAt?: Date;
	},
) {
	return {
		_id: costControl._id?.toString(),
		orderId,
		currency: costControl.currency ?? "COP",
		budgetEstimated: Number(costControl.budget_estimated ?? 0),
		budgetApproved: Number(costControl.budget_approved ?? costControl.budget_estimated ?? 0),
		actualItems: (costControl.actual_items ?? []).map((item) => ({
			category: item.category,
			description: item.description,
			unit: item.unit,
			quantity: Number(item.quantity ?? 0),
			unitPrice: Number(item.unit_price ?? 0),
			total: Number(item.total ?? 0),
			isBudgeted: Boolean(item.isBudgeted),
			notes: item.notes,
		})),
		actualTotal: Number(costControl.actual_total ?? 0),
		variance: Number(costControl.variance ?? 0),
		variancePct: Number(costControl.variance_pct ?? 0),
		closed: Boolean(costControl.closed),
		closedAt: costControl.closed_at?.toISOString(),
		closedBy: costControl.closed_by?.toString(),
		approvedBy: costControl.approved_by?.toString(),
		notes: costControl.notes,
		createdBy: costControl.created_by?.toString(),
		createdAt: costControl.createdAt?.toISOString(),
		updatedAt: costControl.updatedAt?.toISOString(),
	};
}

function resolveLineDeltaStatus(
	delta: number,
	deltaPct: number | undefined,
): CostLineDelta["status"] {
	if (delta < 0) {
		return "under_budget";
	}
	if (deltaPct === undefined || deltaPct <= 0.1) {
		return "on_budget";
	}
	if (deltaPct <= 0.25) {
		return "over_budget";
	}
	return "critical";
}

function _buildLineDeltas(args: {
	order: Awaited<ReturnType<typeof container.orderRepository.findByIdLean>>;
	costControl?: Awaited<ReturnType<typeof container.costControlRepository.findOneLean>>;
	categories: CostCategoryAggregate[];
}): CostLineDelta[] {
	const actualByCategory = new Map<string, number>();
	for (const category of args.categories) {
		actualByCategory.set(
			category.category,
			Number(category.actual ?? 0) + Number(category.tax ?? 0),
		);
	}

	for (const item of args.costControl?.actual_items ?? []) {
		const current = actualByCategory.get(item.category) ?? 0;
		actualByCategory.set(item.category, current + Number(item.total ?? 0));
	}

	const baselineItems = args.order?.costBaseline?.items ?? [];
	if (baselineItems.length > 0) {
		return baselineItems.map((item) => {
			const category = "other" as const;
			const budgeted = Number(item.total ?? 0);
			const actual = Number(item.total ?? 0) > 0 ? 0 : (actualByCategory.get(category) ?? 0);
			const delta = actual - budgeted;
			const deltaPct = budgeted > 0 ? delta / budgeted : undefined;
			const status = resolveLineDeltaStatus(delta, deltaPct);
			return {
				category,
				description: item.description,
				budgeted,
				actual,
				delta,
				...(deltaPct === undefined ? {} : { deltaPct }),
				status,
			};
		});
	}

	const budgetedByCategory = new Map<string, number>();
	for (const item of args.costControl?.actual_items ?? []) {
		if (item.isBudgeted) {
			budgetedByCategory.set(
				item.category,
				(budgetedByCategory.get(item.category) ?? 0) + Number(item.total ?? 0),
			);
		}
	}

	return COST_CATEGORY_ORDER.map((category) => {
		const budgeted = budgetedByCategory.get(category) ?? 0;
		const actual = actualByCategory.get(category) ?? 0;
		const delta = actual - budgeted;
		const deltaPct = budgeted > 0 ? delta / budgeted : undefined;
		const status = resolveLineDeltaStatus(delta, deltaPct);
		return {
			category,
			description: category,
			budgeted,
			actual,
			delta,
			...(deltaPct === undefined ? {} : { deltaPct }),
			status,
		};
	});
}

function formatTariff(doc: TariffRecord): Tariff {
	return {
		_id: doc._id.toString(),
		role: doc.role,
		hourlyRateCOP: Number(doc.hourlyRateCOP),
		overtimeMultiplier: Number(doc.overtimeMultiplier),
		effectiveFrom: doc.effectiveFrom.toISOString(),
		createdBy: doc.createdBy?.toString(),
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

export const CostService = {
	async create(data: CreateCostInput, userId: string): Promise<CostResponse> {
		const orderId = parseObjectId(data.orderId, "orderId");
		const recordedBy = parseObjectId(userId, "userId");

		// Validate order exists
		const order = await container.orderRepository.findByIdLean(orderId.toString());
		if (!order) {
			throw new NotFoundError("Order", data.orderId);
		}

		const cost = await container.costRepository.create({
			orderId: orderId.toString(),
			category: data.category,
			description: data.description.trim(),
			estimatedAmount: data.estimatedAmount,
			actualAmount: data.actualAmount,
			taxAmount: data.taxAmount ?? 0,
			taxRate: data.taxRate ?? 0,
			currency: data.currency || "COP",
			notes: data.notes?.trim(),
			recordedBy: recordedBy.toString(),
			recordedAt: new Date(),
		});

		return formatCostResponse(cost);
	},

	async findAll(filters: ListCostsQuery): Promise<{
		data: CostResponse[];
		total: number;
		page: number;
		limit: number;
		pages: number;
	}> {
		const query: Record<string, unknown> = {};

		if (filters.orderId) {
			query.orderId = parseObjectId(filters.orderId, "orderId");
		}

		if (filters.category) {
			query.category = filters.category;
		}

		const skip = (filters.page - 1) * filters.limit;

		const [data, total] = await Promise.all([
			container.costRepository.findPaginated(query, {
				skip,
				limit: filters.limit,
				sort: { recordedAt: -1 },
			}),
			container.costRepository.countDocuments(query),
		]);

		return {
			data: data.map(formatCostResponse),
			total,
			page: filters.page,
			limit: filters.limit,
			pages: Math.ceil(total / filters.limit),
		};
	},

	async findById(id: string): Promise<CostResponse> {
		const cost = await container.costRepository.findByIdLean(id);

		if (!cost) {
			throw new NotFoundError("Cost", id);
		}

		return formatCostResponse(cost);
	},

	async update(
		id: string,
		updates: UpdateCostInput,
		userId: string,
		userRole: string,
	): Promise<CostResponse> {
		const cost = await container.costRepository.findById(id);

		if (!cost) {
			throw new NotFoundError("Cost", id);
		}

		ensureCostWriteAccess(cost, userId, userRole);

		if (updates.category) {
			cost.category = updates.category;
		}
		if (updates.description) {
			cost.description = updates.description.trim();
		}
		if (updates.estimatedAmount !== undefined) {
			cost.estimatedAmount = updates.estimatedAmount;
		}
		if (updates.actualAmount !== undefined) {
			cost.actualAmount = updates.actualAmount;
		}
		if (updates.taxAmount !== undefined) {
			cost.taxAmount = updates.taxAmount;
		}
		if (updates.taxRate !== undefined) {
			cost.taxRate = updates.taxRate;
		}
		if (updates.currency) {
			cost.currency = updates.currency;
		}
		if (updates.notes !== undefined) {
			cost.notes = updates.notes.trim();
		}

		await container.costRepository.save(cost);

		return formatCostResponse(cost);
	},

	async delete(id: string, userId: string, userRole: string): Promise<void> {
		const cost = await container.costRepository.findByIdLean(id);

		if (!cost) {
			throw new NotFoundError("Cost", id);
		}

		ensureCostWriteAccess(cost, userId, userRole);

		await container.costRepository.deleteOne({ _id: parseObjectId(id, "id") });
	},

	async getOrderSummary(orderId: string): Promise<CostSummary> {
		const oid = parseObjectId(orderId, "orderId");
		const order = await container.orderRepository.findByIdLean(orderId);

		if (!order) {
			throw new NotFoundError("Order", orderId);
		}

		const [totals, categories, baseline] = await Promise.all([
			container.costRepository.aggregate<CostTotalsAggregate>([
				{ $match: { orderId: oid } },
				{
					$group: {
						_id: null,
						totalEstimated: { $sum: "$estimatedAmount" },
						totalActual: { $sum: "$actualAmount" },
						totalTax: { $sum: "$taxAmount" },
					},
				},
			]),
			container.costRepository.aggregate<CostCategoryAggregate>([
				{ $match: { orderId: oid } },
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
			getBaselineForOrder(oid),
			container.costControlRepository.findOneLean({ order_id: oid }),
		]);

		const total = totals[0] || { totalEstimated: 0, totalActual: 0, totalTax: 0 };
		const baselineEstimated = baseline.baselineEstimated || total.totalEstimated;
		const baselineApproved =
			baseline.baselineApproved || baseline.baselineEstimated || total.totalEstimated;
		const actualWithTax = total.totalActual + total.totalTax;
		const variance = actualWithTax - baselineApproved;

		// Ensure all categories are present for consistent UI
		const categoryMap = new Map(categories.map((c) => [c.category, c]));
		const _fullCategories: CostCategoryAggregate[] = COST_CATEGORY_ORDER.map((category) => {
			return (
				categoryMap.get(category) || {
					category,
					estimated: 0,
					actual: 0,
					tax: 0,
					variance: 0,
				}
			);
		});

		return {
			orderId,
			totalEstimated: total.totalEstimated,
			totalActual: total.totalActual,
			totalTax: total.totalTax,
			baselineEstimated,
			baselineApproved,
			variance,
			variancePercent: baselineApproved > 0 ? variance / baselineApproved : undefined,

			deviationStatus: variance > 0 ? "over_budget" : "on_track",
			hasCosts: total.totalEstimated > 0 || total.totalActual > 0,
			byCategory: categories,
			lineDeltas: [],
		};
	},

	async listTariffs(): Promise<Tariff[]> {
		const tariffs = await container.tariffRepository.list();
		return tariffs.map(formatTariff);
	},

	async createTariff(data: CreateTariffInput, userId: string): Promise<Tariff> {
		const tariff = await container.tariffRepository.create({
			role: data.role,
			hourlyRateCOP: data.hourlyRateCOP,
			overtimeMultiplier: data.overtimeMultiplier ?? 1.5,
			effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
			createdBy: userId,
		});
		return formatTariff(tariff);
	},

	async updateTariff(id: string, data: UpdateTariffInput): Promise<Tariff> {
		const tariff = await container.tariffRepository.update(id, {
			...(data.role ? { role: data.role } : {}),
			...(data.hourlyRateCOP !== undefined ? { hourlyRateCOP: data.hourlyRateCOP } : {}),
			...(data.overtimeMultiplier !== undefined
				? { overtimeMultiplier: data.overtimeMultiplier }
				: {}),
			...(data.effectiveFrom ? { effectiveFrom: new Date(data.effectiveFrom) } : {}),
		});
		if (!tariff) {
			throw new NotFoundError("Tariff", id);
		}
		return formatTariff(tariff);
	},

	async calculateLaborCost(orderId: string, userId: string): Promise<CostResponse> {
		const order = await container.orderRepository.findByIdLean(orderId);
		if (!order) {
			throw new NotFoundError("Order", orderId);
		}
		if (!order.startedAt || !order.completedAt) {
			throw new BadRequestError("Order must have startedAt and completedAt", "ORDER_MISSING_TIMES");
		}

		const technicianId =
			order.resourceAssignment?.technicianIds?.[0]?.toString() ?? order.assignedTo?.toString();
		if (!technicianId) {
			throw new BadRequestError("Order has no assigned technician", "ORDER_MISSING_TECHNICIAN");
		}

		const technician = await container.userRepository.findByIdLean(technicianId);
		if (!technician) {
			throw new NotFoundError("User", technicianId);
		}

		const tariff = await container.tariffRepository.findEffectiveForRole(
			technician.role,
			new Date(order.completedAt),
		);

		if (!tariff) {
			throw new NotFoundError("Tariff", technician.role);
		}

		const hours = Math.max(
			(new Date(order.completedAt).getTime() - new Date(order.startedAt).getTime()) /
				(1000 * 60 * 60),
			0,
		);
		const normalHours = Math.min(hours, 8);
		const overtimeHours = Math.max(hours - 8, 0);
		const hourlyRate = Number(tariff.hourlyRateCOP);
		const actualAmount =
			normalHours * hourlyRate + overtimeHours * hourlyRate * Number(tariff.overtimeMultiplier);

		const existing = await container.costRepository.findOne({
			orderId: parseObjectId(orderId, "orderId"),
			category: "labor",
			description: "Mano de obra calculada automáticamente",
		});

		if (existing) {
			existing.actualAmount = actualAmount;
			existing.estimatedAmount = existing.estimatedAmount ?? actualAmount;
			existing.notes = `Horas: ${hours.toFixed(2)}. Rol: ${technician.role}.`;
			await container.costRepository.save(existing);
			return formatCostResponse(existing);
		}

		const cost = await container.costRepository.create({
			orderId: parseObjectId(orderId, "orderId").toString(),
			category: "labor",
			description: "Mano de obra calculada automáticamente",
			estimatedAmount: actualAmount,
			actualAmount,
			taxAmount: 0,
			taxRate: 0,
			currency: "COP",
			notes: `Horas: ${hours.toFixed(2)}. Rol: ${technician.role}.`,
			recordedBy: parseObjectId(userId, "userId").toString(),
			recordedAt: new Date(),
		});

		return formatCostResponse(cost);
	},

	async getCostDashboard(): Promise<{
		summary: {
			totalEstimated: number;
			totalActual: number;
			totalVariance: number;
			orderCount: number;
		};
		timeline: Array<{ date: string; estimated: number; actual: number }>;
		breakdowns: { byCategory: Array<{ category: string; estimated: number; actual: number }> };
	}> {
		const [totals, timelineData, categoryData] = await Promise.all([
			container.costRepository.aggregate<{
				totalEstimated: number;
				totalActual: number;
				orderCount: number;
			}>([
				{
					$group: {
						_id: null,
						totalEstimated: { $sum: "$estimatedAmount" },
						totalActual: { $sum: "$actualAmount" },
						orderCount: { $addToSet: "$orderId" },
					},
				},
			]),
			container.costRepository.aggregate<{ _id: string; estimated: number; actual: number }>([
				{
					$group: {
						_id: { $dateToString: { format: "%Y-%m-%d", date: "$recordedAt" } },
						estimated: { $sum: "$estimatedAmount" },
						actual: { $sum: "$actualAmount" },
					},
				},
				{ $sort: { _id: -1 } },
				{ $limit: 30 },
			]),
			container.costRepository.aggregate<{ _id: string; estimated: number; actual: number }>([
				{
					$group: {
						_id: "$category",
						estimated: { $sum: "$estimatedAmount" },
						actual: { $sum: "$actualAmount" },
					},
				},
			]),
		]);

		const totalsData = totals[0] || { totalEstimated: 0, totalActual: 0, orderCount: 0 };
		const orderCount = Array.isArray(totalsData.orderCount) ? totalsData.orderCount.length : 0;

		return {
			summary: {
				totalEstimated: totalsData.totalEstimated,
				totalActual: totalsData.totalActual,
				totalVariance: totalsData.totalActual - totalsData.totalEstimated,
				orderCount,
			},
			timeline: timelineData.map((item) => ({
				date: item._id,
				estimated: item.estimated,
				actual: item.actual,
			})),
			breakdowns: {
				byCategory: categoryData.map((item) => ({
					category: item._id,
					estimated: item.estimated,
					actual: item.actual,
				})),
			},
		};
	},
};

export const getOrderSummary = CostService.getOrderSummary;
export const createCost = CostService.create;
export const listCosts = CostService.findAll;
export const getCostById = CostService.findById;
export const updateCost = CostService.update;
export const deleteCost = CostService.delete;
export const getCostDashboard = CostService.getCostDashboard;
export const listTariffs = CostService.listTariffs;
export const createTariff = CostService.createTariff;
export const updateTariff = CostService.updateTariff;
export const calculateLaborCost = CostService.calculateLaborCost;

export async function getCostControl(orderId: string) {
	const oid = parseObjectId(orderId, "orderId");
	const costControl = await container.costControlRepository.findOneLean({ order_id: oid });
	if (!costControl) {
		throw new NotFoundError("CostControl", orderId);
	}
	return formatCostControlResponse(orderId, costControl);
}

export async function updateCostControl(orderId: string, data: UpdateCostControl, userId: string) {
	const oid = parseObjectId(orderId, "orderId");
	const costControl = await container.costControlRepository.findOne({ order_id: oid });

	if (!costControl) {
		throw new NotFoundError("CostControl", orderId);
	}

	costControl.actual_items = (data.actualItems ?? []).map((item) => ({
		category: item.category,
		description: item.description.trim(),
		unit: item.unit?.trim() || undefined,
		quantity: Number(item.quantity),
		unit_price: Number(item.unitPrice),
		total: Number(item.total),
		isBudgeted: Boolean(item.isBudgeted),
		notes: item.notes?.trim() || undefined,
	}));

	if (data.budgetApproved !== undefined) {
		costControl.budget_approved = Number(data.budgetApproved);
	}

	if (data.notes !== undefined) {
		costControl.notes = data.notes?.trim() || undefined;
	}

	if (data.budgetApproved !== undefined) {
		costControl.approved_by = parseObjectId(userId, "userId");
	}

	await container.costControlRepository.save(costControl);

	return formatCostControlResponse(orderId, costControl);
}
