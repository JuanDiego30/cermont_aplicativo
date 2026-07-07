import type {
	CostCatalogItem as CostCatalogItemSnapshot,
	CostCatalogList,
	CreateCostCatalogItemInput,
	ListCostCatalogQuery,
} from "@cermont/shared-types";
import type { QueryFilter } from "mongoose";
import { AppError } from "../../common/errors/AppError";
import { CostCatalogItem } from "../../models";
import type { ICostCatalogItemDocument } from "../../models/CostCatalogItem";
import { createAuditLog } from "../audit/audit.service";

function formatCatalogItem(item: ICostCatalogItemDocument): CostCatalogItemSnapshot {
	return {
		_id: item._id.toString(),
		code: item.code,
		name: item.name,
		description: item.description
			? { status: "present", value: item.description }
			: { status: "absent" },
		category: item.category,
		unit: item.unit,
		unitPrice: Number(item.unitPrice),
		currency: item.currency,
		isActive: item.isActive,
		createdAt: item.createdAt.toISOString(),
		updatedAt: item.updatedAt.toISOString(),
	};
}

export async function listCostCatalog(query: ListCostCatalogQuery): Promise<CostCatalogList> {
	const page = query.page ?? 1;
	const limit = query.limit ?? 20;
	const filter: QueryFilter<ICostCatalogItemDocument> = {
		isActive: true,
	};
	if (query.category) {
		filter.category = query.category;
	}
	const search = query.search?.trim();
	if (search) {
		const escapedSearch = search.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
		const pattern = new RegExp(escapedSearch, "i");
		filter.$or = [{ code: pattern }, { name: pattern }];
	}

	const [items, total] = await Promise.all([
		CostCatalogItem.find(filter)
			.sort({ category: 1, name: 1, _id: 1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean<ICostCatalogItemDocument[]>(),
		CostCatalogItem.countDocuments(filter),
	]);

	return {
		items: items.map(formatCatalogItem),
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export async function createCostCatalogItem(
	input: CreateCostCatalogItemInput,
	userId: string,
): Promise<CostCatalogItemSnapshot> {
	const normalizedCode = input.code.trim().toUpperCase();
	const duplicateCount = await CostCatalogItem.countDocuments({ code: normalizedCode });

	if (duplicateCount > 0) {
		throw new AppError(
			`A catalog item with code ${normalizedCode} already exists`,
			409,
			"COST_CATALOG_CODE_ALREADY_EXISTS",
		);
	}

	const created = await CostCatalogItem.create({
		...input,
		code: normalizedCode,
	});

	await createAuditLog({
		userId,
		entity: "CostCatalogItem",
		entityId: created._id.toString(),
		action: "COST_CATALOG_ITEM_CREATED",
		after: {
			code: created.code,
			name: created.name,
			category: created.category,
			unit: created.unit,
			unitPrice: created.unitPrice,
			currency: created.currency,
		},
	});

	return formatCatalogItem(created);
}
