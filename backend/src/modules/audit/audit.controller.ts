/**
 * Audit Controller — Thin HTTP layer for audit log queries
 *
 * Responsibilities:
 * - Parse query parameters for filtering
 * - Call AuditService for queries
 * - Return standardized HTTP responses
 *
 * SECURITY: POST /audit endpoint REMOVED — audit logs are created internally only
 */

import { AuditLogsQuerySchema } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { findById, findLogs } from "./audit.service";

export const getAuditLogs = async (req: Request, res: Response) => {
	// Use validated query data from middleware (validateQuery(AuditLogsQuerySchema))
	const {
		userId,
		user_id,
		entity,
		model_name,
		entityId,
		action,
		requestId,
		from,
		to,
		page,
		limit,
	} = AuditLogsQuerySchema.parse(req.query);

	const filters = {
		...(userId ? { userId } : {}),
		...(user_id ? { user_id } : {}),
		...(entity ? { entity } : {}),
		...(model_name ? { model_name } : {}),
		...(entityId ? { entityId } : {}),
		...(action ? { action } : {}),
		...(requestId ? { requestId } : {}),
		...(from ? { from } : {}),
		...(to ? { to } : {}),
	};

	const result = await findLogs(filters, page, limit);
	return sendPaginated(res, result.logs, result.total, result.page, result.limit);
};

export const getAuditLogById = async (req: Request, res: Response) => {
	// Use validated params data from middleware (validateParams(AuditLogIdSchema))
	const { id } = req.params as { id: string };
	const logEntry = await findById(id);
	return sendSuccess(res, logEntry);
};
