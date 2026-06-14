import { beforeEach, describe, expect, it, vi } from "vitest";
import { runWithRequestContext } from "../../src/common/observability/request-context";
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

		await createAuditLog({
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

	it("persists UUID entity identifiers used by file assets", async () => {
		vi.mocked(AuditLog.create).mockResolvedValue({} as never);

		await createAuditLog({
			action: "FILE_UPLOADED",
			entity: "FileAsset",
			entityId: "7a817c37-5206-4fd1-a2ee-f1e642330af6",
			userId: "507f1f77bcf86cd799439099",
			userEmail: "auditor@example.com",
		});

		expect(AuditLog.create).toHaveBeenCalledWith(
			expect.objectContaining({
				entityType: "FileAsset",
				entityId: "7a817c37-5206-4fd1-a2ee-f1e642330af6",
			}),
		);
	});

	it("maps canonical and legacy filters to indexed forensic queries", async () => {
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
				entity: "Order",
				entityId: "507f1f77bcf86cd799439011",
				action: "ORDER_CREATED",
				from: "2026-06-01T00:00:00.000Z",
				to: "2026-06-11T23:59:59.999Z",
			},
			2,
			25,
		);

		expect(AuditLog.countDocuments).toHaveBeenCalledWith({
			userId: "507f1f77bcf86cd799439099",
			entityType: "Order",
			entityId: "507f1f77bcf86cd799439011",
			action: "ORDER_CREATED",
			createdAt: {
				$gte: new Date("2026-06-01T00:00:00.000Z"),
				$lte: new Date("2026-06-11T23:59:59.999Z"),
			},
		});
		expect(AuditLog.find).toHaveBeenCalledWith({
			userId: "507f1f77bcf86cd799439099",
			entityType: "Order",
			entityId: "507f1f77bcf86cd799439011",
			action: "ORDER_CREATED",
			createdAt: {
				$gte: new Date("2026-06-01T00:00:00.000Z"),
				$lte: new Date("2026-06-11T23:59:59.999Z"),
			},
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

	it("enforces audit immutability — no update or delete methods exposed", async () => {
		const userQuery = {
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue({ email: "admin@cermont.com" }),
		};

		vi.mocked(User.findById).mockReturnValue(userQuery as never);
		vi.mocked(AuditLog.create).mockResolvedValue({
			_id: "507f1f77bcf86cd799439011",
			action: "PAYMENT_REGISTERED",
			entityType: "Payment",
			entityId: "507f1f77bcf86cd799439099",
			userId: "507f1f77bcf86cd799439088",
			userEmail: "admin@cermont.com",
			createdAt: new Date("2026-06-10T00:00:00Z"),
		} as never);

		await createAuditLog({
			action: "PAYMENT_REGISTERED",
			entity: "Payment",
			entityId: "507f1f77bcf86cd799439099",
			userId: "507f1f77bcf86cd799439088",
			before: { status: "invoice_approved" },
			after: { status: "paid" },
		});

		const createdArg = vi.mocked(AuditLog.create).mock.calls[0][0] as Record<string, unknown>;
		expect(createdArg.action).toBe("PAYMENT_REGISTERED");
		expect(createdArg.entityType).toBe("Payment");
		expect((createdArg.changes as Record<string, unknown>).before).toEqual({
			status: "invoice_approved",
		});

		const {
			createAuditLog: _,
			findLogs: _f,
			findById: _fi,
			...rest
		} = await import("../../src/modules/audit/audit.service");
		expect(Object.keys(rest)).toHaveLength(0);
	});

	it("redacts sensitive keys before persistence", async () => {
		vi.mocked(AuditLog.create).mockResolvedValue({} as never);

		await createAuditLog({
			action: "LOGIN_SUCCESS",
			entity: "User",
			entityId: "507f1f77bcf86cd799439011",
			userId: "507f1f77bcf86cd799439011",
			userEmail: "admin@cermont.com",
			metadata: {
				password: "never-persist-this",
				authorization: "Bearer secret",
				role: "administrador",
			},
		});

		expect(AuditLog.create).toHaveBeenCalledWith(
			expect.objectContaining({
				metadata: {
					password: "[REDACTED]",
					authorization: "[REDACTED]",
					role: "administrador",
				},
			}),
		);
	});

	it("returns a settled promise even when audit persistence fails", async () => {
		vi.mocked(AuditLog.create).mockRejectedValue(new Error("audit database unavailable"));

		await expect(
			createAuditLog({
				action: "ORDER_CREATED",
				entity: "Order",
				entityId: "507f1f77bcf86cd799439011",
				userId: "507f1f77bcf86cd799439099",
				userEmail: "admin@cermont.com",
			}),
		).resolves.toBeUndefined();
	});

	it("links audit records to the active HTTP request context", async () => {
		vi.mocked(AuditLog.create).mockResolvedValue({} as never);

		await runWithRequestContext(
			{
				requestId: "trace-456",
				ipAddress: "10.0.0.10",
				userAgent: "Playwright",
			},
			() =>
				createAuditLog({
					action: "ORDER_CREATED",
					entity: "Order",
					entityId: "507f1f77bcf86cd799439011",
					userId: "507f1f77bcf86cd799439099",
					userEmail: "admin@cermont.com",
				}),
		);

		expect(AuditLog.create).toHaveBeenCalledWith(
			expect.objectContaining({
				requestId: "trace-456",
				ipAddress: "10.0.0.10",
				userAgent: "Playwright",
			}),
		);
	});
});
