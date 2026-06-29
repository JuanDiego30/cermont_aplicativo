import { describe, expect, it } from "vitest";
import type { CermontOperationalStepStatus } from "../operational-steps";
import {
	buildBlockers,
	canAdvanceStep,
	getAllowedActions,
	getStepRequirements,
	type ServiceCaseWorkflowSnapshot,
	type WorkflowContext,
} from "../step-requirements";

function makeSnapshot(
	stepKey: string,
	statuses: Record<string, CermontOperationalStepStatus> = {},
): ServiceCaseWorkflowSnapshot {
	const stepStatuses: Record<string, CermontOperationalStepStatus> = {};
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
		stepStatuses[sk] = statuses[sk] ?? "completed";
	}
	return { currentStepKey: stepKey, stepStatuses };
}

const EMPTY_CONTEXT: WorkflowContext = {
	availableDocuments: [],
	availableEvidences: [],
	approvals: [],
	hasCostBaseline: false,
	hasActualCosts: false,
};

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

describe("buildBlockers", () => {
	it("should return no blockers for work_request with no preconditions", () => {
		const svc = makeSnapshot("work_request", { work_request: "pending" });
		const blockers = buildBlockers(svc, FULL_CONTEXT);
		expect(blockers).toHaveLength(0);
	});

	it("should block if precondition step is not completed", () => {
		const svc = makeSnapshot("site_visit", { work_request: "pending", site_visit: "pending" });
		const blockers = buildBlockers(svc, FULL_CONTEXT);
		expect(blockers.some((b) => b.code === "missing_work_request")).toBe(true);
	});

	it("should not block if precondition step is completed", () => {
		const svc = makeSnapshot("site_visit", { work_request: "completed", site_visit: "pending" });
		const blockers = buildBlockers(svc, FULL_CONTEXT);
		expect(blockers.some((b) => b.code === "missing_work_request")).toBe(false);
	});

	it("should block if required document is missing", () => {
		const svc = makeSnapshot("planning", {
			purchase_order: "completed",
			planning: "pending",
		});
		const blockers = buildBlockers(svc, EMPTY_CONTEXT);
		// planning requires: ats, ptw, checklist, kit (documents) + cost_baseline
		expect(blockers.some((b) => b.code === "missing_ats")).toBe(true);
		expect(blockers.some((b) => b.code === "missing_ptw")).toBe(true);
	});

	it("should require documents for work_request", () => {
		const svc = makeSnapshot("work_request", { work_request: "pending" });
		const blockers = buildBlockers(svc, EMPTY_CONTEXT);
		expect(blockers.some((b) => b.code === "missing_formal_request")).toBe(true);
	});

	it("should require evidence for site_visit", () => {
		const svc = makeSnapshot("site_visit", { work_request: "completed", site_visit: "pending" });
		const blockers = buildBlockers(svc, EMPTY_CONTEXT);
		expect(blockers.some((b) => b.code === "missing_visit_evidence")).toBe(true);
	});
});

describe("canAdvanceStep", () => {
	it("should return allowed when no blockers", () => {
		const svc = makeSnapshot("work_request");
		const result = canAdvanceStep(svc, FULL_CONTEXT);
		expect(result.allowed).toBe(true);
		expect(result.blockers).toHaveLength(0);
	});

	it("should return blocked with reasons when blockers exist", () => {
		const svc = makeSnapshot("planning", { purchase_order: "pending" });
		const result = canAdvanceStep(svc, EMPTY_CONTEXT);
		expect(result.allowed).toBe(false);
		expect(result.blockers.length).toBeGreaterThan(0);
	});
});

describe("getStepRequirements", () => {
	it("should return requirements for known step", () => {
		const reqs = getStepRequirements("planning");
		expect(reqs.length).toBeGreaterThan(0);
	});

	it("should return empty for unknown step", () => {
		const reqs = getStepRequirements("nonexistent");
		expect(reqs).toHaveLength(0);
	});
});

describe("getAllowedActions", () => {
	it("should return at least one action for valid step", () => {
		const svc = makeSnapshot("work_request");
		const actions = getAllowedActions(svc, "gerente");
		expect(actions.length).toBeGreaterThanOrEqual(1);
	});
});
