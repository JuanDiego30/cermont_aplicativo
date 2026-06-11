/**
 * Kit Service — Business Logic Layer
 *
 * Full CRUD + lifecycle operations for professional kit templates.
 * Uses domain rules from @cermont/domain for delete/archive/readiness decisions.
 */

import type { KitDomainModel } from "@cermont/domain";
import {
	calculateKitReadiness,
	canApplyKitToPlanning,
	canArchiveKit,
	canDeleteKit,
	canRestoreKit,
} from "@cermont/domain";
import { Types } from "mongoose";
import {
	BadRequestError,
	NotFoundError,
	ServiceUnavailableError,
} from "../../common/errors/AppError";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import { type IKitDocument, Kit, type KitItem } from "../../models/Kit";
import { createAuditLog } from "../audit/audit.service";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface KitDocRequirement {
	id?: string;
	name: string;
	description?: string;
	isRequired?: boolean;
	documentType?: string;
}
export interface KitChecklistReq {
	id?: string;
	name: string;
	description?: string;
	isRequired?: boolean;
	stage?: string;
	checklistTemplateId?: string;
}

export interface CreateKitCommand {
	name: string;
	description?: string;
	code?: string;
	activityType: string;
	serviceCategory?: string;
	businessUnit?: string;
	riskLevel?: string;
	estimatedDurationHours?: number;
	isDefault?: boolean;
	tags?: string[];
	tools?: KitItem[];
	electricalTools?: KitItem[];
	constructionEquipment?: KitItem[];
	heightSafetyKit?: KitItem[];
	materials?: KitItem[];
	epp?: KitItem[];
	instruments?: KitItem[];
	vehicles?: KitItem[];
	documents?: KitDocRequirement[];
	checklists?: KitChecklistReq[];
	readinessRules?: {
		id?: string;
		name: string;
		condition: string;
		message: string;
		severity?: string;
		active?: boolean;
	}[];
	requiredCertifications?: string[];
	requiredPermits?: string[];
	requiredAst?: boolean;
	requiredEvidenceTypes?: string[];
}

export interface UpdateKitCommand extends Partial<CreateKitCommand> {
	status?: string;
}

export interface KitFilters {
	status?: string;
	activityType?: string;
	serviceCategory?: string;
	riskLevel?: string;
	search?: string;
	tags?: string;
}

export interface PaginationOptions {
	page?: number;
	limit?: number;
}

