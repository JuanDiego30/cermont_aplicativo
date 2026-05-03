/**
 * Order CRUD Service — Business Logic Layer
 *
 * Handles core CRUD operations for orders:
 * - createOrder: Create new work orders
 * - listOrders: Paginated listing with filters
 * - getOrderByIdWithAuth: Single order retrieval (with ownership check)
 * - updateOrder: Update order fields (not status)
 *
 * State transitions are in order-state.service.ts
 */

import type {
	BatchAssignOrdersInput,
	BatchUpdatePriorityInput,
	BatchUpdateStatusInput,
	OrderListQuery,
	OrderPlanningKitSnapshot,
} from "@cermont/shared-types";
import { ADMIN_ROLES, normalizeUserRole } from "@cermont/shared-types/rbac";
import { ForbiddenError, NotFoundError } from "../../_shared/common/errors";
import { parseObjectId } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import type { MaterialItem } from "../../_shared/config/kit-templates";
import { getDefaultKitForOrderType, getKitTemplate } from "../../_shared/config/kit-templates";
import * as ChecklistSvc from "../../checklists/application/service";
import { MaintenanceKitService } from "../../maintenance/application/service";
import {
	formatOrderResponse,
	generateOrderCode,
	logAudit,
	type OrderResponse,
} from "../domain/helpers";
import { OrderPriority, OrderStatus, OrderType } from "../domain/rules";
import { assignOrder, updateOrderStatus } from "./state.service";

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizeActorId(value: string | { toString(): string }): string {
	return typeof value === "string" ? value : value.toString();
}

function toDate(value: string | undefined): Date | undefined {
	return value ? new Date(value) : undefined;
}

function toObjectId(value: string | undefined) {
	return value ? parseObjectId(value) : undefined;
}

function toObjectIds(values: string[] | undefined) {
	return (values ?? []).map((value) => parseObjectId(value));
}

interface ResolvedOrderKitSetup {
	materials: ResolvedMaterial[];
	appliedKitName: string;
	appliedKitId?: string;
	planningKitSnapshot?: OrderPlanningKitSnapshot;
	inheritedScheduleSla?: EnterpriseCreateOrderPayload["scheduleSla"];
	inheritedHes?: EnterpriseCreateOrderPayload["hes"];
	inheritedResourceAssignment?: EnterpriseCreateOrderPayload["resourceAssignment"];
	inheritedCommercial?: EnterpriseCreateOrderPayload["commercial"];
}

interface ResolvedMaterial extends Omit<MaterialItem, "delivered"> {
	delivered: boolean;
}

type OrderPermitType = NonNullable<
	NonNullable<EnterpriseCreateOrderPayload["hes"]>["permitTypes"]
>[number];
type OrderSpecificRisk = NonNullable<
	NonNullable<EnterpriseCreateOrderPayload["hes"]>["specificRisks"]
>[number];

