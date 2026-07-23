import type { FeatureFlag, ReminderRule, UpdateSystemSettings } from "@cermont/shared-types";
import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError";
import { createAuditLog } from "../audit/audit.service";
import { SystemConfig, type SystemConfigDocument } from "./system-config.model";

const DEFAULT_FLAGS: FeatureFlag[] = [
	{
		key: "enable_offline_sync",
		label: "Sincronización offline",
		description: "Permite a los técnicos trabajar sin conexión",
		enabled: true,
		category: "field",
	},
	{
		key: "enable_auto_reports",
		label: "Reportes automáticos",
		description: "Genera informes al completar la ejecución",
		enabled: true,
		category: "general",
	},
	{
		key: "enable_dian_invoicing",
		label: "Facturación electrónica DIAN",
		description: "Habilita el envío de facturas a DIAN",
		enabled: false,
		category: "billing",
	},
	{
		key: "enable_erp_integration",
		label: "Integración ERP",
		description: "Habilita el envío de datos a sistemas ERP externos",
		enabled: false,
		category: "billing",
	},
	{
		key: "enable_email_notifications",
		label: "Notificaciones por email",
		description: "Envia notificaciones por correo electronico",
		enabled: true,
		category: "notifications",
	},
	{
		key: "enable_sms_notifications",
		label: "Notificaciones SMS",
		description: "Envia notificaciones por mensaje de texto",
		enabled: false,
		category: "notifications",
	},
	{
		key: "enable_two_factor_auth",
		label: "Autenticación de dos factores",
		description: "Reserva el control para el flujo de autenticacion reforzada",
		enabled: false,
		category: "security",
	},
	{
		key: "enable_audit_log_cleanup",
		label: "Limpieza automática de auditoría",
		description: "Habilita la política programada de retención de auditoría",
		enabled: false,
		category: "security",
	},
	{
		key: "enable_advanced_cost_analysis",
		label: "Análisis avanzado de costos",
		description: "Habilita reportes detallados de variación de costos",
		enabled: false,
		category: "experimental",
	},
	{
		key: "enable_qr_code_scanning",
		label: "Escaneo de códigos QR",
		description: "Permite escanear códigos QR en activos y órdenes",
		enabled: true,
		category: "field",
	},
	{
		key: "enable_barcode_inventory",
		label: "Escaneo de códigos de barras",
		description: "Habilita búsqueda de activos mediante códigos de barras",
		enabled: true,
		category: "field",
	},
	{
		key: "enable_cermont_ai",
		label: "Asistente Cermont AI",
		description: "Habilita el asistente operativo cuando el proveedor está configurado",
		enabled: true,
		category: "experimental",
	},
];

const DEFAULT_REMINDER_RULES: ReminderRule[] = [
	{
		type: "certification_expiring",
		enabled: true,
		scheduleMode: "days_before",
		thresholds: [30, 15, 7, 1],
		channels: ["in_app", "email"],
		recipientRoles: ["gerente", "residente", "hes"],
	},
	{
		type: "maintenance_due",
		enabled: true,
		scheduleMode: "days_before",
		thresholds: [7, 3, 1],
		channels: ["in_app"],
		recipientRoles: ["gerente", "residente", "hes"],
	},
	{
		type: "payment_overdue",
		enabled: true,
		scheduleMode: "days_after",
		thresholds: [1, 3, 7],
		channels: ["in_app", "email"],
		recipientRoles: ["gerente", "coord_administrativo", "auxiliar_contable"],
	},
	{
		type: "sla_breach_warning",
		enabled: true,
		scheduleMode: "hours_before",
		thresholds: [2],
		channels: ["in_app"],
		recipientRoles: ["gerente", "residente"],
	},
	{
		type: "invoice_due",
		enabled: true,
		scheduleMode: "days_before",
		thresholds: [7, 3, 1],
		channels: ["in_app", "email"],
		recipientRoles: ["gerente", "coord_administrativo", "auxiliar_contable"],
	},
	{
		type: "stale_case",
		enabled: true,
		scheduleMode: "inactivity_days",
		thresholds: [7, 14, 30],
		channels: ["in_app"],
		recipientRoles: ["gerente", "residente"],
	},
];

const DEFAULT_CONFIG = {
	singletonKey: "system" as const,
	featureFlags: DEFAULT_FLAGS,
	maintenanceMode: false,
	maintenanceMessage: "",
	maxUploadSizeMb: 10,
	sessionTimeoutMinutes: 480,
	defaultLanguage: "es" as const,
	allowedFileTypes: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx"],
	reminderWorkerEnabled: true,
	reminderWorkerIntervalMinutes: 5,
	reminderRules: DEFAULT_REMINDER_RULES,
};

