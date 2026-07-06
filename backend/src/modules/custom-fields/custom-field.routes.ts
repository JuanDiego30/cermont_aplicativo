import { CERMONT_ROLES, INTERNAL_ROLES } from "@cermont/domain";
import {
	CreateCustomFieldDefinitionDtoSchema,
	UpdateCustomFieldDefinitionDtoSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody } from "../../middlewares/validate";
import * as controller from "./custom-field.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize(...INTERNAL_ROLES), controller.list);
router.get("/:id", authorize(...INTERNAL_ROLES), controller.getById);
router.post(
	"/",
	authorize(CERMONT_ROLES.GERENTE, CERMONT_ROLES.ADMINISTRATIVO),
	validateBody(CreateCustomFieldDefinitionDtoSchema),
	controller.create,
);
router.put(
	"/:id",
	authorize(CERMONT_ROLES.GERENTE, CERMONT_ROLES.ADMINISTRATIVO),
	validateBody(UpdateCustomFieldDefinitionDtoSchema),
	controller.update,
);
router.delete("/:id", authorize(CERMONT_ROLES.GERENTE), controller.remove);

export default router;
