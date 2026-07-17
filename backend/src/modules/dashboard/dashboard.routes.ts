import { ALL_AUTHENTICATED_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import {
	getBlockers,
	getCostComparisonChart,
	getFinancialKpis,
	getNextActions,
	getOperationalKpis,
	getRecentActivity,
	getRoleKPIs,
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

// GET /api/dashboard/kpis — Role-filtered KPI data
router.get("/kpis", authorize(...ALL_AUTHENTICATED_ROLES), getRoleKPIs);

// GET /api/dashboard/charts/cost-comparison — Cost comparison chart data
router.get(
	"/charts/cost-comparison",
	authorize(...ALL_AUTHENTICATED_ROLES),
	getCostComparisonChart,
);

// GET /api/dashboard/financial-kpis — Financial KPIs (conversion rate, pipeline, margin)
router.get("/financial-kpis", authorize(...ALL_AUTHENTICATED_ROLES), getFinancialKpis);

export default router;
