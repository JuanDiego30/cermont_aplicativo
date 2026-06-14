import { type AuditAction, type AuditLogRecord, AuditLogRecordSchema } from "@cermont/shared-types";
import { apiClient } from "@/lib/http/api-client";

export interface AuditListFilters {
	page: number;
	limit: number;
	userId?: string;
	entity?: string;
	entityId?: string;
	action?: AuditAction;
	requestId?: string;
	from?: string;
	to?: string;
}

export interface AuditListResult {
	events: AuditLogRecord[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

interface AuditListEnvelope {
	success: true;
	data: AuditLogRecord[];
	pagination: AuditListResult["pagination"];
}

function appendFilter(params: URLSearchParams, key: string, value: string | number): void {
	if (String(value).length > 0) {
		params.set(key, String(value));
	}
}

export async function listAuditLogs(filters: AuditListFilters): Promise<AuditListResult> {
	const params = new URLSearchParams();
	appendFilter(params, "page", filters.page);
	appendFilter(params, "limit", filters.limit);
	if (filters.userId) {
		appendFilter(params, "userId", filters.userId);
	}
	if (filters.entity) {
		appendFilter(params, "entity", filters.entity);
	}
	if (filters.entityId) {
		appendFilter(params, "entityId", filters.entityId);
	}
	if (filters.action) {
		appendFilter(params, "action", filters.action);
	}
	if (filters.requestId) {
		appendFilter(params, "requestId", filters.requestId);
	}
	if (filters.from) {
		appendFilter(params, "from", filters.from);
	}
	if (filters.to) {
		appendFilter(params, "to", filters.to);
	}

	const envelope = await apiClient.get<AuditListEnvelope>(`/audit?${params.toString()}`);
	return {
		events: AuditLogRecordSchema.array().parse(envelope.data),
		pagination: envelope.pagination,
	};
}
