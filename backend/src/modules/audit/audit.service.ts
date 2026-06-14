import type { AuditAction } from "@cermont/shared-types";
import type { QueryFilter } from "mongoose";
import { NotFoundError, ServiceUnavailableError } from "../../common/errors/AppError";
import { getRequestContext } from "../../common/observability/request-context";
import type { JsonObject, JsonValue } from "../../common/types/safe-types";
import { createLogger } from "../../common/utils/logger";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { AuditLog, User } from "../../models";
import type { IAuditLog } from "../../models/AuditLog";

const log = createLogger("audit-service");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface AuditLogInput {
	action: AuditAction;
	entity: string;
	entityId: string;
	userId: string;
	userEmail?: string;
	before?: JsonValue;
	after?: JsonValue;
	metadata?: JsonValue;
	requestId?: string;
	ipAddress?: string;
	userAgent?: string;
}

export interface AuditLogFilters {
	userId?: string;
	user_id?: string;
	entity?: string;
	model_name?: string;
	entityId?: string;
	action?: AuditAction;
	requestId?: string;
	from?: string;
	to?: string;
}

export interface PaginatedLogs {
	logs: object[];
	total: number;
	page: number;
	limit: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQuery(filters: AuditLogFilters): QueryFilter<IAuditLog> {
	const query: QueryFilter<IAuditLog> = {};
	const userId = filters.userId ?? filters.user_id;
	const entityType = filters.entity ?? filters.model_name;

	if (userId) {
		query.userId = userId;
	}
	if (entityType) {
		query.entityType = entityType;
	}
	if (filters.entityId) {
		query.entityId = filters.entityId;
	}
	if (filters.action) {
		query.action = filters.action;
	}
	if (filters.requestId) {
		query.requestId = filters.requestId;
	}
	if (filters.from || filters.to) {
		const createdAt: { $gte?: Date; $lte?: Date } = {};
		if (filters.from) {
			createdAt.$gte = new Date(filters.from);
		}
		if (filters.to) {
			createdAt.$lte = new Date(filters.to);
		}
		query.createdAt = createdAt;
	}
	return query;
}

function buildChanges(input: AuditLogInput): { before?: JsonValue; after?: JsonValue } | undefined {
	if (input.before === undefined && input.after === undefined) {
		return undefined;
	}

	const changes: { before?: JsonValue; after?: JsonValue } = {};

	if (input.before !== undefined) {
		changes.before = input.before;
	}

	if (input.after !== undefined) {
		changes.after = input.after;
	}

	return changes;
}

async function resolveUserEmail(userId: string, userEmail?: string): Promise<string> {
	if (userEmail) {
		return userEmail;
	}

	try {
		const user = (await User.findById(userId).select("email").lean()) as { email?: string } | null;

		if (typeof user?.email === "string" && user.email.trim().length > 0) {
			return user.email;
		}
	} catch (error) {
		log.warn("Unable to resolve audit actor email", {
			userId,
			error: error instanceof Error ? error : String(error),
		});
	}

	return `user:${userId}`;
}

const SENSITIVE_AUDIT_KEY =
	/(?:password|passphrase|token|authorization|cookie|secret|api[-_]?key|private[-_]?key)/i;

function sanitizeAuditValue(value: JsonValue): JsonValue {
	if (Array.isArray(value)) {
		return value.map(sanitizeAuditValue);
	}

	if (typeof value === "object") {
		const sanitized: JsonObject = {};
		for (const [key, nestedValue] of Object.entries(value)) {
			sanitized[key] = SENSITIVE_AUDIT_KEY.test(key)
				? "[REDACTED]"
				: sanitizeAuditValue(nestedValue);
		}
		return sanitized;
	}

	return value;
}

interface AuditLogPayload {
	action: AuditAction;
	entityType: string;
	entityId: string;
	userId: string;
	userEmail: string;
	changes?: {
		before?: JsonValue;
		after?: JsonValue;
	};
	metadata?: JsonValue;
	requestId?: string;
	ipAddress?: string;
	userAgent?: string;
}

function buildSanitizedChanges(input: AuditLogInput): AuditLogPayload["changes"] {
	const changes = buildChanges(input);
	if (!changes) {
		return undefined;
	}

	const sanitized: NonNullable<AuditLogPayload["changes"]> = {};
	if (changes.before !== undefined) {
		sanitized.before = sanitizeAuditValue(changes.before);
	}
	if (changes.after !== undefined) {
		sanitized.after = sanitizeAuditValue(changes.after);
	}
	return sanitized;
}

function resolveAuditRequestData(input: AuditLogInput): {
	requestId: string;
	ipAddress: string;
	userAgent: string;
} {
	const contextState = getRequestContext();
	const context = contextState.status === "available" ? contextState.context : false;
	return {
		requestId: input.requestId || (context ? context.requestId : ""),
		ipAddress: input.ipAddress || (context ? context.ipAddress : ""),
		userAgent: input.userAgent || (context ? context.userAgent : ""),
	};
}

function buildAuditLogPayload(input: AuditLogInput, userEmail: string): AuditLogPayload {
	const payload: AuditLogPayload = {
		action: input.action,
		entityType: input.entity,
		entityId: input.entityId,
		userId: input.userId,
		userEmail,
	};

	const changes = buildSanitizedChanges(input);
	if (changes) {
		payload.changes = changes;
	}
	if (input.metadata !== undefined) {
		payload.metadata = sanitizeAuditValue(input.metadata);
	}

	const requestData = resolveAuditRequestData(input);
	if (requestData.requestId) {
		payload.requestId = requestData.requestId;
	}
	if (requestData.ipAddress) {
		payload.ipAddress = requestData.ipAddress;
	}
	if (requestData.userAgent) {
		payload.userAgent = requestData.userAgent;
	}

	return payload;
}

// ─── Servicios ───────────────────────────────────────────────────────────────

/**
 * Persists an audit event and always settles.
 * Callers can await durability; non-critical callers may intentionally ignore
 * the returned promise without risking an unhandled rejection.
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
	try {
		const userEmail = await resolveUserEmail(input.userId, input.userEmail);
		const auditLog = buildAuditLogPayload(input, userEmail);

		await AuditLog.create(auditLog);
	} catch (error) {
		log.error("Failed to create audit log", {
			error: error instanceof Error ? error : String(error),
			action: input.action,
			entityType: input.entity,
		});
	}
}

/**
 * Busca entradas de auditoría con filtros y paginación.
 */
export async function findLogs(
	filters: AuditLogFilters = {},
	page: number = DEFAULT_PAGE,
	limit: number = DEFAULT_LIMIT,
): Promise<PaginatedLogs> {
	const query = buildQuery(filters);
	const skip = (page - 1) * limit;

	let total: number;
	let logs: object[];

	try {
		[total, logs] = await Promise.all([
			AuditLog.countDocuments(query),
			AuditLog.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean<object[]>(),
		]);
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}

	return { logs, total, page, limit };
}

/**
 * Busca un registro de auditoría por ID.
 * @throws Error si no existe
 */
export async function findById(id: string): Promise<object> {
	const entry = await AuditLog.findById(id).lean<object>();
	if (!entry) {
		throw new NotFoundError("AuditLog", id);
	}
	return entry;
}
