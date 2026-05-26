import { ALL_AUTHENTICATED_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { getSummary } from "./dashboard.controller";

const router = Router();

router.use(authenticate);

// GET /api/dashboard/summary — Business KPIs for gerencial dashboard
router.get("/summary", authorize(...ALL_AUTHENTICATED_ROLES), getSummary);

export default router;
