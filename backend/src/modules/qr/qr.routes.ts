import { INTERNAL_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as QrController from "./qr.controller";

const router = Router();

router.use(authenticate);

router.post("/generate", authorize(...INTERNAL_ROLES), QrController.generateQrCode);
router.post("/generate-bulk", authorize(...INTERNAL_ROLES), QrController.generateBulkQrCodes);

export default router;
