import { ALL_AUTHENTICATED_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { cacheMiddleware } from "../../middlewares/cache.middleware";
import {
	getBlockers,
	getCostComparisonChart,
	getFinancialKpis,
	getHealthScoreHandler,
	getNextActions,
	getOperationalKpis,
	getPredictiveAlertsHandler,
	getRecentActivity,
	getRoleKPIs,
	getSlaRisk,
	getSummary,
} from "./dashboard.controller";

const router = Router();

router.use(authenticate);

// GET /api/dashboard/summary — Business KPIs for gerencial dashboard
router.get("/summary", cacheMiddleware(15_000), authorize(...ALL_AUTHENTICATED_ROLES), getSummary);

// GET /api/dashboard/operational-kpis — Spec-015 MTTR / MTBF / FTFR
router.get("/operational-kpis", cacheMiddleware(30_000), authorize(...ALL_AUTHENTICATED_ROLES), getOperationalKpis);

// GET /api/dashboard/sla-risk — Spec-015 SLA risk orders
router.get("/sla-risk", cacheMiddleware(30_000), authorize(...ALL_AUTHENTICATED_ROLES), getSlaRisk);

// GET /api/dashboard/next-actions — Spec-022 next actions panel
router.get("/next-actions", cacheMiddleware(15_000), authorize(...ALL_AUTHENTICATED_ROLES), getNextActions);

// GET /api/dashboard/blockers — Spec-022 critical blockers panel
router.get("/blockers", cacheMiddleware(15_000), authorize(...ALL_AUTHENTICATED_ROLES), getBlockers);

// GET /api/dashboard/recent-activity — Spec-022 recent activity feed
router.get("/recent-activity", cacheMiddleware(10_000), authorize(...ALL_AUTHENTICATED_ROLES), getRecentActivity);

// GET /api/dashboard/kpis — Role-filtered KPI data
router.get("/kpis", cacheMiddleware(15_000), authorize(...ALL_AUTHENTICATED_ROLES), getRoleKPIs);

// GET /api/dashboard/charts/cost-comparison — Cost comparison chart data
router.get(
	"/charts/cost-comparison",
	cacheMiddleware(30_000),
	authorize(...ALL_AUTHENTICATED_ROLES),
	getCostComparisonChart,
);

// GET /api/dashboard/financial-kpis — Financial KPIs (conversion rate, pipeline, margin)
router.get("/financial-kpis", cacheMiddleware(30_000), authorize(...ALL_AUTHENTICATED_ROLES), getFinancialKpis);

// GET /api/dashboard/predictive-alerts — INNOVATION: Heuristic early-warning alerts
router.get(
	"/predictive-alerts",
	cacheMiddleware(120_000),
	authorize(...ALL_AUTHENTICATED_ROLES),
	getPredictiveAlertsHandler,
);

// GET /api/dashboard/health-score — INNOVATION: Composite operational health score
router.get(
	"/health-score",
	cacheMiddleware(60_000),
	authorize(...ALL_AUTHENTICATED_ROLES),
	getHealthScoreHandler,
);

export default router;
