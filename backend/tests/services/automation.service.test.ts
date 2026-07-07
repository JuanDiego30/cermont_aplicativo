import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	ruleFind: vi.fn(),
	executionFindOneAndUpdate: vi.fn(),
	executionUpdateOne: vi.fn(),
	actionUpsert: vi.fn(),
	actionFind: vi.fn(),
	actionFindOneAndUpdate: vi.fn(),
	actionFindById: vi.fn(),
	userFind: vi.fn(),
	createNotification: vi.fn(),
	createAuditLog: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	AutomationRule: { find: mocks.ruleFind },
	AutomationExecution: {
		findOneAndUpdate: mocks.executionFindOneAndUpdate,
		updateOne: mocks.executionUpdateOne,
	},
	AutomationOperationalAction: {
		updateOne: mocks.actionUpsert,
		find: mocks.actionFind,
		findOneAndUpdate: mocks.actionFindOneAndUpdate,
		findById: mocks.actionFindById,
	},
	User: { find: mocks.userFind },
}));

vi.mock("../../src/modules/notifications/notification.service", () => ({
	createNotification: mocks.createNotification,
}));

vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: mocks.createAuditLog,
}));

const {
	assertNoAutomationTransitionBlocks,
	executeAutomationEvent,
	listAutomationOperationalActions,
	resolveAutomationOperationalAction,
} = await import("../../src/modules/automation/automation.service");

