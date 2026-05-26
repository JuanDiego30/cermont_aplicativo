import { describe, expect, it } from "vitest";
import {
	ACTIVE_STATES,
	EDITABLE_STATES,
	getAllowedTransitions,
	getTransitionErrorMessage,
	getTransitionRequirements,
	getTransitionRules,
	isValidTransition,
	STATUS_LABELS_ES,
	TERMINAL_STATES,
	type WorkOrderStatus,
} from "@/modules/core/lib/work-order-fsm";

describe("Work Order FSM - isValidTransition", () => {
	it("allows valid transitions from open", () => {
		expect(isValidTransition("open", "assigned")).toBe(true);
		expect(isValidTransition("open", "cancelled")).toBe(true);
	});

	it("rejects invalid transitions from open", () => {
		expect(isValidTransition("open", "in_progress")).toBe(false);
		expect(isValidTransition("open", "completed")).toBe(false);
	});

	it("allows valid transitions from in_progress", () => {
		expect(isValidTransition("in_progress", "on_hold")).toBe(true);
		expect(isValidTransition("in_progress", "completed")).toBe(true);
		expect(isValidTransition("in_progress", "cancelled")).toBe(true);
	});

	it("rejects invalid transitions from in_progress", () => {
		expect(isValidTransition("in_progress", "open")).toBe(false);
		expect(isValidTransition("in_progress", "assigned")).toBe(false);
	});

	it("rejects transitions from terminal state closed", () => {
		expect(isValidTransition("closed", "cancelled")).toBe(false);
		expect(isValidTransition("closed", "open")).toBe(false);
	});

	it("rejects restart from cancelled (terminal state)", () => {
		expect(isValidTransition("cancelled", "open")).toBe(false);
	});
});

describe("Work Order FSM - getAllowedTransitions", () => {
	it("returns allowed transitions for open", () => {
		const allowed = getAllowedTransitions("open");
		expect(allowed).toContain("proposal_sent");
		expect(allowed).toContain("planning");
		expect(allowed).toContain("assigned");
		expect(allowed).toContain("cancelled");
		expect(allowed.length).toBe(4);
	});

	it("returns allowed transitions for in_progress", () => {
		const allowed = getAllowedTransitions("in_progress");
		expect(allowed).toContain("report_pending");
		expect(allowed).toContain("completed");
		expect(allowed).toContain("on_hold");
		expect(allowed).toContain("cancelled");
		expect(allowed.length).toBe(4);
	});

	it("returns empty array for terminal state closed", () => {
		expect(getAllowedTransitions("closed")).toEqual([]);
	});

	it("returns empty array for cancelled (terminal state)", () => {
		expect(getAllowedTransitions("cancelled")).toEqual([]);
	});

	it("returns [ready_for_invoicing, acta_signed, closed, cancelled] for completed", () => {
		const allowed = getAllowedTransitions("completed");
		expect(allowed).toContain("ready_for_invoicing");
		expect(allowed).toContain("acta_signed");
		expect(allowed).toContain("closed");
		expect(allowed).toContain("cancelled");
		expect(allowed.length).toBe(4);
	});

	it("returns [acta_signed, closed, cancelled] for ready_for_invoicing", () => {
		const allowed = getAllowedTransitions("ready_for_invoicing");
		expect(allowed).toContain("acta_signed");
		expect(allowed).toContain("closed");
		expect(allowed).toContain("cancelled");
		expect(allowed.length).toBe(3);
	});
});

describe("Work Order FSM - getTransitionRules", () => {
	it("returns transitions map with correct keys", () => {
		const rules = getTransitionRules();
		expect(rules).toBeDefined();
		expect(rules.open).toContain("assigned");
		expect(rules.in_progress).toContain("on_hold");
		expect(rules.closed).toEqual([]);
	});
});

