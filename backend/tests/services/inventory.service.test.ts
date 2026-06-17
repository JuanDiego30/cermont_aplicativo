/**
 * Inventory Service Tests
 */

import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	itemCreate: vi.fn(),
	itemFind: vi.fn(),
	itemFindById: vi.fn(),
	itemFindOne: vi.fn(),
	itemFindByIdAndUpdate: vi.fn(),
	itemCountDocuments: vi.fn(),
	movementCreate: vi.fn(),
	movementFind: vi.fn(),
}));

vi.mock("../../src/models/InventoryItem", () => ({
	InventoryItemModel: {
		create: mocks.itemCreate,
		find: mocks.itemFind,
		findById: mocks.itemFindById,
		findOne: mocks.itemFindOne,
		findByIdAndUpdate: mocks.itemFindByIdAndUpdate,
		countDocuments: mocks.itemCountDocuments,
	},
	StockMovementModel: {
		create: mocks.movementCreate,
		find: mocks.movementFind,
	},
}));

import * as InventoryService from "../../src/modules/inventory/inventory.service";

const ITEM_ID = "507f1f77bcf86cd799439011";
const USER_ID = "507f1f77bcf86cd799439031";

function buildItem(overrides: Record<string, unknown> = {}) {
	return {
		_id: new Types.ObjectId(ITEM_ID),
		name: "Taladro percutor",
		category: "herramienta",
		currentStock: 5,
		minStock: 2,
		unit: "unidad",
		...overrides,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("InventoryService", () => {
	describe("createItem", () => {
		it("creates an item and registers initial stock movement", async () => {
			mocks.itemFindOne.mockResolvedValue(null);
			const item = buildItem();
			mocks.itemCreate.mockResolvedValue(item);
			mocks.movementCreate.mockResolvedValue({});

			const result = await InventoryService.createItem(
				{
					name: "Taladro percutor",
					category: "herramienta",
					minStock: 2,
					unit: "unidad",
					initialStock: 5,
				},
				USER_ID,
			);

			expect(result).toBe(item);
			expect(mocks.movementCreate).toHaveBeenCalledWith(
				expect.objectContaining({ type: "entrada", quantity: 5 }),
			);
		});

		it("rejects duplicate names", async () => {
			mocks.itemFindOne.mockResolvedValue(buildItem());

			await expect(
				InventoryService.createItem(
					{
						name: "Taladro percutor",
						category: "herramienta",
						minStock: 0,
						unit: "unidad",
						initialStock: 0,
					},
					USER_ID,
				),
			).rejects.toMatchObject({ code: "INVENTORY_ITEM_ALREADY_EXISTS" });
		});
	});

	describe("registerMovement", () => {
		it("decreases stock on salida", async () => {
			mocks.itemFindById.mockResolvedValue(buildItem({ currentStock: 5 }));
			mocks.movementCreate.mockResolvedValue({ type: "salida", quantity: 3 });
			mocks.itemFindByIdAndUpdate.mockResolvedValue(buildItem({ currentStock: 2 }));

			const result = await InventoryService.registerMovement(
				ITEM_ID,
				{ type: "salida", quantity: 3 },
				USER_ID,
			);

			expect(result.item?.currentStock).toBe(2);
			expect(mocks.itemFindByIdAndUpdate).toHaveBeenCalledWith(
				ITEM_ID,
				expect.objectContaining({ currentStock: 2 }),
				{ returnDocument: "after" },
			);
		});

		it("blocks movements that would leave negative stock", async () => {
			mocks.itemFindById.mockResolvedValue(buildItem({ currentStock: 2 }));

			await expect(
				InventoryService.registerMovement(ITEM_ID, { type: "salida", quantity: 5 }, USER_ID),
			).rejects.toMatchObject({ code: "INVENTORY_INSUFFICIENT_STOCK" });
			expect(mocks.movementCreate).not.toHaveBeenCalled();
		});

		it("treats ajuste as absolute stock", async () => {
			mocks.itemFindById.mockResolvedValue(buildItem({ currentStock: 5 }));
			mocks.movementCreate.mockResolvedValue({});
			mocks.itemFindByIdAndUpdate.mockResolvedValue(buildItem({ currentStock: 10 }));

			await InventoryService.registerMovement(ITEM_ID, { type: "ajuste", quantity: 10 }, USER_ID);

			expect(mocks.itemFindByIdAndUpdate).toHaveBeenCalledWith(
				ITEM_ID,
				expect.objectContaining({ currentStock: 10 }),
				{ returnDocument: "after" },
			);
		});
	});
});
