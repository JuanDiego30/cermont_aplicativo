import type { ReportTemplateSettings } from "@cermont/shared-types";
import { SystemSettings } from "../../admin/infrastructure/settings.model";

const REPORT_SETTINGS_KEY = "report_template_settings";

const DEFAULT_SETTINGS: ReportTemplateSettings = {
	companyName: "CERMONT S.A.S.",
	companyNit: "900.123.456-7",
	headerText: "INFORME TÉCNICO DE SERVICIOS",
	footerText: "CERMONT S.A.S. - Especialistas en Mantenimiento Industrial",
	primaryColor: "#0066FF",
};

type SystemSettingsDoc = {
	key: string;
	value: unknown;
	updatedBy: string;
};

/**
 * Get global report template settings.
 */
export async function getReportTemplateSettings(): Promise<ReportTemplateSettings> {
	const settings = await SystemSettings.findOne({ key: REPORT_SETTINGS_KEY });
	return (settings?.value as ReportTemplateSettings) || DEFAULT_SETTINGS;
}

/**
 * Update global report template settings.
 */
export async function updateReportTemplateSettings(
	payload: ReportTemplateSettings,
	actorId: string,
): Promise<ReportTemplateSettings> {
	const updateDoc: SystemSettingsDoc = {
		key: REPORT_SETTINGS_KEY,
		value: payload,
		updatedBy: actorId,
	};
	const settings = await SystemSettings.findOneAndUpdate(
		{ key: REPORT_SETTINGS_KEY },
		updateDoc,
		{ upsert: true, new: true },
	);
	return settings.value as ReportTemplateSettings;
}
