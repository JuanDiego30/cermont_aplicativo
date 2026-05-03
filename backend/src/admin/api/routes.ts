import { ArchiveOrdersQuerySchema, NoBodySchema } from "@cermont/shared-types";
import { Router } from "express";
import { sendPaginated, sendSuccess } from "../../_shared/common/interceptors/response.interceptor";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { validateBody, validateQuery } from "../../_shared/middlewares/validate";
import { archiveOldOrders, listArchivedOrders } from "../../orders/application/archive.service";

const router = Router();

router.use(authenticate);
router.use(authorize("manager", "administrator"));

router.post(
	"/archive",
	authorize("manager", "administrator"),
	validateBody(NoBodySchema),
	async (_req, res) => {
		const result = await archiveOldOrders();
		sendSuccess(res, result);
	},
);

router.get(
	"/archived-orders",
	authorize("manager", "administrator"),
	validateQuery(ArchiveOrdersQuerySchema),
	async (req, res) => {
		const query = ArchiveOrdersQuerySchema.parse(req.query);
		const result = await listArchivedOrders({
			...(query.search ? { search: query.search } : {}),
			...(query.period ? { period: query.period } : {}),
			page: query.page,
			limit: query.limit,
		});
		sendPaginated(res, result.data, result.total, result.page, result.limit);
	},
);

export default router;