function mergeMissingDefaults(config: SystemConfigDocument): boolean {
	let changed = false;
	const featureKeys = new Set(config.featureFlags.map((flag) => flag.key));
	for (const defaultFlag of DEFAULT_FLAGS) {
		if (!featureKeys.has(defaultFlag.key)) {
			config.featureFlags.push(defaultFlag);
			changed = true;
		}
	}
	const reminderTypes = new Set(config.reminderRules.map((rule) => rule.type));
	for (const defaultRule of DEFAULT_REMINDER_RULES) {
		if (!reminderTypes.has(defaultRule.type)) {
			config.reminderRules.push(defaultRule);
			changed = true;
		}
	}
	return changed;
}

export const SystemConfigService = {
	async getConfig(): Promise<SystemConfigDocument> {
		const config = await SystemConfig.findOneAndUpdate(
			{ singletonKey: "system" },
			{ $setOnInsert: DEFAULT_CONFIG },
			{
				upsert: true,
				returnDocument: "after",
				setDefaultsOnInsert: true,
				runValidators: true,
			},
		);
		if (!config) {
			throw new AppError(
				"No se pudo inicializar la configuracion del sistema",
				500,
				"SYSTEM_CONFIG_INITIALIZATION_FAILED",
			);
		}
		if (mergeMissingDefaults(config)) {
			await config.save();
		}
		return config;
	},

	async toggleFeatureFlag(key: string, enabled: boolean, userId: string) {
		const config = await this.getConfig();
		const flag = config.featureFlags.find((candidate) => candidate.key === key);
		if (!flag) {
			throw new AppError(`Feature flag '${key}' no encontrada`, 404, "FLAG_NOT_FOUND");
		}
		const previousValue = flag.enabled;
		flag.enabled = enabled;
		config.updatedBy = new Types.ObjectId(userId);
		await config.save();
		await createAuditLog({
			userId,
			action: "SYSTEM_FEATURE_FLAG_UPDATED",
			entity: "SystemConfig",
			entityId: config._id.toString(),
			before: { key, enabled: previousValue },
			after: { key, enabled },
		});
		return config;
	},

	async updateSettings(data: UpdateSystemSettings, userId: string) {
		const config = await this.getConfig();
		const before = {
			maintenanceMode: config.maintenanceMode,
			reminderWorkerEnabled: config.reminderWorkerEnabled,
			reminderWorkerIntervalMinutes: config.reminderWorkerIntervalMinutes,
		};
		if (data.maintenanceMode !== undefined) {
			config.maintenanceMode = data.maintenanceMode;
		}
		if (data.maintenanceMessage !== undefined) {
			config.maintenanceMessage = data.maintenanceMessage;
		}
		if (data.maxUploadSizeMb !== undefined) {
			config.maxUploadSizeMb = data.maxUploadSizeMb;
		}
		if (data.sessionTimeoutMinutes !== undefined) {
			config.sessionTimeoutMinutes = data.sessionTimeoutMinutes;
		}
		if (data.defaultLanguage !== undefined) {
			config.defaultLanguage = data.defaultLanguage;
		}
		if (data.allowedFileTypes !== undefined) {
			config.allowedFileTypes = data.allowedFileTypes;
		}
		if (data.reminderWorkerEnabled !== undefined) {
			config.reminderWorkerEnabled = data.reminderWorkerEnabled;
		}
		if (data.reminderWorkerIntervalMinutes !== undefined) {
			config.reminderWorkerIntervalMinutes = data.reminderWorkerIntervalMinutes;
		}
		if (data.reminderRules !== undefined) {
			config.reminderRules = data.reminderRules;
		}
		config.updatedBy = new Types.ObjectId(userId);
		await config.save();
		await createAuditLog({
			userId,
			action: "SYSTEM_SETTINGS_UPDATED",
			entity: "SystemConfig",
			entityId: config._id.toString(),
			before,
			after: {
				maintenanceMode: config.maintenanceMode,
				reminderWorkerEnabled: config.reminderWorkerEnabled,
				reminderWorkerIntervalMinutes: config.reminderWorkerIntervalMinutes,
			},
		});
		return config;
	},

	async isFeatureEnabled(key: string): Promise<boolean> {
		const config = await this.getConfig();
		const flag = config.featureFlags.find((candidate) => candidate.key === key);
		return flag?.enabled ?? false;
	},
};
