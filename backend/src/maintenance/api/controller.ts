/**
 * Maintenance Kit Controller — Thin HTTP layer for kit management
 *
 * Responsibilities:
 * - Call MaintenanceKitService for business logic
 * - Return standardized HTTP responses
 */

import type {
	MaintenanceKitDocument,
	MaintenanceKit as MaintenanceKitResponse,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../_shared/common/interceptors/response.interceptor";
import {
	offsetToPage,
	parseNumberQuery,
	toIsoString,
	toStringId,
} from "../../_shared/common/utils";
import { getString, requireUser } from "../../_shared/common/utils/request";
import type { KitTemplate } from "../../_shared/config/kit-templates";
import { getKitsByType, listAllKits } from "../../_shared/config/kit-templates";
import { MaintenanceKitService } from "../application/service";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: explicit API serialization keeps snake_case persistence isolated from the shared camelCase contract.
function serializeMaintenanceKit(kit: MaintenanceKitDocument): MaintenanceKitResponse {
	return {
		_id: toStringId(kit._id),
		name: kit.name,
		...(kit.code ? { code: kit.code } : {}),
		activityType: kit.activity_type as MaintenanceKitResponse["activityType"],
		...(kit.subtype ? { subtype: kit.subtype } : {}),
		...(kit.description ? { description: kit.description } : {}),
		...(kit.estimated_hours ? { estimatedHours: kit.estimated_hours } : {}),
		...(kit.maintenance_classification
			? {
					maintenanceClassification:
						kit.maintenance_classification as MaintenanceKitResponse["maintenanceClassification"],
				}
			: {}),
		assetScopes: kit.asset_scopes ?? [],
		tools: kit.tools.map((tool) => ({
			name: tool.name,
			quantity: tool.quantity,
			...(tool.specifications ? { specifications: tool.specifications } : {}),
		})),
		equipment: kit.equipment.map((item) => ({
			name: item.name,
			quantity: item.quantity,
			certificateRequired: Boolean(item.certificate_required),
		})),
		procedureSteps: (kit.procedure_steps ?? []).map((step) => ({
			order: step.order,
			description: step.description,
			type: step.type,
			...(step.expected_value ? { expectedValue: step.expected_value } : {}),
			...(step.estimated_minutes !== undefined ? { estimatedMinutes: step.estimated_minutes } : {}),
			required: Boolean(step.required),
			...(step.reference_document_id
				? { referenceDocumentId: toStringId(step.reference_document_id) }
				: {}),
		})),
		materials: (kit.materials ?? []).map((material) => ({
			name: material.name,
			...(material.sku ? { sku: material.sku } : {}),
			estimatedQuantity: material.estimated_quantity,
			unit: material.unit,
			...(material.estimated_unit_cost !== undefined
				? { estimatedUnitCost: material.estimated_unit_cost }
				: {}),
			critical: Boolean(material.critical),
		})),
		baseMaterialCost: kit.base_material_cost ?? 0,
		...(kit.safety
			? {
					safety: {
						minimumPpe: kit.safety.minimum_ppe ?? [],
						requiredPermits: kit.safety.required_permits ?? [],
						riskClassification: kit.safety.risk_classification,
						specificRisks: kit.safety.specific_risks ?? [],
						...(kit.safety.safety_observations
							? { safetyObservations: kit.safety.safety_observations }
							: {}),
						requiresLoto: Boolean(kit.safety.requires_loto),
					},
				}
			: {}),
		linkedChecklists: (kit.linked_checklists ?? []).map((checklist) => ({
			templateId: checklist.template_id,
			timing: checklist.timing,
			blocking: Boolean(checklist.blocking),
		})),
		assignmentRules: {
			...(kit.assignment_rules?.required_specialty
				? { requiredSpecialty: kit.assignment_rules.required_specialty }
				: {}),
			requiredCertifications: kit.assignment_rules?.required_certifications ?? [],
			minimumPeople: kit.assignment_rules?.minimum_people ?? 1,
			requiresOnSiteSupervisor: Boolean(kit.assignment_rules?.requires_on_site_supervisor),
		},
		...(kit.version ? { version: kit.version } : {}),
		versionHistory: (kit.version_history ?? []).map((entry) => ({
			version: entry.version,
			changedAt: toIsoString(entry.changedAt) ?? new Date().toISOString(),
			changedBy: toStringId(entry.changed_by),
			reason: entry.reason,
		})),
		...(kit.validated_by ? { validatedBy: toStringId(kit.validated_by) } : {}),
		...(kit.lastReviewedAt
			? { lastReviewedAt: toIsoString(kit.lastReviewedAt) ?? new Date().toISOString() }
			: {}),
		...(kit.nextReviewAt
			? { nextReviewAt: toIsoString(kit.nextReviewAt) ?? new Date().toISOString() }
			: {}),
		...(kit.internal_notes ? { internalNotes: kit.internal_notes } : {}),
		isActive: kit.is_active,
		createdBy: toStringId(kit.created_by),
		createdAt: toIsoString(kit.createdAt) ?? new Date().toISOString(),
		updatedAt: toIsoString(kit.updatedAt) ?? new Date().toISOString(),
	};
}

/**
 * GET /api/maintenance/templates
 * Returns combined list of database kits and hardcoded templates
 */
export const getKitTemplates = async (req: Request, res: Response) => {
	const type = getString(req.query.type).trim() || undefined;

	// 1. Get database templates
	const dbKitsResult = await MaintenanceKitService.findAll(
		{
			activityType: type,
			isActive: true,
		},
		1,
		100,
	);

	const dbTemplates = dbKitsResult.data.map((kit) => serializeMaintenanceKit(kit));

	// 2. Get hardcoded templates
	const hardcodedKits = type ? getKitsByType(type as KitTemplate["type"]) : listAllKits();

	const hardcodedTemplates = hardcodedKits.map((kit) => ({
		_id: kit.id,
		name: kit.name,
		activityType: kit.type,
		assetScopes: [],
		tools: kit.materials.map((m) => ({ name: m.name, quantity: m.quantity })),
		equipment: [],
		procedureSteps: [],
		materials: [],
		baseMaterialCost: 0,
		linkedChecklists: [],
		assignmentRules: {
			requiredCertifications: [],
			minimumPeople: 1,
			requiresOnSiteSupervisor: false,
		},
		versionHistory: [],
		isActive: true,
		createdBy: "system",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}));

	return sendSuccess(res, [...dbTemplates, ...hardcodedTemplates]);
};

export const createKit = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const userId = user._id;
	const kit = await MaintenanceKitService.create(req.body, userId);
	return sendCreated(res, serializeMaintenanceKit(kit));
};

