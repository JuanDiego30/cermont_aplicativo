import { beforeEach, describe, expect, it, vi } from "vitest";

const NIL = Object.getPrototypeOf(Object.prototype);

const mocks = vi.hoisted(() => ({
	notificationInsertMany: vi.fn(),
	serviceCaseFindById: vi.fn(),
	userFind: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	Notification: {
		insertMany: mocks.notificationInsertMany,
		find: vi.fn(),
		countDocuments: vi.fn(),
		findOneAndUpdate: vi.fn(),
		updateMany: vi.fn(),
	},
	ServiceCase: { findById: mocks.serviceCaseFindById },
	User: { find: mocks.userFind },
}));

const { dbStepToDomainState, getRolesToNotifyForStep, notifyStateTransition } = await import(
	"../../src/modules/notifications/notification.service"
);

describe("notification.service — dbStepToDomainState", () => {
	it("maps step_01 to work_request", () => {
		expect(dbStepToDomainState("step_01_work_request")).toBe("work_request");
	});

	it("maps step_06 to execution", () => {
		expect(dbStepToDomainState("step_06_execution")).toBe("execution");
	});

	it("maps step_07 to technical_report (NOT evidences)", () => {
		// Critical fix: step_07 was incorrectly mapped to "evidences"
		expect(dbStepToDomainState("step_07_technical_report")).toBe("technical_report");
		expect(dbStepToDomainState("step_07_technical_report")).not.toBe("evidences");
	});

	it("maps step_08 to delivery_record (NOT technical_report)", () => {
		expect(dbStepToDomainState("step_08_delivery_record")).toBe("delivery_record");
		expect(dbStepToDomainState("step_08_delivery_record")).not.toBe("technical_report");
	});

	it("maps step_09 to client_signature (NOT delivery_record)", () => {
		expect(dbStepToDomainState("step_09_client_signature")).toBe("client_signature");
		expect(dbStepToDomainState("step_09_client_signature")).not.toBe("delivery_record");
	});

	it("maps step_10 to ses (NOT client_signature)", () => {
		expect(dbStepToDomainState("step_10_ses_submission")).toBe("ses");
		expect(dbStepToDomainState("step_10_ses_submission")).not.toBe("client_signature");
	});

	it("maps all 14 steps to a domain state without errors", () => {
		const steps = [
			"step_01_work_request",
			"step_02_site_visit",
			"step_03_proposal",
			"step_04_purchase_order",
			"step_05_planning",
			"step_06_execution",
			"step_07_technical_report",
			"step_08_delivery_record",
			"step_09_client_signature",
			"step_10_ses_submission",
			"step_11_ses_approval",
			"step_12_invoice_submission",
			"step_13_invoice_approval",
			"step_14_payment_closure",
		];
		for (const step of steps) {
			const state = dbStepToDomainState(step);
			expect(state).not.toBe("pending");
			expect(typeof state).toBe("string");
		}
	});

	it("returns pending for unrecognized step code", () => {
		expect(dbStepToDomainState("step_99_unrecognized")).toBe("pending");
	});
});

describe("notification.service — getRolesToNotifyForStep", () => {
	it("notifica a supervisor+admin para step_07 technical_report (NO roles de evidencias)", () => {
		const roles = getRolesToNotifyForStep("step_07_technical_report");
		expect(roles).toContain("supervisor");
		expect(roles).toContain("gerente");
		expect(roles).not.toContain("hes");
		expect(roles).not.toContain("tecnico");
		expect(roles).not.toContain("residente");
	});

	it("notifica a tecnico+supervisor para step_08 delivery_record (NO residente)", () => {
		const roles = getRolesToNotifyForStep("step_08_delivery_record");
		expect(roles).toContain("tecnico");
		expect(roles).toContain("supervisor");
		expect(roles).not.toContain("residente");
	});

	it("notifica a supervisor+admin para step_09 client_signature (NO residente)", () => {
		const roles = getRolesToNotifyForStep("step_09_client_signature");
		expect(roles).toContain("supervisor");
		expect(roles).toContain("gerente");
		expect(roles).not.toContain("residente");
		expect(roles).not.toContain("cliente");
	});

	it("notifica solo a admin para step_10 ses_submission (NO roles de client_signature)", () => {
		const roles = getRolesToNotifyForStep("step_10_ses_submission");
		expect(roles).toEqual(["gerente"]);
		expect(roles).not.toContain("residente");
		expect(roles).not.toContain("administrativo");
	});

	it("notifica a supervisor+tecnico+operador para execution", () => {
		const roles = getRolesToNotifyForStep("step_06_execution");
		expect(roles).toContain("supervisor");
		expect(roles).toContain("tecnico");
		expect(roles).toContain("operador");
	});

	it("notifica a administrativo+gerente para payment", () => {
		const roles = getRolesToNotifyForStep("step_14_payment_closure");
		expect(roles).toContain("administrativo");
		expect(roles).toContain("gerente");
	});
});

describe("notification.service — notifyStateTransition", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates notifications for correct roles when advancing a step", async () => {
		mocks.serviceCaseFindById.mockResolvedValue({
			_id: "507f1f77bcf86cd799439011",
			code: "SC-001",
		});
		mocks.userFind.mockReturnValue({
			lean: vi.fn().mockResolvedValue([
				{ _id: "user1", role: "supervisor" },
				{ _id: "user2", role: "gerente" },
			]),
		});

		await notifyStateTransition(
			"507f1f77bcf86cd799439011",
			"step_06_execution",
			"step_07_technical_report",
			"507f1f77bcf86cd799439099",
		);

		expect(mocks.notificationInsertMany).toHaveBeenCalled();
		const notifications = mocks.notificationInsertMany.mock.calls[0][0];
		expect(notifications).toHaveLength(2);
		expect(notifications[0].recipientRole).toBe("supervisor");
		expect(notifications[1].recipientRole).toBe("gerente");
	});

	it("handles missing service case gracefully without throwing", async () => {
		mocks.serviceCaseFindById.mockResolvedValue(NIL);

		await expect(
			notifyStateTransition("bad-id", "step_01", "step_02", "user1"),
		).resolves.toBeUndefined();
		expect(mocks.notificationInsertMany).not.toHaveBeenCalled();
	});

	it("propagates database insertion failure — caught by Express global error handler", async () => {
		mocks.serviceCaseFindById.mockResolvedValue({
			_id: "507f1f77bcf86cd799439011",
			code: "SC-002",
		});
		mocks.userFind.mockReturnValue({
			lean: vi.fn().mockResolvedValue([{ _id: "user1", role: "supervisor" }]),
		});
		mocks.notificationInsertMany.mockRejectedValue(new Error("DB connection lost"));

		await expect(
			notifyStateTransition(
				"507f1f77bcf86cd799439011",
				"step_06_execution",
				"step_07_technical_report",
				"user1",
			),
		).rejects.toThrow("DB connection lost");

		expect(mocks.notificationInsertMany).toHaveBeenCalled();
	});
});
