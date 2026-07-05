/**
 * Jobs Routes — Admin endpoints for managing the reminder worker
 */

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as JobsController from "./jobs.controller";

const router = Router();

// POST /api/jobs/run — Trigger all checks manually
router.post("/run", authenticate, authorize("gerente"), JobsController.runJobs);

// GET /api/jobs/status — Check if worker is running
router.get("/status", authenticate, authorize("gerente"), JobsController.getStatus);

export default router;
