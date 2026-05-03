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

import { AuditLogIdSchema, AuditLogsQuerySchema } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../_shared/common/interceptors/response.interceptor";
import { getString } from "../../_shared/common/utils/request";
import { findById, findLogs } from "../application/service";

export const getAuditLogs = async (req: Request, res: Response) => {
	const { user_id, model_name, action, page, limit } = AuditLogsQuerySchema.parse(req.query);
	const userId = getString(user_id);
	const modelName = getString(model_name);
	const auditAction = getString(action);

	const filters = {
		user_id: userId,
		model_name: modelName,
		action: auditAction,
	};

	const result = await findLogs(filters, page, limit);
	return sendPaginated(res, result.logs, result.total, result.page, result.limit);
};

export const getAuditLogById = async (req: Request, res: Response) => {
	const { id } = AuditLogIdSchema.parse(req.params);
	const logEntry = await findById(id);
	return sendSuccess(res, logEntry);
};
