/**
 * Jobs Service — Scheduled expiry and reminder workers
 *
 * Runs periodic checks for:
 * - Certification expirations (SOAT, technomechanical, tool calibrations)
 * - Maintenance due dates
 * - Payment overdue
 * - Invoice due dates
 * - Stale service cases
 */

import { createLogger } from "../../common/utils/logger";
import { Invoice } from "../../models/Invoice";
import { Payment } from "../../models/Payment";
import { ServiceCase } from "../../models/ServiceCase";
import { Tool } from "../../models/Tool";
import { VehicleModel } from "../../models/Vehicle";
import { createNotification } from "../notifications/notification.service";
import { SystemConfig } from "../system-config/system-config.model";

const log = createLogger("jobs-service");

const MS_IN_A_DAY = 1000 * 60 * 60 * 24;
const NOW = (): Date => new Date();

let workerTimer: ReturnType<typeof setInterval> | null = null;

interface JobConfig {
	enabled: boolean;
	intervalMinutes: number;
}

function getWorkerConfig(): JobConfig {
	return {
		enabled: true,
		intervalMinutes: 60, // Check every hour by default
	};
}

// ─── Worker Lifecycle ─────────────────────────────────────────────────

export function startWorker(): void {
	const config = getWorkerConfig();
	if (!config.enabled) {
		log.info("Reminder worker disabled by config");
		return;
	}
	if (workerTimer) {
		clearInterval(workerTimer);
	}

	log.info(`Starting reminder worker (every ${config.intervalMinutes} min)`);
	void runAllChecks(); // Run immediately on startup
	workerTimer = setInterval(() => void runAllChecks(), config.intervalMinutes * 60 * 1000);
}

export function stopWorker(): void {
	if (workerTimer) {
		clearInterval(workerTimer);
		workerTimer = null;
		log.info("Reminder worker stopped");
	}
}

export async function runAllChecks(): Promise<void> {
	try {
		const config = await SystemConfig.findOne({ singletonKey: "system" }).lean();
		if (config && !config.reminderWorkerEnabled) {
			return;
		}

		const results = await Promise.allSettled([
			checkCertificationExpirations(),
			checkMaintenanceDue(),
			checkInvoiceDue(),
			checkPaymentOverdue(),
			checkStaleCases(),
		]);

		for (const result of results) {
			if (result.status === "rejected") {
				log.error("Job check failed", { error: String(result.reason) });
			}
		}
	} catch (error) {
		log.error("Reminder worker run failed", { error: String(error) });
	}
}

// ─── Individual Job Checks ─────────────────────────────────────────────

export async function checkCertificationExpirations(): Promise<void> {
	log.info("Checking certification expirations...");

	const now = new Date();
	const thirtyDaysFromNow = new Date(now.getTime() + 30 * MS_IN_A_DAY);

	// Vehicle documents expiring within 30 days
	const expiringVehicles = await VehicleModel.find({
		$or: [
			{ soatExpiry: { $lte: thirtyDaysFromNow, $gte: now } },
			{ technoMechanicalExpiry: { $lte: thirtyDaysFromNow, $gte: now } },
			{ insuranceExpiry: { $lte: thirtyDaysFromNow, $gte: now } },
		],
	})
		.select("plate soatExpiry technoMechanicalExpiry insuranceExpiry")
		.lean();

	for (const vehicle of expiringVehicles) {
		const daysLeft = vehicle.soatExpiry
			? Math.ceil((vehicle.soatExpiry.getTime() - now.getTime()) / MS_IN_A_DAY)
			: 0;

		await createNotification({
			recipientUserId: "000000000000000000000000", // system user placeholder
			recipientRole: "administrativo",
			type: "DEADLINE_WARNING",
			title: `Documentos de ${vehicle.plate} próximos a vencer`,
			body: `El SOAT o la tecnomecánica del vehículo ${vehicle.plate} vence en ${daysLeft} días.`,
			relatedEntity: { entityType: "vehicle", entityId: vehicle._id.toString() },
			priority: "high",
			channels: ["in_app", "email"],
			dedupeKey: `cert-vehicle-${vehicle._id.toString()}-${now.toISOString().slice(0, 10)}`,
		});
	}

	// Tool certifications expiring within 30 days
	const expiringTools = await Tool.find({
		"certifications.expiresAt": { $lte: thirtyDaysFromNow, $gte: now },
		"certifications.status": "valid",
	})
		.select("name certifications")
		.lean();

	for (const tool of expiringTools) {
		const expiringCerts = tool.certifications.filter(
			(c) => c.expiresAt <= thirtyDaysFromNow && c.expiresAt >= now && c.status === "valid",
		);

		for (const cert of expiringCerts) {
			const daysLeft = Math.ceil((cert.expiresAt.getTime() - now.getTime()) / MS_IN_A_DAY);
			await createNotification({
				recipientUserId: "000000000000000000000000",
				recipientRole: "supervisor",
				type: "DEADLINE_WARNING",
				title: `Certificación de ${tool.name} próxima a vencer`,
				body: `La certificación "${cert.name}" de ${tool.name} vence en ${daysLeft} días.`,
				relatedEntity: { entityType: "tool", entityId: tool._id.toString() },
				priority: "high",
				channels: ["in_app", "email"],
				dedupeKey: `cert-tool-${tool._id.toString()}-${cert.certificationId}-${now.toISOString().slice(0, 10)}`,
			});
		}
	}

	log.info(
		`Certification check complete: ${expiringVehicles.length} vehicles, ${expiringTools.length} tools`,
	);
}

