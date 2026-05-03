import type { ListCostsQuery } from "@cermont/shared-types";
import { PaginationQuerySchema } from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../_shared/common/interceptors/response.interceptor";
import { requireUser } from "../../_shared/common/utils/request";
import { CostService, getCostControl, updateCostControl } from "../application/service";

export async function listCosts(req: Request, res: Response): Promise<void> {
	const { page, limit } = PaginationQuerySchema.parse(req.query);

	const result = await CostService.findAll({
		orderId: typeof req.query.orderId === "string" ? req.query.orderId : undefined,
		category:
			typeof req.query.category === "string"
				? (req.query.category as ListCostsQuery["category"])
				: undefined,
		page,
		limit,
	});

	sendPaginated(res, result.data, result.total, result.page, result.limit);
}

export async function getCostsByOrder(req: Request, res: Response): Promise<void> {
	const { page, limit } = PaginationQuerySchema.parse(req.query);

	const result = await CostService.findAll({
		orderId: String(req.params.orderId),
		page,
		limit,
		category:
			typeof req.query.category === "string"
				? (req.query.category as ListCostsQuery["category"])
				: undefined,
	});

	sendPaginated(res, result.data, result.total, result.page, result.limit);
}

export async function getCostById(req: Request, res: Response): Promise<void> {
	const cost = await CostService.findById(String(req.params.id));
	sendSuccess(res, cost);
}

export async function getCostSummary(req: Request, res: Response): Promise<void> {
	const summary = await CostService.getOrderSummary(String(req.params.orderId));
	sendSuccess(res, summary);
}

export async function createCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.create(req.body, String(user._id));

	sendCreated(res, cost);
}

export async function updateCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.update(
		String(req.params.id),
		req.body,
		String(user._id),
		user.role,
	);

	sendSuccess(res, cost);
}

export async function deleteCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	await CostService.delete(String(req.params.id), String(user._id), user.role);

	sendSuccess(res, { message: "Cost deleted successfully" });
}

export async function getCostDashboard(_req: Request, _res: Response): Promise<void> {
	const dashboard = await CostService.getCostDashboard();
	sendSuccess(_res, dashboard);
}

export async function getOrderCostControl(req: Request, res: Response): Promise<void> {
	const control = await getCostControl(String(req.params.orderId));
	sendSuccess(res, control);
}

export async function updateOrderCostControl(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const control = await updateCostControl(String(req.params.orderId), req.body, String(user._id));
	sendSuccess(res, control);
}

export async function listTariffs(_req: Request, res: Response): Promise<void> {
	const tariffs = await CostService.listTariffs();
	sendSuccess(res, tariffs);
}

export async function createTariff(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const tariff = await CostService.createTariff(req.body, String(user._id));
	sendCreated(res, tariff);
}

export async function updateTariff(req: Request, res: Response): Promise<void> {
	const tariff = await CostService.updateTariff(String(req.params.id), req.body);
	sendSuccess(res, tariff);
}

export async function calculateLaborCost(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const cost = await CostService.calculateLaborCost(String(req.params.orderId), String(user._id));
	sendSuccess(res, cost);
}
