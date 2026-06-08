/**
 * API Contract Index - Single Source of Truth
 *
 * This file exports all API contracts organized by domain.
 * Each domain exports:
 * - schemas: Zod schemas for validation
 * - types: TypeScript types inferred from schemas
 *
 * Usage:
 * import { orderAPI } from '@cermont/shared-types/api';
 * type CreateOrderBody = typeof orderAPI.createOrder.body;
 */

// Auth API Contracts
import { AssistantChatRequestSchema } from "../schemas/ai.schema";
import { ErrorDashboardQuerySchema, NotificationIdSchema } from "../schemas/analytics.schema";
import { AuditLogIdSchema, AuditLogsQuerySchema } from "../schemas/audit.schema";
import { LoginSchema } from "../schemas/auth.schema";
import { CreateUserSchema } from "../schemas/user.schema";

export const aiAPI = {
	chat: {
		body: AssistantChatRequestSchema,
	} as const,
} as const;

export const analyticsAPI = {
	errorDashboard: {
		query: ErrorDashboardQuerySchema,
	} as const,
	notification: {
		params: NotificationIdSchema,
	} as const,
} as const;

export const auditAPI = {
	listAuditLogs: {
		query: AuditLogsQuerySchema,
	} as const,
	getAuditLog: {
		params: AuditLogIdSchema,
	} as const,
} as const;

export const authAPI = {
	login: {
		body: LoginSchema,
	} as const,
	register: {
		body: CreateUserSchema,
	} as const,
} as const;

// User API Contracts
import {
	ListUsersQuerySchema,
	UpdateUserSchema,
	UserIdParamsSchema,
	UserRoleParamsSchema,
	UserSchema,
} from "../schemas/user.schema";

export const userAPI = {
	listUsers: {
		query: ListUsersQuerySchema,
	} as const,
	getUser: {
		params: UserIdParamsSchema,
	} as const,
	getUsersByRole: {
		params: UserRoleParamsSchema,
	} as const,
	updateUser: {
		body: UpdateUserSchema,
	} as const,
	user: {
		schema: UserSchema,
	} as const,
} as const;

// Order API Contracts
import {
	AssignOrderSchema,
	CreateOrderSchema,
	OrderIdSchema,
	OrderListQuerySchema,
	OrderSchema,
	TransitionOrderStatusSchema,
	UpdateOrderSchema,
	UpdateOrderStatusSchema,
} from "../schemas/order.schema";

export const orderAPI = {
	listOrders: {
		query: OrderListQuerySchema,
	} as const,
	createOrder: {
		body: CreateOrderSchema,
	} as const,
	updateOrder: {
		body: UpdateOrderSchema,
	} as const,
	updateOrderStatus: {
		body: UpdateOrderStatusSchema,
	} as const,
	transitionOrderStatus: {
		body: TransitionOrderStatusSchema,
	} as const,
	assignOrder: {
		body: AssignOrderSchema,
	} as const,
	getOrder: {
		params: OrderIdSchema,
	} as const,
	order: {
		schema: OrderSchema,
	} as const,
} as const;

// Resource API Contracts
import {
	CreateResourceSchema,
	UpdateResourceSchema,
	UpdateResourceStatusSchema,
} from "../schemas/resource.schema";

export const resourceAPI = {
	createResource: {
		body: CreateResourceSchema,
	} as const,
	updateResource: {
		body: UpdateResourceSchema,
	} as const,
	updateResourceStatus: {
		body: UpdateResourceStatusSchema,
	} as const,
} as const;

// MaintenanceKit API Contracts
import {
	CreateMaintenanceKitSchema,
	MaintenanceKitSchema,
	UpdateMaintenanceKitSchema,
} from "../schemas/maintenanceKit.schema";

export const maintenanceKitAPI = {
	createKit: {
		body: CreateMaintenanceKitSchema,
	} as const,
	updateKit: {
		body: UpdateMaintenanceKitSchema,
	} as const,
	kit: {
		schema: MaintenanceKitSchema,
	} as const,
} as const;

// Inspection API Contracts
import {
	CreateInspectionSchema,
	InspectionIdSchema,
	InspectionOrderIdParamsSchema,
	InspectionSchema,
	UpdateInspectionStatusSchema,
} from "../schemas/inspection.schema";

