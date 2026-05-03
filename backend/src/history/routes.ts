import {
	HistoryArchiveRequestSchema,
	HistoryExportSchema,
	HistoryOrdersQuerySchema,
} from "@cermont/shared-types";
import { INTERNAL_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../_shared/middlewares/auth.middleware";
import { authorize } from "../_shared/middlewares/authorize.middleware";
import { validateBody, validateQuery } from "../_shared/middlewares/validate";
import {
	archiveOrders,
	downloadCsv,
	downloadFinancial,
	downloadZip,
	getStats,
	listHistory,
} from "./controller";

const router = Router();

router.use(authenticate);
router.use(authorize(...INTERNAL_ROLES));

router.get("/", validateQuery(HistoryOrdersQuerySchema), listHistory);
router.get("/stats", getStats);
router.post("/archive", validateBody(HistoryArchiveRequestSchema), archiveOrders);
router.post("/export/csv", validateBody(HistoryExportSchema), downloadCsv);
router.post("/export/zip", validateBody(HistoryExportSchema), downloadZip);
router.post("/export/financial", validateBody(HistoryExportSchema), downloadFinancial);

export default router;
