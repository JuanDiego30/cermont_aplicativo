import type { UserRole } from "@cermont/domain";
import { Types } from "mongoose";
import { createLogger } from "../../common/utils/logger";
import {
	Notification as NotificationModel,
	NotificationOutbox,
	ServiceCase,
	User,
} from "../../models";
import { registerGateway } from "../../services/messaging";
import { emailGateway } from "../../services/messaging/email.gateway";
import { compileNotificationTemplate } from "../../services/messaging/notification-templates";
import { smsGateway } from "../../services/messaging/sms.gateway";

const log = createLogger("notification-service");

// Register messaging gateways on module load
registerGateway(emailGateway);
registerGateway(smsGateway);

export type NotificationChannel = "in_app" | "email" | "sms";

export interface NotificationOptions {
	recipientUserId: string;
	recipientRole?: UserRole;
	recipientEmail?: string;
	recipientPhone?: string;
	type: string;
	priority?: "low" | "medium" | "high" | "critical";
	title: string;
	body: string;
	relatedEntity?: {
		entityType: string;
		entityId: string;
	};
	channels?: NotificationChannel[];
	templateName?: string;
	templateVariables?: Record<string, string>;
	metadata?: Record<string, unknown>;
}

const RETRY_DELAYS_MS = [1 * 60 * 1000, 5 * 60 * 1000, 15 * 60 * 1000] as const;

const DB_STEP_TO_DOMAIN_STATE: Record<string, string> = {
	step_01_work_request: "work_request",
	step_02_site_visit: "site_visit",
	step_03_proposal: "proposal",
	step_04_purchase_order: "purchase_order",
	step_05_planning: "planning",
	step_06_execution: "execution",
	step_07_technical_report: "technical_report",
	step_08_delivery_record: "delivery_record",
	step_09_client_signature: "client_signature",
	step_10_ses_submission: "ses",
	step_11_ses_approval: "ses_approved",
	step_12_invoice_submission: "invoice",
	step_13_invoice_approval: "invoice_approval",
	step_14_payment_closure: "payment",
};

export function dbStepToDomainState(dbStep: string): string {
	return DB_STEP_TO_DOMAIN_STATE[dbStep] ?? "pending";
}

const WORKER_INTERVAL_MS = 30 * 1_000;

export function getRolesToNotifyForStep(stepCode: string): UserRole[] {
	const state = stepCode.startsWith("step_") ? dbStepToDomainState(stepCode) : stepCode;
	switch (state) {
		case "site_visit":
			return ["residente", "supervisor", "tecnico"];
		case "proposal":
			return ["gerente", "administrativo"];
		case "purchase_order":
			return ["gerente", "administrativo", "cliente"];
		case "planning":
			return ["residente", "supervisor", "gerente"];
		case "execution":
			return ["supervisor", "tecnico", "operador"];
		case "technical_report":
			return ["supervisor", "gerente"];
		case "delivery_record":
			return ["tecnico", "supervisor"];
		case "client_signature":
			return ["supervisor", "gerente"];
		case "ses":
		case "ses_approved":
			return ["gerente"];
		case "invoice":
			return ["administrativo", "gerente"];
		case "invoice_approval":
			return ["gerente", "cliente"];
		case "payment":
			return ["administrativo", "gerente"];
		case "closed":
			return ["gerente", "residente", "administrativo"];
		default:
			return ["gerente"];
	}
}

// ─── Channel-specific sending logic ────────────────────────────────────────

async function sendEmail(
	title: string,
	body: string,
	recipient: { email?: string },
): Promise<{ status: string; error?: string }> {
	if (!recipient.email) {
		return { status: "failed", error: "No email address" };
	}
	const { getGateway } = await import("../../services/messaging/index.js");
	const gateway = getGateway("email");
	if (!gateway) {
		return { status: "failed", error: "Email gateway not available" };
	}
	const result = await gateway.send({ to: recipient.email as string, subject: title, body });
	return { status: result.success ? "sent" : "failed", error: result.error };
}

