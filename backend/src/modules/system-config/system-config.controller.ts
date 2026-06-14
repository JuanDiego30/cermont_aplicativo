import {
	FeatureFlagKeyParamsSchema,
	ToggleFeatureFlagSchema,
	UpdateSystemSettingsSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import { SystemConfigService } from "./system-config.service";

export const SystemConfigController = {
	async getConfig(_req: Request, res: Response) {
		const config = await SystemConfigService.getConfig();
		res.status(200).json({ success: true, data: config });
	},

	async toggleFeatureFlag(req: Request, res: Response) {
		const user = requireUser(req);
		const { key } = FeatureFlagKeyParamsSchema.parse(req.params);
		const { enabled } = ToggleFeatureFlagSchema.parse(req.body);
		const config = await SystemConfigService.toggleFeatureFlag(key, enabled, user._id);
		res.status(200).json({ success: true, data: config });
	},

	async updateSettings(req: Request, res: Response) {
		const user = requireUser(req);
		const settings = UpdateSystemSettingsSchema.parse(req.body);
		const config = await SystemConfigService.updateSettings(settings, user._id);
		res.status(200).json({ success: true, data: config });
	},
};
