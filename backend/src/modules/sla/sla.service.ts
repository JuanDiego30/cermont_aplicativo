import { MANAGEMENT_ROLES } from "@cermont/domain";
import type { SlaConfig, SlaPriority, SlaStatus } from "@cermont/shared-types";
import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { User } from "../../models";
import { createNotification } from "../notifications/notification.service";
import { SLAConfigModel, type SLATrackingDocument, SLATrackingModel } from "./sla.model";

const log = createLogger("sla-service");
const SLA_WORKER_INTERVAL_MS = 60_000;

const DEFAULT_SLA_CONFIGS: SlaConfig[] = [
	{
		serviceType: "*",
		priority: "critical",
		responseHours: 2,
		resolutionHours: 8,
		escalationHours: 4,
		description: "Emergencia - atencion inmediata",
		isActive: true,
	},
	{
		serviceType: "*",
		priority: "high",
		responseHours: 4,
		resolutionHours: 24,
		escalationHours: 8,
		description: "Urgente - mismo dia",
		isActive: true,
	},
	{
		serviceType: "*",
		priority: "medium",
		responseHours: 8,
		resolutionHours: 48,
		escalationHours: 16,
		description: "Normal - dos dias",
		isActive: true,
	},
	{
		serviceType: "*",
		priority: "low",
		responseHours: 24,
		resolutionHours: 72,
		escalationHours: 48,
		description: "Programada - tres dias",
		isActive: true,
	},
];

interface CreateTrackingInput {
	serviceCaseId: string;
	clientId?: string;
	serviceType: string;
	priority: SlaPriority;
	assignedAt?: Date;
}

type SlaLookupState = { status: "found"; config: SlaConfig } | { status: "not_found" };

