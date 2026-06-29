import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { privacyRequestsController } from "./privacy-requests.controller";

const router = Router();

router.get("/", authenticate, privacyRequestsController.list);
router.get("/:id", authenticate, privacyRequestsController.get);
router.post("/", authenticate, privacyRequestsController.create);

export default router;
