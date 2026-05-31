import { INTERNAL_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { getSystemMetrics } from "./metrics.controller";

const router = Router();

// GET /api/metrics — System metrics (internal/admin only)
router.get("/", authenticate, authorize(...INTERNAL_ROLES), getSystemMetrics);

export default router;