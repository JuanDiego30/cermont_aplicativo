/**
 * sync.controller.ts — HTTP layer for offline sync (DOC-10)
 * POST /api/sync/offline — Process queued offline operations
 *
 * SRP: Only handles HTTP — validates payload shape, delegates to sync.service.
 * Express 5: No try/catch needed — async errors bubble to errorHandler.
 */

import type { SyncBatch } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendSuccess } from "../common/interceptors/response.interceptor";
import { requireUser } from "../common/utils/request";
import { processSyncBatch } from "./application/service";

/**
 * POST /api/sync/offline
 * Processes a batch of offline-queued operations.
 * Protected by authenticate + authorize middlewares in sync.routes.ts.
 *
 * FIXED: Pass both actorRole and actorId per updated sync.service signature
 */
export const syncOffline = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const { operations } = req.body as SyncBatch;

	const userId = user._id.toString();
	const userRole = user.role;

	const result = await processSyncBatch(operations, userRole, userId);

	return sendSuccess(res, result, 200);
};
