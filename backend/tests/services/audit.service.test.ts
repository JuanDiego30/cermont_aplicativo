import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditLog, User } from "../../src/models";
import { createAuditLog, findLogs } from "../../src/modules/audit/audit.service";

vi.mock("../../src/models", () => ({
	AuditLog: {
		create: vi.fn(),
		countDocuments: vi.fn(),
		find: vi.fn(),
	},
	User: {
		findById: vi.fn(),
	},
}));

describe("audit.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("maps audit input to the persisted schema and resolves user email", async () => {
		const userQuery = {
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue({ email: "auditor@example.com" }),
		};

		vi.mocked(User.findById).mockReturnValue(userQuery as never);
		vi.mocked(AuditLog.create).mockResolvedValue({} as never);

		createAuditLog({
			action: "ORDER_CREATED",
			entity: "Order",
			entityId: "507f1f77bcf86cd799439011",
			userId: "507f1f77bcf86cd799439099",
			before: { status: "open" },
			after: { status: "assigned" },
			metadata: { source: "e2e" },
			ipAddress: "127.0.0.1",
			userAgent: "playwright",
		});

		await vi.waitFor(() => expect(AuditLog.create).toHaveBeenCalled());

		expect(User.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439099");
		expect(userQuery.select).toHaveBeenCalledWith("email");
		expect(AuditLog.create).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "ORDER_CREATED",
				entityType: "Order",
				entityId: "507f1f77bcf86cd799439011",
				userId: "507f1f77bcf86cd799439099",
				userEmail: "auditor@example.com",
				changes: {
					before: { status: "open" },
					after: { status: "assigned" },
				},
				metadata: { source: "e2e" },
				ipAddress: "127.0.0.1",
				userAgent: "playwright",
			}),
		);
	});

	it("maps model_name filters to entityType queries", async () => {
		const findChain = {
			skip: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			sort: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue([{ _id: "audit-1" }]),
		};

		vi.mocked(AuditLog.countDocuments).mockResolvedValue(1);
		vi.mocked(AuditLog.find).mockReturnValue(findChain as never);

		const result = await findLogs(
			{
				user_id: "507f1f77bcf86cd799439099",
				model_name: "Order",
				action: "ORDER_CREATED",
			},
			2,
			25,
		);

		expect(AuditLog.countDocuments).toHaveBeenCalledWith({
			userId: "507f1f77bcf86cd799439099",
			entityType: "Order",
			action: "ORDER_CREATED",
		});
		expect(AuditLog.find).toHaveBeenCalledWith({
			userId: "507f1f77bcf86cd799439099",
			entityType: "Order",
			action: "ORDER_CREATED",
		});
		expect(findChain.skip).toHaveBeenCalledWith(25);
		expect(findChain.limit).toHaveBeenCalledWith(25);
		expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
		expect(findChain.lean).toHaveBeenCalled();
		expect(result).toEqual({
			logs: [{ _id: "audit-1" }],
			total: 1,
			page: 2,
			limit: 25,
		});
	});
});
