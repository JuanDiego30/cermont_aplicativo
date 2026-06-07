import type {
	ChecklistItemCategory,
	Checklist as ChecklistResponse,
	CompleteChecklistInput,
	ListChecklistsQuery,
	UpdateChecklistItemInput,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { escapeRegExp, normalizeText } from "../../common/utils/normalization";
import { getDefaultKitForOrderType } from "../../config/kit-templates";
import { Checklist, MaintenanceKit, Order } from "../../models";
import type { IChecklistDocument } from "../../models/Checklist";

const log = createLogger("checklist-service");

type ChecklistItemSnapshot = ChecklistResponse["items"][number];

const STANDARD_CHECKLIST_ITEMS: Array<{
	id: string;
	category: ChecklistItemCategory;
	description: string;
	required: boolean;
}> = [
	{
		id: "equipment-1",
		category: "equipment",
		description: "Equipo principal revisado y operativo",
		required: true,
	},
	{
		id: "ppe-1",
		category: "ppe",
		description: "Equipo de proteccion personal completo",
		required: true,
	},
	{
		id: "procedure-1",
		category: "procedure",
		description: "Permiso de trabajo y AST verificados",
		required: true,
	},
];

interface ChecklistTemplateOrder {
	type: string;
	code?: string;
	materials?: Array<{
		name: string;
		quantity: number;
		unit: string;
	}>;
}

interface ChecklistCreationOptions {
	kitTemplate?: string;
	idempotencyKey?: string;
}

interface MaintenanceKitTemplate {
	name: string;
	tools: Array<{
		name: string;
		quantity: number;
		specifications?: string;
	}>;
	equipment: Array<{
		name: string;
		quantity: number;
		certificate_required?: boolean;
	}>;
}

function toObjectId(id: string, label: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestError(`Invalid ${label} id`);
	}

	return new Types.ObjectId(id);
}

function formatChecklistItem(item: IChecklistDocument["items"][number]): ChecklistItemSnapshot {
	return {
		id: item.id,
		category: item.category,
		description: item.description,
		required: item.required,
		completed: item.completed,
		completedBy: item.completedBy?.toString(),
		completedAt: item.completedAt?.toISOString(),
		observation: item.observation,
	};
}

function formatChecklistResponse(doc: IChecklistDocument): ChecklistResponse {
	return {
		_id: doc._id.toString(),
		orderId: doc.orderId.toString(),
		templateName: doc.templateName,
		status: doc.status,
		items: doc.items.map(formatChecklistItem),
		completedBy: doc.completedBy?.toString(),
		completedAt: doc.completedAt?.toISOString(),
		signature: doc.signature,
		observations: doc.observations,
		createdAt: doc.createdAt.toISOString(),
		updatedAt: doc.updatedAt.toISOString(),
	};
}

function buildChecklistItems(order: ChecklistTemplateOrder): ChecklistResponse["items"] {
	const kit = getDefaultKitForOrderType(
		order.type as Parameters<typeof getDefaultKitForOrderType>[0],
	);
	// Extract materials if kit was found, otherwise use order materials
	const sourceItems = "materials" in kit ? kit.materials : (order.materials ?? []);

	const kitItems = sourceItems.map((material: { name: string; quantity: number; unit: string }, index: number) => ({
		id: `tool-${index + 1}`,
		category: "tool" as const,
		description: `${material.name} (${material.quantity} ${material.unit})`,
		required: true,
		completed: false,
	}));

	return [
		...kitItems,
		...STANDARD_CHECKLIST_ITEMS.map((item) => ({
			...item,
			completed: false,
		})),
	];
}

