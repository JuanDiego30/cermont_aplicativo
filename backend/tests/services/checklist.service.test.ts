import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	BadRequestError,
	NotFoundError,
	UnprocessableError,
} from "../../src/common/errors/AppError";
import { getDefaultKitForOrderType } from "../../src/config/kit-templates";
import { Checklist, MaintenanceKit, Order } from "../../src/models";
import * as ChecklistService from "../../src/modules/checklist/checklist.service";

const mocks = vi.hoisted(() => ({
	ChecklistModelMock: Object.assign(
		vi.fn(function (this: unknown, data: Record<string, unknown>) {
			return {
				_id: oid(IDS.checklist),
				orderId: oid(IDS.order),
				templateName: "Checklist OT-001",
				status: "pending",
				items: [],
				createdAt: new Date("2026-01-01T10:00:00.000Z"),
				updatedAt: new Date("2026-01-01T10:05:00.000Z"),
				save: vi.fn().mockResolvedValue(undefined),
				...data,
			};
		}),
		{ find: vi.fn(), findOne: vi.fn(), findById: vi.fn() },
	),
}));

vi.mock("../../src/models", () => ({
	Checklist: mocks.ChecklistModelMock,
	Order: { findById: vi.fn() },
	MaintenanceKit: { findOne: vi.fn() },
}));

vi.mock("../../src/config/kit-templates", () => ({
	getDefaultKitForOrderType: vi.fn(),
}));

vi.mock("../../src/common/utils/logger", () => ({
	createLogger: vi.fn(() => ({
		warn: vi.fn(),
		info: vi.fn(),
	})),
}));

const IDS = {
	order: "507f1f77bcf86cd799439011",
	checklist: "507f1f77bcf86cd799439012",
	item: "equipment-1",
	user: "507f1f77bcf86cd799439013",
} as const;

const KIT = {
	name: "Kit preventivo",
	materials: [{ name: "Taladro", quantity: 1, unit: "und" }],
} as const;

function oid(value: string) {
	return { toString: () => value };
}

function buildChecklistItem(overrides: Record<string, unknown> = {}) {
	return {
		id: IDS.item,
		category: "equipment" as const,
		description: "Equipo principal revisado y operativo",
		required: true,
		completed: false,
		completedBy: undefined,
		completedAt: undefined,
		observation: undefined,
		...overrides,
	};
}