export const getAllKits = async (req: Request, res: Response) => {
	const { activityType, isActive, search, limit = "50", offset = "0", page: pageQuery } = req.query;
	const limitValue = parseNumberQuery(limit, 50, 100);
	const pageValue =
		pageQuery !== undefined
			? parseNumberQuery(pageQuery, 1)
			: offsetToPage(getString(offset), limitValue);

	const result = await MaintenanceKitService.findAll(
		{
			activityType,
			isActive,
			search,
		},
		pageValue,
		limitValue,
	);

	return sendPaginated(
		res,
		result.data.map((kit) => serializeMaintenanceKit(kit)),
		result.total,
		pageValue,
		limitValue,
	);
};

export const getKitById = async (req: Request, res: Response) => {
	const kit = await MaintenanceKitService.findById(getString(req.params.id));
	return sendSuccess(res, serializeMaintenanceKit(kit));
};

export const updateKit = async (req: Request, res: Response) => {
	const user = requireUser(req);
	const kit = await MaintenanceKitService.update(getString(req.params.id), req.body, user._id);
	return sendSuccess(res, serializeMaintenanceKit(kit));
};

export const deleteKit = async (req: Request, res: Response) => {
	await MaintenanceKitService.delete(getString(req.params.id));
	return sendSuccess(res, { message: "Kit deactivated successfully" });
};
