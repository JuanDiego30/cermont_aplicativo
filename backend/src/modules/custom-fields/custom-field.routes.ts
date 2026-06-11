import { INTERNAL_ROLES } from "@cermont/domain";
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
	authorize("gerente", "administrativo"),
	validateBody(CreateCustomFieldDefinitionDtoSchema),
	controller.create,
);
router.put(
	"/:id",
	authorize("gerente", "administrativo"),
	validateBody(UpdateCustomFieldDefinitionDtoSchema),
	controller.update,
);
router.delete("/:id", authorize("gerente"), controller.remove);

export default router;