export interface PageEnvelope<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function toDomainModel(kit: IKitDocument): KitDomainModel {
	return {
		id: kit._id.toString(),
		name: kit.name,
		status: kit.status,
		usageCount: kit.usageCount,
		isDefault: kit.isDefault,
		version: kit.version,
		tools: (kit.tools || []).map((t) => ({
			id: t.id,
			category: t.category,
			name: t.name,
			quantity: t.quantity,
			unit: t.unit,
			isCritical: t.isCritical,
			isOptional: t.isOptional,
			requiresCertification: t.requiresCertification,
		})),
		electricalTools: (kit.electricalTools || []).map((t) => ({
			id: t.id,
			category: t.category,
			name: t.name,
			quantity: t.quantity,
			unit: t.unit,
			isCritical: t.isCritical,
			isOptional: t.isOptional,
			requiresCertification: t.requiresCertification,
		})),
		constructionEquipment: (kit.constructionEquipment || []).map((t) => ({
			id: t.id,
			category: t.category,
			name: t.name,
			quantity: t.quantity,
			unit: t.unit,
			isCritical: t.isCritical,
			isOptional: t.isOptional,
			requiresCertification: t.requiresCertification,
		})),
		heightSafetyKit: (kit.heightSafetyKit || []).map((t) => ({
			id: t.id,
			category: t.category,
			name: t.name,
			quantity: t.quantity,
			unit: t.unit,
			isCritical: t.isCritical,
			isOptional: t.isOptional,
			requiresCertification: t.requiresCertification,
		})),
		materials: (kit.materials || []).map((t) => ({
			id: t.id,
			category: t.category,
			name: t.name,
			quantity: t.quantity,
			unit: t.unit,
			isCritical: t.isCritical,
			isOptional: t.isOptional,
			requiresCertification: t.requiresCertification,
		})),
		epp: (kit.epp || []).map((t) => ({
			id: t.id,
			category: t.category,
			name: t.name,
			quantity: t.quantity,
			unit: t.unit,
			isCritical: t.isCritical,
			isOptional: t.isOptional,
			requiresCertification: t.requiresCertification,
		})),
		instruments: (kit.instruments || []).map((t) => ({
			id: t.id,
			category: t.category,
			name: t.name,
			quantity: t.quantity,
			unit: t.unit,
			isCritical: t.isCritical,
			isOptional: t.isOptional,
			requiresCertification: t.requiresCertification,
		})),
		vehicles: (kit.vehicles || []).map((t) => ({
			id: t.id,
			category: t.category,
			name: t.name,
			quantity: t.quantity,
			unit: t.unit,
			isCritical: t.isCritical,
			isOptional: t.isOptional,
			requiresCertification: t.requiresCertification,
		})),
		documents: (kit.documents || []).map((d) => ({
			id: d.id,
			name: d.name,
			isRequired: d.isRequired,
		})),
		checklists: (kit.checklists || []).map((c) => ({
			id: c.id,
			name: c.name,
			isRequired: c.isRequired,
		})),
		readinessRules: (kit.readinessRules || []).map((r) => ({
			id: r.id,
			name: r.name,
			condition: r.condition,
			severity: r.severity,
			active: r.active,
		})),
		requiredCertifications: kit.requiredCertifications || [],
		requiredPermits: kit.requiredPermits || [],
		requiredAst: kit.requiredAst || false,
		riskLevel: kit.riskLevel,
		estimatedDurationHours: kit.estimatedDurationHours,
	};
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: data mapping with many field defaults is inherently high-complexity
function buildKitDocument(data: CreateKitCommand, userId: string): Record<string, unknown> {
	const defaults = {
		status: "draft",
		version: 1,
	};
	return {
		code: data.code,
		name: data.name,
		description: data.description,
		activityType: data.activityType || "general",
		serviceCategory: data.serviceCategory || "otro",
		businessUnit: data.businessUnit || "general",
		...defaults,
		riskLevel: data.riskLevel || "low",
		estimatedDurationHours: data.estimatedDurationHours || undefined,
		isDefault: data.isDefault || false,
		tags: data.tags || [],
		tools: data.tools || [],
		electricalTools: data.electricalTools || [],
		constructionEquipment: data.constructionEquipment || [],
		heightSafetyKit: data.heightSafetyKit || [],
		materials: data.materials || [],
		epp: data.epp || [],
		instruments: data.instruments || [],
		vehicles: data.vehicles || [],
		documents: data.documents || [],
		checklists: data.checklists || [],
		readinessRules: data.readinessRules || [],
		requiredCertifications: data.requiredCertifications || [],
		requiredPermits: data.requiredPermits || [],
		requiredAst: data.requiredAst || false,
		requiredEvidenceTypes: data.requiredEvidenceTypes || [],
		createdBy: new Types.ObjectId(userId),
	};
}

export async function createKit(data: CreateKitCommand, userId: string): Promise<IKitDocument> {
	const kit = await Kit.create(buildKitDocument(data, userId));

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_CREATED",
		after: { name: kit.name, status: kit.status, version: kit.version },
	});

	return kit;
}

export async function getKitById(id: string): Promise<IKitDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid kit ID format", "KIT_INVALID_ID");
	}

	const kit = await Kit.findById(id).lean();

	if (!kit) {
		throw new NotFoundError("Kit", id);
	}

	return kit;
}

