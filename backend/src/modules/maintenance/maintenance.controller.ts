/**
 * Maintenance Kit Controller — Thin HTTP layer for kit management
 *
 * Responsibilities:
 * - Call MaintenanceKitService for business logic
 * - Return standardized HTTP responses
 */

import type { MaintenanceKit as MaintenanceKitResponse } from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
import { offsetToPage, parseNumberQuery, toIsoString } from "../../common/utils/mapping";
import { getString, requireUser } from "../../common/utils/request";
import { MaintenanceKitService } from "./maintenance.service";
import * as LogService from "./maintenance-log.service";
import * as ScheduleService from "./maintenance-schedule.service";

interface MaintenanceKitRecord {
	_id: unknown;
	name: string;
	activity_type: string;
	tools: Array<{
		name: string;
		quantity: number;
		specifications?: string;
	}>;
	equipment: Array<{
		name: string;
		quantity: number;
		certificate_required?: boolean;
	}>;
	is_active: boolean;
	imageUrls?: string[];
	created_by: unknown;
	createdAt: Date | string;
	updatedAt: Date | string;
}

function serializeMaintenanceKit(kit: MaintenanceKitRecord): MaintenanceKitResponse {
	return {
		_id: String(kit._id),
		name: kit.name,
		activityType: kit.activity_type as MaintenanceKitResponse["activityType"],
		...(kit.tools
			? {
					tools: kit.tools.map((tool) => ({
						name: tool.name,
						quantity: tool.quantity,
						...(tool.specifications ? { specifications: tool.specifications } : {}),
					})),
				}
			: { tools: [] }),
		equipment: (kit.equipment || []).map((item) => ({
			name: item.name,
			quantity: item.quantity,
			certificateRequired: Boolean(item.certificate_required),
		})),
		isActive: kit.is_active,
		imageUrls: kit.imageUrls ?? [],
		createdBy: String(kit.created_by),
		createdAt: toIsoString(kit.createdAt) || new Date().toISOString(),
		updatedAt: toIsoString(kit.updatedAt) || new Date().toISOString(),
	};
}

export const createKit = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const kit = await MaintenanceKitService.create(req.body, userId);
	return sendCreated(res, serializeMaintenanceKit(kit as MaintenanceKitRecord));
};

export const getAllKits = async (req: Request, res: Response) => {
	const { activityType, isActive, search, limit = "50", offset = "0", page: pageQuery } = req.query;
	const limitValue = parseNumberQuery(String(limit), 50, 100);
	const pageValue =
		pageQuery !== undefined
			? parseNumberQuery(String(pageQuery), 1)
			: offsetToPage(String(offset), limitValue);

	const result = await MaintenanceKitService.findAll(
		{
			activityType: getString(activityType as string | undefined).trim() || undefined,
			isActive: getString(isActive as string | undefined).trim() || undefined,
			search: getString(search as string | undefined).trim() || undefined,
		},
		pageValue,
		limitValue,
	);

	return sendPaginated(
		res,
		result.data.map((kit) => serializeMaintenanceKit(kit as MaintenanceKitRecord)),
		result.total,
		pageValue,
		limitValue,
	);
};

export const getKitById = async (req: Request, res: Response) => {
	const kit = await MaintenanceKitService.findById(getString(req.params.id));
	return sendSuccess(res, serializeMaintenanceKit(kit as MaintenanceKitRecord));
};

export const updateKit = async (req: Request, res: Response) => {
	const kit = await MaintenanceKitService.update(getString(req.params.id), req.body);
	return sendSuccess(res, serializeMaintenanceKit(kit as MaintenanceKitRecord));
};

export const deleteKit = async (req: Request, res: Response) => {
	await MaintenanceKitService.delete(getString(req.params.id));
	return sendSuccess(res, { message: "Kit deactivated successfully" });
};

// ─── Maintenance Schedule controllers ───────────────────────────────

export const listSchedules = async (req: Request, res: Response) => {
	const page = parseNumberQuery(String(req.query.page ?? "1"), 1);
	const limit = parseNumberQuery(String(req.query.limit ?? "20"), 20, 100);
	const result = await ScheduleService.listSchedules(page, limit);
	return sendPaginated(res, result.data, result.total, page, limit);
};

export const createSchedule = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const schedule = await ScheduleService.createSchedule(req.body, user._id);
	return sendCreated(res, schedule);
};

export const getSchedule = async (req: Request, res: Response) => {
	const schedule = await ScheduleService.getScheduleById(getString(req.params.id));
	return sendSuccess(res, schedule);
};

export const updateSchedule = async (req: Request, res: Response) => {
	const schedule = await ScheduleService.updateSchedule(getString(req.params.id), req.body);
	return sendSuccess(res, schedule);
};

export const deleteSchedule = async (req: Request, res: Response) => {
	const result = await ScheduleService.deleteSchedule(getString(req.params.id));
	return sendSuccess(res, result);
};

// ─── Maintenance Log controllers ────────────────────────────────────

export const listLogs = async (req: Request, res: Response) => {
	const assetId = getString(req.params.assetId);
	const page = parseNumberQuery(String(req.query.page ?? "1"), 1);
	const limit = parseNumberQuery(String(req.query.limit ?? "20"), 20, 100);
	const result = await LogService.listLogs(assetId, page, limit);
	return sendPaginated(res, result.data, result.total, page, limit);
};

export const createLog = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const logEntry = await LogService.createLog(req.body, user._id);
	return sendCreated(res, logEntry);
};
