/**
 * Inspection Controller — Thin HTTP layer for inspection management
 *
 * Responsibilities:
 * - Call InspectionService for business logic
 * - Return standardized HTTP responses
 */

import {
	CreateInspectionSchema,
	InspectionIdSchema,
	InspectionOrderIdParamsSchema,
	UpdateInspectionStatusSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import {
	createInspection as createInspectionService,
	deleteInspection as deleteInspectionService,
	findAllInspections,
	findInspectionById,
	findInspectionsByOrderId,
	updateInspectionStatus as updateInspectionStatusService,
} from "./inspection.service";

export const createInspection = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const inspection = await createInspectionService(CreateInspectionSchema.parse(req.body), userId);
	return sendCreated(res, inspection);
};

export const getAllInspections = async (_req: Request, res: Response) => {
	const inspections = await findAllInspections();
	return sendSuccess(res, inspections);
};

export const getInspectionById = async (req: Request, res: Response) => {
	const { id } = InspectionIdSchema.parse(req.params);
	const inspection = await findInspectionById(id);
	return sendSuccess(res, inspection);
};

export const getInspectionsByOrder = async (req: Request, res: Response) => {
	const { order_id: orderId } = InspectionOrderIdParamsSchema.parse(req.params);
	const inspections = await findInspectionsByOrderId(orderId);
	return sendSuccess(res, inspections);
};

export const updateInspectionStatus = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const { status } = UpdateInspectionStatusSchema.parse(req.body);
	const { id } = InspectionIdSchema.parse(req.params);
	const inspection = await updateInspectionStatusService(id, status, userId);
	return sendSuccess(res, inspection);
};

export const deleteInspection = async (req: Request, res: Response) => {
	const { id } = InspectionIdSchema.parse(req.params);
	await deleteInspectionService(id);
	return sendSuccess(res, { message: "Inspection deleted" });
};
