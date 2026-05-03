/**
 * Maintenance Kit Service for Cermont Backend.
 *
 * Handles kit management business logic:
 * - CRUD operations for enterprise job plans
 * - Duplicate validation
 * - Server-side code/version/cost calculation
 * - Soft deactivation
 */

import type {
	ActivityType,
	CreateMaintenanceKit,
	KitMaterial,
	MaintenanceKitDocument,
	UpdateMaintenanceKit,
} from "@cermont/shared-types";
import { AppError } from "../../_shared/common/errors";
import {
	createLogger,
	escapeRegExp,
	normalizeBoolean,
	normalizeQuantity,
	normalizeText,
} from "../../_shared/common/utils";
import { parseObjectId } from "../../_shared/common/utils/parseObjectId";
import { container } from "../../_shared/config/container";

const log = createLogger("kit-service");

export interface CreateKitData extends Partial<CreateMaintenanceKit> {
	activity_type?: string;
	isActive?: boolean;
	is_active?: boolean;
}

export interface UpdateKitData extends Partial<UpdateMaintenanceKit> {
	activity_type?: string;
	is_active?: boolean;
}

function toDate(value: string | Date | undefined): Date | undefined {
	if (!value) {
		return undefined;
	}
	return value instanceof Date ? value : new Date(value);
}

async function generateKitCode(): Promise<string> {
	const now = new Date();
	const yearMonth = now.toISOString().slice(0, 7).replace("-", "");
	const seq = await container.counterRepository.inc(`kit-${yearMonth}`);
	return `KIT-${yearMonth}-${String(seq).padStart(4, "0")}`;
}

function bumpMinorVersion(version: string | undefined): string {
	const match = /^v(\d+)\.(\d+)$/.exec(version ?? "v1.0");
	if (!match) {
		return "v1.1";
	}

	return `v${match[1]}.${Number(match[2]) + 1}`;
}

function calculateBaseMaterialCost(materials: KitMaterial[] | undefined): number {
	return (materials ?? []).reduce(
		(total, material) => total + material.estimatedQuantity * (material.estimatedUnitCost ?? 0),
		0,
	);
}

function mapTool(
	tool: Partial<CreateMaintenanceKit["tools"][number]> & { specifications?: unknown },
): { name: string; quantity: number; specifications?: string } | null {
	const name = normalizeText(tool.name);
	const quantity = normalizeQuantity(tool.quantity);

	if (!name || quantity === undefined) {
		return null;
	}

	const specifications = normalizeText(tool.specifications);

	return {
		name,
		quantity,
		...(specifications ? { specifications } : {}),
	};
}

function mapEquipment(
	item: Partial<CreateMaintenanceKit["equipment"][number]> & {
		certificateRequired?: unknown;
		certificate_required?: unknown;
	},
): { name: string; quantity: number; certificate_required: boolean } | null {
	const name = normalizeText(item.name);
	const quantity = normalizeQuantity(item.quantity);

	if (!name || quantity === undefined) {
		return null;
	}

	const certificateRequired =
		normalizeBoolean(item.certificateRequired ?? item.certificate_required) ?? false;

	return {
		name,
		quantity,
		certificate_required: certificateRequired,
	};
}

function mapProcedureSteps(steps: CreateMaintenanceKit["procedureSteps"] | undefined) {
	return (steps ?? []).map((step, index) => ({
		order: step.order || index + 1,
		description: step.description,
		type: step.type,
		...(step.expectedValue ? { expected_value: step.expectedValue } : {}),
		...(step.estimatedMinutes !== undefined ? { estimated_minutes: step.estimatedMinutes } : {}),
		required: step.required ?? true,
		...(step.referenceDocumentId
			? { reference_document_id: parseObjectId(step.referenceDocumentId) }
			: {}),
	}));
}

function mapMaterials(materials: KitMaterial[] | undefined) {
	return (materials ?? []).map((material) => ({
		name: material.name,
		...(material.sku ? { sku: material.sku } : {}),
		estimated_quantity: material.estimatedQuantity,
		unit: material.unit,
		...(material.estimatedUnitCost !== undefined
			? { estimated_unit_cost: material.estimatedUnitCost }
			: {}),
		critical: material.critical ?? false,
	}));
}

