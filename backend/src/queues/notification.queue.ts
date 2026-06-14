/**
 * Notification Queue — BullMQ + Redis with MongoDB fallback
 *
 * Provides reliable notification processing with:
 * - BullMQ queue for async processing (when Redis is available)
 * - Exponential backoff retry (3 attempts)
 * - MongoDB fallback when Redis is not available
 *
 * Usage:
 *   import { enqueueNotification } from "../queues/notification.queue";
 *   await enqueueNotification(serviceCaseId, prevState, newState, userId);
 */

import type { ConnectionOptions, Job } from "bullmq";
import { Queue, Worker } from "bullmq";
import { Types } from "mongoose";
import { createLogger } from "../common/utils/logger";
import { Notification, ServiceCase, User } from "../models";

const log = createLogger("notification-queue");

const REDIS_URL = process.env.REDIS_URL || "";
const USE_QUEUE = REDIS_URL.length > 0;

let notificationQueue: Queue | null = null;
let connection: ConnectionOptions | null = null;

/**
 * Attempt to create a Redis connection.
 * Returns null if Redis is not configured or connection fails.
 */
function createRedisConnection(): ConnectionOptions | null {
	if (!USE_QUEUE) {
		return null;
	}
	try {
		return {
			host: process.env.REDIS_HOST || "localhost",
			port: Number(process.env.REDIS_PORT) || 6379,
			password: process.env.REDIS_PASSWORD || undefined,
			maxRetriesPerRequest: 3,
			retryStrategy: (times: number) => {
				if (times > 3) {
					return null;
				}
				return Math.min(times * 200, 2000);
			},
		};
	} catch {
		log.warn("Redis not available — queue notifications will use MongoDB fallback");
		return null;
	}
}

/**
 * Get or initialize the BullMQ queue.
 * Falls back to null if Redis is unavailable.
 */
async function getQueue(): Promise<Queue | null> {
	if (notificationQueue) {
		return notificationQueue;
	}
	if (!USE_QUEUE) {
		return null;
	}

	connection = createRedisConnection();
	if (!connection) {
		return null;
	}

	try {
		notificationQueue = new Queue("cermont-notifications", {
			connection,
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: "exponential",
					delay: 1000,
				},
				removeOnComplete: 1000,
				removeOnFail: 100,
			},
		});
		return notificationQueue;
	} catch {
		log.warn("Failed to create BullMQ queue — falling back to MongoDB");
		connection = null;
		return null;
	}
}

/**
 * Direct MongoDB fallback — saves notification directly to DB
 */
async function saveNotificationDirectly(
	serviceCaseId: string,
	previousState: string,
	newState: string,
	triggeredByUserId: string,
): Promise<void> {
	try {
		const serviceCase = await ServiceCase.findById(serviceCaseId);
		if (!serviceCase) {
			return;
		}

		const { getRolesToNotifyForStep } = await import(
			"../modules/notifications/notification.service.js"
		);
		const rolesToNotify = getRolesToNotifyForStep(newState);
		const users = await User.find({ role: { $in: rolesToNotify } }).lean();

		if (users.length === 0) {
			return;
		}

		const notificationsToCreate = users.map((user) => ({
			notificationId: `not_${new Types.ObjectId().toString()}`,
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
		}));

		await Notification.insertMany(notificationsToCreate);
	} catch (err) {
		log.error("Fallback save failed", { error: String(err) });
	}
}

/**
 * Enqueue a notification for async processing.
 * Uses BullMQ if Redis is available, otherwise falls back to direct MongoDB save.
 */
export async function enqueueNotification(
	serviceCaseId: string,
	previousState: string,
	newState: string,
	triggeredByUserId: string,
): Promise<void> {
	const queue = await getQueue();

	if (queue) {
		// BullMQ path — async processing with retries
		await queue.add("state_transition", {
			serviceCaseId,
			previousState,
			newState,
			triggeredByUserId,
		});
	} else {
		// Fallback path — direct MongoDB save
		await saveNotificationDirectly(serviceCaseId, previousState, newState, triggeredByUserId);
	}
}

/**
 * Initialize the BullMQ worker for processing notification jobs.
 * Called once during app startup.
 */
export function initNotificationWorker(): void {
	if (!USE_QUEUE) {
		log.info("Redis not configured — using MongoDB fallback");
		return;
	}

	const conn = createRedisConnection();
	if (!conn) {
		log.info("Redis connection failed — using MongoDB fallback");
		return;
	}

	const worker = new Worker<{
		serviceCaseId: string;
		previousState: string;
		newState: string;
		triggeredByUserId: string;
	}>(
		"cermont-notifications",
		async (job: Job) => {
			const { serviceCaseId, previousState, newState, triggeredByUserId } = job.data;
			await saveNotificationDirectly(serviceCaseId, previousState, newState, triggeredByUserId);
		},
		{
			connection: conn,
			concurrency: 5,
		},
	);

	worker.on("completed", (job: Job) => {
		log.info("Job completed", { jobId: job.id ?? "unknown" });
	});

	worker.on("failed", (job: Job | undefined, err: Error) => {
		log.error("Job failed", { jobId: job?.id ?? "unknown", error: err.message });
	});

	log.info("Worker initialized");
}

/**
 * Gracefully close the queue and Redis connection.
 */
export async function closeNotificationQueue(): Promise<void> {
	try {
		await notificationQueue?.close();
	} catch {
		// Ignore close errors
	}
}
