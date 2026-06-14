import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../../src/common/errors/AppError";
import { Order, User } from "../../src/models";
import * as OrderService from "../../src/modules/order/order-crud.service";
import * as PortalService from "../../src/modules/portal/portal.service";

vi.mock("../../src/models", () => ({
	User: {
		findById: vi.fn(),
	},
	Order: {
		findById: vi.fn(),
	},
	Proposal: {
		find: vi.fn(),
	},
	Invoice: {
		find: vi.fn(),
	},
	TechnicalReport: {
		find: vi.fn(),
	},
	DeliveryRecord: {
		find: vi.fn(),
	},
}));

function mockLean<T>(value: T) {
	return { lean: vi.fn().mockResolvedValue(value) };
}

describe("BOLA and tenant isolation", () => {
	const clientA = new Types.ObjectId("507f1f77bcf86cd799439011");
	const clientB = new Types.ObjectId("507f1f77bcf86cd799439012");
	const orderId = new Types.ObjectId("507f1f77bcf86cd799439099");

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("blocks a client from reading another client's portal order", async () => {
		vi.mocked(User.findById).mockReturnValue(
			mockLean({
				_id: clientB,
				name: "Client B",
				email: "client-b@cermont.com",
			}),
		);
		vi.mocked(Order.findById).mockReturnValue(
			mockLean({
				_id: orderId,
				code: "OT-000001-2026",
				status: "assigned",
				createdBy: clientA,
				clientId: clientA,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		);

		await expect(
			PortalService.getClientOrderDetail(orderId.toString(), clientB.toString()),
		).rejects.toMatchObject({
			statusCode: 403,
			code: "TENANT_ACCESS_DENIED",
		});
	});

	it("allows a client to read its own portal order", async () => {
		vi.mocked(User.findById).mockReturnValue(
			mockLean({
				_id: clientA,
				name: "Client A",
				email: "client-a@cermont.com",
			}),
		);
		vi.mocked(Order.findById).mockReturnValue(
			mockLean({
				_id: orderId,
				code: "OT-000001-2026",
				status: "assigned",
				type: "maintenance",
				description: "Authorized order",
				location: "Site A",
				createdBy: clientA,
				clientId: clientA,
				createdAt: new Date("2026-06-11T10:00:00.000Z"),
				updatedAt: new Date("2026-06-11T11:00:00.000Z"),
			}),
		);

		const emptyQuery = {
			sort: vi.fn().mockReturnValue({
				lean: vi.fn().mockResolvedValue([]),
			}),
		};
		const models = await import("../../src/models");
		vi.mocked(models.Proposal.find).mockReturnValue(emptyQuery);
		vi.mocked(models.Invoice.find).mockReturnValue(emptyQuery);
		vi.mocked(models.TechnicalReport.find).mockReturnValue(emptyQuery);
		vi.mocked(models.DeliveryRecord.find).mockReturnValue(emptyQuery);

		const result = await PortalService.getClientOrderDetail(orderId.toString(), clientA.toString());

		expect(result._id).toBe(orderId.toString());
		expect(result.code).toBe("OT-000001-2026");
	});

	it("blocks a technician from reading an unrelated work order", async () => {
		vi.mocked(Order.findById).mockReturnValue(
			mockLean({
				_id: orderId,
				code: "OT-000001-2026",
				status: "assigned",
				createdBy: clientA,
				assignedTo: clientA,
			}),
		);

		await expect(
			OrderService.getOrderByIdWithAuth(orderId.toString(), {
				_id: clientB.toString(),
				role: "tecnico",
			}),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it("allows the assigned technician to read the work order", async () => {
		vi.mocked(Order.findById).mockReturnValue(
			mockLean({
				_id: orderId,
				code: "OT-000001-2026",
				type: "maintenance",
				status: "assigned",
				priority: "medium",
				description: "Assigned work",
				assetId: "asset-1",
				assetName: "Asset",
				location: "Site",
				materials: [],
				createdBy: clientA,
				assignedTo: clientB,
				invoiceReady: false,
				reportGenerated: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			}),
		);

		await expect(
			OrderService.getOrderByIdWithAuth(orderId.toString(), {
				_id: clientB.toString(),
				role: "tecnico",
			}),
		).resolves.toMatchObject({ _id: orderId.toString() });
	});
});