export const inspectionAPI = {
	getInspection: {
		params: InspectionIdSchema,
	} as const,
	listByOrder: {
		params: InspectionOrderIdParamsSchema,
	} as const,
	createInspection: {
		body: CreateInspectionSchema,
	} as const,
	updateInspectionStatus: {
		body: UpdateInspectionStatusSchema,
	} as const,
	inspection: {
		schema: InspectionSchema,
	} as const,
} as const;

// Evidence API Contracts
import {
	CreateEvidenceSchema,
	EvidenceIdSchema,
	EvidenceOrderIdParamsSchema,
	EvidenceSchema,
} from "../schemas/evidence.schema";

export const evidenceAPI = {
	listByOrder: {
		params: EvidenceOrderIdParamsSchema,
	} as const,
	uploadEvidence: {
		body: CreateEvidenceSchema,
	} as const,
	deleteEvidence: {
		params: EvidenceIdSchema,
	} as const,
	evidence: {
		schema: EvidenceSchema,
	} as const,
} as const;

// Checklist API Contracts
import {
	ChecklistResponseSchema,
	CompleteChecklistSchema,
	CreateChecklistSchema,
	ListChecklistsQuerySchema,
	UpdateChecklistItemSchema,
} from "../schemas/checklist.schema";

export const checklistAPI = {
	list: "GET /api/checklists",
	getByOrder: "GET /api/checklists/:orderId",
	validate: "POST /api/checklists/:id/validate",
	listChecklists: {
		query: ListChecklistsQuerySchema,
	} as const,
	createChecklist: {
		body: CreateChecklistSchema,
	} as const,
	updateChecklistItem: {
		body: UpdateChecklistItemSchema,
	} as const,
	completeChecklist: {
		body: CompleteChecklistSchema,
	} as const,
	checklist: {
		schema: ChecklistResponseSchema,
	} as const,
} as const;

// Sync API Contracts
import {
	SyncBatchSchema as OfflineSyncBatchSchema,
	SyncResultSchema as OfflineSyncResultSchema,
} from "../schemas/sync.schema";

export const syncAPI = {
	offlineSync: {
		body: OfflineSyncBatchSchema,
		response: OfflineSyncResultSchema,
	} as const,
} as const;

// Report API Contracts
import {
	CreateWorkReportSchema,
	ListReportsQuerySchema,
	ReportStatusSchema,
	UpdateWorkReportSchema,
	WorkReportSchema,
} from "../schemas/report.schema";

export const reportAPI = {
	list: "GET /api/reports",
	getByOrder: "GET /api/reports/order/:orderId",
	create: "POST /api/reports",
	update: "PATCH /api/reports/:id",
	approve: "PATCH /api/reports/:id/approve",
	close: "POST /api/reports/:id/close",
	reject: "PATCH /api/reports/:id/reject",
	generatePdf: "GET /api/reports/order/:orderId/pdf",
	listSchema: {
		query: ListReportsQuerySchema,
	} as const,
	createSchema: {
		body: CreateWorkReportSchema,
	} as const,
	updateSchema: {
		body: UpdateWorkReportSchema,
	} as const,
	report: {
		schema: WorkReportSchema,
	} as const,
	statusSchema: {
		schema: ReportStatusSchema,
	} as const,
} as const;

// Proposal API Contracts
import {
	ApproveProposalSchema,
	ConvertProposalToOrderSchema,
	CreateProposalSchema,
	ListProposalsQuerySchema,
	ProposalIdSchema,
	ProposalOrderIdParamsSchema,
	ProposalSchema,
	UpdateProposalStatusSchema,
} from "../schemas/proposal.schema";

export const proposalAPI = {
	listProposals: {
		query: ListProposalsQuerySchema,
	} as const,
	getProposal: {
		params: ProposalIdSchema,
	} as const,
	getProposalsByOrder: {
		params: ProposalOrderIdParamsSchema,
	} as const,
	createProposal: {
		body: CreateProposalSchema,
	} as const,
	updateProposalStatus: {
		body: UpdateProposalStatusSchema,
	} as const,
	approveProposal: {
		body: ApproveProposalSchema,
	} as const,
	convertProposalToOrder: {
		body: ConvertProposalToOrderSchema,
	} as const,
	proposal: {
		schema: ProposalSchema,
	} as const,
} as const;

