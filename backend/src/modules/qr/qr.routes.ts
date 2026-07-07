import { INTERNAL_ROLES } from "@cermont/domain";
import { GenerateBulkQrCodesSchema, GenerateQrCodeSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody } from "../../middlewares/validate";
import * as QrController from "./qr.controller";

const router = Router();

router.use(authenticate);

router.post(
	"/generate",
	authorize(...INTERNAL_ROLES),
	validateBody(GenerateQrCodeSchema),
	QrController.generateQrCode,
);
router.post(
	"/generate-bulk",
	authorize(...INTERNAL_ROLES),
	validateBody(GenerateBulkQrCodesSchema),
	QrController.generateBulkQrCodes,
);

export default router;
