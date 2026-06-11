import {
	CreateInventoryItemSchema,
	InventoryItemIdParamsSchema,
	ListInventoryQuerySchema,
	RegisterStockMovementSchema,
	UpdateInventoryItemSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as InventoryService from "./inventory.service";

export async function createItem(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const input = CreateInventoryItemSchema.parse(req.body);
	const item = await InventoryService.createItem(input, String(user._id));
	sendCreated(res, item);
}

export async function listItems(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const query = ListInventoryQuerySchema.parse(req.query);
	const result = await InventoryService.listItems(query);
	res.status(200).json({ success: true, ...result });
}

export async function getLowStockItems(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const items = await InventoryService.getLowStockItems();
	sendSuccess(res, items);
}

export async function getItem(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = InventoryItemIdParamsSchema.parse(req.params);
	const item = await InventoryService.getItemById(id);
	sendSuccess(res, item);
}

export async function getItemMovements(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = InventoryItemIdParamsSchema.parse(req.params);
	const movements = await InventoryService.getItemMovements(id);
	sendSuccess(res, movements);
}

export async function updateItem(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = InventoryItemIdParamsSchema.parse(req.params);
	const input = UpdateInventoryItemSchema.parse(req.body);
	const item = await InventoryService.updateItem(id, input, String(user._id));
	sendSuccess(res, item);
}

export async function registerMovement(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = InventoryItemIdParamsSchema.parse(req.params);
	const input = RegisterStockMovementSchema.parse(req.body);
	const result = await InventoryService.registerMovement(id, input, String(user._id));
	sendCreated(res, result);
}