// Cost API Contracts
export const costAPI = {
	list: "GET /api/costs",
	getByOrder: "GET /api/costs/order/:orderId",
	getSummaryByOrder: "GET /api/costs/order/:orderId/summary",
	detail: "GET /api/costs/:id",
	create: "POST /api/costs",
	update: "PATCH /api/costs/:id",
	delete: "DELETE /api/costs/:id",
} as const;

// Document API Contracts
import {
	DocumentIdSchema,
	DocumentListQuerySchema,
	DocumentSchema,
	UploadDocumentSchema,
} from "../schemas/document.schema";

export const documentAPI = {
	listDocuments: {
		query: DocumentListQuerySchema,
	} as const,
	uploadDocument: {
		body: UploadDocumentSchema,
	} as const,
	deleteDocument: {
		params: DocumentIdSchema,
	} as const,
	signDocument: {
		params: DocumentIdSchema,
	} as const,
	document: {
		schema: DocumentSchema,
	} as const,
} as const;

// NOTE: ClosureReport API removed — legacy schema deprecated in v2.0
// Use reportAPI instead for all report-related operations

// ============================================================================
// Generic API Response Types
// ============================================================================

/**
 * Legacy API envelope format - preserved for backward compatibility
 * @deprecated Use ApiResponse<T> with discriminated unions instead
 *
 * @example
 * ```typescript
 * const response: ApiEnvelope<User> = {
 *   success: true,
 *   data: user,
 * };
 * ```
 */

/** Structured error detail shape */
export type ApiErrorDetail = {
	code: string;
	message: string;
	details?: Record<string, string>;
};

/** Arbitrary metadata map (timestamps, pagination extras, etc.) */
export type ApiMeta = Record<string, string | number | boolean>;

export type ApiEnvelope<T> = {
	success: boolean;
	data: T;
	/** @deprecated Use `error` for structured failures */
	message?: string;
	/** Machine-readable error code from the backend */
	code?: string;
	/** Human-readable or structured error detail */
	error?: string | ApiErrorDetail;
	meta?: ApiMeta;
};

/**
 * Successful API response with discriminated union (status: 'success')
 * Use this for type-safe response handling with proper narrowing
 *
 * @example
 * ```typescript
 * const response: ApiSuccess<User> = {
 *   status: 'success',
 *   data: user,
 *   meta: { timestamp: Date.now() },
 * };
 * ```
 */
export type ApiSuccess<T> = {
	status: "success";
	data: T;
	meta?: ApiMeta;
};

/**
 * Error API response with discriminated union (status: 'error')
 * Provides structured error information with optional details
 *
 * @example
 * ```typescript
 * const response: ApiError = {
 *   status: 'error',
 *   error: {
 *     code: 'AUTH_FAILED',
 *     message: 'Invalid credentials',
 *     details: { attempts: 3 },
 *   },
 * };
 * ```
 */
export type ApiError = {
	status: "error";
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
};

/**
 * Discriminated union for API responses
 * Enables type-safe response handling with TypeScript's control flow analysis
 *
 * @example
 * ```typescript
 * function handleResponse<T>(response: ApiResponse<T>) {
 *   if (response.status === 'success') {
 *     // TypeScript knows response.data exists here
 *     console.log(response.data);
 *   } else {
 *     // TypeScript knows response.error exists here
 *     console.error(response.error.message);
 *   }
 * }
 * ```
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Type guard to check if API response is successful
 * Narrows the type to ApiSuccess<T> for type-safe access to data
 *
 * @example
 * ```typescript
 * const response = await fetchUser();
 * if (isApiSuccess(response)) {
 *   console.log(response.data.name); // Type-safe access
 * }
 * ```
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
	return response.status === "success";
}

/**
 * Type guard to check if API response is an error
 * Narrows the type to ApiError for type-safe access to error details
 *
 * @example
 * ```typescript
 * const response = await fetchUser();
 * if (isApiError(response)) {
 *   console.error(response.error.code); // Type-safe access
 * }
 * ```
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
	return response.status === "error";
}

// ============================================================================
// Additional API Types (missing and causing frontend errors)
// ============================================================================

/**
 * Generic API body type for request payloads
 */
export type ApiBody<T> = T;

/**
 * Paginated response wrapper
 */
export type PaginatedResponse<T> = {
	items: T[];
	page: number;
	pages: number;
	total: number;
	limit: number;
};