describe("automation.service", () => {
	const ruleId = new Types.ObjectId("507f1f77bcf86cd799439011");
	const executionId = new Types.ObjectId("507f1f77bcf86cd799439012");
	const entityId = "507f1f77bcf86cd799439013";

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.executionFindOneAndUpdate.mockResolvedValue({
			value: { _id: executionId },
			lastErrorObject: { updatedExisting: false },
		});
		mocks.executionUpdateOne.mockResolvedValue({ acknowledged: true });
		mocks.actionUpsert.mockResolvedValue({ upsertedCount: 1 });
		mocks.createNotification.mockResolvedValue(undefined);
		mocks.userFind.mockReturnValue({
			select: vi.fn().mockReturnThis(),
			lean: vi
				.fn()
				.mockResolvedValue([{ _id: new Types.ObjectId("507f1f77bcf86cd799439014"), role: "hes" }]),
		});
	});

	it("dispatches a high-priority HSE alert for a critical checklist failure", async () => {
		mocks.ruleFind.mockReturnValue({
			lean: vi.fn().mockResolvedValue([
				{
					_id: ruleId,
					name: "Escalar checklist crítico",
					eventType: "critical_checklist_failed",
					actions: [
						{
							type: "notify",
							recipientRoles: ["hes"],
							priority: "high",
							title: "Checklist crítico fallido",
							body: "Revise el hallazgo antes de continuar.",
						},
					],
				},
			]),
		});

		const result = await executeAutomationEvent({
			eventId: "checklist-1:item-1:failed",
			eventType: "critical_checklist_failed",
			entityType: "Checklist",
			entityId,
			actorId: "507f1f77bcf86cd799439015",
		});

		expect(result).toEqual({ matchedRules: 1, executedRules: 1, skippedRules: 0 });
		expect(mocks.createNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				recipientRole: "hes",
				priority: "high",
				dedupeKey: `automation:${ruleId.toString()}:checklist-1:item-1:failed:0:507f1f77bcf86cd799439014`,
			}),
		);
		expect(mocks.executionUpdateOne).toHaveBeenCalledWith(
			{ _id: executionId },
			expect.objectContaining({ $set: expect.objectContaining({ status: "succeeded" }) }),
		);
	});

	it("skips an event already executed by the same rule", async () => {
		mocks.ruleFind.mockReturnValue({
			lean: vi.fn().mockResolvedValue([{ _id: ruleId, actions: [] }]),
		});
		mocks.executionFindOneAndUpdate.mockResolvedValue({
			value: { _id: executionId },
			lastErrorObject: { updatedExisting: true },
		});

		const result = await executeAutomationEvent({
			eventId: "same-event",
			eventType: "cost_threshold_exceeded",
			entityType: "Order",
			entityId,
			actorId: "507f1f77bcf86cd799439015",
		});

		expect(result).toEqual({ matchedRules: 1, executedRules: 0, skippedRules: 1 });
		expect(mocks.executionUpdateOne).not.toHaveBeenCalled();
	});

	it("lists open operational actions in newest-first order", async () => {
		const createdAt = new Date("2026-06-30T12:00:00.000Z");
		mocks.actionFind.mockReturnValue({
			sort: vi.fn().mockReturnValue({
				limit: vi.fn().mockReturnValue({
					lean: vi.fn().mockResolvedValue([
						{
							_id: new Types.ObjectId("507f1f77bcf86cd799439020"),
							ruleId,
							executionId,
							entityType: "Order",
							entityId,
							type: "block_transition",
							title: "Transición bloqueada",
							reason: "Falta evidencia",
							priority: "critical",
							status: "open",
							createdAt,
						},
					]),
				}),
			}),
		});

		const result = await listAutomationOperationalActions({ status: "open", limit: 50 });

		expect(mocks.actionFind).toHaveBeenCalledWith({ status: "open" });
		expect(result[0]).toMatchObject({
			entityType: "Order",
			status: "open",
			createdAt: createdAt.toISOString(),
		});
	});

	it("resolves an open operational action atomically and audits once", async () => {
		const actionId = "507f1f77bcf86cd799439020";
		const actorId = "507f1f77bcf86cd799439015";
		const resolvedAt = new Date("2026-06-30T13:00:00.000Z");
		mocks.actionFindOneAndUpdate.mockResolvedValue({
			_id: new Types.ObjectId(actionId),
			ruleId,
			executionId,
			entityType: "Order",
			entityId,
			type: "block_transition",
			title: "Transición bloqueada",
			reason: "Falta evidencia",
			priority: "critical",
			status: "resolved",
			createdAt: new Date("2026-06-30T12:00:00.000Z"),
			resolvedAt,
			resolvedBy: new Types.ObjectId(actorId),
		});

		const result = await resolveAutomationOperationalAction(actionId, actorId);

		expect(mocks.actionFindOneAndUpdate).toHaveBeenCalledWith(
			expect.objectContaining({ status: "open" }),
			{ $set: expect.objectContaining({ status: "resolved", resolvedAt: expect.any(Date) }) },
			{ returnDocument: "after", runValidators: true },
		);
		expect(mocks.createAuditLog).toHaveBeenCalledTimes(1);
		expect(mocks.createAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({ action: "AUTOMATION_ACTION_RESOLVED", userId: actorId }),
		);
		expect(result).toMatchObject({ status: "resolved", resolvedBy: actorId });
	});

	it("returns an already-resolved action without writing a duplicate audit event", async () => {
		const actionId = "507f1f77bcf86cd799439020";
		const actorId = "507f1f77bcf86cd799439015";
		mocks.actionFindOneAndUpdate.mockResolvedValue(null);
		mocks.actionFindById.mockResolvedValue({
			_id: new Types.ObjectId(actionId),
			ruleId,
			executionId,
			entityType: "Order",
			entityId,
			type: "block_transition",
			title: "Transición bloqueada",
			reason: "Falta evidencia",
			priority: "critical",
			status: "resolved",
			createdAt: new Date("2026-06-30T12:00:00.000Z"),
			resolvedAt: new Date("2026-06-30T13:00:00.000Z"),
			resolvedBy: new Types.ObjectId(actorId),
		});

		const result = await resolveAutomationOperationalAction(actionId, actorId);

		expect(result.status).toBe("resolved");
		expect(mocks.createAuditLog).not.toHaveBeenCalled();
	});

	it("blocks a transition while an automation blocker remains open", async () => {
		mocks.actionFind.mockReturnValue({
			lean: vi
				.fn()
				.mockResolvedValue([
					{ type: "block_transition", reason: "Falta reemplazar la evidencia rechazada" },
				]),
		});

		await expect(assertNoAutomationTransitionBlocks("Order", entityId)).rejects.toMatchObject({
			code: "AUTOMATION_TRANSITION_BLOCKED",
		});
	});
});