function mapSafety(safety: CreateMaintenanceKit["safety"] | undefined) {
	if (!safety) {
		return undefined;
	}

	return {
		minimum_ppe: safety.minimumPpe ?? [],
		required_permits: safety.requiredPermits ?? [],
		risk_classification: safety.riskClassification,
		specific_risks: safety.specificRisks ?? [],
		...(safety.safetyObservations ? { safety_observations: safety.safetyObservations } : {}),
		requires_loto: safety.requiresLoto ?? false,
	};
}

function mapLinkedChecklists(checklists: CreateMaintenanceKit["linkedChecklists"] | undefined) {
	return (checklists ?? []).map((checklist) => ({
		template_id: checklist.templateId,
		timing: checklist.timing,
		blocking: checklist.blocking ?? false,
	}));
}

function mapAssignmentRules(rules: CreateMaintenanceKit["assignmentRules"] | undefined) {
	if (!rules) {
		return {
			required_certifications: [],
			minimum_people: 1,
			requires_on_site_supervisor: false,
		};
	}

	return {
		...(rules.requiredSpecialty ? { required_specialty: rules.requiredSpecialty } : {}),
		required_certifications: rules.requiredCertifications ?? [],
		minimum_people: rules.minimumPeople ?? 1,
		requires_on_site_supervisor: rules.requiresOnSiteSupervisor ?? false,
	};
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one mapper keeps the enterprise kit payload-to-document conversion centralized.
function buildOperationalDocument(data: CreateKitData | UpdateKitData): Record<string, unknown> {
	const doc: Record<string, unknown> = {};

	const name = normalizeText(data.name);
	if (name) {
		doc.name = name;
	}

	const activityType = normalizeText(data.activityType ?? data.activity_type);
	if (activityType) {
		doc.activity_type = activityType as ActivityType;
	}

	const subtype = normalizeText(data.subtype);
	if (subtype) {
		doc.subtype = subtype;
	}

	const description = normalizeText(data.description);
	if (description) {
		doc.description = description;
	}

	if (data.estimatedHours !== undefined) {
		doc.estimated_hours = data.estimatedHours;
	}

	if (data.maintenanceClassification) {
		doc.maintenance_classification = data.maintenanceClassification;
	}

	if (data.assetScopes !== undefined) {
		doc.asset_scopes = data.assetScopes;
	}

	if (data.tools !== undefined) {
		doc.tools = data.tools
			.map(mapTool)
			.filter((tool): tool is NonNullable<typeof tool> => tool !== null);
	}

	if (data.equipment !== undefined) {
		doc.equipment = data.equipment
			.map(mapEquipment)
			.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
	}

	if (data.procedureSteps !== undefined) {
		doc.procedure_steps = mapProcedureSteps(data.procedureSteps);
	}

	if (data.materials !== undefined) {
		doc.materials = mapMaterials(data.materials);
		doc.base_material_cost = calculateBaseMaterialCost(data.materials);
	}

	if (data.safety !== undefined) {
		doc.safety = mapSafety(data.safety);
	}

	if (data.linkedChecklists !== undefined) {
		doc.linked_checklists = mapLinkedChecklists(data.linkedChecklists);
	}

	if (data.assignmentRules !== undefined) {
		doc.assignment_rules = mapAssignmentRules(data.assignmentRules);
	}

	if (data.validatedBy !== undefined) {
		doc.validated_by = parseObjectId(data.validatedBy);
	}

	if (data.lastReviewedAt !== undefined) {
		doc.lastReviewedAt = toDate(data.lastReviewedAt);
	}

	if (data.nextReviewAt !== undefined) {
		doc.nextReviewAt = toDate(data.nextReviewAt);
	}

	const internalNotes = normalizeText(data.internalNotes);
	if (internalNotes) {
		doc.internal_notes = internalNotes;
	}

	const isActive = normalizeBoolean(data.isActive ?? data.is_active);
	if (isActive !== undefined) {
		doc.is_active = isActive;
	}

	return doc;
}

function hasOperationalChanges(updates: UpdateKitData): boolean {
	return [
		"name",
		"activityType",
		"activity_type",
		"subtype",
		"description",
		"estimatedHours",
		"maintenanceClassification",
		"assetScopes",
		"tools",
		"equipment",
		"procedureSteps",
		"materials",
		"safety",
		"linkedChecklists",
		"assignmentRules",
	].some((key) => Object.hasOwn(updates, key));
}

export const MaintenanceKitService = {
	async create(data: CreateKitData, userId: string): Promise<MaintenanceKitDocument> {
		const normalizedName = normalizeText(data.name);
		if (normalizedName) {
			const existing = await container.maintenanceKitRepository.findOneLean({
				name: normalizedName,
			});
			if (existing) {
				throw new AppError("A kit with this name already exists", 409, "DUPLICATE_KIT_NAME");
			}
		}

		const code = data.code ?? (await generateKitCode());
		const existingCode = await container.maintenanceKitRepository.findOneLean({ code });
		if (existingCode) {
			throw new AppError("A kit with this code already exists", 409, "DUPLICATE_KIT_CODE");
		}

		const createDoc: Partial<MaintenanceKitDocument> = {
			...buildOperationalDocument(data),
			code,
			created_by: userId,
			is_active: data.isActive ?? true,
			version: "v1.0",
			version_history: [
				{
					version: "v1.0",
					changedAt: new Date(),
					changed_by: userId,
					reason: "Creación inicial del kit",
				},
			],
		} as Partial<MaintenanceKitDocument>;

		const kit = await container.maintenanceKitRepository.create(createDoc);

		log.info("Kit created", { kitId: String(kit._id), name: normalizedName ?? data.name, code });
		return kit;
	},

	async findAll(
		filters: {
			activityType?: unknown;
			activity_type?: unknown;
			isActive?: unknown;
			is_active?: unknown;
			search?: unknown;
		},
		page: number = 1,
		limit: number = 50,
	): Promise<{ data: MaintenanceKitDocument[]; total: number }> {
		const where: Record<string, unknown> = {};
		const activityType = normalizeText(filters.activityType ?? filters.activity_type);
		const isActive = normalizeBoolean(filters.isActive ?? filters.is_active);
		const search = normalizeText(filters.search);

		if (activityType) {
			where.activity_type = activityType;
		}
		if (isActive !== undefined) {
			where.is_active = isActive;
		}
		if (search) {
			where.$or = [
				{ name: { $regex: escapeRegExp(search), $options: "i" } },
				{ code: { $regex: escapeRegExp(search), $options: "i" } },
			];
		}

		const [data, total] = await Promise.all([
			container.maintenanceKitRepository.findPaginated(where, {
				skip: (page - 1) * limit,
				limit,
				sort: { activity_type: 1, name: 1 },
			}),
			container.maintenanceKitRepository.countDocuments(where),
		]);

		return { data, total };
	},

	async findById(id: string): Promise<MaintenanceKitDocument> {
		const kit = await container.maintenanceKitRepository.findByIdPopulated(id);
		if (!kit) {
			throw new AppError("Kit not found", 404, "KIT_NOT_FOUND");
		}
		return kit;
	},

	async update(
		id: string,
		updates: UpdateKitData,
		actorId?: string,
	): Promise<MaintenanceKitDocument> {
		const kit = await container.maintenanceKitRepository.findById(id);
		if (!kit) {
			throw new AppError("Kit not found", 404, "KIT_NOT_FOUND");
		}

		const normalizedName = normalizeText(updates.name);
		if (normalizedName && normalizedName !== kit.name) {
			const existing = await container.maintenanceKitRepository.findOneLean({
				name: normalizedName,
			});
			if (existing) {
				throw new AppError("A kit with this name already exists", 409, "DUPLICATE_KIT_NAME");
			}
		}

		const operationalChanges = hasOperationalChanges(updates);
		if (operationalChanges && !normalizeText(updates.changeReason)) {
			throw new AppError(
				"changeReason is required when operational kit fields change",
				400,
				"KIT_CHANGE_REASON_REQUIRED",
			);
		}

		const updateDoc = buildOperationalDocument(updates);
		Object.assign(kit, updateDoc);

		if (operationalChanges) {
			const nextVersion = bumpMinorVersion(kit.version);
			kit.version = nextVersion;
			kit.version_history = [
				...(kit.version_history ?? []),
				{
					version: nextVersion,
					changedAt: new Date(),
					changed_by: actorId ?? kit.created_by,
					reason: normalizeText(updates.changeReason) ?? "Actualización operacional",
				},
			];
		}

		return container.maintenanceKitRepository.save(kit);
	},

	async delete(id: string): Promise<void> {
		const kit = await container.maintenanceKitRepository.findById(id);
		if (!kit) {
			throw new AppError("Kit not found", 404, "KIT_NOT_FOUND");
		}

		kit.is_active = false;
		await container.maintenanceKitRepository.save(kit);

		log.info("Kit deactivated", { kitId: id });
	},
};