async function sendSms(
	body: string,
	recipient: { phone?: string },
): Promise<{ status: string; error?: string }> {
	if (!recipient.phone) {
		return { status: "failed", error: "No phone number" };
	}
	const { getGateway: getSmsGateway } = await import("../../services/messaging/index.js");
	const gateway = getSmsGateway("sms");
	if (!gateway) {
		return { status: "failed", error: "SMS gateway not available" };
	}
	const smsBody = body.length > 160 ? `${body.substring(0, 157)}...` : body;
	const result = await gateway.send({ to: recipient.phone as string, body: smsBody });
	return { status: result.success ? "sent" : "failed", error: result.error };
}

async function sendViaChannel(
	channel: NotificationChannel,
	_notificationId: string,
	title: string,
	body: string,
	recipient: { email?: string; phone?: string; userId: string; role?: string },
): Promise<{ status: string; error?: string }> {
	try {
		if (channel === "in_app") {
			return { status: "sent" };
		}
		if (channel === "email") {
			return sendEmail(title, body, recipient);
		}
		if (channel === "sms") {
			return sendSms(body, recipient);
		}
		return { status: "failed", error: `Unknown channel: ${channel}` };
	} catch (err) {
		log.error(`Channel ${channel} send failed`, { error: String(err) });
		return { status: "failed", error: String(err) };
	}
}

// ─── Create Notification (Multi-channel) ────────────────────────────────────

export async function createNotification(options: NotificationOptions): Promise<void> {
	const channels = options.channels ?? ["in_app"];
	const notificationId = `not_${new Types.ObjectId().toString()}`;

	// Create channel delivery tracking entries
	const channelEntries = channels.map((channel) => ({
		channel,
		status: "pending" as const,
		retryCount: 0,
	}));

	// Save notification to DB
	await NotificationModel.create({
		notificationId,
		recipientUserId: new Types.ObjectId(options.recipientUserId),
		recipientRole: options.recipientRole,
		recipientEmail: options.recipientEmail,
		recipientPhone: options.recipientPhone,
		type: options.type,
		priority: options.priority ?? "medium",
		title: options.title,
		body: options.body,
		relatedEntity: options.relatedEntity
			? {
					entityType: options.relatedEntity.entityType,
					entityId: new Types.ObjectId(options.relatedEntity.entityId),
				}
			: undefined,
		channels: channelEntries,
		templateName: options.templateName,
		templateVariables: options.templateVariables ?? {},
		isRead: false,
		createdAt: new Date(),
		metadata: options.metadata,
	});

	// Send through requested channels (async, non-blocking)
	for (const channel of channels) {
		if (channel === "in_app") {
			// Already persisted — mark as sent
			await NotificationModel.updateOne(
				{ notificationId },
				{ $set: { "channels.$[elem].status": "sent" } },
				{ arrayFilters: [{ "elem.channel": "in_app" }] },
			);
			continue;
		}

		const result = await sendViaChannel(channel, notificationId, options.title, options.body, {
			email: options.recipientEmail,
			phone: options.recipientPhone,
			userId: options.recipientUserId,
		});

		await NotificationModel.updateOne(
			{ notificationId },
			{
				$set: {
					"channels.$[elem].status": result.status,
					"channels.$[elem].sentAt": new Date(),
					...(result.error ? { "channels.$[elem].error": result.error } : {}),
				},
			},
			{ arrayFilters: [{ "elem.channel": channel }] },
		);
	}
}

/**
 * Creates notifications from a template with variables
 */
export async function createNotificationFromTemplate(
	templateName: string,
	variables: Record<string, string>,
	recipientUserId: string,
	recipientRole?: UserRole,
	recipientEmail?: string,
	recipientPhone?: string,
	relatedEntity?: { entityType: string; entityId: string },
	channels?: NotificationChannel[],
): Promise<void> {
	const compiled = compileNotificationTemplate(templateName, variables);
	if (!compiled) {
		log.warn(`Template not found: ${templateName}`);
		return;
	}

	await createNotification({
		recipientUserId,
		recipientRole,
		recipientEmail,
		recipientPhone,
		type: templateNameToNotificationType(templateName),
		priority: getPriorityForTemplate(templateName),
		title: compiled.title,
		body: compiled.body,
		relatedEntity,
		channels: channels ?? ["in_app"],
		templateName,
		templateVariables: variables,
		metadata: { template: templateName, variables },
	});
}

