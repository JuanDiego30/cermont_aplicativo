import { describe, expect, it } from "vitest";
import {
	type ServiceCaseEvent,
	type ServiceCaseState,
	ServiceCaseStateMachine,
} from "../service-case-state-machine";
import type { ServiceCaseWorkflowSnapshot, WorkflowContext } from "../step-requirements";

function makeSnapshot(stepKey: string, completedSteps: string[] = []): ServiceCaseWorkflowSnapshot {
	const stepStatuses: Record<string, "pending" | "completed" | "blocked"> = {};
	for (const sk of [
		"work_request",
		"site_visit",
		"proposal",
		"purchase_order",
		"planning",
		"execution",
		"technical_report",
		"delivery_record",
		"client_signature",
		"ses",
		"invoice",
		"invoice_approval",
		"payment",
		"closure",
	]) {
		stepStatuses[sk] = completedSteps.includes(sk) ? "completed" : "pending";
	}
	return { currentStepKey: stepKey, stepStatuses };
}

const FULL_CONTEXT: WorkflowContext = {
	availableDocuments: [
		"formal_request",
		"visit_report",
		"economic_proposal",
		"ats",
		"ptw",
		"checklist",
		"kit",
		"technical_report",
		"delivery_record",
		"invoice",
	],
	availableEvidences: ["visit_evidence", "execution_evidence"],
	approvals: [
		"client_po",
		"execution_started",
		"client_signature",
		"ses_approved",
		"invoice_approved",
		"payment_record",
	],
	hasCostBaseline: true,
	hasActualCosts: true,
};

describe("ServiceCaseStateMachine.transition", () => {
	const validTransitions: Array<{
		state: ServiceCaseState;
		event: ServiceCaseEvent;
		expected: ServiceCaseState;
		completed: string[];
	}> = [
		{
			state: "pending",
			event: { type: "WORK_REQUEST_CREATED" },
			expected: "work_request",
			completed: [],
		},
		{
			state: "work_request",
			event: { type: "SITE_VISIT_COMPLETED" },
			expected: "site_visit",
			completed: ["work_request"],
		},
		{
			state: "site_visit",
			event: { type: "PROPOSAL_APPROVED" },
			expected: "proposal",
			completed: ["work_request", "site_visit"],
		},
		{
			state: "proposal",
			event: { type: "PURCHASE_ORDER_APPROVED" },
			expected: "purchase_order",
			completed: ["work_request", "site_visit", "proposal"],
		},
		{
			state: "purchase_order",
			event: { type: "PLANNING_APPROVED" },
			expected: "planning",
			completed: ["work_request", "site_visit", "proposal", "purchase_order"],
		},
		{
			state: "planning",
			event: { type: "EXECUTION_COMPLETED" },
			expected: "execution",
			completed: ["work_request", "site_visit", "proposal", "purchase_order", "planning"],
		},
		{
			state: "technical_report",
			event: { type: "DELIVERY_RECORD_GENERATED" },
			expected: "delivery_record",
			completed: [
				"work_request",
				"site_visit",
				"proposal",
				"purchase_order",
				"planning",
				"execution",
				"technical_report",
			],
		},
		{
			state: "client_signature",
			event: { type: "SES_APPROVED" },
			expected: "ses",
			completed: [
				"work_request",
				"site_visit",
				"proposal",
				"purchase_order",
				"planning",
				"execution",
				"technical_report",
				"delivery_record",
				"client_signature",
			],
		},
		{
			state: "ses",
			event: { type: "INVOICE_CREATED" },
			expected: "invoice",
			completed: [
				"work_request",
				"site_visit",
				"proposal",
				"purchase_order",
				"planning",
				"execution",
				"technical_report",
				"delivery_record",
				"client_signature",
				"ses",
			],
		},
		{
			state: "invoice",
			event: { type: "INVOICE_APPROVED" },
			expected: "invoice_approval",
			completed: [
				"work_request",
				"site_visit",
				"proposal",
				"purchase_order",
				"planning",
				"execution",
				"technical_report",
				"delivery_record",
				"client_signature",
				"ses",
				"invoice",
			],
		},
		{
			state: "invoice_approval",
			event: { type: "PAYMENT_REGISTERED" },
			expected: "payment",
			completed: [
				"work_request",
				"site_visit",
				"proposal",
				"purchase_order",
				"planning",
				"execution",
				"technical_report",
				"delivery_record",
				"client_signature",
				"ses",
				"invoice",
				"invoice_approval",
			],
		},
		{
			state: "payment",
			event: { type: "CASE_CLOSED" },
			expected: "closed",
			completed: [
				"work_request",
				"site_visit",
				"proposal",
				"purchase_order",
				"planning",
				"execution",
				"technical_report",
				"delivery_record",
				"client_signature",
				"ses",
				"invoice",
				"invoice_approval",
				"payment",
			],
		},
	];

	for (const tc of validTransitions) {
		it(`should transition ${tc.state} → ${tc.expected} on ${tc.event.type}`, () => {
			const svc = makeSnapshot("", tc.completed);
			const result = ServiceCaseStateMachine.transition(tc.state, tc.event, svc, FULL_CONTEXT);
			expect(result.status).toBe("transitioned");
			if (result.status === "transitioned") {
				expect(result.state).toBe(tc.expected);
			}
		});
	}

	it("should block transition when precondition not met", () => {
		const svc = makeSnapshot("site_visit", []); // work_request not completed
		const event: ServiceCaseEvent = { type: "SITE_VISIT_COMPLETED" };
		const result = ServiceCaseStateMachine.transition("work_request", event, svc, FULL_CONTEXT);
		expect(result.status).toBe("blocked");
		if (result.status === "blocked") {
			expect(result.reasons.length).toBeGreaterThan(0);
		}
	});

	it("should block invalid event for current state", () => {
		const svc = makeSnapshot("work_request");
		const event: ServiceCaseEvent = { type: "PAYMENT_REGISTERED" };
		const result = ServiceCaseStateMachine.transition("work_request", event, svc, FULL_CONTEXT);
		expect(result.status).toBe("blocked");
	});

	it("closed state should have no transitions", () => {
		const svc = makeSnapshot("closure", [
			"work_request",
			"site_visit",
			"proposal",
			"purchase_order",
			"planning",
			"execution",
			"technical_report",
			"delivery_record",
			"client_signature",
			"ses",
			"invoice",
			"invoice_approval",
			"payment",
		]);
		const events: ServiceCaseEvent["type"][] = [
			"WORK_REQUEST_CREATED",
			"EXECUTION_COMPLETED",
			"PAYMENT_REGISTERED",
		];
		for (const eventType of events) {
			const result = ServiceCaseStateMachine.transition(
				"closed",
				{ type: eventType },
				svc,
				FULL_CONTEXT,
			);
			expect(result.status).toBe("blocked");
		}
	});
});
