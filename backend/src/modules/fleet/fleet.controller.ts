import {
	CheckinVehicleAssignmentSchema,
	CheckoutVehicleAssignmentSchema,
	CreateVehicleAssignmentSchema,
	CreateVehicleSchema,
	ListVehiclesQuerySchema,
	UpdateVehicleSchema,
	VehicleIdParamsSchema,
	VehiclePhotoParamsSchema,
	VehiclePhotoUploadFormSchema,
} from "@cermont/shared-types";

import type { Request, Response } from "express";
import {
	sendCreated,
	sendNoContent,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
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

export async function listVehiclePhotos(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = VehicleIdParamsSchema.parse(req.params);
	const photos = await FleetService.listVehiclePhotos(id);
	sendSuccess(res, photos);
}

export async function uploadVehiclePhoto(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = VehicleIdParamsSchema.parse(req.params);
	const input = VehiclePhotoUploadFormSchema.parse(req.body);
	if (!req.file) {
		res.status(400).json({
			success: false,
			error: { code: "FILE_REQUIRED", message: "No file was uploaded under field 'file'" },
		});
		return;
	}

	const photo = await FleetService.uploadVehiclePhoto(
		id,
		req.file,
		input.title ?? req.file.originalname,
		String(user._id),
		String(user.email ?? user._id),
	);
	sendCreated(res, photo);
}

export async function setPrimaryVehiclePhoto(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id, photoId } = VehiclePhotoParamsSchema.parse(req.params);
	const photo = await FleetService.setPrimaryVehiclePhoto(id, photoId, String(user._id));
	sendSuccess(res, photo);
}

export async function deleteVehiclePhoto(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id, photoId } = VehiclePhotoParamsSchema.parse(req.params);
	await FleetService.deleteVehiclePhoto(id, photoId, String(user._id));
	sendNoContent(res);
}

export async function assignVehicle(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = VehicleIdParamsSchema.parse(req.params);
	const { driverId } = CreateVehicleAssignmentSchema.parse(req.body);
	const assignment = await FleetService.assignVehicle(id, driverId, String(user._id));
	sendSuccess(res, assignment);
}

export async function checkoutVehicle(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { assignmentId } = req.params as { assignmentId: string };
	const { checkout } = CheckoutVehicleAssignmentSchema.parse(req.body);
	const assignment = await FleetService.checkoutVehicle(assignmentId, checkout, String(user._id));
	sendSuccess(res, assignment);
}

export async function checkinVehicle(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { assignmentId } = req.params as { assignmentId: string };
	const { checkin } = CheckinVehicleAssignmentSchema.parse(req.body);
	const assignment = await FleetService.checkinVehicle(assignmentId, checkin, String(user._id));
	sendSuccess(res, assignment);
}

export async function getAssignmentHistory(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = VehicleIdParamsSchema.parse(req.params);
	const result = await FleetService.getVehicleAssignmentHistory(id);
	sendSuccess(res, result);
}
