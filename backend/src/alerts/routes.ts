import { ALL_AUTHENTICATED_ROLES, INTERNAL_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../_shared/middlewares/auth.middleware";
import { authorize } from "../_shared/middlewares/authorize.middleware";
import { listAlerts, listOrderAlerts, listUserAlerts } from "./controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize(...ALL_AUTHENTICATED_ROLES), listAlerts);
router.get("/user/:userId", authorize(...INTERNAL_ROLES), listUserAlerts);
router.get("/order/:orderId", authorize(...INTERNAL_ROLES), listOrderAlerts);

export default router;
