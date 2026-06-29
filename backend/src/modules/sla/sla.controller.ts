import {
	EscalateSlaTrackingSchema,
	SlaTrackingIdParamsSchema,
	SlaTrackingQuerySchema,
	UpdateSlaConfigsSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import { SLAService } from "./sla.service";

export const SLAController = {
	async getConfigs(_req: Request, res: Response) {
		const configs = await SLAService.getConfigs();
		res.status(200).json({ success: true, data: configs });
	},

	async updateConfigs(req: Request, res: Response) {
		const user = requireUser(req);
		const { configs } = UpdateSlaConfigsSchema.parse(req.body);
		const updatedConfigs = await SLAService.updateConfigs(configs, user._id);
		res.status(200).json({ success: true, data: updatedConfigs });
	},

	async getDashboard(_req: Request, res: Response) {
		const data = await SLAService.getDashboard();
		res.status(200).json({ success: true, data });
	},

	async getTrackings(req: Request, res: Response) {
		const { status } = SlaTrackingQuerySchema.parse(req.query);
		const trackings = await SLAService.getActiveTrackings(status ? { status } : undefined);
		res.status(200).json({ success: true, data: trackings });
	},

	async escalate(req: Request, res: Response) {
		const { trackingId } = SlaTrackingIdParamsSchema.parse(req.params);
		const { reason } = EscalateSlaTrackingSchema.parse(req.body);
		const tracking = await SLAService.escalateTracking(trackingId, reason);
		res.status(200).json({ success: true, data: tracking });
	},

	async getWorkOrderStatus(req: Request, res: Response) {
		requireUser(req);
		const id = req.params.id as string;
		const data = await SLAService.getWorkOrderStatus(id);
		res.status(200).json({ success: true, data });
	},

	async getSummary(_req: Request, res: Response) {
		const data = await SLAService.getSyncSummary();
		res.status(200).json({ success: true, data });
	},
};