function buildMaintenanceKitItems(kit: MaintenanceKitTemplate): ChecklistResponse["items"] {
	const toolItems = kit.tools.map((tool, index) => ({
		id: `tool-${index + 1}`,
		category: "tool" as const,
		description: `${tool.name} (${tool.quantity})${tool.specifications ? ` - ${tool.specifications}` : ""}`,
		required: true,
		completed: false,
	}));

	const equipmentItems = kit.equipment.map((item, index) => ({
		id: `kit-equipment-${index + 1}`,
		category: "equipment" as const,
		description: `${item.name} (${item.quantity})${item.certificate_required ? " - certificación requerida" : ""}`,
		required: true,
		completed: false,
	}));

	return [
		...toolItems,
		...equipmentItems,
		...STANDARD_CHECKLIST_ITEMS.map((item) => ({
			...item,
			completed: false,
		})),
	];
}

async function resolveMaintenanceKit(
	kitTemplate?: string,
): Promise<MaintenanceKitTemplate | undefined> {
	const normalizedKitTemplate = normalizeText(kitTemplate);
	if (!normalizedKitTemplate) {
		return undefined;
	}

	const resolvedKit = Types.ObjectId.isValid(normalizedKitTemplate)
		? await MaintenanceKit.findOne({ _id: normalizedKitTemplate, is_active: true }).lean()
		: await MaintenanceKit.findOne({
				name: new RegExp(`^${escapeRegExp(normalizedKitTemplate)}$`, "i"),
				is_active: true,
			}).lean();

	if (!resolvedKit) {
		return undefined;
	}

	return {
		name: resolvedKit.name,
		tools: resolvedKit.tools,
		equipment: resolvedKit.equipment,
	};
}

async function buildChecklistBlueprint(
	order: ChecklistTemplateOrder,
	kitTemplate?: string,
): Promise<{ templateName: string; items: ChecklistResponse["items"] }> {
	const normalizedKitTemplate = normalizeText(kitTemplate);

	if (normalizedKitTemplate) {
		const maintenanceKit = await resolveMaintenanceKit(normalizedKitTemplate);
		if (maintenanceKit) {
			return {
				templateName: maintenanceKit.name,
				items: buildMaintenanceKitItems(maintenanceKit),
			};
		}

		log.warn("Maintenance kit not found for checklist; falling back to legacy template", {
			kitTemplate: normalizedKitTemplate,
			orderType: order.type || "",
			orderCode: order.code || "",
		});
	} else {
		log.warn("No maintenance kit defined for checklist; falling back to legacy template", {
			orderType: order.type || "",
			orderCode: order.code || "",
		});
	}

	const legacyKit = getDefaultKitForOrderType(
		order.type as Parameters<typeof getDefaultKitForOrderType>[0],
	);

	const templateName = "name" in legacyKit ? legacyKit.name : `Checklist ${order.code}`;
	return {
		templateName,
		items: buildChecklistItems(order),
	};
}

function hasRequiredItemsComplete(checklist: IChecklistDocument): boolean {
	return checklist.items.every((item) => !item.required || item.completed);
}

function recomputeChecklistStatus(checklist: IChecklistDocument): void {
	if (checklist.status === "completed" || checklist.status === "cancelled") {
		return;
	}

	const hasCompletedItems = checklist.items.some((item) => item.completed);
	checklist.status = hasCompletedItems ? "in_progress" : "pending";
}

function finalizeChecklistIfPossible(checklist: IChecklistDocument, userId: string): void {
	if (!checklist.signature || !hasRequiredItemsComplete(checklist)) {
		return;
	}

	checklist.status = "completed";
	checklist.completedBy = toObjectId(userId, "user");
	checklist.completedAt = checklist.completedAt ?? new Date();
}

export async function listChecklists(
	filters: ListChecklistsQuery = {},
): Promise<ChecklistResponse[]> {
	if (filters.orderId) {
		const order = await Order.findById(filters.orderId).lean();
		if (!order) {
			throw new NotFoundError("Order", filters.orderId);
		}
	}

	const query: Record<string, unknown> = {};

	if (filters.orderId) {
		query.orderId = toObjectId(filters.orderId, "order");
	}

	if (filters.status) {
		query.status = filters.status;
	}

	const checklists = await Checklist.find(query).sort({ updatedAt: -1, createdAt: -1 }).lean();
	return checklists.map(formatChecklistResponse);
}

