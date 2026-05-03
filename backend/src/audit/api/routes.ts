/**
 * Audit Routes — Read-only audit log access
 *
 * SECURITY: POST endpoint removed — audit logs are created internally
 * by middleware/services, NOT via external API to prevent log injection.
 */

import { AuditLogIdSchema, AuditLogsQuerySchema } from "@cermont/shared-types";
import { MANAGEMENT_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { validateParams, validateQuery } from "../../_shared/middlewares/validate";
import { getAuditLogById, getAuditLogs } from "./controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/audit - Get audit logs (with optional filters)
router.get("/", authorize(...MANAGEMENT_ROLES), validateQuery(AuditLogsQuerySchema), getAuditLogs);

// GET /api/audit/:id - Get single audit log
router.get(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(AuditLogIdSchema),
	getAuditLogById,
);

export default router;
