import { INTERNAL_ROLES, MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	ActivateKitSchema,
	ApplyKitToPlanningSchema,
	ArchiveKitSchema,
	CreateKitSchema,
	DuplicateKitSchema,
	KitIdParamsSchema,
	KitListQuerySchema,
	UpdateKitSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as KitController from "./kit.controller";

const router = Router();

router.use(authenticate);

// GET /api/kits/catalog/options — Preselected catalog values
router.get("/catalog/options", authorize(...INTERNAL_ROLES), KitController.catalogOptions);

// GET /api/kits — List kits with filters
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(KitListQuerySchema),
	KitController.getAll,
);

// POST /api/kits — Create kit
router.post(
	"/",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateBody(CreateKitSchema),
	KitController.create,
);

// GET /api/kits/:id — Get single kit
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(KitIdParamsSchema),
	KitController.getById,
);

// PATCH /api/kits/:id — Update kit
router.patch(
	"/:id",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	validateBody(UpdateKitSchema),
	KitController.update,
);

// DELETE /api/kits/:id — Delete or archive kit (domain rules decide)
router.delete(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	KitController.remove,
);

// POST /api/kits/:id/activate — Activate kit
router.post(
	"/:id/activate",
	authorize(...MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	validateBody(ActivateKitSchema),
	KitController.activate,
);

// POST /api/kits/:id/archive — Archive kit
router.post(
	"/:id/archive",
	authorize(...MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	validateBody(ArchiveKitSchema),
	KitController.archive,
);

// POST /api/kits/:id/restore — Restore archived kit
router.post(
	"/:id/restore",
	authorize(...MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	KitController.restore,
);

// POST /api/kits/:id/duplicate — Duplicate kit
router.post(
	"/:id/duplicate",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	validateBody(DuplicateKitSchema),
	KitController.duplicate,
);

// POST /api/kits/:id/apply-to-planning/:planningId
router.post(
	"/:id/apply-to-planning/:planningId",
	authorize(...MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	validateBody(ApplyKitToPlanningSchema),
	KitController.applyToPlanning,
);

// ─── Attachments (kit images, PDFs, manuals) ─────────────────────────────

// POST /api/kits/:id/attachments — Add attachment (image/PDF)
router.post(
	"/:id/attachments",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	KitController.addAttachment,
);

// DELETE /api/kits/:id/attachments/:attachmentId — Remove attachment
router.delete(
	"/:id/attachments/:attachmentId",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	KitController.removeAttachment,
);

export default router;
