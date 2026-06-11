import {
	CreateVehicleSchema,
	ListVehiclesQuerySchema,
	UpdateVehicleSchema,
	VehicleIdParamsSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as FleetService from "./fleet.service";

export async function createVehicle(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const input = CreateVehicleSchema.parse(req.body);
	const vehicle = await FleetService.createVehicle(input, String(user._id));
	sendCreated(res, vehicle);
}

export async function listVehicles(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const query = ListVehiclesQuerySchema.parse(req.query);
	const result = await FleetService.listVehicles(query);
	res.status(200).json({ success: true, ...result });
}

export async function getExpiringDocuments(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const days = Number.parseInt(String(req.query.days ?? "30"), 10);
	const alerts = await FleetService.getExpiringDocuments(
		Number.isFinite(days) && days > 0 ? days : 30,
	);
	sendSuccess(res, alerts);
}

export async function getVehicle(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = VehicleIdParamsSchema.parse(req.params);
	const vehicle = await FleetService.getVehicleById(id);
	sendSuccess(res, vehicle);
}

export async function updateVehicle(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = VehicleIdParamsSchema.parse(req.params);
	const input = UpdateVehicleSchema.parse(req.body);
	const vehicle = await FleetService.updateVehicle(id, input, String(user._id));
	sendSuccess(res, vehicle);
}
