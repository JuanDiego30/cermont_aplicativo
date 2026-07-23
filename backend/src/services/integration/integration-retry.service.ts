import { randomUUID } from "node:crypto";
import type { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { DlqEntry, type DlqEntryDocument } from "../../models/DlqEntry";
import { IntegrationLog } from "../../models/IntegrationLog";
import { createAuditLog } from "../../modules/audit/audit.service";

const log = createLogger("integration-retry");

export interface RetryOptions {
	maxRetries: number;
	baseDelayMs: number;
	operation: string;
	entityType: string;
	entityId: string;
	provider: string;
	userId?: string;
	environment?: "test" | "production";
}

function calculateBackoff(attempt: number, baseDelayMs: number): number {
	const jitter = Math.random() * 1000;
	return Math.min(baseDelayMs * 2 ** attempt + jitter, 30_000);
}

async function logSuccessAttempt<T>(
	idempotencyKey: string,
	data: T,
	startTime: number,
	options: RetryOptions,
	attempt: number,
): Promise<void> {
	await IntegrationLog.create({
		idempotencyKey,
		operation: options.operation,
		provider: options.provider,
		entityType: options.entityType,
		entityId: options.entityId,
		environment: options.environment ?? "test",
		responsePayload: data as Record<string, unknown>,
		success: true,
		statusCode: 200,
		durationMs: Date.now() - startTime,
		userId: options.userId ? (options.userId as unknown as Types.ObjectId) : null,
	});
	if (attempt > 0) {
		await markDlqRetried(idempotencyKey);
	}
}

async function logFailureAttempt(
	idempotencyKey: string,
	startTime: number,
	options: RetryOptions,
	attempt: number,
	errorMessage: string,
	_errorCode: string,
): Promise<void> {
	await IntegrationLog.create({
		idempotencyKey: `${idempotencyKey}_attempt_${attempt}`,
		operation: options.operation,
		provider: options.provider,
		entityType: options.entityType,
		entityId: options.entityId,
		environment: options.environment ?? "test",
		success: false,
		statusCode: 503,
		errorMessage,
		durationMs: Date.now() - startTime,
		userId: options.userId ? (options.userId as unknown as Types.ObjectId) : null,
	});
}

async function moveToDlq(
	idempotencyKey: string,
	options: RetryOptions,
	errorMessage: string,
	errorCode: string,
): Promise<void> {
	const nextRetryAt = new Date(Date.now() + 3600_000);
	await DlqEntry.create({
		idempotencyKey,
		operation: options.operation,
		entityType: options.entityType,
		entityId: options.entityId,
		provider: options.provider,
		errorMessage,
		errorCode,
		retryCount: options.maxRetries,
		maxRetries: options.maxRetries,
		lastAttemptAt: new Date(),
		nextRetryAt,
		status: "pending_retry",
	});
	log.error("Integration call failed and moved to DLQ", {
		idempotencyKey,
		operation: options.operation,
		provider: options.provider,
		error: errorMessage,
	});
	await createAuditLog({
		userId: options.userId ?? "system",
		action: "INTEGRATION_FAILED",
		entity: options.entityType,
		entityId: options.entityId,
		metadata: JSON.stringify({
			idempotencyKey,
			operation: options.operation,
			provider: options.provider,
			error: errorMessage,
			errorCode,
		}),
	});
}

export async function executeWithRetryAndDlq<T>(
	fn: () => Promise<T>,
	_payload: Record<string, unknown>,
	options: RetryOptions,
): Promise<{ success: true; data: T } | { success: false; error: string; errorCode: string }> {
	const idempotencyKey = randomUUID();
	const startTime = Date.now();

	for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
		try {
			const data = await fn();
			await logSuccessAttempt(idempotencyKey, data, startTime, options, attempt);
			return { success: true, data };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorCode = error instanceof AppError ? error.code : "INTEGRATION_EXTERNAL_ERROR";

			await logFailureAttempt(idempotencyKey, startTime, options, attempt, errorMessage, errorCode);

			if (attempt < options.maxRetries) {
				const delay = calculateBackoff(attempt, options.baseDelayMs);
				log.warn("Retrying integration call", {
					operation: options.operation,
					provider: options.provider,
					attempt: attempt + 1,
					maxRetries: options.maxRetries,
					delayMs: delay,
					error: errorMessage,
				});
				await new Promise((resolve) => setTimeout(resolve, delay));
			} else {
				await moveToDlq(idempotencyKey, options, errorMessage, errorCode);
				return { success: false, error: errorMessage, errorCode };
			}
		}
	}

	return { success: false, error: "Unexpected retry exit", errorCode: "UNEXPECTED_RETRY_EXIT" };
}