export async function getAllKits(
	filters: KitFilters = {},
	pagination: PaginationOptions = {},
): Promise<PageEnvelope<IKitDocument>> {
	const page = pagination.page || 1;
	const limit = pagination.limit || 20;
	const skip = (page - 1) * limit;

	const query: Record<string, unknown> = {};
	if (filters.status) {
		query.status = filters.status;
	}
	if (filters.activityType) {
		query.activityType = filters.activityType;
	}
	if (filters.serviceCategory) {
		query.serviceCategory = filters.serviceCategory;
	}
	if (filters.riskLevel) {
		query.riskLevel = filters.riskLevel;
	}
	if (filters.tags) {
		query.tags = { $in: [filters.tags] };
	}
	if (filters.search) {
		query.$or = [
			{ name: { $regex: filters.search, $options: "i" } },
			{ description: { $regex: filters.search, $options: "i" } },
			{ code: { $regex: filters.search, $options: "i" } },
		];
	}

	let data: IKitDocument[];
	let total: number;

	try {
		[data, total] = await Promise.all([
			Kit.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
			Kit.countDocuments(query),
		]);
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export async function updateKit(
	id: string,
	data: UpdateKitCommand,
	userId: string,
): Promise<IKitDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid kit ID format", "KIT_INVALID_ID");
	}

	const kit = await Kit.findById(id);
	if (!kit) {
		throw new NotFoundError("Kit", id);
	}

	if (kit.status === "voided") {
		throw new BadRequestError("Cannot update a voided kit", "KIT_VOIDED");
	}

	// Apply updates
	const updatableFields: (keyof UpdateKitCommand)[] = [
		"name",
		"description",
		"code",
		"activityType",
		"serviceCategory",
		"businessUnit",
		"riskLevel",
		"estimatedDurationHours",
		"isDefault",
		"tags",
		"tools",
		"electricalTools",
		"constructionEquipment",
		"heightSafetyKit",
		"materials",
		"epp",
		"instruments",
		"vehicles",
		"documents",
		"checklists",
		"readinessRules",
		"requiredCertifications",
		"requiredPermits",
		"requiredAst",
		"requiredEvidenceTypes",
	];

	for (const field of updatableFields) {
		if (data[field] !== undefined) {
			(kit as unknown as Record<string, unknown>)[field] = data[field];
		}
	}

	kit.updatedBy = new Types.ObjectId(userId);
	await kit.save();

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_UPDATED",
		after: { name: kit.name, status: kit.status },
	});

	return kit;
}

// ─── Lifecycle Operations ──────────────────────────────────────────────────

export async function activateKit(id: string, userId: string): Promise<IKitDocument> {
	const kit = await findKitOrThrow(id);

	if (kit.status !== "draft" && kit.status !== "archived") {
		throw new BadRequestError(
			`Cannot activate kit in status "${kit.status}". Only draft or archived kits can be activated.`,
			"KIT_INVALID_STATUS",
		);
	}

	// Archive any other active version of same kit name
	if (kit.isDefault) {
		await Kit.updateMany(
			{ name: kit.name, status: "active", _id: { $ne: kit._id } },
			{ $set: { status: "archived" } },
		);
	}

	kit.status = "active";
	kit.version += 1;
	kit.updatedBy = new Types.ObjectId(userId);
	await kit.save();

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_ACTIVATED",
		after: { name: kit.name, version: kit.version },
	});

	return kit;
}

export async function archiveKit(
	id: string,
	userId: string,
	reason?: string,
): Promise<IKitDocument> {
	const kit = await findKitOrThrow(id);
	const domainModel = toDomainModel(kit);
	const decision = canArchiveKit(domainModel);

	if (!decision.allowed) {
		throw new BadRequestError(decision.reason, "KIT_ARCHIVE_NOT_ALLOWED");
	}

	if (decision.reasonRequired && !reason) {
		throw new BadRequestError(
			"Archive reason is required because this kit has been used in planning.",
			"KIT_ARCHIVE_REASON_REQUIRED",
		);
	}

	kit.status = "archived";
	kit.updatedBy = new Types.ObjectId(userId);
	await kit.save();

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_ARCHIVED",
		after: { name: kit.name, reason },
	});

	return kit;
}

export async function restoreKit(id: string, userId: string): Promise<IKitDocument> {
	const kit = await findKitOrThrow(id);
	const domainModel = toDomainModel(kit);

	if (!canRestoreKit(domainModel)) {
		throw new BadRequestError(
			`Cannot restore kit in status "${kit.status}". Only archived kits can be restored.`,
			"KIT_RESTORE_NOT_ALLOWED",
		);
	}

	kit.status = "draft";
	kit.updatedBy = new Types.ObjectId(userId);
	await kit.save();

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_RESTORED",
		after: { name: kit.name },
	});

	return kit;
}

export async function deleteKit(
	id: string,
	userId: string,
): Promise<{ deleted: boolean; message: string }> {
	const kit = await findKitOrThrow(id);
	const domainModel = toDomainModel(kit);
	const decision = canDeleteKit(domainModel);

	if (!decision.allowed) {
		throw new BadRequestError(decision.reason, "KIT_DELETE_NOT_ALLOWED");
	}

	if (decision.method === "archive") {
		kit.status = "archived";
		kit.updatedBy = new Types.ObjectId(userId);
		await kit.save();

		await createAuditLog({
			userId,
			entity: "Kit",
			entityId: kit._id.toString(),
			action: "KIT_ARCHIVED",
			after: { name: kit.name, reason: "Deleted via delete endpoint — kit was already in use." },
		});

		return {
			deleted: false,
			message:
				"Este kit ya fue usado en planeación. No puede eliminarse físicamente. Se ha archivado para mantener la trazabilidad.",
		};
	}

	await Kit.findByIdAndDelete(id);

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: id,
		action: "KIT_DELETED",
		after: { name: kit.name },
	});

	return { deleted: true, message: "Kit eliminado físicamente." };
}

