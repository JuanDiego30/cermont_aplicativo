import { INTERNAL_ROLES, MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	ArchiveKitSchema,
	CreateKitSchema,
	KitByServiceTypeParamsSchema,
	KitIdParamsSchema,
	KitListQuerySchema,
	PublishKitSchema,
	UpdateKitSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as KitController from "./kit.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/by-service-type/:serviceTypeId",
	authorize(...INTERNAL_ROLES),
	validateParams(KitByServiceTypeParamsSchema),
	KitController.getByServiceType,
);
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(KitListQuerySchema),
	KitController.getAll,
);

// GET /api/kits/templates - Get basic kit templates (simplified for order creation)
router.get(
	"/templates",
	authorize("gerente", "residente", "supervisor", "administrativo"),
	KitController.getTemplates,
);
router.post(
	"/",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateBody(CreateKitSchema),
	KitController.create,
);
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(KitIdParamsSchema),
	KitController.getById,
);
router.put(
	"/:id",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	validateBody(UpdateKitSchema),
	KitController.update,
);
router.post(
	"/:id/publish",
	authorize(...MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	validateBody(PublishKitSchema),
	KitController.publish,
);
router.post(
	"/:id/archive",
	authorize(...MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	validateBody(ArchiveKitSchema),
	KitController.archive,
);
router.delete(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(KitIdParamsSchema),
	KitController.remove,
);

export default router;
