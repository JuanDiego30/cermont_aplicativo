import { beforeEach, describe, expect, it, vi } from "vitest";
import { MaintenanceKit } from "../../src/models/MaintenanceKit.js";
import { MaintenanceKitService } from "../../src/modules/maintenance/maintenance.service";

vi.mock("../../src/models/MaintenanceKit.js", () => ({
	MaintenanceKit: {
		findOne: vi.fn(),
		create: vi.fn(),
		find: vi.fn(),
		countDocuments: vi.fn(),
		findById: vi.fn(),
	},
}));

vi.mock("../../src/common/utils/logger", () => ({
	createLogger: vi.fn(() => ({ info: vi.fn() })),
}));

const IDS = {
	kit: "507f1f77bcf86cd799439031",
	user: "507f1f77bcf86cd799439032",
} as const;

function oid(value: string) {
	return { toString: () => value };
}

function buildKit(overrides: Record<string, unknown> = {}) {
	return {
		_id: oid(IDS.kit),
		name: "Kit preventivo",
		activity_type: "preventive",
		items: [{ name: "Taladro" }],
		is_active: true,
		created_by: oid(IDS.user),
		save: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

describe("maintenance.service", () => {
	beforeEach(() => vi.clearAllMocks());

	describe("create()", () => {
		it("crea un kit nuevo", async () => {
			const kit = buildKit();
			vi.mocked(MaintenanceKit.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(null),
			} as never);
			vi.mocked(MaintenanceKit.create).mockResolvedValue(kit as never);

			const result = await MaintenanceKitService.create({ name: "Kit preventivo" }, IDS.user);

			expect(MaintenanceKit.findOne).toHaveBeenCalledWith({ name: "Kit preventivo" });
			expect(MaintenanceKit.create).toHaveBeenCalledWith(
				expect.objectContaining({ created_by: IDS.user }),
			);
			expect(result).toBe(kit);
		});

		it("lanza error si el nombre ya existe", async () => {
			vi.mocked(MaintenanceKit.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(buildKit()),
			} as never);

			await expect(
				MaintenanceKitService.create({ name: "Kit preventivo" }, IDS.user),
			).rejects.toMatchObject({
				statusCode: 409,
				code: "DUPLICATE_KIT_NAME",
			});
		});
	});

	describe("findAll()", () => {
		it("filtra y pagina resultados", async () => {
			const kit = buildKit();
			const find = vi.fn().mockReturnValue({
				populate: vi.fn().mockReturnValue({
					sort: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue({
							skip: vi.fn().mockReturnValue({
								lean: vi.fn().mockResolvedValue([kit]),
							}),
						}),
					}),
				}),
			});
			vi.mocked(MaintenanceKit.find).mockImplementation(find as never);
			vi.mocked(MaintenanceKit.countDocuments).mockResolvedValue(1 as never);

			const result = await MaintenanceKitService.findAll(
				{ activity_type: "preventive", is_active: true, search: "kit" },
				2,
				10,
			);

			expect(result.total).toBe(1);
			expect(result.data).toEqual([kit]);
		});
	});

	describe("findById()", () => {
		it("retorna el kit por id", async () => {
			const kit = buildKit();
			vi.mocked(MaintenanceKit.findById).mockReturnValue({
				populate: vi.fn().mockReturnValue({
					lean: vi.fn().mockResolvedValue(kit),
				}),
			} as never);

			const result = await MaintenanceKitService.findById(IDS.kit);

			expect(result).toBe(kit);
		});

		it("lanza error si no existe", async () => {
			vi.mocked(MaintenanceKit.findById).mockReturnValue({
				populate: vi.fn().mockReturnValue({
					lean: vi.fn().mockResolvedValue(null),
				}),
			} as never);

			await expect(MaintenanceKitService.findById(IDS.kit)).rejects.toMatchObject({
				statusCode: 404,
				code: "KIT_NOT_FOUND",
			});
		});
	});

	describe("update()", () => {
		it("actualiza el kit", async () => {
			const kit = buildKit();
			vi.mocked(MaintenanceKit.findById).mockResolvedValue(kit as never);
			vi.mocked(MaintenanceKit.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(null),
			} as never);

			const result = await MaintenanceKitService.update(IDS.kit, {
				name: "Kit correctivo",
				is_active: false,
			});

			expect(kit.save).toHaveBeenCalled();
			expect(result).toMatchObject({ name: "Kit correctivo", is_active: false });
		});

		it("lanza error si cambia a un nombre duplicado", async () => {
			const kit = buildKit();
			vi.mocked(MaintenanceKit.findById).mockResolvedValue(kit as never);
			vi.mocked(MaintenanceKit.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(buildKit({ name: "Kit correctivo" })),
			} as never);

			await expect(
				MaintenanceKitService.update(IDS.kit, { name: "Kit correctivo" }),
			).rejects.toMatchObject({
				statusCode: 409,
				code: "DUPLICATE_KIT_NAME",
			});
		});

		it("lanza error si no existe", async () => {
			vi.mocked(MaintenanceKit.findById).mockResolvedValue(null);

			await expect(MaintenanceKitService.update(IDS.kit, { name: "Kit X" })).rejects.toMatchObject({
				statusCode: 404,
				code: "KIT_NOT_FOUND",
			});
		});
	});

	describe("delete()", () => {
		it("desactiva el kit", async () => {
			const kit = buildKit();
			vi.mocked(MaintenanceKit.findById).mockResolvedValue(kit as never);

			await MaintenanceKitService.delete(IDS.kit);

			expect(kit.is_active).toBe(false);
			expect(kit.save).toHaveBeenCalled();
		});

		it("lanza error si no existe", async () => {
			vi.mocked(MaintenanceKit.findById).mockResolvedValue(null);

			await expect(MaintenanceKitService.delete(IDS.kit)).rejects.toMatchObject({
				statusCode: 404,
				code: "KIT_NOT_FOUND",
			});
		});
	});
});
