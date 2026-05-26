import { NotFoundError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { AuditLog, User } from "../../models";

const log = createLogger("audit-service");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface AuditLogInput {
	action: string;
	entity: string;
	entityId: string;
	userId: string;
	userEmail?: string;
	before?: unknown;
	after?: unknown;
	metadata?: unknown;
	ipAddress?: string;
	userAgent?: string;
}

export interface AuditLogFilters {
	user_id?: string;
	model_name?: string;
	action?: string;
}

export interface PaginatedLogs {
	logs: unknown[];
	total: number;
	page: number;
	limit: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQuery(filters: AuditLogFilters): Record<string, string> {
	const query: Record<string, string> = {};
	if (filters.user_id) {
		query.userId = filters.user_id;
	}
	if (filters.model_name) {
		query.entityType = filters.model_name;
	}
	if (filters.action) {
		query.action = filters.action;
	}
	return query;
}

function buildChanges(input: AuditLogInput): { before?: unknown; after?: unknown } | undefined {
	if (input.before === undefined && input.after === undefined) {
		return undefined;
	}

	const changes: { before?: unknown; after?: unknown } = {};

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
	} catch {
		// Fall back to a deterministic placeholder when the user lookup fails.
	}

	return `user:${userId}`;
}

function buildAuditLogPayload(input: AuditLogInput, userEmail: string): Record<string, unknown> {
	return {
		action: input.action,
		entityType: input.entity,
		entityId: input.entityId,
		userId: input.userId,
		userEmail,
		changes: buildChanges(input),
		metadata: input.metadata,
		ipAddress: input.ipAddress,
		userAgent: input.userAgent,
	};
}

// ─── Servicios ───────────────────────────────────────────────────────────────

/**
 * Registra un evento de auditoría de forma asíncrona (fire-and-forget).
 * Los errores se loggean pero no se propagan al flujo principal.
 */
export function createAuditLog(input: AuditLogInput): void {
	void (async () => {
		const userEmail = await resolveUserEmail(input.userId, input.userEmail);
		const auditLog = buildAuditLogPayload(input, userEmail);

		await AuditLog.create(auditLog);
	})().catch((err: unknown) => {
		log.error("Failed to create audit log", {
			err,
			action: input.action,
			entityType: input.entity,
		});
	});
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

	const [total, logs] = await Promise.all([
		AuditLog.countDocuments(query),
		AuditLog.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
	]);

	return { logs, total, page, limit };
}

/**
 * Busca un registro de auditoría por ID.
 * @throws Error si no existe
 */
export async function findById(id: string): Promise<unknown> {
	const entry = await AuditLog.findById(id).lean();
	if (!entry) {
		throw new NotFoundError("AuditLog", id);
	}
	return entry;
}
