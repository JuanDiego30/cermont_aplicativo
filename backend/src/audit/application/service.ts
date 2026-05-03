import { NotFoundError } from "../../_shared/common/errors";
import { createLogger } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";

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

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function resolveUserEmail(userId: string, userEmail?: string): Promise<string> {
	if (userEmail) {
		return userEmail;
	}

	try {
		const user = await container.userRepository.findByIdLean(userId);

		if (typeof user?.email === "string" && user.email.trim().length > 0) {
			return user.email;
		}
	} catch {
		// Fall back
	}

	return `user:${userId}`;
}

function buildAuditLogPayload(input: AuditLogInput, userEmail: string): Record<string, unknown> {
	const changes: { before?: unknown; after?: unknown } = {};
	if (input.before !== undefined) {
		changes.before = input.before;
	}
	if (input.after !== undefined) {
		changes.after = input.after;
	}

	return {
		action: input.action,
		entityType: input.entity,
		entityId: input.entityId,
		userId: input.userId,
		userEmail,
		changes: Object.keys(changes).length > 0 ? changes : undefined,
		metadata: input.metadata,
		ipAddress: input.ipAddress,
		userAgent: input.userAgent,
	};
}

/**
 * Registra un evento de auditoría de forma asíncrona (fire-and-forget).
 */
export function createLog(input: AuditLogInput): void {
	void (async () => {
		const userEmail = await resolveUserEmail(input.userId, input.userEmail);
		const auditLog = buildAuditLogPayload(input, userEmail);

		await container.auditLogRepository.create(auditLog);
	})().catch((err: unknown) => {
		log.error("Failed to create audit log", {
			err,
			action: input.action,
			entityType: input.entity,
		});
	});
}

/**
 * Registra un evento de auditoría (alias para createLog)
 */
export function createAuditLog(input: AuditLogInput): void {
	createLog(input);
}

/**
 * Busca entradas de auditoría con filtros y paginación.
 */
export async function findLogs(
	filters: AuditLogFilters = {},
	page: number = DEFAULT_PAGE,
	limit: number = DEFAULT_LIMIT,
): Promise<PaginatedLogs> {
	const query: Record<string, unknown> = {};
	if (filters.user_id) {
		query.userId = filters.user_id;
	}
	if (filters.model_name) {
		query.entityType = filters.model_name;
	}
	if (filters.action) {
		query.action = filters.action;
	}

	const skip = (page - 1) * limit;

	const [total, logs] = await Promise.all([
		container.auditLogRepository.countDocuments(query),
		container.auditLogRepository.findPaginated(query, { skip, limit, sort: { createdAt: -1 } }),
	]);

	return { logs, total, page, limit };
}

/**
 * Busca un registro de auditoría por ID.
 */
export async function findById(id: string): Promise<unknown> {
	const entry = await container.auditLogRepository.findByIdLean(id);
	if (!entry) {
		throw new NotFoundError("AuditLog", id);
	}
	return entry;
}

// Deprecated: namespace wrapper
export const AuditService = {
	createAuditLog,
	createLog,
	findLogs,
	findById,
};
