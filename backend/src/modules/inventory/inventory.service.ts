/**
 * Inventory Service — Tarea 5.2
 *
 * Catálogo de inventario con movimientos (entrada, salida, ajuste,
 * préstamo, devolución), control de stock mínimo y alertas de stock bajo.
 * El stock nunca puede quedar negativo.
 */

import type {
	CreateInventoryItemInput,
	ListInventoryQuery,
	RegisterStockMovementInput,
	UpdateInventoryItemInput,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { InventoryItemModel, StockMovementModel } from "../../models/InventoryItem";

const STOCK_DECREASING_TYPES = new Set(["salida", "prestamo"]);
const STOCK_INCREASING_TYPES = new Set(["entrada", "devolucion"]);

export async function createItem(input: CreateInventoryItemInput, userId: string) {
	const { initialStock, ...fields } = input;
	const existing = await InventoryItemModel.findOne({ name: fields.name });
	if (existing) {
		throw new AppError(
			"Ya existe un item de inventario con ese nombre",
			409,
			"INVENTORY_ITEM_ALREADY_EXISTS",
		);
	}

	const item = await InventoryItemModel.create({
		...fields,
		currentStock: initialStock,
		...(initialStock > 0 ? { lastMovementDate: new Date() } : {}),
		createdBy: userId,
	});

	if (initialStock > 0) {
		await StockMovementModel.create({
			itemId: item._id,
			type: "entrada",
			quantity: initialStock,
			reason: "Stock inicial",
			userId,
			movementDate: new Date(),
		});
	}

	return item;
}

export async function listItems(query: ListInventoryQuery) {
	const { page, limit, category, lowStock, search } = query;
	const filter: Record<string, unknown> = {};
	if (category) {
		filter.category = category;
	}
	if (search) {
		filter.name = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
	}
	if (lowStock) {
		filter.$expr = { $lte: ["$currentStock", "$minStock"] };
	}

	const [items, total] = await Promise.all([
		InventoryItemModel.find(filter)
			.sort({ name: 1 })
			.skip((page - 1) * limit)
			.limit(limit),
		InventoryItemModel.countDocuments(filter),
	]);

	return {
		data: items,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
}

export async function getItemById(id: string) {
	const item = await InventoryItemModel.findById(id);
	if (!item) {
		throw new AppError("Item de inventario no encontrado", 404, "INVENTORY_ITEM_NOT_FOUND");
	}
	return item;
}

export async function updateItem(id: string, input: UpdateInventoryItemInput, userId: string) {
	if (input.name) {
		const duplicate = await InventoryItemModel.findOne({ name: input.name, _id: { $ne: id } });
		if (duplicate) {
			throw new AppError(
				"Ya existe un item de inventario con ese nombre",
				409,
				"INVENTORY_ITEM_ALREADY_EXISTS",
			);
		}
	}
	const item = await InventoryItemModel.findByIdAndUpdate(
		id,
		{ ...input, updatedBy: userId },
		{ returnDocument: "after", runValidators: true },
	);
	if (!item) {
		throw new AppError("Item de inventario no encontrado", 404, "INVENTORY_ITEM_NOT_FOUND");
	}
	return item;
}

/**
 * Register a stock movement. "salida"/"prestamo" decrease, "entrada"/
 * "devolucion" increase, "ajuste" sets an absolute delta (signed via reason).
 */
export async function registerMovement(
	itemId: string,
	input: RegisterStockMovementInput,
	userId: string,
) {
	const item = await getItemById(itemId);

	let delta = input.quantity;
	if (STOCK_DECREASING_TYPES.has(input.type)) {
		delta = -input.quantity;
	} else if (!STOCK_INCREASING_TYPES.has(input.type)) {
		// "ajuste": the quantity provided becomes the new absolute stock
		delta = input.quantity - item.currentStock;
	}

	const newStock = item.currentStock + delta;
	if (newStock < 0) {
		throw new AppError(
			`Stock insuficiente: disponible ${item.currentStock}, solicitado ${input.quantity}`,
			409,
			"INVENTORY_INSUFFICIENT_STOCK",
		);
	}

	const movement = await StockMovementModel.create({
		itemId: item._id,
		type: input.type,
		quantity: input.quantity,
		...(input.reason ? { reason: input.reason } : {}),
		...(input.orderId ? { orderId: input.orderId } : {}),
		userId,
		movementDate: new Date(),
	});

	const updated = await InventoryItemModel.findByIdAndUpdate(
		itemId,
		{ currentStock: newStock, lastMovementDate: new Date(), updatedBy: userId },
		{ returnDocument: "after" },
	);

	return { item: updated, movement };
}

export async function getItemMovements(itemId: string, limit = 50) {
	await getItemById(itemId);
	return StockMovementModel.find({ itemId })
		.sort({ movementDate: -1 })
		.limit(limit)
		.populate("userId", "name");
}

export async function getLowStockItems() {
	return InventoryItemModel.find({ $expr: { $lte: ["$currentStock", "$minStock"] } }).sort({
		name: 1,
	});
}
