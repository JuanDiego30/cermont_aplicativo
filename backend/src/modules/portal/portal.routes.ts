import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import * as portalController from "./portal.controller";

const router = Router();

router.use(authenticate);
router.use(authorize("cliente"));

router.get("/dashboard", portalController.getDashboard);
router.get("/orders", portalController.listOrders);
router.get("/orders/:id", portalController.getOrderDetail);
router.get("/invoices", portalController.listInvoices);
router.get("/proposals", portalController.listProposals);

export default router;