function normalizeServiceType(value: string): string {
	return value
		.normalize("NFD")
		.replaceAll(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase();
}

function addHours(date: Date, hours: number): Date {
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function notifyStatusChange(
	tracking: SLATrackingDocument,
	status: "at_risk" | "breached",
): Promise<void> {
	const recipients = await User.find({
		role: { $in: MANAGEMENT_ROLES },
		isActive: true,
	})
		.select("_id role email")
		.lean();
	const title = status === "breached" ? "SLA incumplido" : "SLA en riesgo";
	const body =
		status === "breached"
			? `El caso ${tracking.serviceCaseId.toString()} supero su fecha limite de resolucion.`
			: `El caso ${tracking.serviceCaseId.toString()} alcanzo el umbral de escalamiento.`;

	await Promise.all(
		recipients.map((recipient) =>
			createNotification({
				recipientUserId: recipient._id.toString(),
				recipientRole: recipient.role,
				recipientEmail: recipient.email,
				type: status === "breached" ? "SYSTEM_ALERT" : "DEADLINE_WARNING",
				priority: status === "breached" ? "critical" : "high",
				title,
				body,
				relatedEntity: {
					entityType: "ServiceCase",
					entityId: tracking.serviceCaseId.toString(),
				},
				channels: ["in_app"],
				metadata: {
					slaStatus: status,
					trackingId: tracking._id.toString(),
				},
			}),
		),
	);
}

export const SLAService = {
	async getConfigs(): Promise<SlaConfig[]> {
		let config = await SLAConfigModel.findOne();
		if (!config) {
			config = await SLAConfigModel.create({ configs: DEFAULT_SLA_CONFIGS });
		}
		return config.configs;
	},

	async updateConfigs(configs: SlaConfig[], userId: string): Promise<SlaConfig[]> {
		const doc = await SLAConfigModel.findOneAndUpdate(
			{},
			{ $set: { configs, updatedBy: new Types.ObjectId(userId) } },
			{ upsert: true, returnDocument: "after", runValidators: true },
		);
		return doc.configs;
	},

	async findSLA(
		serviceType: string,
		priority: SlaPriority,
		clientId?: string,
	): Promise<SlaLookupState> {
		const normalizedType = normalizeServiceType(serviceType);
		const configs = await this.getConfigs();
		const activeConfigs = configs.filter(
			(config) => config.isActive && config.priority === priority,
		);
		const config =
			activeConfigs.find(
				(candidate) =>
					candidate.clientId === clientId &&
					normalizeServiceType(candidate.serviceType) === normalizedType,
			) ??
			activeConfigs.find(
				(candidate) =>
					!candidate.clientId && normalizeServiceType(candidate.serviceType) === normalizedType,
			) ??
			activeConfigs.find((candidate) => !candidate.clientId && candidate.serviceType === "*");
		return config ? { status: "found", config } : { status: "not_found" };
	},

	async createTrackingForServiceCase(
		input: CreateTrackingInput,
	): Promise<{ status: "created" | "existing" | "not_configured" }> {
		const existing = await SLATrackingModel.exists({
			serviceCaseId: input.serviceCaseId,
		});
		if (existing) {
			return { status: "existing" };
		}
		const lookup = await this.findSLA(input.serviceType, input.priority, input.clientId);
		if (lookup.status === "not_found") {
			log.warn("No active SLA configuration matched service case", {
				serviceCaseId: input.serviceCaseId,
				serviceType: input.serviceType,
				priority: input.priority,
			});
			return { status: "not_configured" };
		}
		const assignedAt = input.assignedAt ?? new Date();
		await SLATrackingModel.create({
			serviceCaseId: new Types.ObjectId(input.serviceCaseId),
			serviceType: input.serviceType,
			priority: input.priority,
			assignedAt,
			responseDeadline: addHours(assignedAt, lookup.config.responseHours),
			escalationDeadline: addHours(assignedAt, lookup.config.escalationHours),
			resolutionDeadline: addHours(assignedAt, lookup.config.resolutionHours),
			status: "active",
			currentStep: "step_01_work_request",
			escalationLevel: 0,
			notifiedAt: [],
		});
		return { status: "created" };
	},

	async recordWorkflowProgress(
		serviceCaseId: string,
		currentStep: string,
		currentStage: string,
	): Promise<{ status: "updated" | "not_tracked" }> {
		const tracking = await SLATrackingModel.findOne({ serviceCaseId });
		if (!tracking) {
			return { status: "not_tracked" };
		}
		const now = new Date();
		tracking.currentStep = currentStep;
		if (!tracking.firstResponseAt && currentStep !== "step_01_work_request") {
			tracking.firstResponseAt = now;
		}
		if (
			["technical_closure", "administrative_closure", "paid", "archived"].includes(currentStage)
		) {
			tracking.status = "resolved";
			tracking.resolvedAt = now;
		}
		await tracking.save();
		return { status: "updated" };
	},

	async refreshTrackingStatuses(now = new Date()): Promise<number> {
		const trackings = await SLATrackingModel.find({
			status: { $in: ["active", "at_risk"] },
		});
		let changed = 0;
		for (const tracking of trackings) {
			const nextStatus: SlaStatus =
				now >= tracking.resolutionDeadline
					? "breached"
					: now >= tracking.escalationDeadline
						? "at_risk"
						: tracking.status;
			if (nextStatus === tracking.status) {
				continue;
			}
			tracking.status = nextStatus;
			if (nextStatus === "breached") {
				tracking.breachReason = "Resolution deadline exceeded";
			}
			await tracking.save();
			if (nextStatus === "at_risk" || nextStatus === "breached") {
				await notifyStatusChange(tracking, nextStatus);
			}
			changed += 1;
		}
		return changed;
	},

	async getActiveTrackings(filters?: { status?: SlaStatus }) {
		await this.refreshTrackingStatuses();
		const query = filters?.status ? { status: filters.status } : {};
		return SLATrackingModel.find(query)
			.sort({ createdAt: -1 })
			.limit(100)
			.populate("serviceCaseId", "code clientName")
			.lean();
	},

	async getDashboard() {
		await this.refreshTrackingStatuses();
		const [active, breached, atRisk, resolved, escalated, total] = await Promise.all([
			SLATrackingModel.countDocuments({ status: "active" }),
			SLATrackingModel.countDocuments({ status: "breached" }),
			SLATrackingModel.countDocuments({ status: "at_risk" }),
			SLATrackingModel.countDocuments({ status: "resolved" }),
			SLATrackingModel.countDocuments({ status: "escalated" }),
			SLATrackingModel.countDocuments(),
		]);
		const breaching = await SLATrackingModel.find({
			status: { $in: ["breached", "escalated"] },
		})
			.sort({ updatedAt: -1 })
			.limit(10)
			.populate("serviceCaseId", "code clientName")
			.lean();
		const settled = resolved + breached + escalated;
		const safeAtRisk = atRisk > active ? active : atRisk;
		return {
			summary: {
				active,
				breached,
				atRisk: safeAtRisk,
				resolved,
				escalated,
				total,
				complianceRate: settled > 0 ? Math.round((resolved / settled) * 100) : null,
			},
			breaching,
		};
	},

	async escalateTracking(trackingId: string, reason: string) {
		const tracking = await SLATrackingModel.findById(trackingId);
		if (!tracking) {
			throw new AppError("El seguimiento SLA no existe", 404, "SLA_TRACKING_NOT_FOUND");
		}
		tracking.status = "escalated";
		tracking.escalationLevel += 1;
		tracking.breachReason = reason;
		await tracking.save();
		log.warn("SLA escalation", {
			trackingId,
			level: tracking.escalationLevel,
			reason,
		});
		return tracking;
	},

	async getWorkOrderStatus(workOrderId: string) {
		const tracking = await SLATrackingModel.findOne({
			serviceCaseId: workOrderId,
		})
			.sort({ createdAt: -1 })
			.lean();

		if (!tracking) {
			return {
				status: "not_tracked",
				message: "No SLA tracking found for this work order",
			};
		}

		const now = new Date();
		const timeRemaining = {
			response: Math.max(0, tracking.responseDeadline.getTime() - now.getTime()),
			escalation: Math.max(0, tracking.escalationDeadline.getTime() - now.getTime()),
			resolution: Math.max(0, tracking.resolutionDeadline.getTime() - now.getTime()),
		};

		return {
			status: tracking.status,
			priority: tracking.priority,
			currentStep: tracking.currentStep,
			escalationLevel: tracking.escalationLevel,
			deadlines: {
				responseDeadline: tracking.responseDeadline.toISOString(),
				escalationDeadline: tracking.escalationDeadline.toISOString(),
				resolutionDeadline: tracking.resolutionDeadline.toISOString(),
			},
			timeRemainingMs: timeRemaining,
			firstResponseAt: tracking.firstResponseAt?.toISOString() ?? "",
			resolvedAt: tracking.resolvedAt?.toISOString() ?? "",
			breachReason: tracking.breachReason ?? "",
			trackingId: tracking._id.toString(),
		};
	},

	async getSyncSummary() {
		await this.refreshTrackingStatuses();
		const [total, active, breached, atRisk, resolved, escalated] = await Promise.all([
			SLATrackingModel.countDocuments(),
			SLATrackingModel.countDocuments({ status: "active" }),
			SLATrackingModel.countDocuments({ status: "breached" }),
			SLATrackingModel.countDocuments({ status: "at_risk" }),
			SLATrackingModel.countDocuments({ status: "resolved" }),
			SLATrackingModel.countDocuments({ status: "escalated" }),
		]);

		const settled = resolved + breached + escalated;

		return {
			summary: {
				total,
				active,
				breached,
				atRisk,
				resolved,
				escalated,
				complianceRate: settled > 0 ? Math.round((resolved / settled) * 100) : null,
			},
			generatedAt: new Date().toISOString(),
		};
	},
};

export function startSlaWorker(): () => void {
	log.info("Starting SLA deadline worker", {
		intervalMs: SLA_WORKER_INTERVAL_MS,
	});
	const timer = setInterval(() => {
		void SLAService.refreshTrackingStatuses().catch((error) => {
			log.error("SLA deadline worker cycle failed", {
				error: error instanceof Error ? error.message : String(error),
			});
		});
	}, SLA_WORKER_INTERVAL_MS);
	timer.unref();
	return () => {
		clearInterval(timer);
		log.info("SLA deadline worker stopped");
	};
}
