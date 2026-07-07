import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	orderFindById: vi.fn(),
	proposalFindOne: vi.fn(),
	costAggregate: vi.fn(),
	userFind: vi.fn(),
	createNotification: vi.fn(),
	publishAutomationEventSafely: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	Order: { findById: mocks.orderFindById },
	Proposal: { findOne: mocks.proposalFindOne },
	Cost: { aggregate: mocks.costAggregate },
	User: { find: mocks.userFind },
}));

vi.mock("../../src/modules/notifications/notification.service", () => ({
	createNotification: mocks.createNotification,
}));

vi.mock("../../src/modules/automation/automation.service", () => ({
	publishAutomationEventSafely: mocks.publishAutomationEventSafely,
}));

const { notifyCostBudgetThreshold } = await import(
	"../../src/modules/cost/cost-budget-alert.service"
);

describe("notifyCostBudgetThreshold", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.createNotification.mockResolvedValue(undefined);
		mocks.publishAutomationEventSafely.mockResolvedValue(undefined);
	});

	it("notifies active finance users once the approved budget reaches 80 percent", async () => {
		const orderId = new Types.ObjectId("507f1f77bcf86cd799439011");
		const proposalId = new Types.ObjectId("507f1f77bcf86cd799439061");
		mocks.orderFindById.mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue({ _id: orderId, proposalId }),
		});
		mocks.proposalFindOne.mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue({ total: 1_000 }),
		});
		mocks.costAggregate.mockResolvedValue([{ totalActual: 700, totalTax: 100 }]);
		mocks.userFind.mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi
				.fn()
				.mockResolvedValue([
					{ _id: new Types.ObjectId("507f1f77bcf86cd799439081"), role: "gerente" },
				]),
		});

		await notifyCostBudgetThreshold(orderId.toString(), "507f1f77bcf86cd799439015");

		expect(mocks.createNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "COST_THRESHOLD_REACHED",
				priority: "high",
				dedupeKey: `${orderId.toString()}:cost-budget:threshold_reached`,
			}),
		);
	});

	it("does not notify without an approved proposal budget", async () => {
		mocks.orderFindById.mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi.fn().mockResolvedValue({
				_id: new Types.ObjectId("507f1f77bcf86cd799439011"),
			}),
		});

		await notifyCostBudgetThreshold("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439015");

		expect(mocks.costAggregate).not.toHaveBeenCalled();
		expect(mocks.createNotification).not.toHaveBeenCalled();
	});
});