export async function checkMaintenanceDue(): Promise<void> {
	log.info("Checking maintenance schedules...");

	const now = new Date();
	// Tools in maintenance status that haven't been updated recently
	const toolsInMaintenance = await Tool.countDocuments({
		status: "maintenance",
	});

	// Vehicles with no maintenance record in 90 days
	const ninetyDaysAgo = new Date(now.getTime() - 90 * MS_IN_A_DAY);
	const vehiclesNeedingMaintenance = await VehicleModel.countDocuments({
		$or: [{ lastMaintenanceAt: { $lt: ninetyDaysAgo } }, { lastMaintenanceAt: { $exists: false } }],
		status: { $in: ["active", "maintenance"] },
	});

	if (vehiclesNeedingMaintenance > 0) {
		await createNotification({
			recipientUserId: "000000000000000000000000",
			recipientRole: "residente",
			type: "DEADLINE_WARNING",
			title: "Mantenimiento de vehículos pendiente",
			body: `${vehiclesNeedingMaintenance} vehículos requieren mantenimiento preventivo (más de 90 días sin registro).`,
			priority: "medium",
			channels: ["in_app", "email"],
			dedupeKey: `maintenance-vehicle-overdue-${now.toISOString().slice(0, 10)}`,
		});
	}

	log.info(
		`Maintenance check complete: ${toolsInMaintenance} tools in maintenance, ${vehiclesNeedingMaintenance} vehicles overdue`,
	);
}

export async function checkInvoiceDue(): Promise<void> {
	log.info("Checking invoice due dates...");

	const now = new Date();
	const sevenDaysFromNow = new Date(now.getTime() + 7 * MS_IN_A_DAY);

	const dueInvoices = await Invoice.find({
		status: { $in: ["issued", "sent", "approved", "accepted"] },
		dueDate: { $exists: true, $lte: sevenDaysFromNow },
	})
		.select("code dueDate totalAmount")
		.lean();

	for (const invoice of dueInvoices) {
		if (!invoice.dueDate) {
			continue;
		}
		const isOverdue = invoice.dueDate < now;
		const daysFromNow = Math.ceil((invoice.dueDate.getTime() - now.getTime()) / MS_IN_A_DAY);
		const label = isOverdue
			? `Factura ${invoice.code} vencida hace ${Math.abs(daysFromNow)} días`
			: `Factura ${invoice.code} vence en ${daysFromNow} días`;

		await createNotification({
			recipientUserId: "000000000000000000000000",
			recipientRole: "administrativo",
			type: isOverdue ? "PAYMENT_RECEIVED" : "DEADLINE_WARNING",
			title: label,
			body: `La factura ${invoice.code} por $${invoice.totalAmount.toLocaleString("es-CO")} COP está ${isOverdue ? "vencida" : "próxima a vencer"}.`,
			relatedEntity: { entityType: "invoice", entityId: invoice._id.toString() },
			priority: isOverdue ? "critical" : "high",
			channels: ["in_app", "email"],
			dedupeKey: `invoice-${invoice._id.toString()}-${now.toISOString().slice(0, 10)}`,
		});
	}

	log.info(`Invoice due check complete: ${dueInvoices.length} invoices due or overdue`);
}

export async function checkPaymentOverdue(): Promise<void> {
	log.info("Checking overdue payments...");
	const now = NOW();

	const overduePayments = await Payment.countDocuments({
		status: { $in: ["due", "recorded"] },
		dueDate: { $lt: now },
	});

	if (overduePayments > 0) {
		await createNotification({
			recipientUserId: "000000000000000000000000",
			recipientRole: "administrativo",
			type: "PAYMENT_RECEIVED",
			title: `${overduePayments} pago(s) vencido(s)`,
			body: `${overduePayments} pago(s) están vencidos y requieren gestión de cobranza.`,
			priority: "high",
			channels: ["in_app", "email"],
			dedupeKey: `payment-overdue-${now.toISOString().slice(0, 10)}`,
		});
	}

	log.info(`Payment overdue check complete: ${overduePayments} overdue`);
}

export async function checkStaleCases(): Promise<void> {
	log.info("Checking stale service cases...");

	const thirtyDaysAgo = new Date(NOW().getTime() - 30 * MS_IN_A_DAY);

	const staleCases = await ServiceCase.countDocuments({
		currentStage: { $nin: ["paid", "archived", "cancelled"] },
		updatedAt: { $lt: thirtyDaysAgo },
	});

	if (staleCases > 0) {
		await createNotification({
			recipientUserId: "000000000000000000000000",
			recipientRole: "gerente",
			type: "SYSTEM_ALERT",
			title: `${staleCases} caso(s) estancado(s)`,
			body: `${staleCases} caso(s) de servicio no han tenido actividad en más de 30 días. Revise el pipeline operativo.`,
			priority: "low",
			channels: ["in_app"],
			dedupeKey: `stale-cases-${NOW().toISOString().slice(0, 10)}`,
		});
	}

	log.info(`Stale cases check complete: ${staleCases} stale cases`);
}
