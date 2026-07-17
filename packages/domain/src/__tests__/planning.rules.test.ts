import { describe, expect, it } from "vitest";
import {
	canApprovePlanning,
	getMaxBlockerSeverity,
	getPlanningBlockers,
	isPlanningReady,
	type PlanningReadiness,
} from "../planning.rules";

function makeCompleteReadiness(): PlanningReadiness {
	return {
		hasSchedule: true,
		hasLaborAssignment: true,
		hasToolsAssignment: true,
		hasEquipmentAssignment: true,
		hasMaterialsList: true,
		hasSafetyElements: true,
		hasCertifications: true,
		hasReferenceDocuments: ["ats", "ast", "ptw"],
		missingRequiredDocuments: [],
		hasChecklists: true,
	};
}

describe("isPlanningReady", () => {
	it("returns true when all fields are present", () => {
		expect(isPlanningReady(makeCompleteReadiness())).toBe(true);
	});

	it("returns false when schedule is missing", () => {
		const r = { ...makeCompleteReadiness(), hasSchedule: false };
		expect(isPlanningReady(r)).toBe(false);
	});

	it("returns false when safety elements are missing", () => {
		const r = { ...makeCompleteReadiness(), hasSafetyElements: false };
		expect(isPlanningReady(r)).toBe(false);
	});
});

describe("getPlanningBlockers", () => {
	it("returns empty array for complete readiness", () => {
		expect(getPlanningBlockers(makeCompleteReadiness())).toHaveLength(0);
	});

	it("returns MISSING_SCHEDULE blocker when schedule missing", () => {
		const r = { ...makeCompleteReadiness(), hasSchedule: false };
		const blockers = getPlanningBlockers(r);
		expect(blockers.some((b) => b.code === "MISSING_SCHEDULE")).toBe(true);
	});

	it("returns MISSING_SAFETY with critical severity", () => {
		const r = { ...makeCompleteReadiness(), hasSafetyElements: false };
		const blockers = getPlanningBlockers(r);
		const safety = blockers.find((b) => b.code === "MISSING_SAFETY");
		expect(safety?.severity).toBe("critical");
	});

	it("returns MISSING_TOOLS with warning severity", () => {
		const r = { ...makeCompleteReadiness(), hasToolsAssignment: false };
		const blockers = getPlanningBlockers(r);
		const tools = blockers.find((b) => b.code === "MISSING_TOOLS");
		expect(tools?.severity).toBe("warning");
	});
});

describe("getMaxBlockerSeverity", () => {
	it("returns 'none' when no blockers", () => {
		expect(getMaxBlockerSeverity([])).toBe("none");
	});

	it("returns 'critical' when critical blocker exists", () => {
		const blockers = getPlanningBlockers({ ...makeCompleteReadiness(), hasSafetyElements: false });
		expect(getMaxBlockerSeverity(blockers)).toBe("critical");
	});

	it("returns 'error' when only error blockers exist", () => {
		const blockers = getPlanningBlockers({ ...makeCompleteReadiness(), hasSchedule: false });
		expect(getMaxBlockerSeverity(blockers)).toBe("error");
	});
});

describe("canApprovePlanning", () => {
	it("allows approval when readiness is complete and user is gerente", () => {
		const result = canApprovePlanning(makeCompleteReadiness(), "draft", "gerente");
		expect(result.allowed).toBe(true);
		expect(result.blockers).toHaveLength(0);
	});

	it("allows approval when readiness is complete and user is residente", () => {
		const result = canApprovePlanning(makeCompleteReadiness(), "draft", "residente");
		expect(result.allowed).toBe(true);
	});

	it("blocks approval when planning is already approved", () => {
		const result = canApprovePlanning(makeCompleteReadiness(), "approved", "gerente");
		expect(result.allowed).toBe(false);
		expect(result.blockers.some((b) => b.code === "ALREADY_APPROVED")).toBe(true);
	});

	it("blocks approval when readiness has blockers", () => {
		const r = { ...makeCompleteReadiness(), hasSchedule: false, hasSafetyElements: false };
		const result = canApprovePlanning(r, "draft", "gerente");
		expect(result.allowed).toBe(false);
		expect(result.blockers.length).toBeGreaterThan(1);
	});

	it("blocks approval when user does not have permission", () => {
		const result = canApprovePlanning(makeCompleteReadiness(), "draft", "tecnico");
		expect(result.allowed).toBe(false);
		expect(result.blockers.some((b) => b.code === "INSUFFICIENT_PERMISSIONS")).toBe(true);
	});

	it("blocks approval when user has no permission and readiness is incomplete", () => {
		const r = { ...makeCompleteReadiness(), hasSchedule: false };
		const result = canApprovePlanning(r, "draft", "operador");
		expect(result.allowed).toBe(false);
		expect(result.blockers.length).toBeGreaterThanOrEqual(2);
	});
});