export async function getChecklistsByOrderId(orderId: string): Promise<ChecklistResponse[]> {
	return listChecklists({ orderId });
}

export async function createChecklist(
	orderId: string,
	_userId: string,
	options?: ChecklistCreationOptions,
): Promise<ChecklistResponse> {
	const idempotencyKey = normalizeText(options?.idempotencyKey);

	if (idempotencyKey) {
		const existingByKey = await Checklist.findOne({ idempotencyKey }).lean();
		if (existingByKey) {
			return formatChecklistResponse(existingByKey);
		}
	}

	const order = await Order.findById(orderId).lean();
	if (!order) {
		throw new NotFoundError("Order", orderId);
	}

	const existingChecklist = await Checklist.findOne({ orderId: toObjectId(orderId, "order") });
	if (existingChecklist) {
		if (idempotencyKey && !existingChecklist.idempotencyKey) {
			existingChecklist.idempotencyKey = idempotencyKey;
			await existingChecklist.save();
		}

		return formatChecklistResponse(existingChecklist);
	}

	if (order.status === "closed" || order.status === "cancelled") {
		throw new UnprocessableError(
			"Cannot create a checklist for a closed or cancelled order",
			"CHECKLIST_NOT_ALLOWED",
		);
	}

	const blueprint = await buildChecklistBlueprint(order, options?.kitTemplate);
	const checklist = new Checklist({
		orderId: toObjectId(orderId, "order"),
		templateName: blueprint.templateName,
		idempotencyKey,
		items: blueprint.items,
		status: "pending",
	});

	await checklist.save();
	return formatChecklistResponse(checklist);
}

export async function updateChecklistItem(
	checklistId: string,
	itemId: string,
	payload: UpdateChecklistItemInput,
	userId: string,
): Promise<ChecklistResponse> {
	const checklist = await Checklist.findById(checklistId);
	if (!checklist) {
		throw new NotFoundError("Checklist", checklistId);
	}

	if (checklist.status === "completed" || checklist.status === "cancelled") {
		throw new UnprocessableError(
			"Completed or cancelled checklists cannot be modified",
			"CHECKLIST_LOCKED",
		);
	}

	const item = checklist.items.find((candidate) => candidate.id === itemId);
	if (!item) {
		throw new NotFoundError("Checklist item", itemId);
	}

	item.completed = payload.completed;
	item.observation = normalizeText(payload.observation);

	if (payload.completed) {
		item.completedBy = toObjectId(userId, "user");
		item.completedAt = new Date();
	} else {
		item.completedBy = undefined;
		item.completedAt = undefined;
	}

	recomputeChecklistStatus(checklist);
	finalizeChecklistIfPossible(checklist, userId);

	await checklist.save();
	return formatChecklistResponse(checklist);
}

export async function completeChecklist(
	checklistId: string,
	payload: CompleteChecklistInput,
	userId: string,
): Promise<ChecklistResponse> {
	const checklist = await Checklist.findById(checklistId);
	if (!checklist) {
		throw new NotFoundError("Checklist", checklistId);
	}

	if (checklist.status === "completed") {
		return formatChecklistResponse(checklist);
	}

	if (checklist.status === "cancelled") {
		throw new UnprocessableError(
			"Completed or cancelled checklists cannot be finalized",
			"CHECKLIST_LOCKED",
		);
	}

	if (!hasRequiredItemsComplete(checklist)) {
		throw new UnprocessableError(
			"All required checklist items must be completed before signing",
			"CHECKLIST_ITEMS_PENDING",
		);
	}

	const signature = normalizeText(payload.signature);
	if (!signature) {
		throw new BadRequestError(
			"Signature is required to complete the checklist",
			"CHECKLIST_SIGNATURE_REQUIRED",
		);
	}

	checklist.signature = signature;
	checklist.observations = normalizeText(payload.observations);
	checklist.status = "completed";
	checklist.completedBy = toObjectId(userId, "user");
	checklist.completedAt = new Date();

	await checklist.save();
	return formatChecklistResponse(checklist);
}
