import { beforeEach, describe, expect, it } from "vitest";
import {
	type FsmEntityType,
	findPreviousStates,
	getAllowedTransitions,
	isTerminalState,
	registerAllFsms,
	requireValidTransition,
	rollbackTransition,
	validateTransition,
} from "../../src/common/fsm/fsm-engine";

beforeEach(() => {
	// Reset by re-registering all FSMs for a clean state
	// This is done via a fresh registration each test run
	// (in production registerAllFsms is called once at startup)
	try {
		registerAllFsms();
	} catch {
		// Already registered — reset not possible without restart.
		// Tests rely on idempotent validation, not registration.
	}
});

describe("fsm-engine — validateTransition", () => {
	it("should allow valid transition: WorkRequest draft → submitted", () => {
		const result = validateTransition("WorkRequest", "draft", "submitted");
		expect(result.valid).toBe(true);
		expect(result.from).toBe("draft");
		expect(result.to).toBe("submitted");
	});

	it("should allow valid transition: Proposal sent → approved", () => {
		const result = validateTransition("Proposal", "sent", "approved");
		expect(result.valid).toBe(true);
	});

	it("should allow valid transition: WorkOrder open → proposal_sent", () => {
		const result = validateTransition("WorkOrder", "open", "proposal_sent");
		expect(result.valid).toBe(true);
	});

	it("should reject transition from invalid source state", () => {
		const result = validateTransition("WorkRequest", "nonexistent", "submitted");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("Invalid source state");
	});

	it("should reject transition to invalid target state", () => {
		const result = validateTransition("WorkRequest", "draft", "nonexistent");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("Invalid target state");
	});

	it("should reject transition from terminal state", () => {
		const result = validateTransition("WorkRequest", "cancelled", "draft");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("terminal state");
	});

	it("should reject invalid transition: WorkOrder open → paid", () => {
		const result = validateTransition("WorkOrder", "open", "paid");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("Invalid transition");
	});

	it("should reject transition from closed WorkOrder", () => {
		const result = validateTransition("WorkOrder", "closed", "open");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("terminal state");
	});

	it("should return error for unregistered entity type", () => {
		const result = validateTransition("NonExistentEntity" as FsmEntityType, "x", "y");
		expect(result.valid).toBe(false);
		expect(result.error).toContain("No FSM definition found");
	});
});

describe("fsm-engine — requireValidTransition", () => {
	it("should not throw for valid transition", () => {
		expect(() => requireValidTransition("WorkRequest", "draft", "submitted")).not.toThrow();
	});

	it("should throw for invalid transition", () => {
		expect(() => requireValidTransition("WorkRequest", "draft", "paid")).toThrow(
			"Invalid state transition",
		);
	});

	it("should include entityId in error message when provided", () => {
		expect(() =>
			requireValidTransition("WorkRequest", "draft", "paid", "507f1f77bcf86cd799439011"),
		).toThrow(/507f1f77bcf86cd799439011/);
	});
});

describe("fsm-engine — getAllowedTransitions", () => {
	it("should return allowed targets for WorkRequest draft", () => {
		const allowed = getAllowedTransitions("WorkRequest", "draft");
		expect(allowed).toEqual(["submitted", "cancelled"]);
	});

	it("should return empty array for terminal state", () => {
		const allowed = getAllowedTransitions("WorkOrder", "closed");
		expect(allowed).toEqual([]);
	});

	it("should return empty array for unregistered entity", () => {
		const allowed = getAllowedTransitions("SiteVisit" as FsmEntityType, "x");
		expect(allowed).toEqual([]);
	});
});

describe("fsm-engine — isTerminalState", () => {
	it("should return true for terminal state", () => {
		expect(isTerminalState("WorkRequest", "cancelled")).toBe(true);
	});

	it("should return false for non-terminal state", () => {
		expect(isTerminalState("WorkRequest", "draft")).toBe(false);
	});

	it("should return false for unregistered entity", () => {
		expect(isTerminalState("SiteVisit" as FsmEntityType, "x")).toBe(false);
	});
});

describe("fsm-engine — findPreviousStates", () => {
	it("should find valid previous states for WorkRequest submitted", () => {
		const previous = findPreviousStates("WorkRequest", "submitted");
		expect(previous).toContain("draft");
	});

	it("should return empty for initial state with no inbound transitions", () => {
		const previous = findPreviousStates("WorkRequest", "draft");
		expect(previous).toEqual([]);
	});

	it("should return all states that can transition to closed WorkOrder", () => {
		const previous = findPreviousStates("WorkOrder", "closed");
		expect(previous).toContain("completed");
		expect(previous).toContain("ready_for_invoicing");
		expect(previous).toContain("acta_signed");
		expect(previous).toContain("ses_sent");
		expect(previous).toContain("invoice_approved");
		expect(previous).toContain("paid");
	});
});

describe("fsm-engine — rollbackTransition", () => {
	it("should allow rollback to valid previous state", () => {
		const result = rollbackTransition(
			"Proposal",
			"abc123",
			"sent",
			"draft",
			"admin01",
			"Cliente solicita revisión",
		);
		expect(result.success).toBe(true);
		expect(result.from).toBe("sent");
		expect(result.to).toBe("draft");
	});

	it("should reject rollback to non-previous state", () => {
		const result = rollbackTransition(
			"Proposal",
			"abc123",
			"sent",
			"approved",
			"admin01",
			"Invalid rollback",
		);
		expect(result.success).toBe(false);
		expect(result.error).toContain("not a valid previous state");
	});

	it("should reject rollback from terminal state", () => {
		const result = rollbackTransition(
			"WorkRequest",
			"abc123",
			"cancelled",
			"draft",
			"admin01",
			"Try to un-cancel",
		);
		expect(result.success).toBe(false);
		expect(result.error).toContain("Cannot rollback from terminal state");
	});

	it("should produce audit entry on successful rollback", () => {
		const result = rollbackTransition(
			"WorkOrder",
			"ord001",
			"proposal_sent",
			"open",
			"admin01",
			"Reabrir para correcciones en propuesta",
		);
		expect(result.success).toBe(true);
		expect(result.auditEntry).toBeDefined();
		expect(result.auditEntry?.entityId).toBe("ord001");
		expect(result.auditEntry?.entityType).toBe("WorkOrder");
		expect(result.auditEntry?.from).toBe("proposal_sent");
		expect(result.auditEntry?.to).toBe("open");
		expect(result.auditEntry?.userId).toBe("admin01");
		expect(result.auditEntry?.reason).toBe("Reabrir para correcciones en propuesta");
		expect(result.auditEntry?.timestamp).toBeInstanceOf(Date);
	});

	it("should return error for unregistered entity type", () => {
		const result = rollbackTransition(
			"NonExistentEntity" as FsmEntityType,
			"x",
			"a",
			"b",
			"admin",
			"test",
		);
		expect(result.success).toBe(false);
		expect(result.error).toContain("No FSM definition found");
	});

	it("should allow rollback for PurchaseOrder: received → pending", () => {
		const result = rollbackTransition(
			"PurchaseOrder",
			"po001",
			"received",
			"pending",
			"admin01",
			"Reabrir recepción de PO",
		);
		expect(result.success).toBe(true);
	});
});