export async function duplicateKit(
	id: string,
	userId: string,
	newName?: string,
): Promise<IKitDocument> {
	const original = await findKitOrThrow(id);

	const duplicate = await Kit.create({
		code: undefined,
		name: newName || `${original.name} (Copia)`,
		description: original.description,
		activityType: original.activityType,
		serviceCategory: original.serviceCategory,
		businessUnit: original.businessUnit,
		riskLevel: original.riskLevel,
		estimatedDurationHours: original.estimatedDurationHours,
		version: 1,
		status: "draft",
		tags: original.tags,
		tools: original.tools,
		electricalTools: original.electricalTools,
		constructionEquipment: original.constructionEquipment,
		heightSafetyKit: original.heightSafetyKit,
		materials: original.materials,
		epp: original.epp,
		instruments: original.instruments,
		vehicles: original.vehicles,
		documents: original.documents,
		attachments: original.attachments,
		checklists: original.checklists,
		readinessRules: original.readinessRules,
		requiredCertifications: original.requiredCertifications,
		requiredPermits: original.requiredPermits,
		requiredAst: original.requiredAst,
		requiredEvidenceTypes: original.requiredEvidenceTypes,
		createdBy: new Types.ObjectId(userId),
	});

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: duplicate._id.toString(),
		action: "KIT_DUPLICATED",
		after: { originalId: id, name: duplicate.name },
	});

	return duplicate;
}

// ─── Apply to Planning ─────────────────────────────────────────────────────

export async function applyKitToPlanning(
	kitId: string,
	planningId: string,
	userId: string,
): Promise<{
	planningId: string;
	kitId: string;
	addedItems: number;
	duplicatedItems: number;
	missingCriticalItems: string[];
	readinessScore: number;
	readinessStatus: string;
}> {
	const kit = await findKitOrThrow(kitId);
	const domainModel = toDomainModel(kit);

	// Validate using domain rules
	const applyDecision = canApplyKitToPlanning(domainModel, {
		tools: kit.tools.length,
		materials: kit.materials.length,
		epp: kit.epp.length,
	});

	if (!applyDecision.allowed) {
		throw new BadRequestError(applyDecision.blockers.join(" "), "KIT_APPLY_FAILED");
	}

	// Calculate readiness
	const readiness = calculateKitReadiness(domainModel);

	// Track usage
	const now = new Date();
	kit.usageCount += 1;
	kit.lastUsedAt = now;
	kit.usageHistory.push({
		planningId,
		appliedAt: now,
		appliedBy: userId,
		readinessScore: readiness.score,
		readinessStatus: readiness.status,
	} as typeof kit.usageHistory extends (infer U)[] ? U : never);
	kit.updatedBy = new Types.ObjectId(userId);
	await kit.save();

	await createAuditLog({
		userId,
		entity: "Kit",
		entityId: kit._id.toString(),
		action: "KIT_APPLIED_TO_PLANNING",
		after: { planningId, readinessScore: readiness.score, readinessStatus: readiness.status },
	});

	const allItems = [
		...(kit.tools || []),
		...(kit.electricalTools || []),
		...(kit.constructionEquipment || []),
		...(kit.heightSafetyKit || []),
		...(kit.materials || []),
		...(kit.epp || []),
		...(kit.instruments || []),
		...(kit.vehicles || []),
	];

	return {
		planningId,
		kitId: kit._id.toString(),
		addedItems: allItems.length,
		duplicatedItems: 0,
		missingCriticalItems: readiness.missingCriticalItems,
		readinessScore: readiness.score,
		readinessStatus: readiness.status,
	};
}

// ─── Attachments ───────────────────────────────────────────────────────────

