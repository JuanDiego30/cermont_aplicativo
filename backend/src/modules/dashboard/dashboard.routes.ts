import { ALL_AUTHENTICATED_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { getOperationalKpis, getSlaRisk, getSummary } from "./dashboard.controller";

const router = Router();

router.use(authenticate);

// GET /api/dashboard/summary — Business KPIs for gerencial dashboard
router.get("/summary", authorize(...ALL_AUTHENTICATED_ROLES), getSummary);

// GET /api/dashboard/operational-kpis — Spec-015 MTTR / MTBF / FTFR
router.get("/operational-kpis", authorize(...ALL_AUTHENTICATED_ROLES), getOperationalKpis);

// GET /api/dashboard/sla-risk — Spec-015 SLA risk orders
router.get("/sla-risk", authorize(...ALL_AUTHENTICATED_ROLES), getSlaRisk);

export default router;
