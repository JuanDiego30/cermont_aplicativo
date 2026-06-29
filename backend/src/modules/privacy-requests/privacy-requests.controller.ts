import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import { privacyRequestsService } from "./privacy-requests.service";

export const privacyRequestsController = {
	async list(req: Request, res: Response) {
		const user = requireUser(req);
		const requests = await privacyRequestsService.list(user._id?.toString());
		res.json({ success: true, data: requests });
	},

	async get(req: Request, res: Response) {
		const id = req.params.id as string;
		const request = await privacyRequestsService.get(id);
		if (!request) {
			res
				.status(404)
				.json({ success: false, error: { code: "NOT_FOUND", message: "Solicitud no encontrada" } });
			return;
		}
		res.json({ success: true, data: request });
	},

	async create(req: Request, res: Response) {
		const user = requireUser(req);
		const request = await privacyRequestsService.create({
			userId: user._id?.toString() ?? "unknown",
			type: req.body.type,
			description: req.body.description,
		});
		res.status(201).json({ success: true, data: request });
	},
};
