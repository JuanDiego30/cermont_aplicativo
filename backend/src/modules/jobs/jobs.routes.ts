/**
 * Jobs Routes — Admin endpoints for managing the reminder worker
 */

import { RunJobsSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody } from "../../middlewares/validate";
import * as JobsController from "./jobs.controller";

const router = Router();

// POST /api/jobs/run — Trigger all checks manually
router.post(
	"/run",
	authenticate,
	authorize("gerente"),
	validateBody(RunJobsSchema),
	JobsController.runJobs,
);

// GET /api/jobs/status — Check if worker is running
router.get("/status", authenticate, authorize("gerente"), JobsController.getStatus);

export default router;
