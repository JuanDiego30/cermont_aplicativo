import type {
	Checklist,
	ChecklistItem,
	ChecklistStatus,
	UpdateChecklistItemInput,
	CompleteChecklistInput,
	ChecklistItemCategory,
	ChecklistFieldType,
	ChecklistItemDocument
} from "@cermont/shared-types";
import { Types } from "mongoose";
import {
	BadRequestError,
	NotFoundError,
	UnprocessableError,
} from "../../_shared/common/errors";
import { createLogger, toIsoString } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import type { IChecklistDocument } from "../infrastructure/model";

const log = createLogger("checklist-service");

type ChecklistResponse = Checklist;

interface ChecklistListQuery {
	orderId?: string;
	status?: ChecklistStatus;
	page?: number;
	limit?: number;
}

interface ChecklistCreationOptions {
	kitTemplateId?: string;
	kitTemplate?: string;
	idempotencyKey?: string;
}

interface ChecklistTemplateOrder {
	type: string;
}

type StandardChecklistItemInput = Omit<ChecklistItem, "completed">;

const STANDARD_CHECKLIST_ITEMS: StandardChecklistItemInput[] = [
	{
		id: "safety-boots",
		category: "ppe",
		type: "boolean",
		description: "Botas de seguridad en buen estado",
		required: true,
	},
	{
		id: "helmet",
		category: "ppe",
		type: "boolean",
		description: "Casco con barbuquejo",
		required: true,
	},
];

function isChecklistItemCompleted(item: { completed?: boolean }): boolean {
	return Boolean(item.completed);
}

