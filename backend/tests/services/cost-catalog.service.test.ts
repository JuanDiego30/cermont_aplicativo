import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	find: vi.fn(),
	countDocuments: vi.fn(),
	findOne: vi.fn(),
	create: vi.fn(),
	createAuditLog: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	CostCatalogItem: {
		find: mocks.find,
		countDocuments: mocks.countDocuments,
		findOne: mocks.findOne,
		create: mocks.create,
	},
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.createAuditLog,
}));

const { createCostCatalogItem, listCostCatalog } = await import(
	"../../src/modules/cost/cost-catalog.service"
);

describe("listCostCatalog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns active catalog items with canonical pagination", async () => {
		const chain = {
			sort: vi.fn().mockReturnThis(),
			skip: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([
				{
					_id: new Types.ObjectId("507f1f77bcf86cd799439071"),
					code: "LAB-001",
					name: "Hora técnica",
					category: "labor",
					unit: "hora",
					unitPrice: 50_000,
					currency: "COP",
					isActive: true,
					createdAt: new Date("2026-06-29T12:00:00.000Z"),
					updatedAt: new Date("2026-06-29T12:00:00.000Z"),
				},
			]),
		};
		mocks.find.mockReturnValue(chain);
		mocks.countDocuments.mockResolvedValue(1);

		const result = await listCostCatalog({ category: "labor", page: 2, limit: 10 });

		expect(mocks.find).toHaveBeenCalledWith({ isActive: true, category: "labor" });
		expect(chain.skip).toHaveBeenCalledWith(10);
		expect(result.items[0]?.description).toEqual({ status: "absent" });
		expect(result.pagination).toEqual({ page: 2, limit: 10, total: 1, totalPages: 1 });
	});

	it("filters by a literal name or code search", async () => {
		const chain = {
			sort: vi.fn().mockReturnThis(),
			skip: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([]),
		};
		mocks.find.mockReturnValue(chain);
		mocks.countDocuments.mockResolvedValue(0);

		await listCostCatalog({ page: 1, limit: 20, search: "cable" });

		expect(mocks.find).toHaveBeenCalledWith({
			isActive: true,
			$or: [{ code: /cable/i }, { name: /cable/i }],
		});
	});
});

describe("createCostCatalogItem", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates a catalog item with normalized code and writes an audit log", async () => {
		mocks.countDocuments.mockResolvedValue(0);
		mocks.create.mockResolvedValue({
			_id: new Types.ObjectId("507f1f77bcf86cd799439072"),
			code: "MAT-014",
			name: "Cable encauchetado 3x12",
			category: "materials",
			unit: "metro",
			unitPrice: 12_500,
			currency: "COP",
			isActive: true,
			createdAt: new Date("2026-07-03T12:00:00.000Z"),
			updatedAt: new Date("2026-07-03T12:00:00.000Z"),
		});

		const result = await createCostCatalogItem(
			{
				code: "mat-014",
				name: "Cable encauchetado 3x12",
				category: "materials",
				unit: "metro",
				unitPrice: 12_500,
				currency: "COP",
				isActive: true,
			},
			"507f1f77bcf86cd799439099",
		);

		expect(mocks.countDocuments).toHaveBeenCalledWith({ code: "MAT-014" });
		expect(mocks.create).toHaveBeenCalledWith(
			expect.objectContaining({ code: "MAT-014", unitPrice: 12_500 }),
		);
		expect(mocks.createAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({ action: "COST_CATALOG_ITEM_CREATED" }),
		);
		expect(result.code).toBe("MAT-014");
		expect(result.unitPrice).toBe(12_500);
	});

	it("rejects duplicate catalog codes with a typed 409 error", async () => {
		mocks.countDocuments.mockResolvedValue(1);

		await expect(
			createCostCatalogItem(
				{
					code: "MAT-014",
					name: "Cable encauchetado 3x12",
					category: "materials",
					unit: "metro",
					unitPrice: 12_500,
					currency: "COP",
					isActive: true,
				},
				"507f1f77bcf86cd799439099",
			),
		).rejects.toMatchObject({ code: "COST_CATALOG_CODE_ALREADY_EXISTS", statusCode: 409 });

		expect(mocks.create).not.toHaveBeenCalled();
		expect(mocks.createAuditLog).not.toHaveBeenCalled();
	});
});