describe("Work Order FSM - getTransitionErrorMessage", () => {
	it("returns descriptive error for invalid transition", () => {
		const msg = getTransitionErrorMessage("open", "in_progress");
		expect(msg).toContain("No se puede cambiar");
		expect(msg).toContain("Abierta");
		expect(msg).toContain("En Progreso");
	});

	it("returns empty string for valid transition", () => {
		const msg = getTransitionErrorMessage("open", "assigned");
		expect(msg).toBe("");
	});
});

describe("Work Order FSM - getTransitionRequirements", () => {
	it("returns empty array for any transition", () => {
		const reqs = getTransitionRequirements("in_progress");
		expect(reqs).toEqual([]);
	});
});

describe("Work Order FSM - Constants", () => {
	it("terminal states should be closed, cancelled", () => {
		expect(TERMINAL_STATES).toContain("closed");
		expect(TERMINAL_STATES).toContain("cancelled");
		expect(TERMINAL_STATES).not.toContain("completed");
		expect(TERMINAL_STATES.length).toBe(2);
	});

	it("active states should contain execution states", () => {
		expect(ACTIVE_STATES).toContain("ready_for_execution");
		expect(ACTIVE_STATES).toContain("execution_in_progress");
		expect(ACTIVE_STATES).toContain("execution_completed");
		expect(ACTIVE_STATES).toContain("in_progress");
		expect(ACTIVE_STATES).toContain("on_hold");
		expect(ACTIVE_STATES).toContain("report_pending");
		expect(ACTIVE_STATES.length).toBe(6);
	});

	it("editable states should be open and assigned", () => {
		expect(EDITABLE_STATES).toContain("open");
		expect(EDITABLE_STATES).toContain("assigned");
		expect(EDITABLE_STATES).not.toContain("completed");
		expect(EDITABLE_STATES).not.toContain("closed");
	});

	it("STATUS_LABELS_ES has Spanish labels for execution states", () => {
		expect(STATUS_LABELS_ES.open).toBe("Abierta");
		expect(STATUS_LABELS_ES.assigned).toBe("Asignada");
		expect(STATUS_LABELS_ES.ready_for_execution).toBe("Lista para ejecución");
		expect(STATUS_LABELS_ES.execution_in_progress).toBe("Ejecución en campo");
		expect(STATUS_LABELS_ES.execution_completed).toBe("Ejecución completada");
		expect(STATUS_LABELS_ES.in_progress).toBe("En Progreso");
		expect(STATUS_LABELS_ES.on_hold).toBe("En Pausa");
		expect(STATUS_LABELS_ES.completed).toBe("Completada");
		expect(STATUS_LABELS_ES.closed).toBe("Cerrada");
		expect(STATUS_LABELS_ES.cancelled).toBe("Cancelada");
	});
});

describe("Work Order FSM - Complex Scenarios", () => {
	it("full workflow from open to closed", () => {
		const workflow: WorkOrderStatus[] = [
			"open",
			"assigned",
			"in_progress",
			"completed",
			"ready_for_invoicing",
			"closed",
		];

		for (let i = 0; i < workflow.length - 1; i++) {
			const from = workflow[i];
			const to = workflow[i + 1];
			expect(isValidTransition(from, to)).toBe(true);
		}
	});

	it("on_hold ↔ in_progress loop", () => {
		expect(isValidTransition("in_progress", "on_hold")).toBe(true);
		expect(isValidTransition("on_hold", "in_progress")).toBe(true);
	});

	it("cancellation from various states", () => {
		expect(isValidTransition("open", "cancelled")).toBe(true);
		expect(isValidTransition("assigned", "cancelled")).toBe(true);
		expect(isValidTransition("in_progress", "cancelled")).toBe(true);
		expect(isValidTransition("on_hold", "cancelled")).toBe(true);
	});

	it("cannot cancel from closed (terminal), can cancel from completed", () => {
		expect(isValidTransition("completed", "cancelled")).toBe(true);
		expect(isValidTransition("closed", "cancelled")).toBe(false);
	});
});