function templateNameToNotificationType(templateName: string): string {
	const map: Record<string, string> = {
		work_assigned: "WORK_ORDER_ASSIGNED",
		proposal_approved: "PROPOSAL_STATUS",
		execution_started: "EXECUTION_STARTED",
		ses_approved: "SES_STATUS",
		invoice_sent: "INVOICE_STATUS",
		payment_received: "PAYMENT_RECEIVED",
		certification_expiring: "CERTIFICATION_EXPIRING",
		maintenance_due: "MAINTENANCE_DUE",
		payment_overdue: "PAYMENT_OVERDUE",
		report_approved: "REPORT_APPROVED",
	};
	return map[templateName] ?? "STATE_TRANSITION";
}

function getPriorityForTemplate(templateName: string): "low" | "medium" | "high" | "critical" {
	const highPriority = ["certification_expiring", "payment_overdue", "payment_received"];
	const criticalPriority = ["certification_expiring"];
	if (criticalPriority.includes(templateName)) {
		return "critical";
	}
	if (highPriority.includes(templateName)) {
		return "high";
	}
	return "medium";
}

// ─── State Transition Notification ──────────────────────────────────────────

export async function notifyStateTransition(
	serviceCaseId: string,
	previousState: string,
	newState: string,
	triggeredByUserId: string,
): Promise<void> {
	const serviceCase = await ServiceCase.findById(serviceCaseId);
	if (!serviceCase) {
		return;
	}

	const rolesToNotify = getRolesToNotifyForStep(newState);
	const users = await User.find({ role: { $in: rolesToNotify } }).lean();

	const notificationsToCreate = users.map((user) => ({
		notificationId: `not_${new Types.ObjectId().toString()}`,
		recipientUserId: user._id,
		recipientRole: user.role,
		recipientEmail: user.email,
		recipientPhone: user.phone,
		type: "STATE_TRANSITION",
		priority: "medium" as const,
		title: `Cambio de estado: ${serviceCase.code}`,
		body: `El caso de servicio ha avanzado de ${previousState} a ${newState}.`,
		relatedEntity: {
			entityType: "ServiceCase",
			entityId: serviceCase._id,
		},
		channels: [{ channel: "in_app" as const, status: "pending" as const, retryCount: 0 }],
		isRead: false,
		createdAt: new Date(),
		metadata: {
			previousState,
			newState,
			triggeredByUserId,
		},
	}));

	if (notificationsToCreate.length > 0) {
		await NotificationModel.insertMany(notificationsToCreate);
	}
}

// ─── Query ──────────────────────────────────────────────────────────────────

