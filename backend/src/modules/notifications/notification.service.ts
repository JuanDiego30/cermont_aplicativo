import type { UserRole } from "@cermont/domain";
import { Types } from "mongoose";
import { createLogger } from "../../common/utils/logger";
import { Notification, NotificationOutbox, ServiceCase, User } from "../../models";

const log = createLogger("notification-outbox");

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
		// CORREGIDO: Pasos 7-10 corregidos (evidences absorbido en ejecución paso 6).
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

	const notificationsToCreate = users.map((user) => {
		const notificationId = `not_${new Types.ObjectId().toString()}`;
		return {
			notificationId,
			recipientUserId: user._id,
			recipientRole: user.role,
			type: "STATE_TRANSITION",
			title: `Cambio de estado: ${serviceCase.code}`,
			body: `El caso de servicio ha avanzado de ${previousState} a ${newState}.`,
			relatedEntity: {
				entityType: "ServiceCase",
				entityId: serviceCase._id,
			},
			isRead: false,
			createdAt: new Date(),
			metadata: {
				previousState,
				newState,
				triggeredByUserId,
			},
		};
	});

	if (notificationsToCreate.length > 0) {
		await Notification.insertMany(notificationsToCreate);
	}
}

export async function getNotificationsForUser(userId: string) {
	const notifications = await Notification.find({
		recipientUserId: new Types.ObjectId(userId),
	})
		.sort({ createdAt: -1 })
		.limit(50)
		.lean();

	const unreadCount = await Notification.countDocuments({
		recipientUserId: new Types.ObjectId(userId),
		isRead: false,
	});

	return {
		notifications,
		unreadCount,
	};
}

export async function markAsRead(notificationId: string, userId: string) {
	const updated = await Notification.findOneAndUpdate(
		{
			_id: new Types.ObjectId(notificationId),
			recipientUserId: new Types.ObjectId(userId),
		},
		{
			isRead: true,
			readAt: new Date(),
		},
		{ new: true },
	).lean();

	return updated;
}

export async function markAllAsRead(userId: string) {
	const result = await Notification.updateMany(
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