function normalizeText(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function parseObjectId(value: string, fieldName: string): Types.ObjectId {
	if (!Types.ObjectId.isValid(value)) {
		throw new BadRequestError(`Invalid ${fieldName}`, `INVALID_${fieldName.toUpperCase()}`);
	}
	return new Types.ObjectId(value);
}

type RawChecklistItem = {
	id: string;
	category: ChecklistItemCategory;
	type?: ChecklistFieldType;
	description: string;
	required?: boolean;
	options?: string[];
	completed?: boolean;
	value?: unknown;
	completedBy?: Types.ObjectId | string;
	completedAt?: Date | string;
	observation?: string;
};

function formatChecklistItem(
	item: RawChecklistItem | ChecklistItemDocument<string> | ChecklistItem,
): ChecklistItem {
	return {
		id: item.id,
		category: item.category as ChecklistItemCategory,
		type: (item.type as ChecklistFieldType) ?? "boolean",
		description: item.description,
		required: item.required ?? false,
		options: item.options,
		completed: isChecklistItemCompleted(item),
		value: item.value,
		completedBy: item.completedBy?.toString(),
		completedAt: toIsoString(item.completedAt),
		observation: item.observation,
	};
}

function formatChecklistResponse(doc: IChecklistDocument): ChecklistResponse {
	return {
		_id: doc._id.toString(),
		orderId: doc.orderId.toString(),
		templateName: doc.templateName,
		status: doc.status,
		items: (doc.items as Array<RawChecklistItem | ChecklistItem>).map(formatChecklistItem),
		completedAt: toIsoString(doc.completedAt),
		signature: doc.signature,
		observations: doc.observations,
		createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
		updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
	};
}

function generateStandardItems(): RawChecklistItem[] {
	return STANDARD_CHECKLIST_ITEMS.map((item) => ({
		...item,
		category: item.category as ChecklistItemCategory,
		type: item.type as ChecklistFieldType,
		completed: false,
	}));
}

async function resolveChecklistTemplate(
	_order: ChecklistTemplateOrder,
	_options?: ChecklistCreationOptions,
): Promise<{ items: RawChecklistItem[]; templateName: string }> {
	const items = generateStandardItems();
	const templateName = "Estándar";
	return { items, templateName };
}

export async function createChecklist(
	orderId: string,
	_userId: string,
	options?: ChecklistCreationOptions,
): Promise<ChecklistResponse> {
	const orderOid = parseObjectId(orderId, "orderId");

	if (options?.idempotencyKey) {
		const existing = await container.checklistRepository.findOneLean({
			idempotencyKey: options.idempotencyKey,
		});
		if (existing) {
			return formatChecklistResponse(existing as unknown as IChecklistDocument);
		}
	}

	const existing = await container.checklistRepository.findOneLean({ orderId: orderOid });
	if (existing) {
		return formatChecklistResponse(existing as unknown as IChecklistDocument);
	}

	const orderResult = await container.orderRepository.findByIdLean(orderId);
	if (!orderResult) {
		throw new NotFoundError("Order", orderId);
	}

	if (orderResult.status === "closed" || orderResult.status === "cancelled") {
		throw new UnprocessableError(
			"Cannot create checklist for a closed or cancelled order",
			"CHECKLIST_ORDER_NOT_EDITABLE",
		);
	}

	const { items, templateName } = await resolveChecklistTemplate(
		orderResult as unknown as ChecklistTemplateOrder,
		options,
	);

	const doc = await container.checklistRepository.create({
		orderId: orderOid.toString(),
		templateName,
		status: "pending",
		items: items as unknown as ChecklistItemDocument<string>[],
		idempotencyKey: options?.idempotencyKey,
	});

	log.info("Checklist created", { checklistId: String(doc._id), orderId });
	return formatChecklistResponse(doc as unknown as IChecklistDocument);
}

export async function getChecklistByOrderId(orderId: string): Promise<ChecklistResponse> {
	const orderOid = parseObjectId(orderId, "orderId");
	const doc = await container.checklistRepository.findOneLean({ orderId: orderOid });
	if (!doc) {
		throw new NotFoundError("Checklist for order", orderId);
	}
	return formatChecklistResponse(doc as unknown as IChecklistDocument);
}

export async function findById(id: string): Promise<ChecklistResponse> {
	const doc = await container.checklistRepository.findByIdLean(id);
	if (!doc) {
		throw new NotFoundError("Checklist", id);
	}
	return formatChecklistResponse(doc as unknown as IChecklistDocument);
}

export async function listChecklists(query: ChecklistListQuery): Promise<{
	data: ChecklistResponse[];
	total: number;
	page: number;
	limit: number;
	pages: number;
}> {
	const filter: Record<string, unknown> = {};
	if (query.orderId) {
		filter.orderId = parseObjectId(query.orderId, "orderId");
	}
	if (query.status) {
		filter.status = query.status;
	}

	const page = query.page ?? 1;
	const limit = query.limit ?? 20;
	const skip = (page - 1) * limit;

	const [data, total] = await Promise.all([
		container.checklistRepository.find(filter, {
			skip,
			limit,
			sort: { updatedAt: -1, createdAt: -1 },
		}),
		container.checklistRepository.countDocuments(filter),
	]);

	return {
		data: data.map((doc) => formatChecklistResponse(doc as unknown as IChecklistDocument)),
		total,
		page,
		limit,
		pages: Math.ceil(total / limit),
	};
}

export async function getChecklistsByOrderId(orderId: string): Promise<ChecklistResponse[]> {
	const result = await listChecklists({ orderId, page: 1, limit: 100 });
	return result.data;
}

export async function updateItem(
	checklistId: string,
	itemId: string,
	update: UpdateChecklistItemInput,
	userId: string,
): Promise<ChecklistResponse> {
	const doc = await container.checklistRepository.findById(checklistId);
	if (!doc) {
		throw new NotFoundError("Checklist", checklistId);
	}
	if (doc.status === "completed") {
		throw new UnprocessableError("Cannot update items in a completed checklist");
	}

	const item = doc.items.find((i) => i.id === itemId);
	if (!item) {
		throw new NotFoundError("Checklist item", itemId);
	}

	if (update.completed !== undefined) {
		item.completed = update.completed;
		if (update.completed) {
			item.completedBy = userId;
			item.completedAt = new Date();
		} else {
			item.completedBy = undefined;
			item.completedAt = undefined;
		}
	}

	if (update.value !== undefined) {
		item.value = update.value;
	}

	if (update.observation !== undefined) {
		item.observation = normalizeText(update.observation);
	}

	const allRequiredCompleted = doc.items.every(
		(checklistItem) => !checklistItem.required || isChecklistItemCompleted(checklistItem),
	);

	if (doc.signature && allRequiredCompleted) {
		doc.status = "completed";
		doc.completedAt = new Date();
	}

	await container.checklistRepository.save(doc);
	log.info("Checklist item updated", { checklistId, itemId, userId });
	return formatChecklistResponse(doc as unknown as IChecklistDocument);
}

export async function completeChecklist(
	checklistId: string,
	payload: CompleteChecklistInput,
	userId: string,
): Promise<ChecklistResponse> {
	const doc = await container.checklistRepository.findById(checklistId);
	if (!doc) {
		throw new NotFoundError("Checklist", checklistId);
	}
	if (doc.status === "completed") {
		return formatChecklistResponse(doc as unknown as IChecklistDocument);
	}

	const normalizedSignature = normalizeText(payload.signature);
	if (!normalizedSignature) {
		throw new BadRequestError("Checklist signature is required");
	}

	const incompleteRequired = doc.items.filter(
		(item) => item.required && !isChecklistItemCompleted(item),
	);
	if (incompleteRequired.length > 0) {
		throw new UnprocessableError(
			`Cannot complete checklist: ${incompleteRequired.length} required items pending`,
			"INCOMPLETE_REQUIRED_ITEMS",
		);
	}

	doc.status = "completed";
	doc.completedAt = new Date();
	doc.signature = normalizedSignature;
	doc.observations = normalizeText(payload.observations);

	await container.checklistRepository.save(doc);
	log.info("Checklist completed", { checklistId, userId });
	return formatChecklistResponse(doc as unknown as IChecklistDocument);
}

export const updateChecklistItem = updateItem;