export async function addKitAttachment(
	kitId: string,
	attachment: {
		fileName: string;
		originalName: string;
		mimeType: string;
		fileSize: number;
		url: string;
		purpose: string;
		uploadedBy: string;
	},
): Promise<IKitDocument> {
	const kit = await findKitOrThrow(kitId);

	if (kit.status === "voided") {
		throw new BadRequestError("Cannot attach files to a voided kit", "KIT_VOIDED");
	}

	kit.attachments.push(attachment as typeof kit.attachments extends (infer U)[] ? U : never);
	kit.updatedBy = new Types.ObjectId(attachment.uploadedBy);
	await kit.save();

	return kit;
}

export async function removeKitAttachment(
	kitId: string,
	attachmentId: string,
	userId: string,
): Promise<IKitDocument> {
	const kit = await findKitOrThrow(kitId);

	if (kit.status === "voided") {
		throw new BadRequestError("Cannot remove attachments from a voided kit", "KIT_VOIDED");
	}

	const idx = kit.attachments.findIndex((a) => a.id === attachmentId);
	if (idx === -1) {
		throw new NotFoundError("KitAttachment", attachmentId);
	}

	kit.attachments.splice(idx, 1);
	kit.updatedBy = new Types.ObjectId(userId);
	await kit.save();

	return kit;
}

// ─── Catalog Options ───────────────────────────────────────────────────────

export function getCatalogOptions() {
	return {
		toolCategories: [
			{ value: "manual", label: "Herramientas Manuales" },
			{ value: "power", label: "Herramientas Eléctricas" },
			{ value: "pneumatic", label: "Herramientas Neumáticas" },
			{ value: "measuring", label: "Herramientas de Medición" },
			{ value: "cutting", label: "Herramientas de Corte" },
		],
		equipmentCategories: [
			{ value: "scaffolding", label: "Andamios" },
			{ value: "generator", label: "Generadores" },
			{ value: "compressor", label: "Compresores" },
			{ value: "welding", label: "Equipos de Soldadura" },
			{ value: "lifting", label: "Equipos de Izaje" },
			{ value: "pump", label: "Bombas" },
		],
		eppCategories: [
			{ value: "helmet", label: "Casco de Seguridad" },
			{ value: "gloves", label: "Guantes" },
			{ value: "goggles", label: "Gafas de Seguridad" },
			{ value: "harness", label: "Arnés de Seguridad" },
			{ value: "respirator", label: "Respirador" },
			{ value: "earplug", label: "Protección Auditiva" },
			{ value: "boots", label: "Botas de Seguridad" },
			{ value: "vest", label: "Chaleco Reflectivo" },
		],
		materialCategories: [
			{ value: "cable", label: "Cables y Conductores" },
			{ value: "pipe", label: "Tuberías" },
			{ value: "fitting", label: "Accesorios" },
			{ value: "fastener", label: "Fijaciones y Anclajes" },
			{ value: "sealant", label: "Selladores" },
			{ value: "lubricant", label: "Lubricantes" },
			{ value: "paint", label: "Pinturas y Recubrimientos" },
		],
		documentTypes: [
			{ value: "manual", label: "Manual Técnico" },
			{ value: "procedure", label: "Procedimiento" },
			{ value: "datasheet", label: "Hoja de Datos" },
			{ value: "certificate", label: "Certificado" },
			{ value: "drawing", label: "Plano / Diagrama" },
		],
		checklistTypes: [
			{ value: "pre_start", label: "Checklist Pre-Inicio" },
			{ value: "safety", label: "Checklist de Seguridad" },
			{ value: "quality", label: "Checklist de Calidad" },
			{ value: "completion", label: "Checklist de Cierre" },
		],
		permitTypes: [
			{ value: "hot_work", label: "Permiso de Trabajo en Caliente" },
			{ value: "height_work", label: "Permiso de Trabajo en Alturas" },
			{ value: "confined_space", label: "Permiso de Espacio Confinado" },
			{ value: "excavation", label: "Permiso de Excavación" },
			{ value: "electrical", label: "Permiso de Trabajo Eléctrico" },
		],
		astTypes: [
			{ value: "task_risk", label: "AST de la Tarea" },
			{ value: "environmental", label: "AST Ambiental" },
			{ value: "biological", label: "AST Biológico" },
		],
	};
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function findKitOrThrow(id: string): Promise<IKitDocument> {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError("Invalid kit ID format", "KIT_INVALID_ID");
	}

	const kit = await Kit.findById(id);
	if (!kit) {
		throw new NotFoundError("Kit", id);
	}

	return kit;
}
