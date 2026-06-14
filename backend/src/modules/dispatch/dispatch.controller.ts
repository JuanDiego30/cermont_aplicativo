import {
	AssignTechniciansInputSchema,
	DispatchGeocodeQuerySchema,
	OptimizeRouteInputSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { DispatchService } from "./dispatch.service";

export const DispatchController = {
	async optimizeRoute(req: Request, res: Response) {
		const { stops } = OptimizeRouteInputSchema.parse(req.body);
		const result = await DispatchService.optimizeRoute(stops);
		res.status(200).json({ success: true, data: result });
	},

	async assignTechnicians(req: Request, res: Response) {
		const { technicians, stops } = AssignTechniciansInputSchema.parse(req.body);
		const result = await DispatchService.assignTechnicians(technicians, stops);
		res.status(200).json({ success: true, data: result });
	},

	async geocode(req: Request, res: Response) {
		const { q } = DispatchGeocodeQuerySchema.parse(req.query);
		const result = await DispatchService.geocode(q);
		res.status(200).json({ success: true, data: result });
	},
};