function buildChecklistDoc(overrides: Record<string, unknown> = {}) {
	return {
		_id: oid(IDS.checklist),
		orderId: oid(IDS.order),
		templateName: "Checklist OT-001",
		status: "pending" as const,
		items: [buildChecklistItem()],
		completedBy: undefined,
		completedAt: undefined,
		signature: undefined,
		observations: undefined,
		createdAt: new Date("2026-01-01T10:00:00.000Z"),
		updatedAt: new Date("2026-01-01T10:05:00.000Z"),
		save: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

function buildOrder(overrides: Record<string, unknown> = {}) {
	return {
		_id: oid(IDS.order),
		type: "preventive",
		code: "OT-001",
		status: "open",
		materials: [{ name: "Grasa", quantity: 2, unit: "kg" }],
		...overrides,
	};
}

function mockChecklistFind(items: unknown[]) {
	const lean = vi.fn().mockResolvedValue(items);
	const sort = vi.fn().mockReturnValue({ lean });
	vi.mocked(Checklist.find).mockReturnValue({ sort } as never);
	return sort;
}

describe("checklist.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(MaintenanceKit.findOne).mockReturnValue({
			lean: vi.fn().mockResolvedValue(null),
		} as never);
	});

	describe("listChecklists()", () => {
		it("filtra por orderId y status", async () => {
			const checklist = buildChecklistDoc();
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(buildOrder()),
			} as never);
			const sort = mockChecklistFind([checklist]);

			const result = await ChecklistService.listChecklists({
				orderId: IDS.order,
				status: "pending",
			});

			expect(Order.findById).toHaveBeenCalledWith(IDS.order);
			expect(Checklist.find).toHaveBeenCalledWith({
				orderId: expect.any(Object),
				status: "pending",
			});
			expect(sort).toHaveBeenCalledWith({ updatedAt: -1, createdAt: -1 });
			expect(result[0]).toMatchObject({
				_id: IDS.checklist,
				orderId: IDS.order,
				templateName: "Checklist OT-001",
			});
		});

		it("lanza NotFoundError si la orden no existe", async () => {
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(null),
			} as never);

			await expect(ChecklistService.listChecklists({ orderId: IDS.order })).rejects.toThrow(
				NotFoundError,
			);
		});
	});

	describe("getChecklistsByOrderId()", () => {
		it("reutiliza el filtro por orden", async () => {
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(buildOrder()),
			} as never);
			mockChecklistFind([buildChecklistDoc()]);

			const result = await ChecklistService.getChecklistsByOrderId(IDS.order);

			expect(result).toHaveLength(1);
			expect(Checklist.find).toHaveBeenCalledWith({ orderId: expect.any(Object) });
		});
	});

	describe("createChecklist()", () => {
		it("crea una checklist con items del kit por defecto", async () => {
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(buildOrder()),
			} as never);
			vi.mocked(Checklist.findOne).mockResolvedValue(null);
			(
				getDefaultKitForOrderType as unknown as { mockReturnValue: (value: unknown) => void }
			).mockReturnValue(KIT);

			const result = await ChecklistService.createChecklist(IDS.order, IDS.user);

			expect(result.templateName).toBe(KIT.name);
			expect(result.items).toHaveLength(4);
		});

		it("usa el catálogo de mantenimiento cuando se especifica kitTemplate", async () => {
			const catalogKit = {
				name: "Kit eléctrico",
				tools: [{ name: "Multímetro", quantity: 1, specifications: "digital" }],
				equipment: [{ name: "Guantes dieléctricos", quantity: 1, certificate_required: true }],
			};

			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(buildOrder()),
			} as never);
			vi.mocked(Checklist.findOne).mockResolvedValue(null);
			vi.mocked(MaintenanceKit.findOne).mockReturnValue({
				lean: vi.fn().mockResolvedValue(catalogKit),
			} as never);

			const result = await ChecklistService.createChecklist(IDS.order, IDS.user, {
				kitTemplate: "Kit eléctrico",
			});

			expect(MaintenanceKit.findOne).toHaveBeenCalled();
			expect(result.templateName).toBe("Kit eléctrico");
			expect(result.items).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						category: "tool",
						description: "Multímetro (1) - digital",
					}),
					expect.objectContaining({
						category: "equipment",
						description: "Guantes dieléctricos (1) - certificación requerida",
					}),
				]),
			);
		});

		it("retorna la checklist existente si ya fue creada", async () => {
			const existing = buildChecklistDoc();
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(buildOrder()),
			} as never);
			vi.mocked(Checklist.findOne).mockResolvedValue(existing as never);

			const result = await ChecklistService.createChecklist(IDS.order, IDS.user);

			expect(result._id).toBe(IDS.checklist);
		});

		it("retorna la checklist existente cuando el idempotency key ya existe", async () => {
			const existing = buildChecklistDoc({ idempotencyKey: "idem-checklist-1" });
			vi.mocked(Checklist.findOne).mockImplementation((query: Record<string, unknown>) => {
				if (typeof query === "object" && query !== null && "idempotencyKey" in query) {
					return { lean: vi.fn().mockResolvedValue(existing) } as never;
				}

				return { lean: vi.fn().mockResolvedValue(null) } as never;
			});

			const result = await ChecklistService.createChecklist(IDS.order, IDS.user, {
				idempotencyKey: "idem-checklist-1",
			});

			expect(result._id).toBe(IDS.checklist);
			expect(Order.findById).not.toHaveBeenCalled();
		});

		it("lanza UnprocessableError si la orden está cerrada", async () => {
			vi.mocked(Order.findById).mockReturnValue({
				lean: vi.fn().mockResolvedValue(buildOrder({ status: "closed" })),
			} as never);
			vi.mocked(Checklist.findOne).mockResolvedValue(null);

			await expect(ChecklistService.createChecklist(IDS.order, IDS.user)).rejects.toThrow(
				UnprocessableError,
			);
		});
	});

	describe("updateChecklistItem()", () => {
		it("actualiza el item y completa la checklist cuando ya tiene firma", async () => {
			const checklist = buildChecklistDoc({
				signature: "Juan Pérez",
				items: [buildChecklistItem({ completed: false, observation: undefined })],
			});
			vi.mocked(Checklist.findById).mockResolvedValue(checklist as never);

			const result = await ChecklistService.updateChecklistItem(
				IDS.checklist,
				IDS.item,
				{ completed: true, observation: "  listo  " },
				IDS.user,
			);

			expect(checklist.save).toHaveBeenCalled();
			expect(result.status).toBe("completed");
			expect(result.items[0]).toMatchObject({
				completed: true,
				completedBy: IDS.user,
				observation: "listo",
			});
		});

		it("lanza NotFoundError si la checklist no existe", async () => {
			vi.mocked(Checklist.findById).mockResolvedValue(null);

			await expect(
				ChecklistService.updateChecklistItem(
					IDS.checklist,
					IDS.item,
					{ completed: true },
					IDS.user,
				),
			).rejects.toThrow(NotFoundError);
		});

		it("lanza UnprocessableError si la checklist está cerrada", async () => {
			vi.mocked(Checklist.findById).mockResolvedValue(
				buildChecklistDoc({ status: "completed" }) as never,
			);

			await expect(
				ChecklistService.updateChecklistItem(
					IDS.checklist,
					IDS.item,
					{ completed: true },
					IDS.user,
				),
			).rejects.toThrow(UnprocessableError);
		});

		it("lanza NotFoundError si el item no existe", async () => {
			vi.mocked(Checklist.findById).mockResolvedValue(buildChecklistDoc() as never);

			await expect(
				ChecklistService.updateChecklistItem(
					IDS.checklist,
					"missing-item",
					{ completed: true },
					IDS.user,
				),
			).rejects.toThrow(NotFoundError);
		});
	});

	describe("completeChecklist()", () => {
		it("completa la checklist cuando todos los requeridos están listos", async () => {
			const checklist = buildChecklistDoc({
				items: [
					buildChecklistItem({
						completed: true,
						completedBy: oid(IDS.user),
						completedAt: new Date("2026-01-01T10:01:00.000Z"),
					}),
				],
			});
			vi.mocked(Checklist.findById).mockResolvedValue(checklist as never);

			const result = await ChecklistService.completeChecklist(
				IDS.checklist,
				{ signature: "  Juan Pérez  ", observations: "  verificado  " },
				IDS.user,
			);

			expect(checklist.save).toHaveBeenCalled();
			expect(result.status).toBe("completed");
			expect(result.signature).toBe("Juan Pérez");
			expect(result.observations).toBe("verificado");
		});

		it("lanza UnprocessableError si faltan items requeridos", async () => {
			vi.mocked(Checklist.findById).mockResolvedValue(buildChecklistDoc() as never);

			await expect(
				ChecklistService.completeChecklist(IDS.checklist, { signature: "Juan Pérez" }, IDS.user),
			).rejects.toThrow(UnprocessableError);
		});

		it("lanza BadRequestError si no hay firma", async () => {
			vi.mocked(Checklist.findById).mockResolvedValue(
				buildChecklistDoc({ items: [buildChecklistItem({ completed: true })] }) as never,
			);

			await expect(
				ChecklistService.completeChecklist(IDS.checklist, { signature: "   " }, IDS.user),
			).rejects.toThrow(BadRequestError);
		});
	});
});