export interface EnterpriseCreateOrderPayload {
	type: OrderType;
	priority: OrderPriority;
	description: string;
	assetId: string;
	assetName: string;
	location: string;
	gpsLocation?: { lat: number; lng: number; accuracy?: number; capturedAt?: string };
	materials?: MaterialItem[];
	kitTemplate?: string;
	kitTemplateId?: string;
	proposalId?: string;
	poNumber?: string;
	assetDetails?: {
		serialTag?: string;
		model?: string;
		manufacturer?: string;
		lastInterventionAt?: string;
		warrantyStatus?: "active" | "expired" | "na";
		conditionForWork?: "operational" | "out_of_service" | "isolated";
	};
	scheduleSla?: {
		scheduledStartAt?: string;
		dueAt?: string;
		estimatedDuration?: { value?: number; unit?: "hours" | "days" };
		maintenanceWindow?: { startTime?: string; endTime?: string };
		responseLevel?: "emergency" | "urgent" | "standard" | "scheduled";
		recurrence?: {
			enabled?: boolean;
			frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
			endsAt?: string;
		};
	};
	resourceAssignment?: {
		technicianIds?: string[];
		employeeType?: "in_house" | "subcontractor";
		supervisorId?: string;
		hesResponsibleId?: string;
		requiredCertifications?: string[];
		vehicleResourceId?: string;
	};
	hes?: {
		requiresPTW?: boolean;
		permitTypes?: Array<"hot_work" | "confined_space" | "electrical" | "lifting" | "heights">;
		requiresAST?: boolean;
		riskLevel?: "low" | "medium" | "high" | "critical";
		specificRisks?: Array<
			"heights" | "electrical" | "lifting" | "confined_space" | "hazardous_substances"
		>;
		requiresIsolation?: boolean;
		previousPtwNumber?: string;
		safetyObservations?: string;
		ptwDocumentId?: string;
	};
	commercial?: {
		clientName?: string;
		billingAccount?: string;
		poNumber?: string;
		contractNumber?: string;
		businessUnit?: "IT" | "MNT" | "SC" | "GEN";
		priceListName?: string;
		nteAmount?: number;
		proposalReference?: string;
		isBillable?: boolean;
	};
	logistics?: {
		additionalMaterials?: Array<{ name: string; quantity: number; unit: string }>;
		siteAccessNotes?: string;
		requiresSpecialTransport?: boolean;
		specialTransportDescription?: string;
		specialTools?: string;
	};
	references?: {
		attachmentDocumentIds?: string[];
		relatedOrderId?: string;
		parentOrderId?: string;
		internalNotes?: string;
		technicianInstructions?: string;
		prerequisites?: Array<{ label: string; completed: boolean }>;
	};
	costBaseline?: {
		proposalId: string;
		proposalCode: string;
		subtotal: number;
		taxRate: number;
		total: number;
		items: Array<{
			description: string;
			unit: string;
			quantity: number;
			unitCost: number;
			total: number;
		}>;
		poNumber?: string;
		frozenAt: string | Date;
	};
}

function normalizeMaterials(materials?: MaterialItem[]): ResolvedMaterial[] {
	return (materials ?? []).map((material) => ({
		...material,
		delivered: material.delivered ?? false,
	}));
}

function mapKitPermitToOrderPermit(permit: string) {
	const mapping: Record<string, OrderPermitType> = {
		heights: "heights",
		confined_space: "confined_space",
		hot_work: "hot_work",
		electrical_loto: "electrical",
		lifting: "lifting",
	};

	return mapping[permit];
}

