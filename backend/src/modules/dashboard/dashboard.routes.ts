import { ALL_AUTHENTICATED_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import {
	getBlockers,
	getNextActions,
	getOperationalKpis,
	getRecentActivity,
	getSlaRisk,
	getSummary,
} from "./dashboard.controller";

const router = Router();

router.use(authenticate);

// GET /api/dashboard/summary — Business KPIs for gerencial dashboard
router.get("/summary", authorize(...ALL_AUTHENTICATED_ROLES), getSummary);

// GET /api/dashboard/operational-kpis — Spec-015 MTTR / MTBF / FTFR
router.get("/operational-kpis", authorize(...ALL_AUTHENTICATED_ROLES), getOperationalKpis);

// GET /api/dashboard/sla-risk — Spec-015 SLA risk orders
router.get("/sla-risk", authorize(...ALL_AUTHENTICATED_ROLES), getSlaRisk);

// GET /api/dashboard/next-actions — Spec-022 next actions panel
router.get("/next-actions", authorize(...ALL_AUTHENTICATED_ROLES), getNextActions);

// GET /api/dashboard/blockers — Spec-022 critical blockers panel
router.get("/blockers", authorize(...ALL_AUTHENTICATED_ROLES), getBlockers);

// GET /api/dashboard/recent-activity — Spec-022 recent activity feed
router.get("/recent-activity", authorize(...ALL_AUTHENTICATED_ROLES), getRecentActivity);

export default router;