async function markDlqRetried(idempotencyKey: string): Promise<void> {
	await DlqEntry.updateOne(
		{ idempotencyKey },
		{
			$set: {
				status: "retried",
				resolvedAt: new Date(),
			},
		},
	);
}

export const DlqService = {
	async listPending(): Promise<DlqEntryDocument[]> {
		return DlqEntry.find({
			status: "pending_retry",
			$or: [{ nextRetryAt: null }, { nextRetryAt: { $lte: new Date() } }],
		})
			.sort({ createdAt: -1 })
			.limit(100)
			.exec();
	},

	async listAll(filters: {
		status?: string;
		provider?: string;
		limit?: number;
		skip?: number;
	}): Promise<{ entries: DlqEntryDocument[]; total: number }> {
		const query: Record<string, unknown> = {};
		if (filters.status) {
			query.status = filters.status;
		}
		if (filters.provider) {
			query.provider = filters.provider;
		}
		const [entries, total] = await Promise.all([
			DlqEntry.find(query)
				.sort({ createdAt: -1 })
				.limit(filters.limit ?? 50)
				.skip(filters.skip ?? 0)
				.exec(),
			DlqEntry.countDocuments(query),
		]);
		return { entries, total };
	},

	async retryOne(id: string, userId: string): Promise<DlqEntryDocument | null> {
		const entry = await DlqEntry.findById(id);
		if (!entry) {
			return null;
		}
		entry.status = "manual_retry";
		entry.resolvedBy = userId as unknown as Types.ObjectId;
		entry.nextRetryAt = new Date();
		await entry.save();
		return entry;
	},

	async retryAllByProvider(provider: string, userId: string): Promise<number> {
		const result = await DlqEntry.updateMany(
			{ provider, status: "pending_retry" },
			{
				$set: {
					status: "manual_retry",
					resolvedBy: userId as unknown as Types.ObjectId,
					nextRetryAt: new Date(),
				},
			},
		);
		return result.modifiedCount;
	},

	async resolve(id: string, userId: string): Promise<DlqEntryDocument | null> {
		const entry = await DlqEntry.findById(id);
		if (!entry) {
			return null;
		}
		entry.status = "permanent_failure";
		entry.resolvedAt = new Date();
		entry.resolvedBy = userId as unknown as Types.ObjectId;
		await entry.save();
		return entry;
	},

	async getIntegrationLogs(filters: {
		entityId?: string;
		provider?: string;
		operation?: string;
		success?: boolean;
		limit?: number;
		skip?: number;
	}) {
		const query: Record<string, unknown> = {};
		if (filters.entityId) {
			query.entityId = filters.entityId;
		}
		if (filters.provider) {
			query.provider = filters.provider;
		}
		if (filters.operation) {
			query.operation = filters.operation;
		}
		if (filters.success !== undefined) {
			query.success = filters.success;
		}
		const [logs, total] = await Promise.all([
			IntegrationLog.find(query)
				.sort({ createdAt: -1 })
				.limit(filters.limit ?? 50)
				.skip(filters.skip ?? 0)
				.exec(),
			IntegrationLog.countDocuments(query),
		]);
		return { logs, total };
	},
};
