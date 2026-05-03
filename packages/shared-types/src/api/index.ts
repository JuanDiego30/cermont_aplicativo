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

import {
	AlertsResponseSchema,
	ApproveProposalSchema,
	AssignOrderSchema,
	AuditLogIdSchema,
	AuditLogsQuerySchema,
	ChatRequestSchema,
	ChecklistResponseSchema,
	CompleteChecklistSchema,
	ConvertProposalToOrderSchema,
	CreateChecklistSchema,
	CreateEvidenceSchema,
	CreateInspectionSchema,
	CreateMaintenanceKitSchema,
	CreateOrderSchema,
	CreateProposalSchema,
	CreateResourceSchema,
	CreateUserSchema,
	CreateWorkReportSchema,
	DashboardKpisQuerySchema,
	DashboardTechnicianWorkloadQuerySchema,
	DashboardTechnicianWorkloadRowSchema,
	DashboardTimeSeriesPointSchema,
	DashboardTimeSeriesQuerySchema,
	DashboardTopAssetSchema,
	DashboardTopAssetsQuerySchema,
	DocumentIdSchema,
	DocumentListQuerySchema,
	DocumentSchema,
	ErrorDashboardQuerySchema,
	EvidenceIdSchema,
	EvidenceOrderIdParamsSchema,
	EvidenceSchema,
	ExtendedKpisQuerySchema,
	ExtendedKpisSchema,
	InspectionIdSchema,
	InspectionOrderIdParamsSchema,
	InspectionSchema,
	ListChecklistsQuerySchema,
	ListProposalsQuerySchema,
	ListReportsQuerySchema,
	ListUsersQuerySchema,
	LoginSchema,
	MaintenanceKitSchema,
	NotificationIdSchema,
	SyncBatchSchema as OfflineSyncBatchSchema,
	SyncResultSchema as OfflineSyncResultSchema,
	OrderIdSchema,
	OrderListQuerySchema,
	OrderSchema,
	ProposalIdSchema,
	ProposalOrderIdParamsSchema,
	ProposalSchema,
	ReportStatusSchema,
	TransitionOrderStatusSchema,
	UpdateChecklistItemSchema,
	UpdateInspectionStatusSchema,
	UpdateMaintenanceKitSchema,
	UpdateOrderSchema,
	UpdateOrderStatusSchema,
	UpdateProposalStatusSchema,
	UpdateResourceSchema,
	UpdateResourceStatusSchema,
	UpdateUserSchema,
	UpdateWorkReportSchema,
	UploadDocumentSchema,
	UserIdParamsSchema,
	UserRoleParamsSchema,
	UserSchema,
	WorkReportSchema,
} from "../schemas";

export const aiAPI = {
	chat: {
		body: ChatRequestSchema,
	} as const,
} as const;

export const analyticsAPI = {
	kpis: {
		query: DashboardKpisQuerySchema,
	} as const,
	extendedKpis: {
		query: ExtendedKpisQuerySchema,
		response: ExtendedKpisSchema,
	} as const,
	timeSeries: {
		query: DashboardTimeSeriesQuerySchema,
		response: DashboardTimeSeriesPointSchema.array(),
	} as const,
	topAssets: {
		query: DashboardTopAssetsQuerySchema,
		response: DashboardTopAssetSchema.array(),
	} as const,
	technicianWorkload: {
		query: DashboardTechnicianWorkloadQuerySchema,
		response: DashboardTechnicianWorkloadRowSchema.array(),
	} as const,
	errorDashboard: {
		query: ErrorDashboardQuerySchema,
	} as const,
	notification: {
		params: NotificationIdSchema,
	} as const,
	alerts: {
		response: AlertsResponseSchema,
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

export const syncAPI = {
	offlineSync: {
		body: OfflineSyncBatchSchema,
		response: OfflineSyncResultSchema,
	} as const,
} as const;

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

export type JsonPrimitive = boolean | number | string;
export interface JsonArray extends Array<JsonValue> {}
export interface JsonObject {
	[key: string]: JsonValue;
}
export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

/**
 * Standard API response body envelope.
 * Used by all backend endpoints that return `{ success, data, meta? }`.
 *
 * @example
 * ```typescript
 * const response: ApiBody<User> = {
 *   success: true,
 *   data: user,
 * };
 * ```
 */
export type ApiBody<T> = {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
	meta?: JsonObject;
};

/**
 * Legacy API envelope format - preserved for backward compatibility
 * @deprecated Use {@link ApiBody} for the same shape without the deprecation warning,
 * or {@link ApiResponse} for discriminated-union responses.
 */
export type ApiEnvelope<T> = ApiBody<T>;

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
	meta?: JsonObject;
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
		details?: JsonValue;
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
