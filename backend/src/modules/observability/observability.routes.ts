import { INTERNAL_ROLES } from "@cermont/domain";
import { ErrorDashboardQuerySchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateQuery } from "../../middlewares/validate";
import { getEndpointHealth, getErrorDashboard, getFullStatus } from "./observability.controller";

const router = Router();

// All observability endpoints require authentication
router.use(authenticate);

// GET /api/observability/errors — Technical error metrics (NOT business KPIs)
router.get(
	"/errors",
	authorize(...INTERNAL_ROLES),
	validateQuery(ErrorDashboardQuerySchema),
	getErrorDashboard,
);

// GET /api/observability/health — Endpoint health status
router.get("/health", authorize(...INTERNAL_ROLES), getEndpointHealth);

// GET /api/observability/status — Full component status (MongoDB, Redis, FS, AI)
router.get("/status", authorize(...INTERNAL_ROLES), getFullStatus);

export default router;
