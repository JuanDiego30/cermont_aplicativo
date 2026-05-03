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
	ListInspectionsQuerySchema,
	UpdateInspectionStatusSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../_shared/common/interceptors/response.interceptor";
import { requireUser } from "../../_shared/common/utils/request";
import { InspectionService } from "../application/service";

export const createInspection = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const inspection = await InspectionService.create(CreateInspectionSchema.parse(req.body), userId);
	return sendCreated(res, inspection);
};

export const getAllInspections = async (req: Request, res: Response) => {
	const { page, limit } = ListInspectionsQuerySchema.parse(req.query);
	const result = await InspectionService.findAll(page, limit);
	return sendPaginated(res, result.data, result.total, result.page, result.limit);
};

export const getInspectionById = async (req: Request, res: Response) => {
	const { id } = InspectionIdSchema.parse(req.params);
	const inspection = await InspectionService.findById(id);
	return sendSuccess(res, inspection);
};

export const getInspectionsByOrder = async (req: Request, res: Response) => {
	const { order_id: orderId } = InspectionOrderIdParamsSchema.parse(req.params);
	const { page, limit } = ListInspectionsQuerySchema.parse(req.query);
	const result = await InspectionService.findByOrderId(orderId, page, limit);
	return sendPaginated(res, result.data, result.total, result.page, result.limit);
};

export const updateInspectionStatus = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const { status } = UpdateInspectionStatusSchema.parse(req.body);
	const { id } = InspectionIdSchema.parse(req.params);
	const inspection = await InspectionService.updateStatus(id, status, userId);
	return sendSuccess(res, inspection);
};

export const deleteInspection = async (req: Request, res: Response) => {
	const { id } = InspectionIdSchema.parse(req.params);
	await InspectionService.delete(id);
	return sendSuccess(res, { message: "Inspection deleted" });
};
