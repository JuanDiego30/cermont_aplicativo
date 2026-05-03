/**
 * sync.routes.ts — Routes for offline sync (DOC-10)
 *
 * POST /api/sync/offline — Batch process offline operations
 * Requires: authenticate + authorize middleware
 *
 * DOC REFERENCE: ISSUE-036 — All routes must have authorize()
 */

import { SyncBatchSchema } from "@cermont/shared-types";
import { ALL_AUTHENTICATED_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validateBody } from "../middlewares/validate";
import { syncOffline } from "./controller";

const router = Router();

/**
 * POST /api/sync/offline
 * Sync pending offline operations
 * Roles: All authenticated users can sync their own data
 * Note: Service layer validates that users can only sync their own actions
 */
router.post(
	"/offline",
	authenticate,
	authorize(...ALL_AUTHENTICATED_ROLES),
	validateBody(SyncBatchSchema),
	syncOffline,
);

export default router;
