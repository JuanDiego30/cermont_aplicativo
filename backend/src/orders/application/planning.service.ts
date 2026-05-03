import type { OrderPlanningKitSnapshot, UpdateOrderPlanningInput } from "@cermont/shared-types";
import { NotFoundError, UnprocessableError } from "../../_shared/common/errors";
import { parseObjectId } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import { getKitTemplate } from "../../_shared/config/kit-templates";
import { MaintenanceKitService } from "../../maintenance/application/service";
import { formatOrderResponse, logAudit, type OrderResponse } from "../domain/helpers";

function isOrderScopedDocument(documentOrderId: unknown, orderId: string): boolean {
	if (!documentOrderId) {
		return true;
	}

	return documentOrderId.toString() === orderId;
}

async function ensureOrderDocument(
	documentId: string,
	orderId: string,
	allowedCategories: string[],
	fieldName: string,
): Promise<void> {
	const document = await container.documentRepository.findByIdLean(documentId);

	if (!document) {
		throw new NotFoundError("Document", documentId);
	}

	if (!allowedCategories.includes(document.category)) {
		throw new UnprocessableError(
			`${fieldName} must reference a document with category ${allowedCategories.join(" or ")}`,
			"ORDER_PLANNING_INVALID_DOCUMENT_CATEGORY",
		);
	}

	if (!isOrderScopedDocument(document.order_id, orderId)) {
		throw new UnprocessableError(
			`${fieldName} must belong to the same order`,
			"ORDER_PLANNING_INVALID_DOCUMENT_SCOPE",
		);
	}
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: explicit snapshot mapping mirrors create-order inheritance and avoids hidden contract drift.
async function resolvePlanningKitSnapshot(
	kitTemplateId: string,
): Promise<OrderPlanningKitSnapshot> {
	const hardcodedKit = getKitTemplate(kitTemplateId);

	if (hardcodedKit) {
		return {
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
		};
	}

	const dbKit = await MaintenanceKitService.findById(kitTemplateId);
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
		kitTemplateId,
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

export function isPlanningComplete(order: {
	planning?: {
		scheduledStartAt?: Date | string;
		estimatedHours?: number;
		crewSize?: number;
		kitTemplateId?: string;
		kitSnapshot?: {
			tools?: Array<unknown>;
			equipment?: Array<unknown>;
		};
		astDocumentId?: string | { toString(): string };
		supportDocumentIds?: Array<string | { toString(): string }>;
	};
}): boolean {
	const planning = order.planning;

	if (!planning) {
		return false;
	}

	const hasKitSnapshot =
		Boolean(planning.kitTemplateId) &&
		Boolean(planning.kitSnapshot) &&
		((planning.kitSnapshot?.tools?.length ?? 0) > 0 ||
			(planning.kitSnapshot?.equipment?.length ?? 0) > 0);

	return Boolean(
		planning.scheduledStartAt &&
			planning.estimatedHours &&
			planning.estimatedHours > 0 &&
			planning.crewSize &&
			planning.crewSize > 0 &&
			hasKitSnapshot &&
			planning.astDocumentId &&
			(planning.supportDocumentIds?.length ?? 0) > 0,
	);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: updateOrderPlanning handles 15+ validation branches - legitimate business complexity
export async function updateOrderPlanning(
	orderId: string,
	payload: UpdateOrderPlanningInput,
	actorId: string,
): Promise<OrderResponse> {
	const order = await container.orderRepository.findById(orderId);

	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	const currentPlanning = order.planning ?? { supportDocumentIds: [] };
	const kitTemplateId = payload.kitTemplateId ?? currentPlanning.kitTemplateId;

	if (payload.astDocumentId) {
		await ensureOrderDocument(payload.astDocumentId, orderId, ["ast"], "astDocumentId");
	}

	if (payload.supportDocumentIds) {
		await Promise.all(
			payload.supportDocumentIds.map((documentId) =>
				ensureOrderDocument(documentId, orderId, ["support"], "supportDocumentIds"),
			),
		);
	}

	const kitSnapshot = kitTemplateId
		? await resolvePlanningKitSnapshot(kitTemplateId)
		: currentPlanning.kitSnapshot;

	order.planning = {
		...currentPlanning,
		...(payload.scheduledStartAt ? { scheduledStartAt: new Date(payload.scheduledStartAt) } : {}),
		...(payload.estimatedHours !== undefined ? { estimatedHours: payload.estimatedHours } : {}),
		...(payload.crewSize !== undefined ? { crewSize: payload.crewSize } : {}),
		...(kitTemplateId ? { kitTemplateId } : {}),
		...(payload.kitSnapshot
			? { kitSnapshot: payload.kitSnapshot }
			: kitSnapshot
				? { kitSnapshot }
				: {}),
		...(payload.personnelAssignments
			? {
					personnelAssignments: payload.personnelAssignments.map((assignment) => ({
						...assignment,
						technicianId: parseObjectId(assignment.technicianId),
					})),
				}
			: {}),
		...(payload.astDocumentId !== undefined
			? { astDocumentId: parseObjectId(payload.astDocumentId) }
			: {}),
		...(payload.supportDocumentIds !== undefined
			? {
					supportDocumentIds: payload.supportDocumentIds.map((documentId) =>
						parseObjectId(documentId),
					),
				}
			: {}),
	};

	if (isPlanningComplete(order)) {
		const now = new Date();
		order.planning.planningReadyAt = now;
		order.planning.planningReadyBy = parseObjectId(actorId);

		// Initialize pre-start verification items for execution phase
		if (!order.executionPhase?.preStartCompletedAt) {
			const verificationItems = [
				{ id: "ast", label: "AST firmada y socializada", checked: false },
				{ id: "ppe", label: "EPP verificado para todo el personal", checked: false },
				{ id: "tools", label: "Checklist de equipos y herramientas", checked: false },
			];

			if (order.hes?.requiresPTW) {
				verificationItems.unshift({
					id: "ptw",
					label: "Permiso de trabajo diligenciado",
					checked: false,
				});
			}

			order.executionPhase = {
				...order.executionPhase,
				preStartVerification: verificationItems,
			};
		}
	} else {
		order.planning.planningReadyAt = undefined;
		order.planning.planningReadyBy = undefined;
	}

	await container.orderRepository.save(order);

	logAudit({
		action: "ORDER_PLANNING_UPDATED",
		entity: "Order",
		entityId: orderId,
		userId: actorId,
		after: {
			planningReadyAt: order.planning.planningReadyAt?.toISOString(),
			kitTemplateId: order.planning.kitTemplateId,
		},
	});

	return formatOrderResponse(order);
}
