/**
 * Admin Backup Routes — /api/admin/backups
 *
 * Solo gerencia. Exportación de colecciones para respaldo y auditoría.
 */

import { existsSync } from "node:fs";
import { CERMONT_ROLES } from "@cermont/domain";
import type { Request, Response } from "express";
import { Router } from "express";
import { AppError } from "../../common/errors";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as AdminBackupService from "./admin-backup.service";
import { verifyBackupManifest } from "./admin-backup-verify.service";

const router = Router();

router.use(authenticate);
router.use(authorize(CERMONT_ROLES.GERENTE));

// GET /api/admin/backups/collections — collections with document counts
router.get("/collections", async (req: Request, res: Response): Promise<void> => {
	requireUser(req);
	const collections = await AdminBackupService.listCollections();
	sendSuccess(res, collections);
});

// GET /api/admin/backups/export/:collection?year=2026&month=5 — JSON download
// POST /api/admin/backups/verify — verify a backup manifest against live DB
router.post("/verify", async (req: Request, res: Response): Promise<void> => {
	requireUser(req);
	const manifestPath = String(req.body.manifestPath ?? "");
	if (!manifestPath || !existsSync(manifestPath)) {
		throw new AppError("manifestPath no encontrado o inválido", 400, "MANIFEST_NOT_FOUND");
	}

	const result = await verifyBackupManifest(manifestPath);
	sendSuccess(res, result);
});

// GET /api/admin/backups/verify — returns stored verification manifest schema hint
router.get("/verify", (_req: Request, res: Response): void => {
	sendSuccess(res, {
		description:
			"Envía POST /api/admin/backups/verify con { manifestPath: '/ruta/al/manifest.json' } para verificar un respaldo.",
		schema: {
			manifestPath: "string — ruta absoluta al manifest.json del backup",
		},
	});
});

router.get("/export/:collection", async (req: Request, res: Response): Promise<void> => {
	requireUser(req);
	const year = Number.parseInt(String(req.query.year ?? ""), 10);
	const month = Number.parseInt(String(req.query.month ?? ""), 10);

	const exportPayload = await AdminBackupService.exportCollection(
		String(req.params.collection ?? ""),
		{
			...(Number.isFinite(year) && year > 2000 ? { year } : {}),
			...(Number.isFinite(month) && month >= 1 && month <= 12 ? { month } : {}),
		},
	);

	const suffix =
		exportPayload.filter === "all"
			? "completo"
			: `${(exportPayload.filter as { year: number; month: number }).year}-${String((exportPayload.filter as { year: number; month: number }).month).padStart(2, "0")}`;
	res.setHeader(
		"Content-Disposition",
		`attachment; filename="backup-${exportPayload.collection}-${suffix}.json"`,
	);
	res.status(200).json(exportPayload);
});

export default router;