function mapKitRiskToOrderRisk(risk: string | undefined) {
	const mapping: Record<string, OrderSpecificRisk> = {
		electrical: "electrical",
		fall: "heights",
		entrapment: "confined_space",
		chemical_contamination: "hazardous_substances",
	};

	return risk ? mapping[risk] : undefined;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: explicit snapshot mapping preserves the full kit audit surface for orders.
function buildDbKitSnapshot(
	dbKit: Awaited<ReturnType<typeof MaintenanceKitService.findById>>,
	kitId: string,
): OrderPlanningKitSnapshot {
	const safety = dbKit.safety
		? {
				minimumPpe: dbKit.safety.minimum_ppe ?? [],
				requiredPermits: dbKit.safety.required_permits ?? [],
				riskClassification: dbKit.safety.risk_classification,
				specificRisks: dbKit.safety.specific_risks ?? [],
				...(dbKit.safety.safety_observations
					? { safetyObservations: dbKit.safety.safety_observations }
					: {}),
				requiresLoto: Boolean(dbKit.safety.requires_loto),
			}
		: undefined;

	return {
		kitTemplateId: kitId,
		name: dbKit.name,
		...(dbKit.code ? { code: dbKit.code } : {}),
		...(dbKit.version ? { version: dbKit.version } : {}),
		activityType: dbKit.activity_type,
		...(dbKit.estimated_hours ? { estimatedHours: dbKit.estimated_hours } : {}),
		tools: dbKit.tools.map((tool) => ({
			name: tool.name,
			quantity: tool.quantity,
			confirmedAvailable: false,
			...(tool.specifications ? { specifications: tool.specifications } : {}),
		})),
		equipment: dbKit.equipment.map((item) => ({
			name: item.name,
			quantity: item.quantity,
			certificateRequired: Boolean(item.certificate_required),
			confirmedAvailable: false,
		})),
		procedureSteps: (dbKit.procedure_steps ?? []).map((step) => ({
			order: step.order,
			description: step.description,
			type: step.type,
			...(step.expected_value ? { expectedValue: step.expected_value } : {}),
			...(step.estimated_minutes !== undefined ? { estimatedMinutes: step.estimated_minutes } : {}),
			required: Boolean(step.required),
			...(step.reference_document_id
				? { referenceDocumentId: step.reference_document_id.toString() }
				: {}),
		})),
		materials: (dbKit.materials ?? []).map((material) => ({
			name: material.name,
			...(material.sku ? { sku: material.sku } : {}),
			estimatedQuantity: material.estimated_quantity,
			unit: material.unit,
			...(material.estimated_unit_cost !== undefined
				? { estimatedUnitCost: material.estimated_unit_cost }
				: {}),
			critical: Boolean(material.critical),
		})),
		baseMaterialCost: dbKit.base_material_cost ?? 0,
		...(safety ? { safety } : {}),
		minimumPpe: safety?.minimumPpe ?? [],
		linkedChecklists: (dbKit.linked_checklists ?? []).map((checklist) => ({
			templateId: checklist.template_id,
			timing: checklist.timing,
			blocking: Boolean(checklist.blocking),
		})),
		assignmentRules: {
			...(dbKit.assignment_rules?.required_specialty
				? { requiredSpecialty: dbKit.assignment_rules.required_specialty }
				: {}),
			requiredCertifications: dbKit.assignment_rules?.required_certifications ?? [],
			minimumPeople: dbKit.assignment_rules?.minimum_people ?? 1,
			requiresOnSiteSupervisor: Boolean(dbKit.assignment_rules?.requires_on_site_supervisor),
		},
	};
}

function buildHardcodedKitSetup(kitId: string): ResolvedOrderKitSetup | null {
	const hardcodedKit = getKitTemplate(kitId);

	if (!hardcodedKit) {
		return null;
	}

	return {
		materials: normalizeMaterials(hardcodedKit.materials),
		appliedKitName: hardcodedKit.name,
		appliedKitId: hardcodedKit.id,
		planningKitSnapshot: {
			kitTemplateId: hardcodedKit.id,
			name: hardcodedKit.name,
			activityType: hardcodedKit.type,
			tools: hardcodedKit.materials.map((material) => ({
				name: material.name,
				quantity: material.quantity,
				confirmedAvailable: false,
			})),
			equipment: [],
			procedureSteps: [],
			materials: [],
			baseMaterialCost: 0,
			linkedChecklists: [],
			minimumPpe: [],
		},
	};
}

async function buildDatabaseKitSetup(kitId: string): Promise<ResolvedOrderKitSetup | null> {
	try {
		const dbKit = await MaintenanceKitService.findById(kitId);
		const kitMaterials =
			(dbKit.materials?.length ?? 0) > 0
				? dbKit.materials?.map((material) => ({
						name: material.name,
						quantity: material.estimated_quantity,
						unit: material.unit,
						unitCost: material.estimated_unit_cost,
						delivered: false,
					}))
				: dbKit.tools.map((tool) => ({
						name: tool.name,
						quantity: tool.quantity,
						unit: "unit",
						delivered: false,
					}));

		const permitTypes = (dbKit.safety?.required_permits ?? [])
			.map(mapKitPermitToOrderPermit)
			.filter((permit): permit is NonNullable<typeof permit> => Boolean(permit));
		const specificRisks = (dbKit.safety?.specific_risks ?? [])
			.map(mapKitRiskToOrderRisk)
			.filter((risk): risk is NonNullable<typeof risk> => Boolean(risk));

		return {
			materials: normalizeMaterials(kitMaterials),
			appliedKitName: dbKit.name,
			appliedKitId: kitId,
			planningKitSnapshot: buildDbKitSnapshot(dbKit, kitId),
			inheritedScheduleSla: dbKit.estimated_hours
				? {
						estimatedDuration: { value: dbKit.estimated_hours, unit: "hours" },
					}
				: undefined,
			inheritedHes: dbKit.safety
				? {
						requiresPTW: permitTypes.length > 0,
						permitTypes,
						riskLevel: dbKit.safety.risk_classification,
						specificRisks,
						requiresIsolation: Boolean(dbKit.safety.requires_loto),
						safetyObservations: dbKit.safety.safety_observations,
					}
				: undefined,
			inheritedResourceAssignment: dbKit.assignment_rules
				? {
						requiredCertifications: dbKit.assignment_rules.required_certifications ?? [],
					}
				: undefined,
			inheritedCommercial:
				(dbKit.base_material_cost ?? 0) > 0 ? { nteAmount: dbKit.base_material_cost } : undefined,
		};
	} catch {
		return null;
	}
}

function buildDefaultKitSetup(type: OrderType): ResolvedOrderKitSetup {
	const defaultKit = getDefaultKitForOrderType(type);

	if (!defaultKit) {
		return {
			materials: [],
			appliedKitName: "Standard",
		};
	}

	return {
		materials: normalizeMaterials(defaultKit.materials),
		appliedKitName: defaultKit.name,
		appliedKitId: defaultKit.id,
		planningKitSnapshot: {
			kitTemplateId: defaultKit.id,
			name: defaultKit.name,
			activityType: defaultKit.type,
			tools: defaultKit.materials.map((material) => ({
				name: material.name,
				quantity: material.quantity,
				confirmedAvailable: false,
			})),
			equipment: [],
			procedureSteps: [],
			materials: [],
			baseMaterialCost: 0,
			linkedChecklists: [],
			minimumPpe: [],
		},
	};
}

async function resolveOrderKitSetup(payload: {
	type: OrderType;
	materials?: MaterialItem[];
	kitTemplateId?: string;
}): Promise<ResolvedOrderKitSetup> {
	const directMaterials = normalizeMaterials(payload.materials);

	if (directMaterials.length > 0) {
		return {
			materials: directMaterials,
			appliedKitName: "Standard",
			appliedKitId: payload.kitTemplateId,
		};
	}

	if (payload.kitTemplateId) {
		const hardcodedKit = buildHardcodedKitSetup(payload.kitTemplateId);
		if (hardcodedKit) {
			return hardcodedKit;
		}

		const dbKit = await buildDatabaseKitSetup(payload.kitTemplateId);
		if (dbKit) {
			return dbKit;
		}
	}

	return buildDefaultKitSetup(payload.type);
}

/**
 * Create a new order
 *
 * @param payload - Order creation payload
 * @param createdBy - User ID creating the order
 * @returns OrderResponse
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: creation maps the enterprise OT contract into legacy-compatible persistence fields.
export async function createOrder(
	payload: EnterpriseCreateOrderPayload,
	createdBy: string,
): Promise<OrderResponse> {
	const data = payload;
	// Generate unique code
	const code = await generateOrderCode();
	const {
		materials,
		appliedKitName,
		appliedKitId,
		planningKitSnapshot,
		inheritedScheduleSla,
		inheritedHes,
		inheritedResourceAssignment,
		inheritedCommercial,
	} = await resolveOrderKitSetup(data);
	const effectiveScheduleSla = {
		...(inheritedScheduleSla ?? {}),
		...(data.scheduleSla ?? {}),
		estimatedDuration:
			data.scheduleSla?.estimatedDuration ?? inheritedScheduleSla?.estimatedDuration,
	};
	const effectiveHes = {
		...(inheritedHes ?? {}),
		...(data.hes ?? {}),
		permitTypes: data.hes?.permitTypes ?? inheritedHes?.permitTypes,
		specificRisks: data.hes?.specificRisks ?? inheritedHes?.specificRisks,
	};
	const effectiveResourceAssignment = {
		...(inheritedResourceAssignment ?? {}),
		...(data.resourceAssignment ?? {}),
		requiredCertifications:
			data.resourceAssignment?.requiredCertifications ??
			inheritedResourceAssignment?.requiredCertifications,
	};
	const effectiveCommercial = {
		...(inheritedCommercial ?? {}),
		...(data.commercial ?? {}),
	};

	const order = await container.orderRepository.create({
		code,
		type: data.type,
		priority: data.priority,
		description: data.description,
		assetId: data.assetId,
		assetName: data.assetName,
		location: data.location,
		gpsLocation: data.gpsLocation
			? {
					...data.gpsLocation,
					capturedAt: data.gpsLocation.capturedAt
						? new Date(data.gpsLocation.capturedAt)
						: new Date(),
				}
			: undefined,
		assetDetails: data.assetDetails
			? {
					serialTag: data.assetDetails.serialTag,
					model: data.assetDetails.model,
					manufacturer: data.assetDetails.manufacturer,
					warrantyStatus: data.assetDetails.warrantyStatus ?? "na",
					conditionForWork: data.assetDetails.conditionForWork,
					lastInterventionAt: data.assetDetails.lastInterventionAt
						? new Date(data.assetDetails.lastInterventionAt)
						: undefined,
				}
			: undefined,
		materials,
		status: "open",
		invoiceReady: false,
		reportGenerated: false,
		planning: {
			...(effectiveScheduleSla.scheduledStartAt
				? { scheduledStartAt: new Date(effectiveScheduleSla.scheduledStartAt) }
				: {}),
			...(effectiveScheduleSla.estimatedDuration?.value
				? {
						estimatedHours:
							effectiveScheduleSla.estimatedDuration.unit === "days"
								? effectiveScheduleSla.estimatedDuration.value * 24
								: effectiveScheduleSla.estimatedDuration.value,
					}
				: {}),
			...(effectiveResourceAssignment.technicianIds?.length
				? { crewSize: effectiveResourceAssignment.technicianIds.length }
				: {}),
			...(appliedKitId ? { kitTemplateId: appliedKitId } : {}),
			...(planningKitSnapshot ? { kitSnapshot: planningKitSnapshot } : {}),
			personnelAssignments: [],
			supportDocumentIds: toObjectIds(data.references?.attachmentDocumentIds),
		},
		scheduleSla: effectiveScheduleSla
			? {
					...effectiveScheduleSla,
					estimatedDuration: {
						unit: effectiveScheduleSla.estimatedDuration?.unit ?? "hours",
						value: effectiveScheduleSla.estimatedDuration?.value,
					},
					maintenanceWindow: effectiveScheduleSla.maintenanceWindow ?? {},
					responseLevel: effectiveScheduleSla.responseLevel,
					scheduledStartAt: toDate(effectiveScheduleSla.scheduledStartAt),
					dueAt: toDate(effectiveScheduleSla.dueAt),
					recurrence: {
						enabled: effectiveScheduleSla.recurrence?.enabled ?? false,
						frequency: effectiveScheduleSla.recurrence?.frequency,
						endsAt: toDate(effectiveScheduleSla.recurrence?.endsAt),
					},
				}
			: undefined,
		resourceAssignment: effectiveResourceAssignment
			? {
					...effectiveResourceAssignment,
					technicianIds: toObjectIds(effectiveResourceAssignment.technicianIds),
					employeeType: effectiveResourceAssignment.employeeType,
					supervisorId: toObjectId(effectiveResourceAssignment.supervisorId),
					hesResponsibleId: toObjectId(effectiveResourceAssignment.hesResponsibleId),
					requiredCertifications: effectiveResourceAssignment.requiredCertifications ?? [],
					vehicleResourceId: toObjectId(effectiveResourceAssignment.vehicleResourceId),
				}
			: undefined,
		hes: effectiveHes
			? {
					...effectiveHes,
					requiresPTW: effectiveHes.requiresPTW ?? false,
					permitTypes: effectiveHes.permitTypes ?? [],
					requiresAST: effectiveHes.requiresAST ?? false,
					riskLevel: effectiveHes.riskLevel ?? "medium",
					specificRisks: effectiveHes.specificRisks ?? [],
					requiresIsolation: effectiveHes.requiresIsolation ?? false,
					ptwDocumentId: toObjectId(effectiveHes.ptwDocumentId),
				}
			: undefined,
		commercial: effectiveCommercial
			? {
					...effectiveCommercial,
					businessUnit: effectiveCommercial.businessUnit,
					isBillable: effectiveCommercial.isBillable ?? false,
				}
			: undefined,
		logistics: data.logistics
			? {
					...data.logistics,
					additionalMaterials: data.logistics.additionalMaterials ?? [],
					requiresSpecialTransport: data.logistics.requiresSpecialTransport ?? false,
				}
			: undefined,
		references: data.references
			? {
					...data.references,
					attachmentDocumentIds: toObjectIds(data.references.attachmentDocumentIds),
					relatedOrderId: toObjectId(data.references.relatedOrderId),
					parentOrderId: toObjectId(data.references.parentOrderId),
					prerequisites: data.references.prerequisites ?? [],
				}
			: undefined,
		...(effectiveResourceAssignment.technicianIds?.[0]
			? { assignedTo: parseObjectId(effectiveResourceAssignment.technicianIds[0]) }
			: {}),
		...(effectiveResourceAssignment.supervisorId
			? { supervisedBy: parseObjectId(effectiveResourceAssignment.supervisorId) }
			: {}),
		billing: {
			sesStatus: "pending",
			invoiceStatus: "pending",
		},
		executionPhase: { preStartVerification: [] },
		...(data.proposalId ? { proposalId: parseObjectId(data.proposalId) } : {}),
		...(data.costBaseline
			? {
					costBaseline: {
						...data.costBaseline,
						proposalId: parseObjectId(data.costBaseline.proposalId),
						frozenAt: new Date(data.costBaseline.frozenAt),
					},
				}
			: {}),
		...(effectiveCommercial.poNumber || data.poNumber
			? { poNumber: (effectiveCommercial.poNumber ?? data.poNumber)?.trim() }
			: {}),
		...(effectiveScheduleSla.dueAt
			? {
					dueDate: new Date(effectiveScheduleSla.dueAt),
					slaDueDate: new Date(effectiveScheduleSla.dueAt),
				}
			: {}),
		createdBy: parseObjectId(createdBy),
	});

	// Create Audit Log for order creation
	logAudit({
		action: "ORDER_CREATED",
		entity: "Order",
		entityId: order._id.toString(),
		userId: createdBy,
		after: {
			code: order.code,
			type: order.type,
			priority: order.priority,
			status: order.status,
		},
	});

	// Create associated checklist
	await ChecklistSvc.createChecklist(order._id.toString(), createdBy, {
		kitTemplateId: appliedKitId,
		kitTemplate: appliedKitName,
	});

	return formatOrderResponse(order);
}

/**
 * Get all orders (paginated, with optional filters)
 */
type OrderListFilters = Partial<OrderListQuery> & {
	role?: string;
	createdBy?: string;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: query construction keeps all order filters in one audited place.
function buildOrdersQuery(filters?: OrderListFilters): Record<string, unknown> {
	const query: Record<string, unknown> = { archived: { $ne: true } };

	if (filters?.status?.length) {
		query.status = { $in: filters.status };
	}
	if (filters?.priority?.length) {
		query.priority = { $in: filters.priority };
	}
	if (filters?.type?.length) {
		query.type = { $in: filters.type };
	}
	const technicianId = filters?.technicianId ?? filters?.assignedTo;
	if (technicianId) {
		query.assignedTo = technicianId;
	}
	if (filters?.dateFrom || filters?.dateTo) {
		query.createdAt = {
			...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
			...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
		};
	}

	const searchTerm = filters?.search?.trim();
	if (searchTerm) {
		const searchRegex = new RegExp(escapeRegExp(searchTerm), "i");
		query.$or = [
			{ code: searchRegex },
			{ description: searchRegex },
			{ assetName: searchRegex },
			{ location: searchRegex },
			{ assignedToName: searchRegex },
		];
	}

	// Role-based visibility
	const normalizedRole = filters?.role ? normalizeUserRole(filters.role) : false;
	if (normalizedRole === "technician" || normalizedRole === "operator") {
		if (technicianId) {
			query.assignedTo = technicianId;
		}
	} else if (normalizedRole === "client") {
		if (filters?.createdBy) {
			query.createdBy = filters.createdBy;
		}
	}

	return query;
}

export async function listOrders(page: number = 1, limit: number = 20, filters?: OrderListFilters) {
	const safeLimit = Math.min(limit, 100);
	const query = buildOrdersQuery(filters);

	const skip = (page - 1) * safeLimit;
	const total = await container.orderRepository.countDocuments(query);
	const orders = await container.orderRepository.findPaginated(query, {
		skip,
		limit: safeLimit,
		sort: { createdAt: -1 },
	});

	const pages = Math.ceil(total / safeLimit);

	return {
		orders: orders.map((order) => formatOrderResponse(order)),
		total,
		page,
		limit: safeLimit,
		pages,
	};
}

export async function listOrdersCursor(
	limit: number = 50,
	cursor?: string,
	filters?: OrderListFilters,
) {
	const safeLimit = Math.min(limit, 100);
	const query = buildOrdersQuery(filters);
	const result = await container.orderRepository.findWithCursor(query, {
		limit: safeLimit,
		cursor,
		sort: { _id: -1 },
	});

	const last = result.items.at(-1);

	return {
		orders: result.items.map((order) => formatOrderResponse(order)),
		pagination: {
			nextCursor: result.hasNextPage && last ? last._id.toString() : null,
			hasNextPage: result.hasNextPage,
		},
	};
}

/**
 * Get order by ID with ownership verification
 */
export async function getOrderByIdWithAuth(
	orderId: string,
	requestingUser: { _id: string | { toString(): string }; role: string },
): Promise<OrderResponse> {
	const order = await container.orderRepository.findByIdLean(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// Check if user has access to this order
	const requestingUserId = normalizeActorId(requestingUser._id);
	const isAdmin = ADMIN_ROLES.includes(requestingUser.role as (typeof ADMIN_ROLES)[number]);
	const isOwner = order.createdBy?.toString() === requestingUserId;
	const isAssigned = order.assignedTo?.toString() === requestingUserId;

	if (!isAdmin && !isOwner && !isAssigned) {
		throw new ForbiddenError("You do not have access to this order");
	}

	const approvedReport = await container.workReportRepository.findOneLean({
		orderId: parseObjectId(orderId),
		status: "approved",
	});

	return formatOrderResponse(order, {
		hasApprovedReport: Boolean(approvedReport),
	});
}

/**
 * Update order fields (name, description, location, etc.) with ownership check
 */
export async function updateOrder(
	orderId: string,
	payload: {
		description?: string;
		location?: string;
		priority?: OrderPriority;
		observations?: string;
	},
	requestingUser?: { _id: string; role: string },
): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	// If user context provided, check ownership (for PUT /api/orders/:id)
	if (requestingUser) {
		const isAdmin = ADMIN_ROLES.includes(requestingUser.role as (typeof ADMIN_ROLES)[number]);
		const isOwner = order.createdBy?.toString() === requestingUser._id;

		if (!isAdmin && !isOwner) {
			throw new ForbiddenError("You do not have permission to update this order");
		}
	}

	if (payload.description) {
		order.description = payload.description;
	}
	if (payload.location) {
		order.location = payload.location;
	}
	if (payload.priority) {
		order.priority = payload.priority;
	}
	if (payload.observations !== undefined) {
		order.observations = payload.observations;
	}

	await container.orderRepository.save(order);
	return formatOrderResponse(order);
}

export async function batchUpdateStatus(
	payload: BatchUpdateStatusInput,
	actorRole: string,
	actorId: string,
): Promise<OrderResponse[]> {
	const results: OrderResponse[] = [];
	for (const orderId of payload.orderIds) {
		results.push(
			await updateOrderStatus(orderId, payload.status, actorRole, actorId, payload.reason),
		);
	}
	return results;
}

export async function batchUpdatePriority(
	payload: BatchUpdatePriorityInput,
	actorId: string,
): Promise<OrderResponse[]> {
	const results: OrderResponse[] = [];
	for (const orderId of payload.orderIds) {
		const order = await container.orderRepository.findById(orderId);
		if (!order) {
			throw new NotFoundError("Order", orderId);
		}

		const previousPriority = order.priority;
		order.priority = payload.priority;
		await container.orderRepository.save(order);

		logAudit({
			action: "PRIORITY_CHANGED",
			entity: "Order",
			entityId: order._id.toString(),
			userId: actorId,
			before: { priority: previousPriority },
			after: { priority: payload.priority },
			metadata: { reason: payload.reason, source: "batch" },
		});

		results.push(formatOrderResponse(order));
	}
	return results;
}

export async function batchAssignOrders(payload: BatchAssignOrdersInput): Promise<OrderResponse[]> {
	const results: OrderResponse[] = [];
	for (const orderId of payload.orderIds) {
		results.push(await assignOrder(orderId, payload.userId));
	}
	return results;
}

// Re-export types for consumers
export type { OrderResponse };
export { OrderPriority, OrderStatus, OrderType };
