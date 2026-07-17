import type { ListCostsQuery } from "@cermont/shared-types";
import { ListCostCatalogQuerySchema, PaginationQuerySchema } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import * as CostService from "./cost.service";
import * as CostCatalogService from "./cost-catalog.service";

export async function listCosts(req: Request, res: Response): Promise<void> {
	const { page, limit } = PaginationQuerySchema.parse(req.query);

	const result = await CostService.listCosts({
		orderId: typeof req.query.orderId === "string" ? req.query.orderId : undefined,
		category:
			typeof req.query.category === "string"
				? (req.query.category as ListCostsQuery["category"])
				: undefined,
		page,
		limit,
	});

	res.setHeader("X-Total-Count", String(result.total));
	res.status(200).json({
		success: true,
		data: result.costs,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
			pages: result.pages,
		},
	});
}

export async function getCostsByOrder(req: Request, res: Response): Promise<void> {
	const { page, limit } = PaginationQuerySchema.parse(req.query);

	const result = await CostService.getCostsByOrderId(
		String(req.params.orderId),
		page,
		limit,
		typeof req.query.category === "string"
			? (req.query.category as ListCostsQuery["category"])
			: undefined,
	);

	res.setHeader("X-Total-Count", String(result.total));
	res.status(200).json({
		success: true,
		data: result.costs,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
			pages: result.pages,
		},
	});
}

export async function getCostById(req: Request, res: Response): Promise<void> {
	const cost = await CostService.getCostById(String(req.params.id));
	res.status(200).json({ success: true, data: cost });
}

export async function getCostSummary(req: Request, res: Response): Promise<void> {
	const summary = await CostService.getOrderSummary(String(req.params.orderId));
	res.status(200).json({ success: true, data: summary });
}

export async function getCostDashboard(_req: Request, res: Response): Promise<void> {
	const dashboard = await CostService.getCostDashboard();
	res.status(200).json({ success: true, data: dashboard });
}

export async function getCostCatalog(req: Request, res: Response): Promise<void> {
	const query = ListCostCatalogQuerySchema.parse(req.query);
	const result = await CostCatalogService.listCostCatalog(query);
	res.status(200).json({ success: true, data: result });
}

export async function createCostCatalogItem(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const item = await CostCatalogService.createCostCatalogItem(req.body, String(user._id));
	res.status(201).json({ success: true, data: item });
}

export async function getCostIntelligence(req: Request, res: Response): Promise<void> {
	const intelligence = await CostService.getIntelligence(String(req.params.orderId));
	res.status(200).json({ success: true, data: intelligence });
}

export async function createCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.createCost(req.body, String(user._id));

	res.status(201).json({ success: true, data: cost });
}

export async function createCostItemForOrder(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const orderId = req.params.orderId as string;
	const cost = await CostService.createCost({ ...req.body, orderId }, String(user._id));

	res.status(201).json({ success: true, data: cost });
}

export async function updateCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.updateCost(
		String(req.params.id),
		req.body,
		String(user._id),
		user.role,
	);

	res.status(200).json({ success: true, data: cost });
}

export async function deleteCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.deleteCost(String(req.params.id), String(user._id), user.role);

	res.status(200).json({ success: true, data: cost });
}

// ── F22: Baseline, registration, and variance endpoints ────────────────

export async function freezeBaseline(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const result = await CostService.freezeProposalBaseline(
		String(req.params.proposalId),
		String(user._id),
	);
	res.status(201).json({ success: true, data: result });
}

export async function registerLaborCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.registerLaborCost(req.body, String(user._id));
	res.status(201).json({ success: true, data: cost });
}

export async function registerMaterialCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.registerMaterialCost(req.body, String(user._id));
	res.status(201).json({ success: true, data: cost });
}

export async function registerEquipmentCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.registerEquipmentCost(req.body, String(user._id));
	res.status(201).json({ success: true, data: cost });
}

export async function registerTransportCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.registerTransportCost(req.body, String(user._id));
	res.status(201).json({ success: true, data: cost });
}

export async function registerSubcontractorCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.registerSubcontractorCost(req.body, String(user._id));
	res.status(201).json({ success: true, data: cost });
}

export async function registerTaxCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.registerTaxCost(req.body, String(user._id));
	res.status(201).json({ success: true, data: cost });
}

export async function getCalculateVariance(req: Request, res: Response): Promise<void> {
	const report = await CostService.calculateVariance(String(req.params.serviceCaseId));
	res.status(200).json({ success: true, data: report });
}

export async function getServiceCaseCostDashboard(req: Request, res: Response): Promise<void> {
	const dashboard = await CostService.getServiceCaseCostDashboard(String(req.params.serviceCaseId));
	res.status(200).json({ success: true, data: dashboard });
}