export async function getNotificationsForUserPaginated(
	userId: string,
	query: { page?: number; limit?: number; type?: string; isRead?: boolean },
) {
	const filter: Record<string, unknown> = {
		recipientUserId: new Types.ObjectId(userId),
	};
	if (query.type) {
		filter.type = query.type;
	}
	if (query.isRead !== undefined) {
		filter.isRead = query.isRead;
	}

	const page = query.page ?? 1;
	const limit = Math.min(query.limit ?? 20, 100);
	const skip = (page - 1) * limit;

	const [notifications, total] = await Promise.all([
		NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		NotificationModel.countDocuments(filter),
	]);

	const unreadCount = await NotificationModel.countDocuments({
		recipientUserId: new Types.ObjectId(userId),
		isRead: false,
	});

	return {
		notifications,
		unreadCount,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export async function markAsRead(notificationId: string, userId: string) {
	const id = notificationId.length === 24 ? new Types.ObjectId(notificationId) : notificationId;
	const filter =
		typeof id === "string"
			? { notificationId: id, recipientUserId: new Types.ObjectId(userId) }
			: { _id: id, recipientUserId: new Types.ObjectId(userId) };

	const updated = await NotificationModel.findOneAndUpdate(
		filter,
		{
			isRead: true,
			readAt: new Date(),
			$set: { "channels.$[elem].status": "read", "channels.$[elem].readAt": new Date() },
		},
		{
			arrayFilters: [{ "elem.channel": "in_app" }],
			new: true,
		},
	).lean();

	return updated;
}

export async function markAllAsRead(userId: string) {
	const result = await NotificationModel.updateMany(
		{
			recipientUserId: new Types.ObjectId(userId),
			isRead: false,
		},
		{
			isRead: true,
			readAt: new Date(),
		},
	);

	return {
		updated: result.modifiedCount,
	};
}

// ─── Outbox Pattern ────────────────────────────────────────────────────────────

export async function enqueueNotification(
	serviceCaseId: string,
	previousState: string,
	newState: string,
	triggeredByUserId: string,
): Promise<void> {
	await NotificationOutbox.create({
		status: "pending",
		serviceCaseId,
		previousState,
		newState,
		triggeredByUserId,
		retryCount: 0,
		enqueuedAt: new Date(),
	});
}

export async function processOutboxEntries(): Promise<void> {
	const now = new Date();
	const entries = await NotificationOutbox.find({
		status: "pending",
		$or: [
			{ nextRetryAt: { $exists: false } },
			{ nextRetryAt: null },
			{ nextRetryAt: { $lte: now } },
		],
	}).limit(50);

	for (const entry of entries) {
		const claimed = await NotificationOutbox.findOneAndUpdate(
			{ _id: entry._id, status: "pending" },
			{ $set: { status: "processing" } },
			{ new: false },
		);
		if (!claimed) {
			continue;
		}

		try {
			await notifyStateTransition(
				entry.serviceCaseId,
				entry.previousState,
				entry.newState,
				entry.triggeredByUserId,
			);
			await NotificationOutbox.updateOne(
				{ _id: entry._id },
				{ $set: { status: "sent", processedAt: new Date() } },
			);
		} catch (err) {
			const newRetryCount = entry.retryCount + 1;
			const isFinalAttempt = newRetryCount >= RETRY_DELAYS_MS.length;

			if (isFinalAttempt) {
				await NotificationOutbox.updateOne(
					{ _id: entry._id },
					{
						$set: {
							status: "failed",
							retryCount: newRetryCount,
							lastError: String(err),
							processedAt: new Date(),
						},
					},
				);
				log.error("Outbox entry permanently failed", {
					id: String(entry._id),
					serviceCaseId: entry.serviceCaseId,
					retryCount: newRetryCount,
					error: String(err),
				});
			} else {
				const delayMs =
					RETRY_DELAYS_MS[newRetryCount - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
				await NotificationOutbox.updateOne(
					{ _id: entry._id },
					{
						$set: {
							status: "pending",
							retryCount: newRetryCount,
							lastError: String(err),
							nextRetryAt: new Date(Date.now() + delayMs),
						},
					},
				);
				log.warn("Outbox entry will retry", {
					id: String(entry._id),
					serviceCaseId: entry.serviceCaseId,
					retryCount: newRetryCount,
					nextRetryAt: new Date(Date.now() + delayMs).toISOString(),
				});
			}
		}
	}
}

export function startOutboxWorker(): () => void {
	log.info("Starting notification outbox worker", { intervalMs: WORKER_INTERVAL_MS });
	const timer = setInterval(() => {
		processOutboxEntries().catch((err) => {
			log.error("Outbox worker cycle failed", { error: String(err) });
		});
	}, WORKER_INTERVAL_MS);

	timer.unref();

	return () => {
		clearInterval(timer);
		log.info("Notification outbox worker stopped");
	};
}

export async function getFailedOutboxNotifications(limit = 100) {
	return NotificationOutbox.find({ status: "failed" }).sort({ enqueuedAt: -1 }).limit(limit).lean();
}
