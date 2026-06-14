import type {
	ActivityType,
	Document as CermontDocument,
	Checklist,
	CompleteChecklistInput,
	CostResponse,
	CreateCostInput,
	CreateOrderInput,
	CreateWorkReportInput,
	MaintenanceKit,
	Order,
	OrderStatus,
	UpdateMaintenanceKit,
	WorkReport,
} from "@cermont/shared-types";
import { type APIRequestContext, request } from "@playwright/test";
import { E2E_ADMIN } from "../auth-credentials";

// Backend runs on port 4000 (see backend/package.json scripts).
const API_BASE_URL = `${(process.env.E2E_API_BASE_URL ?? "http://localhost:4000/api").replace(/\/$/, "")}/`;
const E2E_COST_SUPPORT_PDF = Buffer.from(
	"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n",
	"utf8",
);

type ApiEnvelope<T> = {
	success?: boolean;
	data?: T;
	error?: string;
	message?: string;
};

type E2ECostInput = Omit<
	CreateCostInput,
	"orderId" | "supportEvidenceIds" | "supportDocumentIds"
> & {
	supportEvidenceIds?: string[];
	supportDocumentIds?: string[];
};

function getErrorMessage(body: unknown, fallback: string): string {
	if (body && typeof body === "object") {
		const candidate = body as { message?: unknown; error?: unknown };

		if (typeof candidate.message === "string" && candidate.message.trim()) {
			return candidate.message;
		}

		if (typeof candidate.error === "string" && candidate.error.trim()) {
			return candidate.error;
		}
	}

	return fallback;
}

async function readBody<T>(
	response: Awaited<ReturnType<APIRequestContext["get"]>>,
): Promise<ApiEnvelope<T>> {
	const body = await response.json().catch(() => null);
	return (body ?? {}) as ApiEnvelope<T>;
}

export interface E2EApiClient {
	createOrder(input: CreateOrderInput): Promise<Order>;
	updateOrderStatus(orderId: string, status: OrderStatus, observations?: string): Promise<Order>;
	assignOrder(orderId: string, userId: string): Promise<Order>;
	getUsersByRole(
		role:
			| "gerente"
			| "residente"
			| "supervisor"
			| "operador"
			| "tecnico"
			| "administrativo"
			| "cliente",
	): Promise<Array<{ _id: string; name: string; email: string; role: string }>>;
	createKit(input: {
		name: string;
		activityType: ActivityType;
		tools: Array<{ name: string; quantity: number; specifications?: string }>;
		equipment: Array<{ name: string; quantity: number; certificateRequired: boolean }>;
		isActive?: boolean;
	}): Promise<MaintenanceKit>;
	updateKit(kitId: string, input: UpdateMaintenanceKit): Promise<MaintenanceKit>;
	deleteKit(kitId: string): Promise<MaintenanceKit>;
	getKitByName(name: string): Promise<MaintenanceKit | null>;
	getChecklistByOrderId(orderId: string): Promise<Checklist | null>;
	updateChecklistItem(
		checklistId: string,
		itemId: string,
		completed: boolean,
		observation?: string,
	): Promise<Checklist>;
	completeChecklist(orderId: string, input?: Partial<CompleteChecklistInput>): Promise<Checklist>;
	addCost(orderId: string, input: E2ECostInput): Promise<CostResponse>;
	getCostSummary(orderId: string): Promise<unknown>;
	createReport(orderId: string, input?: Partial<CreateWorkReportInput>): Promise<WorkReport>;
	approveReport(reportId: string): Promise<WorkReport>;
	deleteOrder(orderId: string): Promise<Order>;
	getOrder(orderId: string): Promise<Order>;
	dispose(): Promise<void>;
}

