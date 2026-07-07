import { INTERNAL_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as KpiController from "./kpi.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize(...INTERNAL_ROLES), KpiController.getDashboardKpis);

export default router;
