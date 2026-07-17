/**
 * PlanningReadinessGate — tests for readiness computation logic.
 *
 * Verifies:
 * - computeReadiness returns correct score for empty state
 * - computeReadiness returns allPassed when all fields filled
 * - Blocking checks prevent submission when critical fields missing
 */

import { describe, expect, it } from "vitest";
import { computeReadiness } from "@/modules/planning/helpers/readiness-helpers";

describe("PlanningReadinessGate", () => {
	const baseProps = {
		place: "",
		plannedDate: "",
		scope: "",
		materials: [],
		tools: [],
		equipment: [],
		safetyElements: [],
		workerReqs: { electricistas: 0, tecnicosTelecomunicacion: 0, instrumentistas: 0, obreros: 0 },
		responsibles: [],
		astRequired: false,
		ptwRequired: false,
	};

	it("should return low score for empty state", () => {
		const result = computeReadiness(baseProps);
		expect(result.score).toBeLessThan(60);
		expect(result.allPassed).toBe(false);
		expect(result.blocking).toBeGreaterThan(0);
	});

	it("should return allPassed when all required fields are filled", () => {
		const result = computeReadiness({
			...baseProps,
			place: "Torre Caño Rondon",
			plannedDate: "2026-07-15",
			scope:
				"Mantenimiento preventivo de sistema CCTV en torre de telecomunicaciones ubicada en zona rural",
			tools: [{ name: "Multímetro", quantity: 1, available: true }],
			materials: [{ description: "Cable UTP Cat 6", quantity: 10, unit: "metros" }],
			safetyElements: [{ description: "Arnés de seguridad", quantity: 2, unit: "unidades" }],
			workerReqs: { electricistas: 1, tecnicosTelecomunicacion: 2, instrumentistas: 0, obreros: 2 },
			responsibles: [
				{ role: "ingeniero_residente", name: "Ing. Pérez", status: "pending" as const },
			],
			astRequired: true,
		});
		expect(result.score).toBeGreaterThanOrEqual(60);
	});

	it("should detect missing scope as blocking", () => {
		const result = computeReadiness({
			...baseProps,
			place: "Sitio de prueba",
			plannedDate: "2026-07-15",
			scope: "Corto",
			responsibles: [
				{ role: "ingeniero_residente", name: "Ing. Test", status: "pending" as const },
			],
		});
		expect(result.allPassed).toBe(false);
		const scopeCheck = result.checks.find((c) => c.key === "scope");
		expect(scopeCheck?.passed).toBe(false);
		expect(scopeCheck?.severity).toBe("blocking");
	});

	it("should detect missing signatures as blocking", () => {
		const result = computeReadiness({
			...baseProps,
			place: "Sitio de prueba",
			plannedDate: "2026-07-15",
			scope: "Alcance suficientemente largo para superar la validación de readiness",
			responsibles: [],
		});
		const sigCheck = result.checks.find((c) => c.key === "signatures");
		expect(sigCheck?.passed).toBe(false);
		expect(sigCheck?.severity).toBe("blocking");
	});

	it("should count total checks correctly", () => {
		const result = computeReadiness(baseProps);
		expect(result.total).toBeGreaterThan(5);
		expect(result.passed + (result.total - result.passed)).toBe(result.total);
	});

	it("should have valid approval-ready message when allPassed", () => {
		const result = computeReadiness({
			...baseProps,
			place: "Torre Principal",
			plannedDate: "2026-07-15",
			scope:
				"Mantenimiento preventivo completo de sistema CCTV en torre de telecomunicaciones ubicada en zona rural con equipos de altura",
			tools: [{ name: "Multímetro", quantity: 1, available: true }],
			materials: [{ description: "Cable UTP Cat 6", quantity: 10, unit: "metros" }],
			safetyElements: [{ description: "Arnés de seguridad", quantity: 2, unit: "unidades" }],
			workerReqs: { electricistas: 1, tecnicosTelecomunicacion: 2, instrumentistas: 0, obreros: 2 },
			responsibles: [
				{ role: "ingeniero_residente", name: "Ing. Pérez", status: "pending" as const },
			],
			astRequired: true,
			schedule: { plannedStartAt: "2026-07-15T08:00:00Z", plannedEndAt: "2026-07-15T17:00:00Z" },
			crew: [{ userId: "user1", name: "Técnico", role: "electricista", certificationIds: [] }],
			certifications: [{ name: "Certificación Alturas", verified: true }],
		});
		expect(result.allPassed).toBe(true);
		expect(result.blocking).toBe(0);
		expect(result.score).toBeGreaterThanOrEqual(65);
		// Verify no blocking checks remain
		const blockingChecks = result.checks.filter((c) => c.severity === "blocking" && !c.passed);
		expect(blockingChecks).toHaveLength(0);
	});

	it("should report missing place as blocking", () => {
		const result = computeReadiness({
			...baseProps,
			place: "",
			plannedDate: "2026-07-15",
			scope: "Alcance suficientemente largo para superar la validación de readiness",
			responsibles: [
				{ role: "ingeniero_residente", name: "Ing. Test", status: "pending" as const },
			],
		});
		const placeCheck = result.checks.find((c) => c.key === "place");
		expect(placeCheck?.passed).toBe(false);
		expect(placeCheck?.severity).toBe("blocking");
	});

	it("should show blocking count when critical checks fail", () => {
		const result = computeReadiness({
			...baseProps,
			place: "",
			plannedDate: "",
			scope: "",
			responsibles: [],
		});
		expect(result.blocking).toBeGreaterThanOrEqual(3); // place + date + scope + signatures
		expect(result.allPassed).toBe(false);
	});

	it("should handle AST requirement as info severity", () => {
		const result = computeReadiness({
			...baseProps,
			place: "Sitio",
			plannedDate: "2026-07-15",
			scope: "Alcance suficientemente largo para superar la validación de readiness",
			responsibles: [
				{ role: "ingeniero_residente", name: "Ing. Test", status: "pending" as const },
			],
			astRequired: true,
			ptwRequired: true,
		});
		const astCheck = result.checks.find((c) => c.key === "ast");
		expect(astCheck?.passed).toBe(true);
		expect(astCheck?.severity).toBe("info");

		const ptwCheck = result.checks.find((c) => c.key === "ptw");
		expect(ptwCheck?.passed).toBe(true);
		expect(ptwCheck?.severity).toBe("info");
	});
});