export async function createE2EApiClient(): Promise<E2EApiClient> {
	const requestContext = await request.newContext({ baseURL: API_BASE_URL });
	const loginResponse = await requestContext.post("auth/login", {
		data: {
			email: E2E_ADMIN.email,
			password: E2E_ADMIN.password,
		},
	});
	const loginBody = await readBody<{ accessToken: string }>(loginResponse);
	const accessToken = loginBody.data?.accessToken;

	if (!loginResponse.ok() || loginBody.success === false || !accessToken) {
		await requestContext.dispose();
		throw new Error(getErrorMessage(loginBody, "Failed to authenticate the E2E API client"));
	}

	const authHeaders = { Authorization: `Bearer ${accessToken}` };

	async function send<T>(
		method: "get" | "post" | "patch" | "delete" | "put",
		path: string,
		data?: unknown,
	): Promise<T> {
		const response = await requestContext.fetch(path, {
			method: method.toUpperCase(),
			data,
			headers: authHeaders,
		});

		const body = await readBody<T>(response);

		if (!response.ok() || body.success === false) {
			throw new Error(getErrorMessage(body, `${method.toUpperCase()} ${path} failed`));
		}

		if (body.data === undefined) {
			throw new Error(`Missing response data for ${method.toUpperCase()} ${path}`);
		}

		return body.data;
	}

	async function createCostSupportDocument(orderId: string): Promise<string> {
		const response = await requestContext.fetch("documents", {
			method: "POST",
			headers: authHeaders,
			multipart: {
				title: `Cost support ${orderId}`,
				orderId,
				purpose: "support_document",
				file: {
					name: `cost-support-${orderId}.pdf`,
					mimeType: "application/pdf",
					buffer: E2E_COST_SUPPORT_PDF,
				},
			},
		});
		const body = await readBody<CermontDocument>(response);

		if (!response.ok() || body.success === false) {
			throw new Error(getErrorMessage(body, `Failed to create cost support for order ${orderId}`));
		}

		const documentId = body.data?._id;
		if (!documentId) {
			throw new Error(`Missing support document id for order ${orderId}`);
		}

		return documentId;
	}

	const client: E2EApiClient = {
		async createOrder(input) {
			return send<Order>("post", "orders", input);
		},

		async updateOrderStatus(orderId, status, observations) {
			return send<Order>("patch", `orders/${orderId}/status`, { status, observations });
		},

		async assignOrder(orderId, userId) {
			return send<Order>("patch", `orders/${orderId}/assign`, { userId });
		},

		async getUsersByRole(role) {
			const response = await requestContext.fetch(`users/role/${role}`, {
				method: "GET",
				headers: authHeaders,
			});
			const body =
				await readBody<Array<{ _id: string; name: string; email: string; role: string }>>(response);

			if (!response.ok() || body.success === false) {
				throw new Error(getErrorMessage(body, `Failed to load users with role ${role}`));
			}

			return body.data ?? [];
		},

		async createKit(input) {
			return send<MaintenanceKit>("post", "maintenance/kits", input);
		},

		async updateKit(kitId, input) {
			return send<MaintenanceKit>("patch", `maintenance/kits/${kitId}`, input);
		},

		async deleteKit(kitId) {
			return send<MaintenanceKit>("delete", `maintenance/kits/${kitId}`);
		},

		async getKitByName(name) {
			const response = await requestContext.get("maintenance/kits?limit=100", {
				headers: authHeaders,
			});
			const body = await readBody<MaintenanceKit[]>(response);
			const kits = body.data ?? [];
			return kits.find((kit) => kit.name === name) ?? null;
		},

		async getChecklistByOrderId(orderId) {
			const response = await requestContext.get(`checklists/order/${orderId}`, {
				headers: authHeaders,
			});
			const body = await readBody<Checklist[]>(response);
			if (!response.ok() || body.success === false) {
				throw new Error(getErrorMessage(body, "Failed to load checklist"));
			}
			return body.data?.[0] ?? null;
		},

		async updateChecklistItem(checklistId, itemId, completed, observation) {
			return send<Checklist>("patch", `checklists/${checklistId}/items/${itemId}`, {
				completed,
				observation,
			});
		},

		async completeChecklist(orderId, input = {}) {
			const checklist = await client.getChecklistByOrderId(orderId);

			if (!checklist) {
				throw new Error(`Checklist not found for order ${orderId}`);
			}

			for (const item of checklist.items) {
				if (!item.completed) {
					await client.updateChecklistItem(checklist._id, item.id, true, item.observation);
				}
			}

			return send<Checklist>("patch", `checklists/${checklist._id}/complete`, {
				signature:
					input.signature ??
					"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP+q6jT3QAAAABJRU5ErkJggg==",
				observations: input.observations ?? "Checklist completado por E2E",
			});
		},

		async addCost(orderId, input) {
			const supportEvidenceIds = input.supportEvidenceIds ?? [];
			const supportDocumentIds =
				supportEvidenceIds.length > 0 || input.supportDocumentIds?.length
					? (input.supportDocumentIds ?? [])
					: [await createCostSupportDocument(orderId)];

			return send<CostResponse>("post", "costs", {
				orderId,
				...input,
				supportEvidenceIds,
				supportDocumentIds,
			});
		},

		async getCostSummary(orderId) {
			return send("get", `costs/summary/${orderId}`);
		},

		async createReport(orderId, input = {}) {
			return send<WorkReport>("post", "reports", {
				orderId,
				title: input.title ?? `Work report - ${orderId}`,
				summary: input.summary ?? `Operational summary for order ${orderId}`,
			});
		},

		async approveReport(reportId) {
			return send<WorkReport>("patch", `reports/${reportId}/approve`);
		},

		async deleteOrder(orderId) {
			return send<Order>("delete", `orders/${orderId}`);
		},

		async getOrder(orderId) {
			return send<Order>("get", `orders/${orderId}`);
		},

		async dispose() {
			await requestContext.dispose();
		},
	};

	return client;
}
